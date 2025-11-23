//=============================================================================
// KunCommands.js
//=============================================================================
/*:
 * @filename KunCommands.js
 * @plugindesc Kun Command Utils
 * @version 2.61
 * @author KUN
 * 
 *
 * @help
 * 
 * KunCommands loadgame
 *      Open the load game window
 * 
 * KunCommands wait [fps:fps:...];
 * 
 * KunCommands levelup {actor_id} [show|import]
 *      Exports the event map Id and event Id into the mapVar and eventVar game variables
 *      Use it from map events to capture their current map and event Id
 * 
 * KunCommands mapevent {eventVar} {mapVar}
 *      Exports the event map Id and event Id into the mapVar and eventVar game variables
 *      Use it from map events to capture their current map and event Id
 * 
 * KunCommands targetbattler {actorVar} {enemyVar}
 *      Exports the selected target in battle wether is party member or enemy from the troop.
 *      Use actorVar and enemyVar to export both involved battlers into their gameVariables
 * 
 * KunCommands skillmenu {actorid} {skill:skill:...} {random|last|skip|disable|first} {left|middle|right} {window|dim|transparent|none} [import|filter]
 *      Displays a skill menu to select and learn for actorid (use import to import actorid from a gamevar)
 *      Use filter flag to filter out the learned skills from the list. If list remains empty, won't show skill menu.
 *      Select a cancelType option from random|last|skip|disable|first
 *      Select a layout position from left|middle|right
 *      Select a window display type from window|dim|transparent
 * 
 * KunCommands partymenu {exportVar} {random|last|skip|disable|first} {left|middle|right} {window|dim|transparent|none}
 *      Displays a party selection menu to export the selected actor into exportVar
 *      Select a cancelType option from random|last|skip|disable|first
 *      Select a layout position from left|middle|right
 *      Select a window display type from window|dim|transparent
 * 
 * KunCommands partymember {exportVar} {random|member_id}
 *      Select a party member into exportVar
 *      Define which party member by member_id, or pick a random party member
 * 
 * KunCommands dropitems|clearitems [item1:item2:item3:...]
 *      Removes all item instances defined in the list
 * 
 * KunCommands hasitem [item:item:item:...] [exportvar]
 *      Returns any of the item id when owned by the player inventory
 * 
 * KunCommands on|off|toggle [gameswitch:gameswitch:gameswitch:...]
 *      Enables, disables or toggles the given list of game switches
 * 
 * KunCommands varadd [exportVar] [value1:value2:value3...] [limit] [import]
 *      Updates exportVar increasing the value with oneof the given amounts
 *      Defines a limit to stop increasing
 *      Define the limit from a valid gameVariable using import
 * 
 * KunCommands varsub [exportVar] [value1:value2:value3...] [minimum] [import]
 *      Updates exportVar reducing the value with oneof the given amounts
 *      Defines a minimum to stop reducing
 *      Define the minimum from a valid gameVariable using import
 * 
 * KunCommands varsum [gameVar] [gameVar1:gameVar2:gameVar3:gameVar4:...] [reset]
 *      Makes a sum of all the listed gamevariables into gameVar
 *      Sets gameVar to zero (0) when reset, to calculate the amount, or sums the amount to the current value
 * 
 * KunCommands oneof [exportVar] [value1:value2:value3...]
 *      Exports into exportVar one ofthe values providen
 * 
 * KunCommands oneif [exportVar] [value1:value2:value3...]
 *      Sets exportVar to one of the values providen, only if exportVar is zero or below 1
 * 
 * KunCommands isoneof [exportVar] [value1:value2:value3...]
 *      Checks if exportVar is one of the values providen, otherwise, sets exportVar to zero (0)
 * 
 * KunCommands clamp [exportVar] [min:max]
 *      Clamp the value of ExportVar between min and max
 * 
 * KunCommands rate [exportVar] [value/range] [import]
 *      Exports into exportVar the percentage of value/range
 *      Imports value and range from gameVariables
 * 
 * KunCommands varmenu [gameVar] [option:option:option:...] [random|last|skip|disable|first] [left|middle|right] [window|dim|transparent|none]
 *      ℹ Displays a Value Menu to set into gameVar from the options provided separated by semicolon (:)
 *      ℹ USE UNDERSCORE BAR (_) TO SET SPACES!
 *      ℹ Set Option_text|VALUE on those options where VALUE must be assigned to gamevar, or just Option_text to get the selected option index
 *      ℹ If no [VALUE] is present within an option, it will set gameVar to the corresponding index of the selected option in the option list.
 *      Select a cancelType option from random|last|skip|disable|first
 *      Select a layout position from left|middle|right
 *      Select a window display type from window|dim|transparent
 * 
 * KunCommands jumpto [label:label:label:...] [drop|random]
 *      Jumps to the first label found, sorted by priority
 *      Randoms among the list of labels providen
 * 
 * KunCommands varjump|varlabel [gameVar] value:label value:label value:label:label:label
 *      Selects (randomly) a label from the list providen matching the current gamevar's value
 * 
 * KunCommands mapjump|maplabel mapid:label mapid:label mapid:label:label:label ...
 *      Jumps to MAP_[currentmap_id] by default
 *      If a mapped list of ID:LABEL is providen, will attempt to jummp to the matching label by map
 * 
 * KunCommands isvar [gamevar:value:value:...] [label:label:label:...]
 *      Jumps to any of the providen labels in the label list when gamevar matches any of the values in the list
 *      First is the gamevariable to check, later all valid values to match with
 *      If any of the values is matched, jump to the label in the list after or a random label if more than one is providen
 * 
 * KunCommands greater|larger|isgreater|islarger [gamevar:value] [label:label:label:...]
 *      Jumps to any of the providen labels in the label list when gamevar is greater than the value providen
 *      First is the gamevariable to check, next is the value to match lower than the game variable
 *      If matched, jump to the label in the list after or a random label if more than one is providen
 * 
 * KunCommands lesser|islesser [gamevar:value] [label:label:label:...]
 *      Jumps to any of the providen labels in the label list when gamevar is greater than the value providen
 *      First is the gamevariable to check, next is the value to match lower than the game variable
 *      If matched, jump to the label in the list after or a random label if more than one is providen
 * 
 * KunCommands within [gamevar:value:value:...] [label:label:...]
 *      Check if gamevar's value is within the providen values
 *      Jumps to a randomly selected label from the list if matches
 *      If no label is providen, then sets gamevar to zero when doesn't match
 * 
 * KunCommands labelmenu [option:option:option:...] [random|last|skip|disable|first] [left|middle|right] [window|dim|transparent|none]
 *      ℹ Displays a label menu from the options provided separated by semicolon (:)
 *      ℹ USE UNDERSCORE BAR (_) TO SET SPACES!
 *      ℹ Use LABEL|Option_text for every option, to jump to LABEL when selected
 *      Allows to jump both to LABELS and label ALIASES
 *      Select a cancelType option from random|last|skip|disable|first
 *      Select a layout position from left|middle|right
 *      Select a window display type from window|dim|transparent
 * 
 * KunCommands url [your_game_url_here]
 * 
 * 
 * @param debug
 * @text Debug
 * @type boolean
 * @default false
 * 
 * @param iconOn
 * @text Switch On Icon
 * @type number
 * @min 0
 * @default 0
 * 
 * @param iconOff
 * @text Switch Off Icon
 * @type number
 * @min 0
 * @default 0
 */

