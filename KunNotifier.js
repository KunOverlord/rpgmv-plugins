//=============================================================================
// KunNotifier.js
//=============================================================================
/*:
 * @plugindesc KunNotifier
 * @filename KunNotifier.js
 * @author KUN
 * @version 1.65
 * 
 * @param debug
 * @text Debug
 * @desc Show debug info
 * @type Boolean
 * @default false
 *
 * @param displaytime
 * @text Display Time
 * @desc Elapsed time to show the popup message.
 * @type Number
 * @min 30
 * @max 220
 * @default 60
 *
 * @param transitionTime
 * @text Transition Time
 * @desc Elapsed time to wait for the next popup message.
 * @type Number
 * @min 30
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
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param notifyItem
 * @text Notify Item
 * @desc Notify when you get an item
 * @type boolean
 * @desc Show a notification when getting items
 * @default false
 * 
 * @param itemText
 * @parent notifyItem
 * @desc Show this text when getting an item
 * @text Item Text
 * @type String
 * @default You've got
 * 
 * @help
 * 
 * FUNCTIONS:
 * 
 *      kun_notify( message )
 * 
 * COMMANDS:
 * 
 *      KunNotifier message
 * 
 *
 */

/**
 * @description KUN Modules
 * @type KUN
 */
//var KUN = KUN || {};
/**
 * @type KunNotifier
 */
//KunNotifier.MailBox = new KunNotifier();
/**
 * @description Independent notification system to show up some messages in the scene
 */
function KunNotifier() {

    var _notifier = {
        /**
         * @type Array
         */
        'messages': [],
        'parameters': {
            //set here all parameters
        },
        'size': {
            'width': 800,
            'height': 80
        },
        'position': {
            'x': 10,
            'y': 10
        },
        'debug': false,
        'display': 96,
        'transition': 48,
        'background': 0,
        'timeout': 0,
        'sfx': '',
        'notifyItem':false,
        'itemText': '',
        'window': null,
    };

    this.Set = {
        'Debug': function (debug) { _notifier.debug = typeof debug === 'boolean' && debug; },
        'DisplayTime': function (dt) { _notifier.display = parseInt(dt); },
        'TransitionTime': function (tt) { _notifier.transition = parseInt(tt); },
        'Background': function (bg) { _notifier.background = parseInt(bg); },
        'Sound': function (se) { _notifier.sfx = se },
        'Position': ( pos )  => _notifier.position.y = parseInt(pos) || 1,
        'NotifyItem': ( onItem ) => _notifier.notifyItem = typeof onItem === 'boolean' && onItem,
        'ItemText': ( text ) => _notifier.itemText = text || '',
    };
    /**
     * @returns Boolean
     */
    this.debug = () => _notifier.debug;
    /**
     * @returns Number
     */
    this.position = () => _notifier.position.y * 10;
    /**
     * @returns Number
     */
    this.displayTime = () => _notifier.display;
    /**
     * @returns Number
     */
    this.transitionTime = () => _notifier.transition;
    /**
     * @returns Number
     */
    this.background = () => _notifier.background;
    /**
     * @returns Boolean
     */
    this.inBattle = function(){
        return $gameParty.inBattle() && SceneManager._scene._logWindow instanceof Window_BattleLog;
    };
    /**
     * @returns Boolean
     */
    this.canNotify = function(){
        return SceneManager._scene instanceof Scene_Map && typeof SceneManager._scene.notifier === 'function';
    }
    /**
     * @param String message
     * @param Boolean playSfx
     * @returns Boolean
     */
    this.send = function (message , playSfx ) {
        switch( true ){
            case this.inBattle():
                // is in battle scene
                SceneManager._scene._logWindow.addText( message );
                if( typeof playSfx === 'boolean' && playSfx ) this.sfx();
                return true;
            case this.canNotify():
                SceneManager._scene.notifier().push( message , playSfx );
                return true;
            default:
                return false;
        }
    };
    /**
     * @returns Window_Notifier
     */
    this.createNotifier = function(){
        return new Window_Notifier( this.position() , this.displayTime() , this.transitionTime(), this.background() );
    };
    /**
     * @returns Boolean
     */
    this.running = function(){
        return _notifier.window !== null && _notifier.window.busy();
    };
    /**
     * @returns Window_Notifier
     */
    this.window = () => _notifier.window;
    /**
     * @returns KunNotifier
     */
    this.sfx = function () {
        if (_notifier.sfx.length > 0) {
            AudioManager.playSe({ name: _notifier.sfx, pan: 0, pitch: 100, volume: 100 });
        }
        return this;
    };
    /**
     * @param {String} item_name 
     * @param {Number} amount 
     * @param {Number} icon 
     * @returns KunNotifier
     */
    this.onGetItem = function( item_name , amount , icon ){

        var text = `${_notifier.itemText} ${item_name}`;
        //console.log( amount );
        if( typeof amount === 'number' && amount > 1 ){
            text += ` (${amount})`;
        }

        if( typeof icon === 'number' && icon > 0 ){
            text = `\\I[${icon}] ${text}`;
        } 

        return this.send( text , true );
    };

    return this;
}

