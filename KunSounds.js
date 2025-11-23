//=============================================================================
// KunSounds.js
//=============================================================================
/*:
 * @filename KunSounds.js
 * @plugindesc Create playable sound banks to randomize different Sound Effect outputs
 * @version 1.42
 * @author KUN
 * @target MC | MZ
 * 
 * @help
 * 
 * COMMANDS:
 * 
 *      KunSounds play [sound_name] [fps:fps:fps:...]
 *          Play a sound bank selection by name. You can add more soundbanks separated by semi-colon (:) to allow random play.
 *          Set wait FPS to include a time waiting pause before running the next events
 *          Use import tag to define a Game Variable where to import the fps values from
 * 
 *      KunSounds mix|playprofile [profile:profile:profile] [sound:sound:sound] [fps:fps:fps:...]
 *          Play a sound selection mix from the providen profiles and sounds
 *          Set wait FPS to include a time waiting pause before running the next events
 *          Use import tag to define a Game Variable where to import the fps values from
 * 
 *      KunSounds interrupt [on|off]
 *          Allow a sound bank selection to interrupt other Sound Effects playing by MEdia Player
 *          Activated by default for those sound banks marked with Allow SE interruption
 * 
 *      KunSounds wait [fps:fps:fps:...]
 *          Wait for elapsed FPS before running the next routines in the event editor
 *          Use import tag to define a Game Variable where to import the fps values from
 * 
 *      KunSounds list
 *          Debug sound bank info
 * 
 * @param debug
 * @text Debug Level
 * @desc Show debug info.
 * @type boolean
 * @default false
 * 
 * @param profiles
 * @text Profiles
 * @desc List all sound bank profiles here
 * @type struct<Profile>[]
 * 
 */
/*~struct~Profile:
 * @param name
 * @text Profile
 * @desc Define a profile to group a list of sound banks
 * @type text
 * 
 * @param collections
 * @type struct<Collection>[]
 * @text Sound Collections
 * @desc Define the list of Sound Effects for this profile
 * 
 */
/*~struct~Collection:
 * @param name
 * @text Name
 * @type text
 * @default sound-emitter
 * 
 * @param sfx
 * @text Sound Collection
 * @type file[]
 * @desc Add a selection of sound effects to play in this sound bank
 * @require 1
 * @dir audio/se/
 * 
 * @param volume
 * @text Volume
 * @desc Define a single volume value, a random volume interpolation among 2 values, or a random volume from 3 or more values.
 * @type number[]
 * @min 0
 * @max 100
 * @default ["90"]
 * 
 * @param pitch
 * @text Pitch
 * @desc Define a single pitch value, a random pitch interpolation among 2 values, or a random pitch from 3 or more values.
 * @type number[]
 * @min 50
 * @max 150
 * @default ["100"]
 * 
 * @param pan
 * @text Pan
 * @desc Define a single pan value, a random pan interpolation among 2 values, or a random pan from 3 or more values.
 * @type number[]
 * @min -100
 * @max 100
 * @default ["0"]
 */

//const { off } = require('process');


/**
 * @class {KunSounds}
 */
class KunSounds {
    /**
     * 
     * @returns {KunSounds}
     */
    constructor() {

        if (KunSounds.__instance) {
            return KunSounds.__instance;
        }

        KunSounds.__instance = this.initialize();
    }


    /**
     * @returns {KunSounds}
     */
    initialize() {

        const parameters = this.pluginData()
        this._debug = parameters.debug;
        this._interrupt = true;
        this._collections = this.importSounds(parameters.profiles || []);


        return this;
    };
    /**
     * @param {Object[]} input 
     * @returns {KunSound[]}
     */
    importSounds(input = []) {
        const collection = {};
        input.map(content => {
            content.collections.forEach(data => {
                const name = content.name && content.name + '-' + data.name || data.name;
                const sound = new KunSound(name);
                data.pitch && data.pitch.forEach(pitch => sound.addPitch(pitch));
                data.pan && data.pan.forEach(pan => sound.addPan(pan));
                data.volume && data.volume.forEach(volume => sound.addVol(volume));
                data.sfx && data.sfx.forEach(se => sound.addSe(se));
                collection[name] = sound;
            });
        });
        return Object.values(collection);
    }
    /**
     * @returns {Boolean}
     */
    interrupt() { return this._interrupt; };
    /**
     * @param {Boolean} allow 
     * @returns {KunSounds}
     */
    allowInterruption(allow = false) {
        this._interrupt = allow;
        return this;
    };
    /**
     * @returns {Boolean}
     */
    debug() { return this._debug; };
    /**
     * @returns {KunSound[]}
     */
    sounds() { return this._collections; };
    /**
     * @param {String} sound 
     * @returns {KunSound}
     */
    get(sound = '') { return this.sounds().find(snd => snd.name() === sound) || null; };
    /**
     * @param {String} se 
     * @param {Number} volume 
     * @param {Number} pitch 
     * @param {Number} pan 
     * @param {Boolean} interrupt
     */
    static AudioManager(se = '', volume = 90, pitch = 100, pan = 0, interrupt = false) {
        if (se) {
            if (interrupt) {
                AudioManager.stopSe();
            }
            AudioManager.playSe({ name: se, pan: pan || 0, pitch: pitch || 100, volume: volume || 90 });
        }
    };

