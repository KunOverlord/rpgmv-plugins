//=============================================================================
// KunDates.js
//=============================================================================
/*:
 * @plugindesc Enable SPECIAL Date Switches
 * to give your game a special flavor depending on the date ;)
 * @author KUN
 * @version 1.01
 * 
 * @help
 * Register your special dates in the Parameters section:
 *     Activate special events and switches on Christmas,
 *     Halloween, Valentine's Day or any other special date ...
 * 
 * PARAMETERS
 * - Debug Data: You may check it to watch console output.
 * - Special Dates: You may add here a list of the special dates, with a text message and an associated SWITCH to unlock special events ;)
 * - Default empty mailbox: This message will show as default when no messsage is found to display in the dialog.
 * 
 * COMMANDS
 * -- "KUNSpecialDates run"
 *          Run all the events within the current given dates ;)
 * -- "KUNSpecialDates check [yyyy-mm-dd]"
 *          This command forces the activation of the switch from the available date you've passed through parameter.
 * 
 * FUNCTIONS
 * -- kun_special_dates_check( )
 *      you can use this one in event conditions, so you can check if there's some message to show today ;).
 * -- kun_special_dates_check( [yyyy-mm-dd] )
 *      same, but this one will fire up ONLY in the special date you pass by parameter, for christmas, some birthday, etc.
 *      use [year] in yyyy to define the current year in progress
 * 
 * DIALOG TEXT REPLACERS
 * 
 * - \SPECIAL_DATE: This escape string will show today's special date message, or empty if nothing found.
 * - \CURRENT_DATE: This escape string will show today's date
 * 
 * 
 * @param specials
 * @text Special Dates
 * @type struct<Special>[]
 * @desc Define here your Game Special Dates :D
 * 
 * @param emptyText
 * @text Default Empty MailBox
 * @type text
 * @desc Type in the default text to show when there's no message to display in a dialog.
 * @default No message to show today :(
 * 
 * @param onLoad
 * @text Run on Load
 * @type boolean
 * @default false
 * 
 * @param debug
 * @text Debug
 * @type boolean
 * @desc Show debug Data and console output
 * 
 */
/*~struct~Special:
 * @param message
 * @text Message
 * @desc Your special date Message
 * @type text
 * 
 * @param day
 * @text Day
 * @type number
 * @desc Your special date Day
 * @min 1
 * @max 31
 * @default 1
 * 
 * @param month
 * @text Month
 * @type number
 * @desc Your special date Month
 * @min 1
 * @max 12
 * @default 1
 *
 * @param year
 * @text Year (optional)
 * @type number
 * @desc Type in a specific year for this event, or leave it to 0 as default.
 * @default 0
 * 
 * @param daysBefore
 * @text Days Before
 * @desc Number of days open before the event
 * @type number
 * @min 0
 * @max 30
 * @default 0
 * 
 * @param daysAlive
 * @text Days Alive
 * @desc Number of Days to keep this event alive
 * @type number
 * @min 1
 * @max 60
 * @default 1
 *
 * @param switchID
 * @text Switch ID
 * @type switch
 * @desc Define here your activation switches :D
 * @default 0
 *
 * @param sfx
 * @text Audio SFX
 * @type file
 * @require 1
 * @dir audio/me/
 * @desc Define a SE music to play when this date is activated :D
 *
 */
/**
 * @class {KunDates}
 */
class KunDates{

    constructor(){
        if( KunDates.__instance ){
            return KunDates.__instance;
        }

        KunDates.__instance = this.initialize();
    }
    /**
     * @returns {KunDates}
     */
    initialize(){
        const parameters = KunDates.PluginData();

        this._debug = parameters.debug || false;
        this._onLoad = parameters.onLoad || false;
        this._default = parameters.emptyText || '';
        this._dates = {
            //import all dates here
        };

        const specials = Array.isArray(parameters.specials) && parameters.specials || [];
        specials.forEach( special => {
            this.add(new KunDate(
                special.day || 1,
                special.month || 1,
                special.year || 0,
                special.message.trim() || '',
                special.switchID || 0,
                special.daysBefore || 0,
                special.daysAlive || 1,
                special.sfx || ''
            ));
        });
        
        KunDates.DebugLog(this.events());
        
        if (parameters.onLoad) {
            kun_special_dates_setup_onload();
        };

        return this;
    }


