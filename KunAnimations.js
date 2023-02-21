//=============================================================================
// KunAnimations.js
//=============================================================================
/*:
 * @plugindesc KunAnimations
 * @filename KunAnimations.js
 * @version 1.2
 * @author KUN
 * 
 * @help
 * 
 * COMMANDS:
 * 
 *      KunAnimations preset scene-name
 *          Load an interactive scene preset
 * 
 * @param debug
 * @text Debug
 * @desc Show debug info
 * @type Boolean
 * @default false
 * 
 * @param defaultFPS
 * @text Master Frame Time
 * @desc default frame time
 * @type Number
 * @min 1
 * @default 10
 * 
 * @param controllers
 * @type struct<Controller>[]
 * @text Animation Controllers
 * @desc Define the list of Animation Controllers
 */
/*~struct~Controller:
 *
 * @param source
 * @text Bitmap Source
 * @desc SpriteSheet
 * @type file
 * @required 1
 * @dir img/pictures/
 * 
 * @param cols
 * @text Columns
 * @type Number
 * @min 1
 * @max 32
 * @default 1
 * 
 * @param rows
 * @text Rows
 * @type Number
 * @min 1
 * @max 32
 * @default 1
 * 
 * @param framesets
 * @type struct<FrameSet>[]
 * @text Framesets
 * @desc Frameset Collection
 * 
 */
/*~struct~FrameSet:
 * 
 * @param name
 * @text Name
 * @type string
 * @default new-frameset
 * 
 * @param frames
 * @text Frames
 * @type Number[]
 * @min 0
 * @desc List of frames to play in this animation
 * 
 * @param type
 * @text Behavior Type
 * @type Select
 * @option Forward (default)
 * @value forward
 * @option Reverse
 * @value reverse
 * @option Ping-Pong
 * @value ping-pong
 * @default default
 * 
 * @param elapsed
 * @text Elapsed FPS
 * @desc Frames to animate. Leave 0 to use the master FPS counter.
 * @type Number
 * @min 0
 * @default 0
 * 
 * @param limit
 * @type Number
 * @text Iteration Limit
 * @desc number of times the animation will play. Leave it to 0 for endless loops
 * @default 0
 * 
 * @param next
 * @text Next FrameSets
 * @type String[]
 * @desc Define the next frameset to call. If more than one specified, they will be randomly called
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
function KunAnimatons() {

    var _manager = {
        'debug':false,
        'fps': 20,
        'controllers': {
            //scene presets
        },
        'overrides': {
            //
        },
    };

    this.Set = {
        'Debug': ( debug ) => _manager.debug = typeof debug === 'boolean' && debug || false,
        'FPS': (fps) => _manager.fps = parseInt( fps ) || 20,
    };
    /**
     * @returns Number
     */
    this.defaultFps = () => _manager.fps;

    /**
     * @param {KunAnimationController} controller 
     * @returns KunAnimations
     */
    this.add = function( controller ){
        if( controller instanceof KunAnimationController && !this.has(controller.name()) ){
            _manager.controllers[controller.name()] = controller;
        }
        return this;
    };
    /**
     * @param {String} name 
     * @returns Boolean
     */
    this.has = function( name ){
        return _manager.controllers.hasOwnProperty( name );
    }

    /**
     * @returns Array
     */
    this.list = ( list ) => typeof list === 'boolean' && list ? Object.values( _manager.controllers ) : _manager.controllers;
  

    /**
     * 
     * @param {String} pictureName 
     * @returns {KunAnimationController}
     */
    this.importAnimation = function( pictureName ){
        return this.has(pictureName) ? _manager.controllers[pictureName].instance() : null;
    };

    /**
     * @param {String} pictureName 
     * @param {String} frameSetName 
     * @returns 
     */
    this.overrideSet = function( pictureName , frameSetName ){

        _manager.overrides[ pictureName ] = frameSetName;

        return this;
    };
    /**
     * 
     * @param {String} name 
     * @returns String
     */
    this.getOverride = function( name ){
        if( _manager.overrides.hasOwnProperty( name ) ){
            var override = _manager.overrides[name];
            delete _manager.overrides[name];
            return override;
        }
        return '';
    };

    return this;
}

KunAnimatons.Behavior = {
    'Forward': 'forward',
    'Reverse': 'reverse',
    'PingPong': 'ping-pong',
};


/**
 * Show a notification message
 * @param {String} message 
 */
KunAnimatons.Notify = function( message ){

    if( typeof kun_notify === 'function' ){
        kun_notify( message );
    }
    else if( KUN.Animations.debug( ) ) {
        console.log( message )
    }
};