    /**
     * @returns {Object}
     */
    pluginData() {
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
                //console.log(value);
                if (Array.isArray(value)) {
                    return value.map(item => _kunPluginReaderV2(key, item));
                }
                const content = {};
                Object.keys(value).forEach(key => content[key] = _kunPluginReaderV2(key, value[key]));
                //console.log(key,content);
                return content;
            }
            return value;
        };

        return _kunPluginReaderV2('KunSounds', PluginManager.parameters('KunSounds'));
    };

    /**
     * @param {*} message 
     */
    static DebugLog(message = '') {
        if (KunSounds.manager().debug()) {
            console.log('[ KunSounds ]', message);
        }
    };
    /**
     * @param {String} name 
     */
    static play(name = '') {
        KunSounds.DebugLog(`Attempting to play ${name}`);
        const sound = KunSounds.manager().get(name);
        sound && sound.play();
    }
    /**
     * @returns {KunSounds}
     */
    static manager() {
        return KunSounds.__instance || new KunSounds();
    }
}

/**
 * Backwards Compatibility
 * @class {KunSoundBanks}
 */
class KunSoundBanks {
    static play() {
        return KunSounds.play();
    }
}


/**
 * @class {KunSoundEmitter}
 */
class KunSound {
    /**
     * @param {String} name 
     * @param {Boolean} interrupt 
     */
    constructor(name) {
        this._name = name || '';
        this._se = [];
        this._volume = [];
        this._pitch = [];
        this._pan = [];
    }
    /**
     * @returns {KunSounds}
     */
    manager() { return KunSounds.manager(); }
    /**
     * @returns {String}
     */
    toString() { return this.name(); };
    /**
     * @returns {String}
     */
    name() { return this._name; };
    /**
     * @returns {Boolean}
     */
    interrupt() { return this.manager().interrupt(); };
    /**
     * 
     * @param {String} se 
     * @returns {KunSound}
     */
    addSe(se = '') {
        se && this._se.push(se);
        return this;
    };
    /**
     * @param {Number} vol 
     * @returns {KunSound}
     */
    addVol(vol = 60) {
        vol && this._volume.push(vol);
        return this;
    };
    /**
     * @param {Number} pitch 
     * @returns {KunSound}
     */
    addPitch(pitch = 100) {
        pitch && this._pitch.push(pitch);
        return this;
    };
    /**
     * @param {Number} pan 
     * @returns {KunSound}
     */
    addPan(pan = 0) {
        this._pan.push(pan || 0);
        return this;
    };
    /**
     * @param {Number[]} values 
     * @returns {Number}
     */
    modulate(values = []) {
        switch (values.length) {
            case 0:
                return 0;
            case 1:
                return values[0];
            case 2:
                const min = Math.min(values[0],values[1]);
                const max = Math.max(values[0],values[1]);
                return min + Math.floor(Math.random() * (max - min));
            default:
                return values[Math.floor(Math.random() * values.length)];
        }
    }
    /**
     * @param {Boolean} modulate
     * @returns {Number}
     */
    pan( modulate = false ) { return modulate && this.modulate(this._pan) || this._pan[0] || 0; };
    /**
     * @param {Boolean} modulate
     * @returns {Number}
     */
    pitch( modulate = false ) { return modulate && (this.modulate(this._pitch) || 100) || this._pitch[0] || 100; };
    /**
     * @param {Boolean} modulate
     * @returns {Number}
     */
    volume( modulate = false) { return modulate && (this.modulate(this._volume) || 50) || this._volume[0] || 50; };
    /**
     * @returns {Boolean}
     */
    empty() { return !this._se.length; };
    /**
     * @returns {String}
     */
    select() { return !this.empty() && this._se[Math.floor(Math.random() * this._se.length)] || ''; };
    /**
     * @returns {KunSound}
     */
    play() {
        if (!this.empty()) {
            KunSounds.AudioManager(
                this.select(),
                this.volume(true),
                this.pitch(true),
                this.pan(true),
                this.interrupt()
            );
        }
        return this;
    };
}


