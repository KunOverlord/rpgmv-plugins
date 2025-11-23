//=============================================================================
// KunTroopEvents.js
//=============================================================================
/*:
 * @filename KunTroopEvents.js
 * @plugindesc Custom Event Hooks for Game Start, Load and Random Troops, Displayable Special Event Window and Player Menu Commands
 * @version 1.1
 * @author KUN
 * 
 * 
 * @help
 * 
 * Now you can call common events for random spawn battles in the maps, running gameover and winning scenes.
 *  - Create a list of troops to run special events once the party wins or loses any battle.
 *  - Define a list of switches and conditions to run such events
 * 
 * @param debug
 * @text Debug
 * @description Show some debug info in console ;)
 * @type Boolean
 * @default false
 * 
 * @param gameOverEvents
 * @text Gameover
 * @desc Run these troop common events when the party looses a battle
 * @type struct<TroopEvent>[]
 * 
 * @param victoryEvents
 * @text Victory
 * @desc Run these troop common events when the party wins a battle
 * @type struct<TroopEvent>[]
 * 
 */


/**
 * @class {KunTroopEvents}
 */
class KunTroopEvents {

    constructor() {
        if (KunTroopEvents.__instance) {
            return KunTroopEvents.__instance;
        }

        KunTroopEvents.__instance = this;

        this.initialize();
    }
    /**
     * @returns {KunTroopEvents}
     */
    initialize() {

        const _parameters = KunTroopEvents.PluginData();

        this._debug = _parameters.debug || false;

        this._gameoverEvents = this.createTroops(Array.isArray(_parameters.gameOverEvents) && _parameters.gameOverEvents || []);
        this._victoryEvents = this.createTroops(Array.isArray(_parameters.victoryEvents) && _parameters.victoryEvents || []);

        return this;
    }


    //// MOVE HERE ALL METHODS FROM KunTroopEvents function

    /**
     * @returns {Boolean}
     */
    debug() { return this._debug; };

    /**
     * @param {Object[]} input 
     * @returns {KunEventTroop[]}
     */
    createTroops(input = []) {
        return input.map(content => {
            return new KunEventTroop(
                content.troopId && content.troopId.length && content.troopId || [],
                content.eventId || 0,
                content.switchOn || 0,
                content.switchOff || 0,
            );
        }).filter(e => e.troops().length);
    }

    /**
     * @returns {KunEventTroop[]}
     */
    gameoverEvents() { return this._gameoverEvents; };
    /**
     * @param {Number} troop 
     * @returns {KunEventTroop}
     */
    getGameOver(troop) {
        if (troop) {
            const gameover = this.gameoverEvents().filter(event => event.troops().includes(troop));
            return gameover.length ? gameover[Math.floor(Math.random() * gameover.length)] : null;
        }
        return null;
    };
    /**
     * @returns {Boolean}
     */
    hasTroopEvents() { return this.gameoverEvents().length || this.victoryEvents().length || false; }
    /**
     * @param {Number} troop 
     * @returns 
     */
    runGameOver(troop) {
        const gameover = this.getGameOver(troop);
        KunTroopEvents.DebugLog( `Running Gameover Event ` , gameover);
        if (gameover) {
            return gameover.run();
        }
        return false;
    };

    /**
     * @returns {KunEventTroop[]}
     */
    victoryEvents() { return this._victoryEvents; };
    /**
     * @param {Number} troop 
     * @returns {KunEventTroop}
     */
    getVictory(troop = 0) {
        if (troop) {
            const victory = this.victoryEvents().filter(event => event.troops().includes(troop));
            return victory.length ? victory[Math.floor(Math.random() * victory.length)] : null;
        }
        return null;
    };
    /**
     * @param {Number} troop 
     * @returns 
     */
    runVictory(troop = 0) {
        const victory = this.getVictory(troop);
        KunTroopEvents.DebugLog( `Running Victory Event ` , victory);
        if (victory) {
            return victory.run();
        }
        return false;
    };

    //CAPTURE TROOP EVENTS

    /**
     * @returns {Number}
     */
    getGameTroopId() { return $gameTroop._troopId; };
    /**
     * @returns {Boolean}
     */
    checkGameOver() { return this.runGameOver(this.getGameTroopId()); };
    /**
     * @returns {Boolean}
     */
    checkVictory() { this.runVictory(this.getGameTroopId()); };


