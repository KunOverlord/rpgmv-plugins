//=============================================================================
// KunDayTime.js
//=============================================================================
/*:
 * @filename KunDayTime.js
 * @plugindesc Kun Day Time extension to manage in-game time and custom calendars
 * @version 1.24
 * @author KUN
 * 
 *
 * @help
 * 
 * KunDayTime set|reset [hh:mm] [start] [update]
 *      Sets the time to hh:mm
 *      Allows autostart
 *      Force update calls to request all pending scene changes
 * KunDayTime newday
 *      run new day common event
 * KunDayTime update [hours] [resume|import]
 *      
 * KunDayTime hour gamevar
 *  
 * KunDayTime start|resume [gamevar] [update]
 *      Starts the timer
 *      Sets the time from the gamevar value if required, otherwise it will take it back from the time gamevar
 *      Force update calls to request all pending scene changes
 * KunDayTime stop|pause
 *      Stops the timer
 * 
 * 
 * @param debug
 * @text Debug
 * @type boolean
 * @default false
 * 
 * @param ampm
 * @type boolean
 * @text AM/PM display
 * @desc Show AM/ PM time format display
 * @default false
 * 
 * @param timelock
 * @type switch
 * @text Time Lock Switch
 * @desc use this to enable/disable the timer from a switch: ON = STOPPED, OFF = ENABLED
 * @default 0
 * 
 * @param timevar
 * @text Time Variable
 * @desc Time variable values should be defined as HHMM (1000 = 10:00, 1245 = 12:45 ...)
 * @type variable
 * @default 0
 * 
 * @param ticks
 * @text Ticks
 * @desc Adjust how many ticks before updating the clock. 100 = real life seconds (x60 min x 24 hs ...)
 * @type number
 * @min 10
 * @max 100
 * @default 60
 * 
 * @param minutes
 * @text Minutes per Hour
 * @type number
 * @min 1
 * @default 60
 * 
 * @param hours
 * @text Hours per Day
 * @type number
 * @min 1
 * @default 24
 * 
 * @param ondaychange
 * @type common_event
 * @text On Day Change
 * @desc Run this event once per day 
 * @default 0
 */

/**
 * @class {KunDayTime}
 */
class KunDayTime {
    /**
     * @returns {KunDayTime}
     */
    constructor() {

        if (KunDayTime.__instance instanceof KunDayTime) {
            return KunDayTime.__instance;
        }

        KunDayTime.__instance = this;

        this.initialize();
    }
    /**
     * @returns {KunDayTime}
     */
    initialize() {

        const parameters = KunDayTime.PluginData();

        this._debug = parameters.debug || false;
        this._hours = parameters.hours || 24;
        this._minutes = parameters.minutes || 60;
        this._ticks = parameters.ticks || 60;
        this._ampm = parameters.ampm || false;

        this._timevar = parameters.timevar || 0;
        this._timelock = parameters.timelock || 0;

        this._clock = new KunClock(false,parameters.ondaychange || 0);

        this._calendar = new KunCalendar();
    }
    /**
     * @returns {Boolean}
     */
    debug() {
        return this._debug;
    };
    /**
     * @returns {KunClock}
     */
    clock() {
        return this._clock;
    };
    /**
     * @returns {Boolean}
     */
    formatAmPm() { return this._ampm; }
    /**
     * Use calendar to handle custom cycles
     * @returns {KunCalendar}
     */
    calendar() {
        return this._calendar;
    }
    /**
     * Ticks per update cycle
     * @returns {Number}
     */
    ticks() {
        return this._ticks;
    };
    /**
     * Minutes per hour cycle
     * @returns {Number}
     */
    minutes() {
        return this._minutes;
    };
    /**
     * Hours per day cycle
     * @returns {Number}
     */
    hours() {
        return this._hours;
    };
    /**
     * @param {Boolean} asvalue 
     * @returns {Number}
     */
    timevar(asvalue = false) {
        return asvalue ? this._timevar && $gameVariables.value(this._timevar) || 0 : this._timevar;
    };
    /**
     * asvalue: return the lock value, ON or OFF
     * default: return ifthere's a gameswitch lock
     * @param {Boolean} asvalue 
     * @returns {Boolean}
     */
    timelock(asvalue = false) {
        return asvalue ? this._timelock && $gameSwitches.value(this._timelock) || false : !!this._timelock;
    }
    /**
     * Use it to force pause the clock using a gameswitch.
     * Will work either there's no gameswitch, or gameswitch lock is disabled
     * @returns {Boolean}
     */
    locked() { return this.timelock() && this.timelock(true); }
    /**
     * @param {Number} hour 
     * @param {Number} minute 
     * @param {Boolean} start 
     * @returns {KunDayTime}
     */
    reset(hour = 0, minute = 0, start = false) {
        this.clock().set(hour, minute);
        start && this.start();
        return this;
    }
    /**
     * @param {Number} time 
     * @returns {KunDayTime}
     */
    loadTime(time = 0) {
        const hour = Math.floor(time / 100) % this.hours();
        const minute = (time - hour * 100) % this.minutes();
        this.clock().set(hour, minute);
        KunDayTime.DebugLog(`Loading time from ${time} to ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ...`);
        return this;
    }
    /**
     * Forces the call of Scnene_Map.onTimeChange method
     * @returns {KunDayTime}
     */
    updateScene() {
        const scene = SceneManager._scene;
        if (scene.constructor === Scene_Map && typeof scene.onTimeChange === 'function') {
            scene.onTimeChange();
        }
        return this;
    }
    /**
     * @param {Number} fromValue
     * @param {Boolean} updateScene
     * @returns {KunDayTime}
     */
    start(fromValue = 0) {
        fromValue && this.loadTime(fromValue);
        this.clock().toggle(true);
        KunDayTime.DebugLog('Clock Started!');
        return this;
    }
    /**
     * @returns {KunDayTime}
     */
    stop() {
        this.clock().toggle(false);
        KunDayTime.DebugLog('Clock Stopped!');
        return this;
    }

