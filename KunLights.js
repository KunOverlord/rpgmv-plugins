//=============================================================================
// KunLights.js
//=============================================================================
/*:
 * @plugindesc KunLights
 * @filename KunLights.js
 * @version 0.3
 * @author KUN
 * 
 * @help
 * 
 * COMMANDS:
 * 
 *      KunLights clear
 *          Clear all clickable areas
 *
 * 
 * @param debug
 * @text Debug
 * @desc Show debug info
 * @type Boolean
 * @default false
 * 
 * @param lightPresets
 * @text Light Presets
 * @desc Light preset databaes setup
 * @type struct<LightPreset>[]
 *
 */
/*~struct~LightPreset:
 *
 * @param name
 * @text Name
 * @desc Scene descriptor (editor only)
 * @type String
 * @default new-interactive-scene
 * 
 * @param red
 * @text Red
 * @type Number
 * @min 0
 * @max 255
 * @default 255
 * 
 * @param green
 * @text Green
 * @type Number
 * @min 0
 * @max 255
 * @default 255
 * 
 * @param blue
 * @text Blue
 * @type Number
 * @min 0
 * @max 255
 * @default 255
 *
 * @param alpha
 * @text Alpha
 * @type Number
 * @min 0
 * @max 255
 * @default 255
 * 
 * @param radius
 * @text Radius
 * @type Num
 * @min 1
 * @max 200
 * @default 64
 * 
 * @param blending
 * @type Select
 * @option Normal
 * @value 0
 * @option Additive
 * @value 1
 * @option Multiply
 * @value 2
 * @default 0
 * 
 */

/**
 * @description KUN Modules
 * @type KUN
 */
var KUN = KUN || {};

/**
 * 
 * @returns 
 */
function KunLights() {

    var _controller = {
        'debug':false,
        'presets': {
            //light presets
        },
    };

    this.Set = {
        'Debug': ( debug ) => _controller.debug = typeof debug === 'boolean' && debug || false,
    };
    /**
     * @returns Array
     */
    this.presets = ( list ) => typeof list === 'boolean' && list ? Object.values( _controller.presets ) : _controller.presets;
    /**
     * @param {String} name 
     * @returns Boolean
     */
    this.has = function( name ){
        return _controller.presets.hasOwnProperty(name);
    };
    /**
     * 
     * @param {String} name 
     * @param {Number} red
     * @param {Number} green
     * @param {Number} blue
     * @param {Number} alpha
     * @param {Number} radius
     * @param {Number} blending 
     * @returns KunLights
     */
    this.addPreset = function( name , red,green,blue,alpha,radius , blending ){

        if( !this.has(name)){
            _controller.presets[ name ] = {
                'name': name.toLowerCase().replace(/[\_\s]/,'-'),
                'red': parseInt(red || 255),
                'green': parseInt(green || 255 ),
                'blue': parseInt( blue || 255 ),
                'alpha': parseInt(alpha || 255),
                'radius': parseInt(radius || 64 ),
                'blending': parseInt( blending || KunLights.Blending.Default ),
                'color': function(){
                    return [ this.red,this.green,this.blue,this.alpha];
                }
            };
        }

        return this;
    };


    this.onLoadMap = function(){

        return this.importEventMetas();
    };
    /**
     * @returns String[]
     */
    this.importEventMetas = function(){
        if( $dataMap !== null && $dataMap.events.length > 0 ){
            $dataMap.events.filter( evt => evt !== null && evt.hasOwnProperty('meta') ).forEach( function( evt ){
                var _gameEvent = $gameMap.events()[evt.id-1];
                console.log( _gameEvent) ;
                Object.keys(evt.meta).forEach( function( meta ){
                    var _m = meta.split(' ');
                    if( _m[0] === 'KunLight' ){
                        _gameEvent.attachLight( _m.length > 1 ? _m[1] : 'default' );
                    }     
                } );
            });
        }
    };

    return this;
}

KunLights.Blending = {
    'Default': 0,
    'Add': 1,
    'Mul': 2,
};


/**
 * Show a notification message
 * @param {String} message 
 */
KunLights.Notify = function( message ){

    if( typeof kun_notify === 'function' ){
        kun_notify( message );
    }
    else if( KUN.Ligts.debug( ) ) {
        console.log( message )
    }
};


function LightMap( width,  height ){


    this.__buffer = null;

    this.__canvas = this.__canvas || document.createElement('canvas');
    this.__context = this.__canvas.getContext('2d');

}


function KunLights_Override(){


    var KunLights_MapTransfer = Game_Player.prototype.performTransfer;
    Game_Player.prototype.performTransfer = function() {
        //vanilla call
        KunLights_MapTransfer.call( this );
        //override
        KUN.Ligts.onLoadMap();
    }


    Game_Event.prototype.attachLight = function( lightProfile ){
        this._lightData = lightProfile;
    };
}


/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

 (function( /* args */ ){

    var parameters = PluginManager.parameters('KunLights');
    KUN.Ligts = new KunLights();
    KUN.Ligts.Set.Debug( parameters.debug === 'true' );
    
    if( parameters.lightPresets.length ){
        JSON.parse( parameters.lightPresets).map( preset => preset.length > 0 ? JSON.parse(preset) : null ).forEach( function(preset){
            if( preset !== null ){
                KUN.Ligts.addPreset(
                    preset.name,
                    parseInt(preset.red),
                    parseInt(preset.green),
                    parseInt(preset.blue),
                    parseInt(preset.alpha),
                    parseInt(preset.radius),
                    parseInt(preset.blending),
                );
            }
        });
    }


    KunLights_Override();

})( /* initializer */ );



