//=============================================================================
// KunMapThemes.js
//=============================================================================
/*:
 * @plugindesc KunMapThemes
 * @filename KunMapThemes.js
 * @author KUN
 * @version 1.01
 * 
 * @help
 * 
 * 
 * @param debug
 * @text Debug
 * @desc Show debug info
 * @type boolean
 * @default false
 * 
 * @param random
 * @type boolean
 * @text Random Override
 * @desc Random Override when many matching layers. Defaults to first matching layer in stack priority (upper to lower)
 * @default false
 * 
 * @param mapupdate
 * @type boolean
 * @text Map Update Override
 * @desc Allow Scene_Map override for update() calls. Requires KunDayTime Plugin.
 * @default false
 * 
 * @param mapautoplay
 * @type boolean
 * @text Map Autoplay Override
 * @desc Allow Scene_Map override for startup autoplay() calls. 
 * @default false
 * 
 * @param overrides
 * @type struct<Profile>[]
 * @text Map Scene Profile
 * @desc Defines map ambient overlays to apply given the selected rules
 */
/*~struct~Profile:
 * @param name
 * @text Name
 * @desc Tag a name for this override
 * @type text
 * 
 * @param maps
 * @text Map Ids
 * @desc Define the maps to override when loading
 * @type number[]
 * @min 1
 * 
 * @param presets
 * @type struct<Preset>[]
 * @text Map Layer Presets
 * @desc Layer Presets given the preset rules
 */
/*~struct~Preset:
 * @param tag
 * @type text
 * @text Tag
 * @desc label the preset used for (daytime, special scene, halloween...)
 * 
 * @param timer
 * @text Fadeoff Timeout
 * @desc how long will last the transition effect both for audio and visuals
 * @type number
 * @min 0
 * @max 200
 * @default 60
 * 
 * @param rules
 * @type struct<Rule>[]
 * @text Rules
 * 
 * @param music
 * @text Music Palette
 * @type struct<Music>[]
 * 
 * @param sound
 * @text Sound Palette
 * @type struct<Sound>[]
 * 
 * @param ambient
 * @text Ambient Sound Palette
 * @desc require KunSounds plugin active
 * @type struct<KunSound>[]
 * 
 * @param colors
 * @type struct<Color>[]
 * @text Scene Colors
 */
/*~struct~Rule:
 * @param gameVar
 * @type variable
 * @min 0
 * @default 0
 * 
 * @param operator
 * @type select
 * @option Greater
 * @value greater
 * @option Greater or Equal
 * @value greaterequal
 * @option Equal
 * @value equal
 * @option Less or Equal
 * @value lessequal
 * @option Less
 * @value less
 * @default equal
 * 
 * @param value
 * @type number
 * @min 0
 * @default 0
 * 
 * @param valueVar
 * @type boolean
 * @text Value as Variable
 * @default false
 * 
 * @param switchOn
 * @type switch[]
 * @text Switch On
 * 
 * @param switchOff
 * @type switch[]
 * @text Switch Off
 */
/*~struct~Music:
 * @param bgm
 * @type file
 * @require 1
 * @dir audio/bgm/
 * 
 * @param pan
 * @text Pan
 * @type number
 * @min -100
 * @max 100
 * @default 0
 * 
 * @param pitch
 * @text Pitch
 * @type number
 * @min 50
 * @max 150
 * @default 100
 * 
 * @param volume
 * @text Volume
 * @type number
 * @min 0
 * @max 100
 * @default 90
 */
/*~struct~Sound:
 * @param bgs
 * @type file
 * @require 1
 * @dir audio/bgs/
 * 
 * @param pan
 * @text Pan
 * @type number
 * @min -100
 * @max 100
 * @default 0
 * 
 * @param pitch
 * @text Pitch
 * @type number
 * @min 50
 * @max 150
 * @default 100
 * 
 * @param volume
 * @text Volume
 * @type number
 * @min 0
 * @max 100
 * @default 60
 * 
 */
/*~struct~KunSound:
 * @param name
 * @text Sound Palette
 * @type text
 * @desc KunSounds palette
 * 
 * @param elapsed
 * @type number[]
 * @text Elapsed Time
 * @desc Define how much time will take to play the sound
 */
