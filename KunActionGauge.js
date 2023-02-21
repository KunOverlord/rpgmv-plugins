//=============================================================================
// KunActionGauge.js
//=============================================================================
/*:
 * @filename KunActionGauge.js
 * @author KUN
 * @version 1.4
 * @plugindesc Show an Action Gauge using assigned variables.
 * 
 * TODO: Override the $gameVariables.setValue method to implement a hook to count the selected variables
 * 
 * @help
 * 
 *  COMMANDS:
 *  KunActionGauge display name
 *  KunActionGauge close [name]
 * 
 * 
 * @param debug
 * @text Debug
 * @type Boolean
 * @default false
 * 
 * @param background
 * @text Gauge Background
 * @type Select
 * @option None
 * @value 2
 * @option Dim
 * @value 1
 * @option Window
 * @value 0
 * @default 0
 * 
 * 
 * @param profiles
 * @text Gauge Profiles
 * @desc Define here the list of all available gauges
 * @type struct<Gauge>[]
 *
 */
/*~struct~Gauge:
 *
 * @param name
 * @text Name
 * @type Text
 * @default action-gauge
 * 
 * @param location
 * @text Location
 * @type Select
 * @option Left
 * @value left
 * @option Right
 * @value right
 * @option Top
 * @value top
 * @option Bottom
 * @value bottom
 * @option Center
 * @value center
 * @default left
 * 
 * @param valueVar
 * @text Value Variable
 * @desc The gauge value and current state
 * @type Variable
 * @min 0
 * @default 0
 *
 * @param targetVar
 * @text Target Variable
 * @desc The gauge's limit or maximum value
 * @type Variable
 * @min 0
 * @default 0
 *
 * @param color1
 * @text Default Color 1
 * @desc Pick the base color
 * @type Number
 * @min 0
 * @max 31
 * @default 1
 *
 * @param color2
 * @text Default Color 2
 * @desc Pick the overlay color
 * @type Number
 * @min 0
 * @max 31
 * @default 4
 *
 */

/**
 * @description KUN Modules
 * @type KUN
 */
var KUN = KUN || {};

function KunActionGauge( ){

    var _gauge = {
        'debug': false,
        'background': 0,
        'profiles':{
            //setup here all gauges
        },
        //setup window output
        'window': null
    };

    this.Set = {
        'Debug': debug => _gauge.debug = typeof debug === 'boolean' && debug,
        'Background': background => _gauge.background = parseInt( background ),
    };

    /**
     * 
     * @param {String} name 
     * @param {Number} valueVar 
     * @param {Number} targetVar 
     * @param {Number} color1 
     * @param {Number} color2 
     * @param {String} location 
     */
    this.add = function( name , valueVar , targetVar , color1 , color2 , location ){
        name = name.toLowerCase().replace(/\-\s/,'_');
        if( !_gauge.profiles.hasOwnProperty(name)){
            _gauge.profiles[ name ] = {
                'name': name,
                'location': location || KunActionGauge.Location.BOTTOM,
                'valueVar': valueVar,
                'targetVar': targetVar,
                'color1': color1 || KunActionGauge.Color.Base,
                'color2': color2 || KunActionGauge.Color.Overlay,
                //'active': false,
                'window': null,
            };
        }
    };

    this.has = gauge => _gauge.profiles.hasOwnProperty( gauge );

    this.isActive = function( gauge ){
        return this.has( gauge ) && _gauge.profiles[ gauge ].window !== null;
        //return this.has( gauge ) && _gauge.profiles[ gauge ].active;
    };
    /**
     * @param {String} location 
     * @param {Number} valueVar 
     * @param {Number} targetVar 
     * @param {Number} baseColor 
     * @param {Number} overlayColor 
     * @param {Number} index 
     * @returns Window_ActionGauge
     */
    this.createWindow = function( location , valueVar , targetVar , baseColor , overlayColor , index ){
        var _window = new Window_ActionGauge( location , valueVar , targetVar , baseColor , overlayColor , index );
        SceneManager._scene.addChild( _window );
        return _window;
    };
    /**
     * @param {String} gauge 
     * @param {Boolean} active 
     * @returns KunActionGauge
     */
    this.display = function( name , active ){
        if( this.has( name ) ){
            var gauge = _gauge.profiles[ name ];
            active = typeof active === 'boolean' && active;
            switch( true ){
                case active && gauge.window === null: //show
                    gauge.window = this.createWindow(
                        gauge.location,
                        gauge.valueVar, gauge.targetVar,
                        gauge.color1, gauge.color2,
                        this.countByLocation( gauge.location )
                    );
                    break;
                case !active && gauge.window !== null: //hide
                    gauge.window.close();
                    gauge.window = null;
                    break;
            }
        }
        return this;
    };
    /**
     * @returns KunActionGauge
     */
    this.closeAll = function(){
        this.active().forEach( function( gauge ){
            gauge.window.close();
            gauge.window = null;
        });
        return this;
    };

    /**
     * @returns Object[]
     */
    this.gauges = () => Object.values( _gauge.profiles );
    /**
     * @returns Object[]
     */
    this.active = function(){
        return this.gauges().filter( gauge => gauge.window !== null );
    };
    /**
     * @param {Number} valueVar 
     * @returns 
     */
    this.updateGauges = function( valueVar ){
        this.gauges().filter( gauge => gauge.window !== null && gauge.valueVar === valueVar ).forEach( function( gauge ){
            gauge.window.renderGauge();
        });
        return this;
    };
    /**
     * @param {string} location 
     * @returns Number
     */
    this.countByLocation = function( location ){
        return this.gauges().filter( gauge => gauge.location === location && gauge.window !== null ).length;
    };

    this.dump = () => _gauge;
    this.debug = () => _gauge.debug;
    this.background = () => _gauge.background;

    return this;
}

