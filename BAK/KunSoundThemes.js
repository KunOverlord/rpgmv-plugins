//=============================================================================
// KunSoundThemes.js
//=============================================================================
/*:
 * @plugindesc Kun Dynamic Music, Ambient and SFX Themes
 * @filename KunSoundThemes.js
 * @version 1.52
 * @author KUN
 * 
 * @help
 * 
 * COMMANDS:
 * 
 *      KunSoundThemes play theme [transition]
 *          Play a theme, use transition if required
 *      KunSoundThemes stop theme
 *          Stop a playing theme
 * 
 * 
 * @param debug
 * @text Debug
 * @desc Show debug info
 * @type boolean
 * @default false
 * 
 * @param mapMeta
 * @type string
 * @text Preload Map Meta
 * @desc Capture Map meta with this tag, to activate a Sound Theme. Leave it in blank to disable
 * @default KunSoundThemes
 * 
 * @param fps
 * @text Elapsed FPS
 * @desc Elapsed FPS to play the selection
 * @type number
 * @min 10
 * @max 500
 * @default 60
 * 
 * @param themes
 * @text Sound Themes
 * @desc Define the themes to play
 * @type struct<SoundTheme>[]
 */
/*~struct~SoundTheme:
 * @param name
 * @text Name
 * @desc Scene descriptor (editor only)
 * @type string
 * @default sfz-zone
 * 
 * @param bgm
 * @text Background Music
 * @desc describe a Bgm to play with this collection
 * @type struct<MusicMod>
 * 
 * @param bgs
 * @text Background Sound
 * @desc describe a BgS to play with this collection
 * @type struct<AmbientMod>
 * 
 * @param soundEffects
 * @text Sound Effects
 * @desc Require KunSoundBanks plugin installed. USe the bank names to play a random selection.
 * @type struct<SoundPlayer>[]
 */
/*~struct~AmbientMod:
 * @param media
 * @type file
 * @text Music
 * @require 1
 * @type File
 * @dir audio/bgs/
 * 
 * @param volume
 * @type number
 * @text Volume
 * @min 0
 * @max 100
 * @default 90
 * 
 * @param pitch
 * @type number
 * @text Pitch
 * @min 10
 * @max 190
 * @default 100
 * 
 */
/*~struct~MusicMod:
 * @param media
 * @type file
 * @text Music
 * @require 1
 * @type File
 * @dir audio/bgm/
 * 
 * @param volume
 * @type number
 * @text Volume
 * @min 0
 * @max 100
 * @default 90
 * 
 * @param pitch
 * @type number
 * @text Pitch
 * @min 0
 * @max 200
 * @default 100
 * 
 */
/*~struct~SoundPlayer:
 * @param name
 * @text Name
 * @desc Scene descriptor (editor only)
 * @type String
 * @default kun-sound-bank
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
 * 
 */
function KunSoundThemes() {
    throw `${this.constructor.name} is a Static Class`;
};
/**
 * @returns KunSoundThemes
 */
KunSoundThemes.Initialize = function () {

    var parameters = this.importPluginData();

    this._themes = {};
    this._selection = ''
    this._timer = 0;
    this._fps = parseInt(parameters.fps || 60);
    this._debug = parameters.debug === 'true';
    this._mapMeta = parameters.mapMeta || '';

    return this.importThemes(parameters.themes.length > 0 ? JSON.parse(parameters.themes) : []);
};
/**
 * @returns Boolean
 */
KunSoundThemes.mapMeta = function(){
    return this._mapMeta;
};
/**
 * @returns Boolean
 */
KunSoundThemes.preloadMapMeta = function(){
    return this.mapMeta().length > 0;
};
/**
 * @returns Object
 */
KunSoundThemes.importPluginData = function () {
    return PluginManager.parameters('KunSoundThemes');
};
/**
 * @returns Boolean
 */
KunSoundThemes.soundBanksLoaded = function () {
    return typeof KunSoundBanks === 'function';
};
/**
 * @returns Boolean
 */
KunSoundThemes.debug = function () {
    return this._debug;
};
/**
 * @param {Boolean} list 
 * @returns Array | Object
 */
