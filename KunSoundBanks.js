//=============================================================================
// KunSoundBanks.js
//=============================================================================
/*:
 * @filename KunSoundBanks.js
 * @plugindesc Create playable sound banks to randomize different Sound Effect outputs
 * @version 1.02
 * @author KUN
 * @target MC | MZ
 * 
 * @help
 * 
 * COMMANDS:
 * 
 *      KunSoundBanks play [sound_bank_name] [wait_seconds] [random_elapsed_seconds]
 *          Play a sound bank selection by name
 *          Set wait seconds to include a time waiting pause before running the next events
 *          Add random elapsed seconds to define a randomized timespan
 * 
 *      KunSoundBanks interrupt [on|off]
 *          Allow a sound bank selection to interrupt other Sound Effects playing by MEdia Player
 *          Activated by default for those sound banks marked with Allow SE interruption
 * 
 *      KunSoundBanks wait [elapsed_seconds] [random_elapsed_seconds]
 *          Wait for elapsed seconds before running the next routines in the event editor
 *          Add random elapsed seconds to define a randomized timespan
 * 
 *      KunSoundBanks list
 *          Debug sound bank info
 * 
 * @param debug
 * @text Debug Level
 * @desc Show debug info.
 * @type boolean
 * @default false
 * 
 * @param soundBank
 * @type struct<SoundBank>[]
 * @text Sound Banks
 * @desc Define the list of Sound Effect Reactions and specific Framesets
 */
/*~struct~SoundBank:
 *
 * @param name
 * @text Name
 * @type text
 * @default new-sound-bank
 * 
 * @param round
 * @text Rounds
 * @type number
 * @desc Play a sound selection every N frameset loops
 * @min 0
 * @max 10
 * @default 0
 * 
 * @param chance
 * @text Chance
 * @type number
 * @min 1
 * @max 100
 * @default 100
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
 * 
 * @param interrupt
 * @text Allow interruption
 * @desc Stop playing other Sound Effects when this bank plays a selection
 * @type boolean
 * @default false
 *
 */

//const { count } = require('console');

/**
 * @description KUN Modules
 * @type KUN
 */
var KUN = KUN || {};

/**
 * 
 * @returns 
 */
function KunSoundBanks() {
    throw `${this.constructor.name} is a Static Class`;
}
/**
 * 
 * @returns KunSoundBanks
 */
KunSoundBanks.Initialize = function () {

    var parameters = this.PluginParameters()

    this._debug = parameters.debug === 'true';

    this._canInterrupt = true;

    this._soundBanks = {};
    //console.log( parameters );
    return this.ImportSoundBanks(parameters.soundBank.length > 0 ? JSON.parse(parameters.soundBank) : []);
};
/**
 * @returns Boolean
 */
KunSoundBanks.canInterrupt = function () {
    return this._canInterrupt;
};
/**
 * @param {Boolean} allow 
 * @returns KunSoundBanks
 */
KunSoundBanks.allowInterruption = function (allow) {
    this._canInterrupt = typeof allow === 'boolean' && allow;
    return this;
};
/**
 * @returns Boolean
 */
KunSoundBanks.debug = function () {
    return this._debug;
};
/**
 * @param {Boolean} list 
 * @returns Object | Object[]
 */
KunSoundBanks.banks = function (list) {
    return typeof list === 'boolean' && list ? Object.values(this._soundBanks) : this._soundBanks;
};
/**
 * @param {String} bank 
 * @returns Boolean
 */
KunSoundBanks.hasBank = function (bank) {
    return typeof bank === 'string' && bank.length > 0 && this._soundBanks.hasOwnProperty(bank);
};
/**
 * @param {KunSoundBank} bank 
 * @returns KunSoundBanks
 */
KunSoundBanks.addBank = function (bank) {
    //console.log( bank );
    if (bank instanceof KunSoundBank && !this.hasBank(bank.name())) {
        this._soundBanks[bank.name()] = bank;
    }
    return this;
};
/**
 * @param {String} bank 
 * @returns KunSoundBank
 */
KunSoundBanks.get = function (bank) {
    return this.hasBank(bank) ? this.banks()[bank] : KunSoundBank.Empty();
};
/**
 * @param {String} bank 
 * @param {Number} round
 * @returns KunSoundBanks
 */
KunSoundBanks.play = function (bank , round ) {
    //console.log( bank );
    if (this.hasBank(bank)) {
        if( typeof round === 'number' && round > 0 ){
            this.banks()[bank].playRound( round );
        }
        else{
            this.banks()[bank].play();
        }
    }
    return this;
};
/**
 * 
 */