/*~struct~Color:
 * @param red
 * @text Red
 * @type number
 * @min -255
 * @max 255
 * @default 0
 * 
 * @param green
 * @text Green
 * @type number
 * @min -255
 * @max 255
 * @default 0
 * 
 * @param blue
 * @text Blue
 * @type number
 * @min -255
 * @max 255
 * @default 0
 * 
 * @param tone
 * @text Tone
 * @type number
 * @min 0
 * @max 255
 * @default 0
 * 
 */

/**
 * @class {class KunMapThemes {
}
 */
class KunMapThemes {
    /**
     * 
     */
    constructor() {
        if (KunMapThemes.__instance) {
            return KunMapThemes.__instance;
        }

        KunMapThemes.__instance = this;

        this.initialize();
    }
    /**
     * @returns {KunMapThemes}
     */
    initialize() {

        const _parameters = KunMapThemes.PluginData('KunMapThemes');

        this._debug = _parameters.debug || false;
        this._random =  _parameters.random || false;

        //has KunSounds Plugin installed?
        this._kunSounds = this.hasKunSounds();
        this._mapAutoplay = _parameters.mapautoplay || false;
        this._mapUpdate = _parameters.mapupdate && this.hasKunTime();
        

        this._profiles = this.importProfiles(Array.isArray(_parameters.overrides) ? _parameters.overrides : []);
        this._layer = null;
    }

    /**
     * @returns {Boolean}
     */
    debug() { return this._debug; }
    /**
     * @returns {Boolean}
     */
    kunSounds(){ return this._kunSounds; }
    /**
     * @returns {Boolean}
     */
    hasKunSounds() {
        return $plugins.filter(plugin => plugin.name === 'KunSounds').length > 0;
    }
    /**
     * @returns {Boolean}
     */
    hasKunTime() {
        return $plugins.filter(plugin => plugin.name === 'KunDayTime').length > 0 && !!Scene_Map.prototype.onTimeChange;
    }
    /**
     * @returns {Boolean}
     */
    mapAutoPlay() { return this._mapAutoplay; }
    /**
     * @returns {Boolean}
     */
    mapUpdate() { return this._mapUpdate; }
    /**
     * @returns {Boolean}
     */
    randomLayer(){ return this._random ;}
    /**
     * @param {Boolean} match 
     * @returns {KunMapProfile[]}
     */
    profiles(match = false) {
        return match ? this._profiles.filter(profile => profile.isMap($gameMap.mapId())) : this._profiles;
    };
    /**
     * @param {Boolean} apply
     * @param {Boolean} clear
     * @returns {KunMapLayer}
     */
    changeLayer(apply = false, clear = false) {
        //remove current layer to allow map defaults when no override
        //KunMapThemes.DebugLog('Will attempt to create a new Map Layer...');
        if (clear) { this.clear(); }
        const profiles = this.profiles(true);
        if (profiles.length) {
            //run layered map environment overrides
            const profile = profiles[0];
            const layer = profile.createLayer(this.randomLayer());
            //console.log(layer, this._layer);
            if( layer ){
                if( !this._layer || this._layer && layer.name() !== this._layer.name() ){
                    this._layer = layer;
                    KunMapThemes.DebugLog(`Map Layer Changed to ${this._layer.name()}`);
                    return apply && this._layer.apply() || this._layer;
                }
            }
        }
        return null;
    };
    /**
     * @returns {KunMapThemes}
     */
    clear() {
        this._layer = null;
        return this;
    }
    /**
     * @returns {KunMapLayer}
     */
    layer() { return this._layer ; }
    /**
     * @param {Object} input 
     * @returns {KunMapThemes}
     */
    importProfiles(input = []) {
        return input.map(profile => {
            const overlay = new KunMapProfile(profile.name || '', profile.maps || []);
            this.importPresets(profile.presets || []).forEach(preset => overlay.add(preset));
            return overlay;
        });
    };
    /**
     * @param {Object[]} input 
     * @returns {KunMapPreset[]}
     */
    importPresets(input = []) {
        return input.map(content => {
            const preset = new KunMapPreset(content.tag, content.timer || 0);
            //rules
            this.importRules(content.rules || []).forEach(rule => preset.addRule(rule));
            //color layers
            (content.colors || []).forEach(color => {
                preset.addTint(color.red || 0, color.green || 0, color.blue || 0, color.hue || 0);
            });
            //sounds and music
            (content.music || []).forEach(music => {
                preset.addBgm(music.bgm, music.volume, music.pitch, music.pan);
            });
            (content.sound || []).forEach(sound => {
                preset.addBgs(sound.bgs, sound.volume, sound.pitch, sound.pan);
            });
            (content.ambient || []).forEach(ambient => {
                //include now KunSound palettes
                preset.addSound(ambient.name, ambient.elapsed || []);
            });
            return preset;
        });
    }
    /**
     * @param {Object[]} input 
     * @returns {KunMapRule[]}
     */
    importRules(input = []) {
        return input.map(content => {
            return new KunMapRule(
                content.gameVar,
                content.value,
                content.operator,
                content.switchOn,
                content.switchOff,
                content.valueVar
            );
        });
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

        return _kunPluginReaderV2('KunMapThemes', PluginManager.parameters('KunMapThemes'));
    };