    /**
     * List all the months
     * @returns {String[]}
     */
    Months () {
        return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    };
    /**
     * @returns {Object}
     */
    importParameters () {
        return PluginManager.parameters('KunDates');
    };

    /**
     * @returns {Boolean}
     */
    debug () {
        return this._debug;
    };
    /**
     * @returns {Boolean}
     */
    onLoad () {
        return this._onLoad;
    };
    /**
     * @returns {KunDates}
     */
    run () {
        this.list().forEach(  special => {
            if (special.checkSwitch()) {
                this.notify (special.message());
                special.play();
            }
            KunDates.DebugLog(`Switch ID ${special.flag()}: ${special.status()}`);
        });

        return this;
    };
    /**
     * @returns {KunDate[]}
     */
    list () {
        return this.events(true);
    };
    /**
     * @returns {String[]}
     */
    dates () {
        return Object.keys(this._dates);
    };
    /**
     * @param {Boolean} list 
     * @returns {Object|KunDate[]}
     */
    events (list = false) {
        return list ? Object.values(this._dates) : this._dates;
    };
    /**
     * @returns {KunDate[]}
     */
    active () {
        return this.events(true).filter(event => event.isActive());
    };
    /**
     * @param {String} date 
     * @returns {Boolean}
     */
    has (date) {
        return this._dates.hasOwnProperty(date);
    };
    /**
     * @returns {KunDates}
     */
    dump () {
        this.list().forEach( special => {
            KunDates.DebugLog(`${special.toString()} ${(special.isActive() ? 'active' : 'inactive')} switch is ${special.status() ? 'on' : 'off'}`);
            //KunDates.DebugLog( special.toString()  + ' ' + (special.isActive() ? 'active' : 'inactive' ) + ' switch is ' + (special.status( ) ? 'on' : 'off') );
        });
        return this;
    };
    /**
     * @param {String} date 
     * @returns {KunDate}
     */
    get (date) {
        return this._dates[date] || null;
        //return this.has(date) ? this._dates[date] : null;
    };
    /**
     * @param {KunDate} special
     * @returns {KunDates}
     */
    add ( special = null ) {

        if( special instanceof KunDate ){
            if (!this.has(special.toString())) {
                this._dates[special.toString()] = special;
            }
        }

        return this;
    };
    /**
     * @param {Number} month 
     * @returns {String}
     */
    getMonth (month) {
        return this.Months()[month - 1];
    };
    /**
     * @param {String} special yyyy-mm-dd
     * @returns {Boolean}
     */
    checkDate (special = '') {

        const date = new Date(special.length > 0 ?
            special.replace('year', KunDate.CurrentYear()) :
            KunDate.Today());

        KunDates.DebugLog(['Match Dates (requested:dates)', date,this.list()]);
        return this.list().filter( event => event.isActive(date) ).length > 0;
    };
    /**
     * @param {String} date 
     * @returns {String}
     */
    message (date = '') {
        const special = this.get( date || KunDate.Today() );
        return special && special.message() ||this.default();
    };
    /**
     * @returns {String}
     */
    default(){
         return this._default;
    };
    /**
     * @param {String} message 
     * @returns {KunDates}
     */
    notify (message = '' ){
        typeof message && kun_notify === 'function' && kun_notify(message) || KunDates.DebugLog(message);
        return this;
    };

