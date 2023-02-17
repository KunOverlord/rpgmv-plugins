//=============================================================================
// KunTouch.js
//=============================================================================
/*:
 * @plugindesc KunTouch
 * @filename KunTouch.js
 * @version 1.2
 * @author KUN
 * 
 * @help
 * 
 * COMMANDS:
 * 
 *      KunTouch preset scene-name
 *          Load an interactive scene preset
 * 
 *      KunTouch layer layer-name
 *          Set the current scene layer
 * 
 *      KunTouch name VarId X Y width height [layer1.layer2.layern ...]
 *          Define a clickable area
 * 
 *      KunTouch limit value [import]
 *          Sets the limit of the slickable spot list
 * 
 *      KunTouch next
 *          Exports the next spot in the queue into the provided X,Y gameVars
 *          Updates the counter gameVar to trackt the remaing spots to dispatch
 * 
 *      KunTouch capture
 *          Notify the clicked coordinates into the console
 * 
 *      KunTouch clear
 *          Clear all clickable areas in the scene
 *
 * 
 * 
 * @param debug
 * @text Debug
 * @desc Show debug info
 * @type Boolean
 * @default false
 * 
 * @param touchSfx
 * @text Touch SFX
 * @desc Play this sound upon an area is touched
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param varX
 * @text Var ID X
 * @desc Variable id to bind the X position
 * @type Variable
 * @min 0
 * @default 0
 *
 * @param varY
 * @text Var ID Y
 * @desc Variable id to bind the Y position
 * @type Variable
 * @min 0
 * @default 0
 * 
 * @param touchLimit
 * @text Touch Limit
 * @desc Define a limit for the touch cache
 * @type Number
 * @min 1
 * @max 8
 * @default 1
 * 
 * @param varCounter
 * @parent touchLimit
 * @text Click Counter Var
 * @desc Define a Game Variable to export the TouchLimit cache
 * @type Variable
 * @min 0
 * @default 0
 * 
 * @param touchSwitch
 * @text Touch Switch
 * @desc Select the switch which will fire up the touch event while clicked
 * @type Switch
 * @min 0
 * @default 0
 * 
 * @param scenePresets
 * @text Scene Presets
 * @desc Define here the scene preset batch to create q quick startup setup
 * @type struct<ScenePreset>[]
 * 
 * @param sceneBackup
 * @text Preset Backups (just copy-paste)
 * @type struct<ScenePreset>[]
 *
 */
/*~struct~ScenePreset:
 *
 * @param name
 * @text Name
 * @desc Scene descriptor (editor only)
 * @type String
 * @default new-interactive-scene
 * 
 * @param layer
 * @text Default Layer
 * @type text
 * @default default
 * 
 * @param showTitle
 * @text Display title
 * @desc Will display a random title form the list on a popup notification (if active)
 * @type Text[]
 * 
 * @param sfx
 * @text Play SFX
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param spots
 * @text Touch Spots
 * @type struct<AreaPreset>[]
 * 
 */