    /**
     * @param {String} message 
     */
    static DebugLog() {
        if (KunMapThemes.manager().debug()) {
            console.log('[ KunMapThemes ] ', ...arguments);
        }
    };
    /**
     * @returns {Boolean}
     */
    static overrideAutoplay() { return KunMapThemes.manager().mapAutoPlay(); }
    /**
     * @returns {Boolean}
     */
    static overrideMapLayer() { return KunMapThemes.manager().mapUpdate(); }
    /**
     * @returns {KunMapThemes}
     */
    static manager() {
        return KunMapThemes.__instance || new KunMapThemes();
    }
}

/**
 * @class {KunMapOverlay}
 */
class KunMapProfile {
    /**
     * 
     * @param {String} tag 
     * @param {Number[]} maps 
     */
    constructor(tag = '', maps = []) {
        this._tag = tag || '';
        this._maps = maps || [];
        this._presets = [];
    }
    /**
     * 
     * @param {KunMapPreset} preset 
     * @returns {KunMapProfile}
     */
    add(preset = null) {
        if (preset instanceof KunMapPreset) {
            this._presets.push(preset);
        }
        return this;
    };
    /**
     * @returns {Number[]}
     */
    maps() {
        return this._maps;
    };
    /**
     * @param {Number} mapId 
     * @returns {Boolean}
     */
    isMap(mapId = 0) {
        return mapId && this.maps().includes(mapId) || false;
    };
    /**
     * @returns {String}
     */
    tag() {
        return this._tag;
    };
    /**
     * @returns {KunMapPreset[]}
     */
    presets(filter = false) {
        return filter ? this._presets.filter(preset => preset.active()) : this._presets;
    }
    /**
     * @param {Boolean} random 
     * @returns {KunMapLayer}
     */
    createLayer(random = false) {
        const list = this.presets(true);
        if( list.length ){
            const selection = random && Math.floor(Math.random() * list.length) || 0;
            const preset = list[selection];
            KunMapThemes.DebugLog('Preparing map layer from preset',preset);
            return preset && new KunMapLayer(preset) || null;
        }
        return null;
    }
}

/**
 * @class {KunLayerPreset}
 */
