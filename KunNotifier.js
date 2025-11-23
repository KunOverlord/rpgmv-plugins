//=============================================================================
// KunNotifier.js
//=============================================================================
/*:
 * @plugindesc KunNotifier
 * @filename KunNotifier.js
 * @author KUN
 * @version 2.03
 * 
 * @help
 * 
 * FUNCTIONS:
 * 
 *      kun_notify( message )
 * 
 * COMMANDS:
 * 
 *      KunNotifier [playfx|immediate] message
 *          - display a notification right from the command input
 *          - use [playfx] tag to play the selected audio fx fromthe parameters
 *          - use [immediate] tag to add the new message right at the beginning of the queue and display it asap
 *
 * @param debug
 * @text Debug
 * @desc Show debug info
 * @type Boolean
 * @default false
 *
 * @param display
 * @text Display Time
 * @desc Elapsed time to show the popup message.
 * @type Number
 * @min 30
 * @max 220
 * @default 60
 *
 * @param transition
 * @text Transition Time
 * @desc Elapsed time to wait for the next popup message.
 * @type Number
 * @min 10
 * @max 220
 * @default 30
 *
 * @param background
 * @text Background
 * @type Select
 * @option None
 * @value 2
 * @option Dim
 * @value 1
 * @option Window
 * @value 0
 * @default 1
 * 
 * @param position
 * @text Position
 * @type Number
 * @min 0
 * @max 10
 * @default 1
 * 
 * @param sfx
 * @text Notify Sfx
 * @type file[]
 * @require 1
 * @dir audio/se/
 * 
 * @param successfx
 * @parent sfx
 * @text Success Sfx
 * @type file[]
 * @require 1
 * @dir audio/se/
 * 
 * @param failsfx
 * @parent sfx
 * @text Fail Sfx
 * @type file[]
 * @require 1
 * @dir audio/se/
 * 
 * @param templates
 * @type struct<Template>[]
 * @text Templates
 * @desc Add message templates
 * 
 */
/*~struct~Template:
 * @param name
 * @type text
 * @text Name
 * @default info
 * 
 * @param color
 * @text Message Color
 * @type number
 * @min 0
 * @max 31
 * @default 0
 * 
 * @param icon
 * @text Message Icon
 * @type number
 * @min 0
 * @default 0
 * 
 * @param align
 * @text Text Align
 * @type select
 * @option Left
 * @value left
 * @option Centered
 * @value center
 * @option Right
 * @value right
 * @option Random
 * @value random
 * @deafult left
 * 
 * @param immediate
 * @text Immediate
 * @desc Mark this notificaation as immediate and pop up as soon as possible.
 * @type boolean
 * @default false
 * 
 * @param se
 * @text Play Sound
 * @type file[]
 * @require 1
 * @dir audio/se/
 * 
 * @param variance
 * @parent se
 * @text Pitch Variance
 * @type number
 * @min 0
 * @max 50
 * @default 0
 * 
 * @param wait
 * @text Display Time
 * @type number
 * @desc leave to zero to use default elapsed time
 * @min 0
 * @default 0
 */


/**
 * @class {KunNotifier}
 */
class KunNotifier {
    constructor() {
        if (KunNotifier.__instance) {
            return KunNotifier.__instance;
        }

        KunNotifier.__instance = this;

        this.initialize();
    }

