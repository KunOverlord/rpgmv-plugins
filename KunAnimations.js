//=============================================================================
// KunAnimations.js
//=============================================================================
/*:
 * @filename KunAnimations.js
 * @plugindesc Kun Interactive Picture Animations (Amirian Release) - Animate pictures with custom framesets and commands, now featuring an interactive framework to click over specific hotspots depending on the frameset running.
 * @version 4.62
 * @author KUN
 * @target MC | MZ
 * 
 * @help
 * 
 * COMMANDS:
 * 
 *      KunAnimations play|set animation-name [setName] [wait frames:frame_offset]
 *          Switch animation frameset setName for animation-name
 *          If offsetVarx and offsetVarY are defined, both vars will apply the defined offset
 *          Use offsetScale % to scale the offset displacement for each coordinate
 * 
 *      KunAnimations reset animation-name [replay]
 *          Resets the given animation
 *          Restarts the controller if replay is required
 * 
 *      KunAnimations fps animation-name [fps] [import]
 *          Set custom frames per second for the playing animation-name. Define import to use a Game Variable to grab the fps from
 * 
 *      KunAnimations speed|variant [animation|alias] [variant]
 *          Creates an additive variant percent value over the FPS and LOOP animation properties,
 *          to cause a duration and speed random behaviour.
 * 
 *      KunAnimations playback [animation] [on|off]
 *          Keep playing the animation once finished again and again, if this animation has a next animation list
 * 
 *      KunAnimations pause animation-name
 *          Pause animation-name if playing
 * 
 *      KunAnimations resume animation-name
 *          Resume animation-name if paused
 * 
 *      KunAnimations effects [alias:alias:...] [opacity] [blending] ...
 * 
 *      KunAnimations target [random]
 *          Update to the next target in the list of touched spots
 *          Tag random for random target selection inthe available state
 * 
 *      KunAnimations spot animation-name spot-name
 *          Export the X and Y coordinates of the spot-name area if available in the current animation play
 * 
 *      KunAnimations repeat [animation|alias]
 *          Repeats the last spot targeted
 * 
 *      KunAnimations mode [playback|capture|touch|disabled]
 *          Set the mouse interactive mode. Set touch to activate the interactive events. Set capture to describe hotspot areas in the console (requires debug mode on). Set disable to turn off the event listener.
 * 
 *      KunAnimations clear [targets | alias]
 *          Clear the current target queue
 *          Clear targets or defined aliases
 * 
 *      KunAnimations alias [alias_name] [animation_name] [pictureId]
 *          Create an alias for a specific animation controller to ease picture swapping with the same tags
 *          Use a pictureId to filter which animation picture is the alias for
 * 
 *      KunAnimations load [profile:profile:profile] [id:x:y:sx:sy:opacity:blend:origin] [alias]
 *          Prepare a staged scene and setup picture from an existing animation profile
 *          Fill in all required setups with picture ID, position(x,y), scale(sx,sy), opacity, blending and origin
 *          Override the profile alias if required
 * 
 *      KunAnimations wait [elapsed_seconds] [random_elapsed_seconds]
 *          Wait for elapsed seconds before running the next routines in the event editor
 *          Add random elapsed seconds to define a randomized timespan
 * 
 *      KunAnimations prepare | complete
 *          Resets all the active animations to prepare a new animation or close a running one.
 * 
 *      KunAnimations action [alias|picture] [action_tag]
 * 
 *      KunAnimations playlist [alias|picture] [clear|animation1:animation2:animation3:...]
 *          Create a playlist for a scene playback
 *          Use alias and picturenames alike
 *          Use clear command to remove a playlist
 *          Define a list of animations separated by :
 * 
 *      KunAnimations playback [alias|picture]
 *          Play an animation from the PlayBack manager
 *          Define playback mode to let the Animation Controller get the animations from the user's playlist
 * 
 *      KunAnimations playspot [alias|picture]
 *          Capture an interactive hotspot from the current playing animation of the given picture.
 *          Captured spot will export the registered X and Y Game Variables.
 * 
 *      KunAnimations playmap [alias|name]
 *          Play the mapped animations in the list
 * 
 *      KunAnimations mapanimation [alias|name] [gamevar] [animation:animation:animation:...]
 *          Bind a game variable to a playlist of framesets in an animation.
 *          As the game variable updates, the animation will play the frameset index corresponding to the gamevar
 *          Use playmap command to run the animation selected by gamevar
 * 
 *      KunAnimations tagspot [alias|name] [include|exclude|random|any:tag:tag:tag] [path:path:...] [speed] [label:...]
 *          Tags a target and plays by tagged animations
 *          Use include|exclude:random to scope on the tags or simply pick a random target from the list
 *          Use path list to define a list of random paths to move if target not found
 *          Use fallback labels to jump out when no target found
 *          Use speed to adjust the fps speed PERCENT and wait time (fps x %)
 * 
 *      KunAnimations mapspot [alias|name] [include|exclude|random|any:tag:tag:tag] [path:path:...] [speed] [label:...]
 *          Tags a target and plays a mapped animation
 *          Use include|exclude:random to scope on the tags or simply pick a random target from the list
 *          Use path list to define a list of random paths to move if target not found
 *          Use fallback labels to jump out when no target found
 *          Use speed to adjust the fps speed PERCENT and wait time (fps x %)
 * 
 *      KunAnimation isplaying [alias|name:animation:animation:...] [label:label:...] [label:label:...]
 *          Jumps to a specific label if an animation is playing or playing some frameset in the list
 *          Set a fallback label list if required when not matching
 * 
 *      KunAnimations stages [alias|picture] [stage:picture] [stage:picture] [stage:picture] [...]
 *          Binds a list of stages to this picture to replace the current playing picture with a single command line
 * 
 *      KunAnimations stage [alias|picture] [stage]
 *          Changes the current picture and animation to the defined stage
 *          Picture ID and animation alias will be moved to the next stage picture
 * 
 *      KunAnimations position [x1:y1:x2:y2] [x1:y1:x2:y2] [x1:y1:x2:y2] ...
 *          Set the TouchX and TouchY game variables with the coordinates providen
 *          if more than one block, will random among them
 *          set x1,y1 to the top-left, set x2,y2 to the top-right
 *          set only x1,y1, to define the x,y righ away
 * 
 * 
 *      KunAnimations spotmenu [animation|alias] [skip|random|first|last|cancel] [left|center|right] [window|dim|transparent]
 *      KunAnimations animationmenu [animation|alias] [skip|random|first|last|cancel] [left|center|right] [window|dim|transparent]
 *      KunAnimations stagemenu [animation|alias] [skip|random|first|last|cancel] [left|center|right] [window|dim|transparent]
 * 
 * 
 * 
 * @param debug
 * @text Debug Level
 * @desc Show debug info. Activate Trace Log to detail the imports and exports of data.
 * @type select
 * @option TraceLog
 * @value 2
 * @option Enabled
 * @value 1
 * @option Disabled
 * @value 0
 * @default 0
 * 
 * @param accurateSpots
 * @text Accurate Spots
 * @desc Set targetting spot accurate, or leave it disabled to random spot area coordinates.
 * @type boolean
 * @default false
 * 
 * @param masterFPS
 * @text Master Frame Time
 * @desc default frame time
 * @type number
 * @min 1
 * @default 10
 * 
 * @param touchvar
 * @text Touch Gauge Game Variable
 * @desc Use this variable to count all spotted targets in a touch scene
 * @type variable
 * @min 0
 * @default 0
 * 
 * @param limitvar
 * @parent touchVar
 * @text Touch Range Game Variable
 * @desc Define how many targets can save in the target gauge
 * @type variable
 * @min 0
 * @default 0
 * 
 * @param touchMode
 * @parent touchVar
 * @text Target Flag
 * @desc This switch shall be toggled if a target is fired from the KunTargets target list
 * @type switch
 * @default 0
 * 
 * @param touchSfx
 * @text Default Touch SE
 * @desc Define a default sound effect
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param cancelSfx
 * @text Don't Touch SE
 * @desc Define a no touch sound effect
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param selectSfx
 * @text Select SE
 * @desc Define a wheel/select sound effect
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param labels
 * @type string[]
 * @text Labels
 * @desc Assign labels to hotspot and animation names, displayable on command menus. Split with colon: value:label1:label2:...
 * 
 * @param scenes
 * @type struct<Scene>[]
 * @text Scenes
 * @desc Define the DataBase of Animation Scene Controllers (keep it clean and easy!!)
 * 
 * @param controllers
 * @type text
 * @text Animation Scenes (OLD)
 * @desc Move to Scenes
 * 
 * @param profiles
 * @type struct<Profile>[]
 * @text Profiles
 * @desc Create scene packages associated with an alias to quickly arrange different stages
 * 
 */
/*~struct~Scene:
 * @param source
 * @text Source Picture Pack
 * @desc Add one or more source pictures with the same frameset columns and rows, to use with the same animation rules. Duplicated pictures will be discarded.
 * @type file[]
 * @require 1
 * @dir img/pictures/
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
 * @param mode
 * @text Animation Mode
 * @desc Enable interactive or dynamic events for this scene
 * @type select
 * @option Default
 * @value default
 * @option Moving
 * @value move
 * @option Interactive
 * @value touch
 * @option Static (no animation)
 * @value static
 * @default default
 * 
 * @param framesets
 * @type struct<Animation>[]
 * @text Animations
 * @desc Animation Frameset Collection
 * @default []
 * 
 * @param hotspots
 * @type struct<Spot>[]
 * @text HotSpots
 * @desc Add the interactive spots here
 * 
 * @param soundProfile
 * @type text[]
 * @text Sound Set
 * @desc Add here the sound set prefix for each picture/souce when required
 * 
 * @param soundBankPrefix
 * @parent soundProfile
 * @type text[]
 * @text Sound Set (deprecated)
 * @desc Backwards compatibility. Use soundProfile instead.
 * 
 * @param soundLoop
 * @parent soundProfile
 * @text Sound Loop
 * @desc Play sound effects after N loops
 * @type number
 * @min 0
 * @max 10
 * @default 4
 * 
 */
/*~struct~Picture:
 * @param picture
 * @text Picture
 * @desc Select a base picture to create a scene. Match the spritesheet columns and rows with the scene.
 * @type file
 * @require 1
 * @dir img/pictures/
 * 
 * @param collections
 * @text Collections
 * @type text[]
 * @desc Define which collections is this picture included in
 * 
 * @param sound
 * @type text
 * @text Sound Collection
 * @desc Define a sound collection to play the animation sounds with
 * 
 * @param soundLoop
 * @parent sound
 * @text Sound Loops
 * @desc Define how many loops are required to play a sound in the current scene
 * @type number
 * @default 4
 */
/*~struct~Animation:
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
 * @option Forward (default)
 * @value forward
 * @option Reverse
 * @value reverse
 * @option Ping-Pong
 * @value ping-pong
 * @option Static
 * @value static
 * @default forward
 * 
 * @param fps
 * @text Frames Per Second
 * @desc Default FPS for this frameset (leave to 0 to get master FPS as default)
 * @type number
 * @min 0
 * @default 0
 * 
 * @param loops
 * @type number
 * @text Loops
 * @desc number of times the animation will play before switching to the next animation. Leave it to 0 for endless loops (no next animation)
 * @default 0
 * 
 * @param next
 * @text Next FrameSets
 * @type text[]
 * @desc Define the next frameset to call. If more than one specified, they will be randomly called
 * 
 * @param offsetX
 * @text X Offset
 * @type number
 * @default 0
 * 
 * @param offsetY
 * @text Y Offset
 * @type number
 * @default 0
 * 
 * @param spots
 * @type struct<Touch>[]
 * @text Spots
 * @desc Interactive Spots to fire events
 * @default []
 * 
 * @param conditions
 * @type struct<Condition>[]
 * @text Conditions
 * @desc Enable this Animation when meeting these conditions
 * 
 * @param tags
 * @text Tags
 * @type text[]
 * @desc Define tags to filter related animations
 * 
 * @param bank
 * @text Sound Sets (deprecated)
 * @desc Obsolete. Move to sounds instead
 * @type text[]
 * @default []
 * 
 * @param sounds
 * @text Sound Sets
 * @desc Type in a defined sound bank name to play a special sound set each time this frameset is started.
 * @type text[]
 * @default []
 * 
 */
/*~struct~Touch:
 * 
 * @param name
 * @text Name
 * @type text
 * @default touch
 * 
 * @param next
 * @text Next Animation
 * @desc Jump to Frameset on touched (allow mrandom options when more than 1)
 * @type text[]
 * @default []
 * 
 */
/*~struct~Spot:
 * 
 * @param name
 * @text Name
 * @type text
 * @default touch
 * 
 * @param x1
 * @text X1
 * @type number
 * @min 0
 * @desc X origin coordinate
 * 
 * @param y1
 * @text Y1
 * @type number
 * @min 0
 * @desc Y origin coordinate
 * 
 * @param x2
 * @text X2
 * @type number
 * @min 0
 * @desc X destination coordinate
 * 
 * @param y2
 * @text Y2
 * @type number
 * @min 0
 * @desc Y destination coordinate
 * 
 * @param trigger
 * @text On Click
 * @type select
 * @option Instant Run
 * @value instant
 * @option Queue
 * @value queue
 * @option Set Frame
 * @value frame
 * @option Next Frame
 * @value next
 * @option Ignore
 * @value ignore
 * @default queue
 * 
 * @param sfx
 * @text Touch Audio SFX
 * @desc Define a specific sound effect
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param tags
 * @type text[]
 * @name Tags
 * @desc add tags to categorize the spot selection
 * 
 * @param conditions
 * @type struct<Condition>[]
 * @text Conditions
 * @desc Enable this HotSpot when meeting these conditions
 * 
 * @param varId
 * @text Game Variable ID
 * @type variable
 * @min 0
 * @desc (Obsolete) Game Variable Mutator. Leave to 0 to not update variables. Use Actions instead.
 * @default 0
 * 
 * @param behavior
 * @parent varId
 * @text Update Behavior
 * @desc (Obsolete) How to modify the value on Game Variable ID. Use Actions instead
 * @type select
 * @option Add (default)
 * @value add
 * @option Substract
 * @value sub
 * @option Set
 * @value set
 * @default add
 * 
 * @param amount
 * @parent varId
 * @text Update Amount
 * @desc (Obsolete) Use Actions instead
 * @type number
 * @min 1
 * @default 1
 * 
 */
/*~struct~Action:
 * @param tag
 * @text Tag
 * @type text
 * @desc Set a tag for this action used for a filtered action selection
 * 
 * @param var
 * @type variable
 * @text Game Variable
 * @desc define a game variable to update with this action
 * @min 0
 * @default 0
 * 
 * @param op
 * @text Operator
 * @desc Operation type to run on the Game Variable
 * @type select
 * @option Add
 * @value add
 * @option Sub
 * @value sub
 * @option Set
 * @value set
 * @default set
 * 
 * @param val
 * @text Value
 * @desc Value to update the game variable with
 * @type number
 * @min 0
 * 
 */
/*~struct~Condition:
 *
 * @param var
 * @type variable
 * @text Game Variable
 * @desc define a game variable to check for this condition
 * @min 0
 * @default 0
 * 
 * @param op
 * @text Operator
 * @desc Select the type of operation to cast over the value for this Game Variable
 * @type select
 * @option Greater
 * @value greater
 * @option Greater or equal
 * @value greater_equal
 * @option Equal
 * @value equal
 * @option Less or equal
 * @value less_equal
 * @option Less
 * @value less
 * @default equal
 * 
 * @param val
 * @type number
 * @text Value
 * @desc Operate with this value
 * @min 0
 * @default 0
 * 
 * @param target
 * @type boolean
 * @text Value as Variable
 * @desc Map value as a Game Variable which provides the real value. Value must be a valid Game Variable.
 * @default false
 * 
 * @param on
 * @type switch[]
 * @text Game Switch ON
 * @desc define which game switches must be ON for this condition
 *
 * @param off
 * @type switch[]
 * @text Game Switch OFF
 * @desc define which game switches must be OFF for this condition
 *
 */
/*~struct~Profile:
 * @param profile
 * @type text
 * @desc Profile name
 * @default profile
 * 
 * @param start
 * @type text
 * @text Starting frame
 * @desc Define the starting frameset for this animation group
 * 
 * @param pictures
 * @text picture stages to run within this profile
 * @type file[]
 * @require 1
 * @dir img/pictures/
 */

/**
 * 
 */
class KunScenes {
    /**
     * @returns {KunScenes}
     */
    constructor() {
        if (KunScenes.__instance) {
            return KunScenes.__instance;
        }

        KunScenes.__instance = this;

        this.initialize();
    }
    /**
     * 
     */
    initialize() {

        const _parameters = KunSceneImporter.PluginData();
        const _importer = new KunSceneImporter();

        this._debug = _parameters.debug;
        this._fps = _parameters.defaultFPS || 10;
        //this._touchVar = _parameters.touchVarCounter;
        //this._limitVar = _parameters.touchVarLimit;
        //this._targetFlag = _parameters.touchMode;
        this._accurate = _parameters.accurateSpots;
        //added as new version to implement external plugin animation packs avoiding overloading the KunAnimationPacks plugin

        //this._varX = _parameters.touchX || 0;
        //this._varY = _parameters.touchY || 0;
        this._varwheel = _parameters.wheel || 0;
        this._sfx = {
            'touch': _parameters.touchSfx || '',
            'cancel': _parameters.cancelSfx || '',
            'select': _parameters.selectSfx || '',
        };

        this._mode = KunAnimation.Mode.Disabled;
        this._scenes = _importer.importScenes(_parameters.scenes || []);
        this._collections = _importer.importCollections(_parameters.profiles);
        this._labels = _importer.importLabels(_parameters.labels || []);

        this._targets = new KunTargets(_parameters.touchvar, _parameters.limitvar);
        this._player = new KunScenePlayer();
    }

    /**
     * @returns {KunScenePlayer}
     */
    player() { return this._player; }
    /**
     * @returns {KunTargets}
     */
    targets() { return this._targets; }
    /**
     * @param {Boolean} list 
     * @returns {Object|String[]}
     */
    labels(list = false) { return list ? Object.values(this._labels) : this._labels; };