/*~struct~AreaPreset:
 * 
 * @param name
 * @text Name
 * @type string
 * @default areaName
 * 
 * @param varId
 * @text Variable ID
 * @type Variable
 * @min 0
 * @default 0
 * 
 * @param type
 * @text Area Type
 * @type Select
 * @option Area
 * @value area
 * @option Rectangle
 * @value rect
 * @default rect
 * 
 * @param layer
 * @text Layer
 * @type text[]
 * 
 * @param left
 * @text Left|X
 * @type Number
 * @min 0
 * 
 * @param top
 * @text Top|Y
 * @type Number
 * @min 0
 * 
 * @param right
 * @text Right|Width
 * @type Number
 * @min 0
 * 
 * @param bottom
 * @text Bottom|Height
 * @type Number
 * @min 0
 * 
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
function KunTouch() {

    var _manager = {
        'capture':false,
        'captured':[],
        'debug':false,

        'areas': { },
        'layer': 'default',
        'media': '',
        'varX':0,
        'varY':0,
        'varCounter': 0,
        'limit': 1,
        'touched': [],
        //'offset':{'x':0,'y':0,},
        'switchId': 0,
        'presets': {
            //scene presets
        },
    };

    this.Set = {
        'Debug': ( debug ) => _manager.debug = typeof debug === 'boolean' && debug || false,
        'Capture': (capture) => _manager.capture = typeof capture === 'boolean' && capture ||false,
        'Media': ( media ) => _manager.media = media || '',
        'X': ( varId ) => _manager.varX = parseInt( varId ) || 0,
        'Y': ( varId ) => _manager.varY = parseInt( varId ) || 0,
        'Counter': (varId ) => _manager.varCounter = parseInt( varId ) || 0,
        'Limit': ( limit ) => _manager.limit = parseInt( limit ) || 1,
        'Switch': ( switchId ) => _manager.switchId = parseInt( switchId ) || 0,
    };

    /**
     * @returns Array
     */
    this.listPresets = () => Object.values( _manager.presets );
    /**
     * 
     * @param {String} name 
     * @param {String} title
     * @param {Array} areas 
     * @param {String} defaultLayer 
     * @param {String} sfx 
     * @returns 
     */
    this.createPreset = function( name , title, areas , defaultLayer , sfx ){

        if( areas && areas.length > 0 ){
            _manager.presets[name] = {
                'name': name,
                'title': Array.isArray( title ) ? title : [title],
                'areas': areas,
                //'sfx': sfx,
                'layer': defaultLayer,
            };    
        }

        return this;
    };
    /**
     * @param {String} name 
     * @returns Object
     */
    this.importPreset = function( name ){
        
        this.clear();
        //console.log( _manager.presets );
        var preset = _manager.presets.hasOwnProperty( name ) ? _manager.presets[ name ] : null;

        if( preset !== null && preset.areas.length > 0 ){
            var _self = this;
            preset.areas.forEach( function( area ){
                switch( area.type ){
                    case 'area':
                        _self.area( area.name , area.varId , area.left , area.top , area.right , area.bottom , area.layer.join('.'));
                        break;
                    case 'rect':
                        _self.rect( area.name , area.varId , area.left , area.top , area.right , area.bottom , area.layer.join('.'));
                        break;
                }
            });
            //default layer
            this.setLayer( preset.layer );
            if( preset.title.length ){
                //show title
                var selected  = preset.title.length > 1 ? preset.title[ Math.floor( Math.random(  ) * preset.title.length ) ] : preset.title[ 0 ];
                KunTouch.Notify( selected.toString() );
            }
            //if( preset.sfx ){
                //this.playFx();
            //}
        }
        else{
            console.log( `Invalid Scene Preset ${name}`);
        }
    };
    /**
     * Define an offsetto the exportable X and Y game variables
     * @param {Number} x 
     * @param {Number} y 
     */
    /*this.offset = function( x  , y ){
        _manager.offset.x = x ;
        _manager.offset.y = y;
        return this;
    };*/
    /**
     * @returns Boolean
     */
    this.locked = function(){
        return _manager.switchId > 0 && $gameSwitches ? $gameSwitches.value( _manager.switchId ) : false;
    };
    /**
     * @param {String} layer
     * @returns Array
     */
    this.list = function( layer ){
        return typeof layer === 'string' && layer.length ?
            Object.values( _manager.areas ).filter( area => ( area.isEmpty() || area.isLayer( layer ) ) )  :
            Object.values( _manager.areas );
    };
    /**
     * @param {String} layer 
     * @returns KunTouch
     */
    this.setLayer = function( layer ){

        _manager.layer = typeof layer === 'string' && layer.length ? layer : 'default';

        return this;
    };
    /**
     * @returns String
     */
    this.currentLayer = () => _manager.layer;
    /**
     * @returns Boolean
     */
    this.debug = () => _manager.debug;
    /**
     * 
     * @returns Boolean
     */
    this.capture = () => _manager.capture;
    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @returns KunTouch
     */
    this.captureRegion = function( x , y ){
        _manager.captured.push( x );
        _manager.captured.push( y );
        if( _manager.captured.length > 3 ){
            var coords = _manager.captured;
            var name = 'area_' + coords.join('');
            var x1 = coords[0] < coords[2] ? coords[0] : coords[2];
            var x2 = coords[0] < coords[2] ? coords[2] : coords[0];
            var y1 = coords[1] < coords[3] ? coords[1] : coords[3];
            var y2 = coords[1] < coords[3] ? coords[3] : coords[1];
            console.log( `KunTouch ${name} VAR_ID ${x1} ${y1} ${x2} ${y2}` );
            _manager.captured = [];
        }
        else{
            console.log( 'Click to capture rect area...' );
        }
        return this;
    };
    /**
     * 
     */
    this.resetCapture = () => _manager.captured = [];
    /**
     * @returns Float
     */
    this.aspectRatio = function(){
        return SceneManager._screenWidth / SceneManager._screenHeight;
    };
    /**
     * @returns Number
     */
    this.scale = function(){
        
        var _scaleX = window.innerWidth / SceneManager._screenWidth;
        var _scaleY = window.innerHeight / SceneManager._screenHeight;
        var _scale = 1.0;

        if( window.innerHeight > window.innerWidth ){
            //vertical devices (smartphones, blah blah )
        }
        else{
            //normal display monitors
        }

        return _scaleY < _scaleX ? _scaleY : _scaleX;
    };
    /**
     * 
     * @returns KunTouch
     */
    this.playFx = function(){
        if(  _manager.media.length ){
            //_manager.media[ type ] = media;
            AudioManager.playSe({name: _manager.media , pan: 0, pitch: 100, volume: 100});
        }
        return this;
    }
    /**
     * Run the selected common event
     * @returns KunTouch
     */
    this.switch = function(){
        if( _manager.switchId > 0 ){
            //$gameTemp.reserveCommonEvent( _manager.eventId );
            $gameSwitches.setValue( _manager.switchId , true );
        }
        return this;
    }
    /**
     * @param {Number} x 
     * @param {Number} y 
     * @returns KunTouch
     */
    this.enqueue = function(x , y ){
        if( _manager.touched.length < _manager.limit ){
            _manager.touched.push({
                'x': x ,
                'y': y,
            })
            if( _manager.varCounter > 0 ){
                $gameVariables.setValue( _manager.varCounter , _manager.touched.length );
            }
        }
        return _manager.touched.length < _manager.limit;
    }
    /**
     * Exports the current coordinates into the parsed game variables
     * @param {Number} x 
     * @param {Number} y 
     * @returns KunTouch
     */
    this.exportPosition = function( x , y ){
        if( x > 0 && _manager.varX > 0 ){
            //$gameVariables.setValue(_manager.varX , x - _manager.offset.x );
            $gameVariables.setValue(_manager.varX , x );
        }
        if( y > 0 && _manager.varY > 0 ){
            //$gameVariables.setValue(_manager.varY , y - _manager.offset.y );
            $gameVariables.setValue(_manager.varY , y );
        }
        if( _manager.debug ){
            if( _manager.varX > 0 && _manager.varY > 0 ){
                var x = $gameVariables.value( _manager.varX );
                var y = $gameVariables.value( _manager.varY )
                console.log( `Clicked on ${x},${y}` );    
            }
        }
        return this;
    };

    /**
     * @returns KunTouch
     */
    this.clear = function(){

        _manager.areas = {};
        _manager.touched = [];

        return this;
    };
    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Boolean} next
     */
    this.touch = function( x , y , next ){
        //only catch event if not clicked (or game switch is 0, always false)
        if( !this.locked() ){
            var layer = this.currentLayer();
            var clicked = this.list( layer ).filter( area => area.collide(x,y) );
            if( clicked.length > 0 ){
                if( this.enqueue( x , y ) ){
                    //KUN.Touch.exportPosition( x , y ).switch().playFx();
                    this.playFx();
                    if( typeof next === 'boolean' && next ){
                        this.next();
                    }
                    if( this.debug()){
                        console.log( `clicked ${area.name()}(${x} , ${y}) on layer ${layer}` );
                    }
                } 
            }
        }
    };
    /**
     * @returns KunTouch
     */
    this.next = function(){
        if( _manager.touched.length > 0 ){
            var _spot = _manager.touched.shift();
            this.exportPosition( _spot.x , _spot.y );
            if( _manager.varCounter > 0 ){
                $gameVariables.setValue( _manager.varCounter , _manager.touched.length );
            }    
        }
        return this;
    };
    /**
     * 
     * @param {String} name
     * @param {Number} varId 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} w 
     * @param {Number} h 
     * @param {String} layers
     * @returns 
     */
    this.area = function( name , varId , x , y , w , h , layers ){
        
        name = name.toLowerCase().replace(/\-\s/,'_');

        if( !_manager.areas.hasOwnProperty(name)){
                _manager.areas[ name ] = new KunEventArea( name , varId , x , y , w , h );
                if( typeof layers === 'string' && layers.length > 0 ){
                    _manager.areas[ name ].addLayer( layers );
                }
                if( _manager.debug ){
                    console.log( _manager.areas[ name ].data( ) );
                }
        }
        //_manager.areas.push( new KunEventArea( name , varId , x , y , w , h , b ) );
        return this;
    };
    /**
     * 
     * @param {String} name
     * @param {Number} varId 
     * @param {Number} topLeft 
     * @param {Number} top 
     * @param {Number} bottomRight 
     * @param {Number} bottom 
     * @param {String} layers
     * @returns 
     */
    this.rect = function( name , varId , topLeft , top , bottomRight , bottom , layers ){
        var x = topLeft;
        var y = top;
        var width = bottomRight - x;
        var height = bottom - top;

        return this.area( name , varId , x , y , width, height , layers );
    }
   

    return this;
}
/**
 * Show a notification message
 * @param {String} message 
 */