KunSoundThemes.themes = function (list) {
    return typeof list === 'boolean' && list ? Object.values(this._themes) : this._themes;
};
/**
 * @param {KunSoundTheme} theme 
 * @returns KunSoundThemes
 */
KunSoundThemes.addTheme = function (theme) {
    if (!this.hasTheme(theme.name())) {
        this._themes[theme.name()] = theme;
    }
    return this;
};
/**
 * @param {String} name 
 * @returns Boolean
 */
KunSoundThemes.hasTheme = function (name) {
    return typeof name === 'string' && name.length > 0 && this._themes.hasOwnProperty(name);
};
/**
 * @returns KunSoundTheme
 */
KunSoundThemes.current = function () {
    return this.hasTheme(this._selection) ? this.themes()[this._selection] : null;
};
/**
 * @returns Boolean
 */
KunSoundThemes.isActive = function () {
    return this._selection.length > 0;
};
/**
 * @returns Boolean
 */
KunSoundThemes.isRunning = function () {
    return this.current() !== null; // ? this.isActive() : false;
};
/**
 * @returns Number
 */
KunSoundThemes.waitFps = function () {
    return this._fps;
};
/**
 * @returns Number
 */
KunSoundThemes.elapsed = function () {
    return this._fps - this._timer;
};
/**
 * @returns Boolean
 */
KunSoundThemes.update = function () {
    if (this.isRunning()) {
        this._timer = ++this._timer % this.waitFps();
        if (this._timer === 0) {
            //run
            this.current().update();
            return true;
        }
    }
    else if( this.isActive()){
        this.clearSelection();
    }
    return false;
};
/**
 * @param {String} selection 
 * @param {Boolean} transition false by default to play witout fadeout
 * @returns KunSoundThemes
 */
KunSoundThemes.play = function (selection, transition ) {
    if (this.stop().hasTheme(selection)) {
        //change the theme selection
        this._selection = selection;
        //and restart with transition if required
        this.current().start(typeof transition === 'boolean' && transition);
        KunSoundThemes.DebugLog(`Playing collection ${selection}`);
    }
    return this;
};
/**
 * 
 * @returns KunSoundThemes
 */
KunSoundThemes.playFromMapMeta = function(){
    var theme = this.importMapMeta();
    //play transsition at mapload to resume after map music setup
    return theme.length > 0 ? this.play( theme , true ) : this.stop();
};
/**
 * @returns KunSoundThemes
 */
KunSoundThemes.stop = function () {
    if (this.isRunning()) {
        this.current().stop(true);
    }
    return this.clearSelection();
};
/**
 * @returns KunSoundThemes
 */
KunSoundThemes.clearSelection = function () {
    this._selection = '';
    return this;
};
/**
 * @param {Array} input 
 * @returns KunSoundThemes
 */
KunSoundThemes.importThemes = function (input) {
    if (!Array.isArray(input)) {
        input = [];
    }
    input.filter(tpl => tpl.length > 0).map(tpl => JSON.parse(tpl)).forEach(function (tpl) {
        var bgm = tpl.bgm.length ? JSON.parse(tpl.bgm) : {};
        var bgs = tpl.bgs.length ? JSON.parse(tpl.bgs) : {};
        var theme = new KunSoundTheme(
            tpl.name.toLowerCase().replace(/([\s\_]+)/g, '-'),
            bgm.media, parseInt(bgm.pitch), parseInt(bgm.volume),
            bgs.media, parseInt(bgm.pitch), parseInt(bgm.volume));

        (tpl.soundEffects.length > 0 ? JSON.parse(tpl.soundEffects) : [])
            .filter(se => se.length > 0)
            .map(se => JSON.parse(se))
            .forEach(function (se) {
                theme.add(new KunSfxPlayer(se.name, parseInt(se.min), parseInt(se.max)));
            });
        KunSoundThemes.addTheme(theme);
    });
    return this;
};
/**
 * Show a notification message
 * @param {String} message 
 */