KunActionGauge.Color = {
    'Base': 1,
    'Overlay': 4
};

KunActionGauge.Location = {
    'TOP': 'top',
    'BOTTOM': 'bottom',
    'LEFT': 'left',
    'RIGHT': 'right',
    'CENTER': 'center',
};
/**
 * @param {*} message 
 */
KunActionGauge.DebugLog = ( message ) =>{
    if( KUN.ActionGauge.debug() ){
        if( typeof message === 'object' ){
            console.log( '[ KunActionGauge Object Data ] ');
            console.log( message );
        }
        else{
            console.log( '[ KunActionGauge ] - ' + message );
        }
        
    }
};


/********************************************************************************************************************
 * 
 * INTERFACE MODS
 * 
 *******************************************************************************************************************/

 function Window_ActionGauge() {
    this.initialize.apply(this, arguments);
}

Window_ActionGauge.prototype = Object.create(Window_Base.prototype);
Window_ActionGauge.prototype.constructor = Window_Message;

Window_ActionGauge.prototype.initialize = function( location , valueVar , targetVar , color1 , color2 , index ) {
    
    this._index = typeof index === 'number' && index > 0 ? index : 0;
    this._location = location ||KunActionGauge.Location.BOTTOM;
    this._valueVar = valueVar || 0;
    this._targetVar = targetVar || 0;
    this._baseColor = color1 || KunActionGauge.Color.Base;
    this._overlayColor = color2 || KunActionGauge.Color.Overlay;

    var width = Window_ActionGauge.getLocationWidth( this._location );
    var height = Window_ActionGauge.getLocationHeight( this._location );
    var x = Window_ActionGauge.getLocationX( this._location, this._index );
    var y = Window_ActionGauge.getLocationY(  this._location, this._index );

    Window_Base.prototype.initialize.call(this, x, y, width, height);

    this.initMembers();
    this.setBackgroundType( this._background ); 
    this.renderGauge();
};

Window_ActionGauge.prototype.initMembers = function() {
    this._imageReservationId = Utils.generateRuntimeId();
    this._background = KUN.ActionGauge.background();
    this._positionType = 2;
    this._waitCount = 0;
    this._faceBitmap = null;
    this._textState = null;
    
    //this.clearFlags();
};

Window_ActionGauge.prototype.progress = function(){
    if( this._valueVar > 0 && this._targetVar > 0 ){
        var value = $gameVariables.value( this._valueVar );
        var target = $gameVariables.value( this._targetVar );
        return target > 0 && value < target ? value / parseFloat( target ) : 1;
    }
    return 0;
};

Window_ActionGauge.prototype.renderGauge = function(){

    var color1 = this.textColor( this._baseColor );
    var color2 = this.textColor( this._overlayColor );
    var x = 0;
    var y = 0;
    var rate = this.progress();

    switch( this._location ){
        case KunActionGauge.Location.TOP:
        case KunActionGauge.Location.BOTTOM:
        case KunActionGauge.Location.CENTER:
            this.drawHorizontalGauge(
                x,y,
                (Graphics.boxWidth / 12) * 6,
                rate , color1 , color2
            );
            break;
        case KunActionGauge.Location.LEFT:
        case KunActionGauge.Location.RIGHT:
            this.drawVerticalGauge(
                x,y,
                (Graphics.boxHeight / 12)  * 6,
                rate , color1 , color2
            );
            break;
    }

};

Window_ActionGauge.getGaugeWeight = () => 12;