KunTouch.Notify = function( message ){

    if( typeof kun_notify === 'function' ){
        kun_notify( message );
    }
    else if( KUN.Touch.debug( ) ) {
        console.log( message )
    }
};


/**
 * 
 * @param {String} name
 * @param {Number} varId
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} width 
 * @param {Number} height 
 */
function KunEventArea( name , varId , x , y , width , height ){

    var _area = {
        'name': name ,
        'varId': varId,
        'width': width || 1,
        'height': height || 1,
        'layers':[],
        'x': x || 0,
        'y': y || 0,
    };
    this.name = () => _area.name;
    this.left = () => _area.x;
    this.top = () => _area.y;
    this.bottom = () => _area.y + _area.height;
    this.right = () => _area.x + _area.width;
    this.layers = () => _area.layers;
    this.isEmpty = () => _area.layers.length  === 0;
    /**
     * @param {String} layer 
     * @returns Boolean
     */
    this.isLayer = layer => _area.layers.includes( layer );
    /**
     * @param {String|Array} layer 
     * @returns KunEventArea
     */
    this.addLayer = function( layer ){

        layer.split('.').forEach( function( l ){
            _area.layers.push( l.toLowerCase().replace(/\-\s/,'_') );
        });

        return this;
    };
    /**
     * @returns KunEventArea
     */
    this.update = function(){
        var value = $gameVariables.value( _area.varId );
        value++;
        $gameVariables.setValue( _area.varId , value );
        return this;
    };

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @returns 
     */
    this.collide = function( x , y ){

        if( x >= this.left() && x <= this.right()){
            if( y >= this.top() && y <= this.bottom() ){
                
                this.update();

                return true;
            }
        }

        return false;
    };
    /**
     * @returns Object
     */
    this.data = () => _area;
}