class KunMapPreset {
    /**
     * @param {Number} timer
     */
    constructor(name = '' , timer = 60) {
        this._name = name || '';
        this._bgm = [];
        this._bgs = [];
        this._sounds = [];
        this._tints = [];
        this._rules = [];
        this._timer = timer || 60;
    }
    /**
     * @returns {String}
     */
    name(){ return this._name; }
    /**
     * @param {String} name 
     * @param {Number[]} elapsed 
     * @returns {KunMapPreset}
     */
    addSound(name, elapsed = []) {
        this._sounds.push({
            sound: name,
            timer: elapsed || [],
        });
        return this;
    }
    /**
     * @param {Number} R 
     * @param {Number} G 
     * @param {Number} B 
     * @param {Number} H 
     * @returns {KunMapPreset}
     */
    addTint(R = 0, G = 0, B = 0, H = 0) {
        this._tints.push({
            'R': R.clamp(-255, 255),
            'G': G.clamp(-255, 255),
            'B': B.clamp(-255, 255),
            'H': H.clamp(0, 255),
        });
        return this;
    };
    /**
     * @param {String} bgm 
     * @param {Number} volume 
     * @param {Number} pitch 
     * @param {Number} pan 
     * @returns {KunMapPreset}
     */
    addBgs(bgs = '', volume = 60, pitch = 100, pan = 0) {
        this._bgs.push({
            'name': bgs || '',
            'volume': volume,
            'pitch': pitch,
            'pan': pan,
        });
        return this;
    };
    /**
     * @param {String} bgm 
     * @param {Number} volume 
     * @param {Number} pitch 
     * @param {Number} pan 
     * @returns {KunMapPreset}
     */
    addBgm(bgm = '', volume = 60, pitch = 100, pan = 0) {
        this._bgm.push({
            'name': bgm || '',    //allow mute sounds
            'volume': volume,
            'pitch': pitch,
            'pan': pan,
        });
        return this;
    };
    /**
     * @returns {KunMapPreset}
     */
    tint() {
        if (this._tints.length) {
            const tint = this._tints[Math.floor(Math.random() * this._tints.length)];
            $gameScreen.startTint(Object.values(tint), this._timer || 20);
            //$gameScreen.startTint(Object.values(tint), 0);
            KunMapThemes.DebugLog(`Aplying tint layer`,tint,this._timer);
        }
        return this;
    };
    /**
     * @returns {KunMapPreset}
     */
    playBgs() {
        if (this._bgs.length) {
            const sound = this._bgs[Math.floor(Math.random() * this._bgs.length)];
            if (sound.name.length) {
                //allow empty music tracks
                AudioManager.playBgs(sound);
            }
            else {
                AudioManager.stopBgs();
            }
        }
        else if ($dataMap.autoplayBgs) {
            AudioManager.playBgs($dataMap.bgs);
        }
        return this;
    };
    /**
     * @returns {KunMapPreset}
     */
    playBgm() {
        if (this._bgm.length) {
            const music = this._bgm[Math.floor(Math.random() * this._bgm.length)];
            if (music.name.length) {
                //allow empty music tracks
                AudioManager.playBgm(music);
            }
            else {
                AudioManager.stopBgm();
            }
        }
        else if ($dataMap.autoplayBgs) {
            AudioManager.playBgm($dataMap.bgm);
        }
        return this;
    };
    /**
     * @param {KunMapRule} rule 
     * @returns {KunMapPreset}
     */
    addRule(rule) {
        if (rule instanceof KunMapRule) {
            this._rules.push(rule);
        }
        return this;
    };
    /**
     * 
     * @param {Boolean} matching 
     * @returns {KunMapRule[]}
     */
    rules(matching = false) {
        return matching ? this._rules.filter(rule => rule.match()) : this._rules;
    };
    /**
     * @returns {Boolean}
     */
    active() {
        return this.rules().length === 0 || this.rules().length === this.rules(true).length;
    };
}

/**
 * @class {KunMapRule}
 */
class KunMapRule {
    /**
     * @param {Number} gameVar 
     * @param {Number} value 
     * @param {String} operator 
     * @param {Number[]} on 
     * @param {Number[]} off 
     * @param {Boolean} valueAsVar 
     */
    constructor(gameVar = 0, value = 0, operator = KunMapRule.Operator.Equal, on = [], off = [], valueAsVar = false) {
        this._gameVar = gameVar || 0;
        this._operator = operator || KunMapRule.Operator.Equal;
        this._value = value || 0;
        this._on = on || [];
        this._off = off || [];
        this._valueAsVar = valueAsVar || false;
    }

    /**
     * @returns {Boolean}
     */
    valid() {
        return this.variable(true) || this.on().length || this.on().length;
    }
    /**
     * @returns {Number}
     */
    value() {
        return this._valueAsVar ? $gameVariables.value(this._value) : this._value;
    };
    /**
     * @param {Boolean} getVar 
     * @returns {Number}
     */
    variable(getVar = false) {
        return getVar ? this._gameVar : this._gameVar && $gameVariables.value(this._gameVar) || 0;
    };
    /**
     * @returns {Boolean}
     */
    matchValue() {
        if (this._gameVar) {
            switch (this._operator) {
                case KunMapRule.Operator.Greather:
                    return this.variable() > this.value();
                case KunMapRule.Operator.GreatherEqual:
                    return this.variable() >= this.value();
                case KunMapRule.Operator.Equal:
                    return this.variable() === this.value();
                case KunMapRule.Operator.LessEqual:
                    return this.variable() <= this.value();
                case KunMapRule.Operator.Less:
                    return this.variable() < this.value();
            }
        }
        return true;
    };
    /**
     * @param {Boolean} values 
     * @returns {Number[]|Boolean[]}
     */
    on(values = false) {
        return values ? this._on.map(gs => $gameSwitches.value(gs)) : this._on;
    };
    /**
     * @param {Boolean} values 
     * @returns {Number[]|Boolean[]}
     */
    off(values = false) {
        return values ? this._off.map(gs => $gameSwitches.value(gs)) : this._off;
    };
    /**
     * All switches here must be ON!
     * @returns {Boolean}
     */
    turnOn() {
        return this.on().length === 0 || this.on(true).filter(gs => !gs).length === 0;
        //return this._switchOn.length === 0 || this._switchOn.filter( gs => !$gameSwitches.value(gs)).length === 0;
    };
    /**
     * All switches here must be off!    
     * @returns {Boolean}
     */
    turnOff() {
        return this.off().length === 0 || this.off(true).filter(gs => gs).length === 0;
        //return this._switchOff.length === 0 || this._switchOff.filter( gs => $gameSwitches.value(gs)).length === 0;
    };
    /**
     * @returns {Boolean}
     */
    match() {
        return this.turnOn() && this.turnOff() && this.matchValue();
    }
}