KunNotifier.DebugLog = function (message) {

    if (KunNotifier.MailBox.debug()) {
        if (typeof message === 'object') {
            console.log('[ KunNotifier Object Data ] ');
            console.log(message);
        }
        else {
            console.log('[ KunNotifier ] - ' + message);
        }
    }

};

KunNotifier.MailBox = new KunNotifier();

/**
 * @param {String} type 
 * @returns Number
 */
KunNotifier.BackgroundType = (type) => {
    switch (type) {
        case 'Dim': return 1;
        case 'None': return 2;
        default: return 0;
    }
};

/**
 * @description Access to plugin|module's parameters
 * @param {String} input 
 * @param {String|Number|Boolean} value
 * @returns {String}
 */
KunNotifier.Parameters = function (input, value) {

    var parameters = $plugins.filter(function (p) {

        return p.description.contains('KUNun_Notifier');

    })[0].parameters;

    return typeof parameters === 'object' && parameters.hasOwnProperty(input) ?
        parameters[input] :
        typeof value !== 'undefined' ? value : '';
};
/**
 * Override the add item command to display a notification
 */
KunNotifier.SetupGetItem = function(){
    // Change Items
    Game_Interpreter.prototype.command126 = function () {
        var amount = this.operateValue(this._params[1], this._params[2], this._params[3]);
        var item = $dataItems[this._params[0]];
        if( item !== null ){
            $gameParty.gainItem(item, amount );
            if( amount > 0 ){
                KunNotifier.MailBox.onGetItem(item.name, amount, item.iconIndex );
            }
            return true;
    
        }
        return false;
    };
};

/********************************************************************************************************************
 * 
 * Window_Notifier
 * 
 *******************************************************************************************************************/

function Window_Notifier() { this.initialize.apply(this, arguments); }
Window_Notifier.prototype = Object.create(Window_Base.prototype);
Window_Notifier.prototype.constructor = Window_Notifier;
/**
 * @param {Number} height 
 * @param {Number} displayTime 
 * @param {Number} transitionTime 
 * @param {Number} backgroundType 
 */
Window_Notifier.prototype.initialize = function ( height , displayTime , transitionTime , backgroundType ) {

    var x = Graphics.boxWidth / 12;
    var y = height || 1;

    var width = ( Graphics.boxWidth / 12 ) * 10;
    var height = this.standardFontSize() + this.textPadding() * 3 + this.standardPadding() * 2;

    this._elapsed = 0;
    this._messages = [];
    this._methods = {};
    this._transition = false;
    this._displayTime = displayTime || 96;
    this._transitionTime = transitionTime || 48;

    Window_Base.prototype.initialize.call(this, x, y, width, height);

    this.hide();

    this.setBackgroundType( backgroundType || 1 );
    //this.setBackgroundType(KunNotifier.MailBox.background());
    //this.drawTextEx(message, 0, 0, window.screen.width, "left");
    this.attachToScene();
    this.wait(32);
}
/**
 * @returns Window_Notifier
 */
Window_Notifier.prototype.attachToScene = function () {
    //SceneManager._scene.addChild(this);
};
/**
 * @param {Function} callable 
 */
Window_Notifier.prototype.bindComplete = function( callable ){
    if( typeof callable === 'function' ){
        this._methods['onComplete'] = callable;
    }
};
/**
 * @returns Number
 */