/**
 * 
 */
function KunTouchEventSetup(){

    /**
     * @static
     * @method _onTouchEnd
     * @param {TouchEvent} event
     * @private
     */
    var _KunOnTouchEnd = Graphics._onTouchEnd;

    Graphics._onTouchEnd = function(event) {

        //vanilla
        _KunOnTouchEnd.bind(this,event);

        //ove4rride
        if( event instanceof MouseEvent ){
            var x = this.pageToCanvasX( event.clientX );
            var y = this.pageToCanvasY( event.clientY );
            if( KUN.Touch.capture()){
                KUN.Touch.captureRegion( x , y );
            }
            else{
                KUN.Touch.touch( x , y );
            }
        }
    };


    var _KunTouch_PluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _KunTouch_PluginCommand.call(this, command, args);
            if (command === 'KunTouch') {
                if( args && args.length ){
                    switch (args[0]) {
                        case 'preset':
                            if( args.length > 1 ){
                                KUN.Touch.importPreset( args[1] );
                                console.log( KUN.Touch.list() );
                            }
                            break;
                        case 'layer':
                            KUN.Touch.setLayer( args.length > 1 ? args[1] : '' );
                            break;
                        //case 'update':
                        case 'next':
                            KUN.Touch.next();
                            break;
                        case 'limit':
                            if( args.length > 1 ){
                                KUN.Touch.Set.Limit(args.length > 2 && args[2] === 'import' ?
                                    $gameVariables.value( parseInt( args[1]) ) :
                                    parseInt(args[1]));
                            }
                            break;
                        case 'list':
                            if( KUN.Touch.debug() ){
                                console.log( KUN.Touch.list() );
                            }
                            break;
                        case 'capture':
                            if( args.length > 1 && args[1] === 'reset' ){
                                KUN.Touch.resetCapture();
                            }
                            else{
                                KUN.Touch.Set.Capture( !KUN.Touch.capture() );
                                if( KUN.Touch.capture() && KUN.Touch.debug()){
                                    console.log('Capture ready. Click around to capture X,Y coordinates ...');
                                }
                            }
                            break;
                        case 'clear':
                            KUN.Touch.clear();
                            break;
                        default:
                            if( args.length > 5 ){
                                KUN.Touch.rect(
                                    args[0],
                                    parseInt( args[1] ),
                                    parseInt( args[2] ),
                                    parseInt( args[3] ),
                                    parseInt( args[4] ),
                                    parseInt( args[5] ),
                                    args.length > 6 ? args[6] : ''
                                );    
                            }
                            break;
                    }
                }
            };
    };
}

