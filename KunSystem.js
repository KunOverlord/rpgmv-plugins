//=============================================================================
// KunSystem.js
//=============================================================================
/*:
 * @plugindesc KunSystem
 * @filename KunSystem.js
 * @author KUN
 * @version 1.01
 * 
 * @help
 * 
 * COMMANDS:
 * 
 * KunSystem switch [switch_name] [true|false]
 *      Set switch_name's value
 *      Do not provide a value (true/false) to let the plugin import the options default defined
 * 
 * KunSystem toggle [switch:switch:switch:...]
 *      Toggle switch values
 * 
 * KunSystem var [var_name] [value]
 *      Set var_name's value by command
 *      Do not provide a value to let the plugin import the options default defined
 * 
 * Text Escape Codes
 * 
 *      \SWSTAT[switch_id]
 *      Renders the switch status label as defined in the plugin
 *  
 *      \SWNAME[switch_id]
 *      Renders the switch title as defined in the plugin
 * 
 *      \VARNAME[var_id]
 *      Renders the variable title as defined in the plugin
 * 
 * 
 * @param debug
 * @text Debug
 * @desc Show debug data in console
 * @type Boolean
 * @default false
 * 
 * @param fullOptionWindow
 * @text Fullview Option Window
 * @type boolean
 * @default false
 * 
 * @param footerText
 * @text Footer Text
 * @desc Add here legal and version info
 * 
 * @param footerSize
 * @text Footer Text Size
 * @desc Define footer size
 * @parent footerText
 * @default 13
 * @type number
 * @min 10
 * @max 20
 * 
 * @param footerColor
 * @text Footer Text Color
 * @desc Define footer color
 * @parent footerText
 * @type number
 * @min 0
 * @max 31
 * @default 8
 * 
 * @param switches
 * @type struct<GameSwitch>[]
 * @string Game Switches
 * 
 * @param variables
 * @type struct<GameVariable>[]
 * @string Game Variables
 */
/*~struct~GameSwitch:
 * @param name
 * @text Name
 * @type string
 * 
 * @param value
 * @type boolean
 * @text Value
 * @default false
 * 
 * @param switch
 * @text Switch
 * @type switch
 * @min 0
 * @default 0
 * 
 * @param title
 * @text Title
 * @type string
 * 
 * @param tagOn
 * @type text
 * @text Tag On
 * @default On
 * 
 * @param tagOff
 * @type text
 * @text Tag Off
 * @default Off
 * 
 * @param system
 * @type boolean
 * @text System
 * @default false
 * @desc System switches are hidden and initialized on game start
 * 
 */
/*~struct~GameVariable:
 * @param name
 * @text Name
 * @type string
 * 
 * @param value
 * @type number
 * @text Value
 * @min 0
 * @default 0
 * 
 * @param variable
 * @text Game Variable
 * @type variable
 * @min 0
 * @default 0
 * 
 * @param title
 * @text Title
 * @type string
 * 
 * @param maximum
 * @type number
 * @text Maximum Value
 * @min 1
 * @default 100
 * 
 * @param system
 * @type boolean
 * @text System
 * @default false
 * @desc system variables are hidden by default and initialized on game start
 * 
 */
/**
 * 
 */
class KunSystem {
    /**
     * 
     */
    constructor() {
        if (KunSystem.__instance) {
            return KunSystem.__instance;
        }

        KunSystem.__instance = this;

        this.initialize();
    }
    /**
     * 
     */
    initialize() {

        const parameters = this.pluginData();
        this._debug = parameters.debug;
        this._fullOptionWindow = parameters.fullOptionWindow;
        this._switches = [];
        this._variables = [];
        this._footerText = parameters.footerText;
        this._footerSize = parameters.footerSize;
        this._footerColor = parameters.footerColor;

        this.importSwitches(parameters.switches);
        this.importVariables(parameters.variables);
    }