    /**
     * @returns {Boolean}
     */
    debug(level = KunScenes.DebugMode.Disabled) {
        return level ? this._debug >= level : this._debug > KunScenes.DebugMode.Disabled;
    };
    /**
     * @param {String} sound 
     * @param {Number} round
     * @returns {KunScenes}
     */
    playSound(sound = '') {
        if (sound && KunSounds && typeof KunSounds.play === 'function') {
            KunSounds.play(sound);
        }
        return this;
    };
    /**
     * @param {KunAnimation.Mode|String} mode 
     * @returns {KunScenes}
     */
    setMode(mode = KunAnimation.Mode.Disabled) {
        this._mode = mode;
        const targets = this.targets();
        switch (this._mode) {
            case KunAnimation.Mode.Capture:
            case KunAnimation.Mode.Touch:
                targets.lock(false);
                break;
            case KunAnimation.Mode.Disabled:
            default:
                targets.clear().lock(true);
                //this.clearTargets().lock();
                break;
        }
        return this;
    };
    /**
     * @returns {String}
     */
    sfx(name = 'touch') {
        return name.length && this._sfx.hasOwnProperty(name) ? this._sfx[name] : this._sfx.touch;
    };
    /**
     * @returns {Boolean}
     */
    accurateSpots() { return this._accurate; }
    /**
     * @returns {Boolean}
     */
    locked() { return this._mode === KunAnimation.Mode.Disabled; };
    /**
     * Required for clear chaining. Do not remove atm
     * @returns {KunScenes}
     */
    clearTargets() {
        this.targets().clear();
        return this;
    };
    /**
     * @param {Number} x 
     * @param {Number} y 
     * @returns {KunScenes}
     */
    /*setPosition(x = 0, y = 0) {
        if (this._varX > 0) {
            $gameVariables.setValue(this._varX, x);
        }
        if (this._varY > 0) {
            $gameVariables.setValue(this._varY, y);
        }
        return this;
    };*/
    /**
     * @returns {Object} {x,y}
     */
    /*position() {
        return {
            'x': this._varX && $gameVariables.value(this._varX) || 0,
            'y': this._varY && $gameVariables.value(this._varY) || 0,
        };
    };*/
    /**
     * @param {String} name 
     * @param {Number} x 
     * @param {Number} y 
     * @returns {Object} {x,y}
     */
    picturePosition(name, x = 0, y = 0) {
        const pictures = name && $gameScreen._pictures.filter(picture => picture && picture._name === name) || [];
        const position = { x: 0, y: 0, };
        if (pictures.length) {
            position.x = pictures[0]._x + Math.floor(pictures[0]._scaleX / 100 * x);
            position.y = pictures[0]._y + Math.floor(pictures[0]._scaleY / 100 * y);
        }
        return position;
    };
    /**
     * @param {Number} value 
     * @returns {KunScenes}
     */
    scroll(value = 0) {
        if (Math.abs(value) && this._varwheel) {
            const min = 0;
            const max = 8;
            const amount = Math.max(($gameVariables.value(this._varwheel) + value / Math.abs(value)) % max, min);
            $gameVariables.setValue(this._varwheel, amount);
            //console.log($gameVariables.value(this._varWheel));
        }
        return this;
    };
    /**
     * @param {Number} counter 
     * @returns {KunScenes}
     */
    updateTouchPoints(counter = 0) {
        if (this._touchVar > 0) {
            $gameVariables.setValue(this._touchVar, counter);
        }
        return this;
    };
    /**
     * @param {Boolean} gameVar
     * @returns {Number}
     */
    touchLimit(gameVar = false) {
        return gameVar ? this._limitVar : this._limitVar && $gameVariables.value(this._limitVar) || 1;
    };
    /**
     * @returns {Boolean}
     */
    canCapture() {
        return this.mode() === KunAnimation.Mode.Capture;
    };
    /**
     * @returns {Boolean}
     */
    canTouch() {
        return this.mode() === KunAnimation.Mode.Touch && !this.locked();
    };
    /**
     * @returns {Boolean}
     */
    canWheel() {
        return this.mode() === KunAnimation.Mode.Touch && this._varwheel > 0;
    };
    /**
     * @returns {Boolean}
     */
    canPlayBack() {
        return this.mode() === KunAnimation.Mode.PlayBack;
    };
    /**
     * @returns {String}
     */
    mode() { return this._mode; };
    /**
     * @returns {Number}
     */
    FPS() { return this._fps || 20; };
    /**
     * @param {Boolean} mapname
     * @returns {KunScene[],String[]}
     */
    scenes(mapname = false) {
        return mapname && this._scenes.map(scn => scn.name()) || this._scenes;
        //return mapname ? Object.values(this._scenes) : this._scenes;
    };
    /**
     * @param {String} name 
     * @returns {KunScene}
     */
    scene(name = '') { return name && this.scenes().find(scn => scn.name() === name) || null; }
    /**
     * @param {String} name 
     * @returns {Boolean}
     */
    has(name = '') { return name && this.scenes(true).includes(name); }
    /**
     * @param {String} sfx
     * @param {Number} pitch
     * @param {Number} pan
     * @returns {KunScenes}
     */
    playse(sfx, pitch, pan) {
        if (sfx.length) {
            if (typeof pitch !== 'number') {
                pitch = 90 + Math.floor(Math.random() * 20);
            }
            if (typeof pan !== 'number') {
                pan = Math.floor(Math.random() * 20) - 10;
            }
            KunScenes.AudioManager(sfx, 100, pitch, pan);
        }
        return this;
    };
    /**
     * @param {Number} pictureId 
     * @param {String} name 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} scaleX 
     * @param {Number} scaleY 
     * @param {Number} opacity 
     * @param {Number} blend 
     * @param {Number} origin
     * @returns {Game_Picture}
     */
    /*preparePicture(name = '', pictureId = 0, x = 0, y = 0, scaleX = 100, scaleY = 100, opacity = 255, blend = 0, origin = 0) {
        if (name && pictureId) {
            $gameScreen.showPicture(
                pictureId, name,
                origin || 0, // origin (top-left)
                x, y,
                scaleX, scaleY,
                opacity, blend);

            return $gameScreen.picture(pictureId);
        }

        return null;
    };*/
    /**
     * @param {Number} pictureId 
     * @param {String} pictureName 
     * @returns {Game_Picture}
     */
    /*replacePicture(pictureId = 0, pictureName = '') {
        if (pictureName && pictureId) {

            const original = $gameScreen.picture(pictureId);
            if (original) {

                return this.preparePicture(pictureName, pictureId,
                    original.x(), original.y(),
                    original.scaleX(), original.scaleY(),
                    original.opacity(), original.blendMode(),
                    original.origin());
            }

        }
        return null;
    };*/
    /**
     * @returns {KunSceneCollection[]}
     */
    collections() { return this._collections; }

    /**
     * @param {String} se 
     * @param {Number} volume 
     * @param {Number} pitch 
     * @param {Number} pan 
     * @param {Boolean} interrupt
     */
    static AudioManager(se = '', volume = 90, pitch = 100, pan = 0, interrupt = false) {
        if (se.length) {
            if (interrupt) {
                AudioManager.stopSe();
            }
            //KunScenes.DebugLog( `Playing ${se} at vol ${volume}, pitch ${pitch} and pan ${pan} ${interrupt}` );
            AudioManager.playSe({ name: se, pan: pan || 0, pitch: pitch || 100, volume: volume || 90 });
        }
    };
    /**
     * @param {String} message 
     */
    static DebugLog() {
        if (KunScenes.manager().debug()) {
            console.log('[ KunScenes ]', ...arguments);
        }
    };

    /**
     * @param {String}
     * @returns {Boolean}
     */
    static command(command = '') {
        return ['kunanimations', 'kunanimation'].includes(command.toLowerCase());
    };
    /**
     * @returns {KunScenes}
     */
    static manager() { return KunScenes.__instance || new KunScenes(); }
}


/**
 * @returns {KunScenes.DebugMode|Number}
 */
KunScenes.DebugMode = { Disabled: 0, Enabled: 1, TraceLog: 2, };


/**
 * Content Importer
 */
class KunSceneImporter {

    constructor() {
        //this._scenes = 0;
        //this._pictures = 0;
        this._animations = 0;
        this._hotspots = 0;
        this._actions = 0;
        this._conditions = 0;

        this._scenes = [];
        this._collections = [];
    }
    /**
     * 
     * @returns {KunSceneImporter}
     */
    summary() {
        //leave this here for debugging.
        if (KunScenes.manager().debug(KunScenes.DebugMode.TraceLog)) {
            KunScenes.DebugLog(`Imported a total of ${this.scenes().length} animated scenes, ${this._animations} animation layers and ${this._hotspots} hotspots`);
            KunScenes.DebugLog(`Imported a total of ${this._actions} actions and  ${this._conditions} conditions`);
            KunScenes.DebugLog(`Imported a total of ${this._collections.length} Collections`);
        }
        return this;
    };

    /**
     * @returns {KunScene[]}
     */
    scenes() { return this._scenes; }
    /**
     * @returns {KunSceneCollection[]}
     */
    collections() { return this._collections; }

    /**
     * @param {String} picture 
     * @returns {Boolean}
     */
    has(picture = '') {
        return picture && this.scenes().find(scn => scn.name() === picture) || null;
    }
    /**
     * @param {KunScene} scene 
     * @returns {KunScenes}
     */
    add(scene = null) {
        if (scene instanceof KunScene && !this.has(scene.name())) {
            this.scenes().push(scene);
        }
        return this;
    };

    /**
     * @param {String[]} input 
     * @returns {Object}
     */
    importLabels(input = []) {
        const _labels = {};
        input.map(tag => tag.trim().split(':'))
            .filter(tag => tag.length)
            .forEach(tag => _labels[tag[0]] = tag.slice(1).join('|'));
        return _labels;
    }
    /**
     * @param {Object[]} data 
     * @returns {KunScene[]}
     */
    importScenes(data = []) {
        data.forEach(content => {
            if (!!content.picturegroup) {
                //picturegroup are same as groups, but now include collections, instead of a group name
                this.loadSceneV5(content);
            }
            else if (!!content.groups) {
                //pictures are grouped by named groups, to ease the stage setup
                this.loadSceneV4(content);
            }
            else if (!!content.pictures) {
                //load new version 3: picture data is packed and can define animation groups. Picture scenes can be customized individually
                this.loadSceneV3(content);
            }
            else if (!!content.source) {
                //load version 2: picturedata iis just a list of pictures, profiles and audiopacks must be attached.
                this.loadSceneV2(content);
            }
        });
        //return all saved scenes
        return this.scenes();
    }
    /**
     * @param {Object} data 
     * @returns {KunScene[]}
     */
    loadSceneV2(data = null) {
        if (data instanceof Object) {
            const pictures = Array.isArray(data.source) ? data.source : [];
            const soundLoop = data.soundLoop || 0;
            //sbprefix comes from older versions
            const audiopack = data.soundProfile || data.soundBankPrefix || [];
            const animdata = Array.isArray(data.framesets) && data.framesets || [];
            const actiondata = Array.isArray(data.actions) && data.actions || [];
            const spots = {};
            const spotdata = (Array.isArray(data.hotspots) ? data.hotspots : []);
            //import all scene defined hotspots
            spotdata.filter(spot => !spots[spot.name]).forEach(spot => spots[spot.name] = spot);
            //register a Scene Controller on every picture loaded in the list
            pictures.map((content, index) => {
                const soundpack = audiopack[audiopack.length > index && index || 0] || '';
                return this.createPictureV2(data, content, soundpack, soundLoop);
            }).forEach(scene => {
                animdata.forEach(content => scene.add(this.importAnimation(content, spots)));
                actiondata.forEach(content => scene.addAction(KunSceneImporter.importAction(content)));
                this.add(scene)
            });
        }
    };
    /**
     * @param {Object} data
     * @param {String} picture
     * @param {String} audiopack
     * @param {Number} soundLoop
     * @returns {KunScene}
     */
    createPictureV2(data, picture, audiopack = '', soundLoop = 0) {
        return new KunScene(
            picture,
            data.cols, data.rows, data.fps || 0,
            audiopack, soundLoop,
            data.mode || '',
        );
    };
    /**
     * @param {Object} data 
     * @returns {KunScene[]}
     */
    loadSceneV5(data = null) {
        if (data instanceof Object) {
            const spots = {};
            const spotdata = Array.isArray(data.hotspots) ? data.hotspots : [];
            const animations = Array.isArray(data.framesets) && data.framesets || [];
            const actions = Array.isArray(data.actions) && data.action || [];
            const picturegroup = Array.isArray(data.picturegroup) && data.picturegroup || []
            //import all scene defined hotspots
            spotdata.filter(spot => !spots[spot.name]).forEach(spot => spots[spot.name] = spot);
            picturegroup.forEach(content => {
                //run on every picture defined in the group
                (content.pictures || []).forEach(picture => {
                    //hook here the new group setup
                    (content.collections || []).forEach( collection => this.addToCollection(collection,picture));
                    //then create the spritesheet data
                    const scene = new KunScene(picture,
                        data.cols || 1, data.rows || 1, data.fps || 0,
                        content.sound || '', content.loop || 0, data.mode || '',
                    );
                    animations.forEach(content => scene.add(this.importAnimation(content, spots)));
                    actions.forEach(content => scene.addAction(this.importAction(content)));
                    this.add(scene);
                });
            });
        }
    }
    /**
     * @param {Object} data 
     * @returns {KunScene[]}
     */
    loadSceneV4(data = null) {
        if (data instanceof Object) {
            const spots = {};
            const spotdata = Array.isArray(data.hotspots) ? data.hotspots : [];
            const animations = Array.isArray(data.framesets) && data.framesets || [];
            const actions = Array.isArray(data.actions) && data.action || [];
            const groups = Array.isArray(data.groups) && data.groups || []
            const scenes = [];
            //import all scene defined hotspots
            spotdata.filter(spot => !spots[spot.name]).forEach(spot => spots[spot.name] = spot);
            groups.forEach(content => {
                //run on every picture defined in the group
                (content.pictures || []).forEach(picture => {
                    //hook here the new group setup
                    content.group && this.addToCollection(content.group, picture);
                    //then create the spritesheet data
                    const scene = new KunScene(picture,
                        data.cols || 1, data.rows || 1, data.fps || 0,
                        content.sound || '', content.loop || 0, data.mode || '',
                    );
                    animations.forEach(content => scene.add(this.importAnimation(content, spots)));
                    actions.forEach(content => scene.addAction(this.importAction(content)));
                    this.add(scene);
                });
            });
        }
    }
    /**
     * @param {Object} data 
     * @returns {KunScene[]}
     */
    loadSceneV3(data = null) {
        if (data instanceof Object) {
            const spots = {};
            const spotdata = Array.isArray(data.hotspots) ? data.hotspots : [];
            const animations = Array.isArray(data.framesets) && data.framesets || [];
            const actions = Array.isArray(data.actions) && data.action || [];
            const picdata = Array.isArray(data.pictures) && data.pictures || []
            //import all scene defined hotspots
            spotdata.filter(spot => !spots[spot.name]).forEach(spot => spots[spot.name] = spot);
            picdata.map(content => {
                //hook here the new group setup
                content.group && this.addToCollection(content.group, content.picture);
                //then create the spritesheet data
                return this.createPictureV3(data, content, spots);
            }).forEach(scene => {
                animations.forEach(content => scene.add(this.importAnimation(content, spots)));
                actions.forEach(content => scene.addAction(this.importAction(content)));
                this.add(scene);
            });
        }
    }
    /**
     * {content: pictures,cols,rows,fps,framesets,hotspots   |  spots: {}}
     * @param {Object} data
     * @param {Object} spritesheet
     * @returns {KunScene}
     */
    createPictureV3(data = null, spritesheet = null) {
        return data && spritesheet && new KunScene(
            spritesheet.picture,
            data.cols || 1,
            data.rows || 1,
            data.fps || 0,
            spritesheet.sound || '',
            spritesheet.loop || 0,
            data.mode || '',
        ) || null;
    }

    /**
     * @param {String} name 
     * @returns {KunSceneCollection}
     */
    createCollection(name = '') {
        const group = new KunSceneCollection(name);
        this.collections().push(group);
        return group;
    }
    /**
     * @param {String} name 
     * @param {String} picture 
     * @returns {KunSceneCollection}
     */
    addToCollection(name = '', picture = '') {
        const collection = this.collections().find(c => c.name() === name) || this.createCollection(name);
        collection.add(picture);
        this.collections().push(collection);
        return collection;
    }
    /**
     * @param {Object[]} input 
     * @returns {KunSceneCollection[]}
     */
    importCollections(input = []) {
        input.filter(content => content.pictures.length).forEach(content => {
            const group = new KunSceneCollection(content.profile);
            content.pictures.forEach(pic => pic && group.add(pic));
            this.collections().push(group);
        });
        return this.collections();
    }
    /**
     * 
     * @param {Object} frameSet 
     * @param {Object} hotSpots 
     * @returns {KunFrameSet}
     */
    importAnimation(frameSet, hotSpots = {}) {
        const animation = new KunFrameSet(
            frameSet.name,
            frameSet.type,
            frameSet.fps,
            frameSet.loops,
            Array.isArray(frameSet.next) ? frameSet.next : [],
            Array.isArray(frameSet.sounds) ? frameSet.sounds : frameSet.bank || [],
            frameSet.offsetX,
            frameSet.offsetY
        );
        //import frameset
        (Array.isArray(frameSet.frames) ? frameSet.frames : []).forEach(frame => {
            animation.add(frame);
        });
        //import conditions
        (Array.isArray(frameSet.conditions) ? frameSet.conditions : []).forEach(condition => {
            animation.addCondition(this.importCondition(condition));
        });
        //merge hotspots into touchspots
        (Array.isArray(frameSet.spots) ? frameSet.spots : []).forEach(touchSpot => {
            if (hotSpots.hasOwnProperty(touchSpot.name)) {
                const spot = hotSpots[touchSpot.name];
                Object.keys(spot)
                    .filter(name => !touchSpot.hasOwnProperty(name))
                    .forEach(name => touchSpot[name] = spot[name]);
                animation.addspot(this.importSpot(touchSpot));
            }
        });
        //import all tags
        (Array.isArray(frameSet.tags) ? frameSet.tags : []).forEach(tag => animation.tag(tag));
        this._animations++;
        return animation;
    };
    /**
     * 
     * @param {Object} content 
     * @returns {KunAction}
     */
    importAction(content) {
        this._actions++;
        return new KunAction(content.var || 0, content.op || '', content.val,);
    };
    /**
     * 
     * @param {Object} content 
     */
    importCondition(content) {
        this._conditions++;
        return new KunCondition(content.var || 0, content.op || '', content.val || 0, content.target || false, content.on || [], content.off || []);
    };
    /**
     * @param {Object} data 
     * @returns {KunHotSpot}
     */
    importSpot(data) {
        const spot = new KunHotSpot(data.name,
            data.x1, data.y1,
            data.x2, data.y2,
            data.trigger || KunHotSpot.Trigger.Queue,
            Array.isArray(data.next) && data.next || [],
            data.sfx
        );
        if (data.varId > 0) {
            //backwards compatibility.
            spot.addAction(new KunAction(data.varId, data.behavior, data.amount || 1));
        }
        //No actions parameter until next versions, use varId instead for backwards compatibility
        if (Array.isArray(data.actions)) {
            //map all event actions
            data.actions.forEach(content => spot.addAction(this.importAction(content)));
        }
        if (Array.isArray(data.conditions)) {
            //map all event conditions
            data.conditions.forEach(content => spot.addCondition(this.importCondition(content)));
        }
        if (Array.isArray(data.tags)) {
            data.tags.forEach(tag => spot.tag(tag));
        }

        this._hotspots++;
        return spot;
    };