function KunTouchImportPresets( scenes ){

    var _output = [];

    ( scenes.length > 0 ? JSON.parse( scenes ) : [] ).map( pst => pst.length > 0 ? JSON.parse(pst) : null ).filter( pst => pst !== null ).forEach( function( preset ){
        var _scene = {
            'name': preset.name.toLowerCase().replace(/([\s\_]+)/g,'-'),
            'title': preset.showTitle.length > 0 ? JSON.parse( preset.showTitle ) : [] ,
            //'sfx': preset.sfx,
            'layer': preset.layer || '',
            'spots': [],
        };

        var spots = preset.spots.length > 0 ? JSON.parse( preset.spots ) : [];

        spots.map( spot => spot.length > 0 ? JSON.parse( spot ) : null ).filter( spot => spot !== null ).forEach( function( area ){
            _scene.spots.push( {
                'name': area.name,
                'type': area.type,
                'layer': area.layer.length > 0 ? JSON.parse( area.layer ) : [],
                'varId': parseInt( area.varId ),
                'left': parseInt( area.left ),
                'top': parseInt( area.top ),
                'right': parseInt( area.right ),
                'bottom': parseInt( area.bottom ),
            } );
        });

        _output.push( _scene );
    });

    //console.log( _output );

    return _output;
}

/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

 (function( /* args */ ){

    var parameters = PluginManager.parameters('KunTouch');
    KUN.Touch = new KunTouch();
    KUN.Touch.Set.Debug( parameters.debug === 'true' );
    KUN.Touch.Set.Media( parameters.touchSfx );
    KUN.Touch.Set.X( parameters.varX );
    KUN.Touch.Set.Y( parameters.varY );
    KUN.Touch.Set.Counter( parameters.varCounter );
    KUN.Touch.Set.Limit( parameters.limit );
    KUN.Touch.Set.Switch( parameters.touchSwitch );
    
    KunTouchImportPresets( parameters.scenePresets || '' ).forEach( preset =>  KUN.Touch.createPreset( preset.name, preset.title, preset.spots, preset.layer ) );

    KunTouchEventSetup();
    //SceneManager._screenWidth;
    //SceneManager._screenHeight;
    //window.innerWidth;

})( /* initializer */ );



