//=============================================================================
// KunDayTime.js
//=============================================================================
/*:
 * @plugindesc Set a Day-Night cycle timer.
 * @author JayaKun
 * 
 * @help
 * Create a Day-Night Cycle timer
 * 
 * COMMANDS
 *      KunDayTime start
 *          start/resume day-night cycle
 *      KunDayTime stop
 *          stop day-night cycle
 *      KunDayTime set hour|system
 *          set the time at the specified hour
 *          set the time at the current system hour
 *      KunDayTime forceUpdate
 *          Force an update
 *      KunDayTime fps [ minutes ] [ import ]
 *          set the frames per second and the minutes per hour in game to adjust day-night cycle speed
 *          define import flag to import spm and mph values from specified game Variables
 *      KunDayTime debug
 *          toggle debug mode
 * 
 * 
 * 
 * @param debug
 * @text Debug Data
 * @type Boolean
 * @desc Show debug Data and console output
 * @default false
 * 
 * @param variable
 * @text Variable ID
 * @desc Select the Variable ID which will run the clock timer, from 00 hs to 23hs each tick
 * @type Variable
 * @default 0
 * 
 * @param minutes
 * @text Minutes per Hour
 * @desc Required number of minutes to change to the next hour. From 10 mph to 60 mph (realtime)
 * @type Number
 * @min 10
 * @max 60
 * @default 10
 * 
 * @param fps
 * @text Frames per Second
 * @desc frames per second to update the timer ticks and the transitions
 * @type Number
 * @min 10
 * @max 120
 * @default 60
 * 
 * @param display
 * @text Display Mode
 * @desc Set the time display mode 12 or 24 hs
 * @type select
 * @option 12
 * @option 24
 * @default 12
 * 
 * @param syncRealTime
 * @text Sync Real Time
 * @type boolean
 * @desc Set the current System Time on each game load/newgame
 * @default false
 * 
 * @param mapMeta
 * @text Map Meta
 * @type string
 * @desc Set the map meta to import a time profile
 * @default KunDayTime
 * 
 * @param profiles
 * @text Daytime Profiles
 * @desc List here the colleciton of the timeset profiles
 * @type struct<Profile>[]
 */
/*~struct~Profile:
 * @param name
 * @text Name
 * @type Text
 * @default Default
 * 
 * @param timeSets
 * @text Time Sets
 * @desc Describe all timeset colors
 * @type struct<TimeSet>[]
 */
/*~struct~TimeSet:
 * @param tag
 * @text Tag
 * @desc Daytime Tag Name (not used in editor)
 * @type Text
 * @default New Daytime
 * 
 * @param time
 * @text Hour
 * @desc Set the hour where this color layer applies from 0 to 23 hs
 * @type Number
 * @min 0
 * @max 23
 * @default 0
 * 
 * @param red
 * @text Red Color
 * @desc RBG Red channel from -255 to 255
 * @type Number
 * @min -255
 * @max 255
 * @default 0
 * 
 * @param green
 * @text Green Color
 * @desc RBG Green channel from -255 to 255
 * @type Number
 * @min -255
 * @max 255
 * @default 0
 * 
 * @param blue
 * @text Blue Color
 * @desc RBG Blue channel from -255 to 255
 * @type Number
 * @min -255
 * @max 255
 * @default 0
 * 
 * @param gray
 * @text Gray Color
 * @desc Gray Saturation Channel
 * @type Number
 * @min 0
 * @max 255
 * @default 0
 * 
 * @param sfx
 * @text Ambient Fx profile
 * @type String
 * @desc requires KunSoundThemes
 * 
 */
/******************************************************************************************************************
 * Static Module
 *****************************************************************************************************************/ 
function KunDayTime() {
    throw `${this.constructor.name} is a Static Class`;
};
/**
 * @returns KunDaytime Initializer
 */
