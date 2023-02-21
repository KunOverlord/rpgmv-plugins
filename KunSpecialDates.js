//=============================================================================
// KunSpecialDates.js
//=============================================================================
/*:
 * @plugindesc Enable SPECIAL SWITCHES
 * to give your game a special flavor depending on the date ;)
 * @author JayaKun
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
 * -- "KUNSpecialDates run": Check all the registered dates ;)
 * -- "KUNSpecialDates check [yyyy-mm-dd]": This command forces the activation of the switch from the available date you've passed through parameter.
 * 
 * FUNCTIONS
 * -- kun_special_dates_check( ): you can use this one in event conditions, so you can check if there's some message to show today ;).
 * -- kun_special_dates_check( [yyyy-mm-dd] ): same, but this one will fire up ONLY in the special date you pass by parameter, for christmas, some birthday, etc.
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
 * @type Text
 * @desc Type in the default text to show when there's no message to display in a dialog.
 * @default No message to show today :(
 * 
 * @param onLoad
 * @text Check on Load
 * @type Boolean
 * @default false
 * 
 * @param debug
 * @text Debug Data
 * @type Boolean
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
 * @param daysAlive
 * @text Days Alive
 * @desc Number of Days to keep this event alive
 * @type Number
 * @min 1
 * @max 30
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
 * @dir audio/me/
 * @desc Define a SE music to play when this date is activated :D
 *
 */

/**
 * @description KUN Modules
 * @type KUN
 */
var KUN = KUN || {};

function KUNSpecialDates(){
/**
 * @var Object
 */
    var _specials = { 
        'debug' : false,
        'default': '',
        'months': ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"],
        'dates': {}
    };
    this.Set = {
        'Debug': ( debug ) => _specials.debug = debug,
        'Default': ( text ) => _specials.default = text
    };
    /**
     * @returns {Boolean}
     */
    this.debug = () => _specials.debug;
    /**
     * @returns {KUN.SpecialDates}
     */
    this.run = function(  ){

        this.list().forEach( function( special ){
            var active = special.isActive();
            special.checkSwitch(active);
            if( active ){
                KUNSpecialDates.Message( special.message() );
                special.playAudio();
            }
        });

        return this;
    };
    /**
     * @returns KunDate[]
     */
    this.list = () => Object.values( _specials.dates );
    /**
     * @returns String[]
     */
    this.dates = () => Object.keys( _specials.dates );
    /**
     * @returns KUNSpecialDates
     */
    this.dump = function(){
        this.list().forEach( function( special ){
            console.log( special.toString()  + ' ' + (special.isActive() ? 'active' : 'inactive' ) + ' switch is ' + (special.status( ) ? 'on' : 'off') );
        });
        return this;
    };
    /**
     * @param {String} date 
     * @returns KunDate | Boolean
     */
    this.get = function( date ){
        return _specials.dates.hasOwnProperty( date ) ?
            _specials.dates[ date ] :
            false;
    };
    /**
     * @param {Number} day 
     * @param {Number} month 
     * @param {Number} year 
     * @param {String} message 
     * @param {Number} flag 
     * @param {Number} offset 
     * @param {String} audio
     * @returns 
     */
    this.register = function( day , month , year , message , flag , offset , audio ){

        var date = KunDate.Format( day , month , year );

        if( !_specials.dates.hasOwnProperty( date ) ){
            _specials.dates[ date ] = new KunDate(
                day, month , year , message, flag , offset , audio 
            );
        }

        return this;
    };
    /**
     * @param {Number} month 
     * @returns String
     */
    this.getMonth = ( month ) => _specials.months[ month-1 ];
    /**
     * 
     * @param {Object} date 
     * @param {Boolean} active
     * @returns {Boolean}
     */
     /*this.checkSwitch = function( date , active ){
        if( _specials.dates.hasOwnProperty( date ) ){
            var flag = this.getFlagId( date );
            return this.setSwitch( flag , active || false );
            //KUNSpecialDates.DebugLog('[' + date + ']' + _specials.dates[date].text + ' (' + flag + '): ' + ( active ? 'ON':'OFF') );
        }
        return false;
    };*/
    /**
     * @param {String} special yyyy-mm-dd
     * @returns Boolean
     */
    this.checkDate = function( special ){

        var date = typeof special === 'string' ?
            special.replace('Y',(new Date().getFullYear())) :
            KunDate.Today();
        
        console.log( date );

        var event = this.get( date );

        return event !== false  ? event.isActive() : false;
    };
    /**
     * @param {String} date 
     * @returns String
     */
    this.getMessage = function(date){
        
        var special = this.get( date );
        if( false !== special ){
            return special.message();
        }
        
        return _specials.default;
    };
    /**
     * 
     * @param {Number} switch_id 
     * @param {Boolean} active 
     * @returns Boolean
     */
    this.setSwitch = function( switch_id , active ){
        if( switch_id > 0 ){
            $gameSwitches.setValue( switch_id , typeof active === 'boolean' ? active : true );
            //KUNSpecialDates.DebugLog(( 'Switch[' + switch_id + '] : ' + ($gameSwitches.value( id ) ? 'ON' : 'OFF' ) ) );
            return this.getSwitch( switch_id );
        }
        return false;
    };
    /**
     * @param {Number} switch_id 
     * @returns Boolean
     */
    this.getSwitch = function( switch_id ){
        return switch_id > 0 ?  $gameSwitches.value( switch_id ) : false;
    };
    /**
     * @returns String
     */
    this.getEmptyMessage = () => _specials.default;
    /**
     * @param {Object} input
     * @returns KUN.SpecialDates
     */
    this.Import = function( input ){
        var data = JSON.parse( input );
        if( data.length ){
            for( var S in data ){
                var special = JSON.parse( data[ S ] );
                var D = parseInt(special.day);
                var M = parseInt(special.month);
                var Y = parseInt(special.year);
                var F = parseInt(special.switchID);
                var O = parseInt(special.daysAlive);
                var sfx = special.sfx || '';
                this.register( D ,M ,Y , special.message.trim() , F , O , sfx );
                //this.addFullDate( S.day , S.month , S.year , S.message , S.switch );
            }
            //KUNSpecialDates.DebugLog( _specials.dates);
        }
        else{
            //KUNSpecialDates.DebugLog('No Special Dates data found :(');
        }

        return this;
    };
}
/**
 * @param {*} message 
 */
 KUNSpecialDates.DebugLog = ( message ) =>{
    if( KUN.SpecialDates.debug() ){
        console.log( typeof message !== 'object' ? '[ KunSpecialDates ] - ' + message  : message );
    }
};
/**
 * @param {String} message 
 */
