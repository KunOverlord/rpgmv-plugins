//=============================================================================
// KunGreetings.js
//=============================================================================
/*:
 * @filename KunGreetings.js
 * @plugindesc Create playable sound banks to randomize different Sound Effect outputs
 * @version 0.1
 * @author KUN
 * @target MC | MZ
 * 
 * @help
 * 
 * @param debug
 * @text Debug Level
 * @desc Show debug info.
 * @type boolean
 * @default false
 * 
 * @param credits
 * @text Credits
 * @type text[]
 * @desc List all supporters here
 * 
 * @param names
 * @text Names
 * @desc List all credit names you want to include
 * @type text[]
 * 
 * @param greetings
 * @text Greetings
 * @type text[]
 * 
 * @param color
 * @parent greetings
 * @type number
 * @text Greeting Name Color
 * @desc Show a color for the name in greeting messages
 * @min 0
 * @max 31
 * @default 0
 * 
 */


/**
 * @class {KunGreetings}
 */
class KunGreetings {
    /**
     * 
     * @returns {KunGreetings}
     */
    constructor() {

        if (KunGreetings.__instance) {
            return KunGreetings.__instance;
        }

        KunGreetings.__instance = this.initialize();
    }


    /**
     * @returns {KunGreetings}
     */
    initialize() {
        const parameters = this.pluginData()
        this._debug = parameters.debug;
        this._names = parameters.names || [];
        this._credits = parameters.credits || [];
        this._greetings = parameters.greetings || [];
        //this._color = parameters.color || 0;
        return this;
    };
    /**
     * @returns {Boolean}
     */
    debug() { return this._debug; };
    /**
     * @returns {String[]}
     */
    names() { return this._names; };
    /**
     * @returns {String[]}
     */
    greetings() { return this._greetings; };
    /**
     * @returns {String[]}
     */
    credits(){ return this._credits; }
    /**
     * @param {Number} counter
     * @returns {String}
     */
    name( counter = 0 ){
        const names = this.names();
        const index = counter ? (counter - 1) % names.length : Math.floor(Math.random() * names.length);
        return names.length && names[index] || '';
    }
    /**
     * @param {Number} counter
     * @returns {String}
     */
    greeting( counter = 0 ){
        const name = this.name(counter);
        const greetings = this.greetings();
        const greeting = greetings.length && greetings[Math.floor(Math.random() * greetings.length)] || '';
        return greeting.replace( /\{(?:name|NAME)\}/gi , name );
    }
    /**
     * @returns {Boolean}
     */
    kunnotifier(){ return !!(KunNotifier && KunNotifier.notify); }
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
                //console.log(value);
                if (Array.isArray(value)) {
                    return value.map(item => _kunPluginReaderV2(key, item));
                }
                const content = {};
                Object.keys(value).forEach(key => content[key] = _kunPluginReaderV2(key, value[key]));
                //console.log(key,content);
                return content;
            }
            return value;
        };

        return _kunPluginReaderV2('KunGreetings', PluginManager.parameters('KunGreetings'));
    };

    /**
     * @param {*} message 
     */
    static DebugLog(message = '') {
        if (KunGreetings.manager().debug()) {
            console.log('[ KunGreetings ]', message);
        }
    };
    /**
     * @returns {KunGreetings}
     */
    static manager() {
        return KunGreetings.__instance || new KunGreetings();
    }
}


/**
 * 
 */
function KunGreetings_EscapeChars() {
    const _kunGreetings_WindowBase_EscapeChars = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {

        const parsed = _kunGreetings_WindowBase_EscapeChars.call(this, text);

        return parsed
            .replace( /\{KUNGREETING(?:\[(\d+)\])?\}/gi ,function( ){
                const count = arguments[1] && parseInt(arguments[1]) || 0;
                return KunGreetings.manager().greeting(count || 0);
            }.bind(this))
            .replace( /\x1bKUNGREETING\[(\d+)\]/gi ,function( ){
                const count = arguments[1] && parseInt(arguments[1]) || 0;
                return KunGreetings.manager().greeting(count || 0);
            }.bind(this))
            .replace( /\{KUNGREETING\}/gi ,function( ){
                return KunGreetings.manager().greeting();
            }.bind(this))
            .replace( /\{KUNCREDITS\}/gi ,function( ){
                return KunGreetings.manager().credits().join(",\n");
            }.bind(this))
            //.replace(/{KUNCREDITS}/g,function(){
            //    return KunGreetings.manager().names().join(', ');
            //}.bind(this))
            .replace(/{KUNNAME}/g,function(){
                return KunGreetings.manager().name();
            }.bind(this));
    };
}
/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function ( /* args */) {

    KunGreetings.manager();

    KunGreetings_EscapeChars();

})( /* initializer */);