KunDayTime.Initialize = function () {

    var parameters = KunDayTime.importParameters();

    this._debug = parameters.debug === 'true';
    this._variable = parseInt(parameters.variable);
    this._fps = parseInt(parameters.fps);
    this._minutes = parseInt(parameters.minutes);
    this._ticks = 0;
    this._displayMode = parseInt(parameters.display) === 24;
    this._sycnTime = parameters.syncRealTime === 'true';
    this._mapMeta = parameters.mapMeta || '';
    this._current = '';
    this._colorTomes = [];
    this._profiles = {};

    return this.ImportProfiles(parameters.profiles.length > 0 ? JSON.parse(parameters.profiles) : []);
};
/**
 * @returns Object
 */
KunDayTime.importParameters = function () {
    return PluginManager.parameters('KunDayTime');
};
/**
 * @param {Number} fps 
 * @param {Number} minutes 
 * @returns KunDayTime
 */
KunDayTime.setFPS = function (fps, minutes) {
    if (typeof fps === 'number' && fps) {
        this._fps = parseInt(fps);
    }
    if (typeof minutes === 'number' && minutes) {
        this._minutes = parseInt(minutes);
    }
    return this;
};
/**
 * @returns {Boolean}
 */
KunDayTime.debug = function () {
    return this._debug;
};

KunDayTime.dump = function () {
    return _controller;
};
/**
 * @returns Boolean
 */
KunDayTime.KunSoundThemes = function () {
    return typeof KunSoundThemes === 'function';
};
/**
 * @param {String} profile 
 * @returns Boolean
 */
KunDayTime.hasProfile = function (profile) {
    return typeof profile === 'string' && profile.length > 0 && this._profiles.hasOwnProperty(profile);
};
/**
 * @returns {KunDayTimeProfile}
 */
KunDayTime.getProfile = function () {
    return this.hasProfile(this._current) ? this.profiles()[this._current] : null;
};
/**
 * @returns KunDayTime
 */
KunDayTime.clear = function(){
    return this.stopSoundTheme();
};
/**
 * @param {String} profile 
 * @returns KunDayTime
 */
KunDayTime.setProfile = function (profile) {
    this._current = this.hasProfile(profile) ? profile : '';
    return this;
};
/**
 * 
 */
KunDayTime.importMapProfile = function () {
    if( this.hasMapMeta()){
        KunDayTime.setProfile(this.importMapMeta()).refresh();
    }
};
/**
 * @returns String
 */
KunDayTime.mapMeta = function(){
    return this._mapMeta;
};
/**
 * @returns Boolean
 */
KunDayTime.hasMapMeta = function(){
    return this._mapMeta.length > 0;
};
/**
 * @returns String
 */
KunDayTime.importMapMeta = function(){
    if( this.hasMapMeta()){
        var profiles = [];
        if ($dataMap !== null && $dataMap.hasOwnProperty('meta')) {
            Object.keys($dataMap.meta).forEach(function (meta) {
                var _type = meta.split(' ');
                if (_type[0] === KunDayTime.mapMeta() && _type.length > 1) {
                    profiles.push(_type[1]);
                }
            });
        }    
        var selected = profiles.length > 1 ? Math.floor(Math.random() * profiles.length) : 0;
        return profiles.length ? profiles[selected] : '';
    }
    return '';
};
/**
 * @returns KunDayTime
 */
KunDayTime.refresh = function () {
    return this.stopAmbientFx().updateTransition(this.getTime());
};
/**
 * 
 * @param {Boolean} list 
 * @returns KunDayTimeProfile[] | Object
 */
KunDayTime.profiles = function (list) {
    return typeof list === 'boolean' && list ? Object.values(this._profiles) : this._profiles;
};
/**
 * @returns {Boolean}
 */
KunDayTime.syncTime = () => this._syncTime;
/**
 * @param {KunDayTimeProfile} profile 
 * @returns KunDayTime
 */
KunDayTime.addProfile = function (profile) {
    if (profile instanceof KunDayTimeProfile && !this._profiles.hasOwnProperty(profile.name())) {
        this._profiles[profile.name()] = profile;
    }
    return this;
};
/**
 * @param {Boolean} format
 * @param {Boolean} showMinutes
 * @returns Number
 */