function KunAnimationController(){
    this.initialize.apply( this , arguments );
}

KunAnimationController.prototype.initialize = function( name , cols , rows ){

    this._name = name;
    this._cols = cols || 1;
    this._rows = rows || 1;
    this._fs = {};
    this._elapsed = 0;
    this._loopCount = 0;
    this._forward = true;
    this._playing = true;

    this._index = 0;
    this._current = '';
};
KunAnimationController.prototype.toString = function(){ return this.name(); };
/**
 * @returns String
 */
KunAnimationController.prototype.name = function(){ return this._name; };
/**
 * @returns KunAnimationFrameSet
 */
KunAnimationController.prototype.current = function(){ return this.has(this._current) ? this._fs[this._current] : null; };
/**
 * @returns Boolean
 */
KunAnimationController.prototype.playing = function(){ return this._playing; }
/**
 * @returns KunAnimationController
 */
KunAnimationController.prototype.stop = function(){
    this._playing = false;
    return this;
};
/**
 * @returns KunAnimationController
 */
KunAnimationController.prototype.resume = function(){
    this._playing = true;
    return this;
};
/**
 * @returns Number
 */
KunAnimationController.prototype.getFrame = function(){
    return this.has(this._current) ? this._fs[this._current].getFrame( this._index) : 0;
};
/**
 * @returns Number
 */
KunAnimationController.prototype.index = function(){ return this._index; }
/**
 * @returns Number
 */
KunAnimationController.prototype.cols = function(){ return this._cols; }
/**
 * @returns Number
 */
KunAnimationController.prototype.rows = function(){ return this._rows; }
/**
 * @returns Number
 */
KunAnimationController.prototype.totalFrames = function(){ return this._cols * this._rows; };
/**
 * @param {String} fs 
 * @returns Boolean
 */
KunAnimationController.prototype.has = function( fs ){ return fs.length > 0 && this._fs.hasOwnProperty( fs ); }
/**
 * @param {KunAnimationFrameSet} frameSet 
 * @returns {KunAnimationController}
 */
KunAnimationController.prototype.add = function( frameSet ){
    if( frameSet instanceof KunAnimationFrameSet ){
        this._fs[ frameSet.name() ] = frameSet;
        if( this._current.length === 0 ){
            this._current = frameSet.name();
        }
    }
    return this;
};
/**
 * @param {Boolean} list 
 * @returns KunAnimationFrameSet[] | Object
 */
KunAnimationController.prototype.frameSets = function( list ){
    return typeof list === 'boolean' && list ? Object.values( this._fs ) : this._fs;
}
/**
 * @returns {Number}
 */
KunAnimationController.prototype.countFrames = function(){
    return this.has(this._current) ? this.current().count() : 0;
};
/**
 * @param {String} fs 
 * @returns KunAnimationController
 */
KunAnimationController.prototype.changeFrameSet = function( setName ){
    if( this.has( setName ) ){
        this._current = setName;
        console.log( `Switched to FrameSet ${this._current} (${this.current().frames()})` );
        return this.resetCounters();
    }
    return this;
}
/**
 * @returns {KunAnimationController}
 */
KunAnimationController.prototype.next = function(){
    var next = this.has(this._current) ? this.current().getNext() : '';
    if( next.length > 0 ){
        this._current = next;
        console.log( `Switched to FrameSet ${this._current} (${this.current().frames()})` );
        return this.resetCounters();
    }
    this._playing = false;
    return this;
};
/**
 * @returns {KunAnimationController}
 */
KunAnimationController.prototype.resetCounters = function(){
    this._loopCount = this.current().loops();
    switch(this.current().behavior()){
        case KunAnimatons.Behavior.Reverse:
            this._forward = false;
            this._index = this.countFrames() - 1;
            break;
        case KunAnimatons.Behavior.Forward:
            this._forward = true;
            break;
        case KunAnimatons.Behavior.PingPong:
            this._forward = true;
            break;
    }
    return this;
}
/**
 * @returns Number
 */
KunAnimationController.prototype.FPS = function(){
    return this.has(this._current) ? this._fs[this._current].fps() : KUN.Animations.defaultFps();
};
/**
 * @returns {KunAnimationController}
 */
KunAnimationController.prototype.update = function(){
    if( this.playing() ){
        this._elapsed = ++this._elapsed % this.FPS();
        if( this._elapsed === 0 ){
            switch( this.current().behavior() ){
                case KunAnimatons.Behavior.PingPong:
                    this.updatePingPong();
                    break;
                case KunAnimatons.Behavior.Reverse:
                    this.updateReverse();
                    break;
                case KunAnimatons.Behavior.Forward:
                default:
                    this.updateForward();
                    break;
            }
            this.changeFrameSet(KUN.Animations.getOverride(this._name));
    
            return true;
        }    
    }
    return false;
};
/**
 * @returns KunAnimationController
 */