    initialize() {

        const _parameters = this.pluginData();

        this._debug = _parameters.debug || false;
        this._timeout = _parameters.display || 60;
        this._transition = _parameters.transition || 30;
        this._background = _parameters.background || 0;
        this._sfx = {
            'default': _parameters.sfx || [],
            'success': _parameters.successfx || [],
            'fail': _parameters.failsfx || [],
        }
        this._position = {
            'x': 0,
            'y': _parameters.position || 1,
        };
        this._templates = this.importTemplates(_parameters.templates || []);
    }
    /**
     * 
     * @param {Object[]} data 
     * @returns {KunMessageTemplate}
     */
    importTemplates(data = []) {
        return data.map(content => {
            return new KunMessageTemplate(
                content.name,
                content.color || 0,
                content.align || '',
                content.se || [],
                content.icon || 0,
                content.immediate || false,
                content.wait || 0,
                content.variance || 0,
            );
        });
    }
    /**
     * @returns {KunMessageTemplate[]}
     */
    templates() { return this._templates; }
    /**
     * @param {String} name 
     * @returns {KunMessageTemplate}
     */
    template(name = '') { return name && this.templates().find(tpl => tpl.name() === name) || null; }
    /**
     * @returns {Boolean}
     */
    debug() { return this._debug; };
    /**
     * @returns {Number}
     */
    position() { return this._position.y * 10; };
    /**
     * @returns {Number}
     */
    displayTime() { return this._timeout; };
    /**
     * @returns {Number}
     */
    transitionTime() { return this._transition; };
    /**
     * @returns {Number}
     */
    background() { return this._background; };
    /**
     * @returns {Object[]}
     */
    templates() { return this._templates; }
    /**
     * @returns {Boolean}
     */
    inBattle() {
        const sceneLog = SceneManager._scene._logWindow || null;
        return $gameParty.inBattle() && sceneLog instanceof Window_BattleLog;
    };
    /**
     * @returns {Boolean}
     */
    canNotify() {
        //return SceneManager._scene instanceof Scene_Map && typeof SceneManager._scene.notifier === 'function';
        return SceneManager._scene instanceof Scene_Map;
    }
    /**
     * @returns {Window_BattleLog}
     */
    getBattleLog() { return $gameParty.inBattle() && SceneManager._scene._logWindow || null; }
    /**
     * @returns {Window_Notifier}
     */
    getMapLog() {
        if (SceneManager._scene instanceof Scene_Map) {
            return SceneManager._scene.notifier && SceneManager._scene.notifier();
        }
        return null;
    }
    /**
     * @param {String} content
     * @returns {KunMessage}
     */
    send(content = '') {
        const message = new KunMessage( content );

        if (this.sendBattleLog(message.content(), message.se(), message.immediate())) {
            return message;
        }
        //else if (this.sendMessageLog(text, immediate || false, sfx, template)) {
        else if (this.sendMessageLog(message)) {
            return message;
        }

        return null;
    };
    /**
     * @param {String} message 
     * @param {Boolean} immediate 
     * @param {String} sfx 
     * @param {String} template
     * @returns {Boolean}
     */
    sendMessageLog(message = null ) {
        const log = this.getMapLog();
        return !!log && log.add(message);
    }
    /**
     * @param {String} message 
     * @param {Boolean} immediate 
     * @param {String} sfx 
     * @returns {Boolean}
     */
    sendBattleLog(message = '', immediate = false, sfx = '') {
        const log = this.getBattleLog();
        if (log) {
            log.addText(message);
            if (sfx) this.playsfx(sfx);
            return true;
        }
        return false;
    }
    /**
     * @param {String} type 
     * @returns {String[]}
     */
    sfx(type = 'default') { return this._sfx[type] || []; }
    /**
     * @param {String} type (default)
     * @returns {KunNotifier}
     */
    playsfx(type = 'default') {
        const sfx = this.sfx(type);
        if (sfx.length > 0) {
            const se = sfx[Math.floor(Math.random() * sfx.length)];
            const pitch = Math.floor(Math.random() * 10) + 95;
            this.playse(se, 90, pitch);
            //AudioManager.playSe({ 'name': se, 'pan': 0, 'pitch': pitch, 'volume': 100 });
        }
        return this;
    };
    /**
     * @param {String} se 
     * @param {Number} pitch 
     * @returns {KunNotifier}
     */
    playse(se = '', volume = 90, pitch = 100) {
        se && AudioManager.playSe({
            name: se,
            pan: 0,
            pitch: Math.min(Math.max(pitch, 50), 150),
            volume: volume || 90
        });
        return this;
    }



    /**
     * @returns {Object}
     */
    pluginData() {

        /**
         * @param {String} key 
         * @param {*} value 
         * @returns {Object}
         */
        function _kunPluginReaderV2(key = '', value = '') {
            if (typeof value === 'string' && value.length) {
                try {
                    if (/^\{.*\}$|^\[.*\]$/.test(value)) {
                        return JSON.parse(value, _kunPluginReaderV2);
                    }
                } catch (e) {
                    // If parsing fails or it's not an object/array, return the original value
                }
                if (value === 'true' || value === 'false') {
                    return value === 'true';
                }
                if (!isNaN(value)) {
                    return parseInt(value);
                }
            }
            else if (typeof value === 'object') {
                if (Array.isArray(value)) {
                    return value.map(item => _kunPluginReaderV2(key, item));
                }
                const content = {};
                Object.keys(value).forEach(key => content[key] = _kunPluginReaderV2(key, value[key]));
                return content;
            }
            return value;
        };

        return _kunPluginReaderV2('KunNotifier', PluginManager.parameters('KunNotifier'));
    }