KunDayTime.time = function (format, showMinutes) {

    var t = this.getTime();

    if (format) {
        var h = t % this.getTimeFormat();
        var part = this.getTimeFormat() < 24 ? (t > 11 ? 'pm' : 'am') : ' hs';
        if (showMinutes && this._minutes > 0) {
            var m = this.getMinute();
            //var m = parseInt( (this._ticks / this._minutes) * ( 60 / this._minutes ) ).toString().padStart(2,'0');
            return `${h.toString().padStart(2, '0')} : ${m.toString().padStart(2, '0')} ${part}`;
        }
        else {
            return `${h.toString().padStart(2, '0')} ${part}`;
        }
    }

    return t;
};
/**
 * @returns {KunDayTime}
 */
KunDayTime.updateTransition = function (time) {
    var profile = this.getProfile();
    //console.log( profile );
    if (profile !== null) {
        var colorTone = profile.createTransition(time);
        KunDayTime.ScreenTint(colorTone, this._fpsTransition);
        profile.playSfx(time);
        if (this._debug) {
            KunDayTime.DebugLog(`${profile.name()} profile ${time}hs RGBG[${colorTone.toString()}]`);
        }
    }
    return this;
};
/**
 * @returns Number
 */
KunDayTime.getTimeVar = function () {
    return this._variable;
};
/**
 * @returns Number
 */
KunDayTime.getTime = function () {
    return $gameVariables.value(this._variable);
};
/**
 * @returns Number
 */
KunDayTime.getMinute = function () {
    return this._minutes > 0 ? parseInt((this._ticks / this._minutes) * (60 / this._minutes)) : 0;
};
/**
 * @param {Number} hour if set, timer will be set to this hour, otherwise, it will increase the current time by 1 hour
 * @returns {Number}
 */
KunDayTime.setTime = function (hour) {
    var time = (hour || this.getTime() + 1) % 24;
    $gameVariables.setValue(this._variable, time);
    return time;
};
/**
 * @returns Number
 */
KunDayTime.getTimeFormat = function () {
    return this._displayMode ? 24 : 12;
};
/**
 * @returns {KunDayTime}
 */
KunDayTime.next = function () {
    if (this._variable > 0) {
        return this.updateTransition(this.setTime());
    }
    return this;
};
/**
 * @returns Boolean
 */
KunDayTime.update = function () {
    this._ticks = ++this._ticks % (this._fps * this._minutes);
    if (this._ticks === 0) {
        this.next();
        return true;
    }
    if (this._debug && this._ticks % this._minutes === 0) {
        KunDayTime.DebugLog(this.time(true, true));
    }
    return false;
};
/**
 * @returns Number
 */
KunDayTime.getSystemHour = function () {
    return (new Date()).getHours();
};
/**
 * KunSoundThemes integration plugin
 * @param {String} theme 
 */
KunDayTime.playSoundTheme = function (theme) {
    if ( KunDayTime.KunSoundThemes()) {
        KunSoundThemes.play( theme , true );
        this.DebugLog(`Playing ${theme} selection ...`);
    }
};
/**
 * @returns {KunDayTime}
 */
KunDayTime.stopSoundTheme = function () {
    if (KunDayTime.KunSoundThemes()) {
        KunSoundThemes.stop();
    }
    return this;
}
/**
 * 
 * @param {Number[]} colorTone [ red , green , blue , gray ]
 * @param {*} frames frames to transition, 60 by default
 * @returns {KunDayTime}
 */
KunDayTime.ScreenTint = function (colorTone, frames) {
    if (Array.isArray(colorTone) && colorTone.length > 3) {
        $gameScreen.startTint(colorTone, frames || 60);
    }
    return this;
};
/**
 * @param {String|Object} message 
 */
KunDayTime.DebugLog = function (message) {
    if (this.debug()) {
        console.log('[ KunDayTime Debug ] ' + message);
    }
}
/**
 * @param {String} message 
 * @returns {KunDayTime}
 */
