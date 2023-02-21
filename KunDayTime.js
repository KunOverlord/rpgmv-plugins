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
 * @type Boolean
 * @desc Set the current System Time on each game load/newgame
 * @default false
 * 
 * @param profiles
 * @text Daytime Profiles
 * @desc List here the colleciton of the timeset profiles
 * @type struct<Profile>[]
 * 
 * @param kunAmbientFx
 * @text KunAmbientFX Compatibility
 * @desc Play KunAmbientFx Ambient profile selection defined by tag
 * @type Boolean
 * @default false
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
 * @desc requires KunAmbientFX
 * 
 */

/**
 * @description KUN Modules
 * @type KUN
 */
var KUN = KUN || {};

function KunDayTime(){

    var _controller = {
        'debug': false,
        'variable': 0,
        
        'fps': 60,
        'ticks':0,
        'minutes': 60,
        'displayMode': false,
        'syncTime': false,
        'kunAmbientFx':false,
        'colorTones':[/* define here scene color tones */],
        'current': '',
        'profiles':{
            //profiles
        },
    };

    this.Set = {
        'Debug': function( debug ){ _controller.debug = debug || false; },
        'TimeVar': function( varId ){ _controller.variable = parseInt(varId) || 0; },
        'Display24': function( display ){ _controller.displayMode = display; },
        'SyncRealTime': function( sync ){ _controller.syncTime = sync || false; },
        'AmbientFX': sfx => _controller.kunAmbientFx = typeof sfx === 'boolean' && sfx,
    };
    /**
     * 
     * @param {Number} fps 
     * @param {Number} minutes 
     * @returns KunDayTime
     */
    this.setFPS = function( fps , minutes ){
        if( typeof fps === 'number' && fps ){
            _controller.fps = parseInt( fps );
        }
        if( typeof minutes === 'number' && minutes ){
            _controller.minutes = parseInt( minutes );
        }
        return this;
    };
    /**
     * @returns {Boolean}
     */
    this.debug = () => _controller.debug;

    this.dump = () => _controller;
    /**
     * @returns Boolean
     */
    this.kunAmbientFxSupport = () => _controller.kunAmbientFx;
    /**
     * @returns {KunDayTimeProfile}
     */
    this.getProfile = function(){
        return _controller.current.length > 0 && this.profiles().hasOwnProperty(_controller.current) ? this.profiles()[_controller.current] : null;
    };
    /**
     * @param {String} profile 
     * @returns KunDayTime
     */
    this.setProfile = function( profile ){
        _controller.current = typeof profile === 'string' && profile.length ? profile : '';
        return this;
    };
    /**
     * @returns KunDayTime
     */
    this.refresh = function() {
        KunDayTime.stopAmbientFx();
        this.updateTransition(this.getTime());
        return this;
    };
    /**
     * 
     * @param {Boolean} list 
     * @returns KunDayTimeProfile[] | Object
     */
    this.profiles = function( list ){
        return typeof list === 'boolean' && list ? Object.values( _controller.profiles ) : _controller.profiles;
    };
    /**
     * @returns {Boolean}
     */
    this.syncTime = () => _controller.syncTime;
    /**
     * @param {KunDayTimeProfile} profile 
     * @returns KunDayTime
     */
    this.addProfile = function( profile ){
        if( profile instanceof KunDayTimeProfile && !_controller.profiles.hasOwnProperty( profile.name( ) ) ){
            _controller.profiles[profile.name()] = profile;
        }
        return this;
    };
    /**
     * @param {Boolean} format
     * @param {Boolean} showMinutes
     * @returns Number
     */
    this.time = function( format , showMinutes ){
        
        var t = this.getTime();
        
        if( format ){
            var h = t % this.getTimeFormat();
            var part = this.getTimeFormat() < 24 ? (t > 11 ? 'pm' : 'am') : ' hs';
            if( showMinutes && _controller.minutes > 0 ){
                var m = this.getMinute();
                //var m = parseInt( (_controller.ticks / _controller.minutes) * ( 60 / _controller.minutes ) ).toString().padStart(2,'0');
                return `${h.toString().padStart(2,'0')} : ${m.toString().padStart(2,'0')} ${part}`;
            }
            else{
                return `${h.toString().padStart(2,'0')} ${part}`;
            }
        }

        return t;
    };
    /**
     * @returns {KunDayTime}
     */
     this.updateTransition = function( time ){
        var profile = this.getProfile();
        //console.log( profile );
        if( profile !== null ){
            var colorTone = profile.createTransition( time );
            KunDayTime.ScreenTint( colorTone , _controller.fpsTransition );
            profile.playSfx( time );
            if( _controller.debug ){
                KunDayTime.DebugLog( `${profile.name()} profile ${time}hs RGBG[${colorTone.toString()}]` );
            }
        }
        return this;
    };
    /**
     * @returns Number
     */
    this.getTimeVar = () => _controller.variable;
    /**
     * @returns Number
     */
    this.getTime = () => $gameVariables.value( _controller.variable );
    /**
     * @returns Number
     */
    this.getMinute = () => _controller.minutes > 0 ? parseInt( (_controller.ticks / _controller.minutes) * ( 60 / _controller.minutes ) ) : 0;
    /**
     * @param {Number} hour if set, timer will be set to this hour, otherwise, it will increase the current time by 1 hour
     * @returns {Number}
     */
    this.setTime = function( hour ){
        var time = ( hour || this.getTime( ) + 1 ) % 24;
        $gameVariables.setValue( _controller.variable , time );
        return time;
    };
    /**
     * @returns Number
     */
    this.getTimeFormat = () => _controller.displayMode ? 24 : 12;
    /**
     * @returns {KunDayTime}
     */
    this.next = function(){
        if( _controller.variable > 0 ){
            return this.updateTransition( this.setTime( ) );    
        }
        return this;
    };
    /**
     * @returns Boolean
     */
    this.update = function(){
        _controller.ticks = ++_controller.ticks % (_controller.fps * _controller.minutes);
        if( _controller.ticks === 0 ){
            this.next();
            return true;
        }
        if( _controller.debug && _controller.ticks % _controller.minutes === 0 ){
            KunDayTime.DebugLog(this.time(true,true));
        }
        return false;
    };
    /**
     * @returns Number
     */
    this.getSystemHour = () => ( new Date() ).getHours();
}
/**
 * @param {String} name 
 * @returns 
 */
