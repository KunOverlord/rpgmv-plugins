//=============================================================================
// KunBattlers.js
//=============================================================================
/*:
 * @filename KunBattlers.js
 * @plugindesc Kun Interactive Picture Animations (Amirian Release) - Animate pictures with custom framesets and commands, now featuring an interactive framework to click over specific hotspots depending on the frameset running.
 * @version 0.22
 * @author KUN
 * @target MC | MZ
 * 
 * @help
 * 
 * COMMANDS:
 * 
 * 
 * @param debug
 * @text Debug Mode
 * @desc Show debug info.
 * @type boolean
 * @default false
 * 
 * @param fps
 * @text FPS
 * @desc default frame time
 * @type number
 * @min 1
 * @default 10
 * 
 * @param actors
 * @type struct<Actor>[]
 * @text Actor Battlers
 * @desc List all actor battlers
 * 
 * @param enemies
 * @type struct<Enemy>[]
 * @text Enemy Battlers
 * @desc List all enemy battlers
 * 
 */
/*~struct~Actor:
 *
 * @param battler
 * @text Actor Battler
 * @desc Load actor battler images
 * @type file[]
 * @require 1
 * @dir img/battlers/
 * 
 * @param id
 * @type actor
 * @text Actor
 * @desc selec the actor
 * @default 0
 * 
 * @param type
 * @text Display Type
 * @desc Define the display layout for this battler, front view battles (actor back view), or sideview scenes
 * @type select
 * @option Front Battle (back view)
 * @value front
 * @option Side View Battle
 * @value side
 * @default front
 * 
 * @param cols
 * @text Columns
 * @type number
 * @min 1
 * @max 32
 * @default 9
 * 
 * @param rows
 * @text Rows
 * @type number
 * @min 1
 * @max 32
 * @default 6
 * 
 * @param fps
 * @text Frames Per Second
 * @desc Default FPS for this frameset (leave to 0 to get master FPS as default)
 * @type number
 * @min 0
 * @default 0
 * 
 * @param animations
 * @type struct<Animation>[]
 * @text Animations
 * @desc Animation Framesets
 * @default []
 * 
 * @param soundProfile
 * @type text[]
 * @text Sound Set Profile
 * @desc Add here the sound bank prefix for each picture souce when required
 * 
 */
/*~struct~Enemy:
 *
 * @param battler
 * @text Enemy Battler
 * @desc Load enemy battler images
 * @type file[]
 * @require 1
 * @dir img/battlers/
 * 
 * @param id
 * @type enemy
 * @text Enemy
 * @desc selec the enemy
 * @default 0
 * 
 * @param type
 * @text Display Type
 * @desc Define the display layout for this battler, front view default for enemies, or sideview scenes
 * @type select
 * @option Front Battle (enemy front view)
 * @value front
 * @option Side View Battle
 * @value side
 * @default front
 * 
 * @param cols
 * @text Columns
 * @type number
 * @min 1
 * @max 32
 * @default 1
 * 
 * @param rows
 * @text Rows
 * @type number
 * @min 1
 * @max 32
 * @default 1
 * 
 * @param fps
 * @text Frames Per Second
 * @desc Default FPS for this frameset (leave to 0 to get master FPS as default)
 * @type number
 * @min 0
 * @default 0
 * 
 * @param animations
 * @type struct<Animation>[]
 * @text Animations
 * @desc Animation Framesets
 * @default []
 * 
 * @param soundProfile
 * @type text
 * @text Sound Set Profile
 * @desc Add here the sound bank prefix for each picture souce when required
 * 
 */