KUNSpecialDates.Message = ( message ) => {
    if( typeof kun_notify === 'function' ){
        kun_notify( message );
    }
    else{
        KUNSpecialDates.DebugLog( message );
    }
};

/**
 * 
 * @param {Number} day
 * @param {Number} month
 * @param {Number} year
 * @param {String} message 
 * @param {Number} flag 
 * @param {Number} days 
 * @param {String} sfx 
 * @returns KunDate
 */
function KunDate( day , month , year , message , flag , days , sfx ){
    
    var _date = {
        'day': day ,
        'month': month ,
        'year': typeof year === 'number' && year > 0 ? year : 0 ,
        'message': message || '',
        'flag': parseInt( flag ) || 0,
        'days': parseInt( days ) || 1,
        'sfx': sfx || '',
    };
    /**
     * @returns String
     */
     this.toString = function(){
        return KunDate.Format( _date.day , _date.month , _date.year );
    };
    /**
     * @returns Date
     */
    this.date = () => new Date( this.year() , this.month()-1 , this.day() );
    /**
     * @returns Number
     */
    this.year = () => {
        return _date.year > 0 ? year : ( new Date() ).getFullYear();
    };
    /**
     * @returns Number
     */
    this.day = () => _date.day;
    /**
     * @returns Number
     */
    this.month = () => _date.month;
    /**
     * @returns Number
     */
    this.flag = () => _date.flag;
    /**
     * @param {Boolean} active 
     * @returns {KunDate}
     */
    this.checkSwitch = function( active ){

        return this.setSwitch( typeof active === 'boolean' ? active : this.isActive() );
    };
    /**
     * @param {Boolean} active 
     * @returns 
     */
    this.setSwitch = function( active ){
        if( _date.flag > 0 ){
            $gameSwitches.setValue( _date.flag , typeof active === 'boolean' ? active : true );
        }
        return this;
    };
    /**
     * @returns Boolean
     */
    this.status = function(){
        return _date.flag > 0 ? $gameSwitches.value( _date.flag ) : false;
    }
    /**
     * @returns Boolean
     */
    this.hasAudio = () => _date.sfx.length > 0;
    /**
     * Plays an Audio ME piece
     * @returns KunDate
     */
    this.playAudio = function(){
        console.log(_date.sfx);
        if( this.hasAudio() ){
            
            AudioManager.playMe({name: _date.sfx, pan: 0, pitch: 100, volume: 100});
        }
        return this;
    };
    /**
     * @returns Number
     */
    this.days = () => _date.days;
    /**
     * @returns String
     */
    this.message = () => _date.message;
    /**
     * @returns Boolean
     */
    this.isToday = () => KunDate.Today() === this.toString();
    /**
     * @returns Boolean
     */
    this.isActive = function( ){

        if( _date.days > 1 ){

            var time = (new Date()).getTime();
            var from = this.date();
            var to = this.offset();
            
            return from.getTime() <= time && time <= to;
        }
        else{
            return this.isToday();
        }
    };
    /**
     * @param {String} date 
     * @returns 
     */
    this.checkDate = function( date ){ 

        var time = (new Date(date)).getTime();

        return this.date().getTime() <= time && time <= this.offset();
    };
    /**
     * 
     * @param Boolean asDate
     * @returns Number|Date
     */
    this.offset = function( asDate ){
        var date = this.date();
        var ts = date.setDate( date.getDate() + _date.days - 1 );
        return asDate ? new Date( ts ) : ts;
    };

    return this;
}
/**
 * Format today's date into yyyy-mm-dd
 * @returns String
 */