    /**
     * @returns {Object}
     */
    static PluginData = function () {
        function _kunPluginReader ( key , value ) {
            if (typeof value === 'string' && value.length ) {
                try {
                    if (/^\{.*\}$|^\[.*\]$/.test(value)) {
                        return JSON.parse(value, _kunPluginReader );
                    }
                } catch (e) {
                    // If parsing fails or it's not an object/array, return the original value
                }
                if( value === 'true' || value === 'false'){
                    return value === 'true';
                }
                if( !isNaN(value) ){
                    return parseInt(value);
                }
            }
            return value;
        };

        const _data = PluginManager.parameters('KunDates');
        const output = {};
        Object.keys( _data ).forEach( function(key ){
            output[key] = _kunPluginReader(key , _data[key]);
        });
        return output;
    };
    /**
     * @param {*} message 
     */
    static DebugLog(message) {
        if (KunDates.instance().debug()) {
            console.log(typeof message !== 'object' ? '[ KunDates ] - ' + message : message);
        }
    };
    /**
     * @param {String} command 
     * @returns {Boolean}
     */
    static commands( command = '' ){
        return ['kunspecialdates','kundates'].includes(command.toLowerCase());
    };
    /**
     * @returns {KunDates}
     */
    static instance(){
        return KunDates.__instance || new KunDates();
    }
}


/**
 * @class {KunDate}
 */
class KunDate{
    /**
     * @param {Number} day
     * @param {Number} month
     * @param {Number} year
     * @param {String} message 
     * @param {Number} gameSwitch 
     * @param {Number} daysBefore 
     * @param {Number} daysAfter
     * @param {String} sfx 
     * @returns {KunDate}
     */
    constructor(day = 1, month = 1, year = 0, message = '', gameSwitch = 0, daysBefore = 0, daysAfter = 1, sfx = ''){
        this._day = day;
        this._month = month || 1;
        this._year = year || KunDate.CurrentYear();
        this._message = message || '';
        this._switch = gameSwitch || 0;
        this._before = daysBefore || 0;
        this._after = daysAfter || 1;
        this._sfx = sfx || '';
    }

    /**
     * @returns {String}
     */
    toString () {
        return KunDate.format(this._day, this._month, this._year);
    };
    /**
     * @returns {Date}
     */
    date () {
        return new Date(this.year(), this.month() - 1, this.day());
    };
    /**
     * @returns {Date}
     */
    from () {
        var date = new Date(this.date());
        date.setDate(this.date().getDate() - this.before());
        return date;
    };
    /**
     * @returns {Date}
     */
    to () {
        var date = new Date(this.date());
        date.setDate(this.date().getDate() + this.after());
        return date;
    };
    /**
     * @returns {Number}
     */
    year () {
        return this._year;
    };
    /**
     * @returns {Number}
     */
    day () {
        return this._day;
    };
    /**
     * @returns {Number}
     */
    month () {
        return this._month;
    };
    /**
     * @returns {Number}
     */
    flag () {
        return this._switch;
    };
    /**
     * @param {Boolean} override 
     * @returns {Boolean}
     */
    checkout ( override = false) {
        const active = override || this.isActive();
        this.set(active);
        KunDates.DebugLog(`Event ${this.toString()} is ${active ? 'ON' : 'OFF'} - Switch ${this.flag()} is ${this.status() ? 'ON' : 'OFF'}`);
        return active;
    };
    /**
     * @param {Boolean} active 
     * @returns {KunDate}
     */
    set (active = false) {
        if (this._switch) {
            $gameSwitches.setValue(this._switch, active );
        }
        return this;
    };
    /**
     * @returns {Boolean}
     */
    status () {
        return this.flag() && $gameSwitches.value(this.flag()) || false;
    }
    /**
     * Plays an Audio ME piece
     * @returns {KunDate}
     */
    play () {
        if (this._sfx) {
            AudioManager.playMe({ name: this._sfx, pan: 0, pitch: 100, volume: 100 });
        }
        return this;
    };
    /**
     * @returns {Number}
     */
    days () {
        return this.before() + this.after();
    };
    /**
     * @returns {Number}
     */
    after () {
        return this._after;
    };
    /**
     * @returns {Number}
     */
    before () {
        return this._before;
    };
    /**
     * @returns {String}
     */
    message () {
        return this._message;
    };
    /**
     * @returns {Boolean}
     */
    isToday () {
        return KunDate.Today() === this.toString();
    };
    /**
     * @param {Date} date
     * @returns {Boolean}
     */
    isActive ( date = null) {
        const time = date instanceof Date && date.getTime() || this.now().getTime();
        return time >= this.from().getTime() && time <= this.to().getTime();
    };
    /**
     * @returns {Date}
     */
    now(){
        return new Date();
    };

