//=============================================================================
// KunGambling.js
//=============================================================================
/*:
 * @filename KunGambling.js
 * @plugindesc Setup your Card Pair Game :D
 * @version 0.1
 * @author Kun
 * 
 * @help
 * 
 * KunGambling play
 * 
 * 
 * COMMANDS
 * 
 *  KunGambling play|start
 *  - Start Game
 *  
 * 
 * @param debug
 * @text Debug Mode
 * @type boolean
 * @default false
 * 
 * @param modes
 * @text Games
 * @desc Setup different types of game levels
 * @type struct<GameMode>[]
 *
 */
/*~struct~GameMode:
 * @param name
 * @text Name
 * @type text
 * @default gambling
 * 
 * @param players
 * @text Player Profiles
 * @type struct<Profile>[]
 * 
 */
/*~struct~Profile:
 * @param firstNames
 * @text First Names
 * @type text[]
 * 
 * @param lastNames
 * @text Last Names
 * @type text[]
 * 
 * @param templates
 * @text Character Templates
 * @type struct<Template>[]
 * 
 * @param amount
 * @type number[]
 * @text Amount
 * @default ["100"]
 * 
 * @param bet
 * @type number[]
 * @min 0
 * @max 100
 * @default ["20","30"]
 * 
 * @param level
 * @text Level
 * @type select
 * @option Rookie
 * @value rookie
 * @option Amateur
 * @value amateur
 * @option Medium
 * @value medium
 * @option Pro
 * @value pro
 * @option Expert
 * @value expert
 * @default rookie
 */
/*~struct~Template:
 * @param faceSet
 * @text FaceSet
 * @type file
 * @require 1
 * @dir img/faces/
 * 
 * @param faceId
 * @type number
 * @min 0
 * @max 7
 * @default 0
 */


function KunGambling() {
    throw `${this.constructor.name} is a Static Class`;
}
/**
 * 
 */
KunGambling.Initialize = function () {
    const _parameters = KunGambling.PluginData();

    this._debug = _parameters.debug;
};
/**
 * @returns {Boolean}
 */
KunGambling.debug = function () {
    return this._debug;
};
/**
 * @returns {KunGambling}
 */
KunGambling.start = function(){
    return this;
};
/**
 * @returns {Object}
 */
KunGambling.PluginData = function () {
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

    return _parsePluginData('KunGambling', PluginManager.parameters('KunGambling'));
};


function KunGambler( name , faceSet , faceId , level = 1, savings = 100 ){
    this._name = name || '';
    this._faceSet= faceSet || '';
    this._faceId = faceId || 0;
    this._level = level;
    this._bet = [20,30];
    this._savings = Math.floor(Math.random() * (savings || 10)) * 10;
};


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function KunGambling_SetupCommands() {
    var _KunGambling_Commands = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunGambling_Commands.call(this, command, args);
        if (command === 'KunGambling') {
            if (args && args.length) {
                switch (args[0]) {
                    case 'play':
                    case 'start':
                        break;
                }
            }
        }
    };
};

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


(function ( /* args */) {
    KunGambling.Initialize();
    KunGambling_SetupCommands();
})( /* initializer */);