KunDayTime.Notify = function (message) {

    if (typeof kun_notify === 'function') {
        kun_notify(message);
    }
    else {
        KunDayTime.DebugLog(message);
    }
    return this;
};

/**
 * @param {String} input 
 * @returns Object[]
 */
KunDayTime.ParseLayerColors = function (input) {

    var output = [];
    var layers = typeof input === "string" && input.length ? JSON.parse(input) : [];

    for (var i = 0; i < layers.length; i++) {
        var lc = JSON.parse(layers[i]);
        output.push({
            'time': parseInt(lc.time),
            'red': parseInt(lc.red),
            'green': parseInt(lc.green),
            'blue': parseInt(lc.blue),
            'gray': parseInt(lc.gray),
        });
    }

    return output;
};
/**
 * @param {String} input 
 * @returns {KunDayTime}
 */
KunDayTime.ImportProfiles = function (input) {
    if (Array.isArray(input)) {
        input.filter(tpl => tpl.length > 0).map(tpl => JSON.parse(tpl)).forEach(function (tpl) {
            var profile = new KunDayTimeProfile(tpl.name);
            (tpl.timeSets.length > 0 ? JSON.parse(tpl.timeSets).map(ts => JSON.parse(ts)) : [ /* empty */]).forEach(function (ts) {
                profile.addTimeSet(
                    ts.tag,
                    parseInt(ts.time),
                    parseInt(ts.red),
                    parseInt(ts.green),
                    parseInt(ts.blue),
                    parseInt(ts.gray),
                    ts.sfx);
            });
            if (profile) {
                KunDayTime.addProfile(profile);
            }
        });
    }
    return this;
};


/******************************************************************************************************************
 * @param {String} name 
 * @returns KunDayTimeProfile
 *****************************************************************************************************************/
function KunDayTimeProfile(name) {

    this._name = name.toLowerCase().replace(/([\s\_]+)/g, '-');
    this._timeSets = {};

    return this;
};
/**
 * @returns String
 */
KunDayTimeProfile.prototype.toString = function () {
    return this.name();
};
/**
 * @returns String
 */
KunDayTimeProfile.prototype.name = function () {
    return this._name;
};
/**
 * @param {String} tag 
 * @returns Boolean
 */
KunDayTimeProfile.prototype.has = function (tag) {
    return typeof tag === 'string' && this._timeSets.hasOwnProperty(tag);
};
/**
 * @param {Number} time 
 * @returns Number
 */
KunDayTimeProfile.prototype.next = function (time) {
    var ts = this.timeSets(true);
    for (var i = 0; i < ts.length; i++) {
        if (time < ts[i].time) {
            return i;
        }
    }
    return ts.length - 1;
}
/** 
 * @param {Number} time 
 * @returns STring
 */
KunDayTimeProfile.prototype.createTransition = function (time) {

    var ts = this.timeSets(true);

    var t = this.next(time);
    //console.log( `TRANSITION ${ts.toString()}  AT ${t}HS`) ;
    if (t === 0) {
        //last to first
        return this.exportTransition(ts[ts.length - 1], ts[t], time);
    }
    else {
        return this.exportTransition(ts[t - 1], ts[t], time);
    }
};
/**
 * @param {Object} from 
 * @param {Object} to 
 * @param {Number} time
 * @returns Array [red , green, blue, gray ]
 */
KunDayTimeProfile.prototype.exportTransition = function (from, to, time) {
    //console.log( `FROM ${from.toString()} TO ${to.toString()} AT ${time}` );
    if (this.has(from.tag) && this.has(to.tag)) {
        var _rate = Math.floor(this.createInterpolation(from.time, to.time, time) * 100) / 100;
        var _to = this.colorTone(to.tag);
        var _from = this.colorTone(from.tag);
        if (_rate > 0) {
            var mixed = [];
            for (i = 0; i < _from.length; i++) {
                mixed.push(_to[i] - Math.floor((_to[i] - _from[i]) * _rate));
            }
            return mixed;
        }
        else {
            return _to;
        }
    }
    return this.colorTone();
};
/**
 * @param {Number} from 
 * @param {Number} to 
 * @param {Number} value 
 * @returns 
 */