    /**
     * @returns {Object[]}
     */
    static listAnimationPacks() {
        return $plugins.filter(plugin => plugin.name === 'KunAnimationPack' && plugin.status && plugin.parameters.scenes.length)
            .map(plugin => plugin.parameters);
    };
    /**
     * @returns {Object}
     */
    static PluginData() {
        /**
         * V1
         * @param {String} key 
         * @param {*} value 
         * @returns {Object}
         */
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
                Object.keys(value).forEach(key => _output[key] = _parsePluginData(key, value[key]));
                return _output;
            }
            return value;
        };

        const pluginData = _parsePluginData('KunAnimations', PluginManager.parameters('KunAnimations'));
        pluginData.scenes = pluginData.scenes || [];
        pluginData.profiles = pluginData.profiles || [];

        this.listAnimationPacks().map(pack => _parsePluginData('KunAnimationPack', pack)).forEach(function (pack) {
            //Import animation packs
            if (pack.scenes.length) {
                KunScenes.DebugLog(`Loading Animation Pack ${pack.name} (${pack.scenes.length} scenes)`);
                pack.scenes.forEach(function (scene) {
                    pluginData.scenes.push(_parsePluginData('KunAnimationPack', scene));
                });
            }
            //import stage profiles
            if (pack.profiles && pack.profiles.length) {
                pack.profiles.forEach(profile => {
                    pluginData.profiles.push(_parsePluginData('KunAnimationPack', profile))
                });
            }
        });
        return pluginData;
    };

}



/**
 * @param {String} name 
 * @param {Number} cols 
 * @param {Number} rows 
 * @param {Number} fps 
 * @param {String} soundProfile 
 * @param {Number} soundLoop
 * @param {String} mode [move,touch,diabled ...]
 */
class KunScene {
    constructor(name, cols = 1, rows = 1, fps = 0, soundProfile = '', soundLoop = 0, mode = '') {
        this._name = name || '';
        this._cols = cols || 1;
        this._rows = rows || 1;
        //this._framesets = {};
        this._framesets = [];
        //this one can be overriden
        this._fps = fps || KunScenes.manager().FPS();
        this._audioProfile = soundProfile || '';
        this._audioLoop = soundLoop || 0;
        //this._dynamic = canmove || false;
        this._mode = mode || KunAnimation.Mode.Default;
        this._actions = [
            //KunActions
        ];
    }
    /**
     * @param {String} alias or local name
     * @param {Number} pictureid
     * @param {Boolean} autoplay
     * @param {String} first 
     * @returns {KunAnimation}
     */
    createAnimation(alias = '', pictureid = 0, autoplay = false, first = '') {
        switch (this.mode()) {
            case KunAnimation.Mode.Moving:
                return new KunMovingAnimation(this, alias, pictureid, autoplay, first);
            case KunAnimation.Mode.Touch:
                return new KunInteractiveAnimation(this, alias, pictureid, autoplay, first);
            default:
                return new KunAnimation(this, alias, pictureid, autoplay, first);
        }
    };
    /**
     * @returns {String}
     */
    toString() {
        return this.name();
    };
    /**
     * @returns {String}
     */
    name() {
        return this._name;
    };
    /**
     * @returns {String}
     */
    mode() { return this._mode; }
    /**
     * @returns {KunFrameSet[]}
     */
    framesets() { return this._framesets; };
    /**
     * @returns {Number}
     */
    cols() { return this._cols; }
    /**
     * @returns {Number}
     */
    rows() { return this._rows; }
    /**
     * @returns {Number}
     */
    totalFrames() { return this._cols * this._rows; };
    /**
     * @param {String} name 
     * @returns {Boolean}
     */
    has(name = '') {
        return name && this.framesets().filter(fs => fs.name() === name).length > 0;
    }
    /**
     * @param {KunFrameSet} frameset 
     * @returns {KunScene}
     */
    add(frameset) {
        if (frameset instanceof KunFrameSet) {
            this.framesets().push(frameset);
        }
        return this;
    };
    /**
     * @returns {Boolean}
     */
    empty() {
        return this.framesets().length === 0;
    };
    /**
     * @param {String} sound
     * @returns {String}
     */
    soundProfile(sound = '') {
        return sound ? this._audioProfile && this._audioProfile + '-' + sound || sound : this._audioProfile;
    };
    /**
     * @returns {Number}
     */
    soundLoop() {
        return this._audioLoop;
    };
    /**
     * @returns {Number}
     */
    fps() {
        return this._fps || KunScenes.manager().FPS();
    };
    /**
     * @param {KunAction} action
     * @returns {KunScene}
     */
    addAction(action, tag = '') {
        if (action instanceof KunAction) {
            this._actions.push(action.tag(tag));
        }
        return this;
    };
    /**
     * @param {String} tag
     * @returns {KunAction[]}
     */
    actions(tag = '') {
        return tag ? this._actions.filter(action => action.is(tag)) : this._actions;
    };
    /**
     * @param {String} tag
     * @returns {KunScene}
     */
    runActions(tag = '') {
        this.actions(tag).forEach(action => action.update());
        return this;
    };
}

/**
 * handle quick command picture loading and replacing from the animation system
 * @class {KunPicture}
 */
class KunPicture {
    /**
     * @param {String} picture 
     * @param {Number} pictureid 
     */
    constructor(picture = '', pictureid = 0) {
        this._picture = picture || '';
        this._id = pictureid || 0;
    }
    /**
     * @returns {String}
     */
    name() { return this._picture; }
    /**
     * @returns {Number}
     */
    id() { return this._id; }
    /**
     * @returns {Boolean}
     */
    ready() { return !!this.name() && !!this.id(); }
    /**
     * @returns {Game_Picture}
     */
    gamePicture() { return this.id() && $gameScreen.picture(this.id()) || null; }
    /**
     * @returns {KunPicture}
     */
    remove() {
        this.id() && $gameScreen.erasePicture(this.id());
        return this;
    }
    /**
     * @returns {Number[]}
     */
    position() {
        const gp = this.gamePicture();
        return gp && [
            Math.floor(gp.x()),
            Math.floor(gp.y()),
        ] || [0, 0];
    }
    /**
     * @returns {Number[]}
     */
    scale() {
        const gp = this.gamePicture();
        //return gp && [gp.scaleX(),gp.scaleY()] || [100,100];
        return gp && [gp.scaleX(), gp.scaleY()] || [0, 0];
    }
    /**
     * Transform x,y screen touch coordinates into local spot coordinates using scale and picture location
     * @param {Game_Picture} picture 
     * @returns {Number[]}
     */
    offset(x = 0, y = 0) {
        const scale = this.scale();
        const local = this.position();
        //must return zero if scale is not set???
        //return [x,y].map( (v , i) => scale[i] && Math.floor((v - local[i]) * 100 / scale[i]) || 0 );
        return [x, y].map((v, i) => scale[i] && Math.floor((v - local[i]) * 100 / scale[i]) || v);
    }
    /**
     * Apply transitions and tints, some day. Now just let the picture be updated
     * @param {Number} opacity 
     * @param {Number} blend 
     */
    applyEffects(opacity = 255, blend = 0) {
        this.applyBlending(blend);
        this.applyOpacity(opacity);
    }
    /**
     * @param {Number} blend 
     * @returns {KunPicture}
     */
    applyBlending(blend = KunPicture.Blending.Normal) {
        const blending = Object.values(KunPicture.Blending);
        const gp = this.gamePicture();
        if (gp) {
            gp._blendMode = blend % blending.length;
        }
        return this;
    }
    /**
     * @param {Number} opacity 
     * @returns {KunPicture}
     */
    applyOpacity(opacity = 255) {
        const gp = this.gamePicture();
        if (gp) {
            gp._opacity = opacity % 256; //(this._opacity * (d - 1) + this._targetOpacity) / d;
        }
        return this;
    }
    /**
     * Backwards compatibility
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} scaleX 
     * @param {Number} scaleY 
     * @param {Number} opacity 
     * @param {Number} blend 
     * @param {Number} origin
     * @returns {Game_Picture}
     */
    prepare(x = 0, y = 0, scaleX = 100, scaleY = 100, opacity = 255, blend = 0, origin = 0) {
        return this.show(x, y, scaleX, scaleY, opacity, blend, origin);
    }
    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} scaleX 
     * @param {Number} scaleY 
     * @param {Number} opacity 
     * @param {Number} blend 
     * @param {Number} origin
     * @returns {Game_Picture}
     */
    show(x = 0, y = 0, scaleX = 100, scaleY = 100, opacity = 255, blend = 0, origin = 0) {
        if (this.ready) {
            $gameScreen.showPicture(
                this.id(), this.name(),
                origin || 0, // origin (top-left)
                x || 0, y || 0, scaleX || 100, scaleY || 100,
                opacity || 255, blend || 0);
            //console.log($gameScreen.picture(this.id()));
            return $gameScreen.picture(this.id());
        }
        return null;
    };
    /**
     * @returns {Game_Picture}
     */
    replace(name = '') {
        if (this.ready() && name) {
            const original = $gameScreen.picture(this.id());
            //console.log('To be replaced',original);
            if (name !== this.name()) {
                this._picture = name;
                return this.show(
                    original.x(), original.y(),
                    original.scaleX(), original.scaleY(),
                    original.opacity(), original.blendMode(),
                    original.origin());
            }
            return this;
        }
        return null;
    };
}
/**
 * @type {KunPicture.Blending|Number}
 */
KunPicture.Blending = {
    Normal: 0,
    Add: 1,
    Multiply: 2,
    Screen: 3,
};

/**
 * Manage animation collections with this helper
 * @class {KunSceneCollection}
 */
class KunSceneCollection {
    /**
     * @param {String} name 
     */
    constructor(name = 'collection') {
        this._name = name;
        this._scenes = [];
    }
    /**
     * @returns {KunScenes}
     */
    manager() { return KunScenes.manager(); }
    /**
     * @returns {String}
     */
    name() { return this._name; }
    /**
     * @param {Boolean} map
     * @returns {String[]|KunScene[]}
     */
    scenes(map = false) {
        return map && this._scenes
            .map(picture => this.manager().scene(picture))
            .filter(scn => !!scn) || this._scenes;
    }
    /**
     * @returns {Number}
     */
    count() { return this.scenes().length }
    /**
     * @param {String} picture 
     * @returns {KunSceneCollection}
     */
    add(picture = '') {
        if (!this.scenes().includes(picture)) {
            this._scenes.push(picture);
        }
        return this;
    }
    //stages() { }
    /**
     * Create an animation and alias from a profile setup
     * @param {String} alias
     * @param {Number} id 
     * @param {String} first 
     * @param {Boolean} random
     * @returns {KunAnimation}
     */
    load(alias = '', id = 0, first = '' , random = false ) {
        const stage = alias || this.name();
        //const scenes = this.scenes(true); //map scenes from the manager
        const scenes = this.scenes();
        if (scenes.length) {
            //this.manager().scene(picture)
            const index = random && Math.floor(Math.random() * scenes.length) || 0;
            const scene = this.manager().scene(scenes[index]);
            const animation = scene.createAnimation(alias, id, '', !!first, first);
            scenes.forEach((picture, index) => {
                animation.addStage(`${stage}_${index + 1}`, picture );
            });
            return animation;
        }
        return null;
    };
}

/**
 * @param {String} name 
 * @param {String} type 
 * @param {Number} fps 
 * @param {Number} loops 
 * @param {String} next 
 * @param {String[]|String} sounds
 * @param {Number} offsetX
 * @param {Number} offsetY
 */
class KunFrameSet {
    constructor(name, type = KunAnimation.Behavior.Default, fps = 0, loops = 0, next = [], sounds = [], offsetx = 0, offsety = 0) {
        this._name = name.toLowerCase().replace(/[\s\_]/, '-');
        this._fps = typeof fps === 'number' && fps > 0 ? fps : 0;
        this._frames = [];
        this._type = type || KunAnimation.Behavior.Default;
        this._loops = loops || 0;
        this._offset = [offsetx || 0, offsety || 0];
        //this._offsetX = offsetx || 0;
        //this._offsetY = offsety || 0;
        this._tags = [];
        this._spots = [];

        this._next = Array.isArray(next) ? next : (typeof next === 'string' && next.length ? [next] : []);
        this._sounds = Array.isArray(sounds) ? sounds : (typeof sounds === 'string' && sounds.length ? [sounds] : []);

        this._conditions = [
            //KunConditions
        ];
    }
    /**
     * @returns {Number[]}
     */
    offset() { return this._offset; }
    /**
     * List all spots as array or object ids
     * @param {Boolean} mapname
     * @returns {KunHotSpot[]}
     */
    spots(mapname = false) { return mapname && this._spots.map(s => s.name()) || this._spots; }
    /**
     * @param {String} name 
     * @returns {KunHotSpot}
     */
    spot(name = '') { return this.spots().find(spot => spot.name() === name) || null; }
    /**
     * @returns {Boolean}
     */
    cantouch() { return this.spots().length > 0; };
    /**
     * @param {KunHotSpot} spot 
     * @returns {KunFrameSet}
     */
    addspot(spot = null) {
        if (spot instanceof KunHotSpot && !this.spot(spot.name())) {
            this.spots().push(spot);
        }
        return this;
    };
    /**
     * Check if any spot was touched
     * @param {Number} x 
     * @param {Number} y 
     * @returns {KunHotSpot} 
     */
    touchSpot(x, y) {
        const hotspots = this.spots().filter(spot => spot.unlocked() && spot.collide(x, y));
        return hotspots.length ? hotspots[0] : null;
    };
    /**
     * @returns {String}
     */
    behavior() { return this._type; };
    /**
     * @param {Number} frame 
     * @returns {KunFrameSet}
     */
    add(frame) {
        this._frames.push(frame);
        return this;
    };
    /**
     * @returns {Number}
     */
    fps() {
        return this._fps;
    };
    /**
     * @returns {Number}
     */
    loops() {
        return this._loops;
    };
    /**
     * @returns {Number}
     */
    frames() {
        return this._frames.length > 0 ? this._frames : [0];
    }
    /**
     * @returns {Number}
     */
    //first() { return this.frames().length > 0 ? this.frames()[0] : 0; };
    /**
     * @param {Number} index 
     * @returns {Number}
     */
    frame(index = 0) {
        return this._frames.length > index ? this._frames[index] : this._frames[0];
    };
    /**
     * @returns {Number}
     */
    count() {
        return this.frames().length;
    };
    /**
     * @returns {Number}
     */
    name() { return this._name; };
    /**
     * @returns {String[]}
     */
    next() { return this._next; };
    /**
     * @param {Boolean} select
     * @returns {String[]|String}
     */
    getNext(select = false) {
        if (select) {
            var size = this._next.length;
            return size ? this._next[Math.floor(Math.random() * size)] : '';
        }
        return this._next;
    }
    /**
     * @param {Boolean} select
     * @returns {String[]|String}
     */
    sounds(select = false) {
        var size = this._sounds.length;
        if (select) {
            //always return a string with a select flag!
            return size ? this._sounds[Math.floor(Math.random() * size)] : '';
        }
        return this._sounds;
    };
    /**
     * @param {String} tag 
     * @returns {KunFrameSet}
     */
    tag(tag = '') {
        if (!this.tagged(tag)) {
            this.tags().push(tag);
        }
        return this;
    }
    /**
     * @param {String} tag 
     * @returns {Boolean}
     */
    tagged(tag = '') { return !!tag && this.tags().includes(tag); }
    /**
     * @returns {String[]}
     */
    tags() { return this._tags; }
    /**
     * @param {KunCondition} condition
     * @returns {KunFrameSet}
     */
    addCondition(condition) {
        if (condition instanceof KunCondition) {
            this._conditions.push(condition);
        }
        return this;
    };
    /**
     * @param {Boolean} filter
     * @returns {KunCondition[]}
     */
    conditions(filter = false) {
        return filter ?
            this._conditions.filter(condition => condition.validate()) :
            this._conditions;
    };
    /**
     * @returns {Boolean}
     */
    unlocked() {
        return this.conditions(true).length === this.conditions().length;
    };
    /**
     * @param {String} soundpack
     * @param {Number} soundloop
     * @param {Number} variance 
     * @returns {KunFrameLoop}
     */
    createLoop(soundpack = '', soundloop = 0, variance = 1) {
        return new KunFrameLoop(this, soundpack, soundloop, variance);
    }
}
/**
 * 
 */