Window_Notifier.prototype.count = function(){
    return this._messages.length;
};
/**
 * 
 */
Window_Notifier.prototype.completed = function(){
    this.hide();
    if( this._methods.hasOwnProperty('onComplete') && typeof this._methods.onComplete === 'function' ){
        this._methods.onComplete();
    }
};
/**
 * 
 * @param {String} message 
 * @param {Boolean} playFx 
 */
Window_Notifier.prototype.display = function( message , playFx ){
    //this.setBackgroundType(KunNotifier.MailBox.background());
    this.drawTextEx(message, 0, 0, window.screen.width);
    if( playFx ){
        KunNotifier.MailBox.sfx();
    }
};
/**
 * 
 */
Window_Notifier.prototype.wait = function( wait ){
    this._elapsed = wait;
};
/**
 * @returns Boolean
 */
Window_Notifier.prototype.waitCountDown = function(){
    return this._elapsed > 0 ? --this._elapsed > 0 : false;
};
Window_Notifier.prototype.waiting = function(){
    return this._elapsed > 0;
};
/**
 * @returns Boolean
 */
Window_Notifier.prototype.busy = function(){
    return this._elapsed + this._messages.length > 0;
};
/**
 * @returns Boolean
 */
Window_Notifier.prototype.hasMessages = function(){
    return this._messages.length > 0 ;
};
/**
 * @returns Boolean
 */
Window_Notifier.prototype.nextMessage = function(){
    if( this.hasMessages() ){
        this.contents.clear();
        var message = this._messages.shift();
        this.display( message.content , message.playFx );
        this.show();
        return true;
    }
    else{
        this.hide();
    }
    return false;
};
/**
 * 
 */
Window_Notifier.prototype.update = function(){
    Window_Base.prototype.update.call(this);
    if( this.isOpen()){
        if( !this.waitCountDown( ) ){
            if( this._transition ){
                this._transition = false;
                if( this.nextMessage() ){
                    this.wait(this._displayTime);
                }
                else{
                    this.completed();
                }
            }
            else{
                this._transition = true;
                this.hide();
                this.wait(this._transitionTime);
            }
        }
    }
};
/**
 * @param {String} message 
 * @param {Boolean} playFx
 */
Window_Notifier.prototype.push = function( message , playFx ){
    if( typeof message === 'string' && message.length ){
        this._messages.push({
            'content' : this.convertEscapeCharacters(message),
            'playFx': typeof playFx === 'boolean' && playFx,
        });
    }
};

/**
 * 
 * @returns Window_Notifier
 */
Scene_Map.prototype.notifier = function(){

    if( typeof this._notifier === 'undefined' ){
        this._notifier = KunNotifier.MailBox.createNotifier();
        //SceneManager._scene.addChild(this);
        this.addChild( this._notifier );
    }

    return this._notifier;
};

/**
 * @param {String} message 
 * @param {Boolean} playSfx
 * @returns {KunNotifier}
 */
function kun_notify (message , playSfx ) {
    return KunNotifier.MailBox.send(message , playSfx );
}


/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function ( /* args */) {

    var parameters = PluginManager.parameters('KunNotifier');
    //KunNotifier.MailBox = new KunNotifier();
    KunNotifier.MailBox.Set.Debug( parameters.debug === 'true' );
    KunNotifier.MailBox.Set.DisplayTime( parameters.displaytime);
    KunNotifier.MailBox.Set.TransitionTime( parameters.transitionTime );
    KunNotifier.MailBox.Set.Background( parameters.background );
    KunNotifier.MailBox.Set.Sound( parameters.sfx );
    KunNotifier.MailBox.Set.Position( parameters.position );

    if( parameters.notifyItem === 'true' ){
        KunNotifier.SetupGetItem();
        KunNotifier.MailBox.Set.ItemText( parameters.itemText );
    }

    //OVERRIDE COMMAND INTERPRETER
    var KunNotifierPluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        KunNotifierPluginCommand.call(this, command, args);
        if (command === 'KunNotifier') {
            if (args && args.length) {
                if( args[0] === 'playFx' ){
                    args.slice();
                    kun_notify(args.join(' '),true);
                }
                else{
                    kun_notify(args.join(' '),);
                }
            }
        }
    };


})( /* initializer */);