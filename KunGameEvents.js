//=============================================================================
// KunGameEvents.js
//=============================================================================
/*:
 * @filename KunGameEvents.js
 * @plugindesc Run CommonEvents on STart, Load and Get Item
 * @version 1.1
 * @author KUN
 * 
 * @help
 * 
 * ℹ Set the item and amount variable ids to export itemid and item count values into the commonevent
 * ℹ Set a load event to run such event on loading a saved game
 * ℹ Set a start event to run on new game start
 * 
 * @param debug
 * @text Debug
 * @description Show some debug info in console ;)
 * @type Boolean
 * @default false
 * 
 * @param loadEvent
 * @text Load Game
 * @desc Select the custom event to run after loading a game.
 * @type common_event
 * @default 0
 * 
 * @param startEvent
 * @text New Game
 * @desc Select the custom event to run after staring the game
 * @type common_event
 * @default 0
 * 
 * @param itemEvent
 * @text Get Item
 * @desc Select the custom event to run after getting an item
 * @type common_event
 * @default 0
 * 
 * @param itemVar
 * @parent itemEvent
 * @text Item Variable
 * @desc Set the item variable to export to Get Item Event
 * @type Variable
 * @default 0
 * 
 * @param amountVar
 * @parent itemEvent
 * @text Amount Variable
 * @desc Set the amount variable to export to Get Item Event
 * @type Variable
 * @default 0
 */

/**
 * @class {KunGameEvents}
 */
class KunGameEvents {

    constructor() {
        if (KunGameEvents.__instance) {
            return KunGameEvents.__instance;
        }

        KunGameEvents.__instance = this;

        this.initialize();
    }
    /**
     * @returns {KunGameEvents}
     */
    initialize() {

        const _parameters = KunGameEvents.PluginData();

        this._debug = _parameters.debug || false;
        this._loadEvent = _parameters.loadEvent || 0;
        this._startEvent = _parameters.startEvent || 0;
        this._itemEvent = _parameters.itemEvent || 0;
        this._itemVar = _parameters.itemVar || 0;
        this._amountVar = _parameters.amountVar || 0;

        return this;
    }


    //// MOVE HERE ALL METHODS FROM KunGameEvents function

    /**
     * @returns {Boolean}
     */
    debug() { return this._debug; };

    /**
     * @returns {Boolean}
     */
    hasItemEvent() { return this._itemEvent > 0; };
    /**
     * @returns {Boolean}
     */
    hasStartEvent() { return this._startEvent > 0; };
    /**
     * @returns {Boolean}
     */
    hasLoadEvent() { return this._loadEvent > 0; };
    /**
     * @returns {KunGameEvents}
     */
    onLoad() {
        if (this.hasLoadEvent()) {
            KunGameEvents.DebugLog(`Load Event Id ${this._loadEvent} Started!`);
            this.runEvent(this._loadEvent);
        }
        return this;
    };
    /**
     * @returns {KunGameEvents}
     */
    onStart() {
        if (this.hasStartEvent()) {
            KunGameEvents.DebugLog(`Start Event Id ${this._startEvent} Started!`);
            this.runEvent(this._startEvent);
        }

        return this;
    };

    /**
    * @param {Number} item_id 
    * @param {Number} amount 
    * @returns {KunGameEvents}
    */
    onGetItem(item_id, amount = 0) {
        if (item_id && this._itemEvent > 0) {
            if (this._itemVar > 0) {
                $gameVariables.setValue(this._itemVar, item_id);
            }
            if (this._amountVar > 0) {
                $gameVariables.setValue(this._amountVar, amount);
            }
            KunGameEvents.DebugLog(`Item Event ${this._itemEvent} Started!`);
            this.runEvent(this._itemEvent);
        }
        return this;
    };

    //RUN EVENTS AND SWITCHES

    /**
     * @param {Number} eventid 
     * @returns {KunGameEvents}
     */
    runEvent(eventid = 0) {
        eventid && $gameTemp.reserveCommonEvent(eventid);
        return this;
    };

    /**
     * @param {String} message 
     */
    static DebugLog() {
        if (KunGameEvents.manager().debug()) {
            console.log('[KunGameEvents] ', ...arguments);
        }
    };
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

        return _kunPluginReaderV2('KunGameEvents', PluginManager.parameters('KunGameEvents'));
    };

    /**
     * @returns {KunGameEvents}
     */
    static manager() { return KunGameEvents.__instance || new KunGameEvents(); }
}



/**
 * 
 */
function KunGameEvents_SystemLoad() {
    const _kunGameEvents_GameSystem_onLoad = Game_System.prototype.onAfterLoad;
    Game_System.prototype.onAfterLoad = function () {
        _kunGameEvents_GameSystem_onLoad.call(this);
        KunGameEvents.manager().onLoad();
    }
}
/**
 * 
 */
function KunGameEvents_NewGame() {
    const _kunGameEvents_SceneTitle_NewGame = Scene_Title.prototype.commandNewGame;
    Scene_Title.prototype.commandNewGame = function () {
        _kunGameEvents_SceneTitle_NewGame.call(this);
        KunGameEvents.manager().onStart();
    }
}

/**
 * 
 */
function KunGameEvents_SetupItems() {
    const _kunGameEvents_GameParty_GainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function (item, amount, includeEquip) {
        _kunGameEvents_GameParty_GainItem.call(this, item, amount, includeEquip);

        KunGameEvents.manager().onGetItem(item && item.id && 0, amount);
    }
}

(function ( /* autosetup */) {

    const manager = KunGameEvents.manager();

    if (manager.hasItemEvent()) {
        KunGameEvents_SetupItems();
    }
    if (manager.hasLoadEvent()) {
        KunGameEvents_SystemLoad();
    }
    if (manager.hasStartEvent()) {
        KunGameEvents_NewGame();
    }

})(/* autorun */);