KunSoundThemes.Notify = function (message) {
    if (typeof kun_notify === 'function') {
        kun_notify(message);
    }
    else if (KunSoundThemes.debug()) {
        KunSoundThemes.DebugLog(message);
    }
};
/**
 * @param {String} bank 
 * @returns KunSoundThemes
 */
KunSoundThemes.PlayBank = function (bank) {
    if (KunSoundThemes.soundBanksLoaded()) {
        KunSoundBanks.play(bank);
    }
    return this;
};
/**
 * @param {String} media 
 * @param {Number} volume 
 * @param {Number} pitch 
 * @param {Number} pan 
 */
KunSoundThemes.PlayBGS = function (media, volume, pitch, pan) {
    if (typeof media === 'string' && media.length > 0) {
        KunSoundThemes.DebugLog( `Playing BGS ${media}` );
        AudioManager.playBgs({
            'name': media,
            'pan': pan || 0,
            'pitch': pitch || 100,
            'volume': volume || 90,
        });
    }
    return this;
}
/**
 * @param {String} media 
 * @param {Number} volume 
 * @param {Number} pitch 
 * @param {Number} pan 
 */
KunSoundThemes.PlayBGM = function (media, volume, pitch, pan) {
    if (typeof media === 'string' && media.length > 0) {
        KunSoundThemes.DebugLog( `Playing BGM ${media}` );
        AudioManager.playBgm({
            'name': media,
            'pan': pan || 0,
            'pitch': pitch || 100,
            'volume': volume || 90,
        });
    }
    return this;
}
/**
 * @returns String
 */
KunSoundThemes.importMapMeta = function () {
    var profiles = [];
    if ($dataMap !== null && $dataMap.hasOwnProperty('meta')) {
        Object.keys($dataMap.meta).forEach(function (meta) {
            var _type = meta.split(' ');
            if (_type[0] === KunSoundThemes.mapMeta() && _type.length > 1) {
                profiles.push(_type[1]);
            }
        });
    }
    return profiles.length ? profiles[profiles.length > 1 ? Math.floor(Math.random() * profiles.length) : 0] : '';
}
/**
 * @param {String|Object} message 
 */
KunSoundThemes.DebugLog = function (message) {
    if (KunSoundThemes.debug()) {
        if (typeof message === 'object') {
            console.log(`[ KunSoundThemes Debug ] ${message.toString()}`);
        }
        else {
            console.log(`[ KunSoundThemes Debug ] ${message}`);
        }
    }
};


/*******************************************************************************************
 * @param {String} name 
 * @param {String} bgm 
 * @param {Number} bgmPitch 
 * @param {Number} bgmVol 
 * @param {String} bgs 
 * @param {Number} bgsPitch 
 * @param {Number} bgsVol 
 * @returns 
 ******************************************************************************************/
function KunSoundTheme(name, bgm, bgmPitch, bgmVol, bgs, bgsPitch, bgsVol) {
    this._name = name;
    this._bgm = {
        'media': bgm || '',
        'pitch': bgmPitch || 100,
        'volume': bgmVol || 90,
    }
    this._bgs = {
        'media': bgs || '',
        'pitch': bgsPitch || 100,
        'volume': bgsVol || 90,
    }
    this._effects = {
        //
    };
    this._playing = false;
    this._transition = 0;
    return this;
};
/**
 * @returns String
 */
KunSoundTheme.prototype.name = function () {
    return this._name;
};
/**
 * @returns String
 */
KunSoundTheme.prototype.toString = function () {
    return this.name();
};
/**
 * @returns Boolean
 */
KunSoundTheme.prototype.isActive = function () {
    return this._playing;
};
/**
 * @returns Number
 */
KunSoundTheme.prototype.transition = function () {
    return this._transition;
};
/**
 * @returns String
 */
KunSoundTheme.prototype.bgm = function () {
    return this._bgm.media;
};
/**
 * @returns Boolean
 */
KunSoundTheme.prototype.hasBgm = function () {
    return this.bgm().length > 0;
};
/**
 * @returns Boolean
 */
KunSoundTheme.prototype.isPlayingBgm = function () {
    return this.hasBgm() && AudioManager.isPlayingBgm(this.bgm());
};
/**
 * @returns String
 */