class KunFrameLoop {
    /**
     * @param {KunFrameSet} frameset 
     * @param {String} soundpack
     * @param {Number} soundloop
     * @param {Number} variance
     */
    constructor(frameset = null, soundpack = '', soundloop = 0, variance = 1) {
        this._fs = frameset instanceof KunFrameSet && frameset || null;
        this._soundpack = soundpack || '';
        this._soundloop = soundloop || 0;
        this.reset(variance);
    }
    /**
     * @param {KunFrameSet} frameset 
     * @returns {KunFrameLoop}
     */
    replace(frameset = null) {
        if (frameset instanceof KunFrameSet) {
            this._fs = frameset;
            this.reset();
        }
        return this;
    }
    /**
     * @param {Number} variance 
     * @returns {KunFrameLoop}
     */
    reset(variance = 1) {
        this._loop = 0;
        this._backwards = false;
        this._completed = false;
        this._frame = this.behavior() === KunAnimation.Behavior.Reverse && this.count() - 1 || 0;
        this._loops = this.ready() && this.frameset().loops() || 0;
        this.setfps((this.ready() && this.frameset().fps() || this.manager().FPS()) * variance);
        if( variance ){
            this._loops *= variance;
        }
        //console.log(this,variance);
        return this;
    }
    /**
     * @returns {KunScenes}
     */
    manager() { return KunScenes.manager(); }
    /**
     * @returns {KunFrameSet}
     */
    frameset() { return this._fs; }
    /**
     * @returns {Boolean}
     */
    ready() { return !!this.frameset(); }
    /**
     * @returns {String}
     */
    name() { return this.ready() && this.frameset().name() || '' }
    /**
     * @param {String} name 
     * @returns {Number[]}
     */
    offset() { return this.ready() && this.frameset().offset() || [0, 0]; };

    /**
     * Check if any spot was touched
     * @param {Number} x 
     * @param {Number} y 
     * @returns {KunHotSpot} 
     */
    touch(x, y) {
        const hotspots = this.spots(true).filter(spot => spot.collide(x, y));
        return hotspots.length ? hotspots[0] : null;
    };
    /**
     * @param {String} target 
     * @returns {KunHotSpot}
     */
    spot(target = '') {
        return this.ready() && this.frameset().spot(target) || null;
    }
    /**
     * @param {Boolean} unlocked list all unlocked spots
     * @returns {KunHotSpot[]}
     */
    spots(unlocked = false) {
        const spots = this.ready() && this.frameset().spots() || [];
        return unlocked && spots.filter(spot => spot.unlocked()) || spots;
    }

    /**
     * @param {String} tag 
     * @returns {Boolean}
     */
    tagged(tag = '') { return !!tag && this.frameset().tagged(tag); }
    /**
     * @returns {String[]}
     */
    tags() { return this.ready() && this.frameset().tags() || [] }


    /**
     * @returns {Boolean}
     */
    fps() { return this._fps; }
    /**
     * @param {Number} fps 
     * @returns {KunFrameLoop}
     */
    setfps(fps = 0) {
        this._fps = fps || this.manager().FPS()
        return this;
    }
    /**
     * @returns {Number}
     */
    frame(getindex = false) {
        return getindex ? this.ready() && this.frameset().frame(this._frame) || 0 : this._frame;
    }
    /**
     * @param {Boolean} map
     * @returns {Number}
     */
    first(map = false) {
        return map && this.ready() && this.frameset().frames()[0] || 0
    }
    /**
     * @param {Boolean} map
     * @returns {Number}
     */
    last(map = false) {
        if (map) {
            return this.ready() && this.frameset().frames()[this.count() - 1] || 0;
        }
        return this.count() - 1 || 0;
    }
    /**
     * @returns {String[]}
     */
    next() { return this.ready() && this.frameset().next() || []; };
    /**
     * @param {Number} loop
     * @returns {KunFrameLoop}
     */
    playAudio() {
        if (this.ready()) {
            const sound = this.audioSource(this.frameset().sounds(true));
            //console.log('Playing sound: ',sound);
            sound && this.manager().playSound(sound);
        }
        return this;
    };
    /**
     * @param {String} sound
     * @returns {String}
     */
    audioSource(sound = '') { return sound && this._soundpack && this._soundpack + '-' + sound || sound; };
    /**
     * @returns {Number}
     */
    //soundloop(){ return this._soundloop || this.loops() || 4; }
    soundloop() { return this._soundloop || 4; }
    /**
     * @param {Number} loop 
     * @returns {Boolean}
     */
    audioLoop(loop = 0) { return !(loop % this.soundloop()); }
    /**
     * @returns {Number}
     */
    loops() { return this._loops; }
    /**
     * @returns {Number}
     */
    count() { return this.ready() && this.frameset().count() || 0; }
    /**
     * @returns {Boolean}
     */
    infinite() { return !this.loops(); }
    /**
     * Frameloop has completed all rounds, allow to jump to other framesets or perform other logics before resetting
     * @returns {Boolean}
     */
    //completed() { return !this.infinite() && this._loop + 1 >= this.loops(); }
    completed() { return this._completed; }
    /**
     * @returns {Boolean}
     */
    updateloop() {
        this.audioLoop(this._loop) && this.playAudio();
        const loops = this.loops();
        this._loop = ++this._loop % (loops || 10); //allow count loop on infinite to handle audio sfx
        return loops && !this._loop || false;
    }
    /**
     * @returns {String}
     */
    behavior() { return this.ready() && this.frameset().behavior() || ''; }
    /**
     * Update the frame loop following its behaviour, and resets when done
     * @returns {Number} Current Sprite_Picture rendering frame
     */
    update() {
        if (this._completed) {
            this._completed = false;
        }
        //console.log(`${this.name()} round ${this._loop + 1}: ${this._frame}/${this.count()}`);
        switch (this.behavior()) {
            case KunAnimation.Behavior.PingPong:
                return this.pingpong();
            case KunAnimation.Behavior.Reverse:
                return this.backwards();
            case KunAnimation.Behavior.Forward:
                return this.forwards();
            case KunAnimation.Behavior.Static:
            default: return this.frame(true);
        }
    };
    /**
     * @returns {Number}
     */
    pingpong() {
        if (this._backwards) {
            //reverse
            this._frame = Math.max(--this._frame, 0);
        }
        else {
            if (++this._frame >= this.count() - 1) {
                this._backwards = true;
            }
        }
        //after complete the round
        if (this._backwards && this._frame === 0) {
            this._backwards = false;
            this._completed = this.updateloop();
        }
        return this.frame(true);
    }
    /**
     * @returns {Number}
     */
    backwards() {
        this._frame = Math.max(--this._frame, 0);
        if (this._frame === 0) {
            this._frame = this.count() - 1;
            this._completed = this.updateloop();
            //loop is finished
        }
        return this.frame(true);
    }
    /**
     * @returns {Number}
     */
    forwards() {
        //check this conditiojn first, then update index, also run when index points to last frame.
        this._frame = ++this._frame % this.count();
        if (this._frame === 0) {
            //loop is finished?
            this._completed = this.updateloop();
        }
        return this.frame(true);
    }
}

/**
 * @type {KunAnimation}
 */
class KunAnimation {
    /**
     * @param {KunScene} scene 
     * @param {String} alias
     * @param {Number} pictureid
     * @param {String} fs
     * @param {Boolean} autoplay
     */
    constructor(scene = null, alias = '', pictureid = 0, autoplay = false, fs = '') {

        this._scene = scene instanceof KunScene ? scene : null;
        this._frameloop = this.initializeloop(fs);

        this.rename(alias || '');
        this.setID(pictureid || 0);
        //Game_Picture for aplying transforms and effects
        this._picture = null;
        this._playing = autoplay && this.frameloop().ready() || false;
        this._elapsed = 0;
        //this one can be overriden
        this._variant = 0;
        //custom playlist, stages and var mapping animations
        this._playlist = [];
        this._stages = {};
        this._mapvar = 0;
        this.setMode(this.scene() && this.scene().mode() || KunAnimation.Mode.Default);
        this.reset();
    }
    /**
     * @param {String} frameset 
     * @returns {KunFrameLoop}
     */
    initializeloop(frameset = '') {
        const fs = this.get(frameset) || this.first() || new KunFrameLoop();
        return fs.createLoop(
            this.scene().soundProfile(),
            this.scene().soundLoop()
        );
    }
    /**
     * @returns {String}
     */
    toString() { return `${this.name()} (${this.alias()}) - ${this.ID()}`; }
    /**
     * @returns {KunScenes}
     */
    manager() { return KunScenes.manager(); }
    /**
     * @param {Boolean} asValue
     * @returns {Number}
     */
    mapvar(asValue = false) {
        return asValue ? this._mapvar && $gameVariables.value(this._mapvar) || 0 : this._mapvar;
    }
    /**
     * @param {Number} gameVar 
     * @returns {KunAnimation}
     */
    setVarMap(gameVar = 0) {
        this._mapvar = gameVar || 0
        return this;
    }
    /**
     * @param {String} mode 
     * @returns {KunAnimation}
     */
    setMode(mode = KunAction.Mode.Default) {
        this._mode = mode;
        return this;
    }
    /**
     * @returns {String}
     */
    mode() { return this._mode === KunAnimation.Mode.Default && this.scene().mode() || this._mode; };
    /**
     * @returns {Boolean}
     */
    canplayback() { return this.mode() === KunAnimation.Mode.PlayBack; };
    /**
     * @returns {Boolean}
     */
    cantouch() { return this instanceof KunInteractiveAnimation && this.mode() === KunAnimation.Mode.Touch; };
    /**
     * @returns {Boolean}
     */
    canremove() { return this.mode() === KunAnimation.Mode.Remove; }
    /**
     * @param {Boolean} remove
     * @returns {KunAnimation}
     */
    mark4Remove(remove = false) {
        this.setMode(KunAnimation.Mode.Remove);
        remove && this.picture().remove();
        return this;
    }
    /**
     * @returns {Boolean}
     */
    cananimate() {
        return ![
            KunAnimation.Mode.Disabled,
            KunAnimation.Mode.Static,
        ].includes(this.mode());
    }
    /**
     * @returns {Boolean}
     */
    canmove() { return this instanceof KunMovingAnimation; }

    /**
     * @param {Boolean} list 
     * @returns {String[]|Object}
     */
    stages(list = false) { return list ? Object.keys(this._stages) : this._stages; };
    /**
     * @param {String} stage 
     * @param {String} picture 
     * @returns {KunScene}
     */
    addStage(stage = '', picture = '') {
        if (stage && !this.stages().hasOwnProperty(stage) && this.manager().has(picture)) {
            this.stages()[stage] = picture;
        }
        return this;
    };
    /**
     * @param {String} name 
     * @param {String} stage 
     * @returns {Boolean}
     */
    changeStage(stage = '', reset = false) {
        const picture = this.stages()[stage];
        if (!!picture) {
            const animation = !reset && this.frameloop().name() || '';
            const scene = this.manager().scene(picture);
            if (scene) {
                this._scene = scene;
                KunScenes.DebugLog(`Replacing stage for ${this.name()} to ${this.scene().name()} ...`);
                this.picture().replace(this.scene().name());
                //this.manager().replacePicture(this.ID(), picture);
                this.play(animation || this.first().name());
                return true;
            }
        }
        return false;
    };
    /**
     * check if the picture has been replaced within the update loop (same way as the Sprite_Picture list)
     * @param {Sprite_Picture} picture 
     * @returns {KunAnimation}
     */
    hasChanged(picture = null) {
        if (picture instanceof Sprite_Picture) {
            if (this.name() !== picture._pictureName) {
                this.changePicture(picture);
                return true;
            }
        }
        return false;
    }
    /**
     * @param {Sprite_Picture} picture 
     * @returns {KunAnimation}
     */
    changePicture(picture = null) {
        if (picture instanceof Sprite_Picture) {
            const name = picture._pictureName;
            if (this.isme(name)) {
                return this;
            }
            this._id = picture._pictureId;
            //prepare to replace scene
            const scene = KunScenes.manager().scene(name);
            if (scene) {
                this._scene = scene;
                this.play(this.first().name());
                return this;
            }
        }
        //give back null to the failed animation reload
        return null;
    }
    /**
     * @param {Boolean} list 
     * @returns {String[]}
     */
    labels(list = false) {
        return this.manager().labels(list);
    }
    /**
     * @returns {Object}
     */
    mapAnimationLabels() {
        const labels = {};
        this.animations()
            .map(a => a.name())
            .forEach(animation => labels[animation] = this.labels().hasOwnProperty(animation) ? this.labels()[animation] : animation);
        return labels;
    }
    /**
     * @returns {Object}
     */
    mapSpotLabels() {
        const labels = {};
        //const spots = this.frameset() && this.frameset().spots(true) || [];
        const spots = this.frameloop().spots(true);
        spots.map(spot => spot.name())
            .forEach(spot => labels[spot] = this.labels().hasOwnProperty(spot) ? this.labels()[spot] : spot);
        return labels;
    };
    /**
     * @returns {Object}
     */
    mapStages() {
        const labels = {};
        this.stages(true).forEach(stage => labels[stage] = this.labels().hasOwnProperty(stage) ? this.labels()[stage] : stage);
        return labels;
    };
    /**
     * @param {String} type 
     * @returns {Object}
     */
    mapMenu(type = 'spot') {
        switch (type) {
            case 'stage':
                return this.mapStages();
            case 'animation':
                return this.mapAnimationLabels();
            case 'touch':
            case 'capture':
            default:
                return this.mapSpotLabels();
        }
    };
    /**
     * @param {String} tag 
     * @returns {KunAnimation}
     */
    runActions(tag = '') {
        if (this.scene()) {
            this.scene().runActions(tag);
        }
        return this;
    };
    /**
     * @param {String} animation 
     * @returns {KunAnimation}
     */
    push(animation) {
        this._playlist.push(animation);
        return this;
    };
    /**
     * @returns {KunAnimation}
     */
    clear(animation = '') {
        this._playlist = animation ? this._playlist.filter(a => a !== animation) : [];
        return this;
    };
    /**
     * @returns {String[] }
     */
    playlist() { return this._playlist; };
    /**
     * @returns {Number}
     */
    rows() { return this.scene() && this.scene().rows() || 0; };
    /**
     * @returns {Number}
     */
    cols() { return this.scene() && this.scene().cols() || 0; };
    /**
     * @param {String} name 
     * @returns {Number[]}
     */
    offset() { return this.frameloop().offset(); };
    /**
     * @param {String} name
     * @returns {KunAnimation}
     */
    play(name = '') {
        name && this.frameloop().replace(this.get(name, true));
        this._playing = this.frameloop().ready();
        return this;
    }
    /**
     * @param {String} tag
     * @param {Boolean} random 
     * @returns {Boolean}
     */
    playTag(tag = '', random = false) {
        if (tag) {
            const list = this.animations().filter(fs => fs.tagged(tag));
            if (list.length) {
                const fs = random && list[Math.floor(Math.random() * list.length)] || list[0];
                this.frameloop().replace(fs);
                KunScenes.DebugLog(`Playing animation ${this.name()} by tag ${tag} ( ${this.frameloop().name()} selected)`);
                this.reset();
                return true;
            }
        }
        this._playing = this.frameloop().ready();
        return false;
    }
    /**
     * @returns {KunAnimation}
     */
    playMap() {
        if (this.mapvar() && this.playlist().length) {
            const selected = this.mapvar(true) % this.playlist().length;
            this.play(this.playlist()[selected]);
        }
        return this;
    }
    /**
     * @returns {KunAnimation}
     */
    stop() {
        this._playing = false;
        return this;
    }
    /**
     * @returns {Boolean}
     */
    playing() {
        //return this._playing && this.ready() && this.cananimate();
        return this._playing && this.ready();
    };
    /**
     * @returns {Number}
     */
    ID() { return this._id; };
    /**
     * @returns {Boolean}
     */
    noid() { return !this.ID(); }
    /**
     * @return {KunAnimation}
     */
    setID(pictureid = 0) {
        this._id = pictureid || 0;
        return this;
    };
    /**
     * @returns {String}
     */
    name() { return this.scene() && this.scene().name() || ''; };
    /**
     * @returns {String}
     */
    fullname() { return `${this.name()}-${this.ID()}`; }
    /**
     * @returns {String}
     */
    alias() { return this._name; };
    /**
     * @returns {Boolean}
     */
    noalias() { return !this.alias(); }
    /**
     * @param {String} name 
     * @returns {KunAnimation}
     */
    rename(name = '') {
        this._name = name || '';
        return this;
    };
    /**
     * @param {String} name 
     * @param {Number} id
     * @returns {Boolean}
     */
    isme(name = '', id = 0) {
        return name && (this.alias() === name || this.name() === name) && (id === 0 || id === this.ID());
    }
    /**
     * @returns {Number}
     */
    fps() { return this.frameloop().fps() };
    /**
     * @param {Number} fps
     * @returns {KunAnimation} 
     */
    setFps(fps = 0) {
        this.frameloop().setfps(fps);
        return this;
    };
    /**
     * @returns {Boolean}
     */
    ready() {
        return this.scene() !== null;
    }
    /**
     * @returns {KunScene}
     */
    scene() { return this._scene; };
    /**
     * @returns {KunPicture}
     */
    picture() {
        return this._picture || (this._picture = new KunPicture(this.name(), this.ID()));
    };
    /**
     * @returns {Number[]}
     */
    position() { return this.picture().position() }
    /**
     * @param {String} picture 
     * @returns {Boolean}
     */
    replaceby(picture = '', frameset = '') {
        if (this.manager().has(picture)) {
            this._scene = this.manager().scene(picture);
            const fs = this.initializeloop(frameset);
            this._frameloop = fs.createLoop();
            this.reset();
            return true;
        }
        return false;
    }
    /**
     * @param {String} filter
     * @return {KunFrameSet[]}
     */
    animations(filter = '') {
        return this.ready() ? filter && this.scene().framesets().filter(fs => fs.name() === filter) || this.scene().framesets() : [];
    }
    /**
     * @returns {KunFrameSet}
     */
    first() { return this.animations()[0] || null; };
    /**
     * @param {String} name 
     * @param {Boolean} random
     * @returns {KunFrameSet}
     */
    get(name = '', random = false) {
        const list = this.animations(name);
        return list.length ? random && list[Math.floor(Math.random() * list.length)] || list[0] : null;
    };
    /**
     * @param {String[]} animation
     * @returns {Boolean}
     */
    select(list = []) {
        const animations = list.length ? this.animations().filter(a => list.includes(a.name()) && a.unlocked()).map(a => a.name()) : [];
        const selected = animations.length ? animations[Math.floor(Math.random() * animations.length)] : '';
        if (selected) {
            this.play(selected);
            return true;
        }
        return false;
    };
    /**
     * @returns {KunFrameLoop}
     */
    frameloop() { return this._frameloop || null; };
    /**
     * @returns {String}
     */
    current() { return this.frameloop().name() || ''; }
    /**
     * @param {Number} variant 
     * @returns {KunAnimation}
     */
    setVariant(variant = 0) {
        this._variant = variant;
        return this;
    };
    /**
     * @returns {Boolean}
     */
    tick() {
        this._elapsed = ++this._elapsed % this.fps();
        return this._elapsed === 0;
    };
    /**
     * @param {Boolean } stop
     * @returns {KunAnimation}
     */
    reset(stop = false) {
        this.frameloop().reset(this._variant);
        stop && this.stop();
        return this;
    }
    /**
     * @param {Sprite_Picture} picture 
     * @returns {Boolean}
     */
    update(picture = null) {
        if (this.playing()) {
            if (this.tick()) {
                //console.log(this.fullname(), picture);
                return this.updateanimation(picture);
            }
        }
        return false;
    }
    /**
     * @param {Sprite_Picture} picture 
     * @returns {Boolean}
     */
    updateanimation(picture = null) {
        if (!this.hasChanged(picture)) {
            this.frameloop().update();
            if (this.frameloop().completed()) {
                //select next frameset in the queue
                this.select(this.canplayback() && this.playlist() || this.frameloop().next());
            }
            return this.drawframe(picture);
        }
        return false;
    }
    /**
     * @param {Sprite_Picture} picture 
     */
    drawframe(picture = null) {
        const bitmap = picture instanceof Sprite_Picture && picture.bitmap || null;
        if (picture && bitmap) {
            const index = this.frameloop().frame(true);
            const width = bitmap.width / this.cols();
            const height = bitmap.height / this.rows();
            const x = index % this.cols() * width;
            const y = Math.floor(index / this.cols()) * height;
            picture.setFrame(x, y, width, height);
            return true;
        }
        return false;
    }
}