    /**
     * @returns {Boolean}
     */
    debug () { return this._debug; };
    /**
     * @returns {String}
     */
    footerText () { return this._footerText; };
    /**
     * @returns {String}
     */
    footerSize() {
        return this._footerSize;
    };
    /**
     * @returns {String}
     */
    footerColor() {
        return this._footerColor;
    };
    /**
     * @returns {Boolean}
     */
    showFooter() { return this.footerText().length > 0; };
    /**
     * @returns {Boolean}
     */
    fullOptionWindow() { return this._fullOptionWindow; };
    /**
     * 
     * @param {Number} id 
     * @returns {KunOptionSwitch}
     */
    getSwitchById(id = 0) { return this.switches().find( option => option.id() === id ) || null; }
    /**
     * @param {Number} id 
     * @returns {KunOptionVar}
     */
    getVarById( id = 0) { return this.variables().find(option => option.id() === id) || null; }
    /**
     * 
     * @param {Number} id 
     * @returns {String}
     */
    switchStatus(id = 0) {
        const option = this.getSwitchById(id);
        return option ? option.tag() : '';
    };
    /**
     * 
     * @param {Number} id 
     * @param {Boolean} title
     * @returns {String}
     */
    varName(id = 0 , title = false ) {
        const option = this.getVarById(id);
        return option ? title && option.title() || option.name() : `GameVar (${id})`
    };
    /**
     * 
     * @param {Number} id 
     * @param {Boolean} title
     * @returns {String}
     */
    switchName(id = 0,title = false) {
        const option = this.getSwitchById(id);
        return option ? title && option.title() || option.name() : `GameSwitch (${id})`;
    };
    /**
     * @param {String} name
     * @param {String} title
     * @param {Number} gameSwitch
     * @param {Number} value
     * @param {Boolean} system
     * @param {String} tagOn
     * @param {String} tagOff
     */
    addSwitch(name, title, gameSwitch, value, system, tagOn, tagOff) {
        if (!this.hasGameSwitch(name)) {
            this.switches().push( new KunOptionSwitch(name,title,gameSwitch,value,system,tagOn,tagOff));
        }
    };
    /**
     * @param {String} name
     * @param {String} title
     * @param {Number} gameVar
     * @param {Number} value
     * @param {Number} maximum
     * @param {Boolean} system
     */
    addVariable(name, title, gameVar, value, maximum, system) {
        if (!this.hasVariable(name)) {
            this.variables().push( new KunOptionVar( name, title, gameVar,value,maximum || 0,system ) );
        }
    };
    /**
     * @param {String} switchname 
     * @returns {Boolean}
     */
    hasGameSwitch(switchname = '') { return !!switchname && this.switches().some( opt => opt.name() === switchname ); };
    /**
     * @param {String} varname 
     * @returns {Boolean}
     */
    hasVariable(varname = '') { return !!varname && this.variables().some( opt => opt.name() === varname); };
    /**
     * @param {Object[]} switches 
     * @returns {KunSystem}
     */
    importSwitches(switches) {
        if (Array.isArray(switches)) {
            switches.forEach( gs => {
                this.addSwitch(
                    gs.name,
                    gs.title,
                    gs.switch,
                    gs.value,
                    gs.system,
                    gs.tagOn || '', gs.tagOff || '');
            });
        }
        return this;
    };
    /**
     * @param {Object[]} variables 
     * @returns {KunSystem}
     */
    importVariables(variables) {
        if (Array.isArray(variables)) {
            variables.forEach( gv => {
                this.addVariable(gv.name,
                    gv.title,
                    gv.variable,
                    gv.value,
                    gv.maximum,
                    gv.system);
            });
        }
    };
    /**
     * 
     */
    importDefaults() {
        this.switches().forEach( option => option.reset() );
        this.variables().forEach( option => option.reset() );
    };
    /**
     * @returns {Number[]}
     */
    dumpVars() { return this.variables().map( option => option.get() );  };
    /**
     * @returns {Boolean[]}
     */
    dumpSwitches() { return this.switches().map(option => option.get()); };
    /**
     * @returns {KunOptionVar[]}
     */
    variables() { return this._variables; };
    /**
     * @returns {KunOptionSwitch[]}
     */
    switches() { return this._switches; };
    /**
     * @param {String} name 
     * @returns {KunOptionVar}
     */
    getVar( name = ''){ return this.variables().find( option => option.name() === name) || null; }
    /**
     * @param {String} varname 
     * @returns {Number}
     */
    getValue(varname = '') {
        const option = this.getVar(varname);
        return option && option.get() || 0;
        //return this.hasVariable(varname) ? $gameVariables.value(this.variables()[varname].id) : 0;
    };
    /**
     * @param {String} name 
     * @returns {KunOptionSwitch}
     */
    getSwitch( name = ''){ return this.switches().find( option => option.name() === name) || null; }
    /**
     * @param {String} switchname 
     * @returns {Boolean}
     */
    getStatus(switchname = '') {
        const option = this.getSwitch(switchname);
        return !!option && option.get();
        //return this.hasGameSwitch(switchname) ? $gameSwitches.value(this.switches()[switchname].id) : false;
    };
    /**
     * @param {String} name 
     * @param {Number} value 
     */
    setGameVar(name = '', value = 0) {
        const option = this.getVar(name);
        if (option) {
            option.set(value);
            KunSystem.DebugLog(`GameVar[${name}] to ${value.toString()}`);
        }
    };
    /**
     * @param {String} name 
     * @returns {Number}
     */
    defaultVar( name = ''){
        const option = this.getVar(name);
        return !!option && option.default() || 0;
        //return this.hasVariable(name) && this.variables()[name].value || 0;
    }
    /**
     * @param {String} name 
     * @param {Boolean} value 
     */
    setGameSwitch(name = '', value) {
        const option = this.getSwitch(name);
        if (option) {
            option.set(value);
            KunSystem.DebugLog(`GameSwitch[${name}] to ${value.toString()}`);
            return true;
        }
        return false;
    };
    /**
     * @param {String} name 
     * @returns {Boolean}
     */
    defaultSwitch( name = '' ){
        const option = this.getSwitch(name);
        return !!option && option.default();
        //return this.hasGameSwitch(name) && this.switches()[name].value || false;
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

        return _kunPluginReaderV2('KunSystem', PluginManager.parameters('KunSystem'));
    }