KunDayTimeProfile.prototype.createInterpolation = function (from, to, value) {
    switch (true) {
        case to - from === 0:
            return 0;
        case from > to && from > value:
            return 1 - ((24 + value) - from) / ((24 + to) - from);
        case from > to:
            return 1 - (value - from) / ((24 + to) - from);
        default:
            return 1 - (value - from) / (to - from);
    }
};
/**
 * @param {String} tag
 * @returns Number[] [r,g,b,g]
 */
KunDayTimeProfile.prototype.colorTone = function (tag) {
    return this.has(tag) ? [
        this._timeSets[tag].red,
        this._timeSets[tag].green,
        this._timeSets[tag].blue,
        this._timeSets[tag].gray,
    ] : [0, 0, 0, 0];
};
/**
 * @param {Boolean} list 
 * @returns Object[] | Object
 */
KunDayTimeProfile.prototype.timeSets = function (list) {
    return typeof list === 'boolean' && list ? Object.values(this._timeSets) : this._timeSets;
};
/**
 * @returns Number
 */
KunDayTimeProfile.prototype.count = function () {
    return this.timeSets(true).length;
};
/**
 * Register a new timeset
 * @param {String} tag 
 * @param {Number} time 
 * @param {Number} red 
 * @param {Number} green 
 * @param {Number} blue 
 * @param {Number} gray 
 * @param {String} sfx
 * @returns KunDayTimeProfile
 */
KunDayTimeProfile.prototype.addTimeSet = function (tag, time, red, green, blue, gray, sfx) {

    var _name = tag.toLowerCase().replace(/([\s\_]+)/g, '-');

    var _lastTime = this._timeSets.length > 0 ? this._timeSets[this._timeSets.length - 1].time : -1;

    if (!this._timeSets.hasOwnProperty(_name) && time > _lastTime) {
        this._timeSets[_name] = {
            'tag': _name,
            'time': parseInt(time),
            'red': parseInt(red),
            'green': parseInt(green),
            'blue': parseInt(blue),
            'gray': parseInt(gray),
            'sfx': sfx || '',
            'toString': function () {
                return this.tag;
            }
        };
    }

    return this;
};
/**
 * @param {Number} time 
 * @returns KunDayTimeProfile
 */
KunDayTimeProfile.prototype.playSfx = function (time) {
    if (this.count() > 0) {
        var sets = this.timeSets(true);
        var sfx = sets
            .filter((ts) => ts.time <= time && ts.sfx.length > 0)
            .map(ts => ts.sfx);

        if (sfx.length === 0) {
            //no sound set? then try searching from the last
            sfx = sets
                .filter((ts) => ts.time > time && ts.sfx.length > 0)
                .map(ts => ts.sfx);

        }
        sfx.reverse();

        if (sfx.length > 0) {
            KunDayTime.playSoundTheme(sfx[0]);
        }
    }
    return this;
};
/******************************************************************************************************************
 * @param {Number} limit 
 * @param {String} profile 
 * @returns KunDayTimeController
 *****************************************************************************************************************/
function KunDayTimeController(limit) {

    this._ticks = 0;
    this._limit = limit || 60;
    this._minute = 0;
    this._hour = 0;

    return this;
}
/**
 * @param {Number} timeVar 
 * @param {Number} minuteVar 
 * @returns KunDayTimeController
 */
KunDayTimeController.prototype.export = function (timeVar, minuteVar) {
    if (typeof timeVar === 'number' && timeVar > 0) {
        $gameVariables.setValue(timeVar, this._hour);
    }
    if (typeof minuteVar === 'number' && minuteVar > 0) {
        $gameVariables.setValue(minuteVar, this._minute);
    }
    return this;
};
/**
 * @returns Boolean
 */
