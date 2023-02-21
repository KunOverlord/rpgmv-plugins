//=============================================================================
// KunAmbientFX.js
//=============================================================================
/*:
 * @plugindesc Kun Dynamic Ambient SFX
 * @filename KunAmbientFX.js
 * @version 1.3
 * @author KUN
 * 
 * @help
 * 
 * COMMANDS:
 * 
 *      KunAmbientFX play [profile | collection]
 *      KunAmbientFX stop [ collection ]
 * 
 * 
 * @param debug
 * @text Debug
 * @desc Show debug info
 * @type Boolean
 * @default false
 * 
 * @param fps
 * @text Elapsed FPS
 * @desc Elapsed FPS to play the selection
 * @type Number
 * @min 10
 * @max 500
 * @default 60
 * 
 * @param bankData
 * @text Sound Banks
 * @desc Define here the scene preset batch to create q quick startup setup
 * @type struct<SoundBank>[]
 * 
 * @param soundCollections
 * @text Sound Collections
 * @type struct<SoundCollection>[]
 * 
 * @param musicPalette
 * @text Music Palette
 * @type struct<MusicMod>[]
 * 
 * @param ambientPalette
 * @text Ambient Sound Palette
 * @type struct<AmbientMod>[]
 */
/*~struct~AmbientMod:
 * @param name
 * @text Name
 * @desc BGS Variation Name
 * @type String
 * 
 * @param media
 * @type file
 * @text Music
 * @require 1
 * @type File
 * @dir audio/bgs/
 * 
 * @param volume
 * @type Number
 * @text Volume
 * @min 0
 * @max 100
 * @default 90
 * 
 * @param pitch
 * @type Number
 * @text Pitch
 * @min 10
 * @max 190
 * @default 100
 * 
 */
/*~struct~MusicMod:
 * @param name
 * @text Name
 * @desc Music Variation Name
 * @type String
 * 
 * @param media
 * @type file
 * @text Music
 * @require 1
 * @type File
 * @dir audio/bgm/
 * 
 * @param volume
 * @type Number
 * @text Volume
 * @min 0
 * @max 100
 * @default 90
 * 
 * @param pitch
 * @type Number
 * @text Pitch
 * @min 0
 * @max 200
 * @default 100
 * 
 */
/*~struct~SoundCollection:
 * @param name
 * @text Name
 * @desc Scene descriptor (editor only)
 * @type String
 * @default sfz-zone
 * 
 * @param bgm
 * @text Background Music
 * @desc describe a Bgm to play with this collection
 * @type string
 * 
 * @param bgs
 * @text Background Sound
 * @desc describe a BgS to play with this collection
 * @type string
 * 
 * @param list
 * @text Sound Bank Collection
 * @type Text[]
 */
/*~struct~SoundBank:
 * @param name
 * @text Name
 * @desc Scene descriptor (editor only)
 * @type String
 * @default new-interactive-scene
 * 
 * @param seLayer
 * @text Sound Effect Layers
 * @type file[]
 * @require 1
 * @dir audio/sfx/
 * 
 * @param mod
 * @text Modulation variation
 * @type Number
 * @min 0
 * @max 100
 * @default 20
 * 
 * @param pan
 * @text Pan variation
 * @type Number
 * @min 0
 * @max 100
 * @default 20
 * 
 * @param volume
 * @text Volume variation
 * @type Number
 * @min 0
 * @max 100
 * @default 20
 * 
 * @param min
 * @text Min Miliseconds
 * @type Number
 * @min 1
 * @default 5
 * 
 * @param max
 * @text Max Miliseconds
 * @type Number
 * @min 2
 * @default 10
 * 
 */

/**
 * @description KUN Modules
 * @type KUN
 */
var KUN = KUN || {};