    /**
     * @param {String|Object} message
     */
    static DebugLog () {
        if (KunSystem.manager().debug()) {
            console.log('[ KunSystem ]', ...arguments);
        }
    };

    /**
     * @returns {KunSystem}
     */
    static manager() { return KunSystem.__instance || new KunSystem() }
}

/**
 * 
 */
class KunOptionSwitch{
    /**
     * @param {String} name 
     * @param {String} title 
     * @param {Number} gameswitch 
     * @param {Boolean} value 
     * @param {Boolean} system 
     * @param {String} tagon
     * @param {String} tagoff
     */
    constructor(name = '',title = '',gameswitch = 0,value = false , system = false, tagon = '',tagoff = ''){
        this._name = name || '';
        this._title = title || this._name;
        this._switch = gameswitch ||0;
        this._default = value || false;
        this._system = system || false;
        this._tags = { on: tagon, off: tagoff, };
    }
    /**
     * @returns {Number}
     */
    id(){ return this._switch; }
    /**
     * @returns {Boolean}
     */
    system(){ return this._system; }
    /**
     * @returns {String}
     */
    name(){ return this._name; }
    /**
     * @returns {Object}
     */
    tags(){ return this._tags; }
    /**
     * @returns {String}
     */
    tag( ){ return this.tags()[this.get() ? 'on' : 'off' ] || ''; }
    /**
     * @returns {String}
     */
    title(){ return this._title; }
    /**
     * @returns {Boolean}
     */
    default(){ return this._default; }
    /**
     * @param {Boolean} value 
     * @returns {KunOptionSwitch}
     */
    set( value = false ){
        this.id() && $gameSwitches.setValue(this.id(),value);
        return this;
    }
    /**
     * @returns {KunOptionVar}
     */
    reset(){ return this.set(this.default()); }