/*~struct~Animation:
 * 
 * @param name
 * @text Name
 * @type text
 * @default animation
 * 
 * @param frames
 * @text Frames
 * @type number[]
 * @min 0
 * @desc List of frames to play in this animation
 * @default []
 * 
 * @param type
 * @text Animation Type
 * @type select
 * @option Idle
 * @value idle
 * @option Guard
 * @value guard
 * @option Spell
 * @value spell
 * @option Skill
 * @value skill
 * @option Use Item
 * @value item
 * @option Thrust
 * @value thrust
 * @option Swing
 * @value swing
 * @option Missile
 * @value missile
 * @option Damage
 * @value damage
 * @option Evade
 * @value evade
 * @option Escape
 * @value escape
 * @option Victory
 * @value victory
 * @option Defeat
 * @value defeat
 * @default idle
 * 
 * @param fps
 * @text Frames Per Second
 * @desc Default FPS for this frameset (leave to 0 to get master FPS as default)
 * @type number
 * @min 0
 * @default 0
 * 
 * @param skills
 * @type skill[]
 * @text Skills
 * @desc play this animation when casting any of these skills
 * @min 1
 * 
 * @param sounds
 * @text Sound Sets
 * @desc Type in a defined sound bank name to play a special sound set each time this frameset is started.
 * @type text[]
 * @default []
 */

/**
 * 
 * @returns 
 */
function KunBattleMaster() {
    throw `${this.constructor.name} is a Static Class`;
}
/**
 * @returns {String[]}
 */
KunBattleMaster.commands = function () {
    return ['KunBattlers'];
};
/**
 * 
 * @returns {KunSceneManager}
 */
KunBattleMaster.Initialize = function () {

    var parameters = KunBattleMaster.PluginData();
    console.log(parameters);
    this._debug = parameters.debug;

    this._battlers = {};

    parameters.actors.forEach(actor => {
        KunBattleMaster.addBattler(actor, KunBattleMaster.Party.Actor);
    });

    parameters.enemies.forEach(enemy => {
        KunBattleMaster.addBattler(enemy, KunBattleMaster.Party.Enemy);
    });

    return this;
};
/**
 * @param {Object} battlerData 
 * @returns {KunBattler}
 */
KunBattleMaster.addBattler = function (battlerData, team = KunBattleMaster.Party.Actor) {

    const battlers = [];

    battlerData.battler.forEach(picture => {
        const layout = battlerData.type === KunBattleMaster.Layout.Front ? KunBattleMaster.Layout.Front : KunBattleMaster.Layout.SideView;
        const battler = new KunBattler(
            picture, layout, team,
            battlerData.id,
            battlerData.rows, battlerData.cols,
            battlerData.fps,
            battlerData.soundProfile);
        battlers.push(battler);
        this._battlers[battler.name()] = battler;
    });

    battlerData.animations.forEach(data => {
        const frameset = new KunBattlerFrameSet(data.type, data.fps);
        if (data.sounds) {
            data.sounds.forEach(sound => frameset.addSfx(sound));
        }
        if (data.skills) {
            data.skills.forEach(skill => frameset.addSkill(skill));
        }
        if (data.frames) {
            data.frames.forEach(frame => frameset.addFrame(frame));
            battlers.forEach(battler => battler.add(frameset));
        }
    });


    return this;
};
/**
 * @param {Game_Battler} battler 
 * @param {Boolean} random
 * @returns {KunBattlerAnimation}
 */
KunBattleMaster.getBattler = function( battler = null , random = false ){
    if( battler instanceof Game_Battler ){
        const list = this.battlers(true).filter( unit => unit.team() === battler.team() && unit.id() === battler.battlerId() );
        if( list.length ){
            const template = random ? list[Math.floor(Math.random() * list.length)] : list [0];
            return template.createAnimation();
        }
    }
    return null;
};

/**
 * @returns {Boolean}
 */
KunBattleMaster.debug = function () {
    return this._debug;
};
/**
 * @param {String} sound 
 * @param {Number} round
 * @returns {KunSceneManager}
 */
KunBattleMaster.playSound = function (sound, round) {
    if (typeof KunSounds === 'function') {
        KunSounds.play(sound, round);
    }
    return this;
};
/**
 * @returns Number
 */