function KunAmbientFX(){

    var _controller = {
        'banks': {},
        'collections':{},
        'playing':false,
        'timer':0,
        'fps':60,
        'bgm':{},
        'bgs':{},
        'debug': false,
        'selection':{
            //'name':'',
            'bgm':'',
            'bgs': '',
            'transition': 0,
        },
    };
    this.Set = {
        'Debug': debug => _controller.debug = (typeof debug === 'boolean' && debug),
        'Elapsed': fps => _controller.fps = parseInt( fps || 1 ),
    };
    /**
     * @returns Boolean
     */
    this.debug = () => _controller.debug;
    /**
     * @param {String} name 
     * @param {Array} layers 
     * @param min
     * @param max
     * @param mod
     * @param pan
     * @param volume
     * @returns KunAmbientFX
     */
    this.addBank = function( name , layers , min , max , mod , pan , volume  ){
        if( !this.hasBank( name ) ){
            _controller.banks[ name ] = new KunSoundBank( name , layers , min , max , mod , pan , volume );
        }
        return this;
    };
    /**
     * @param {String} id 
     * @param {String} media 
     * @param {Number} volume 
     * @param {Number} pitch 
     * @returns KunAmbientFX
     */
    this.addBgm = function( id , name , volume , pitch ){
        if( !this.hasBgm( id ) && name.length ){
            _controller.bgm[ id ] = {
                'id': id,
                'name':name,
                'volume': volume || 90,
                'pitch': pitch || 0,
            };
        }
        return this;
    };
    /**
     * 
     * @param {String} id 
     * @param {String} name 
     * @param {Number} volume 
     * @param {Number} pitch 
     * @returns KunAmbientFX
     */
    this.addBgs = function( id , name , volume , pitch ){
        if( !this.hasBgs( id ) && name.length ){
            _controller.bgs[ id ] = {
                'id':id,
                'name': name,
                'volume': volume || 60,
                'pitch': pitch || 0,
            };
        }
        return this;
    };
    /**
     * @param {String} id
     * @param {Boolean} playing
     * @returns Boolean
     */
    this.hasBgm = function( id , playing ){
        if( id.length > 0 && _controller.bgm.hasOwnProperty( id ) ){
            if( typeof playing === 'boolean' ){
                return AudioManager.isPlayingBgm( _controller.bgm[id] ) === playing;
            }
            return true;
        }
        return false;
    };
    /**
     * @param {String} id
     * @param {Boolean}  playing
     * @returns Boolean
     */
    this.hasBgs = function( id , playing ){
        if( id.length > 0 && _controller.bgs.hasOwnProperty( id ) ){
            //console.log( AudioManager.isCurrentBgs);
            if( typeof playing === 'boolean' ){
                return AudioManager.isPlayingBgs( _controller.bgs[id] ) === playing;
            }
            return true;
        }
        return false;
    };
    /**
     * @param {String} bank 
     * @returns Boolean
     */
    this.hasBank = function( bank ){
        return _controller.banks.hasOwnProperty( bank );
    };
    /**
     * @param {String} id 
     * @param {Boolean} playing
     * @returns Boolean
     */
    this.getBgm = function( id , playing ){ return this.hasBgm( id , playing ) ? _controller.bgm[id] : null; };
    /**
     * @param {String} id 
     * @param {Boolean} playing
     * @returns Boolean
     */
    this.getBgs = function( id ,playing ){ return this.hasBgs(id,playing ) ? _controller.bgs[id] : null; };
    /**
     * @param {Boolean} list 
     * @returns Array | Object
     */
    this.musics = function( list ){
        return typeof list === 'boolean' && list ? Object.values( _controller.bgm ) : _controller.bgm;
    };
    this.ambients = function( list ){
        return typeof list === 'boolean' && list ? Object.values( _controller.bgs ) : _controller.bgs;
    }
    /**
     * @param {Boolean} list 
     * @returns Array | Object
     */
    this.banks = function( list ){
        return typeof list === 'boolean' && list ? Object.values( _controller.banks ) : _controller.banks;
    };
    /**
     * @param {Boolean} list 
     * @returns Array | Object
     */
    this.collections = function( list ){
        return typeof list === 'boolean' && list ? Object.values( _controller.collections ) : _controller.collections;
    };
    /**
     * @param {String} name 
     * @param {String[]} banks 
     * @param {String} bgm
     * @param {String} bgs
     * @returns KunAmbientFX
     */
    this.addCollection = function( name , banks , bgm , bgs ){
        if( !this.hasCollection(name ) && Array.isArray( banks ) ){
            _controller.collections[ name ] = {
                'bgm': bgm || '',
                'bgs': bgs || '',
                'banks': banks,
            }
        }
        return this;
    };
    /**
     * @param {String} name 
     * @returns Boolean
     */
    this.hasCollection = function( name ){
        return _controller.collections.hasOwnProperty( name );
    };
    /**
     * @param {String} music 
     * @param {String} sound 
     * @returns 
     */
    this.enqueueMedia = function( music , sound ){
        if( this.hasBgm(music,false) ){
            _controller.selection.bgm = music;
            AudioManager.fadeOutBgm(1);
        }
        if( this.hasBgs(sound,false) ){
            _controller.selection.bgs = sound;
            AudioManager.fadeOutBgs( 2 );
        }
        if( _controller.selection.bgs.length + _controller.selection.bgm.length > 0 ){
            _controller.selection.transition = 3;
        }
        return this;
    };
    /**
     * @returns Boolean
     */
    this.running = () => _controller.playing;
    /**
     * @returns Number
     */
    this.activeBanks = () => this.banks(true).filter( bank => bank.playing() ).length;
    /**
     * @returns Number
     */
    this.activeMedia = function(){
        return this.currentBgm().length ? 1 : 0 + this.currentBgs().length ? 1 : 0;
    };
    /**
     * @returns Number
     */
    this.waitFps = () => _controller.fps;
    /**
     * @returns Number
     */
    this.elapsed = () => _controller.fps - _controller.timer;
    /**
     * 
     */
    this.update = function(){
        if( this.running() ){
            _controller.timer = ++_controller.timer % this.waitFps();
            if(_controller.timer === 0 ){
                //run
                if( this.updateMedia() + this.updateSelection()  === 0 ){
                    _controller.playing = false;
                }
            }    
        }
    };
    /**
     * @returns KunAmbientFX
     */
    this.updateMedia = function(){
        if( this.transition() > 0 ){
            _controller.selection.transition--;
            if( this.transition() > 0 ){
                return this.transition();
            }
            else{
                if( this.currentBgm().length ){
                    var bgm = this.getBgm(this.currentBgm(),false);
                    if( bgm !== null ){
                       AudioManager.playBgm( bgm );
                    }
               }
               if( this.currentBgs().length ){
                    var bgs = this.getBgs(this.currentBgs(),false);
                    if( bgs !== null ){
                       AudioManager.playBgs( bgs );
                    }
               }               
            }
        }
        return this.activeMedia();
    };
    /**
     * @returns number Active Banks
     */
    this.updateSelection = function(){
        var count = 0;
        this.banks(true).filter( bank => bank.playing() ).forEach( function( bank ){
            if( bank.update() ){
                //playing media ...
            }
            count++;
        });
        return count;
    };
    /**
     * @param {String} name 
     * @returns KunAmbientFX
     */
    this.randomSfx = function( name ){
        if( this.hasBank( name ) ) {
            var bank = _controller.banks[ name ];
            var selection = bank.sfx[ Math.floor( Math.random() * bank.sfx.length ) ];
            AudioManager.playSfx({
                'name': selection ,
                'pan': 100 + Math.floor((Math.random() - Math.random()) * bank.pan ), 
                'pitch': 100 + Math.floor((Math.random() - Math.random()) * bank.mod ), 
                'volume': 100 - Math.floor((Math.random() ) * bank.volume )
            } );
        }
        return this;
    };
    /**
     * @param {String} bank 
     * @returns Boolean
     */
    this.isPlayingBank = function( bank ){
        return this.hasBank( bank ) && _controller.banks[bank].playing();
    };
    /**
     * @param {String} selection 
     * @returns KunAmbientFX
     */
    this.play = function( selection ){
        if( this.hasCollection( selection ) ){
            var _collection = _controller.collections[selection];
            this.enqueueMedia(_collection.bgm,_collection.bgs);
            _collection.banks.forEach( function( bank ){
                //resetthe sound bank
                if( _controller.banks.hasOwnProperty(bank) ){
                    _controller.banks[bank].play();
                }
            });

            if( this.debug() ){
                KunAmbientFX.DebugLog( `Playing collection ${selection}` );
            }
            _controller.playing = true;
        }
        else if( this.hasBank( selection ) && !this.isPlayingBank( selection ) ){
            _controller.banks[selection].play();
            _controller.playing = true;
        }
        return this;
    };
    /**
     * @param {String} bank 
     * @returns KunAmbientFX
     */
    this.stop = function( bank ){
        if( this.hasBank(bank) && this.isPlayingBank( bank ) ) {
            _controller.banks[bank].stop();
        }
        return this;
    };
    /**
     * @returns KunAmbientFX
     */
    this.stopAll = function(){
        this.banks(true).filter( bank => bank.playing() ).forEach(function( bank ){
            bank.stop();
        });
        return this.clearSelection();
    };
    /**
     * @returns KunAmbientFX
     */
    this.clearSelection = function(){
        //_controller.selection.name = '';
        _controller.selection.bgm = '';
        _controller.selection.bgs = '';
        _controller.selection.transition = 0;
        _controller.playing = false;
        return this;
    };
    /**
     * @returns Number
     */
    this.transition = () => _controller.selection.transition;
    /**
     * @returns String
     */
    this.currentBgs = () => _controller.selection.bgs;
    /**
     * @returns String
     */
    this.currentBgm = () => _controller.selection.bgm;
};
/**
 * 
 * @param {String} name 
 * @param {Array} layers 
 * @param {Number} elapsedMin 
 * @param {Number} elapsedMax 
 * @param {Number} modulation 
 * @param {Number} pan 
 * @param {Number} volume 
 */