    /**
     * Format today's date into yyyy-mm-dd
     * @returns {String}
     */
    static Today () {
        const now = new Date();
        return KunDate.format(now.getDate(), now.getMonth() + 1, now.getFullYear());
    };
    /**
     * @returns {Number}
     */
    static CurrentYear () {
        return (new Date()).getFullYear();
    };
    /**
     * Return a formatted date in yyyy-mm-dd
     * @param {Number} day 
     * @param {Number} month 
     * @param {Number} year 
     * @returns {String}
     */
    static format (day = 1, month = 1, year = 0) {
        const current = KunDate.CurrentYear();
        return `${year || current }-${month.padZero(2)}-${day.padZero(2)}`;
    };    
}



/**
* @param {String} date [optional]
 * @returns {Boolean}
 */
function kun_special_dates_check(date) {
    return KunDates.instance().checkDate(date);
};
/**
 * 
 */
function kun_special_dates_setup_onload() {
    var _KunDates_GameLoad = Game_System.prototype.onAfterLoad;
    Game_System.prototype.onAfterLoad = function () {
        _KunDates_GameLoad.call(this);
        KunDates.instance().run();
    }
};
/**
 * 
 */
function KunDates_Commands() {
    const _KunDates_PluginCommands = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunDates_PluginCommands.call(this, command, args);
        if ( KunDates.commands(command)) {
            const manager = KunDates.instance();
            if (args && args.length) {
                switch (args[0]) {
                    case 'run':
                        manager.run();
                        break;
                    case 'check':
                        if (args.length > 1) {
                            const special = manager.get(args[1]);
                            if (special) {
                                special.set(true);
                                manager.notify(special.message());
                                special.play();
                            }
                        }
                        break;
                    case 'year':
                        if (args.length > 1) {
                            $gameVariables.setValue(parseInt(args[1]), (new Date()).getFullYear());
                        }
                        break;
                    case 'month':
                        if (args.length > 1) {
                            $gameVariables.setValue(parseInt(args[1]), (new Date()).getMonth() + 1);
                        }
                        break;
                    case 'day':
                        if (args.length > 1) {
                            $gameVariables.setValue(parseInt(args[1]), (new Date()).getDate());
                        }
                        break;
                }
            }
        }
    };
}
/**
 * 
 */
function KunDates_SetupEscapeChars() {
    
    const _KunDates_WindowBase_EscapeChars = Window_Base.prototype.convertEscapeCharacters;

    Window_Base.prototype.convertEscapeCharacters = function (text) {

        var parsed = _KunDates_WindowBase_EscapeChars.call(this, text);

        //return the current special message
        parsed = parsed.replace(/\x1bSPECIAL_DATE/gi, function () {
            const manager = KunDates.instance();
            var special = manager.get(KunDate.Today());
            return special ? special.message() : manager.default();
        }.bind(this));

        //return the current date
        parsed = parsed.replace(/\x1bCURRENT_DATE/gi, function () {
            return KunDate.Today();
        }.bind(this));

        //parse first the vanilla strings
        return parsed;
        //return _WindowBase_ConvertEscapeCharacters.call(this, parsed);
    };
}


/* PLUGIN SETUP */
(function () {

    KunDates.instance();

    KunDates_Commands();
    KunDates_SetupEscapeChars();

})();