KunBattleMaster.FPS = function () {
    return this._fps || 10;
};
/**
 * @param {Boolean} list
 * @returns {KunBattler[]|Object}
 */
KunBattleMaster.battlers = function (list = false) {
    return list ? Object.values(this._battlers) : this._battlers;
};
/**
 * @param {Number} id
 * @returns {KunBattler[]}
 */
KunBattleMaster.actors = function (id = 0) {
    return this.battlers(true).filter(battler => battler.isActor() && (id === 0 || battler.id() === id));
};
/**
 * @param {Number} id 
 * @returns {KunBattler[]}
 */
KunBattleMaster.actor = function (id = 0) {
    const available = this.actors(id);
    return available.length ? available[0] : null;
};
/**
 * @param {Number} id
 * @returns {KunBattler[]}
 */
KunBattleMaster.enemies = function (id = 0) {
    return this.battlers(true).filter(battler => battler.isEnemy() && (id === 0 || battler.id() === id));
};
/**
 * @param {Number} id 
 * @returns {KunBattler[]}
 */
KunBattleMaster.enemy = function (id = 0) {
    const available = this.enemies(id);
    return available.length ? available[0] : null;
};
/**
 * @param {KunBattler} scene 
 * @returns {KunSceneManager}
 */
KunBattleMaster.add = function (scene) {
    if (scene instanceof KunBattler && !this.has(scene.name())) {
        this.battlers()[scene.name()] = scene;
    }
    return this;
};
/**
 * @param {String} name 
 * @returns {Boolean}
 */
KunBattleMaster.has = function (name = '') {
    return name && this.battlers().hasOwnProperty(name);
}
/**
 * @param {String} name 
 * @returns {KunBattler}
 */
KunBattleMaster.scene = function (name = '') {
    return this.has(name) ? this.battlers()[name] : null;
}
/**
 * @param {String} sfx
 * @param {Number} pitch
 * @param {Number} pan
 * @returns {KunSceneManager}
 */
KunBattleMaster.playFx = function (sfx, pitch, pan) {
    if (sfx.length) {
        if (typeof pitch !== 'number') {
            pitch = 90 + Math.floor(Math.random() * 20);
        }
        if (typeof pan !== 'number') {
            pan = Math.floor(Math.random() * 20) - 10;
        }
        this.AudioManager(sfx, 100, pitch, pan);
    }
    return this;
};
/**
 * 
 * @param {String} se 
 * @param {Number} volume 
 * @param {Number} pitch 
 * @param {Number} pan 
 * @param {Boolean} interrupt
 */
KunBattleMaster.AudioManager = function (se, volume, pitch, pan, interrupt = false) {
    if (se.length) {
        if (interrupt) {
            AudioManager.stopSe();
        }
        //KunSceneManager.DebugLog( `Playing ${se} at vol ${volume}, pitch ${pitch} and pan ${pan} ${interrupt}` );
        AudioManager.playSe({ name: se, pan: pan || 0, pitch: pitch || 100, volume: volume || 90 });
    }
};
/**
 * @param {String} message 
 */
KunBattleMaster.DebugLog = function (message) {
    if (KunBattleMaster.debug()) {
        console.log(typeof message === 'object' ? message : `[ KunSceneManager ] ${message.toString()}`);
    }
};

/**
 * @returns {Object}
 */