function KunSoundBank( name , layers , elapsedMin , elapsedMax , modulation , pan , volume ){
    
    this._name = name || 'sound-bank';
    this._layers = Array.isArray(layers) ? layers : [];
    this._min = elapsedMin;
    this._max = elapsedMax;
    this._mod = modulation || 100;
    this._pan = pan || 100;
    this._volume = volume || 90;
    this._playing = false;

    this._elapsed = 0;
    /**
     * @returns KunSoundBank
     */
    this.play = function(){
        if( !this._playing ){
            this._playing = true;
            this.elapsed();
        }
        return this;
    };
    /**
     * @returns KunSoundBank
     */
    this.stop = function(){
        if( this._playing ){
            this._playing = false;
            this._elapsed = 0;
        }
        return this;
    };
    /**
     * @returns Boolean
     */
    this.playing = function(){
        return this._playing;
    };
    /**
     * @returns STring
     */
    this.toString = function(){
        return this.name();
    };
    /**
     * @returns String
     */
    this.name = function(){
        return this._name;
    };
    /**
     * @returns Number
     */
    this.randomPitch = function(){
        return 100 + Math.floor((Math.random() - Math.random()) * this._mod );
    };
    /**
     * @returns Number
     */
    this.randomVolume = function(){
        return 100 + Math.floor((Math.random() - Math.random()) * this._volume );
    };
    /**
     * @returns Number
     */
    this.randomPan = function(){
        return 100 + Math.floor((Math.random() - Math.random()) * this._pan );
    };
    /**
     * @returns String
     */
    this.selection = function(){
        return this._layers.length > 0 ? this._layers[ Math.floor(Math.random() * this._layers.length) ] : '';
    };
    /**
     * @returns Boolean
     */
    this.update = function(  ){
        if( this.playing() ){
            if( this._elapsed > 0 ){
                this._elapsed--;
            }
            else{
                this.playSfx().elapsed();
                if(KUN.AmbientFX.debug()){
                    KunAmbientFX.DebugLog( `${this.toString()} : ${this._elapsed}` );
                }
                return true;
            }    
        }
        return false;
    };
    /**
     * @returns KunSoundBank
     */
    this.elapsed = function(){
        this._elapsed = Math.floor( Math.random() * (this._max - this._min)) + this._min;
        return this;
    };
    /**
     * @returns KunSoundBank
     */
    this.playSfx = function(){
        var selection = this.selection();
        if( selection.length ){
            AudioManager.playSfx({
                'name': selection ,
                'pan': this.randomPan(), 
                'pitch': this.randomPitch(), 
                'volume': this.randomVolume()
            } );
    
        }
        return this;
    };
};