    /**
     * @param {String} message 
     */
    static DebugLog() {
        if (KunTroopEvents.manager().debug()) {
            console.log('[KunTroopEvents] ', ...arguments);
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

        return _kunPluginReaderV2('KunTroopEvents', PluginManager.parameters('KunTroopEvents'));
    };

    /**
     * @returns {KunTroopEvents}
     */
    static manager() { return KunTroopEvents.__instance || new KunTroopEvents(); }
}


/**
 * Associate Troops with common events
 */
class KunEventTroop {
    /**
     * @param {Number[]} troop 
     * @param {Number} event 
     * @param {Number} switchId 
     * @param {Number[]} on 
     * @param {Number[]} off 
     */
    constructor(troop = [], event = 0, on = [], off = []) {
        this._troops = Array.isArray(troop) && troop || [troop];
        this._event = event || 0;
        this._on = on || [];
        this._off = off || [];
    }
    /**
     * @returns {Number[]}
     */
    troops() { return this._troops; }
    /**
     * @returns {Number}
     */
    troop() { return this._troops[0] || 0; };
    /**
     * @returns {Number}
     */
    event() { return this._event; };
    /**
     * @returns {Number[]}
     */
    on() { return this._on; };
    /**
     * @returns {Number}
     */
    off() { return this._off; };
    /**
     * @returns {Boolean}
     */
    run() {
        if (this.event()) {
            //check on and off the required switches ...
            this.on().forEach( flag => $gameSwitches.setValue(flag, true));
            this.off().forEach( flag => $gameSwitches.setValue(flag, false));
            //then redirect to the hooked common event
            $gameTemp.reserveCommonEvent(this.event());
            return true;
        }
        return false;
    };
}

/**
 * 
 */
function KunTroopEvents_Setup_Battle() {
    //OVERRIDE BATTLEMANAGER UPDATES
    BattleManager.updateBattleEnd = function () {
        switch (true) {
            case this.isBattleTest():
                AudioManager.stopBgm();
                SceneManager.exit();
                break;
            case !this._escaped && $gameParty.leader().isDead():
                //case !this._escaped && $gameParty.isAllDead():
                //CHECK CAN-LOSE FLAG, THEN THE PLUGIN CUSTOM EVENTS
                KunTroopEvents.DebugLog('Running Gameovers',this.isRandomTroop());
                if (this._canLose || KunTroopEvents.manager().checkGameOver()) {
                    $gameParty.reviveBattleMembers();
                    SceneManager.pop();
                }
                else {
                    SceneManager.goto(Scene_Gameover);
                }
                break;
            default:
                SceneManager.pop();
                break;
        }
        this._phase = null;
    };

    //DO NOT OVERRIDE YET, THIS MUST FIRE ONLY WHEN IS A MAP GENERATED TROOP BATTLE, NOT A COMMON EVENT BATTLE!

    const _kunTroopEvents_BattleManager_Victory = BattleManager.processVictory;
    BattleManager.processVictory = function () {
        _kunTroopEvents_BattleManager_Victory.call(this);

        if (this.isRandomTroop()) {
            //surprise troop?
            KunTroopEvents.manager().checkVictory();
        }
    };

    //OVERRIDE BattleManager and random executing encounter methods to mark if can attach victory event

    /**
     * @param {Number} troopId 
     * @param {Boolean} canEscape 
     * @param {Boolean} canLose 
     * @param {Boolean} mapEncounter 
     */
    BattleManager.setup = function (troopId, canEscape, canLose, mapEncounter = false) {
        //vanilla initializers
        this.initMembers();
        this._canEscape = canEscape;
        this._canLose = canLose;
        //add map encounter flag (KunTroopEvents)
        this._mapEncounter = mapEncounter;

        $gameTroop.setup(troopId);
        $gameScreen.onBattleStart();
        this.makeEscapeRatio();
    };
    /**
     * @returns {Boolean}
     */
    BattleManager.isRandomTroop = function () {
        return this._mapEncounter || false;
        //return typeof this._mapEncounter === 'boolean' && this._mapEncounter;
    };

    /**
     * @returns {Boolean}
     */
    Game_Player.prototype.executeEncounter = function () {
        if (!$gameMap.isEventRunning() && this._encounterCount <= 0) {
            this.makeEncounterCount();
            var troopId = this.makeEncounterTroopId();
            if ($dataTroops[troopId]) {
                BattleManager.setup(troopId, true, false, true);
                BattleManager.onEncounter();
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };    
}


(function ( /* autosetup */) {

    const manager = KunTroopEvents.manager();

    if (manager.hasTroopEvents()) {
        KunTroopEvents_Setup_Battle();
    }

})(/* autorun */);