    /**
     * @returns {Boolean}
     */
    get( ){ return this.id() && $gameSwitches.value(this.id()) || false; }
}

/**
 * 
 */
class KunOptionVar{
    /**
     * @param {String} name 
     * @param {String} title 
     * @param {Number} gamevar 
     * @param {Number} value 
     * @param {Number} max
     * @param {Boolean} system 
     */
    constructor(name = '',title = '',gamevar = 0,value = 0 , max = 0, system = false){
        this._name = name || '';
        this._title = title || this._name;
        this._var = gamevar ||0;
        this._default = value || 0;
        this._max = max || 0;
        this._system = system || false;
    }
    /**
     * @returns {Number}
     */
    id(){ return this._var; }
    /**
     * @returns {Boolean}
     */
    system(){ return this._system; }
    /**
     * @returns {String}
     */
    name(){ return this._name; }
    /**
     * @returns {String}
     */
    title(){ return this._title; }
    /**
     * @returns {Number}
     */
    default(){ return this._default; }
    /**
     * @returns {Number}
     */
    max(){return this._max;}
    /**
     * @returns {KunOptionVar}
     */
    reset(){ return this.set(this.default()); }
    /**
     * @param {Number} value 
     * @returns {KunOptionVar}
     */
    set( value = 0 ){
        //fix the value to the max when not system var or zero max
        this.id() && $gameVariables.setValue(this.id(), !this.system() && this.max() && Math.min(value,this.max()) || value );
        return this;
    }
    /**
     * @returns {Number}
     */
    get( ){ return this.id() && $gameVariables.value(this.id()) || 0; }
}




/**
 * 
 */
class Window_TitleFooter extends Window_Base{
    constructor() {
        super(...arguments);
    }
    initialize() {
        const height = this.standardFontSize() + this.textPadding() * 2 + this.standardPadding() * 2;
        const width = Graphics.boxWidth / 2;
        //const width = Graphics.boxWidth;
        const y = Graphics.boxHeight - height;
        super.initialize(0, y, width, height)
        //Window_Base.prototype.initialize.call(this, 0, y, width, height);
        this.setBackgroundType(2);
        this.changeTextColor(this.footerColor());
        this.drawTextEx(KunSystem.manager().footerText(), 0, 0, width);
        this.changeTextColor(this.normalColor());
    }
    footerColor() { return this.textColor(KunSystem.manager().footerColor()); }
    standardFontSize() { return KunSystem.manager().footerSize(); }
    textPadding() { return this.standardFontSize() / 2; }
    standardPadding() { return this.standardFontSize() / 2; }
}



function KunSystem_MainMenu() {
    const _KunSystem_SceneTitle_Create = Scene_Title.prototype.create;
    Scene_Title.prototype.create = function () {
        //prepare defaut variables
        KunSystem.manager().importDefaults();
        _KunSystem_SceneTitle_Create.call(this);
    };
}
/**
 * 
 */
function KunSystem_CreateMainFooter() {
    const _KunSystem_SceneTitle_Create = Scene_Title.prototype.create;
    Scene_Title.prototype.create = function () {
        _KunSystem_SceneTitle_Create.call(this);
        this.createFooterWindow();
    };
    //
    Scene_Title.prototype.createFooterWindow = function () {
        this._footerTextWindow = new Window_TitleFooter();
        this.addWindow(this._footerTextWindow);
    };
};
/**
 * 
 */