function KunDayTimeProfile( name ){

    var _profile = {
        'name': name.toLowerCase().replace(/([\s\_]+)/g,'-'),
        'timeSets':{},
    };
    /**
     * @returns String
     */
    this.toString = () => _profile.name;
    /**
     * @returns String
     */
    this.name = () => _profile.name;
    /**
     * @param {String} tag 
     * @returns Boolean
     */
    this.has = tag => typeof tag === 'string' && _profile.timeSets.hasOwnProperty( tag );
    /**
     * @param {Number} time 
     * @returns Number
     */
    this.next = function( time ){
        var ts = this.timeSets( true );
        for(var i = 0; i < ts.length ; i++ ){
            if( time < ts[i].time ){
                return i;
            }
        }
        return ts.length - 1;
    }
    /** 
     * @param {Number} time 
     * @returns STring
     */
    this.createTransition = function( time ){
        
        var ts = this.timeSets( true );

        var t = this.next( time );
        //console.log( `TRANSITION ${ts.toString()}  AT ${t}HS`) ;
        if( t === 0 ){
            //last to first
            return this.exportTransition( ts[ts.length-1], ts[t], time);
        }
        else{
            return this.exportTransition( ts[t-1] , ts[t], time );
        }
    };
    /**
     * @param {Object} from 
     * @param {Object} to 
     * @param {Number} time
     * @returns Array [red , green, blue, gray ]
     */
    this.exportTransition = function( from , to , time ){
        //console.log( `FROM ${from.toString()} TO ${to.toString()} AT ${time}` );
        if( this.has( from.tag ) && this.has( to.tag ) ){
            var _rate = Math.floor( this.createInterpolation( from.time , to.time , time ) * 100 ) / 100;
            var _to = this.colorTone( to.tag );
            var _from = this.colorTone( from.tag );
            if( _rate > 0 ){
                var mixed = [];
                for( i = 0 ; i < _from.length ; i++ ){
                    mixed.push( _to[ i ] - Math.floor( ( _to[i] - _from[i] ) * _rate ) );
                }
                return mixed;
            }
            else{
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
    this.createInterpolation = function( from , to , value ){
        switch( true ){
            case to - from === 0:
                return 0;
            case from > to && from > value:
                return 1 - ( ( 24 + value ) - from ) / ( ( 24 + to ) - from );
            case from > to:
                return 1 - ( value - from ) / ( ( 24 + to ) - from );
            default:
                return 1 - ( value - from ) / ( to - from );
        }
    };
    /**
     * @param {String} tag
     * @returns Number[] [r,g,b,g]
     */
    this.colorTone = function( tag ){
        return this.has( tag ) ? [
            _profile.timeSets[tag].red,
            _profile.timeSets[tag].green,
            _profile.timeSets[tag].blue,
            _profile.timeSets[tag].gray,
        ] : [0,0,0,0];
    };
    /**
     * @param {Boolean} list 
     * @returns Object[] | Object
     */
    this.timeSets = function( list ){
        return typeof list === 'boolean' && list ? Object.values( _profile.timeSets ) : _profile.timeSets;
    };
    /**
     * @returns Number
     */
    this.count = function(){
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
    this.addTimeSet = function( tag , time , red, green, blue , gray , sfx ){

        var _name = tag.toLowerCase().replace(/([\s\_]+)/g,'-');

        var _lastTime = _profile.timeSets.length > 0 ? _profile.timeSets[_profile.timeSets.length-1].time : -1;

        if( !_profile.timeSets.hasOwnProperty(_name ) && time > _lastTime ){
            _profile.timeSets[_name] = {
                'tag':_name,
                'time': parseInt( time ),
                'red': parseInt( red ),
                'green': parseInt( green ),
                'blue': parseInt( blue ),
                'gray': parseInt( gray ),
                'sfx': sfx || '',
                'toString': function(){
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
    this.playSfx = function( time ){
        if( this.count() > 0 ){
            var sets = this.timeSets( true );
            var sfx = sets
                .filter( (ts) => ts.time <= time && ts.sfx.length > 0 )
                .map( ts => ts.sfx );
            
            if( sfx.length === 0 ){
                //no sound set? then try searching from the last
                sfx = sets
                    .filter( (ts) => ts.time > time && ts.sfx.length > 0 )
                    .map( ts => ts.sfx );
                    
            }
            sfx.reverse();

            if( sfx.length > 0 ){
                KunDayTime.playAmbientFx( sfx[0] );
            }
        }
        return this;
    };

    return this;
};
/**
 * @param {Number} limit 
 * @param {String} profile 
 * @returns KunDayTimeController
 */
function KunDayTimeController( limit  ){

    this._ticks = 0;
    this._limit = limit || 60;
    this._minute = 0;
    this._hour = 0;
    /**
     * @param {Number} timeVar 
     * @param {Number} minuteVar 
     * @returns KunDayTimeController
     */
    this.export = function( timeVar , minuteVar ){
        if( typeof timeVar === 'number' && timeVar > 0 ){
            $gameVariables.setValue( timeVar , this._hour );
        }
        if( typeof minuteVar === 'number' && minuteVar > 0 ){
            $gameVariables.setValue( minuteVar , this._minute );
        }
        return this;
    };
    /**
     * @returns Boolean
     */
    this.update = function(){
        this._ticks = ( this._ticks + 1 ) % this._limit;
        if( this._ticks === 0 ){
            this._minute = ( this._minute + 1 ) % 60;
            if( this._minute === 0 ){
                this._hour = ( this._hour + 1 ) % 24;
                return true;
            }
        }
        return false;

    };

    return this;
}

KunDayTime.kunAmbientFx = () => KUN.hasOwnProperty('AmbientFX');
/**
 * KunAmbientFX integration plugin
 * @param {String} profile 
 */
KunDayTime.playAmbientFx = function( profile ){
    if( profile.length > 0 && KunDayTime.kunAmbientFx() ){
        KunDayTime.DebugLog(`Playing ${profile} selection ...`);
        KUN.AmbientFX.stopAll();
        if( KUN.AmbientFX.hasCollection( profile ) ){
            KUN.AmbientFX.play( profile );
        }
    }
};
/**
 * 
 */
KunDayTime.stopAmbientFx = function( ){
    if( KunDayTime.kunAmbientFx() ){
        KUN.AmbientFX.stopAll();
    }
}
/**
 * 
 * @param {Number[]} colorTone [ red , green , blue , gray ]
 * @param {*} frames frames to transition, 60 by default
 */
KunDayTime.ScreenTint = function( colorTone , frames ){
    if( Array.isArray( colorTone ) && colorTone.length > 3 ){
        $gameScreen.startTint( colorTone , frames || 60);
    }
};

KunDayTime.DebugLog = function( message ){
    if( KUN.DayTime.debug() ){
        console.log( '[ KunDayTime Debug ] ' + message ); 
    }
}

KunDayTime.Notify = function( message ){

    if( typeof kun_notify === 'function' ){
        kun_notify( message );
    }
    else
    {
        KunDayTime.DebugLog( message );
    }
};

/**
 * @param {String} input 
 * @returns 
 */
KunDayTime.ParseLayerColors = function( input ){

    var output = [];
    var layers = typeof input === "string" && input.length ? JSON.parse( input ) : [];

    for( var i = 0 ; i < layers.length ; i++ ){
        var lc = JSON.parse( layers[ i ] );
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
 * @param {String} data 
 * @returns 
 */
KunDayTime.ImportProfiles = function( data ){

    var output = [];
    (typeof data === "string" && data.length ? JSON.parse( data ) : []).map( profile => JSON.parse(profile)).forEach( function( profile ){

        var timeSets = [];
        (profile.timeSets.length > 0 ? JSON.parse(profile.timeSets).map( ts => JSON.parse(ts) ) : [ /* empty */ ]).forEach( function( ts ){
            timeSets.push({
                    'tag': ts.tag,
                    'time': parseInt( ts.time ),
                    'red': parseInt( ts.red ),
                    'green': parseInt( ts.green ),
                    'blue': parseInt( ts.blue ),
                    'gray': parseInt( ts.gray ),
                    'sfx': ts.sfx ,
            });
        });

        if( timeSets.length ){
            output.push({
                'name':profile.name,
                'timeSets': timeSets,
            });
        }
    });
    return output;
};

/**
 * 
 */
KunDayTime.SetupCommands = function(){
    //override vanilla
    var GameInterpreterPluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        GameInterpreterPluginCommand.call(this, command, args);
        if( command === 'KunDayTime' ){
            //override with plugin command manager
            if( args.length ){
                switch (args[0]) {
                    case 'timeFrame':
                        var fps = args.length > 1 ? parseInt( args[1] ) : 60;
                        var minutes = args.length > 2 ? parseInt( args[2] ) : 0;
                        if( args.length > 3 && args[3] === 'import' ){
                            fps = $gameVariables.value(fps);
                            minutes = $gameVariables.value(minutes);
                        }
                        KUN.DayTime.setFPS( fps , minutes );
                        break;
                    case 'set':
                        if( args.length > 1 ){
                            var time = args[1] === 'system' ? KUN.DayTime.getSystemHour() : (  !Number.isNaN(args[1]) ? parseInt( args[1]) : 0 );
                            KUN.DayTime.updateTransition(KUN.DayTime.setTime( time ));
                        }
                        break;
                    case 'debug':
                        KUN.DayTime.Set.Debug( !KUN.DayTime.debug() );
                        break;
                    case 'start':
                        KUN.DayTime.run()
                        break;
                    case 'stop':
                        KUN.DayTime.stopTimer()
                        break;
                    case 'forceUpdate':
                        KUN.DayTime.refresh();
                        break;
                }
            }
        }
    };
}
/**
 * 
 */
KunDayTime.SetupSceneMap = function(){
    /**
     * @returns Boolean
     */
    Scene_Map.prototype.isReady = function() {
        if (!this._mapLoaded && DataManager.isMapLoaded()) {
            this.onMapLoaded();
            this._mapLoaded = true;

            //OVERRIDE
            KUN.DayTime.setProfile( this.importMapProfile( ) ).refresh();
        }
        return this._mapLoaded && Scene_Base.prototype.isReady.call(this);
    };
    /**
     * @returns String
     */
    Scene_Map.prototype.importMapProfile = function(){
        var profiles = [];
        if( $dataMap !== null && $dataMap.hasOwnProperty('meta')){
            Object.keys( $dataMap.meta ).forEach( function( meta ){
                var _type = meta.split(' ');
                if( _type[ 0 ] === 'KunDayTime' && _type.length > 1 ){
                    profiles.push( _type[1] );
                }
            });
        }
        var selected = profiles.length > 1 ? Math.floor(Math.random() * profiles.length) : 0;
        return profiles.length ? profiles[ selected ] : '';
    }
    
    var _KunDayTime_MapUpdate = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function( ) {
        _KunDayTime_MapUpdate.call( this  );

        if( KUN.DayTime.update() ){
            //update the DayTimeController
            //
        }
    };
}
/**
 * 
 */
KunDayTime.SetupEscapeChars = function(){
    var _ConvertEscapeCharactersOriginal = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        //parse first the vanilla strings
        var parsed = _ConvertEscapeCharactersOriginal.call(this, text);
    
        //return the current special message
        parsed = parsed.replace(/\x1bTIME/gi, function () {
            return KUN.DayTime.time( true );
        }.bind(this));
        
        //return the current special message
        parsed = parsed.replace(/\x1bFULL_TIME/gi, function () {
            return KUN.DayTime.time( true , true );
        }.bind(this));
        
        return parsed;
    };    
};

/* PLUGIN SETUP */
(function(){
    var parameters = PluginManager.parameters('KunDayTime');

    //console.log( KUN.SpecialDates);
    KUN.DayTime = new KunDayTime();
    KUN.DayTime.Set.Debug( parameters.debug === 'true' );
    KUN.DayTime.Set.TimeVar( parseInt(parameters.variable ) );
    KUN.DayTime.setFPS( parameters.fps , parameters.minutes );
    KUN.DayTime.Set.Display24( parseInt(parameters.display) === 24 );
    KUN.DayTime.Set.SyncRealTime( parameters.syncRealTime === 'true' );
    KUN.DayTime.Set.AmbientFX( parameters.kunAmbientFx === 'true' );
    
    KunDayTime.ImportProfiles( parameters.profiles ).forEach( function( profile ){
        var _profile = new KunDayTimeProfile( profile.name );
        profile.timeSets.forEach( function( ts ){
            _profile.addTimeSet(
                ts.tag,
                ts.time,
                ts.red,
                ts.green,
                ts.blue,
                ts.gray,
                ts.sfx );
        } );
        KUN.DayTime.addProfile( _profile );
    });

    KunDayTime.SetupCommands();
    KunDayTime.SetupEscapeChars();
    KunDayTime.SetupSceneMap();
    
})();