/**
 * @type {KunMapRule.Operator | String}
 */
KunMapRule.Operator = {
    Greather: 'greater',
    GreatherEqual: 'greaterequal',
    Equal: 'greater',
    LessEqual: 'lessequal',
    Less: 'less',
};
/**
 * @class {KunMapLayer}
 */
class KunMapLayer extends KunMapPreset {
    /**
     * @param {KunMapPreset} preset 
     */
    constructor(preset = null) {
        super();
        this.load(preset);
        this._elapsed = 0;
        this._active = false;
        this._remove = false;
    }
    /**
     * @returns {KunMapThemes}
     */
    manager() {
        return KunMapThemes.manager();
    }
    /**
     * @returns {Boolean}
     */
    remove() { return this._remove; }
    /**
     * @returns {KunMapLayer}
     */
    terminate() {
        this._remove = true;
        return this;
    }
    /**
     * @returns {Boolean}
     */
    active() { return this._active; }
    /**
     * @returns {KunMapLayer}
     */
    start() {
        this._elapsed = 0;
        this._active = true;
        return this;
    }
    /**
     * @returns {Boolean}
     */
    tick() {
        return !(this._elapsed = ++this._elapsed % this._timer);
    }
    /**
     * @returns {Boolean}
     */
    update() {
        if (this.active() && this.tick()) {
            this.updateSoundLoop();
            return true;
        }
        return false;
    }
    /**
     * @returns {KunSoundPlayer[]}
     */
    sounds() {
        return this._sounds;
    }
    /**
     * @returns {KunMapLayer}
     */
    updateSoundLoop() {
        //KunMapThemes.DebugLog(`Updating sound loops for ${this.name()}`);
        if (this.active() && this.manager().kunSounds()) {
            this.sounds().forEach(sound => sound.update());
        }
        return this;
    }
    /**
     * @param {KunMapPreset} preset 
     * @returns {KunMapLayer}
     */
    load(preset = null) {
        if (preset instanceof KunMapPreset) {
            this._name = preset._name;
            this._bgm = preset._bgm;
            this._bgs = preset._bgs;
            this._sounds = preset._sounds.map(sample => new KunSoundPlayer(sample.sound, sample.timer || []));
            this._tints = preset._tints;
        }
        return this;
    }
    /**
     * @param {Number[]} values 
     * @returns {Number}
     */
    selector(values = []) {
        //values.sort( (a,b) => a - b );
        switch (values.length) {
            case 0: break;
            case 1: return values[0];
            case 2: return values[0] + Math.floor(Math.random() * values[1]);
            case 3:
            default:
                return values[Math.floor(Math.random() * values.length)];
        }
        return 0;
    }
    /**
     * Run this once when layer is loaded to override map bgs,bgm and tints
     * @returns {KunMapLayer}
     */
    apply() {
        KunMapThemes.DebugLog(`Transition to Layer Preset ${this.name()} in progress ...`);
        return this.playBgm().playBgs().tint().start();
    };
}
/**
 * Wrapper to play KunSounds.play( sound ) variant effects. Requires KunSounds plugin enabled
 */