KunSoundBanks.PluginParameters = function () {
    return PluginManager.parameters('KunSoundBanks');
};
/**
 * @param {Object[]} input 
 * @returns KunSoundBanks
 */
KunSoundBanks.ImportSoundBanks = function (input) {
    (input).map(sb => sb.length > 0 ? JSON.parse(sb) : null).forEach(function (bank) {
        var sb = new KunSoundBank(bank.name, bank.chance, bank.interrupt === 'true', parseInt(bank.round || 0));
        //console.log( sb.name() );
        (bank.pitch.length > 0 ? JSON.parse(bank.pitch) : []).map(pitch => parseInt(pitch)).forEach(function (pitch) {
            sb.addPitch(pitch);
        });
        (bank.pan.length > 0 ? JSON.parse(bank.pan) : []).map(pan => parseInt(pan)).forEach(function (pan) {
            sb.addPan(pan);
        });
        (bank.volume.length > 0 ? JSON.parse(bank.volume) : []).map(volume => parseInt(volume)).forEach(function (volume) {
            sb.addVol(volume);
        });
        (bank.sfx.length > 0 ? JSON.parse(bank.sfx) : []).forEach(function (se) {
            sb.addSe(se);
        });
        KunSoundBanks.addBank(sb);
    });
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
KunSoundBanks.AudioManager = function (se, volume, pitch, pan, interrupt) {
    if (se.length) {
        if (typeof interrupt === 'boolean' && interrupt) {
            AudioManager.stopSe();
        }
        //KunSoundBanks.DebugLog( `Playing ${se} at vol ${volume}, pitch ${pitch} and pan ${pan} ${interrupt}` );
        AudioManager.playSe({ name: se, pan: pan || 0, pitch: pitch || 100, volume: volume || 90 });
    }
};
/**
 * @param {String} message 
 */
KunSoundBanks.DebugLog = function (message) {
    if (this.debug()) {
        console.log(typeof message === 'object' ? message : `[ KunSoundBanks ] ${message.toString()}`);
    }
};
/**
 * @param {String} name 
 * @returns Boolean
 */
KunSoundBanks.SoundEffectExists = function (name) {
    return this.FileExists(this.FilePath(name + AudioManager.audioFileExt()));
}
/**
 * @param {String} path 
 * @returns Boolean
 */
KunSoundBanks.FileExists = function (path) {

    var fs = require('fs');
    if (fs.existsSync(path)) {
        return true;
    }

    if (KunSoundBanks.debug(KunSoundBanks.DebugMode().TraceLog)) {
        KunSoundBanks.DebugLog(`File missing ${path}`);
    }

    return false;
};
/**
 * @param {String} file 
 * @returns String
 */
KunSoundBanks.FilePath = function (file) {
    var path = require('path');
    var base = path.dirname(process.mainModule.filename);
    return path.join(base, `audio/se/${file}`);
};

/**
 * @param {String} name 
 * @param {Number} chance
 * @param {Boolean} interrupt
 * @param {Number} round
 */
function KunSoundBank(name, chance, interrupt, round) {
    this._name = name || '';
    this._chance = chance || 100;
    this._interrupt = typeof interrupt === 'boolean' && interrupt;
    this._se = [];
    this._volume = [];
    this._pitch = [];
    this._pan = [];
    this._round = round || 0;
};
/**
 * @returns String
 */
KunSoundBank.prototype.toString = function () {
    return this.name();
};
/**
 * @returns String
 */
KunSoundBank.prototype.name = function () {
    return this._name;
};
/**
 * @returns Number
 */
KunSoundBank.prototype.round = function () {
    return this._round;
};
/**
 * @returns Boolean
 */
KunSoundBank.prototype.interrupt = function () {
    return this._interrupt && KunSoundBanks.canInterrupt();
};
/**
 * @returns Number
 */
KunSoundBank.prototype.chance = function () {
    return this._chance > Math.floor(Math.random() * 100);
};
/**
 * 
 * @param {String} se 
 * @returns KunSoundBank
 */
KunSoundBank.prototype.addSe = function (se) {
    if (typeof se === 'string' && se.length) {
        this._se.push(se);
    }
    return this;
};
/**
 * @param {Number} vol 
 * @returns KunSoundBank
 */
KunSoundBank.prototype.addVol = function (vol) {
    if (typeof vol === 'number' && vol) {
        this._volume.push(vol);
    }
    return this;
};
/**
 * @param {Number} pitch 
 * @returns KunSoundBank
 */
KunSoundBank.prototype.addPitch = function (pitch) {
    if (typeof pitch === 'number' && pitch) {
        this._pitch.push(pitch);
    }
    return this;
};
/**
 * @param {Number} pan 
 * @returns KunSoundBank
 */
KunSoundBank.prototype.addPan = function (pan) {
    if (typeof pan === 'number' && pan) {
        this._pan.push(pan);
    }
    return this;
};
/**
 * @returns Number
 */
KunSoundBank.prototype.pan = function () {
    switch (this._pan.length) {
        case 0: return 0;
        case 1: return this._pan[0];
        case 2:
            var min = this._pan[0] < this._pan[1] ? this._pan[0] : this._pan[1];
            var max = this._pan[1] > this._pan[0] ? this._pan[1] : this._pan[0];
            return min + Math.floor(Math.random() * (max - min));
        default:
            return this._pan[Math.floor(Math.random() * this._pan.length)];
    }
};
/**
 * @returns Number
 */
KunSoundBank.prototype.pitch = function () {
    switch (this._pitch.length) {
        case 0: return 100;
        case 1: return this._pitch[0];
        case 2:
            var min = this._pitch[0] < this._pitch[1] ? this._pitch[0] : this._pitch[1];
            var max = this._pitch[1] > this._pitch[0] ? this._pitch[1] : this._pitch[0];
            return min + Math.floor(Math.random() * (max - min));
        default:
            return this._pitch[Math.floor(Math.random() * this._pitch.length)];
    }
};
/**
 * @returns Number
 */
KunSoundBank.prototype.volume = function () {
    switch (this._volume.length) {
        case 0: return 50;
        case 1: return this._volume[0];
        case 2:
            var min = this._volume[0] < this._volume[1] ? this._volume[0] : this._volume[1];
            var max = this._volume[1] > this._volume[0] ? this._volume[1] : this._volume[0];
            return min + Math.floor(Math.random() * (max - min));
        default:
            return this._volume[Math.floor(Math.random() * this._volume.length)];
    }
};
/**
 * @returns String
 */
KunSoundBank.prototype.select = function () {
    switch (this._se.length) {
        case 0: return '';
        case 1: return this._se[0];
        default: return this._se[Math.floor(Math.random() * this._se.length)];
    }
};
/**
 * @returns KunSoundBank
 */
KunSoundBank.prototype.play = function () {
    if (this.canPlay() && this.chance()) {
        var selection = this.select();
        if (selection.length) {
            KunSoundBanks.AudioManager(selection, this.volume(), this.pitch(), this.pan(), this.interrupt());
        }
    }
    return this;
};
/**
 * @returns KunSoundBank
 */
KunSoundBank.prototype.playRound = function (round) {
    if (this.canPlay() && this.round() > 0 && round % this.round() === 0) {
        this.play();
    }
    return this;
};
/**
 * @returns Boolean
 */
KunSoundBank.prototype.canPlay = function () {
    return this._se.length > 0;
};
/**
 * 
 * @returns KunSoundBank
 */
KunSoundBank.Empty = function () {
    return new KunSoundBank('EMPTY');
};

/**
 * 
 */
function KunSoundBanks_SetupCommands() {
    var _KunSoundBanks_SetupCommands = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunSoundBanks_SetupCommands.call(this, command, args);
        if (command === 'KunSoundBanks' && args.length > 0) {
            switch (args[0]) {
                case 'play':
                    if (args.length > 1) {
                        var bank = args[1].split(':');
                        KunSoundBanks.play( bank.length > 1 ? bank[ Math.floor(Math.random() * bank.length) ] : bank[0]);
                        if (args.length > 2) {
                            var wait = parseInt(args[2]);
                            if( args.length > 3 && args[3] === 'import' && wait > 0 ){
                                wait = $gameVariables.value( wait );
                            }
                            this.wait( wait );
                            KunSoundBanks.DebugLog(`Waiting ${wait} fps ...`);    
                        }
                    }
                    break;
                case 'wait':
                    if (args.length > 1) {
                        var wait = parseInt(args[1]);
                        if (args.length > 2 && args[2] === 'import' && wait > 0) {
                            wait = $gameVariables.value(wait);
                        }
                        this.wait(wait);
                        KunSoundBanks.DebugLog(`Waiting ${wait} fps ...`);
                    }
                    break;
                case 'interrupt':
                    KunSoundBanks.allowInterruption(args.length > 1 && args[1] === 'on');
                    break;
                case 'list':
                    KunSoundBanks.banks(true);
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

(function ( /* args */) {

    KunSoundBanks.Initialize();

    KunSoundBanks_SetupCommands();
})( /* initializer */);