function KunSystem_CommandList() {
    const _KunSystem_makeCommandList = Window_Options.prototype.makeCommandList;
    Window_Options.prototype.makeCommandList = function () {
        this.addSwitchOptions();
        this.addVariableOptions();
        _KunSystem_makeCommandList.call(this);
    };

    Window_Options.prototype.addVariableOptions = function () {
        KunSystem.manager().variables()
            .filter(option => !option.system())
            .forEach( option => this.addCommand( option.title() , option.name() ));
    };

    Window_Options.prototype.addSwitchOptions = function () {
        KunSystem.manager().switches()
            .filter(option => !option.system())
            .forEach( option => this.addCommand(option.title(),option.name()));
    };
    /**
     * @param {String} symbol 
     * @returns {Boolean}
     */
    Window_Options.prototype.isNumericSymbol = function (symbol) {
        return KunSystem.manager().hasVariable(symbol) || this.isVolumeSymbol(symbol);
    }
    /**
     * @param {String} symbol 
     * @returns {Number}
     */
    Window_Options.prototype.maximum = function (symbol) {
        const option = KunSystem.manager().getVar(symbol);
        return option && option.max() || 100;
    };
    /**
     * @param {String} symbol 
     * @returns {Number}
     */
    Window_Options.prototype.valueOffset = function (symbol) {
        return !KunSystem.manager().hasVariable(symbol) ? this.volumeOffset() : 1;
    };

    /// OVERRIDES
    Window_Options.prototype.statusText = function (index) {
        const symbol = this.commandSymbol(index);
        const value = this.getConfigValue(symbol);
        if (this.isNumericSymbol(symbol)) {
            return !KunSystem.manager().hasVariable(symbol) ? this.volumeStatusText(value) : value.toString();
        } else {
            return this.booleanStatusText(value);
        }
    };

    Window_Options.prototype.processOk = function () {
        const index = this.index();
        const symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        if (this.isNumericSymbol(symbol)) {
            const max = this.maximum(symbol);
            value = value < max ? (value + this.valueOffset(symbol)).clamp(0, max) : 0;
            this.changeValue(symbol, value);
        } else {
            this.changeValue(symbol, !value);
        }
    };

    Window_Options.prototype.cursorRight = function (wrap) {
        var index = this.index();
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        if(this.isNumericSymbol(symbol) ){
            value = (value + this.valueOffset(symbol)).clamp(0, this.maximum(symbol));
        }
        else{
            value = true;
        }
        this.changeValue(symbol, value)
    };

    Window_Options.prototype.cursorLeft = function (wrap) {
        const index = this.index();
        const symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        if( this.isNumericSymbol(symbol)){
            value = (value - this.volumeOffset()).clamp(0, 100);
        }
        else{
            value = false;
        }
        this.changeValue(symbol, value);
    };

    Window_Options.prototype.getConfigValue = function (symbol) {
        const manager = KunSystem.manager();
        switch (true) {
            case manager.hasVariable(symbol):
                return manager.getValue(symbol);
            case manager.hasGameSwitch(symbol):
                return manager.getStatus(symbol);
            default:
                return ConfigManager[symbol];
        }
    };

    Window_Options.prototype.setConfigValue = function (symbol, value) {
        const manager = KunSystem.manager();
        switch (true) {
            case manager.hasVariable(symbol) && typeof value === 'number':
                return manager.setGameVar(symbol, value);
            case manager.hasGameSwitch(symbol) && typeof value === 'boolean':
                return manager.setGameSwitch(symbol, value);
            default:
                ConfigManager[symbol] = value;
        }
    };
    //override with full view when required
    Window_Options.prototype.updatePlacement = function () {
        if (KunSystem.manager().fullOptionWindow()) {
            this.x = 12;
            this.y = 12;
        }
        else {
            this.x = (Graphics.boxWidth - this.width) / 2;
            this.y = (Graphics.boxHeight - this.height) / 2;
        }
    };
    /**
     * @returns Number
     */
    Window_Options.prototype.windowWidth = function () {
        return KunSystem.manager().fullOptionWindow() ? Graphics.boxWidth - 24 : 400;
    };
    /**
     * @returns Number
     */
    Window_Options.prototype.windowHeight = function () {
        return KunSystem.manager().fullOptionWindow() ? Graphics.boxHeight - 24 : this.fittingHeight(this.numVisibleRows());
    };
};