class KunSoundPlayer {
    /**
     * @param {String} sound 
     * @param {Number[]} loops 
     */
    constructor(sound = '', loops = []) {
        this._sound = sound || '';
        this._loops = loops || [];
        this._countdown = this.select();
    }
    /**
     * @returns {KunSoundPlayer}
     */
    play() {
        KunMapThemes.DebugLog(`Playing sound palette ${this._sound}`);
        KunMapThemes.manager().hasKunSounds() && KunSounds.play(this._sound);
        return this;
    }
    /**
     * @returns {Number}
     */
    select() {
        const timeset = this._loops;
        switch (timeset.length) {
            case 0: return [60];
            case 1: return timeset[0];
            case 2: return timeset[0] + Math.floor(Math.random() * timeset[1]);
            default: return timeset[Math.floor(Math.random() * timeset.length)];
        }
    }
    reset() {
        this._countdown = this.select();
        return this;
    }
    /**
     * @returns {Boolean}
     */
    tick() { return !!this._countdown && !(--this._countdown); }
    /**
     * @returns {Boolean}
     */
    update() {
        if (this.tick()) {
            this.reset().play();
            return true;
        }
        return false;
    }
}



/**
 * 
 */
function KunMapThemes_GameMap_Override() {

    //VANILLA
    /*Game_Map.prototype.autoplay = function () {
       if ($dataMap.autoplayBgm) {
            if ($gamePlayer.isInVehicle()) {
                $gameSystem.saveWalkingBgm2();
            } else {
                AudioManager.playBgm($dataMap.bgm);
            }
        }
        if ($dataMap.autoplayBgs) {
            AudioManager.playBgs($dataMap.bgs);
        }
    }*/


    /**
     * test
     */
    /*Game_Map.prototype.resetColor = function () {
        $gameScreen.startTint([0, 0, 0, 0], 20);
    };*/

    if (KunMapThemes.overrideAutoplay()) {
        //requires mapAutoplay setting
        const _KunMaps_GameMap_Autoplay = Game_Map.prototype.autoplay;
        Game_Map.prototype.autoplay = function () {
            //this.resetColor(); //testing
            if (!this.createLayerPreset()) {
                //if no layer preset found, just will play the default setup from current map
                KunMapThemes.DebugLog('No layer preset found for current map. Loading autoplay defaults');
                _KunMaps_GameMap_Autoplay.call(this);
            }
        };
        /**
         * Creates a new layer if preset found
         * @returns {Boolean}
         */
        Game_Map.prototype.createLayerPreset = function () {
            //crates a new layer preset removing current layer first
            const layer = KunMapThemes.manager().changeLayer(true,true);
            //!!layer && KunMapThemes.DebugLog('New Layer Preset ready for current map',layer);
            return !!layer || false;
        }
    }

    if (KunMapThemes.overrideMapLayer()) {
        //Requires Kuntime plugin
        // USE THIS TO UPDATE THE MAP LAYER COUNTERS AND ELAPSED TIMERS
        const _kunMaps_SceneMap_TimeChange = Scene_Map.prototype.onTimeChange;
        Scene_Map.prototype.onTimeChange = function () {
            //overload on onTimeChange function created by KunTime plugin
            _kunMaps_SceneMap_TimeChange.call(this);
            if(this.onMapLayerChange()){
                //KunMapThemes.DebugLog('Map layer transition',KunMapThemes.manager().layer().name());
            }            
        }
        /**
         * Just a wrapper to update the current layer
         * @returns {Boolean}
         */
        Scene_Map.prototype.onMapLayerChange = function () {
            const manager = KunMapThemes.manager();
            //attempts to update the layer or gets the existing one
            const layer = manager.changeLayer(true) || manager.layer();
            return !!layer || false;
        }


        /// USE THIS TO UPDATE THE LAYER TRANSITION TO ANOTHER LAYER
        const _kunMaps_SceneMap_updateDayTime = Scene_Map.prototype.onUpdateDayTime;
        Scene_Map.prototype.onUpdateDayTime = function(){
            _kunMaps_SceneMap_updateDayTime.call(this);
            if (this.onMapLayerUpdate()) {
                //KunMapThemes.DebugLog('Map layer update',KunMapThemes.manager().layer().name());
            }
        }
        /**
         * @returns {Boolean}
         */
        Scene_Map.prototype.onMapLayerUpdate = function(){
            const layer = KunMapThemes.manager().layer();
            return layer && layer.update() || false;
        }
    }
}


/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function ( /* args */) {

    KunMapThemes.manager();

    KunMapThemes_GameMap_Override();

})( /* initializer */);