KunDayTimeController.prototype.update = function () {
    this._ticks = (this._ticks + 1) % this._limit;
    if (this._ticks === 0) {
        this._minute = (this._minute + 1) % 60;
        if (this._minute === 0) {
            this._hour = (this._hour + 1) % 24;
            return true;
        }
    }
    return false;
};

/**
 * 
 */
function KunDayTime_SetupCommands() {
    //override vanilla
    var GameInterpreterPluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        GameInterpreterPluginCommand.call(this, command, args);
        if (command === 'KunDayTime') {
            //override with plugin command manager
            if (args.length) {
                switch (args[0]) {
                    case 'timeFrame':
                        var fps = args.length > 1 ? parseInt(args[1]) : 60;
                        var minutes = args.length > 2 ? parseInt(args[2]) : 0;
                        if (args.length > 3 && args[3] === 'import') {
                            fps = $gameVariables.value(fps);
                            minutes = $gameVariables.value(minutes);
                        }
                        KunDayTime.setFPS(fps, minutes);
                        break;
                    case 'set':
                        if (args.length > 1) {
                            var time = args[1] === 'system' ? KunDayTime.getSystemHour() : (!Number.isNaN(args[1]) ? parseInt(args[1]) : 0);
                            KunDayTime.updateTransition(KunDayTime.setTime(time));
                        }
                        break;
                    case 'debug':
                        KunDayTime.Set.Debug(!KunDayTime.debug());
                        break;
                    case 'start':
                        KunDayTime.run()
                        break;
                    case 'stop':
                        KunDayTime.stopTimer()
                        break;
                    case 'forceUpdate':
                        KunDayTime.refresh();
                        break;
                }
            }
        }
    };
}
/**
 * 
 */
function KunDayTime_SetupSceneMap() {
    var _KunDayTime_Scene_Map_Ready =  Scene_Map.prototype.isReady;
    /**
     * @returns Boolean
     */
    Scene_Map.prototype.isReady = function () {
        // stop any residual content before playing the new map
        //maybe should be posted on map unloading events
        KunDayTime.clear(); 
        if( _KunDayTime_Scene_Map_Ready.call(this) ){
            //OVERRIDE
            KunDayTime.importMapProfile();
            //KunDayTime.setProfile(this.importMapProfile()).refresh();
            return true;
        }
        return false;

        //VANILLA CODE
        /*if (!this._mapLoaded && DataManager.isMapLoaded()) {
            this.onMapLoaded();
            this._mapLoaded = true;

        }
        return this._mapLoaded && Scene_Base.prototype.isReady.call(this);*/
    };
    /**
     * @returns String
     */
    Scene_Map.prototype.importMapProfile = function () {
        var profiles = [];
        if ($dataMap !== null && $dataMap.hasOwnProperty('meta')) {
            Object.keys($dataMap.meta).forEach(function (meta) {
                var _type = meta.split(' ');
                if (_type[0] === 'KunDayTime' && _type.length > 1) {
                    profiles.push(_type[1]);
                }
            });
        }
        var selected = profiles.length > 1 ? Math.floor(Math.random() * profiles.length) : 0;
        return profiles.length ? profiles[selected] : '';
    }

    var _KunDayTime_MapUpdate = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        _KunDayTime_MapUpdate.call(this);

        if (KunDayTime.update()) {
            //update the DayTimeController
            //
        }
    };
}
/**
 * 
 */
function KunDayTime_SetupEscapeChars() {
    var _ConvertEscapeCharactersOriginal = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        //parse first the vanilla strings
        var parsed = _ConvertEscapeCharactersOriginal.call(this, text);

        //return the current special message
        parsed = parsed.replace(/\x1bTIME/gi, function () {
            return KunDayTime.time(true);
        }.bind(this));

        //return the current special message
        parsed = parsed.replace(/\x1bFULL_TIME/gi, function () {
            return KunDayTime.time(true, true);
        }.bind(this));

        return parsed;
    };
};

/* PLUGIN SETUP */
(function () {
    KunDayTime.Initialize();
    KunDayTime_SetupCommands();
    KunDayTime_SetupEscapeChars();
    KunDayTime_SetupSceneMap();
})();