/**
 * 
 */
class KunInteractiveAnimation extends KunAnimation {
    /**
     * @param {KunScene} scene 
     * @param {String} animation 
     * @param {Boolean} autoplay 
     * @param {Number} pictureId 
     * @param {String} alias 
     */
    constructor(scene = null, alias = '', pictureid = 0, autoplay = false, animation = '') {
        super(scene, alias || '', pictureid || 0, autoplay || false, animation || '');
        this._input = null;
    }
    /**
     * @returns {Boolean}
     */
    accurate() { return this.manager().accurateSpots(); }

    /**
     * @returns {KunTouchInput}
     */
    input() { return this._input; }
    /**
     * @param {String} mode 
     * @returns {KunInteractiveAnimation}
     */
    setMode(mode = KunAnimation.Mode.Default) {
        super.setMode(mode);
        this._input = this.cantouch() && new KunTouchInput() || null;
        return this;
    }

    /**
     * @param {Sprite_Picture} picture 
     * @returns {Boolean}
     */
    update(picture = null) {
        this.cantouch() && this.updateinput(picture);
        return super.update(picture);
    }

    /**
     * @param {Sprite_Picture} sprite 
     * @returns {Boolean}
     */
    updateinput(sprite = null) {
        const input = this.input();
        if (sprite instanceof Sprite_Picture && input && input.update()) {
            switch (true) {
                case input.get('back'):
                    this.manager().targets().drop();
                    return true;
                case input.get('touch'):
                    //spread touched input and offset input coordinates
                    const spot = input.spot();
                    const offset = this.picture().offset(...spot);
                    this.target(this.touch(...offset), spot[0], spot[1], true);
                    return true;
                case input.get('cancel'):
                    input.clear();
                    return true;
            }
        }
        return false;
    }


    /**
     * @param {KunHotSpot} spot 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Boolean} playse
     * @returns {KunAnimation}
     */
    target(spot, x, y, playse = false) {
        if (spot instanceof KunHotSpot) {
            playse && spot.touchse();
            switch (spot.trigger()) {
                case KunHotSpot.Trigger.Queue:
                    this.manager().targets().add(new KunTarget(spot, this.name(), x, y, this.ID()));
                    break;
                case KunHotSpot.Trigger.Instant:
                    spot.runActions();
                    this.select(spot.next());
                    break;
                case KunHotSpot.Trigger.Frame:
                    var frame = this.frameloop().frame();
                    spot.actions().forEach(action => action.set(frame));
                    break;
                case KunHotSpot.Trigger.NextFrame:
                    this.select(spot.next());
                    const first = this.frameloop().first(true);
                    spot.actions().forEach(action => action.set(first));
                    break;
            }
        }
        return this;
    };
    /**
     * List all tagged spots using inclusive/exclusive filters
     * @param {String} tag Get all spots tagged with tag
     * @param {Boolean} exclusive get all spots not tagged with tag
     * @returns {String}
     */
    tagspots(tag = '', exclusive = false) {
        return this.frameloop().spots()
            .filter(spot => exclusive && !spot.tags().includes(tag) || spot.tags().includes(tag))
            .map(spot => spot.name());
    }
    /**
     * @returns {String[]}
     */
    spots() { return this.frameloop().spots().map(spot => spot.name()) }
    /**
     * @param {String} target
     * @param {Boolean} touch
     * @param {Boolean} filterLocked
     * @returns {KunAnimation}
     */
    capture(target = '', touch = false, filterLocked = false) {
        const _manager = this.manager();
        const spot = target && this.spot(target) || this.randomSpot(filterLocked);
        if (spot instanceof KunHotSpot) {
            const accurate = this.accurate();
            const x = accurate ? spot.midx() : spot.x(true);
            const y = accurate ? spot.midy() : spot.y(true);
            const position = _manager.picturePosition(this.name(), x, y);

            //console.log(`${this.name()}: ${position.x},${position.y} [${spot.tags().join()}]`);
            KunScenes.DebugLog(`${this.name()}: ${position.x},${position.y} [${this.frameloop().tags().join()}]`);
            if (touch) {
                this.target(spot, position.x, position.y);
            }
            else {
                //_manager.setPosition(position.x, position.y);
            }
        }
        return this;
    };

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @returns {KunHotSpot}
     */
    touch(x, y) { return this.cantouch() && this.frameloop().touch(x, y) || null; };
    /**
     * @param {Boolean} unlocked
     * @returns {KunHotSpot}
     */
    randomSpot(unlocked = false) {
        const spots = this.spots(unlocked);
        return spots.length ? spots[Math.floor(Math.random() * spots.length)] : null;
    };
    /**
     * @param {String} target 
     * @returns {KunHotSpot}
     */
    spot(target = '') { return this.frameloop().spot(target) }
    /**
     * @param {Boolean} unlocked
     * @returns {KunHotSpot[]}
     */
    spots(unlocked = false) { return this.frameloop().spots(unlocked); }
}


/**
 * Use for dynamic moving animations such as cursors or transition pictures
 */
class KunMovingAnimation extends KunAnimation {
    /**
     * @param {KunScene} scene 
     * @param {String} animation 
     * @param {Boolean} autoplay 
     * @param {Number} pictureId 
     * @param {String} alias 
     */
    constructor(scene = null, alias = '', pictureid = 0, autoplay = false, animation = '') {

        super(scene, alias, pictureid, autoplay, animation);
        //disable touch by default
        //this.setMode(KunAnimation.Mode.Moving);
        //move these fromthe base class to the pathpoint
        //this._locations = [];
        //this._fixed = [0, 0];
        this._target = null;

        this._fixed = [0, 0];
        this._pathpoint = '';
        this.clearpaths();
    }

    //DYNAMIC MOVING EFFECTS

    /**
     * @param {KunTarget} target 
     * @returns {KunAnimation}
     */
    saveTarget(target = null) {
        this._target = target instanceof KunTarget && target || null;
        return this;
    }
    /**
     * @returns {Boolean}
     */
    hasTarget() { return !!this._target; }

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @returns {KunAnimation}
     */
    fix(x = 0, y = 0) {
        this._fixed[0] = x || 0;
        this._fixed[1] = y || 0;
        return this;
    }


    /**
     * @param {Number} variant
     * @returns {Number}
     */
    speed(variant = 1) { return Math.round(this.fps() * variant / 100); }

    /**
     * When this animation has an ID to refer the animated Game_Picture,
     * it will move it to the refered position, aplying the current frameset offset
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} duration
     * @returns {Boolean}
     */
    moveto(x = 0, y = 0, duration = 0) {
        const picture = this.picture().gamePicture();
        const speed = duration && this.speed(duration) || this.fps();
        if (picture) {
            const offset = this.offset();
            const fixed = this._fixed;
            const scale = [picture.scaleX(), picture.scaleY()];
            //allow fix override to pin an animation in x, y or both coordinates
            const position = [x, y].map((pos, i) => fixed[i] || pos - Math.floor(offset[i] * (scale[i] / 100)));
            picture.move(picture.origin(),
                position[0], position[1], scale[0], scale[1],
                picture.opacity(), picture.blendMode(),
                speed
            );
            return true;
        }
        return false;
    }
    /**
     * Play moving animations by the given playlist
     * @param {KunTarget} target 
     * @param {Number} duration 
     * @param {String} idle
     * @returns {Boolean}
     */
    maptarget(target = null, duration = 0, idle = '') {
        if (target instanceof KunTarget) {
            if (this.playMap()) {
                //console.log(`${this.name()} playing mapped animation ${this.frameloop().name()}`);
                this.followtarget(target.execute(), duration);
                return true;
            }
        }
        //console.log(`${this.name()} found no target to spot. Looking for idles ...`);
        this.followtarget();
        if (idle) {
            //console.log(`${this.name()} playing idle animation ${idle}`);
            this.play(idle);
            this.movetopath(idle, duration || this.fps());
        }
        return false;
    }
    /**
     * Play moving animations by the given spot tags
     * @param {KunTarget} target 
     * @param {Number} duration 
     * @param {String} idle 
     * @returns {Boolean}
     */
    tagtarget(target = null, duration = 0, idle = '') {
        if (target instanceof KunTarget) {
            const tag = target.tag();
            if (this.playTag(tag, true)) {
                //console.log(`${this.name()} tagged ${tag} for target ${target.name()}`);
                this.followtarget(target.execute(), duration);
                return true;
            }
        }
        //console.log(`${this.name()} found no target to spot. Looking for idles ...`);
        this.followtarget(); //clear saved target
        if (idle) {
            //console.log(`${this.name()} playing idle animation ${idle}`);
            this.play(idle);
            this.movetopath(idle, duration || this.fps());
        }
        return false;
    }
    /**
     * @param {KunTarget} target 
     * @param {Number} duration 
     * @returns {KunAnimation}
     */
    followtarget(target = null, duration = 0) {
        if (target instanceof KunTarget) {
            this.saveTarget(target); //save target
            this.moveto(target.x(), target.y(), duration);
        }
        else {
            this.saveTarget();
        }
        return this;
    }

    /**
     * @param {Number} duration
     * @returns {KunAnimation}
     */
    movetoIdle(duration = 0) {
        const pos = this._pathpoint('idle');
        if (pos) {
            //change to idle animation before moving
            this.play(this.first().name());
            //new version
            this.moveto(pos.x, pos.y, duration);
            return true;
        }
        return false;
    }

    /**
     * @returns {Object[]}
     */
    pathdata() { return this._pathdata; }
    /**
     * @returns {KunMovingAnimation}
     */
    clearpaths() {
        this._pathdata = [];
        return this;
    }
    /**
     * @param {String} name 
     * @returns {Boolean}
     */
    haspath(name = '') { return this.pathdata().some(path => path.name === name); }
    /**
     * @param {String} name 
     * @returns {Object } {x ,y}
     */
    pathpoint(name = '') {
        if (name) {
            const paths = this.pathdata().filter(path => path.name === name);
            return paths.length && paths[Math.floor(Math.random() * paths.length)] || null;
        }
        return null;
    }
    /**
     * @returns {Object}
     */
    pathcurrent() { return this.pathpoint(this._pathpoint); }
    /**
     * @param {String} path 
     * @param {Number} X 
     * @param {Number} Y 
     * @returns {KunMovingAnimation}
     */
    addpath(path = 'path', X = 0, Y = 0) {
        if (path) {
            this.pathdata().push({ name: path, x: X, y: Y });
        }
        return this;
    }
    /**
     * @returns {String[]}
     */
    pathroute() { return this.pathdata().map(path => path.name); }
    /**
     * @returns {String}
     */
    pathstart() { return this.pathroute()[0] || '' }
    /**
     * @returns {String}
     */
    pathend() {
        const route = this.pathroute();
        return route.length && route[route.length - 1] || '';
    }
    /**
     * @returns {String}
     */
    pathrandom() {
        const route = this.pathroute();
        return route.length && route[Math.floor(Math.random() * route.length)] || '';
    }
    /**
     * 
     * @param {String} path 
     * @returns {Object} x,y
     */
    pathto(path = '') {
        if (this.haspath(path)) {
            const route = this.pathroute();
            const target = route.indexOf(path);
            const current = route.indexOf(this._pathpoint);
            if (target > current) {
                this._pathpoint = route[current + 1];
            }
            else if (target < current) {
                this._pathpoint = route[current - 1];
            }
        }
        return this.pathcurrent();
    }
    /**
     * @param {String} path 
     * @param {Number} duration
     * @returns {Boolean}
     */
    movetopath(path = '', duration = 0) {
        path = path.toLowerCase();
        if (this.haspath(path)) {
            this._pathpoint = path;
            const point = this.pathcurrent();
            return !!point && this.moveto(point.x || 0, point.y || 0, duration);
        }
        return false;
    }
}


/**
 * @returns {KunAnimation.Mode}
 */
KunAnimation.Mode = {
    Default: 'deafult',
    Animation: 'animation',
    Touch: 'touch',
    Capture: 'capture',
    PlayBack: 'playback',
    Moving: 'move',
    //use these to filter
    Disabled: 'disabled',
    Static: 'static',
    Remove: 'remove',
};
/**
 * @type {KunAnimation.Behavior}
 */
KunAnimation.Behavior = {
    Forward: 'forward',
    Reverse: 'reverse',
    PingPong: 'ping-pong',
    Static: 'static',
};




/**
 * 
 * @param {String} name 
 * @param {Number} x1 
 * @param {Number} y1 
 * @param {Number} x2 
 * @param {Number} y2 
 * @param {String} trigger
 * @param {String} next
 * @param {String} sfx
 */
class KunHotSpot {
    constructor(name = '', x1 = 0, y1 = 0, x2 = 0, y2 = 0, trigger = '', next = [], se = '') {
        this._name = name || KunHotSpot.name;

        this._left = x1 > x2 && x2 || x1;
        this._top = y1 > y2 && y2 || y1;
        this._right = x2 > x1 && x2 || x1;
        this._bottom = y2 > y1 && y2 || y1;

        this._trigger = trigger || KunHotSpot.Trigger.Instant;
        this._se = se || '';
        this._next = Array.isArray(next) && next || [];

        this._tags = [
            //Tags
        ];
        this._conditions = [
            //KunCondions
        ];
        this._actions = [
            //KunActions
        ];
    }
    /**
     * @returns {String}
     */
    toString() {
        return this.name();
    }
    /**
     * @returns {String}
     */
    name() {
        return this._name;
    };

    /**
     * @returns {Number}
     */
    left() {
        return this._left;
    }
    /**
     * @returns {Number}
     */
    right() {
        return this._right
    }
    /**
     * @returns {Number}
     */
    top() {
        return this._top;
    }
    /**
     * @returns {Number}
     */
    bottom() {
        return this._bottom;
    }
    /**
     * @param {Boolean}
     * @returns {Number}
     */
    x(random = false) {
        return random ? this.left() + Math.floor(Math.random() * this.width()) : this.left();
    };
    /**
     * @param {Boolean}
     * @returns {Number}
     */
    y(random = false) {
        return random ? this.top() + Math.floor(Math.random() * this.height()) : this.top();
    };
    /**
     * @returns {Number}
     */
    midx() { return this.x() + this.width() / 2; }
    /**
     * @returns {Number}
     */
    midy() { return this.y() + this.height() / 2; }
    /**
     * @returns {Number}
     */
    width() { return this.right() - this.left(); }
    /**
     * @returns {Number}
     */
    height() { return this.bottom() - this.top(); }