    /**
     * @returns {Object}
     */
    static PluginData() {
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

        return _kunPluginReaderV2('KunDayTime', PluginManager.parameters('KunDayTime'));
    };
    /**
     * @returns {Boolean}
     */
    static update() {
        const daytime = KunDayTime.manager();
        if (!daytime.locked()) {
            const clock = daytime.clock();
            if (clock.update()) {
                //KunDayTime.DebugLog(clock.toString());
                //return when changed hour
                return !clock.minute();
            }
        }
        return false;
    }
    /**
     * @param {*} message 
     */
    static DebugLog(message = '') {
        if (KunDayTime.manager().debug()) {
            console.log('[ KunDayTime ]', message);
        }
    }
    /**
     * @param {String} cmd 
     * @returns {Boolean}
     */
    static command(cmd = '') {
        return ['kuntime', 'kundaytime', 'kuncalendar'].includes(cmd.toLowerCase());
    }
    /**
     * @returns {KunDayTime}
     */
    static manager() {
        return KunDayTime.__instance || new KunDayTime();
    }
}



/**
 * @class {KunClock}
 */
class KunClock {
    /**
     * @param {Boolean} active
     * @param {Number} commonevent
     */
    constructor(active = false , commonevent = 0) {
        //this.reset(hour , minute );
        this._ticks = 0;
        this._hour = 0;
        this._minute = 0;
        this._active = active;
        this._event = commonevent || 0
        //use an internal lock to avoid updates while operating with the values
        //this._locked = false;
    }
    /**
     * @param {Boolean} ampm
     * @returns {String}
     */
    toString(ampm = false) {
        const hour = this.hour();
        const minute = this.minute();
        const hourFormat = ampm && hour % 12 || hour;
        const timeFormat = ampm ? hour > 11 && ' pm' || ' am' : '';
        return `${hourFormat.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}${timeFormat}`;
    }
    /**
     * @returns {KunDayTime}
     */
    manager() { return KunDayTime.manager(); }
    /**
     * @returns {KunClock}
     */
    runEvent(){
        if( this._event ){
            $gameTemp.reserveCommonEvent(this._event);
        }
        return this;
    }
    /**
     * @returns {Boolean}
     */
    active() { return this._active; }
    /**
     * @param {Boolean} active 
     * @returns {KunClock}
     */
    toggle(active = false) {
        this._active = active;
        return this;
    }
    /**
     * @returns {Number}
     */
    cycle() {
        return this.manager().ticks();
    }
    /**
     * @returns {Number}
     */
    time() {
        return this.hour() * 100 + this.minute();
    }
    /**
     * @returns {Number}
     */
    hour() {
        return this._hour;
    }
    /**
     * @returns {Number}
     */
    minute() {
        return this._minute;
    }
    /**
     * @param {Number} hour
     * @param {Number} minute 
     * @returns {KunClock}
     */
    set(hour = 0, minute = 0) {
        const active = this.active();
        this.toggle(false);
        const daytime = this.manager();
        const timevar = daytime.timevar();
        this._hour = (hour || 0) % daytime.hours();
        this._minute = (minute || 0) % daytime.minutes();
        if (timevar) {
            $gameVariables.setValue(timevar, this.time());
        }
        this.toggle(active);

        return this;
    }
    /**
     * @returns {Boolean}
     */
    tick() { return !(++this._ticks % this.cycle()); }
    /**
     * @returns {Boolean}
     */
    update() {
        const daytime = this.manager();
        if (this.active() && this.tick()) {
            const minute = (this.minute() + 1) % daytime.minutes();
            const hour = minute && this.hour() || (this.hour() + 1) % daytime.hours();
            this.set(hour, minute);
            //KunDayTime.DebugLog( this.toString() );
            if (!hour) {
                this.runEvent();
                //hour 00:00 update calendar
                daytime.calendar().update();
            }

            return true;
        }
        return false;
    }
}