Window_ActionGauge.getLocationWidth = function( location ){
    switch( location ){
        case KunActionGauge.Location.TOP:
        case KunActionGauge.Location.BOTTOM:
        case KunActionGauge.Location.CENTER:
            return (Graphics.boxWidth / 12) * 6;
        case KunActionGauge.Location.RIGHT:
        case KunActionGauge.Location.LEFT:
            return Window_ActionGauge.getGaugeWeight() * 2;
    }
    return 0;
};
Window_ActionGauge.getLocationHeight = function(location ){
    switch( location ){
        case KunActionGauge.Location.TOP:
        case KunActionGauge.Location.BOTTOM:
        case KunActionGauge.Location.CENTER:
            return Window_ActionGauge.getGaugeWeight() * 2;
        case KunActionGauge.Location.RIGHT:
        case KunActionGauge.Location.LEFT:
            return (Graphics.boxHeight / 12) * 6;
    }
    return 0;
};
Window_ActionGauge.getLocationX = function( location, index ){
    index = typeof index === 'number' && index > 0 ? index * 2 : 0;
    switch( location ){
        case KunActionGauge.Location.TOP:
        case KunActionGauge.Location.BOTTOM:
        case KunActionGauge.Location.CENTER:
            return (Graphics.boxWidth / 12) * 3;
        case KunActionGauge.Location.RIGHT:
            return Graphics.boxWidth - ( Window_ActionGauge.getGaugeWeight( )  * ( index + 3 ) );
        case KunActionGauge.Location.LEFT:
            return Window_ActionGauge.getGaugeWeight() * ( index + 1 ) ;
            //return (Graphics.boxWidth / 12) - Window_ActionGauge.getGaugeWeight();
    }
    return 0;
};
Window_ActionGauge.getLocationY = function( location , index ){
    index = typeof index === 'number' && index > 0 ? index * 2 : 0;
    switch( location ){
        case KunActionGauge.Location.TOP:
            return (Graphics.boxHeight / 12) + ( Window_ActionGauge.getGaugeWeight()  * index );
        case KunActionGauge.Location.BOTTOM:
            return (Graphics.boxHeight / 12) *  10 - ( Window_ActionGauge.getGaugeWeight() * index );
        case KunActionGauge.Location.RIGHT:
        case KunActionGauge.Location.LEFT:
            return (Graphics.boxHeight / 12) * 2;
        case KunActionGauge.Location.CENTER:
            return (Graphics.boxHeight / 12) + (5 + Window_ActionGauge.getGaugeWeight() * index );
    }
    return 0;
};

Window_ActionGauge.prototype.drawHorizontalGauge = function(x, y, width, progress, color1, color2) {
    var progressBar = Math.floor(width * progress);
    var weight = Window_ActionGauge.getGaugeWeight();
    this.contents.fillRect(x, y, width, weight , this.gaugeBackColor());
    this.contents.gradientFillRect(x, y, progressBar, weight, color1, color2);
};

Window_ActionGauge.prototype.drawVerticalGauge = function(x, y, height, progress, color1, color2) {
    var progressBar = Math.floor(height * progress);
    var weight = Window_ActionGauge.getGaugeWeight();
    this.contents.fillRect( x, y, weight, height, this.gaugeBackColor());
    this.contents.gradientFillRect( x, y + height - progressBar, weight, progressBar, color1, color2);
};


/********************************************************************************************************************
 * 
 * FUNCTIONS
 * 
 *******************************************************************************************************************/

function KunActionGauge_ImportGauges( data ){
    var output = [];
    if( data.length ){
        JSON.parse( data ).map( gauge => JSON.parse( gauge )).forEach( function( gauge ){
            output.push({
                'name': gauge.name,
                'location': gauge.location,
                'valueVar': parseInt( gauge.valueVar ),
                'targetVar': parseInt( gauge.targetVar ),
                'color1': parseInt( gauge.color1 ),
                'color2': parseInt( gauge.color2 ),
            });
        });
    }
    return output;
};
/**
 * 
 */
function KunActionGauge_HookVariables(){
    //override game variables
    Game_Variables.prototype.setValue = function(variableId, value) {
        //vanilla
        if (variableId > 0 && variableId < $dataSystem.variables.length) {
            if (typeof value === 'number') {
                value = Math.floor(value);
            }
            this._data[variableId] = value;
            this.onChange();
        }

        KUN.ActionGauge.updateGauges( variableId );
        //override
        /*if( variableId === KUN.ActionGauge.value() ){
            KUN.ActionGauge.update();
        }*/
    };
}
/**
 * 
 */
function KunActionGauge_SetupCommands(){
    var KunGaugePluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        KunGaugePluginCommand.call(this, command, args);
        if (command === 'KunActionGauge') {
            if( args && args.length ){
                switch (args[0]) {
                    case 'display':
                        if( args.length > 1 ){
                            KUN.ActionGauge.display( args[1] , true );
                        }
                        break;
                    case 'close':
                        if( args.length > 1 ){
                            KUN.ActionGauge.display( args[1] , false );
                        }
                        else{
                            KUN.ActionGauge.closeAll();
                        }
                        break;
                }
            }
            else{
                KUN.SpecialDates.run();
            }
        }
    };
};


/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function( /* args */ ){

    var parameters = PluginManager.parameters('KunActionGauge');
    KUN.ActionGauge = new KunActionGauge();
    KUN.ActionGauge.Set.Debug( Boolean(parameters.debug) );
    KUN.ActionGauge.Set.Background( parameters.background );

    KunActionGauge_ImportGauges(parameters.profiles).forEach( function( gauge ){
        KUN.ActionGauge.add( gauge.name,gauge.valueVar,gauge.targetVar,gauge.color1,gauge.color2,gauge.location);
    });

    //KunActionGauge.DebugLog( 'ready!' );
    KunActionGauge_HookVariables();
    //OVERRIDE COMMAND INTERPRETER
    KunActionGauge_SetupCommands();



})( /* initializer */);