    /**
     * @returns {String[]}
     */
    next() { return this._next; };
    /**
     * @returns Number
     */
    amount() { return this._amount; };
    /**
     * @returns {String}
     */
    trigger() { return this._trigger; };
    /**
     * @returns {KunHotSpot}
     */
    touchse() {
        const manager = KunScenes.manager();
        if (this._se.length) {
            manager.playse(this._se);
        }
        else {
            manager.playse(manager.sfx());
        }
        return this;
    }
    setValue(value) {
        if (this._varId > 0) {
            $gameVariables.setValue(this._varId, value);
        }
        return this;
    };
    /**
     * @deprecated Use runActions instead
     * @returns {KunHotSpot}
     */
    update() { return this.runActions(); };
    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @returns 
     */
    collide(x = 0, y = 0) {
        return this.left() <= x && this.right() >= x && this.top() <= y && this.bottom() >= y;
    };
    /**
     * @param {Number} x 
     * @param {Number} y 
     * @returns {Boolean}
     */
    canCollide(x = 0, y = 0) { return this.unlocked() && this.collide(x, y); }
    /**
     * @returns {Number[]}
     */
    area() { return [this.left(), this.top(), this.right(), this.bottom()]; };
    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @returns {KunHotSpot}
     */
    test(x, y) {
        KunScenes.DebugLog(`${this.name()} X(${this.left()} >= ${x} <= ${this.right()}) Y(${this.top()} >= ${y} <= ${this.bottom()})`);
        return this;
    };
    /**
     * @returns {String[]}
     */
    tags() { return this._tags; }
    /**
     * @param {String} tag 
     * @returns {Boolean}
     */
    hasTag(tag = '') { return tag && this.tags().includes(tag); }
    /**
     * @param {String} tag 
     * @returns {KunHotSpot}
     */
    tag(tag = '') {
        if (!this.hasTag(tag)) {
            this._tags.push(tag);
        }
        return this;
    }
    /**
     * @param {KunCondition} condition
     * @returns {KunHotSpot}
     */
    addCondition(condition) {
        if (condition instanceof KunCondition) {
            this._conditions.push(condition);
        }
        return this;
    };
    /**
     * @param {Boolean} filter
     * @returns {KunCondition[]}
     */
    conditions(filter = false) {
        return typeof filter === 'boolean' && filter ?
            this._conditions.filter(condition => condition.validate()) :
            this._conditions;
    };
    /**
     * @returns {Boolean}
     */
    unlocked() {
        return this.conditions(true).length === this.conditions().length;
    };
    /**
     * @param {KunAction} action
     * @param {String} tag
     * @returns {KunHotSpot}
     */
    addAction(action, tag = '') {
        if (action instanceof KunAction) {
            this._actions.push(action.tag(tag));
        }
        return this;
    };
    /**
     * @param {String} tag
     * @returns {KunAction[]}
     */
    actions(tag = '') {
        return tag ? this._actions.filter(action => action.is(tag)) : this._actions;
    };
    /**
     * @param {String} tag
     * @returns {KunHotSpot}
     */
    runActions(tag = '') {
        this.actions(tag).forEach(action => action.update());
        return this;
    };

}

/**
 * 
 */
KunHotSpot.Trigger = {
    'Instant': 'instant',
    'Queue': 'queue',
    'Ignore': 'ignore',
    'Frame': 'frame',
    'NextFrame': 'next',
};


/**
 * @type {KunTarget}
 * @class {KunTarget}
 */
class KunTarget {
    /**
     * @param {KunHotSpot} spot 
     * @param {String} picture 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} pictureID 
     */
    constructor(spot = null, picture = '', x = 0, y = 0, pictureID = 0) {
        this._spot = spot instanceof KunHotSpot ? spot : null;
        this._picture = picture || '';
        this._pictureId = pictureID || 0;
        this._x = x || 0;
        this._y = y || 0;
    }
    /**
     * @returns {String}
     */
    toString() { return this.picture() + '.' + this.spot().toString(); };
    /**
     * @returns {KunScenePlayer}
     */
    playlist() { return KunScenes.manager().player(); }
    /**
     * @returns {String}
     */
    name() { return this.spot().name(); }
    /**
     * @returns {String}
     */
    picture() { return this._picture; };
    /**
     * @returns {KunAnimation}
     */
    animation() { return this.playlist().get(this.picture()); };
    /**
     * @returns {KunHotSpot}
     */
    spot() { return this._spot; };
    /**
     * @returns {String[]}
     */
    tags() { return this.spot().tags(); }
    /**
     * Pick a tag from the target/spot tag list
     * @returns {String}
     */
    tag() {
        const tags = this.tags();
        return tags.length && tags[Math.floor(Math.random() * tags.length)] || '';
    }
    /**
     * @param {String[]} tags 
     * @returns {Boolean}
     */
    tagged(tags = []) { return !!tags.length || !!this.tags().filter(tag => tags.includes(tag)).length; }
    /**
     * @param {String[]} tags 
     * @returns {Boolean}
     */
    untagged(tags = []) { return this.tags().filter(tag => tags.includes(tag)).length === 0; }
    /**
     * @returns {Number}
     */
    x() { return this._x; };
    /**
     * @returns {Number}
     */
    y() { return this._y; };
    /**
     * @returns {Number}
     */
    ID() { return this._pictureId; };
    /**
     * @returns {KunTarget}
     */
    /*position() {
        KunScenes.manager().setPosition(this.x(), this.y());
        return this;
    };*/
    /**
     * @returns {KunTarget}
     */
    execute() {
        if (this.valid()) {
            const animation = this.animation();
            if (animation && animation.ready()) {
                this.spot().runActions();
                //jump to next frameset (if any)
                animation.select(this.spot().next());
            }
        }
        return this;
    };
    /**
     * @returns {Boolean}
     */
    valid() {
        return this.spot() && this.picture() && KunScenes.manager().has(this.picture());
    };
}


/**
 * @class {KunCondition}
 * @type {KunCondition}
 */
class KunCondition {
    /**
     * 
     * @param {Number} variable 
     * @param {String} operation 
     * @param {Number} value 
     * @param {Boolean} valueAsVar 
     * @param {Number[]} on 
     * @param {Number[]} off 
     */
    constructor(variable, operation, value = 0, valueAsVar = false, on = [], off = []) {
        this._variable = typeof variable === 'number' && variable > 0 ? variable : 0;
        this._operator = typeof operation === 'string' && operation.length > 0 ? operation : KunCondition.Operators().Equal;
        this._value = typeof value === 'number' && value > 0 ? value : 0;
        //define if value targets a game Variable
        this._targetVar = valueAsVar || false;
        //required switches ON and OFF
        this._switchOn = Array.isArray(on) ? on : [];
        this._switchOff = Array.isArray(off) ? off : [];
    }
    /**
     * @returns {Number}
     */
    targetVar() {
        return this._targetVar && this._value > 0;
    }
    /**
     * @returns {Number}
     */
    value() {
        return this.targetVar() ? $gameVariables.value(this._value) : this._value;
    }
    /**
     * @param {Boolean} getValue 
     * @returns {Number}
     */
    variable(getValue = false) {
        return getValue && $gameVariables.value(this._variable) || this._variable;
    }
    /**
     * @returns {String}
     */
    operator() {
        return this._operator;
    }
    /**
     * @param {Boolean} listValues 
     * @returns {Number[],Boolean[]}
     */
    on(listValues = false) {
        return listValues ? this._switchOn.map(sw => $gameSwitches.value(sw)) : this._switchOn;
    }
    /**
     * @param {Boolean} listValues 
     * @returns {Number[],Boolean[]}
     */
    off(listValues = false) {
        return listValues ? this._switchOff.map(sw => $gameSwitches.value(sw)) : this._switchOff;
    }
    /**
     * @returns {Boolean}
     */
    validate() {
        if (this.variable() > 0) {
            //validate variable
            switch (this.operator()) {
                case KunCondition.Operators.Greater:
                    return this.variable(true) > this.value();
                case KunCondition.Operators.GreaterOrEqual:
                    return this.variable(true) >= this.value();
                case KunCondition.Operators.Equal:
                    return this.variable(true) === this.value();
                case KunCondition.Operators.LessOrEqual:
                    return this.variable(true) <= this.value();
                case KunCondition.Operators.Less:
                    return this.variable(true) < this.value();
            };
        }
        if (this.on(true).filter(val => !val).length > 0) {
            //count all switched OFF required switches
            return false;
        }
        if (this.off(true).filter(val => val).length > 0) {
            //count all switched ON required switches
            return false;
        }
        return true;
    }
}
/**
 * 
 */
KunCondition.Operators = {
    'Greater': 'greater',
    'GreaterOrEqual': 'greater_equal',
    'Equal': 'equal',
    'LessOrEqual': 'less_equal',
    'Less': 'less',
};

/**
 * @class {KunAction}
 * @type {KunAction}
 */
class KunAction {
    /**
     * @param {Number} variable 
     * @param {String} operation 
     * @param {Number} value 
     */
    constructor(variable, operation = KunAction.Operator.Add, value = 0) {
        this._variable = variable || 0;
        this._operation = operation && operation || KunAction.Operator.Add;
        this._value = value || 0;
        this._tag = [];
    }
    /**
     * @returns {String}
     */
    operation() {
        return this._operation;
    }
    /**
     * @param {Boolean} asValue 
     * @returns {Number}
     */
    variable(asValue = false) {
        return asValue ? $gameVariables.value(this._variable) : this._variable;
    }
    /**
     * @returns {Number}
     */
    value() {
        return this._value;
    }
    /**
     * @param {Number} value 
     * @returns {KunAction}
     */
    set(value = 0) {
        if (this.variable() > 0) {
            $gameVariables.setValue(this.variable(), value);
        }
        return this;
    }
    /**
     * @returns {KunAction}
     */
    update() {
        const amount = this.value();
        const current = this.variable(true);
        if (amount > 0) {
            switch (this.operation()) {
                case KunAction.Operator.Increase: //backwards compatibility
                case KunAction.Operator.Add:
                    this.set(current + amount);
                    break;
                case KunAction.Operator.Sub:
                    this.set(current - amount > 0 ? current - amount : 0);
                    break;
                case KunAction.Operator.Set:
                    this.set(amount);
                    break;
            }
        }
        return this;
    }
    /**
     * @param {String} tag 
     * @returns {Boolean}
     */
    is(tag = '') {
        return (tag.length + this.tags().length === 0) || this.tags().includes(tag);
    }
    /**
     * @param {String} tag 
     * @returns {KunAction}
     */
    tag(tag = '') {
        this._tag = tag.length ? tag.split(' ') : [];
        return this;
    }
    /**
     * @returns {String[]}
     */
    tags() {
        return this._tag;
    }
}
/**
 * @type {KunAction.Operator|String}
 */
KunAction.Operator = {
    Increase: 'increase', //backwards compatibility
    Add: 'add',
    Sub: 'sub',
    Set: 'set',
};



/**
 * @class {KunTargets}
 */
class KunTargets {
    /**
     * @param {Number} touchvar
     * @param {Number} limitvar
     */
    constructor(touchvar = 0, limitvar = 0) {
        this._touch = touchvar || 0;
        this._limit = limitvar || 0;
        this.reset();
    }
    /**
     * @returns {KunScenes}
     */
    manager() { return KunScenes.manager(); }
    /**
     * @returns {KunTarget[]}
     */
    targets() { return this._targets; };
    /**
     * @returns {Boolean}
     */
    locked() { return this._lock; }
    /**
     * @returns {KunTargets}
     */
    reset() {
        this._targets = [];
        return this.lock(false);
    };
    /**
     * Allow to stop any change by other methods while peforming edits in the queue 
     * @param {Boolean} lock 
     * @returns {KunTargets}
     */
    lock(lock = false) {
        this._lock = lock;
        return this;
    };
    /**
     * @param {String[]} tags 
     * @returns {KunTarget}
     */
    include(tags = []) {
        if (this.count() && !this.locked()) {
            const targets = this.targets().filter(target => target.tagged(tags));
            if (targets.length) {
                const target = targets[Math.floor(Math.random() * targets.length)];
                this.lock(true);
                this.targets().splice(this.targets().indexOf(target), 1);
                this.update().lock(false);
                return target;
            }
        };
        return null;
    };
    /**
     * @param {String[]} tags 
     * @returns {KunTarget}
     */
    exclude(tags = []) {
        if (this.count() && !this.locked()) {
            const targets = this.targets().filter(target => target.untagged(tags));
            if (targets.length) {
                const target = targets[Math.floor(Math.random() * targets.length)];
                this.lock(true);
                this.targets().splice(this.targets().indexOf(target), 1);
                this.update().lock(false);
                return target;
            }
        };
        return null;
    };
    /**
     * @returns {Number}
     */
    count() { return this.targets().length; };
    /**
     * @returns {Boolean}
     */
    full() { return this.count() >= this.size(); };
    /**
     * @returns {KunTargets}
     */
    drop() {
        if (this.count() && !this.locked()) {
            this.lock(true);
            this.targets().shift();
            this.update().lock(false);
            this.manager().playse(this.manager().sfx('cancel'));
        }
        return this;
    };
    /**
     * @param {Boolean} random 
     * @returns {KunTarget}
     */
    target(random = false) {
        if (this.count() && !this.locked()) {
            this.lock(true);
            var target = random ?
                this.targets().splice(Math.floor(Math.random() * this.count()), 1)[0] :
                this.targets().shift();
            this.update().lock(false);
            return target.execute();
        }
        return null;
    }
    /**
     * @returns {Boolean}
     */
    ready() { return !this.full() && !this.locked(); };
    /**
     * @param {KunTarget} target 
     * @returns {KunTargets}
     */
    add(target = null) {
        if (target instanceof KunTarget && this.ready()) {
            this.targets().push(target);
            this.update();
        }
        return this;
    };
    /**
     * @returns {KunTargets}
     */
    clear() { return this.reset().update(); };
    /**
     * @returns {KunTargets}
     */
    update() {
        this._touch && $gameVariables.setValue(this._touch, this.count());
        return this;
    };
    /**
     * @returns {Number}
     */
    size() { return this._limit && $gameVariables.value(this._limit) || 1; };
}

/**
 * @class {KunScenePlayer}
 */
class KunScenePlayer {
    /**
     * 
     */
    constructor() {

        this.reset();

    }
    /**
     * @returns {KunScenePlayer}
     */
    reset() {
        this._list = [];
        return this;
    };
    /**
     * @param {Boolean} list 
     * @returns {KunAnimation[]}
     */
    animations() { return this._list; };
    /**
     * @returns {KunScenes}
     */
    manager() { return KunScenes.manager(); }
    /**
     * use this to create an animation from the Sprite_Picture instance
     * @param {Sprite_Picture} picture 
     * @returns {KunAnimation}
     */
    frompicture(picture = null) {
        if (picture instanceof Sprite_Picture) {
            const name = picture._pictureName;
            const id = picture._pictureId;
            const found = this.animations().find(anim => anim.name() === name && !anim.canremove()) || null;
            if (found) {
                KunScenes.DebugLog(`Found ${found.name()} [ ${found.ID()} ] (${found.alias() || 'requiresalias'})`);
                return found.setID(id);
            }
            return this.create(name, '', id);
        }
        return null;
    }
    /**
     * Use this to create an animation from any context out of the Sprite_Picture (create alias, setup ...)
     * @param {String} name 
     * @param {String} alias 
     * @param {Number} id 
     * @returns {KunAnimation}
     */
    fromalias(name = '', alias = '', id = 0) {
        const found = name && alias && this.animations().find(anim => anim.name() === name && anim.alias() === alias && !anim.canremove()) || null;
        if (found) {
            if (id && !found.ID()) {
                found.setID(id);
            }
            KunScenes.DebugLog(`Found ${found.name()} [ ${found.ID() || 'requires id'} ] ( ${found.alias()} )`);
            return found;
        }
        return this.create(name, alias, id);
    }
    /**
     * @param {String} name 
     * @param {String} alias 
     * @returns {KunAnimation}
     */
    setalias(name = '', alias = '', id = 0) {
        const found = name && this.animations().find(anim => anim.name() === name && !anim.canremove()) || null;
        if (found) {
            //reset all other animations using this alias
            this.animations().filter(anim => anim.alias() === alias && anim !== found).forEach(anim => anim.rename());
            //rename to alias
            return found.rename(alias);
        }
        return this.create(name, alias, id);
    }
    /**
     * @param {String} name 
     * @param {String} alias 
     * @param {Number} id 
     * @param {String} starter
     * @returns {KunAnimation}
     */
    create(name = '', alias = '', id = 0, starter = '') {
        const scene = this.manager().scene(name);
        if (scene) {
            KunScenes.DebugLog(`Created ${scene.name()} [ ${id || 'requires id'} ] ( ${alias || 'requires alias'} )`);
            const animation = scene.createAnimation(alias, id, !!starter, starter);
            if (animation) {
                this.add(animation);
                return animation;
            }
        }
        return null;
    }
    /**
     * @param {String} name 
     * @param {Number} id 
     * @param {String} alias 
     * @param {String} starter 
     * @returns 
     */
    search(name = '', id = 0, alias = '', starter = '') {
        const found = this.animations().find(anim => anim.isme(alias, id));
        return found || this.create(name, alias, id, starter);
    }
    /**
     * Misussed?
     * @param {String} picture 
     * @param {Number} pictureid 
     * @param {String} alias 
     * @param {String} frameset 
     * @returns {KunAnimation}
     */
    setup(picture = '', pictureid = 0, alias = '', frameset = '') {
        const scene = this.manager().scene(picture);
        const animation = this.get(picture, pictureid)
            || scene && scene.createAnimation(alias, pictureid, !!frameset, frameset)
            || null;

        if (animation) {
            if (alias) {
                //do not remove other animations yet, but ensure they're not using this alias anymore
                this.animations()
                    .filter(anim => anim !== animation && anim.alias() === alias)
                    .forEach(anim => anim.rename());
                animation.rename(alias);
            }
            if (pictureid) {
                animation.setID(pictureid);
            }
            this.add(animation);
            return animation;
        }
        return null;
    };
    /**
     * @param {String} name 
     * @param {String} stage 
     * @returns {KunScenePlayer}
     */
    setstage(name = '', stage = '', reset = false) {
        const animation = this.get(name);
        KunScenes.DebugLog(`Change stage to ${name}: ${stage}`);
        if (animation) {
            animation.changeStage(stage, reset);
        }
        return this;
    };
    /**
     * @param {String} name 
     * @param {Boolean} useAlias
     * @returns {Boolean}
     */
    has(name = '') {
        return this.get(name) || false;
    };
    /**
     * @param {String} name 
     * @param {Number} id
     * @returns {KunAnimation}
     */
    get(name = '', id = 0) { return this.animations().find(a => a.isme(name, id || 0)) || null; };
    /**
     * @param {String} name 
     * @returns {KunMovingAnimation}
     */
    getMoving(name = '') {
        const animation = this.get(name);
        return !!animation && animation.canmove() && animation || null;
    }
    /**
     * @param {String} name 
     * @returns {KunInteractiveAnimation}
     */
    getInteractive(name = '') {
        const animation = this.get(name);
        return !!animation && animation instanceof KunInteractiveAnimation && animation || null;
    }
    /**
     * @param {KunAnimation} animation 
     * @returns {Boolean}
     */
    add(animation = null) {
        if (animation instanceof KunAnimation && !this.has(animation.name())) {
            this.animations().push(animation);
            return true;
        }
        return false;
    }
    /**
     * @param {String} name 
     * @param {String} alias
     * @param {Number} pictureid
     * @param {String} fs
     * @returns {KunAnimation}
     */
    loadfromgroup(name = '', alias = '', pictureid = 0, fs = '') {
        const group = name && this.manager().collections().find(group => group.name() === name) || null;
        if (group) {
            const animation = group.load(alias, pictureid, fs);
            this.add(animation);
            return animation;
            //return this.add(animation) && animation || null;
        }
        return null;
    }