/**
 * @class {KunCalendar}
 */
class KunCalendar {
    /**
     * @param {Number} day 
     * @param {Number} month 
     * @param {Number} year 
     */
    constructor(day = 0, month = 0, year = 0) {
        this._day = day || 0;
        this._month = month || 0;
        this._year = year || 0;
        this._rules = [];
    }
    /**
     * @returns {Number}
     */
    day() {
        return this._day;
    }
    /**
     * @returns {Number}
     */
    month() {
        return this._month;
    }
    /**
     * @returns {Number}
     */
    year() {
        return this._year;
    }
    /**
     * @returns {Boolean}
     */
    update() {
        return false;
    }
    /**
     * @returns {KunCalendar}
     */
    static today() {
        const date = new Date();
        return new KunCalendar(date.getDate(), date.getMonth(), date.getFullYear());
    }
}

/**
 * 
 */
function KunTime_RegisterMapUpdate() {


    const _KunTime_SceneMap_Update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        //update vanilla
        _KunTime_SceneMap_Update.call(this);
        //update clock
        this.onUpdateDayTime();
    };
    /**
     * 
     */
    Scene_Map.prototype.onUpdateDayTime = function () {
        if (KunDayTime.update()) {
            //hour change funcitons
            this.onTimeChange();
        }
    }
    /**
     * 
     */
    Scene_Map.prototype.onTimeChange = function () {
        //define here all other plugins' hooks
        if (this.onUpdateDayTime()) {
            KunMaps.DebugLog('Map layer timer updated');
        }
        KunDayTime.DebugLog(`Time is ${KunDayTime.manager().clock().toString()}`);
    }
}

/**
 * 
 */
function KunTime_SetupEscapeChars() {
    //Window_Base.prototype.JayaKSetup_escapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    var _KunTime_Escape_Characters = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {

        var parsed = _KunTime_Escape_Characters.call(this, text);

        parsed = parsed.replace(/\{KUNTIME\}/g, function () {
            const time = KunDayTime.manager().clock();
            return time.toString(KunDayTime.manager().formatAmPm());
        }.bind(this));

        return parsed;
    };
}
/**
 * 
 */
function KunTime_SetupCommands() {
    const _KunTime_GameInterpreter_PluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunTime_GameInterpreter_PluginCommand.call(this, command, args);
        if (KunDayTime.command(command)) {
            if (args && args.length) {
                switch (args[0]) {
                    case 'set':
                    case 'reset':
                        const time = args[1] && args[1].split(':').map(value => parseInt(value)).filter(n => !isNaN(n)) || [];
                        KunDayTime.manager().reset(time[0] || 0, time[1] || 0, args.includes('start'));
                        args.includes('update') && KunDayTime.manager().updateScene();
                        break;
                    case 'newday':
                        //run new day event
                        KunDayTime.manager().clock().runEvent();
                        break;
                    case 'update':
                        if (args.length) {
                            const clock = KunDayTime.manager().clock();
                            const time = args[1].split(':').map( t => parseInt(t));
                            const resume = args.includes('resume');
                            clock.set(
                                //allow to import hour from game variable
                                args.includes('import') && time[0] && $gameVariables.value(time[0]) || time[0],
                                //set minute or leave as if
                                time[1] || clock.minute(),
                            );
                            (resume || clock.active()) && KunDayTime.manager().updateScene();
                        }
                        break;
                    case 'hour':
                        const gamevar = parseInt(args[1] || 0);
                        if (gamevar) {
                            $gameVariables.setValue(gamevar, KunDayTime.manager().clock().hour());
                        }
                        break;
                    case 'start':
                    case 'resume':
                        const value = args[1] && !isNaN(args[1]) && $gameVariables.value(parseInt(args[1])) || KunDayTime.manager().timevar(true);
                        KunDayTime.manager().start(value);
                        args.includes('update') && KunDayTime.manager().updateScene();
                        break;
                    case 'stop':
                    case 'pause':
                        KunDayTime.manager().stop();
                        break;
                }
            }
        }
    }
}


(function () {

    KunDayTime.manager();

    KunTime_RegisterMapUpdate();

    KunTime_SetupCommands();

    KunTime_SetupEscapeChars();

})();