/**
 * @class{KunCommands}
 */
class KunCommands {
    /**
     * 
     * @returns {KunCommands}
     */
    constructor() {
        if (KunCommands.__instance) {
            return KunCommands.__instance;
        }

        KunCommands.__instance = this.initialize();
    }
    /**
     * 
     * @returns {KunCommands}
     */
    initialize() {

        const _parameters = this.pluginData();

        this._debug = _parameters.debug;

        this._icons = {
            on: _parameters.switchOn,
            off: _parameters.switchOff,
        };

        return this;
    }
    /**
     * @param {String} icon 
     * @returns {Number}
     */
    icon(icon) { return this._icons.hasOwnProperty(icon) ? this._icons[icon] : 0; };
    /**
     * @param {Boolean} value 
     * @returns {Number}
     */
    switchIcon(value = false) { return this.icon(value ? 'on' : 'off'); };
    /**
     * @returns {Boolean}
     */
    debug() {
        return this._debug;
    };
    /**
     * @param {Number} actorVar 
     * @param {Number} enemyVar 
     * @returns {Number}
     */
    targetBattler(actorVar = 0, enemyVar = 0) {

        if ($gameParty.inBattle() && actorVar && enemyVar) {

            const targetEnemy = BattleManager._action._subjectActorId > 0;

            const caster_id = targetEnemy ?
                //caster is party character, CAREFUL!!! this is the actual ACTOR ID, not the party member in  the troop!!!
                BattleManager._action._subjectActorId :
                //caster is troop enemy (-1 if not used)
                BattleManager._action._subjectEnemyIndex;

            const target_id = targetEnemy ?
                //target is troop enemy
                BattleManager._action._targetIndex :
                //target is party member
                $gameParty.members().length > 1 ? parseInt(Math.random() * $gameParty.members().length) : 0;

            const actor_id = targetEnemy ? caster_id : $gameParty.members()[target_id]._actorId;
            const enemy_id = $gameTroop.members()[targetEnemy ? target_id : caster_id]._enemyId;

            $gameVariables.setValue(actorVar, actor_id);
            $gameVariables.setValue(enemyVar, enemy_id);

            return targetEnemy ? enemy_id : actor_id;
        }
        return 0;
    };