    /**
     * @param {*} message 
     */
    static DebugLog(message = '') {
        if (KunNotifier.manager().debug()) {
            console.log('[ KunNotifier ]', message);
        }
    };

    /**
     * @returns {KunNotifier}
     */
    static manager() {
        return KunNotifier.__instance || new KunNotifier();
    }
    /**
     * @param {String} message 
     * @param {String} template
     */
    static notify( message = '' , template = '' ){
        message && KunNotifier.manager().send(message,template);
    }
}

/**
 * @type {KunNotifier.BackgroundType|Number}
 */
KunNotifier.BackgroundType = {
    Window: 0,
    Dim: 1,
    None: 2
};


/**
 * @class {KunMessageFx}
 */
class KunMessageFx {
    /**
     * @param {String} name 
     * @param {String[]} playlist 
     */
    constructor(name = '', playlist = []) {
        this._name = name || 'playfx';
        this._playlist = playlist || []
    }
    /**
     * @returns {String}
     */
    name() { return this._name }
    /**
     * @returns {String[]}
     */
    playlist() { return this._playlist }
    /**
     * @returns {KunMessageFx}
     */
    play() {
        const sfx = this.playlist();
        if (sfx.length > 0) {
            const se = sfx[Math.floor(Math.random() * sfx.length)];
            const pitch = Math.floor(Math.random() * 10) + 95;
            AudioManager.playSe({ 'name': se, 'pan': 0, 'pitch': pitch, 'volume': 100 });
        }
        return this;
    }
}

/**
 * 
 */
class KunMessageTemplate {
    /**
     * @param {String} name 
     * @param {Number} color 
     * @param {String} align 
     * @param {String[]} se
     * @param {Number} icon
     * @param {Boolean} immediate
     * @param {Number} variance
     */
    constructor(name = '', color = 0, align = '', se = [], icon = 0, immediate = false ,wait = 0 , variance = 0) {
        this._name = name;
        this._color = color || 0;
        this._icon = icon || 0;
        this._align = align || 'left';
        this._se = se || [];
        this._immediate = immediate;
        this._wait = wait || 0;
        this._var = variance || 0;
    }
    /**
     * @returns {String}
     */
    name() { return this._name; }
    /**
     * @returns {Boolean}
     */
    immediate(){ return this._immediate; }
    /**
     * @returns {String}
     */
    align() {
        if( this._align === 'random'){
            const list = KunMessageTemplate.Align();
            return list[ Math.floor(Math.random() * list.length)];
        }
        return this._align;
    }
    /**
     * @returns {Number}
     */
    timer(){ return this._wait; }
    /**
     * @returns {Number}
     */
    color() { return this._color; }
    /**
     * @returns {Number}
     */
    icon() { return this._icon; }
    /**
     * @returns {String}
     */
    sound() {return this._se.length ? this._se[Math.floor(Math.random() * this._se.length)] : ''; }
    /**
     * @returns {Boolean}
     */
    hassound(){ return !!this._se.length }
    /**
     * @param {Number} value
     * @returns {Number}
     */
    variance( value = 0 ){
        if( this._var ){
            const max = Math.floor(Math.random() * this._var);
            const min = Math.floor(Math.random() * this._var);
            return value + max - min;
        }
        return value;
    }
    /**
     * @returns {String[]}
     */
    static Align(){ return ['left','center','right']; }    
}

/**
 * @class {KunMessage}
 */