KunSoundTheme.prototype.bgs = function () {
    return this._bgs.media;
};
/**
 * @returns String
 */
KunSoundTheme.prototype.hasBgs = function () {
    return this.bgs().length > 0;
};
/**
 * @returns Boolean
 */
KunSoundTheme.prototype.isPlayingBgs = function () {
    return this.hasBgs() && AudioManager.isPlayingBgs(this.bgs());
};
/**
 * @returns Boolean
 */
KunSoundTheme.prototype.isTransition = function () {
    return this._transition > 0;
};
/**
 * @param {Boolean} list 
 * @returns Object | KunSfxPlayer[]
 */
KunSoundTheme.prototype.effects = function (list) {
    return typeof list === 'boolean' && list ? Object.values(this._effects) : this._effects;
};
/**
 * @param {KunSfxPlayer} ambientPlayer 
 * @returns KunSoundTheme
 */
KunSoundTheme.prototype.add = function (ambientPlayer) {
    if (ambientPlayer instanceof KunSfxPlayer) {
        this._effects[ambientPlayer.name()] = ambientPlayer;
    }
    return this;
};
/**
 * @returns KunSoundTheme
 */
KunSoundTheme.prototype.update = function () {
    if (this.isActive()) {
        this.effects(true).forEach(effect => effect.update());
    }
    else if (this.isTransition()) {
        //countdown until play
        if (--this._transition <= 0) {
            this.start( );
        }
    }
    else {
        //soft start transition
        this.start( true );
    }

    return this;
};
/**
 * @param {Boolean} fadeOut 
 * @returns KunSoundtheme
 */
KunSoundTheme.prototype.start = function ( fadeOut ) {
    if (typeof fadeOut === 'boolean' && fadeOut) {
        //create the enqueue effect
        var transition = 0;
        if (this.hasBgs() && !this.isPlayingBgs()) {
            transition++;
            AudioManager.fadeOutBgs(transition);
        }
        if (this.hasBgm() && !this.isPlayingBgm()) {
            transition++;
            AudioManager.fadeOutBgm(transition);
        }
        if (transition > 0) {
            this._transition = transition;
            this.stop(true);
        }
        KunSoundThemes.DebugLog( `Transition to ${this.name()} started!!` );
    }
    else {
        //abrupt transition and stop all playing media then restart banks and new theme
        this.stop();
        if (this.hasBgs() && !this.isPlayingBgs()) {
            KunSoundThemes.PlayBGS(this.bgs(), this._bgs.volume, this._bgs.pitch, 0);
        }
        if (this.hasBgm() && !this.isPlayingBgm()) {
            KunSoundThemes.PlayBGM(this.bgm(), this._bgm.volume, this._bgm.pitch, 0);
        }
        this._transition = 0;
        this._playing = true;
        KunSoundThemes.DebugLog( `${this.name()} started!!` );
    }
    return this.effects(true).forEach(effect => effect.reset());
};
/**
 * @param Boolean transition
 * @returns KunSoundTheme
 */
KunSoundTheme.prototype.stop = function (transition) {

    if (typeof transition === 'boolean' && transition) {
        AudioManager.fadeOutBgm(1);
        AudioManager.fadeOutBgs(2);
    }
    else{
        AudioManager.stopAll();
    }
    this.effects(true).forEach(effect => effect.reset());
    this._playing = false;

    return this;
};



/*******************************************************************************************
 * @param {String} name 
 * @param {Number} min 
 * @param {Number} max 
 * @returns KunSfxPlayer
 ******************************************************************************************/
function KunSfxPlayer(name, min, max) {

    this._name = name;
    this._min = min || 60;
    this._max = max || 100;
    this._elapsed = 0;
    this._ticks = 0;
    //this._layers = [];

    return this;
}
/**
 * @returns String
 */
KunSfxPlayer.prototype.name = function () {
    return this._name;
};
/**
 * @returns String
 */
KunSfxPlayer.prototype.toString = function () {
    return this.name();
};
/**
 * @returns KunSfxPlayer
 */
KunSfxPlayer.prototype.reset = function () {
    this._elapsed = Math.floor(Math.random() * (this._max - this._min)) + this._min;
    return this;
};
/**
 * @returns Number
 */