/**
 * @class {KunSoundCommand}
 */
class KunSoundCommand {
    /**
     * @param {String[]} input 
     */
    constructor(input = [], context = null) {
        this._wait = 0;
        this._context = context instanceof Game_Interpreter && context || null;
        this.initialize(input);
    }
    /**
     * @param {String} command 
     * @returns {Boolean}
     */
    static Command(command = '') {
        return ['kunsoundbanks', 'kunsounds', 'kunmedia', 'kunsound'].includes(command.toLowerCase());
    };
    /**
     * @param {Game_Interpreter} context 
     * @param {String[]} input 
     * @returns {KunSoundCommand}
     */
    static create(context = null, input = []) {
        return context instanceof Game_Interpreter && new KunSoundCommand(input, context) || null;
    }
    /**
     * @param {String[]} input 
     * @returns {KunCommandManager}
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
        return this;
    }
    /**
     * @returns {String}
     */
    toString() { return `${this.command()} ${this.arguments().join(' ')}`; }
    /**
     * @returns {KunSounds}
     */
    manager() { return KunSounds.manager(); }
    /**
     * @returns {Game_Interpreter}
     */
    context() { return this._context; }
    /**
     * @returns {String[]}
     */
    arguments() { return this._args; }
    /**
     * @returns {String}
     */
    command() { return this._command; }
    /**
     * @returns {KunSoundCommand}
     */
    wait(wait = 0) {
        if (this.context()) {
            this.context().wait(wait || 60);
            KunSounds.DebugLog(`Waiting ${wait} fps ...`);
        }
        return this;
    }
    /**
     * @param {Number[]} values 
     * @returns {Number}
     */
    selectValue(values = []) {
        const base = values.length && values.shift() || 0;
        //const offset = values.length && values.reduce( ( amount , value) => amount + value , 0) / values.length || 0;
        const offset = values.length && values.reduce((amount, value) => amount + value, base) / values.length || 0;
        return base + (base && Math.floor(Math.random() * offset) || 0);
    }
    /**
     * @returns {Boolean}
     */
    run() {
        const commandName = `${this.command()}Command`;
        if (typeof this[commandName] === 'function') {
            return this[commandName](this.arguments());
        }
        return this.defaultCommand(this.arguments());
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    defaultCommand(args = []) {
        //get right from KunSounds command name
        return this.command() && this.playCommand([this.command(),...this.arguments()]) || false;
        //return this.command() && this.playCommand([this.command()]) || false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    playCommand(args = []) {
        if (args.length) {
            const playList = args[0].split(':');
            const wait = args[1] && args[1].split(':').map(n => parseInt(n)) || [];
            KunSounds.play(playList.length > 1 ? playList[Math.floor(Math.random() * playList.length)] : playList[0]);
            wait.length && this.wait(this.selectValue(wait));
            return true;
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    mixCommand(args = []) {
        if (args.length > 1) {
            const profiles = args[0].split(':');
            const playlist = args[1].split(':');
            const wait = args[2] && args[2].split(':').map(n => parseInt(n)) || [];
            var selection = [
                profiles[Math.floor(Math.random() * profiles.length)],
                playlist[Math.floor(Math.random() * playlist.length)]
            ];
            KunSounds.play(selection.join('-'));
            wait.length && this.wait(this.selectValue(wait));
        }
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    playprofileCommand(args = []) {
        this.mixCommand(args);
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    waitCommand(args = []) {
        if (args.length) {
            const wait = args[0].split(':').map(n => parseInt(n));
            this.wait(this.selectValue(wait));
        }
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    listCommand(args = []) {
        KunSounds.DebugLog(this.manager().sounds().map(sound => sound.name()));
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    interruptCommand(args = []) {
        this.manager().allowInterruption(args[0] && args[0] === 'on');
    }
}

/**
 * 
 */
function KunSounds_SetupCommands() {
    const _KunSounds_SetupCommands = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunSounds_SetupCommands.call(this, command, args);
        if (KunSoundCommand.Command(command)) {
            KunSoundCommand.create(this, args).run();
        }
    };
}

/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function ( /* args */) {

    KunSounds.manager();

    KunSounds_SetupCommands();
})( /* initializer */);