class KunMessage {
    /**
     * @param {String} message 
     */
    constructor(message = '') {
        this._message = message;
        this._delilvered = false;
        
        this._se = '';
        this._timer = this.notifier().displayTime();
        this._wait = false;
        this._immediate = false;


        this._template =  null; //template instanceof KunMessageTemplate && template || null;
        //extract all flags and contents from messsage
        this.parseTemplate().parseFlags().parseSplit();
    }
    /**
     * @returns {KunNotifier}
     */
    notifier() { return KunNotifier.manager(); }
    /**
     * @returns {Number}
     */
    time() { return this.template() && this.template().timer() || this._timer;}
    /**
     * @returns {Boolean}
     */
    wait(){ return this._wait; }
    /**
     * @returns {KunMessageTemplate}
     */
    template() { return this._template };
    /**
     * @returns {String}
     */
    content() { return this._message; }
    /**
     * @param {String} content 
     * @returns {KunMessage}
     */
    parse( content = '' ){
        if( content ){
            this._message = content;
        }
        return this;
    }
    /**
     * @returns {KunMessage}
     */
    parseTemplate(  ){
        const content = this.content();
        const regex = /\[template:([A-Za-z0-9]+)\]/g;
        const template = regex.exec(content) || [];
        this._template = KunNotifier.manager().template(template[1] || '');
        return this.parse(this.content().replace(regex, ''));
    }
    /**
     * @returns {KunMessage}
     */
    parseFlags(){
        const content = this.content();
        const regex = /\[(success|fail|playfx|immediate|wait)(?:\|[^\]]+)?\]/g;
        const tags = [];
        const message = content.replace( regex , ( match  ) => {
            match.replace(/[\[\]]/g,'').split('|')
                .filter( tag => !tags.includes(tag))
                .forEach( tag => tags.push(tag));
            return '';
        });
        const playse = tags.includes('playfx') && 'default' || '';
        const success = tags.includes('success') && 'success' || '';
        const fail = tags.includes('fail') && 'fail' || '';
        this._se = playse || success || fail || '';
        this._immediate = tags.includes('immediate');
        this._wait = tags.includes('wait');
        return this.parse(message);
    }
    /**
     * @returns {KunMessage}
     */
    parseSplit( ){
        const contents = this.content().trim().split('|').filter( txt => !!txt );
        return this.parse( contents && contents[Math.floor(Math.random() * contents.length)]  || '') ;
    }
    /**
     * @returns {Boolean}
     */
    empty(){ return !!this.content(); }
    /**
     * @returns {String}
     */
    se(){ return this._se; }
    /**
     * @returns {KunMessage}
     */
    playfx() {
        const template = this.template();
        if (template && template.hassound()) {
            const sound = template.sound();
            this.notifier().playse(sound, template.variance(85) , template.variance(100) );
        }
        else if (this._se) {
            this.notifier().playsfx(this.se());
        }
        return this;
    }
    /**
     * @returns {KunMessage}
     */
    deliver() {
        this._delilvered = true;
        return this;
    }
    /**
     * @returns {Boolean}
     */
    done() { return this._delilvered; }
    /**
     * @returns {Boolean}
     */
    immediate() { return this.template() && this.template().immediate() || this._immediate; }
}



/********************************************************************************************************************
 * 
 * Window_Notifier
 * 
 *******************************************************************************************************************/
/**
 * @class {Window_Notifier}
 */
class Window_Notifier extends Window_Base {
    /**
     * 
     */
    constructor() {
        super();
    }
    /**
     * 
     */
    initialize() {

        const notifier = KunNotifier.manager();
        const position = notifier.position();
        const x = 0;
        //var width = (Graphics.boxWidth / 12) * 10;
        const width = Graphics.boxWidth;
        //var height = this.standardFontSize() + this.textPadding() * 3 + this.standardPadding() * 2;
        const height = this.fittingHeight(1);

        this._elapsed = 0;
        this._messages = [];
        this._transition = false;
        this._displayTime = notifier.displayTime();
        this._transitionTime = notifier.transitionTime();


        super.initialize(x, position, width, height);

        this.hide();
        this.setBackgroundType(notifier.background());


    }