KunBattleMaster.PluginData = function () {

    function _parsePluginData(key, value) {
        if (typeof value === 'string' && value.length) {
            try {
                if (/^\{.*\}$|^\[.*\]$/.test(value)) {
                    return JSON.parse(value, _parsePluginData);
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
        else if (typeof value === 'object' && !Array.isArray(value)) {
            var _output = {};
            Object.keys(value).forEach(function (key) {
                _output[key] = _parsePluginData(key, value[key]);
            });
            return _output;
        }
        return value;
    };

    const pluginData = _parsePluginData('KunBattlers', PluginManager.parameters('KunBattlers'));

    if (typeof pluginData.scenes === 'undefined') {
        pluginData.scenes = [];
    }

    return pluginData;
};

/**
 * @type {KunBattler.Layout}
 */
KunBattleMaster.Layout = {
    SideView: 'sideview',
    Front: 'front',
};
/**
 * @type {KunBattler.Type}
 */
KunBattleMaster.Party = {
    Actor: 'actor',
    Enemy: 'enemy',
    None: 'none',
};
/**
 * @type {KunBattlerFrameSet.Type}
 */
KunBattleMaster.AnimationType = {
    Idle: 'ilde',
    Guard: 'guard',
    Spell: 'spell',
    Skill: 'skill',
    Item: 'item',
    Thrust: 'thrust',
    Swing: 'swing',
    Missile: 'missile',
    Damage: 'damage',
    Evade: 'evade',
    Escape: 'escape',
    Victory: 'victory',
    Defeat: 'defeat',
};




/**
 * @type {KunBattler}
 */
class KunBattler {
    /**
     * @param {String} battler battler picture from battlers folder
     * @param {String} layout layout/display type: front view or side view battle
     * @param {String} team Actor or Enemy type
     * @param {Number} id Actor/Enemy ID related to this battler
     * @param {Number} rows how many frames height
     * @param {Number} columns how many frames width
     * @param {Number} fps default animation's frames per second
     * @param {String} profile sound profile
     */
    constructor(battler, layout = '', team = '', id = 0, rows = 1, columns = 1, fps = 10, profile = '') {
        this._battler = battler || '';
        this._layout = layout || KunBattleMaster.Layout.Front;
        this._team = team || KunBattleMaster.Party.Enemy;
        this._id = id;
        this._rows = rows;
        this._cols = columns;
        this._fps = fps || 10;
        this._framesets = [];
        this._audioProfile = profile || ''
    }
    /**
     * @returns {String}
     */
    name() {
        return this._battler;
    }
    /**
     * @returns {Number}
     */
    id() {
        return this._id;
    }
    /**
     * @returns {String}
     */
    profile() {
        return this._audioProfile;
    }
    /**
     * @returns {String}
     */
    layout() {
        return this._layout;
    }
    /**
     * @returns {String}
     */
    team() {
        return this._team;
    }
    /**
     * @returns {Boolean}
     */
    isEnemy() {
        return this.team() === KunBattleMaster.Party.Enemy;
    }
    /**
     * @returns {Boolean}
     */
    isActor() {
        return this.team() === KunBattleMaster.Party.Actor;
    }
    /**
     * @returns {Number}
     */
    fps() {
        return this._fps;
    }
    /**
     * @returns {Number}
     */
    cols() {
        return this._cols;
    }
    /**
     * @returns {Number}
     */
    rows() {
        return this._rows;
    }
    /**
     * @returns {Number}
     */
    count() {
        return this.cols() * this.rows();
    }
    /**
     * @returns {KunBattlerFrameSet[]}
     */
    framesets() {
        return this._framesets;
    }
    /**
     * @param {KunBattlerFrameSet} frameset 
     * @returns {KunBattler}
     */
    add(frameset) {
        if (frameset instanceof KunBattlerFrameSet) {
            this._framesets.push(frameset);
        }
        return this;
    }
    /**
     * @returns {KunBattlerFrameSet}
     */
    first() {
        return this.framesets().length && this.framesets()[0] || null;
    }
    /**
     * @param {String} type 
     * @param {Number} skill 
     * @returns {KunBattlerFrameSet}
     */
    select(type = '', skill = 0) {
        if (type.length) {
            type = KunBattleMaster.AnimationType.Idle;
        }
        const framesets = this.framesets().filter(fs => fs.isType(type) && fs.isSkill(skill));
        return framesets.length ? framesets[Math.floor(Math.random() * framesets.length)] : null;
    }
    /**
     * @returns {KunBattlerAnimation}
     */
    createAnimation() {
        return new KunBattlerAnimation(this);
    }
}


/**
 * @type {KunBattlerFrameSet}
 */
class KunBattlerFrameSet {
    /**
     * 
     * @param {String} name 
     * @param {String} type 
     * @param {Number} fps 
     */
    constructor(type = '', fps = 10) {
        //this._name = name || 'animation';
        this._type = type || KunBattleMaster.AnimationType.Idle;
        this._fps = fps || 10;
        this._frames = [];
        this._skills = [];
        this._sounds = [];
    }
    /**
     * @returns {Number} 
     */
    fps() {
        return this._fps;
    }
    /**
     * @returns {String}
     */
    type() {
        return this._type;
    }
    /**
     * @param {String} type 
     * @returns {Boolean}
     */
    isType(type = '') {
        return type && this.type() === type;
    }
    /**
     * @param {Number} skill 
     * @returns {Boolean}
     */
    isSkill(skill = 0) {
        return skill === 0 || this.skills().includes(skill);
    }
    /**
     * @returns {Number[]}
     */
    frames() {
        return this._frames;
    }
    /**
     * @returns {Number[]}
     */
    skills() {
        return this._skills;
    }
    /**
     * @param {Number} skill 
     * @returns {KunBattlerFrameSet}
     */
    addSkill(skill) {
        if (skill) {
            this._skills.push(skill);
        }
        return this;
    }
    /**
     * @param {Number} frame 
     * @returns {KunBattlerFrameSet}
     */
    addFrame(frame) {
        this._frames.push(frame);
        return this;
    }
    /**
     * @param {String} se 
     * @returns {KunBattlerFrameSet}
     */
    addSfx(se = '') {
        if (se.length) {
            this._sounds.push(se);
        }
        return this;
    }
    /**
     * @returns {String}
     */
    sound() {
        return this._sounds.length ? this._sounds[Math.floor(Math.random() * this._sounds.length)] : '';
    }
}

/**
 * @type {KunBattlerAnimation}
 */
class KunBattlerAnimation {
    /**
     * @param {KunBattler} battler 
     */
    constructor(battler, frameset = '') {
        this._battler = battler instanceof KunBattler && battler || null;
        this._current = this.battler() && this.battler().first() || null;
        this._playing = false;
        this.reset();
    }
    /**
     * @returns {KunBattler}
     */
    battler() {
        return this._battler;
    }
    /**
     * @returns {KunBattlerFrameSet}
     */
    current() {
        this._current;
    }
    /**
     * @returns {String}
     */
    name() {
        return this.battler().name();
    }
    /**
     * @returns {Boolean}
     */
    ready() {
        return this.current() !== null;
    }
    /**
     * @returns {Boolean}
     */
    playing() {
        return this.ready() && this._playing;
    }
    /**
     * @returns {String}
     */
    motion(){
        return this.playing() && this.current().type() || '';
    }
    /**
     * @param {String} motion 
     * @returns {Boolean}
     */
    isPlaying( motion = ''){
        return motion && this.motion() === motion;
    }
    /**
     * @returns {Number}
     */
    fps() {
        return this._fps;
    }
    /**
     * @returns {Number}
     */
    count() {
        return this.ready() && this.current().frames().length || 0;
    }
    /**
     * @returns {Boolean}
     */
    tick() {
        this._elapsed = ++this._elapsed % this.fps();
        return this._elapsed === 0;
    }
    /**
     * @returns {Number}
     */
    index() {
        return this._index;
    }
    /**
     * @returns {Boolean}
     */
    update() {
        if (this.tick()) {
            this._index = ++this.index() % this.count();
            this.playfx(this.index());
            return true;
        }
        return false;
    }
    /**
     * @param {Number} frame 
     * @returns {KunBattlerAnimation}
     */
    playfx(frame = 0) {
        if (frame) {
            const sound = this.current().sound();
            const profile = this.battler().profile();
            const se = sound.length ? profile && profile + '-' + sound || sound : '';
            if (se) {
                KunBattleMaster.playSound(se);
            }
        }
        return this;
    }
    /**
     * @param {String} type 
     * @param {Number} skill 
     * @returns {Boolean}
     */
    change(type = '', skill = 0) {

        const fs = this.battler().select(
            type || KunBattleMaster.AnimationType.Idle,
            skill);

        if (fs !== null) {
            this.reset();
            return true;
        }
        return false;
    }
    /**
     * @returns {KunBattlerAnimation}
     */
    reset() {
        this._index = 0;
        this._fps = this.current().fps() || this.battler().fps() || 10;
        this._elapsed = 0;
        return this;
    }
}



function KunBattlers_SetupBattlers() {

    /**
     * @returns {Number}
     */
    Game_Battler.prototype.battlerId = function(){
        this._actorId || this._enemyId || 0;
    };    
    /**
     * @returns {Boolean}
     */
    Game_Battler.prototype.isActor = function(){
        return this instanceof Game_Actor;
        return this._actorId && this._actorId > 0 || false;
    };
    /**
     * @returns {Boolean}
     */
    Game_Battler.prototype.isEnemy = function(){
        return this instanceof Game_Enemy;
        return this._enemyId && this._enemyId > 0 || false;
    };
    /**
     * @returns {String}
     */
    Game_Battler.prototype.team = function(){
        switch( true ){
            case this.isActor():
                return KunBattleMaster.Party.Actor;
            case this.isEnemy():
                return KunBattleMaster.Party.Enemy;
            default:
                return KunBattleMaster.Party.None;
        }
    };

};

function KunBattlers_SetupSprites() {

    const _KunBattlers_SpriteBattler_initMembers = Sprite_Battler.prototype.initMembers;
    Sprite_Battler.prototype.initMembers = function() {
        _KunBattlers_SpriteBattler_initMembers.call(this);

        //these are the vanilla attributes from Sprite_Actor
        //turn into a single animation instance from KunBattlerAnimation
        //this._motion = null;
        //this._motionCount = 0;
        //this._pattern = 0;
        this._animation = KunBattleMaster.getBattler(this._battler);
    }
    /**
     * @returns {KunBattlerAnimation}
     */
    Sprite_Battler.prototype.animation = function(){
        return this._animation ||null;
    }
    /**
     * Animation template and manager should bee handled from the source battler sprite setup, then change to different stages/framesets to play the requested move
     * @param {String} motionType 
     * @param {Number} skill
     */
    Sprite_Battler.prototype.startMotion = function ( motionType = '' , skill = 0 ) {
        if( this.animation() && motionType && !this.animation().isPlaying(motionType) ){
            this.animation().change(motionType , skill );
        }
        //const newMotion = Sprite_Actor.MOTIONS[motionType];
        /*if (this._motion !== newMotion) {
            this._motion = newMotion;
            this._motionCount = 0;
            this._pattern = 0;
        }*/
    }
    Sprite_Battler.prototype.setupMotion = function () {
        //this._battler is Game_Battler instance and implements some of the motion methods (only used by party in vanilla)
        //this._battler is set and duplicated  into this._actor in Sprite_Actor subclass, therefore, should reference to the same Game_Battler instance
        if (this._battler.isMotionRequested()) {
            this.startMotion(this._battler.motionType());
            this._battler.clearMotion();
        }
    };
    Sprite_Battler.prototype.updateBitmap = function() {
    };

    Sprite_Battler.prototype.updateFrame = function() {
    };    
};

function KunBattlers_RegisterEnemies() {
    Game_Enemy.prototype.performActionStart = function (action) {
        Game_Battler.prototype.performActionStart.call(this, action);
        this.requestEffect('whiten');
    };

    Game_Enemy.prototype.performAction = function (action) {
        Game_Battler.prototype.performAction.call(this, action);
    };

    Game_Enemy.prototype.performActionEnd = function () {
        Game_Battler.prototype.performActionEnd.call(this);
    };

    Game_Battler.prototype.motionType = function () {
        return this._motionType;
    };
};

/**
 * @deprecated USE ONLY FOR REFERENCE!! DO NOT CALL!! 
 */
function KunBattlers_RegisterActors_TEST() {

    /**
     * 
     * startMotion is Sprite_Actor's animator setup, not set in Sprite_Battler (parent)
     * - Define Sprite_Battler's motion manager
     * - Replaace Sprite_Actor's start motion
     * - Tweak the battlers depending on the team (party or troop)
     * 
     * AATTENTION TO PARTY WEAPONS!!
     * BIG CHALLENGE HERE, OVERLAY DIFFERENT WEAPON TYPES DEPENDING ON THE EQUIPED WEAPON ANAD TYPE?
     * Y_Y... 
     */

    // this is the root element to hack in wiwth hte plugin
    Sprite_Actor.prototype.startMotion = function (motionType) {
        var newMotion = Sprite_Actor.MOTIONS[motionType];
        if (this._motion !== newMotion) {
            this._motion = newMotion;
            this._motionCount = 0;
            this._pattern = 0;
        }
    };

    Sprite_Actor.prototype.setupMotion = function () {
        if (this._actor.isMotionRequested()) {
            this.startMotion(this._actor.motionType());
            this._actor.clearMotion();
        }
    };

    Game_Battler.prototype.motionType = function () {
        return this._motionType;
    };

    Game_Battler.prototype.requestMotion = function (motionType) {
        //STRING
        this._motionType = motionType;
    };


    Game_Actor.prototype.performActionStart = function (action) {
        Game_Battler.prototype.performActionStart.call(this, action);
    };

    Game_Actor.prototype.performAction = function (action) {
        Game_Battler.prototype.performAction.call(this, action);
        if (action.isAttack()) {
            this.performAttack();
        } else if (action.isGuard()) {
            this.requestMotion('guard');
        } else if (action.isMagicSkill()) {
            this.requestMotion('spell');
        } else if (action.isSkill()) {
            this.requestMotion('skill');
        } else if (action.isItem()) {
            this.requestMotion('item');
        }
    };

    Game_Actor.prototype.performActionEnd = function () {
        Game_Battler.prototype.performActionEnd.call(this);
    };
    Game_Actor.prototype.performAttack = function () {
        var weapons = this.weapons();
        var wtypeId = weapons[0] ? weapons[0].wtypeId : 0;
        var attackMotion = $dataSystem.attackMotions[wtypeId];
        if (attackMotion) {
            if (attackMotion.type === 0) {
                this.requestMotion('thrust');
            } else if (attackMotion.type === 1) {
                this.requestMotion('swing');
            } else if (attackMotion.type === 2) {
                this.requestMotion('missile');
            }
            this.startWeaponAnimation(attackMotion.weaponImageId);
        }
    };

    Game_Actor.prototype.performDamage = function () {
        Game_Battler.prototype.performDamage.call(this);
        if (this.isSpriteVisible()) {
            this.requestMotion('damage');
        } else {
            $gameScreen.startShake(5, 5, 10);
        }
        SoundManager.playActorDamage();
    };
}
/**
 * 
 */
function KunBattlers_SetupCommands() {
    var _KunBattlers_SetupCommands = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunBattlers_SetupCommands.call(this, command, args);
        if (KunBattleMaster.commands().includes(command) && args.length) {
            var _import = args.includes('import');
            switch (args[0]) {
                case 'speed':
                case 'variant':
            }
        }
    };
}

/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function ( /* args */) {

    KunBattleMaster.Initialize();

    KunBattlers_SetupBattlers();
    KunBattlers_SetupSprites();

    KunBattlers_SetupCommands();
})( /* initializer */);