/**
 * Show a notification message
 * @param {String} message 
 */
KunAmbientFX.Notify = function( message ){

    if( typeof kun_notify === 'function' ){
        kun_notify( message );
    }
    else if( KUN.AmbientFX.debug( ) ) {
        KunAmbientFX.DebugLog( message );
    }
};
/**
 * @param {String|Object} message 
 */
KunAmbientFX.DebugLog = function( message ){
    if( typeof message === 'object' ){
        console.log( `[ KunAmbientFX Debug ] ${message.toString()}` );
    }
    else{
        console.log( `[ KunAmbientFX Debug ] ${message}` );
    }
};

function KunAmbientFX_SetupCommands(){
    var _KunTouch_PluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _KunTouch_PluginCommand.call(this, command, args);
            if (command === 'KunAmbientFX') {
                if( args && args.length ){
                    switch (args[0]) {
                        case 'play':
                            if( args.length > 1 ){
                                KUN.AmbientFX.play( args[1] );
                            }
                            break;
                        case 'stop':
                            if( args.length > 1 ){
                                KUN.AmbientFX.stop( args[1] );
                            }
                            else{
                                KUN.AmbientFX.stopAll();
                            }
                            break;
                    }
                }
            };
    };
}

function KunAmbientFX_SetupMap(){
    var _KunAmbientFX_MapUpdate = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function( ) {
        
        _KunAmbientFX_MapUpdate.call( this );
        if( KUN.AmbientFX.update() ){
            //update the DayTimeController
            //
            if( KUN.AmbientFX.debug()){
                KunAmbientFX.DebugLog('SFX updated!!');
            }
        }
    };
}