    /**
     * 
     * @param {String} name 
     * @param {KunTarget} target 
     * @param {Number} duration
     * @returns {Boolean}
     */
    target(name = '', target = null, duration = 20) {
        const animation = this.getMoving(name);
        if (animation) {
            target && animation.moveto(target.x(), target.y(), duration);
            animation.saveTarget(target); //save target or clear if null
            return true;
        }
        return false;
    }
    /**
     * @param {String} animation 
     * @returns {String[]}
     */
    list(animation = '') {
        const scene = this.get(animation);
        return scene && scene.playlist() || [];
    };
    /**
     * @param {String} animation 
     * @param {String[]} list 
     * @returns {KunScenePlayer}
     */
    push(animation = '', list = []) {
        if (this.has(animation)) {
            this.get(animation).push(list);
        }
        return this;
    };
    /**
     * @param {String} picture 
     * @param {String} animation
     * @returns {KunScenePlayer}
     */
    play(picture = '', animation = '') {
        if (this.has(picture)) {
            this.get(picture).play(animation);
        }
        return this;
    };
    /**
     * @param {String} name 
     * @returns {KunScenePlayer}
     */
    clearPlaylist(name = '', frameset = '') {
        if (name) {
            const animation = this.get(name);
            if (animation) {
                animation.clear(frameset);
            }
        }
        return this;
    };
    /**
     * @param {String} name 
     * @returns {KunScenePlayer}
     */
    clear(name = '') {
        if (name) {
            const animation = this.get(name);
            //animation.picture().remove();
            animation.mark4Remove(true);    //remove both animation and picture
            const index = this.animations().indexOf(animation);
            this.animations().splice(index, 1);
        }
        else {
            this.animations().forEach(animation => {
                animation.stop();
                //animation.picture().remove();
                animation.mark4Remove(true);
            })
            return this.reset();
        }
        return this;
    }
    /**
     * @param {Boolean} reset
     * @returns {KunScenePlayer}
     */
    stop(reset = false) {
        this.animations().forEach(a => a.stop(reset));
        return this;
    };
    /**
     * @param {String} animation 
     * @param {Number} fps 
     * @returns {KunScenePlayer}
     */
    setFps(animation = '', fps = 0) {
        const scene = this.get(animation);
        if (scene) {
            scene.setFps(fps);
        }
        return this;
    };
    /**
     * @param {String} name 
     * @param {String} target 
     * @param {Boolean} touch
     * @returns {KunScenePlayer}
     */
    capture(name = '', target = '', touch = false) {
        const animation = this.getInteractive(name);
        animation && animation.capture(target, touch, true);
        return this;
    };
}


/**
 * @class {KunTouchInput} process teh input touch (instanced by KunAnimation)
 */
class KunTouchInput {
    /**
     * 
     */
    constructor() {
        this._count = KunScenes.manager().FPS();
        //this._count = 1000;
        this._elapsed = 0;
        this._button1 = false;
        this._button2 = false;
        this._inputs = {
            touch: false,
            back: false,
            cancel: false,
        }

        this._scroll = 0;
        this._scrollprecission = 4;
        this._capture = [];
    }
    /**
     * @returns {Boolean}
     */
    tick() {
        this._elapsed = ++this._elapsed % this._count;
        return this.updated();
    }
    /**
     * @returns {Boolean}
     */
    updated() { return !this._elapsed; }
    /**
     * @param {String} action 
     * @param {Boolean} value 
     * @returns {KunTouchInput}
     */
    set(action = '', value = false) {
        if (action && this._inputs.hasOwnProperty(action)) {
            this._inputs[action] = value;
        }
        return this;
    }
    /**
     * @param {String} action 
     * @returns {Boolean}
     */
    get(action = '') { return action && this._inputs[action] || false; }
    /**
     * @returns {Boolean}
     */
    cantouch() { return KunScenes.manager().canTouch(); }
    /**
     * @returns {Boolean}
     */
    canscroll() { return KunScenes.manager().canWheel(); };
    /**
     * @returns {KunTouchInput}
     */
    inputscroll() {
        if (this.canscroll() && ++this._scroll % this._scrollprecission === 0) {
            KunScenes.manager().scroll(TouchInput.wheelY);
        }
        return this;
    };
    /**
     * @returns {Boolean}
     */
    down1() {
        if (TouchInput.isTriggered()) {
            if (!this._button1) {
                this._button1 = true;
                return true;
            }
        }
        return false;
    }
    /**
     * @returns {Boolean}
     */
    up1() {
        if (TouchInput.isReleased() && this._button1) {
            this._button1 = false;
            return true;
        }
        return false;
    }
    /**
     * @returns {Boolean}
     */
    up2() {
        if (this._button2 && this.tick()) {
            this._button2 = false;
            return true;
        }
        return false;
    }
    /**
     * @returns {Boolean}
     */
    down2() {
        if (TouchInput.isCancelled()) {
            if (!this._button2) {
                this._button2 = true;
                return true;
            }
        }
        return false;
    }
    /**
     * @returns {KunTouchInput}
     */
    clear() {
        this._button1 = false;
        this._button2 = false;
        const inputs = this._inputs;
        Object.keys(inputs).forEach(input => inputs[input] = false);
        return this;
    }
    /**
     * @returns {Boolean}
     */
    update() {
        if (this.changed()) {
            this.set('touch', !this.button2() && this.button1());
            this.set('back', this.button2() && !this.button1());
            this.set('cancel', this.button2() && this.button1());
            return true;
        }
        return false;
    }
    /**
     * @returns {Boolean}
     */
    changed() { return this.up2() || this.up1() || this.down2() || this.down1(); }
    /**
     * @returns {Boolean}
     */
    button1() { return this._button1; }
    /**
     * @returns {Boolean}
     */
    button2() { return this._button2; }
    /**
     * @param {Boolean} close
     * @returns {Boolean}
     */
    capture(close = false) {
        if (KunScenes.manager().canCapture()) {
            const input = KunTouchInput.spot();
            if (close) {
                this._capture.push(input[0]);
                this._capture.push(input[1]);
            }
            else {
                this._capture = [input[0], input[1]];
            }
            return true;
        }
        return false;
    }
    /**
     * @returns {Number[]}
     */
    spot() { return [TouchInput._x, TouchInput._y]; }
    /**
     * @param {Game_Picture} picture 
     * @returns {Number[]}
     */
    offset(picture = null) {
        if (picture instanceof Game_Picture) {
            const spot = this.spot();
            return [
                picture.scaleX() ? Math.floor((spot.x - picture.x()) * 100 / picture.scaleX()) : 0,
                picture.scaleY() ? Math.floor((spot.y - picture.y()) * 100 / picture.scaleY()) : 0,
            ];
        }
        return [0, 0];
    }
}


/**
 * 
 */
function KunAnimations_RegisterManagers() {

    const _kunAnimations_Initialize_Sprite = Sprite_Picture.prototype.initialize;
    Sprite_Picture.prototype.initialize = function (pictureId) {
        _kunAnimations_Initialize_Sprite.call(this, pictureId);
        this._animation = null;
    };
    /**
     * @returns {KunAnimation}
     */
    Sprite_Picture.prototype.animation = function () { return this._animation || null; };
    /**
     * Sprite_Picture.loadBitmap WON'T BE CALLED if the picture ID already points to the SAME SOURCE!!
     */
    const _kunAnimations_Load_Bitmap = Sprite_Picture.prototype.loadBitmap;
    Sprite_Picture.prototype.loadBitmap = function () {
        //vanilla image preload
        _kunAnimations_Load_Bitmap.call(this);
        this._animation = this.setupAnimation();
    };
    const _kunAnimations_SpritePicture_UpdateBitmap = Sprite_Picture.prototype.updateBitmap;
    Sprite_Picture.prototype.updateBitmap = function () {
        //vanilla
        _kunAnimations_SpritePicture_UpdateBitmap.call(this);
        //new override method, better to focus inthe sprite frame
        this.updateAnimation();
    }
    /**
     * @returns {KunAnimation}
     */
    Sprite_Picture.prototype.setupAnimation = function () {
        //setup animation if its a scene spritesheet. If animation already is set, check if it must be replaced
        const animation = this.animation() && this.animation().changePicture(this) || KunScenes.manager().player().frompicture(this);
        if (animation) {
            animation.play();
            this.bitmap.addLoadListener(() => animation.updateanimation(this));
        }
        return animation;
    }
    /**
     * @returns {Boolean}
     */
    Sprite_Picture.prototype.updateAnimation = function () {
        if (this.animation()) {
            if (!this.animation().canremove()) {
                return this.animation().update(this);
            }
            else {
                this._animation = null;
            }
        }
        return false;
    }
}

/***************************************************************************
 * COMMAND MANAGER
 **************************************************************************/
/**
 * @class {KunSceneCommands}
 */