    /**
     * 
     */
    completed() {
        this._elapsed = 0;
        this.hide();
        this.close();
    };
    /**
     * @returns {Number}
     */
    count() { return this._messages.length; };
    /**
     * @param {Number} scale 
     * @returns {Number}
     */
    displayTime( scale = 1 ){ return this._displayTime * scale; }
    /**
     * @param {KunMessage} message 
     */
    display(message = null) {
        if (this.contents && message instanceof KunMessage) {
            this.contents.clear();
            //this.drawBackground(0,0,this.contentsWidth(),this.lineHeight());
            if (message.template()) {
                const template = message.template();
                const icon = template.icon() || 0;
                const offset = icon && template.align() === 'left' && Window_Base._iconWidth + 6 || 0;
                this.changeTextColor(this.textColor(template.color()));
                icon && this.drawIcon(icon, 0, 0);
                this.drawText(
                    message.playfx().content(),
                    offset, 0,
                    Graphics.boxWidth - this.standardPadding() * 2,
                    template.align()
                );
                this.changeTextColor(this.normalColor());
            }
            else {
                this.drawTextEx(message.playfx().content(), 0, 0, Graphics.boxWidth);
            }
            !this.isOpen() && this.open();
            this.show();
            this.deactivate();
        }
    };
    /**
     * @param {Number} wait
     * @returns {Window_Notifier}
     */
    wait(wait = 0) {
        this._elapsed = wait || 20;
        return this;
    };
    /**
     * @returns {Boolean}
     */
    waiting() { return this._elapsed ? --this._elapsed > 0 : false; };
    /**
     * @returns {Boolean}
     */
    busy() { return this._elapsed + this.count() > 0; };
    /**
     * @returns {KunMessage[]}
     */
    messages( priority = false) { return priority && this._messages.filter(msg => msg.immediate()) || this._messages; }
    /**
     * @returns {Boolean}
     */
    hasMessages() { return this.messages().length > 0; };
    /**
     * @returns {KunMessage}
     */
    showMessage() {
        if (this.hasMessages()) {
            //pick priority messages first, then get other messages
            const message = this.messages(true)[0] || this.messages()[0];
            this.display(message && message.deliver() || null);
            this._messages = this.messages().filter(message => !message.done());
            return message || null;
        }
        else {
            this.hide();
        }
        return null;
    };
    /**
     * 
     */
    update() {
        super.update();
        if (this.isOpen()) {
            if (!this.waiting()) {
                if (this._transition) {
                    this._transition = false;
                    const message = this.showMessage();
                    message && this.wait( message.time() ) || this.completed();
                }
                else if (this.hasMessages()) {
                    this._transition = true;
                    this.hide();
                    this.wait(this._transitionTime);
                }
                else {
                    this.completed();
                }
            }
        }
    };
    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     */
    drawBackground(x, y, width, height) {
        var color1 = this.dimColor1();
        var color2 = this.dimColor2();
        this.contents.gradientFillRect(x, y, width / 24, height, color2, color1);
        this.contents.gradientFillRect(x + width / 24, y, width / 24 * 23, height, color1, color2);
    };
    /**
     * @param {String} message 
     * @returns {Boolean}
     */
    //add(message = '', immediate = false, sfx = '', template = '') {
    add(message = null) {
        if (message instanceof KunMessage) {
            this.messages().push( message.parse(this.convertEscapeCharacters(message.content())) );
            !this.isOpen() && this.open();
            return true;
        }
        return false;
    };
}

/**
 * 
 */
function KunNotifier_SceneMap_Setup() {
    /**
     * @returns {Window_Notifier}
     */
    Scene_Map.prototype.createNotifier = function () {
        this._notifier = new Window_Notifier();
        this.addChild(this._notifier);
        return this._notifier;
    }
    /**
     * @returns {Window_Notifier}
     */
    Scene_Map.prototype.notifier = function () {
        return this._notifier || this.createNotifier();
    };
}

/**
 //OVERRIDE COMMAND INTERPRETER
 */
function KunNotifier_OverrideCommands() {
    const _KunNotifier_Interpreter_PluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunNotifier_Interpreter_PluginCommand.call(this, command, args);
        switch (command.toLowerCase()) {
            case 'kunmesssage':
            case 'kunnotifier':
                if (args && args.length) {
                    const message = KunNotifier.manager().send(args.join(' '));
                    message && message.wait() && this.wait(message.time());
                }
                break;
        }
    };
};

/**
 * @param {String} message 
 * @returns {KunNotifier}
 */
function kun_notify(message, template = '') {
    //KunNotifier.DebugLog('kun_notify() is Deprecated, use KunNotifier instead');
    KunNotifier.notify(message,template);
    //KunNotifier.manager().send(message, template || '');
}


/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function ( /* args */) {

    KunNotifier.manager();

    KunNotifier_SceneMap_Setup();
    KunNotifier_OverrideCommands();


})( /* initializer */);