KunAnimationController.prototype.updatePingPong = function(){
    var frameCount = this.countFrames();
    if( this._forward ){
        this._index = ++this._index % frameCount;
        if( this._index === frameCount - 1 ){
            this._forward = false;
        }
    }
    else if(this._index > 0){
        //reverse
        this._index--;
    }
    //after complete the round
    if( this._index === 0){
        if( this._loopCount > 0 ){
            this._loopCount--;
            if( this._loopCount === 0 ){
                //change state
                return this.next();
            }
            console.log(`Ping-Pong count ${this._loopCount}`);
        }
        else{
            console.log('Infinite ping-pong');
        }
        this._forward = true;
    }
    return this;
}
/**
 * @returns KunAnimationController
 */
KunAnimationController.prototype.updateReverse = function(){
    if( this._index > 0 ){
        this._index--;
    }
    else{
        if( this._loopCount > 0 ){
            this._loopCount--;
            if( this._loopCount === 0 ){
                //change state
                return this.next();
            }
            console.log(`Reverse Loop count ${this._loopCount}`);
        }
        else{
            console.log('Infinite reverse-loop');
        }
        this._index = this.countFrames()-1;
    }
    return this;
}
/**
 * @returns KunAnimationController
 */
KunAnimationController.prototype.updateForward = function(){
    var frameCount = this.countFrames()
    this._index = ++this._index % frameCount;
    if( this._index === frameCount - 1 ){
        if( this._loopCount > 0 ){
            this._loopCount--;
            if( this._loopCount === 0 ){
                //change state
                return this.next();
            }
            console.log(`Loop count ${this._loopCount}`);
        }
        else{
            console.log('Infinite loop');
        }
        this._index = 0;
    }
    return this;
}

/**
 * @returns KunAnimationController
 */
KunAnimationController.prototype.instance = function(){
    var copy = new KunAnimationController( this._name, this._cols,this._rows );
    copy._current = this._current;
    copy._fs = this._fs;
    return copy.resetCounters();
};
KunAnimationController.prototype.dump = function(){
    return this;
};





function KunAnimationFrameSet(){ this.initialize.apply( this , arguments ); };
//KunAnimationFrameSet.prototype = Object.create(Sprite.prototype);
/**
 * 
 * @param {String} name 
 * @param {String} type 
 * @param {Number} fps 
 * @param {Number} loops 
 * @param {String} next 
 */
KunAnimationFrameSet.prototype.initialize = function( name , type , fps, loops , next ){
    this._name = name.toLowerCase().replace(/[\s\_]/,'-');
    this._fps = typeof fps === 'number' && fps >= 0 ? fps : 0;
    this._frames = [];
    this._type = type || KunAnimatons.Behavior.Default;
    this._loops = loops || 0;
    this._next = Array.isArray( next ) ? next  : ( typeof next === 'string' && next.length ? [next] : [] );
};
/**
 * @returns String
 */
KunAnimationFrameSet.prototype.behavior = function(){
    return this._type;
};
/**
 * @param {Number} frame 
 * @returns KunAnimationFrameSet
 */
KunAnimationFrameSet.prototype.add = function( frame ){
    this._frames.push( frame );
    return this;
};
/**
 * @returns Number
 */
KunAnimationFrameSet.prototype.fps = function(){
    return this._fps > 0 ? this._fps : KUN.Animations.defaultFps();
};
/**
 * @returns Number
 */
KunAnimationFrameSet.prototype.loops = function(){
    return this._loops;
};
/**
 * @returns Number
 */
KunAnimationFrameSet.prototype.frames = function( ){
    return this._frames.length > 0 ? this._frames : [0];
}
KunAnimationFrameSet.prototype.getFrame = function( index ){
    return this._frames.length > index ? this._frames[index] : 0;
};
KunAnimationFrameSet.prototype.count = function(){
    return this.frames().length;
};
KunAnimationFrameSet.prototype.name = function(){
    return this._name;
};
/**
 * @returns String
 */
KunAnimationFrameSet.prototype.getNext = function(){
    if( this._next.length === 0 ) return '';
    var next = this._next.length > 1 ? Math.floor( Math.random() * this._next.length ) : 0;    
    return this._next[ next ];
}