class KunSceneCommand {
    /**
     * @param {Game_Interpreter}
     * @param {String[]} input 
     */
    constructor(context = null, input = []) {
        this._context = context instanceof Game_Interpreter && context || null;
        this.initialize(input);
        KunScenes.DebugLog(this.command(), this.arguments(), this._flags);
    }
    /**
     * @param {Game_Interpreter} context 
     * @param {String[]} args 
     * @returns {KunSceneCommand}
     */
    static create(context = null, args = []) {
        return new KunSceneCommand(context, args);
    }
    /**
     * @param {String[]} input 
     */
    initialize(input = '') {
        this._flags = [];
        //prepare input string
        const content = input.join(' ');
        //extract flags
        const regex = /\[([^\]]+)\]/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            match[1].split("|").forEach(flag => this._flags.push(flag.toLowerCase()));
        }
        //return clean args array without flags
        const command = content.replace(regex, '').split(' ').filter(arg => arg.length);
        this._command = command.shift();
        this._args = command;
    }
    /**
     * @returns {String}
     */
    toString() {
        return `${this.command().toUpperCase()} {${this.arguments().join(' ')}} [${this._flags.join('|')}]`;
    }
    /**
     * @returns {KunScenes}
     */
    manager() { return KunScenes.manager(); }
    /**
     * @returns {KunScenePlayer}
     */
    player() { return this.manager().player(); }
    /**
     * @returns {KunTargets}
     */
    targets() { return this.manager().targets(); }
    /**
     * @returns {Game_Interpreter}
     */
    context() { return this._context; }
    /**
     * @param {String} flag 
     * @returns {Boolean}
     */
    has(flag = '') { return flag && this._flags.includes(flag) || false; }
    /**
     * @returns {String}
     */
    command() { return this._command; }
    /**
     * @returns {String[]}
     */
    arguments() { return this._args; }
    /**
     * @returns {Number}
     */
    count() { return this.arguments().length; }
    /**
     * @returns {Number}
     */
    wait(fps = 10) { this.context().wait(fps); }
    /**
     * 
     */
    waitMessage() { this.context().setWaitMode('message'); }
    /**
     * @returns {Boolean}
     */
    run() {
        if (this.context()) {
            const command = this.command() && `${this.command()}Command` || '';
            const manager = this.manager();
            if (command && typeof this[command] === 'function') {
                if (manager.debug() > KunScenes.DebugMode.Enabled) {
                    KunScenes.DebugLog(`Running Command: ${this.toString()}`);
                }
                this[command](this.arguments());
                return true;
            }
        }
        return false;
    }
    /**
     * @param {String[]} args 
     */
    testCommand(args = []) {
        KunScenes.DebugLog(`Test Command: "${args.join()}"`);
    }
    /**
     * @param {String[]} args 
     */
    speedCommand(args = []) {
        return this.variantCommand(args);
    }
    /**
     * @param {String[]} args 
     */
    variantCommand(args = []) {
        if (args.length > 1) {
            const values = args[1].split(':').map(value => parseInt(value));
            const playlist = this.player();
            if (args.includes('import')) {
                values = values.map(value => $gameVariables.value(value));
            }
            args[1].split(':')
                .map(name => playlist.get(name))
                .forEach(anim => anim && anim.setVariant(values[Math.floor(Math.random() * values.length)]));
        }
    }
    /**
     * @param {String[]} args 
     */
    stagemenuCommand(args = []) {
        if (args.length) {
            return this.createStageMenu(this.player().get(args[0]),
                args[1] || 'skip',
                args[2] || 'right',
                args[3] || 'window'
            );
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    spotmenuCommand(args = []) {
        if (args.length) {
            return this.createTouchMenu(this.player().get(args[0]),
                args.includes('touch') && 'touch' || 'target',
                args[1] || 'skip',
                args[2] || 'right',
                args[3] || 'window'
            );
        }
        return false;
    }
    /**
     * @param {String[]} args 
     */
    animationmenuCommand(args = []) {
        if (args.length) {
            this.createAnimationMenu(this.player().get(args[0]), args[1] || 'skip', args[2] || 'right', args[3] || 'window');
        }
    }
    /**
     * @param {String[]} args 
     */
    actionsCommand(args = []) {
        if (args.length) {
            const animation = this.player().get(args[0]);
            if (animation) {
                animation.runActions(args.length > 1 && args[1] || '');
            }
        }
    }
    /**
     * @param {String[]} args 
     */
    loadgroupCommand(args = []) {
        this.collectionCommand(args);
    }
    /**
     * @param {String[]} args 
     */
    loadstagesCommand(args = []) {
        this.collectionCommand(args);
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    loadCommand( args = [] ){
        return this.collectionCommand(args );
    }
    /**
     * Load an animation and setup all animation stages from a group
     * @param {String[]} args 
     */
    collectionCommand(args = []) {
        if (args.length > 1) {
            const collection = args[0].split(':');
            const setup = args[1].split(':').map(att => parseInt(att));
            const alias = args.length > 2 ? args[2] : '';
            const animation = this.player().loadfromgroup(
                collection[Math.floor(Math.random() * collection.length)],
                alias, setup[0]
            );
            if (animation && setup.length > 1) {
                const picture = animation.picture();
                //remove the id from the setup array
                picture.show(...setup.slice(1));
            }
        }
    }
    /**
     * @param {String[]} args 
     */
    createCommand(args = []) {
        if (args.length) {
            const playlist = this.player();
            const pictures = args[0].split(':');
            const setup = args[1].split(':').map(n => parseInt(n));
            const alias = args[2] || '';
            const fs = args[3] && args[3].split(':') || [];
            const picture = pictures[pictures.length > 1 ? Math.floor(Math.random() * pictures.length) : 0];
            const animation = playlist.get(alias || picture, setup[0])
                || playlist.create(picture, alias, setup[0],
                    fs.length ? fs[Math.floor(Math.random() * fs.length)] : '');
            if (animation && setup.length > 1) {
                animation && animation.picture().show(...setup.slice(1));
            }
        }
    }
    /**
     * @param {String[]} args 
     */
    playlistCommand(args = []) {
        const playlist = this.player();
        if (args.length > 1) {
            const list = args[1].split(':');
            const clear = list.includes('clear');
            args[0].split(':').forEach(name => {
                const animation = playlist.get(name);
                if (animation) {
                    if (clear) {
                        animation.clear();
                    }
                    else {
                        animation.push(name, list);
                    }
                }
            });
        }
        else if (args.includes('clear')) {
            playlist.animations().forEach(animation => animation.clear());
        }
    }
    /**
     * @param {String[]} args 
     */
    spotCommand(args = []) {
        if (args.length) {
            const animations = args[0].split(':')
                .map(anim => this.player().getInteractive(anim))
                .filter(anim => !!anim);
            //const animation = animations[Math.floor(Math.random() * animations.length)];
            const spots = args.length > 1 && !args[1].includes('import') && args[1].split(':') || [];
            const count = args.length > 2 && args[1] === 'import' && $gameVariables.value(parseInt(args[2])) || 1;
            if (count && animations.length) {
                for (let i = 0; i < count; i++) {
                    const animation = animations[Math.floor(Math.random() * animations.length)];
                    const spot = spots.length && spots[Math.floor(Math.random() * spots.length)] || '';
                    animation.capture(spot, true, true);
                }
                this.manager().playse(this.manager().sfx());
            }
        }
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    spotsCommand(args = []) {
        if (args.length) {
            const animations = args[0].split(':')
                .map(anim => this.player().getInteractive(anim))
                .filter(anim => !!anim);
            const count = args[1] && parseInt(args[1]) || 1;
            const exclusive = this.has('exclusive');
            const counter = this.has('import') && $gameVariables.value(count) || count;
            const tags = args[2] && args[2].split(':');
            if (counter && animations.length) {
                for (let i = 0; i < counter; i++) {
                    const animation = animations[Math.floor(Math.random() * animations.length)];
                    const spots = tags.length && animation.tagspots(tags[i % tags.length], exclusive) || animation.spots();
                    //console.log(animation.name(),spots);
                    const spot = spots.length && spots[Math.floor(Math.random() * spots.length)] || '';
                    animation.capture(spot, true, true);
                }
            }
            return true;
        }
        return false;
    }
    /**
     * @param {String[]} args 
     */
    queueCommand(args = []) {
        if (args.length) {
            const playlist = this.player();
            const spots = args.length > 1 && args[1].split(':') || [''];
            const touch = args.length > 2 && args[2] === 'touch';
            spots.forEach(spot => playlist.capture(args[0], spot, touch));
        }
    }
    /**
     * @param {String[]} args 
     */
    targetCommand(args = []) {
        const targets = this.targets();
        if (args.length) {
            switch (args[0] || '') {
                case 'random':
                    targets.target(true);
                    break;
                default:
                    //assign a target directly to the alias or aliases
                    const playlist = this.player();
                    const speed = args[1] && args[1].split(':').map(w => parseInt(w)) || [];
                    const wait = speed.length && speed[Math.floor(Math.random() * speed.length)] || 20;
                    args[0].split(':').forEach(alias => playlist.target(alias, targets.target(args.includes('random')), wait));
                    break;
            }
        }
        else {
            targets.target();
        }
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    fixCommand(args = []) {
        if (args.length > 1) {
            const fix = args[1].split(':').map(p => parseInt(p));
            const playlist = this.player();
            args[0].split(':')
                .map(alias => playlist.getMoving(alias))
                .filter(anim => !!anim)
                .forEach(anim => anim.fix(...fix));
        }
        return false;
    }
    /**
     * @param {KunTarget} target 
     * @param {String[]} tagged 
     * @param {Number[]} position 
     */
    targetEffect(target = null, tagged = [], position = []) {
        if (target instanceof KunTarget) {
            if (target && tagged.length) {
                tagged.forEach(animation => this.player().tag(animation, target.tags()));
            }
            else if (position.length) {
                this.manager().setPosition(position[0], position[1] || position[0]);
            }
        }
    }
    /**
     * 
     * @param {String[]} args 
     * @returns {Boolean}
     */
    renameCommand(args = []) {
        return this.aliasCommand(args);
    }
    /**
     * @param {String[]} args 
     */
    aliasCommand(args = []) {
        if (args.length > 1) {
            //do not allow reset alias on teh same animation if already playing
            const animation = this.player().setalias(args[1], args[0], args[2] && parseInt(args[2]) || 0);
            return !!animation;
        }
        return false;
    }
    /**
     * @param {String[]} args 
     */
    stageCommand(args = []) {
        if (args.length > 1) {
            //remove dash from stage names, replace by underscore
            const stages = args[1].split(':').map(stage => stage.replace(/-/g, '_'));
            this.player().setstage(args[0], stages[Math.floor(Math.random() * stages.length)]);
        }
    }
    /**
     * @param {String[]} args 
     */
    prepareCommand(args = []) {
        this.player().clear();
        this.targets().clear();
    }
    /**
     * @param {String[]} args 
     */
    completeCommand(args = []) {
        //clear all referenecs before starting scene
        this.player().clear();
        this.targets().clear();
    }
    /**
     * @param {String[]} args 
     */
    clearCommand(args = []) {
        switch (args[0] || '') {
            case 'playlist':
            case 'scenes':
                this.player().clearPlaylist();
                break;
            case 'all':
                this.player().clear();
                this.targets().clear();
                break;
            case 'targets':
                this.targets().clear();
            default:
                //remove targets from cursor animations
                const playlist = this.player();
                args[0] && args[0].split(':')
                    .map(alias => playlist.getMoving(alias))
                    .filter(anim => !!anim)
                    .forEach(anim => anim.saveTarget());
                break;
        }
    }
    /**
     * @param {String[]} args 
     */
    fpsCommand(args = []) {
        if (args.length > 1) {
            var fps = parseInt(args[1]);
            if (this.has('import')) {
                fps = $gameVariables.value(fps);
            }
            const animation = this.player().get(args[0]);
            if (animation) {
                animation.setFps(fps);
            }
        }
    }
    /**
     * @param {String[]} args 
     */
    playCommand(args = []) {
        if (args.length > 1) {
            const playlist = this.player();
            const framesets = args[1].replace(/\./g, ':').split(':');
            const spots = (args.length > 2 && args[2] === 'spot' && args.length > 3 && args[3].split(':')) || [];
            args[0].split(':').map(name => playlist.get(name)).filter(anim => anim !== null).forEach(animation => {
                //play random selection for any animated picture :D
                animation.play(framesets[Math.floor(Math.random() * framesets.length)]);
                if (spots.length) {
                    this.player().capture(animation.name(), spots[Math.floor(Math.random() * spots.length)]);
                }
            });
            if (args.length > 2 && args[2] === 'wait') {
                if (args.length > 3) {
                    const wait = args[3].split(':').map(count => parseInt(count));
                    this.wait(wait.length > 1 ? wait[0] + Math.floor(Math.random() * wait[1]) : wait[0]);
                }
            }
        }
    }
    /**
     * @param {String[]} args 
     */
    setCommand(args = []) {
        this.playCommand(args);
    }
    /**
     * @param {String[]} args 
     */
    resetCommand(args = []) {
        if (args.length) {

        }
    }
    /**
     * @param {String[]} args 
     */
    pauseCommand(args = []) {
        if (args.length) {
            const playlist = this.player();
            args[0].split(':')
                .filter(animation => playlist.has(animation))
                .map(animation => playlist.get(animation))
                .forEach(animation => animation.stop());
        }
    }
    /**
     * @param {String[]} args 
     */
    resumeCommand(args = []) {
        if (args.length) {
            const playlist = this.player();
            args[0].split(':')
                .filter(scene => playlist.has(scene))
                .map(scene => playlist.get(scene))
                .forEach(scene => scene.play());
        }
    }
    /**
     * @param {String[]} args 
     */
    waitCommand(args = []) {
        if (args.length) {
            var wait = args[0].split(':').map(t => parseInt(t));
            if (this.has('import') && wait > 0) {
                wait[0] = $gameVariables.value(wait[0]);
                if (wait.length > 1) {
                    wait[1] = $gameVariables.value(wait[1]);
                }
            }
            this.wait(wait.length > 1 ? wait[0] + Math.floor(Math.random() * wait[1]) : wait[0]);
            //KunScenes.DebugLog(`Waiting ${wait[0]} +(${wait.length > 1 ? wait[1] : 0}) fps ...`);
        }
    }
    /**
     * animation list: animation:animation:animation
     * state: on|off
     * playback animations: frameset:frameset:frameset
     * @param {String[]} args 
     */
    playbackCommand(args = []) {
        if (args.length) {
            const playback = args.length < 1 || args[1] === 'on';
            const list = args.length > 2 && args[2].split(':') || [];
            args[0].split(':')
                .map(name => this.player().get(name))
                .filter(animation => animation !== null)
                .forEach(animation => {
                    if (playback) {
                        list.forEach(fs => animation.push(fs));
                        animation.setMode(KunAnimation.Mode.PlayBack);
                    }
                    else {
                        animation.setMode(KunAnimation.Mode.Default);
                        animation.clear();
                    }
                });
        }
    }
    /**
     * @param {String[]} args 
     */
    modeCommand(args = []) {
        const mode = args[0] || KunAnimation.Mode.Disabled;
        if (args.length > 1) {
            args[1].split(':')
                .map(anim => this.player().get(anim))
                .filter(anim => !!anim)
                .forEach(anim => anim.setMode(mode));
            if (mode === KunAnimation.Mode.Touch && this.manager().mode() === KunAnimation.Mode.Disabled) {
                //set mode touch if touch enabled for some sprite
                this.manager().setMode(mode);
            }
        }
        else {
            this.manager().setMode(mode);
        }
    }
    /**
     * Export an animation's x and y into x,y game variables
     * @param {String[]} args 
     * @returns {Boolean}
     */
    positionCommand(args = []) {
        if (args.length > 1) {
            const animation = this.player().getMoving(args[0]);
            if (animation) {
                const gamevars = args[1].split(':').map(n => parseInt(n));
                animation.position().forEach((pos, i) => {
                    gamevars[i] && $gameVariables.setValue(gamevars[i], pos);
                });
                //Debug Log
                KunScenes.DebugLog(`positionCommand: ${gamevars.map(i => $gameVariables.value(i)).join(',')}`);
                //$gameVariables.setValue(pos[0], animation.x());
                //pos.length > 1 && $gameVariables.setValue(pos[1], animation.y());
                //console.log( animation.x(),animation.y() );
            }
        }
    }
    /**
     * replace by pathpoints
     * @param {String[]} args 
     * @returns {Boolean}
     */
    movetoCommand(args = []) {
        if (args.length > 1) {
            //const animation = this.playlist().getDynamicAnim(args[0]);
            const animation = this.player().getMoving(args[0]);
            if (animation) {
                //get from remaining args at posiiton 1
                const paths = args[1].split(':');
                const duration = args[2] && this.randomSelector(args[2].split(':').map(n => parseInt(n))) || 0;
                animation.movetopath(
                    paths[Math.floor(Math.random() * paths.length)],
                    duration
                );
                return true;
            }
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    effectsCommand(args = []) {
        if (args.length) {
            const opacity = args[1] && parseInt(args[1]) % 256 || 255;
            const blend = args[2] && parseInt(args[2]) % 4 || 0;
            args[0].split(':')
                .map(anim => this.player().get(anim))
                .filter(anim => !!anim)
                .forEach(anim => anim.picture().applyEffects(opacity, blend));
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    addlocationCommand(args = []) {
        return this.pathCommand(args);
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    addpathCommand(args = []) {
        return this.pathCommand(args);
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    pathCommand(args = []) {
        if (args.length > 1) {
            //move a dynamic animation to a default position
            const animation = this.player().getMoving(args[0]);
            //since version 4, animation must be of KunMovingAnim type (set canmove flag in scene loader)
            if (animation) {
                const points = args.length > 2 && args.slice(2) || [];
                points.map(p => p.split(':').map(c => parseInt(c)))
                    .forEach(p => animation.addpath(args[1], p[0], p[1] || p[0]));
                return true;
            }
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    mapspotCommand(args = []) {
        if (args.length > 1) {
            const targets = this.targets();
            const animation = this.player().getMoving(args[0]);
            //since version 4, animation must be of KunMovingAnim type (set canmove flag in scene loader)
            if (animation) {
                const tags = args[1] && args[1].split(':') || [];
                const idle = args[2] || ''
                const duration = args[4] && parseInt(args[3]) / parseFloat(100) || 1;
                const label = args[4] || '';
                switch (tags[0] && tags.shift() || '') {
                    case 'include':
                        animation.maptarget(targets.include(tags), duration, idle) || this.jumpToLabel(label);
                        break;
                    case 'exclude':
                        animation.maptarget(targets.exclude(tags), duration, idle) || this.jumpToLabel(label);
                        break;
                    case 'random':
                        animation.maptarget(targets.target(true), duration, idle) || this.jumpToLabel(label);
                        break;
                    default:
                        animation.maptarget(targets.target(), duration, idle) || this.jumpToLabel(label);
                        break;
                }
                this.wait(duration * 20);
                return true;
            }
        }
        return false;
    }

    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    tagspotCommand(args = []) {
        if (args.length > 1) {
            //play animations based on the current targets' tags
            //tagspot alias:alias:... [include|exclude]:tag:tag:... pos:pos
            const targets = this.targets();
            const animation = this.player().getMoving(args[0]);
            //since version 4, animation must be of KunMovingAnim type (set canmove flag in scene loader)
            if (animation) {
                const tags = args[1] && args[1].split(':') || [];
                const idle = args[2] || ''
                const duration = args[4] && parseInt(args[3]) / parseFloat(100) || 1;
                const label = args[4] || '';
                switch (tags[0] && tags.shift() || '') {
                    case 'include': //only inclusive
                        animation.tagtarget(targets.include(tags), duration, idle) || this.jumpToLabel(label);
                        break;
                    case 'exclude': //all framesets but exluded
                        animation.tagtarget(targets.exclude(tags), duration, idle) || this.jumpToLabel(label);
                        break;
                    case 'random':
                        animation.tagtarget(targets.target(true), duration, idle) || this.jumpToLabel(label);
                        break;
                    default:
                        animation.tagtarget(targets.target(), duration, idle) || this.jumpToLabel(label);
                        break;
                }
                this.wait(duration * 20);
                return true;
            }
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    mapanimationCommand(args = []) {
        if (args.length > 2) {
            const animation = this.player().get(args[0]);
            const gameVar = parseInt(args[1]);
            const list = args[2].split(':');
            if (animation) {
                animation.clear();
                animation.setVarMap(gameVar);
                list.forEach(item => animation.push(item));
                return true;
            }
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    playmapCommand(args = []) {
        if (args.length) {
            const animation = this.player().get(args[0]);
            if (animation) {
                animation.playMap();
            }
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    isplayingCommand(args = []) {
        if (args.length > 1) {
            const list = args[0].split(':');
            const animation = this.player().get(list.shift());
            const labels = args[1].split(':');
            if (animation) {
                //animation:stage:stage:stage
                if (list.length) {
                    if (list.some(fs => animation.current() === fs)) {
                        this.jumpToLabels(labels);
                        return true;
                    }
                }
                else {
                    //animation only
                    this.jumpToLabels(labels);
                    return true;
                }
            }
            //fallback
            args[2] && this.jumpToLabel(args[2].split(':'));
        }
        return false;
    }

    //// menu helpers


    /**
     * @param {KunAnimation} animation 
     * @param {String} cancel 
     * @param {String} position 
     * @param {String} background 
     * @returns {Boolean}
     */
    createAnimationMenu(animation = null, cancel = 'skip', position = 'right', background = 'window') {
        if (animation instanceof KunAnimation) {
            const options = animation.mapAnimationLabels();
            const _animations = options.map(option => Object.keys(option)[0]);
            const _choices = options.map(option => Object.values(option)[0]);

            return this.createMenu(_choices, cancel, background, position, function (selected) {
                animation.play(_animations[selected]);
            });
        }
        return false;
    }
    /**
     * @param {KunAnimation} animation 
     * @param {Boolean} capture
     * @param {String} cancel 
     * @param {String} position 
     * @param {String} background 
     * @returns {Boolean}
     */
    createTouchMenu(animation = null, capture = false, cancel = 'skip', position = 'right', background = 'window') {
        if (animation instanceof KunAnimation) {
            const options = animation.mapSpotLabels();
            const _spots = options.map(option => Object.keys(option)[0]);
            const _choices = options.map(option => Object.values(option)[0]);

            return this.createMenu(_choices, cancel, background, position, function (selected) {
                animation.capture(_spots[selected], !capture);
            });
        }
        return false;
    }
    /**
     * @param {KunAnimation} animation 
     * @param {String} cancel 
     * @param {String} position 
     * @param {String} background 
     * @returns {Boolean}
     */
    createStageMenu(animation = null, cancel = 'skip', position = 'right', background = 'window') {
        if (animation instanceof KunAnimation) {
            const options = animation.mapStages();
            const _stages = options.map(option => Object.keys(option)[0]);
            const _choices = options.map(option => Object.values(option)[0]);

            return this.createMenu(_choices, cancel, background, position, function (selected) {
                animation.changeStage(_stages[selected], true);
            });
        }
        return false;
    }
    /**
     * @param {String[]} options 
     * @param {String} cancel 
     * @param {String} background 
     * @param {String} position 
     * @param {Function} callback 
     * @returns {Boolean}
     */
    createMenu(options = [], cancel = '', background = '', position = '', callback = null) {
        const context = this.context();
        if (options.length && typeof callback === 'function' && context) {
            $gameMessage.setChoices(options, 0, this.menuCancelType(cancel, options.length));
            $gameMessage.setChoiceBackground(this.getMenuBackground(background));
            $gameMessage.setChoicePositionType(this.getMenuPosition(position));
            $gameMessage.setChoiceCallback(callback.bind(context));
            return true;
        }
        return false;
    }
    /**
     * @returns {String[]}
     */
    menuPositions() { return ['left', 'middle', 'right']; }
    /**
     * @param {String} position 
     * @returns {Number}
     */
    getMenuPosition(position = '') {
        const positions = this.menuPositions();
        return position && positions.includes(position) ? positions.indexOf(position) : 2;
    }
    /**
     * @returns {String[]}
     */
    menuBackground() { return ['window', 'dim', 'transparent']; }
    /**
     * @param {String} bg 
     * @returns {Number}
     */
    getMenuBackground(bg = '') {
        const backgrounds = this.menuBackground();
        return bg && backgrounds.includes(bg) ? backgrounds.indexOf(bg) : 2;
    }
    /**
     * 
     * @param {String} type 
     * @param {Number} amount 
     * @returns {Number}
     */
    menuCancelType(type = 'skip', amount = 2) {
        switch (type) {
            case 'random':
                return Math.floor(Math.random() * amount);
            case 'last':
                return amount - 1;
            case 'skip':
                return -2;
            case 'disable':
                return -1;
            case 'first':
            default:
                return 0;
        }
    }

    //LABEL HELPERS

    /**
     * @param {String[]} labels 
     * @param {Boolean} random 
     * @returns {Boolean}
     */
    jumpToLabels(labels = [], random = false) {
        KunScenes.DebugLog(`Searching for Label in [${labels.join(',')}]... ${random && '(random)' || '(fallback)'}`);
        return random ?
            //jump to random labels in the list
            this.jumpToLabel(labels.length && labels[Math.floor(Math.random() * labels.length)] || '') :
            //jump to first available label in the list
            labels.find(lbl => this.jumpToLabel(lbl)) || false;
    }
    /**
     * @param {String} label
     * @returns {Boolean}
     */
    jumpToLabel(label = '') {
        const context = this.context();
        if (context && label) {
            const lbl = label.toUpperCase();
            KunScenes.DebugLog(`Searching for Label [${lbl}]...`);
            for (var i = 0; i < context._list.length; i++) {
                var command = context._list[i];
                if (command.code === 118 && command.parameters[0] === lbl) {
                    context.jumpTo(i);
                    KunScenes.DebugLog(`Jumping to Label [${lbl}]`);
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * @param {Number[]} values
     * @returns {Number}
     */
    randomSelector(values = []) {
        switch (true) {
            case values.length > 2:
                return values[Math.floor(Math.random() * values.length)];
            case values.length > 1:
                return Math.floor(Math.random() * (values[1] - values[0])) + values[0];
            case values.length:
                return values[0];
        }
        return 0;
    }
}



/**
 * 
 */
function KunAnimations_SetupCommands() {
    var _KunAnimations_SetupCommands = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunAnimations_SetupCommands.call(this, command, args);
        if (KunScenes.command(command) && args.length) {

            KunSceneCommand.create(this, args).run();
        }
    };
}

/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function ( /* args */) {

    KunScenes.manager();

    KunAnimations_RegisterManagers();

    KunAnimations_SetupCommands();
})( /* initializer */);