function KunSystem_EscapeChars() {
    const _KunSystem_WindowBase_EscapeChars = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {

        var parsed = _KunSystem_WindowBase_EscapeChars.call(this, text);

        parsed = parsed.replace(/\{STATE:(\d+)\}/gi, function () {
            const id = arguments[1] && parseInt(arguments[1]) || 0;
            return id && KunSystem.manager().switchStatus(id) || '';
        }.bind(this));

        parsed = parsed.replace(/\x1bSWSTAT\[(\d+)\]/gi, function () {
            const id = arguments[1] && parseInt(arguments[1]) || 0;
            return id && KunSystem.manager().switchStatus(id) || '';
        }.bind(this));

        parsed = parsed.replace(/\{SWITCH:(\d+)\}/gi, function () {
            const id = arguments[1] && parseInt(arguments[1]) || 0;
            return id && $gameSwitches.value(id) && 'On' || 'Off';
        }.bind(this));

        parsed = parsed.replace(/\x1bONOFF\[(\d+)\]/gi, function () {
            const id = arguments[1] && parseInt(arguments[1]) || 0;
            return id && $gameSwitches.value(id) && 'On' || 'Off';
        }.bind(this));

        parsed = parsed.replace(/\{SNAME:(\d+)\}/gi, function () {
            return KunSystem.manager().switchName(parseInt(arguments[1]),true);
        }.bind(this));

        parsed = parsed.replace(/\x1bSWNAME\[(\d+)\]/gi, function () {
            return KunSystem.manager().switchName(parseInt(arguments[1]),true);
        }.bind(this));

        parsed = parsed.replace(/\{VNAME:(\d+)\}/gi, function () {
            return KunSystem.manager().varName(parseInt(arguments[1]),true);
        }.bind(this));

        parsed = parsed.replace(/\x1bVARNAME\[(\d+)\]/gi, function () {
            return KunSystem.manager().varName(parseInt(arguments[1]),true);
        }.bind(this));

        return parsed;
    }
};


/**
 //OVERRIDE COMMAND INTERPRETER
 */
function KunSystem_Commands() {
    const _KunSystem_Interpreter_Command = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunSystem_Interpreter_Command.call(this, command, args);
        if( command.toLowerCase() === 'kunsystem'){
            const manager = KunSystem.manager();
            switch(args[0]){
                case 'toggle':
                    if( args.length > 1 ){
                        args[1].split(':')
                            .map( gs => parseInt(gs))
                            .forEach( gs => $gameSwitches.setValue( gs, !$gameSwitches.value(gs) ) );
                    }
                    break;
                case 'switch':
                    if( args.length > 1 ){
                        var value = !!args[2] && args[2].toLowerCase() === 'true';
                        args[1].split(':').forEach( option => manager.setGameSwitch(option, value || manager.defaultSwitch(option)));
                    }
                    break;
                case 'variable':
                case 'var':
                    if( args.length > 1 ){
                        var value = args[2] && parseInt(args[2]) || 0;
                        args[1].split(':').forEach( option =>  manager.setGameVar( option, value || manager.defaultVar(option)) );
                    }
                    break;
            }
        }
    };
};

/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function ( /* args */) {

    const manager = KunSystem.manager();
    KunSystem_MainMenu();
    KunSystem_CommandList();
    KunSystem_EscapeChars();
    KunSystem_Commands();

    if ( manager.showFooter() ) {
        KunSystem_CreateMainFooter();
    }

})( /* initializer */);