function KunAmbientFX_Initialize(){
    
    AudioManager._kunSfxBuffers = [];
    AudioManager._kunSfxVolume = 100;

    AudioManager.sfxDuration = function(sfx) {
        return 0;
    };

    AudioManager.playSfx = function(sfx) {
        if (sfx.name) {
            this._kunSfxBuffers = this._kunSfxBuffers.filter(function(audio) {
                return audio.isPlaying();
            });
            var buffer = this.createBuffer('sfx', sfx.name);
            this.updateSfxParameters(buffer, sfx);
            buffer.play(false);
            this._kunSfxBuffers.push(buffer);
        }
    };
    AudioManager.updateSfxParameters = function(buffer, sfx) {
        this.updateBufferParameters(buffer, this._kunSfxVolume, sfx);
    };
    AudioManager.stopSfx = function() {
        this._kunSfxBuffers.forEach(function(buffer) {
            buffer.stop();
        });
        this._kunSfxBuffers = [];
    };

    //override and improve isCurrentBgm and isCurrentBgs from vanillas
    AudioManager.isPlayingBgs = function(bgs) {
        return (this._currentBgs !== null && this._bgsBuffer !== null && this._currentBgs.name === bgs.name);
    };
    AudioManager.isPlayingBgm = function(bgm) {
        return (this._currentBgm !== null && this._bgmBuffer !== null && this._currentBgm.name === bgm.name);
    };
}
/**
 * @param {String} bank 
 * @returns Boolean
 */
function kun_ambientfx_playing( bank ){
    return KUN.AmbientFX.isPlayingBank( bank );
}

/**
 * Import From Parameter DB
 * @param {String} soundBank 
 * @returns 
 */
function KunAmbientFXImport( soundBank ){

    var _output = [];
    ( soundBank.length > 0 ? JSON.parse( soundBank ) : [] ).map( bank => bank.length > 0 ? JSON.parse(bank) : null ).filter( bank => bank !== null ).forEach( function( bank ){
        var _bank = {
            'name': bank.name.toLowerCase().replace(/([\s\_]+)/g,'-'),
            'sfx': [],
            'min': parseInt( bank.min ),
            'max': parseInt( bank.max ),
            'mod': parseInt( bank.mod ),
            'pan': parseInt( bank.pan ),
            'vol': parseInt( bank.volume ),
        };
        var _sfx = bank.seLayer.length > 0 ? JSON.parse( bank.seLayer ) : [];
        _sfx.forEach( sfx => _bank.sfx.push( sfx ) );
        _output.push( _bank );
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

    var parameters = PluginManager.parameters('KunAmbientFX');
    KUN.AmbientFX = new KunAmbientFX();
    KUN.AmbientFX.Set.Debug( parameters.debug === 'true' );
    KUN.AmbientFX.Set.Elapsed( parameters.fps );

    KunAmbientFXImport( parameters.bankData || '' ).forEach( bank =>  KUN.AmbientFX.addBank( bank.name, bank.sfx , bank.min , bank.max , bank.mod , bank.pan , bank.vol , bank.bgm ) );

    if( parameters.soundCollections.length > 0 ){
        JSON.parse( parameters.soundCollections ).map( collection => collection.length > 0 ? JSON.parse(collection) : {} ).forEach( function( collection ){
            var list = collection.list.length > 0 ? JSON.parse(collection.list) : [];
            if( list.length ){
                KUN.AmbientFX.addCollection(
                    collection.name.toLowerCase().replace(/([\s\_]+)/g,'-'),
                    list ,
                    collection.bgm,
                    collection.bgs );
            }
        });
    }

    if( parameters.musicPalette.length > 0 ){
        JSON.parse( parameters.musicPalette ).map( bgm => bgm.length > 0 ? JSON.parse( bgm ) : {} ).forEach( function(bgm ){
            KUN.AmbientFX.addBgm( bgm.name , bgm.media , parseInt( bgm.volume ) , parseInt( bgm.pitch ) );
        });
    }
    if( parameters.ambientPalette.length > 0 ){
        JSON.parse( parameters.ambientPalette ).map( bgs => bgs.length > 0 ? JSON.parse( bgs ) : {} ).forEach( function( bgs ){
            KUN.AmbientFX.addBgs( bgs.name , bgs.media , parseInt( bgs.volume ) , parseInt( bgs.pitch ) );
        });
    }
    //console.log( KUN.AmbientFX.musics(true));
    //console.log( KUN.AmbientFX.ambients(true));

    KunAmbientFX_Initialize();
    KunAmbientFX_SetupMap();
    KunAmbientFX_SetupCommands();


})( /* initializer */ );



