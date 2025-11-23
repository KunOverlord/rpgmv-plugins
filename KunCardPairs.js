//=============================================================================
// KunCardPairs.js
//=============================================================================
/*:
 * @filename KunCardPairs.js
 * @plugindesc Setup your Card Pair Game :D
 * @version 0.1
 * @author Kun
 * 
 * @help
 * 
 * KunCardPairs play
 * 
 * 
 * COMMANDS
 * 
 *  KunCardPairs play|start
 *  - Start Game
 *  
 * 
 * @param debug
 * @text Debug Mode
 * @type boolean
 * @default false
 * 
 */


function KunCardPairs() {
    throw `${this.constructor.name} is a Static Class`;
}
/**
 * 
 */
KunCardPairs.Initialize = function () {
    const _parameters = KunCardPairs.PluginData();

    this._debug = _parameters.debug;
};
/**
 * @returns {Boolean}
 */
KunCardPairs.debug = function () {
    return this._debug;
};
/**
 * @returns {KunCardPairs}
 */
KunCardPairs.start = function(){
    return this;
};
/**
 * @returns {Object}
 */
KunCardPairs.PluginData = function () {
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

    return _parsePluginData('KunCardPairs', PluginManager.parameters('KunCardPairs'));
};




////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

function KunCardPairs_SetupCommands() {
    var _KunCardPairs_Commands = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunCardPairs_Commands.call(this, command, args);
        if (command === 'KunCardPairs') {
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
    KunCardPairs.Initialize();
    KunCardPairs_SetupCommands();
})( /* initializer */);