KunDate.Today = function(){
    
    var now = new Date();

    return KunDate.Format(
        now.getDate(),
        now.getMonth()+1,
        now.getFullYear()
    );
};
/**
 * Return a formatted date in yyyy-mm-dd
 * @param {Number} day 
 * @param {Number} month 
 * @param {Number} year 
 * @returns 
 */
KunDate.Format = function( day , month , year ){
    return [
        typeof year === 'number' && year > 0 ? year : ( new Date() ).getFullYear(),
        (month > 9 ? month : '0' + month ),
        (day > 9 ? day : '0' + day )
    ].join('-');
};


/**
* @param {String} date [optional]
 * @returns Boolean
 */
function kun_special_dates_check( date ){
    return KUN.SpecialDates.checkDate( date );
}
/**
 * 
 */
function kun_special_dates_setup_onload(){
    var _KunSpecialDates_GameLoad = Scene_Load.prototype.onSavefileOk;
    Scene_Load.prototype.onSavefileOk = function() {
        _KunSpecialDates_GameLoad.call(this);
        KUN.SpecialDates.run();
    }
}


function kun_special_dates_setup_commands(){
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'KUNSpecialDates') {
            if( args && args.length ){
                switch (args[0]) {
                    case 'run':
                        KUN.SpecialDates.run();
                        break;
                    case 'debug':
                        KUN.SpecialDates.Set.Debug( true );
                        break;
                    case 'check':
                        if( args.length > 1 ){
                            var special = KUN.SpecialDates.get( args[1] );
                            if( false !== special ){
                                special.setSwitch( true  );
                                KUNSpecialDates.Message(special.message());
                                special.playAudio();
                            }
                        }
                        break;
                }
            }
            else{
                KUN.SpecialDates.run();
            }
        }
    };
}

function kun_special_dates_setup_escape_chars(){
    _WindowBase_ConvertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {

        var parsed = _WindowBase_ConvertEscapeCharacters.call(this, text );

        //return the current special message
        parsed = parsed.replace(/\x1bSPECIAL_DATE/gi, function () {
            var special = KUN.SpecialDates.get(KunDate.Today());
            return special !== false  ?
                //special.message().replace(/\\/gi,'\\') :
                special.message() :
                KUN.SpecialDates.getEmptyMessage();
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
(function(){
    var parameters = PluginManager.parameters('KunSpecialDates');

    KUN.SpecialDates = new KUNSpecialDates();
    KUN.SpecialDates.Set.Debug( Boolean(parameters['debug']) );
    KUN.SpecialDates.Set.Default( parameters['emptyText'] );
    KUN.SpecialDates.Import( parameters['specials'] );

    kun_special_dates_setup_commands();
    kun_special_dates_setup_escape_chars();

})();