KunSfxPlayer.prototype.ticks = function () {
    return this._ticks;
};
/**
 * 
 * @param {Boolean} reset 
 * @returns Number
 */
KunSfxPlayer.prototype.elapsed = function (reset) {
    if (typeof reset === 'boolean' && reset) {
        this.reset();
    }
    return this._elapsed;
};
/**
 * @returns KunSfxPlayer
 */
KunSfxPlayer.prototype.update = function () {
    if( ++this._ticks % this._elapsed === 0 ){
        this.reset().play();
    }
    return this;
};
/**
 * @returns KunSfxPlayer
 */
KunSfxPlayer.prototype.play = function () {
    KunSoundThemes.PlayBank(this.name());
    return this;
};

/**
 * 
 */
function KunSoundThemes_SetupCommands() {
    var _KunTouch_PluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunTouch_PluginCommand.call(this, command, args);
        if (command === 'KunSoundThemes') {
            if (args && args.length) {
                switch (args[0]) {
                    case 'play':
                        if (args.length > 1) {
                            KunSoundThemes.play(args[1], args.length > 2 && args[2] === 'transition');
                        }
                        break;
                    case 'stop':
                        KunSoundThemes.stop();
                        break;
                }
            }
        };
    };
}
/**
 *
 */
function KunSoundThemes_SetupMap( preloadMeta ) {
    var _KunSoundThemes_MapUpdate = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        _KunSoundThemes_MapUpdate.call(this);
        if (KunSoundThemes.isActive()) {
            KunSoundThemes.update();
        }
    };

    if( KunSoundThemes.preloadMapMeta() ){
        //override by param
        var _KunSoundThemes_SceneMap_IsReady = Scene_Map.prototype.isReady;
        /**
         * @returns Boolean
         */
        Scene_Map.prototype.isReady = function () {
            if( _KunSoundThemes_SceneMap_IsReady.call(this)){
                
                KunSoundThemes.playFromMapMeta();
                
                return true;
            }
            return false;
        };
        KunSoundThemes.DebugLog( `Preload sound themes with meta ${KunSoundThemes.mapMeta()}` );
    }

}
/**
 * @param {String} bank 
 * @returns Boolean
 */
function kun_ambientfx_playing(bank) {
    return KunSoundThemes.isRunning();
}
/**
 * 
 */
function KunSoundThemes_AudioManager() {

    AudioManager._kunSfxBuffers = [];
    AudioManager._kunSfxVolume = 100;

    AudioManager.sfxDuration = function (sfx) {
        return 0;
    };

    AudioManager.playSfx = function (sfx) {
        if (sfx.name) {
            this._kunSfxBuffers = this._kunSfxBuffers.filter(function (audio) {
                return audio.isPlaying();
            });
            var buffer = this.createBuffer('se', sfx.name);
            //var buffer = this.createBuffer('sfx', sfx.name);
            this.updateSfxParameters(buffer, sfx);
            buffer.play(false);
            this._kunSfxBuffers.push(buffer);
        }
    };
    AudioManager.updateSfxParameters = function (buffer, sfx) {
        this.updateBufferParameters(buffer, this._kunSfxVolume, sfx);
    };
    AudioManager.stopSfx = function () {
        this._kunSfxBuffers.forEach(function (buffer) {
            buffer.stop();
        });
        this._kunSfxBuffers = [];
    };

    //override and improve isCurrentBgm and isCurrentBgs from vanillas
    AudioManager.isPlayingBgs = function (bgs) {
        return (this._currentBgs !== null && this._bgsBuffer !== null && this._currentBgs.name === bgs.name);
    };
    AudioManager.isPlayingBgm = function (bgm) {
        return (this._currentBgm !== null && this._bgmBuffer !== null && this._currentBgm.name === bgm.name);
    };
}

/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function ( /* args */) {

    KunSoundThemes.Initialize();
    KunSoundThemes_AudioManager();
    KunSoundThemes_SetupMap( );
    KunSoundThemes_SetupCommands();

})( /* initializer */);