function KunAnimatons_RegisterManagers(){

    var _kunAnimations_Initialize_Sprite = Sprite_Picture.prototype.initialize;
    Sprite_Picture.prototype.initialize = function( pictureId ){
        _kunAnimations_Initialize_Sprite.call(this,pictureId);
        this.clearAnimation();
    };

    var _kunAnimations_Load_Bitmap = Sprite_Picture.prototype.loadBitmap;
    Sprite_Picture.prototype.loadBitmap = function() {
        _kunAnimations_Load_Bitmap.call(this);
        if( this.importAnimation() ){
            //this.bitmap.addLoadListener(this.updateAnimatedPictureFrame.bind(this));
            this.bitmap.addLoadListener(this.updateAnimation.bind(this,true));
        }
        else{
            //this.bitmap.addLoadListener(this.resetFrame.bind(this));
        }
    };

    var _kunAnimations_Update_Sprite = Sprite_Picture.prototype.update;
    Sprite_Picture.prototype.update = function(){
        _kunAnimations_Update_Sprite.call( this );
        //update the animation controller
        this.updateAnimation();
    };
    /**
     * @param {Boolean} force
     * @returns Boolean
     */
    Sprite_Picture.prototype.updateAnimation = function( force ){
        //if(  this.isLoaded() && this.isAnimated() ){
        if( this.isAnimated() && this.isLoaded() ){
            if( this._animationController.update() || force ){
                var index = this._animationController.getFrame();
                var w = this.bitmap.width / this._animationController.cols();
                var h = this.bitmap.height / this._animationController.rows();
                var x = index % this._animationController.cols() * w;
                var y = Math.floor(index / this._animationController.cols()) * h;
                this.setFrame( x, y, w, h);
                return true;                    
            }
        }
        return false;
    };
    /**
     * @returns Boolean
     */
    Sprite_Picture.prototype.isAnimated = function(){
        return typeof this._animationController !== 'undefined' && this._animationController !== null;
    }
    /**
     * @returns Boolean
     */
    Sprite_Picture.prototype.importAnimation = function(){
        if( this._pictureName.length > 0 ){
            this._animationController = KUN.Animations.importAnimation( this._pictureName );
        }
        return this.isAnimated();
    };
    Sprite_Picture.prototype.clearAnimation = function(){
        this._animationController = null;
    }
    /**
     * @returns Boolean
     */
    Sprite_Picture.prototype.isLoaded = function(){
        return typeof this.bitmap !== 'undefined' && this.bitmap !== null;
    };
}


function KunAnimatons_SetupCommands(){
    var _KunAnimations_SetupCommands = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _KunAnimations_SetupCommands.call(this, command, args);
        if (command === 'KunAnimations' && args.length > 0 ) {
            switch( args[0] ){
                case 'set':
                    if( args.length > 2 ){
                        KUN.Animations.overrideSet( args[1] , args[2] );
                    }
                    break;
                case 'pause':
                    if( args.length > 1 ){
                        KUN.Animations.stop( args[1] );
                    }
                    break;
                case 'resume':
                    if( args.length > 1 ){
                        KUN.Animations.resume( args[1] );
                    }
                    break;
            }
        }
    };

}


/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

 (function( /* args */ ){

    var parameters = PluginManager.parameters('KunAnimations');
    KUN.Animations = new KunAnimatons();
    KUN.Animations.Set.Debug( parameters.debug === 'true' );
    KUN.Animations.Set.FPS( parameters.defaultFPS );

    (parameters.controllers.length > 0 ? JSON.parse(parameters.controllers ) : [] ).map( ctl => ctl.length > 0 ? JSON.parse( ctl ) : null ).forEach(function( ctl ){
        if( ctl !== null ){
            var _controller = new KunAnimationController(ctl.source,parseInt(ctl.cols),parseInt(ctl.rows));

            (ctl.framesets.length > 0 ? JSON.parse(ctl.framesets) : [] ).map( fs => fs.length > 0 ? JSON.parse(fs) : null ).forEach(function(fs){
                if( fs !== null ){
                    var _frameSet = new KunAnimationFrameSet( fs.name , fs.type , parseInt(fs.elapsed) , parseInt( fs.limit), fs.next.length > 0 ? JSON.parse(fs.next) : '' );
                    ( fs.frames.length > 0 ? JSON.parse(fs.frames) : [] ).map( frame => parseInt( frame ) ).forEach(function( frame ){
                        _frameSet.add( frame );
                    });
                    if( _frameSet.count() > 0 ){
                        _controller.add( _frameSet );
                    }
                }
            });

            if( _controller.countFrames() ){
                KUN.Animations.add( _controller );
            }
        }
    });

    KunAnimatons_RegisterManagers();
    KunAnimatons_SetupCommands();
    //console.log( KUN.Animations.list(true) );

})( /* initializer */ );