    /**
     * @return {Object}
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

        return _kunPluginReaderV2('KunCommands', PluginManager.parameters('KunCommands'));
    };

    /**
     * @param {String|Object} message 
     */
    static DebugLog() {
        if (KunCommands.instance().debug()) {
            console.log('[ KunCommands ]', ...arguments);
        }
    };
    /**
     * @returns {KunCommands}
     */
    static instance() {
        return KunCommands.__instance || new KunCommands();
    };
}


/**
 * @class {KunCommandManager}
 */
class KunCommandManager {
    /**
     * @param {String[]} input 
     * @param {Game_Interpreter} context
     */
    constructor(input = [], context = null) {
        this._context = context instanceof Game_Interpreter && context || null;
        this.initialize(input);
        KunCommands.DebugLog(this);
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
    toString() { return `${this.command()} ${this.arguments().map(a => `{${a}}`).join(' ')} [${this._flags.join('|')}]`; }
    /**
     * @returns {KunCommands}
     */
    manager() { return KunCommands.instance(); }
    /**
     * @returns {Game_Interpreter}
     */
    context() { return this._context; }
    /**
     * @returns {Game_Event}
     */
    event() { return this.context().character() || null; }
    /**
     * @returns {String[]}
     */
    arguments() { return this._args; }
    /**
     * @returns {String}
     */
    command() { return this._command; }

    /**
     * @param {String} flag 
     * @returns {Boolean}
     */
    has(flag = '') { return flag && this._flags.includes(flag) || false; }

    /**
     * @returns {Boolean}
     */
    run() {
        const command = `${this.command()}Command`;
        return typeof this[command] === 'function' ?
            this[command](this.arguments().slice()) || false :
            this.defaultCommand(this.arguments().slice());
    }
    /**
     * @param {String} args 
     * @returns {Boolean}
     */
    defaultCommand(args = []) {
        KunCommands.DebugLog(`Invalid command ${this.toString()} [${args.join(' ')}]`);
        return true;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    levelupCommand(args = []) {
        if (args.length) {
            const actor_id = this.has('import') ? $gameVariables.value(parseInt(args[0])) : parseInt(args[0]) || 0;
            const actor = $gameActors.actor(actor_id) || null;
            if (actor && !actor.isMaxLevel()) {
                const current = actor.currentExp();
                const next = actor.nextRequiredExp();
                actor.changeExp(current + next, this.has('show'));
                KunCommands.DebugLog(`${actor.name()}(${actor_id}) Levels up with ${next} XP`);
                return true;
            }
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    loadgameCommand(args = []) {
        SceneManager.push(Scene_Load);
        return true;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    mapeventCommand(args = []) {
        if (args.length) {
            this.mapEventVars(
                parseInt(args[0]),
                args.length > 1 ? parseInt(args[1]) : 0
            );
            return true;
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    targetbattlerCommand(args = []) {
        if (args.length > 1) {
            this.manager().targetBattler(parseInt(args[0]), parseInt(args[1]));
            return true;
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    partymenuCommand(args = []) {
        if (args.length && $gameParty.size() > 0) {
            this.setupPartySelector(parseInt(args[0]),
                args[1] || 'first',
                args[2] || 'right',
                args[3] || 'window',
            );
            return true;
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    skillmenuCommand(args = []) {
        const ids = args[0] && args[0].split(':').map(id => parseInt(id)) || [];
        const actorid = ids[0] ? this.has('import') && this.getvar(ids[0]) || ids[0] : 0;
        const exportvar = ids[1] || 0; //export learned skill to gamevar
        const actor = actorid && $gameActors.actor(actorid) || null;
        const skills = args[1] && args[1].split(':').map(skill => parseInt(skill)) || [];
        if (actor && skills.length) {
            const available = this.has('filter') && skills.filter(skill => !actor.isLearnedSkill(skill)) || skills;
            if (available.length > 1) {
                return this.setupSkillSelector(
                    actorid, available,
                    args[2] || 'first',
                    args[3] || 'right',
                    args[4] || 'window',
                    exportvar
                );
            }
            else if (available.length) {
                actor.learnSkill(available[0]);
                exportvar && this.setvar(exportvar, available[0]);
                return true;
            }
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    partymemberCommand(args = []) {
        if (args.length > 1 && $gameParty.size() > 0) {
            const gameVar = parseInt(args[0]);
            const member = this.has('random') ? Math.floor(Math.random() * $gameParty.size()) : parseInt(args[1]);
            const actor = $gameParty.members()[member] || null;
            this.setvar(gameVar, actor && actor.actorId() || 0);
            return true;
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    maxpartycountCommand(args = []) {
        if (args.length) {
            this.setvar(parseInt(args[0]), $gameParty.maxBattleMembers());
            return true;
        }
        return false;
    }
    /**
     * @param {String[]} args 
     */
    sellCommand(args = []) {
        if (args.length) {
            const items = args[0].split(':').map(id => parseInt(id)).filter(id => id);
            const gameVar = args.length > 1 && args[1] > 0 ? parseInt(args[1]) : 0;
            let value = 0;
            items.map(id => $dataItems[id]).forEach(function (item) {
                var amount = $gameParty.numItems(item);
                if (amount) {
                    value += item.price * amount;
                    $gameParty.gainItem(item, -amount);
                }
            });
            if (gameVar) {
                $gameVariables.setValue(gameVar, value);
            }
            else {
                $gameParty.gainGold(value);
            }
        }
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    hasitemCommand(args = []) {
        if (args.length > 1) {
            const inventory = $gameParty.items().map(item => item.id).filter(id => $gameParty.numItems(id));
            const items = args[0].split(':').map(i => parseInt(i)).filter(item => inventory.includes(item));
            const gamevar = parseInt(args[1]);
            this.setvar(gamevar, items.length && items[Math.floor(Math.random() * items.length)] || 0);
        }
        return false;
    }
    /**
     * @param {String[]} args 
     */
    dropitemsCommand(args = []) {
        if (args.length) {
            const items = $gameParty._items;
            args[0].split(':').map(id => parseInt(id)).filter(id => items[id]).forEach(id => {
                delete items[id];
                KunCommands.DebugLog(`Removing Item Id[${id}]`);
            });
        }
    }
    /**
     * @param {String[]} args 
     */
    onCommand(args = []) {
        if (args.length) {
            args[0].split(':').map(gs => parseInt(gs)).forEach(gs => this.setswitch(gs, true));
        }
    }
    /**
     * @param {String[]} args 
     */
    offCommand(args = []) {
        if (args.length) {
            args[0].split(':').map(gs => parseInt(gs)).forEach(gs => this.setswitch(gs, false));
        }
    }
    /**
     * @param {String[]} args 
     */
    toggleCommand(args = []) {
        if (args.length) {
            args[0].split(':').map(gs => parseInt(gs)).forEach(gs => this.setswitch(gs, !this.getswitch(gs)));
        }
    }


    /**
     * @param {Number} onDefaultValue
     * @returns {Number}
     */
    pageEventVars(onDefaultValue = 0) {
        const gameEvent = this.event();
        if (gameEvent && gameEvent instanceof Game_Event) {
            if (gameEvent.page().conditions.variableValid) {
                return gameEvent.page().conditions.variableValue;
            }
        };
        return onDefaultValue || 0;
    };
    /**
     * @param {Number} eventVar
     * @param {Number} mapVar
     * @returns {Boolean}
     */
    mapEventVars(eventVar = 0, mapVar = 0) {
        const gameEvent = this.event();
        if (gameEvent && gameEvent instanceof Game_Event) {
            if (eventVar) {
                $gameVariables.setValue(eventVar, gameEvent.eventId());
            }
            if (mapVar && gameEvent.hasOwnProperty('_mapId')) {
                $gameVariables.setValue(mapVar, gameEvent._mapId);
            }
            return true;
        };
        $gameVariables.setValue(mapVar, 0);
        $gameVariables.setValue(eventVar, 0);
        return false;
    };
    /**
     * @param {String[]} args 
     */
    varaddCommand(args = []) {
        if (args.length > 1) {
            const gameVar = parseInt(!Number.isNaN(args[0]) ? args[0] : 0);
            let top = args.length > 2 ? parseInt(args[2]) : 0;
            let value = args[1] === 'pagevar' ?
                this.pageEventVars(top) :
                this.selectValue(args[1].split(':').filter(value => !isNaN(value)).map(value => parseInt(value)));
            if (this.has('import') && top) {
                top = $gameVariables.value(top);
            }
            if (gameVar > 0) {
                value = $gameVariables.value(gameVar) + value;
                $gameVariables.setValue(gameVar, value < top || top === 0 ? value : top);
            }
        }
    }
    /**
     * @param {String[]} args 
     */
    varsubCommand(args = []) {
        if (args.length > 1) {
            const gameVar = parseInt(!Number.isNaN(args[0]) ? args[0] : 0);
            let min = args.length > 2 ? parseInt(args[2]) : 0;
            let value = args[1] === 'pagevar' ?
                this.pageEventVars(min) :
                this.selectValue(args[1].split(':').filter(value => !isNaN(value)).map(value => parseInt(value)));
            if (this.has('import') && min) {
                min = $gameVariables.value(min);
            }
            if (gameVar > 0) {
                value = $gameVariables.value(gameVar) - value;
                $gameVariables.setValue(gameVar, value > min ? value : min);
            }
        }
    }
    /**
     * @param {String[]} args
     * @returns {Boolean} 
     */
    setoneofCommand(args = []) {
        if (args.length > 1) {
            const gamevar = parseInt(args[0]);
            if (gamevar) {
                const list = args[1].split(':').map(value => parseInt(value));
                //list.sort((a, b) => a - b);
                this.setvar(gamevar, list[Math.floor(Math.random() * list.length)] || 0);
                return true;
            }
        }
        return false;
    }

    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    oneifCommand(args = []) {
        if (args.length > 1) {
            const gamevar = parseInt(args[0]);
            if (gamevar) {
                const list = args[1].split(':').map(val => parseInt(val) || 0);
                list.sort((a, b) => a - b);
                const value = this.getvar(gamevar);
                if (value < 1) {
                    this.setvar(gamevar, list[Math.floor(Math.random() * list.length)]);
                }
                return true;
            }
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    isoneofCommand(args = []) {
        if (args.length > 1) {
            var gameVar = parseInt(args[0]);
            if (gameVar) {
                const value = $gameVariables.value(gameVar);
                const list = args[1].split(':')
                    .map(value => parseInt(value) || 0)
                    .sort((a, b) => a - b);
                const labels = args[2] && args[2].split(':') || [];
                if (list.includes(value)) {
                    labels.length && this.jumpToLabels(labels);
                }
                else {
                    $gameVariables.setValue(gameVar, 0);
                }
                return true;
            }
        }
        return false;
    }
    /**
     * @param {String[]} args 
     */
    clampCommand(args = []) {
        if (args.length > 1) {
            const gameVar = parseInt(args[0]);
            const value = $gameVariables.value(gameVar);
            const list = args[1].split(':').map(val => parseInt(val)).sort((a, b) => a - b);
            const clamp = Math.max(value, list[0]);
            $gameVariables.setValue(gameVar, list.length > 1 ? Math.min(clamp, list[1]) : clamp);
        }
    }
    /**
     * @param {String[]} args 
     */
    varsumCommand(args = []) {
        if (args.length > 1) {
            const gameVar = parseInt(args[0]);
            if (gameVar && args.length > 1) {
                var amount = args[1].split(':')
                    .map(id => parseInt(id))
                    .filter(id => id > 0)
                    .reduce((a, b) => a + $gameVariables.value(b), 0);
                var value = this.has('reset') ? 0 : $gameVariables.value(gameVar);
                $gameVariables.setValue(gameVar, value + amount);
            }
        }
    }
    /**
     * @param {String[]} args 
     */
    rateCommand(args = []) {
        if (args.length > 1) {
            var exportVar = parseInt(args[0]);
            var range = args[1].split('/').filter(value => !isNaN(value)).map(value => parseInt(value));
            if (range.length > 1 && range[1] > 0) {
                if (this.has('import') && $gameVariables.value(range[0]) && $gameVariables.value(range[1])) {
                    range[0] = $gameVariables.value(range[0]);
                    range[1] = $gameVariables.value(range[1]);
                }
                $gameVariables.setValue(exportVar, range[0] / parseFloat(range[1]) * 100);
            }
            else {
                $gameVariables.setValue(exportVar, 0);
            }
        }
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    progressCommand(args = []) {
        if (args.length > 2) {
            const value = this.getvar(parseInt(args[1]));
            const range = this.getvar(parseInt(args[2]));
            this.setvar(parseInt(args[0]), range > 0 ? parseInt(value / range * 100) : 0);
            return true;
        }
        return false;
    }
    /**
     * takes gamevar's value and compares to the list of options providen
     * Options will take their index value, or the attached value when |value is defined
     * Option underscores _ iwll be replaced by space
     * gamevar Option_1 Option_2|value Option_3 Option_4|value ...
     * @param {String[]} args 
     * @returns {Boolean}
     */
    varmenuCommand(args = []) {
        if (args.length > 1) {
            return this.varMenuSelector(
                parseInt(args[0]), //capture menu option into var
                args[1].split(':').map(option => option.replace(/_/g, ' ')), //menu options
                args.length > 2 ? args[2] : 'first',
                args.length > 3 ? args[3] : 'right',
                args.length > 4 ? args[4] : 'window',
            );
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    labelmenuCommand(args = []) {
        if (args.length) {
            return this.labelMenuSelector(
                args[0].split(':').map(option => option.replace(/_/g, ' ')), //menu options
                args.length > 1 ? args[1] : 'first',
                args.length > 2 ? args[2] : 'right',
                args.length > 3 ? args[3] : 'window',
            );
        }
        return false;
    }
    /**
     * isvar gamevar:value:value:... label:label:... fallback:fallback:...
     * @param {String[]} args 
     * @returns {Boolean}
     */
    isvarCommand(args = []) {
        if (args.length > 1) {
            const values = args[0].split(':').map(value => parseInt(value));
            const gamevar = values.shift();
            const labels = args[1].split(':');
            if (gamevar) {
                if ( values.includes(this.getvar(gamevar))) {
                    return this.jumpToLabels(labels, true);
                }
                else {
                    //set to zero if not in values, or jump to 
                    this.has('reset') && this.setvar(gamevar);
                    this.jumpToLabels( args[2] && args[2].split(':') || []);
                }
            }
        }
        return false;
    }
    /**
     * within gamevar:value:value:... label:label:label:...
     * @param {String[]} args 
     * @returns {Boolean}
     */
    withinCommand(args = []) {
        if (args.length) {
            const values = args[0].split(':').map(value => parseInt(value));
            const gamevar = values.shift();
            const value = gamevar && $gameVariables.value(gamevar) || 0;
            values.sort();
            const match = values.length > 1 ? value > values[0] && value < values[values.length - 1] : !!values[0] && values[0] < value;
            const labels = args[1] && args[1].split(':') || [];
            if (labels.length) {
                if (match) {
                    return this.jumpToLabels(args[1].split(':'));
                }
            }
            else {
                !match && $gameVariables.setValue(gamevar, 0);
                return true;
            }
        }
        return false;
    }
    /**
     * @param {String[]} args 
     */
    greaterCommand(args = []) {
        if (args.length > 1) {
            const values = args[0].split(':').map(value => parseInt(value));
            const gamevar = values.shift();
            if (gamevar) {
                const current = this.getvar(gamevar);
                if (values[0] && current > values[0]) {
                    var jumpto = args[1].split(':');
                    this.jumpToLabels(jumpto, true);
                }
            }
        }
    }
    /**
     * @param {String[]} args 
     */
    lesserCommand(args = []) {
        if (args.length > 1) {
            const values = args[0].split(':').map(value => parseInt(value));
            const gamevar = values.shift();
            if (gamevar) {
                const current = this.getvar(gamevar);
                if (values[0] && current < values[0]) {
                    const jumpto = args[1].split(':');
                    this.jumpToLabels(jumpto, true);
                }
            }
        }
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    jumptoCommand(args = []) {
        if (args.length) {
            return this.jumpToLabels(args[0].split(':'), this.has('random'));
        }
        return false;
    }
    /**
     * varjump gamevar value:label:label value:label value:label value:label:label:...
     * 
     * @param {String[]} args varId value:label1:label2 value:label value:label ...
     * @returns {Boolean}
     */
    varjumpCommand(args = []) {
        if (args.length > 1) {
            const value = this.getvar(parseInt(args.shift()));
            const labels = args
                .map(lbl => lbl.split(':'))
                .find(lbl => parseInt(lbl.shift()) || 0 === value ) || [];
            //console.log(labels);
            return this.jumpToLabels(labels, true);
        }
        return false;
    }
    /**
     * Jump to label when current map id matches one of the labels inthe list, or jumps to MAP_[id] label by default
     * @param {String[]} args 
     * @returns {Boolean}
     */
    mapjumpCommand(args = []) {
        const mapid = $gameMap.mapId();
        const labels = args.map(lbl => lbl.split(':')).find(lbl => parseInt(lbl.shift()) === mapid) || [];
        return labels.length && this.jumpToLabels(labels) || this.jumpToLabel(`MAP_${mapid}`);
    }
    /**
     * @param {String[]} args 
     */
    urlCommand(args = []) {
        const url = args.length && args[0].match(/https?:\/\/[^\s/$.?#].[^\s]*/g) || null;
        if (url && url.length) {
            nw.Shell.openExternal(url[0]);
        }
    }
    /**
     * @param {String[]} args 
     */
    waitCommand(args = []) {
        const wait = args.length && args[0].split(':').map(v => parseInt(v)) || [60];
        switch (true) {
            case wait.length > 2:
                this.wait(wait[Math.floor(Math.random() * wait.length)]);
                break;
            case wait.length > 1:
                this.wait(wait[0] + wait[Math.floor(Math.random() * wait[1])]);
                break;
            case wait.length:
                this.wait(wait[0]);
                break;
            default:
                this.wait( 60 );
                break;
        }

    }

    ///COMMAND ALIASES
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    oneofCommand(args = []) { return this.setoneofCommand(args); }
    /**
     * @param {String[]} args varId value:label1:label2 value:label value:label ...
     * @returns {Boolean}
     */
    varlabelCommand(args = []) { return this.varjumpCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    maplabelCommand(args = []) { return this.mapjumpCommand(args); }
    /**
     * @param {String[]} args 
     */
    islargerCommand(args = []) { this.greaterCommand(args); }
    /**
     * @param {String[]} args 
     */
    isgreaterCommand(args = []) { this.greaterCommand(args); }
    /**
     * @param {String[]} args 
     */
    largerCommand(args = []) { this.greaterCommand(args); }
    /**
     * @param {String[]} args 
     */
    islesserCommand(args = []) { this.lesserCommand(args); }

    ///////////////// HELPERS

    /**
     * @param {Number[]} values 
     * @returns {Number}
     */
    selectValue(values = []) {
        if (Array.isArray(values) && values.length) {
            switch (true) {
                case values.length > 2:
                    return values[Math.floor(Math.random() * values.length)];
                case values.length > 1:
                    return Math.floor(Math.random() * (values[1] - values[0])) + values[0];
                case values.length:
                    return values[0];
            }
        }
        return 1;
    }

    /**
     * @param {Number} gamevar Game Variable to export the actor's ID
     * @param {Number} cancel [random|first|last|skip|disable]
     * @param {Number} position [left|middle|right]
     * @param {Number} background [window|dim|none]
     * @returns {Boolean}
     */
    setupPartySelector(gamevar = 0, cancel = 'skip', position = 'right', background = 'window') {
        if (gamevar && $gameParty.size()) {

            const choices = $gameParty.members().map(actor => actor.name());
            return this.createMenu(choices, cancel, background, position, function (selected) {
                const actor = $gameParty.members()[selected % choices.length] || null;
                console.log(selected, actor, actor && actor.actorId());
                !!actor && $gameVariables.setValue(gamevar, actor.actorId());
            });
        }
        return false;
    };
    /**
     * @param {Number} actorid Game Variable to export the actor's ID
     * @param {Number[]} skills Skill list to learn
     * @param {Number} cancel [random|first|last|skip|disable]
     * @param {Number} position [left|middle|right]
     * @param {Number} background [window|dim|none]
     * @param {Number} gamevar export skill id to gamevariable
     * @returns {Boolean}
     */
    setupSkillSelector(actorid = 0, skills = [], cancel = 'skip', position = 'right', background = 'window', gamevar = 0) {
        if (skills.length) {
            const choices = skills
                .map(skill => { return { name: $dataSkills[skill].name, icon: $dataSkills[skill].iconIndex } })
                .map(skill => skill.icon && `\\I[${skill.icon}] ${skill.name}` || skill.name);

            return this.createMenu(choices, cancel, background, position, function (selected) {
                const skill = skills[selected];
                const actor = $gameActors.actor(actorid) || null;
                if (skill && actor) {
                    actor.learnSkill(skill);
                    gamevar && $gameVariables.setValue(gamevar, skill);
                }
            });
        }
        return false;
    };
    /**
     * Option 1|value Option 2:value Option 3 ...
     * @param {Number} gamevar Define a game variable to setup the menu as a VALUE SELECTOR. Leave zero to use LABEL SELECTOR
     * @param {Object[]} options List all option values
     * @param {Number} cancel [random|first|last|skip|disable]
     * @param {Number} position [left|middle|right]
     * @param {Number} background [window|dim|none]
     * @returns {Boolean}
     */
    varMenuSelector(gamevar = 0, options = [], cancel = 'skip', position = 'right', background = 'window') {
        if (gamevar && options.length) {
            //setup gamevar selector
            const choices = options.map(option => option.split('|'));
            const values = choices.map((option, index) => option[1] && parseInt(option[1]) || index + 1);

            return this.createMenu(choices.map(option => option[0]), cancel, background, position, function (selected) {
                $gameVariables.setValue(gamevar, values[selected] || 0);
            });
        }
        return false;
    };
    /**
     * @param {String[]} options Defined Label Menu to load options from
     * @param {Number} cancel [random|first|last|skip|disable]
     * @param {Number} position [left|middle|right]
     * @param {Number} background [window|dim|none]
     * @param {Number} gameVar Define a game variable to setup the menu as a VALUE SELECTOR. Leave zero to use LABEL SELECTOR
     * @returns {Boolean}
     */
    labelMenuSelector(options = [], cancel = 'skip', position = 'right', background = 'window') {
        if (options.length) {
            const choices = options.map(option => option.split('|'));
            const labels = choices.map(label => label[0]);
            const manager = this;
            return this.createMenu(choices.map(option => option[1] || option[0]), cancel, background, position, function (selected) {
                const label = labels[selected] || '';
                !!label && manager.jumpToLabel(label);
            });
        }
        return false;
    };
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
            this.waitMessage();
            return true;
        }
        return false;
    }
    /**
     * @param {String} position 
     * @returns {Number}
     */
    getMenuPosition(position = '') {
        const positions = ['left', 'middle', 'right'];
        return position && positions.includes(position) ? positions.indexOf(position) : 2;
    }
    /**
     * @param {String} bg 
     * @returns {Number}
     */
    getMenuBackground(bg = '') {
        const backgrounds = ['window', 'dim', 'transparent'];
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
    };


    //// INTERPRETER HACKS
    /**
     * @param {Number} id 
     * @returns {Number}
     */
    getvar(id = 0) { return id && $gameVariables.value(id) || 0; }
    /**
     * @param {Number} id 
     * @param {Number} value 
     * @returns {KunCommandManager}
     */
    setvar(id = 0, value = 0) {
        id && $gameVariables.setValue(id, value);
        return this;
    }
    /**
     * @param {Number} id 
     * @returns {Boolean}
     */
    getswitch(id = 0) { return id && $gameSwitches.value(id) || false; }
    /**
     * @param {Number} id 
     * @param {Boolean} value 
     * @returns {KunCommandManager}
     */
    setswitch(id = 0, value = false) {
        id && $gameSwitches.setValue(id, value);
        return this;
    }

    /**
     * @param {String[]} labels 
     * @param {Boolean} random 
     * @returns {Boolean}
     */
    jumpToLabels(labels = [], random = false) {
        KunCommands.DebugLog(`Searching for Label in [${labels.join(',')}]... ${random && '(random)' || '(fallback)'}`);
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
            KunCommands.DebugLog(`Searching for Label [${lbl}]...`);
            for (var i = 0; i < context._list.length; i++) {
                var command = context._list[i];
                if (command.code === 118 && command.parameters[0] === lbl) {
                    context.jumpTo(i);
                    KunCommands.DebugLog(`Jumping to Label [${lbl}]`);
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * @param {String} mode 
     * @returns {KunCommandManager}
     */
    setWaitMode(mode = '') {
        if (this.context()) {
            //set this to wait for a response
            //this.context()._index++;
            this.context().setWaitMode(mode);
        }
        //this._waitMode = mode;
        return this;
    }
    /**
     * @returns {KunCommandManager}
     */
    waitMessage() { return this.setWaitMode('message'); }
    /**
     * @param {Number} fps
     * @returns {KunCommandManager}
     */
    wait(fps = 0) {
        if (this.context() && fps) {
            this.context().wait(fps);
        }
        //return this._wait;
        return this;
    }

    /**
     * @param {Game_Interpreter} interpreter 
     * @param {String[]} input 
     * @returns {KunCommandManager}
     */
    static create(interpreter = null, input = []) {
        return interpreter instanceof Game_Interpreter ? new KunCommandManager(input, interpreter) : null;
    }
    /**
     * @returns {Boolean}
     */
    static Command(command = '') {
        return ['kuncommand', 'kuncommands'].includes(command.toLowerCase());
    };
}


/**
 * 
 */
function KunCommands_Setup_Command() {
    var _KunCommands_PluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunCommands_PluginCommand.call(this, command, args);
        if (KunCommandManager.Command(command)) {
            KunCommandManager.create(this, args).run();
        }
    }
};

(function ( /* autosetup */) {
    KunCommands.instance();
    KunCommands_Setup_Command();
})( /* */);

