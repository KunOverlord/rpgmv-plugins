//=============================================================================
// KunCrafting.js
//=============================================================================
/*:
 * @filename KunCrafting.js
 * @plugindesc Provide an easy way to define an item crafting database
 * @version 2.3
 * @author Kun
 * 
 * @help
 * 
 * FUNCTIONS
 * 
 * kun_item_craft( [level]  , [ remove ] , [ exportVar ] )
 *      Craft the current contents and return a boolean value.
 *      Set the leveled crafting matching the specified Level Variable
 *      Force Remove all contents if required. 
 *      Export the crafted item's level into exportVar when required (for xp and skill level ups)
 *  
 * 
 * COMMANDS
 * 
 * KunRecipes:
 *      Dump in console (debugmode) all crafting formulas
 * 
 * KunRecipes open {level} {pricing} [import]:
 *      Display the crafting station menu.
 *      Use a level filter if required or 0 (default) to skip the level check
 *      Set a % pricing over the crafter tem value, or leave to zero if free (no checkout)
 *      Set the import tag if level should be imported from a Game Variable
 * 
 * KunRecipes add [item_id] [import]
 *      Add item_id to the crafting pot
 *      Set the import tag if item_id should be imported from a Game Variable
 * 
 * KunRecipes clear [remove]
 *      Clear the crafting pot
 *      Remove all items from the inventory if requested (crafting failed)
 * 
 * KunRecipes craft [level] [remove] [export_id] [import]
 *      Craft the current items in the pot.
 *      - Apply a level value or 0 (default) to skip level chekc
 *      - Set the remove tag to destroy the items from the inventory
 *      - Export the crafted item ID to the export_id Game Variable
 *      - Set the import tag if level should be imported from a Game Variable
 * 
 * KunRecipes count [exportVar] [levelVar]
 *      Export the crafting pot current item count into the given exportVar variable
 *      Define a filter level to reach the limit, 0 by default
 * 
 * KunRecipes recipes [countVar]
 * KunRecipes display [recipeVar]
 * 
 * 
 * @param debug
 * @text Debug Mode
 * @type boolean
 * @default false
 * 
 * @param recipes
 * @text Recipe Formulas
 * @type struct<Recipe>[]
 * @desc Describe the database of crafting formulas
 * 
 * @param position
 * @text Recipe List Position
 * @type select
 * @option Left
 * @value left
 * @option Right
 * @value right
 * @option Center
 * @value center
 * @desc Where to display the crafting item recipe window
 * @default Center
 * 
 * @param craftingTitle
 * @text Crafting Menu Title
 * @desc Title to display in crafting scene mode
 * @type text
 * @default Crafting
 * 
 * @param successText
 * @text Crafting Success Text
 * @desc Message to display when crafting an intem [Item Message] + [ Generated Item ]
 * @type text
 * @default You've crafted
 * 
 * @param successFx
 * @parent successText
 * @text Success Sound Fx
 * @type file
 * @require 1
 * @dir audio/se/
 * @desc Play sound in crafting success
 * 
 * @param failText
 * @text Crafting Failure Text
 * @desc Message to display on each crafting failure
 * @type text
 * @default You've failed crafting
 * 
 * @param failFx
 * @parent failText
 * @text Failure Sound Fx
 * @type file
 * @require 1
 * @dir audio/se/
 * @desc Play sound in crafting fails
 * 
 * @param nogoldText
 * @text Has no gold to craft text
 * @desc Message to display when not enough gold for crafting
 * @type text
 * @default You have not enough \G
 * 
 * @param purchaseFx
 * @parent nogoldText
 * @text Purchase Sound Fx
 * @type file
 * @require 1
 * @dir audio/se/
 * @desc Play sound when crafting consumes gold
 * 
 * @param levelText
 * @text Not enough level message
 * @desc Message to display when not requierd level
 * @type text
 * @default You've got not enough level...
 */
/*~struct~Recipe:
 * @param item_id
 * @text Item ID
 * @type item
 * @desc Item ID to be crafted
 * 
 * @param amount
 * @text Item Amount
 * @type number
 * @desc Units to be crafted
 * @min 1
 * @default 1
 * 
 * @param level
 * @text Required Level
 * @type number
 * @desc Level match to pass the recipe. 0 by default
 * @min 0
 * @default 0
 * 
 * @param xp
 * @text Reward XP
 * @type number
 * @desc how much xp to give to the party leader
 * @default 0
 * 
 * @param recipe
 * @text Recipe (former version)
 * @type item[]
 * @param formula
 * @text Formula
 * @type item[]
 * @desc Item list to craft the recipe
 */

/**
 * @class {KunCrafting}
 */
class KunCrafting {

    constructor() {
        if (KunCrafting.__instance) {
            return KunCrafting.__instance;
        }

        KunCrafting.__instance = this.initialize();
    }
    /**
     * @returns {KunCrafting}
     */
    initialize() {

        const _parameters = KunCrafting.PluginData();

        this._debug = _parameters.debug;
        this._position = _parameters.position || KunCrafting.Position.Center;
        this._sfx = {
            'success': _parameters.successFx || '',
            'fail': _parameters.failFx || '',
            'add': _parameters.addFx || '',
            'drop': _parameters.dropFx || '',
            'purchase': _parameters.purchaseFx || '',
        };
        this._text = {
            'success': _parameters.successText || '',
            'fail': _parameters.failText || '',
            'nomoney': _parameters.nomoneyText || '',
            'level': _parameters.levelText || '',
            'title': _parameters.craftingTitle || '',
        };

        this._formulas = this.importRecipes(_parameters.recipes);
        this._messages = [];

        //this._container = [];
        //this._window = null;
        this._craftingpot = new KunCraftingPot();
        this._scene = null;

        return this;
    }
    /**
     * @param {Object[]} input 
     * @returns {KunRecipe[]}
     */
    importRecipes(input = []) {
        return input.map(content => {
            const recipe = new KunRecipe(content.item_id, content.amount, content.level, content.xp);
            (content.formula || content.recipe || []).forEach(item => recipe.add(item));
            return recipe;
        });
    };
    /**
     * @returns {KunCraftingPot}
     */
    craftingpot() { return this._craftingpot; }


    /**
     * @returns {Boolean}
     */
    debug() { return this._debug; };
    /**
     * @param {String} type 
     * @returns {String}
     */
    getText(type) {
        return this._text.hasOwnProperty(type) && this._text[type].length > 0 ? this._text[type] : type;
    };
    /**
     * @param {String} message 
     * @returns {KunCrafting}
     */
    addMessage(message) {
        this._messages.push(message);
        return this;
    };
    /**
     * @returns {KunCrafting}
     */
    dispatchMessages() {
        this._messages.forEach(text => this.notify(text));
        this._messages = [];
        return this;
    };

    /**
     * @returns {String}
     */
    position() { this._position; };
    /**
     * @returns {String}
     */
    title() { return this.getText('title'); };
    /**
     * 
     * @param {String} item_name 
     * @param {Number} icon 
     * @param {Number} amount 
     * @returns {KunCrafting}
     */
    display(item_name = '', icon = 0, amount = 1) {
        const _amount = amount > 1 && ` (x${amount})` || '';
        const _icon = icon && `\\I[${icon}]` || '';
        const text = `${_icon}${this._text.success} ${item_name} ${_amount}`;
        //Notify(text);
        return this.addMessage(text);
    };
    /**
     * @param {String} sfx 
     * @returns {Boolean}
     */
    hasMedia(sfx) { return this._sfx.hasOwnProperty(sfx) && this._sfx[sfx].length > 0; };
    /**
     * @param {String} sfx 
     * @returns 
     */
    playMedia(sfx) {
        if (this.hasMedia(sfx)) {
            AudioManager.playSe({ name: this._sfx[sfx], pan: 0, pitch: 100, volume: 100 });
        }
        return this;
    };

    /**
     * @param {Number} level 
     * @returns {KunRecipe[]}
     */
    formulas(level = 0) {
        return level ? this._formulas.filter(recipe => recipe.level() <= level) : this._formulas;
    };
    /**
     * @param {Number} level 
     * @returns {Number}
     */
    count(level = 0) { return this.formulas(level).length; };
    /**
     * @param {Number} recipeid 
     * @returns {KunRecipe}
     */
    formula(recipeid = 0) { return this.formulas()[recipeid % this.count()] || null; };

    /**
     * @returns {String[]}
     */
    dump() {
        return this.formulas().forEach(formula => formula.dump());
    };
    /**
     * @param {Object} item 
     * @param {Number} amount 
     * @param {Boolean} notify
     * @returns {KunCrafting}
     */
    updateInventory(itemid = 0, amount = 0, notify = false) {
        const item = this.itemData(itemid);
        if (item instanceof Object) {
            $gameParty.gainItem(item, amount || 1);
            if (amount > 0 && notify) {
                //only show when craftign
                this.notifyItem(item);
            }
        }
        return this;
    }
    /**
     * @param {Object} item
     * @param {Number} amount 
     * @returns {KunCrafting}
     */
    notifyItem(item = null, amount = 1) {
        if (item instanceof Object) {
            const name = item.name;
            const icon = item.iconIndex || 0;
            const text = amount > 1 ?
                `\\I[${icon}] ${this.getText('success')} ${name} (x${amount})` :
                `\\I[${icon}] ${this.getText('success')} ${name}`;
            return this.addMessage(text);
        }
        return this;
    }
    /**
     * @param {String} message 
     */
    notify(message = '') {
        if (typeof kun_notify === 'function') {
            kun_notify(message);
        }
        else {
            KunCrafting.DebugLog(message);
        }
    };


    /**
     * @param {Number} itemid 
     * @returns {Object}
     */
    itemData(itemid = 0) { return itemid && $dataItems[itemid] || null; }
    /**
     * @param {Number} itemid 
     * @returns {Number}
     */
    itemCount(itemid = 0) {
        const item = this.itemData(itemid);
        return item && $gameParty.numItems(item) || 0;
    }

    /**
     * @param {Number} level 
     * @param {Number} prizing
     */
    static openCrafting(level = 0, prizing = 0) {
        SceneManager.push(Scene_KunCrafting);
        if (SceneManager.isSceneChanging()) {
            SceneManager.prepareNextScene(level || 0, prizing || 0);
        }
    };

    /**
     * @param {String|Object} message 
     */
    static DebugLog() {
        if (KunCrafting.manager().debug()) {
            console.log('[ KunCrafting ]', ...arguments);
        }
    };


    /**
     * @returns {Object}
     */
    static PluginData() {
        function _kunPluginReader(key, value) {
            if (typeof value === 'string' && value.length) {
                try {
                    if (/^\{.*\}$|^\[.*\]$/.test(value)) {
                        return JSON.parse(value, _kunPluginReader);
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
                Object.keys(value).forEach(key => {
                    _output[key] = _kunPluginReader(key, value[key]);
                });
                return _output;
            }
            return value;
        };

        return _kunPluginReader('KunCrafting', PluginManager.parameters('KunCrafting'));
    };


    /**
     * @returns {KunCrafting}
     */
    static manager() {
        return KunCrafting.__instance || new KunCrafting();
    }
}

/**
 * @type {KunCrafting.Position|String}
 */
KunCrafting.Position = {
    Center: 'center',
    Left: 'left',
    Right: 'right',
};

/**
 * 
 */
class KunCraftingPot {
    /**
     * 
     */
    constructor() {
        this._window = null;
    }
    /**
     * @returns {KunCrafting}
     */
    manager() { return KunCrafting.manager() }
    /**
     * @param {Number} item 
     * @returns {Object}
     */
    itemData(item) { return item && $dataItems[item] || null }
    /**
     * @returns {Window_CraftingPot}
     */
    create() {
        if (this._window === null) {
            this._window = new Window_CraftingPot(0, 0);
            SceneManager._scene.addChild(this._window);
        }
        return this._window;
    };
    /**
     * 
     * @returns {Window_CraftingPot}
     */
    container() { return this._window || this.create(); }
    /**
     * @returns {KunCraftingPot}
     */
    close() {
        if (this._window !== null) {
            this._window.close();
            this._window = null;
            //remove from SceneManager._scene.children
        }
        return this;
    }
    /**
     * @returns {Number[] | Object[]}
     */
    items() { return this.container().items() };
    /**
     * @returns {Object[]}
     */
    listItemData() { return this.items().map(item => this.itemData(item)); }
    /**
     * @returns {Number}
     */
    count() { return this.items().length; }

    /**
     * @param {Number} item 
     * @returns {KunCraftingPot}
     */
    add(item = 0) {
        if (item) {
            this.container().addItem(item);
            this.manager().updateInventory(item, -1);
        }
        return this;
    };
    /**
     * @param {Boolean} recover
     * @returns {KunCraftingPot}
     */
    drop(recover = false) {
        if (this.count()) {
            const item = this.container().dropItem();
            recover && this.manager().updateInventory(item);
            console.log(item, recover);
        }
        return this;
    };
    /**
     * @param {Number[]} ingredients 
     * @param {Number} level 
     * @returns {KunRecipe}
     */
    match(ingredients = [], level = 0) {
        return this.manager().formulas(level || 0).find(formula => formula.match(ingredients)) || null
    }
    /**
     * @param {Number} level 0 if not requierd
     * @param {Boolean} remove 
     * @returns {Number} Returned Item Id
     */
    craft(level = 0, remove = false) {
        if (this.count()) {
            const formula = this.match(this.items(), level);
            if (formula && formula.craft(true)) {
                return this.clearQuit(true);
            }
            this.clearQuit(remove);
            this.manager().playMedia('fail');
        }
        return 0;
    };
    /**
     * @param {Boolean} remove
     * @returns {KunCraftingPot}
     */
    cleanRecipe(remove = false) {
        this.listItemData().forEach(item => {
            if (item && (!remove || !item.consumable)) {
                //restore item to the inventory
                this.manager().updateInventory(item.id);
            }
        });
        this.manager().dispatchMessages();
        return this;
    };
    /**
     * 
     * @param {Boolean} remove 
     * @returns {KunCraftingPot}
     */
    clearQuit(remove = false) {
        return this.cleanRecipe(remove).close();
    }
}



/**
 * @param {Number} item_id 
 * @class {KunRecipe}
 */
class KunRecipe {
    /**
     * @param {Number} item_id 
     * @param {Number} amount 
     * @param {Number} level 
     * @param {Number} xp
     */
    constructor(item_id = 0, amount = 0, level = 0, xp = 0) {

        this._itemId = item_id;
        this._amount = amount || 1;
        this._level = level || 0;
        this._exp = xp || 0;
        this._list = [];

        this.add = function (item_id) {
            this._list.push(item_id);
            return this;
        };
    }
    /**
     * @returns {KunCrafting}
     */
    manager() { return KunCrafting.manager(); }
    /**
     * @param {Number} item 
     * @returns {Object} {ItemData}
     */
    itemData(item = 0) { return item && $dataItems[item] || null; }
    /**
     * @param {Number} itemid 
     * @returns {Number}
     */
    itemCount(itemid) {
        return this.manager().itemCount(itemid);
    }
    /**
     * @returns {Object}
     */
    requiredItems() {
        const amount = {};
        this.list().forEach(item_id => {
            amount[item_id] = (amount[item_id] || 0) + 1
        });
        return amount;
    }
    /**
     * @returns {Object}
     */
    ownedItems() {
        const inventory = {};
        this.list().forEach(item => {
            if (!inventory[item]) {
                inventory[item] = this.itemCount(item);
            }
        });
        return inventory;
    }

    /**
     * @param {Number[]} list
     * @returns {Boolean}
     */
    match(list = []) {
        const input = list.sort();
        const recipe = this.list().sort();
        if (input.length === recipe.length) {
            for (var i in recipe) {
                if (recipe[i] !== input[i]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    /**
     * @param {Number} level
     * @returns {Boolean}
     */
    //matchLevel(level = 0) { return level >= this.level(); }
    /**
     * @returns {Number}
     */
    level() { return this._level; }
    /**
     * @returns {Number}
     */
    exp() { return this._exp; }
    /**
     * @returns {Number}[]
     */
    list() { return this._list; }
    /**
     * @returns {Number[]}
     */
    listIcons() { return this.list().map(item => this.manager().itemData(item)).map(item => item && item.iconIndex || 0); }
    /**
     * @returns {Object}
     */
    listItems() { return this.list().map(item => this.manager().itemData(item)); }
    /**
     * @returns {Number}
     */
    itemId() { return this._itemId; }
    /**
     * @returns {Object}
     */
    getItem() { return this.manager().itemData(this._itemId); }
    /**
     * @returns {Number}
     */
    getPrice() {
        const item = this.getItem();
        return item && item.price || 0;
    }
    /**
     * @returns {Number}
     */
    amount() { return this._amount; }
    /**
     * @returns {Boolean}
     */
    hasItems() {
        const required = this.requiredItems();
        const owned = this.ownedItems();
        return Object.keys(required).every(item => owned[item] >= required[item]);
        const checkout = Object.keys(required).map(item => owned[item] >= required[item]);
        return !checkout.filter(ready => !ready).length;

        const amount = this.requiredItems();
        const keys = Object.keys(amount);
        for (var i = 0; i < keys.length; i++) {
            const item_id = parseInt(keys[i]);
            if (this.itemCount(item_id) < amount[item_id]) {
                return false;
            }
        }
        return true;
    }
    /**
     * @param {Boolean} notify
     * @returns {Boolean}
     */
    craft(notify = false) {
        if (this.hasItems()) {
            const manager = this.manager();
            const amounts = this.requiredItems();
            //const owned = this.ownedItems();
            Object.keys(amounts).forEach(item => {
                const amount = amounts[item] || 0;
                amount && manager.updateInventory(item, -amount);
            });
            manager.updateInventory(this.itemId(), this.amount(), notify);
            return true;
        }

        return false;
    }

    /**
     * @param {Boolean} showicon
     * @returns {Object|Boolean}
     */
    dump(showicon = false) {

        const item = this.getItem();
        const list = [];

        if (item !== false) {
            this._list.forEach(id => {
                const ingredient = this.manager().itemData(id);
                if (ingredient) {
                    list.push(showicon ? `\\I[${ingredient.iconIndex}]` : ingredient.name);
                }
            });
            return (showicon ? `\\I[${item.iconIndex}]\\{${item.name}\\}` : `\\{${item.name}\\}`)
                + (this._level > 0 ? ` \\C[8](level ${this._level})\\C[0]` : '')
                + '\n    ' + item.description
                + (this._amount > 1 ? ' x' + this._amount : '')
                + "\n    \\C[8]Ingredients:\\C[0] " + list.join('');
        }
        return '';
    };
}



/**
 * 
 */
function KunCrafting_SetupEscapeChars() {
    const _KunCrafting_EscapeChars = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        //parse first the vanilla strings
        const parsed = _KunCrafting_EscapeChars.call(this, text);
        //include item names here
        return parsed.replace(/\x1bRECIPE\[(\d+)\]/gi, function () {
            //get item by id
            const recipe_id = parseInt(arguments[1]);
            if (typeof recipe_id === 'number') {
                return this.displayKunRecipe(recipe_id);
            }
        }.bind(this));

        //return parsed;
    }
    /**
     * @param {Number} recipe_id 
     * @returns {String}
     */
    Window_Base.prototype.displayKunRecipe = function (recipe_id) {
        const recipe = KunCrafting.manager().formula(recipe_id);
        return recipe && recipe.dump() || '[INVALID_RECIPE_ID ' + recipe_id + ']';
    };
}


/**
 * 
 */
function KunCrafting_SetupCommands() {
    const _KunCrafting_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunCrafting_pluginCommand.call(this, command, args);
        if (KunCraftingCommand.command(command)) {
            KunCraftingCommand.create(this, args).run();
        }
    };
}


/**
 * @class {KunCraftingCommand}
 */
class KunCraftingCommand {
    /**
     * @param {String[]} input 
     * @param {Game_Interpreter} context
     */
    constructor(input = [], context = null) {
        this._context = context instanceof Game_Interpreter && context || null;
        this.initialize(input);
        KunCrafting.DebugLog(this);
    }
    /**
     * @param {String} command 
     * @returns {Boolean}
     */
    static command(command = '') {
        return ['kunrecipes', 'kunrecipe'].includes(command.toLowerCase());
    }
    /**
     * @param {Game_Interpreter} context 
     * @param {String[]} input 
     * @returns {KunCraftingCommand}
     */
    static create(context = null, input = []) {
        return context instanceof Game_Interpreter ? new KunCraftingCommand(input, context) : null;
    }
    /**
     * @param {String[]} input 
     * @returns {KunCraftingCommand}
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
     * @returns {KunCrafting}
     */
    manager() { return KunCrafting.manager(); }
    /**
     * @returns {KunCraftingPot}
     */
    crafting() { return this.manager().craftingpot(); }
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
     * @param {String[]} args 
     * @returns {Boolean}
     */
    defaultCommand(args = []) {
        KunCrafting.DebugLog(`Invalid command ${this.command()} ${args.join(' ')}`);
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    openCommand(args = []) {
        const level = args[0] && parseInt(args[0]) || 0;
        const pricing = args[1] && parseInt(args[1]) || 0;
        KunCrafting.openCrafting(
            this.has('import') && level ? $gameVariables.value(level) : level,
            pricing
        );
        return true;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    addCommand(args = []) {
        const item_id = args[0] && parseInt(args[0]) || 0;
        if (item_id) {
            this.crafting().add(this.has('import') && $gameVariables.value(item_id) || item_id);
            return true;
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    dropCommand(args = []) {
        this.crafting().drop();
        return true;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    craftCommand(args = []) {
        const pot = this.crafting();
        const level = args[0] && parseInt(args[0]) || 0;
        const exportvar = args.length > 1 ? parseInt(args[1]) : 0;
        const crafted_id = pot.craft(
            this.has('import') && $gameVariables.value(level) || level,
            this.has('remove')
        );
        if (exportvar) {
            $gameVariables.setValue(exportvar, crafted_id);
        }
        return true;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    clearCommand(args = []) {
        this.crafting().cleanRecipe(this.has('remove'));
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    countCommand(args = []) {
        if (args.length) {
            $gameVariables.setValue(parseInt(args[0]), this.crafting().count());
            return true;
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    recipesCommand(args = []) {
        return this.countCommand(args);
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    displayCommand(args = []) {
        if (args.length) {
            const recipe = this.manager().formula($gameVariables.value(parseInt(args[0])));
            if (recipe) {
                //$gameMessage.setBackgroundType(1);
                //$gameMessage.setPositionType(1);
                $gameMessage.add(recipe.dump(true));
                return true;
            }
        }
        return false;
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////
////    Window_Crafting : Window_Base
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class {Window_Crafring}
 */
class Window_CraftingPot extends Window_Base {
    /**
     * 
     */
    constructor() {
        super();
        this.initialize(arguments);
    }
    /**
     * 
     */
    initialize() {

        const x = Window_Base._iconWidth;
        const y = this.posY();
        const width = this.displayWidth();
        const height = this.displayHeight();

        super.initialize(0, 0, 0, 0);

        this.initMembers();
        this.setBackgroundType(this._background);

        this.reset();
    }
    /**
     * 
     */
    initMembers() {
        this._positionType = 2;
        this._waitCount = 0;
        this._background = 0;
        this._positionLayout = KunCrafting.manager().position();
    }
    /**
     * 
     */
    reset() { this._items = []; }
    /**
     * @returns {Number[]}
     */
    items() { return this._items || []; }
    /**
     * @returns {Number[]|Object[]}
     */
    icons() { return this.items().map(item => $dataItems[item] && $dataItems[item].iconIndex || 0); }
    /**
     * @returns {Number}
     */
    count() { return this.items().length; }
    /**
     * @returns {Number}
     */
    slots() { return this.count() || 1; }
    /**
     * @returns {Number}
     */
    posX() {
        switch (this._positionLayout) {
            case KunCrafting.Position.Left:
                return this.padding;
            case KunCrafting.Position.Right:
                return Graphics.boxWidth - this.displayWidth() - this.padding;
            case KunCrafting.Position.Center:
            default:
                return Graphics.boxWidth / 2 - (this.displayWidth() / 2);
        }
    }
    /**
     * @returns {Number}
     */
    posY() { return Graphics.boxHeight - this.displayHeight() - this.padding; }
    /**
     * @returns {Number}
     */
    displayWidth() {
        return Window_Base._iconWidth * this.slots() + (this.padding * 2);
        //return Window_Base._iconWidth * (this._items.length > 0 ? this._items.length : 1) + (this.padding * 2);
    }
    /**
     * @returns {Number}
     */
    displayHeight() {
        return Window_Base._iconHeight + (this.padding * 2);
    }
    renderWindow() {
        this.width = this.displayWidth();
        this.height = this.displayHeight();
        this.x = this.posX();
        this.y = this.posY();
        this.createContents();
        //console.log( this.width + ':' + this.height + ':' + this.x + ':' + this.y );
    }
    /**
     * 
     */
    drawContent() {
        this.renderWindow();
        this.icons().forEach((icon, i) => {
            this.drawIcon(icon, i * Window_Base._iconWidth, 0);
        });
    }
    /**
     * @param {Number} itemid 
     */
    addItem(itemid = 0) {
        itemid && this.items().push(itemid);
        this.drawContent();
    }
    /**
     * @returns {Number}
     */
    dropItem() {
        if (this.count()) {
            const item = this.items().pop();
            this.drawContent();
            return item;
        }
        return 0;
    }
}



///////////////////////////////////////////////////////////////////////////////////////////////////
////    Window_CraftingItems : Window_Selectable
///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class {Window_CraftingItems}
 */
class Window_CraftingItems extends Window_Selectable {
    /**
     * 
     */
    constructor() {
        super(...arguments);
    }
    /**
     * @param {Number} level
     * @param {Number} pricing
     */
    initialize(level = 0, pricing = 0) {
        super.initialize(0, this.windowOffset(), this.windowWidth(), this.windowHeight());
        this._helpWindow = null;
        this._level = level || 0;
        this._pricing = pricing || 0;
        console.log(this, level, pricing);
        this.refresh();
    }
    /**
     * @returns {Number}
     */
    windowWidth() { return Graphics.boxWidth / 3; }
    /**
     * @returns {Number}
     */
    windowHeight() { return Graphics.boxHeight - this.windowOffset(); }
    /**
     * @returns {Number}
     */
    windowOffset() { return (Window_Base._iconHeight + (this.standardPadding() * 2)); }
    /**
     * @param {Window_CraftingFormula} helpWindow 
     */
    setHelpWindow(helpWindow = null) {
        if (helpWindow instanceof Window_CraftingFormula) {
            super.setHelpWindow(helpWindow);
            this._helpWindow.setPricing(this._pricing);
        }
    }

    /**
     * @returns {KunRecipe[]}
     */
    formulas() { return KunCrafting.manager().formulas(this._level); }
    /**
     * @returns {Number}
     */
    maxCols() { return 1; }
    /**
     * @returns {Number}
     */
    maxItems() { return this.formulas().length; }
    /**
     * @returns {Number}
     */
    spacing() { return 32; }
    /**
     * @returns {Number}
     */
    standardFontSize() { return 20; }
    /**
     * @param {Number} index 
     */
    select(index = 0) {
        if (this.contents) {
            this.contents.clear();
        }
        super.select(index);
        this.setHelpWindowItem(this.getItem(this.index()));
        this.callUpdateHelp();
        this.callHandler('select');
    }
    /**
     * @param {Number} index
     * @returns {KunRecipe}
     */
    getItem(index = 0) {
        const formulas = this.formulas();
        return formulas[index % formulas.length] || null;
    }
    /**
     * @param {String} name
     * @param {Number} iconIndex
     * @param {Number} amount
     * @returns {String}
     */
    displayItem(name = '', iconIndex = 0, amount = 0) {
        const text = iconIndex && `\\I[${iconIndex}] ${name}` || name;
        return amount > 1 && `${text} x${amount}` || text;
    }
    /**
     * @description Render Item in the list by its list order
     * @param {Number} index
     */
    drawItem(index = 0) {
        const formula = this.getItem(index);
        const item = formula && formula.getItem() || null;
        if (item) {
            const rect = this.itemRect(index);
            rect.width -= this.textPadding();
            this.drawTextEx(this.displayItem(item.name, item.iconIndex, formula.amount()), rect.x, rect.y, rect.width);
        }
    }
    processOk() {
        if (this.isCurrentItemEnabled()) {
            //this.playOkSound();
            this.updateInputData();
            this.deactivate();
            this.callOkHandler();
        }
    }
    playOkSound() { KunCrafting.manager().playMedia('success'); }
    update() {
        super.update();
        this.refresh();
    }
    refresh() {
        this.drawAllItems();
        this.setHelpWindowItem(this.getItem(this.index()));
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////
////    Window_CraftingHeader : Window_Base
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class {Window_CraftingHeader}
 */
class Window_CraftingHeader extends Window_Base {
    /**
     * 
     */
    constructor() {
        super();
    }
    /**
     * @returns {KunCrafting}
     */
    manager() { return KunCrafting.manager(); }
    /**
     * 
     */
    initialize() {
        super.initialize(0, 0, this.windowWidth(), this.windowHeight());
        this._callItems = () => [];
        this.setBackgroundType(0);
        this.display();
    }
    display() {
        this.createContents();
        this.drawTextEx(this.manager().title(), -2, -2, this.contentsWidth());
        this.drawText(this.count() + ' recipes', 0, -2, this.contentsWidth(), 'right');
    }
    /**
     * @returns {Number}
     */
    posX() {
        switch (this.manager().position()) {
            case KunCrafting.Position.Right:
                return this.windowWidth();
            case KunCrafting.Position.Center:
                return (Graphics.boxWidth / 2) - (this.windowWidth() / 2);
            case KunCrafting.Position.Left:
            default:
                return 0;
        }
    }
    /**
     * @returns {Number}
     */
    windowWidth() {
        return Graphics.boxWidth;
        return Graphics.boxWidth / 2;
    }
    /**
     * @returns {Number}
     */
    windowHeight() {
        return Window_Base._iconHeight + (this.standardPadding() * 2);
    }
    /**
     * @returns {Window_CraftingHeader}
     */
    bindList(list = []) {
        this._callItems = () => Array.isArray(list) && list || [];
        this.display();
        return this;
    }
    /**
     * @returns {Number}
     */
    count() {
        var items = this._callItems();
        return items.length;
    }
    /**
     * @returns {Number}
     */
    standardFontSize() { return 24; }
}


///////////////////////////////////////////////////////////////////////////////////////////////////
////    Window_CraftingFormula : Window_Base
///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class {Window_CraftingFormula}
 */
class Window_CraftingFormula extends Window_Base {
    /**
     * 
     */
    constructor() {
        super();
        //this.initialize(arguments);
        this._formula = null;
        this._pricing = 0;
    }
    /**
     * 
     */
    initialize() {
        super.initialize(this.posX(), this.posY(), this.windowWidth(), this.windowHeight());
        this.setBackgroundType(0);
    }
    /**
     * @returns {KunCrafting}
     */
    manager() { return KunCrafting.manager(); }
    /**
     * @returns {KunRecipe}
     */
    formula() { return this._formula; }
    /**
     * @returns {Number}
     */
    posY() { return Window_Base._iconHeight + (this.standardPadding() * 2); }

    /**
     * @returns {Number}
     */
    standardFontSize() { return 22; }

    /**
     * @returns {Boolean}
     */
    hasPrice() { return !!this._pricing; }
    /**
     * @returns {Number}
     */
    posX() { return Graphics.boxWidth / 3; }
    /**
     * @returns {Number}
     */
    windowWidth() { return Graphics.boxWidth / 3 * 2; }
    /**
     * @returns {Number}
     */
    windowHeight() {
        return Graphics.boxHeight - this.posY();
    }
    /**
     * @param {KunRecipe} formula
     */
    setItem(formula = null) {
        //console.log( formula );
        if (formula instanceof KunRecipe) {
            this._formula = formula;
            this.refresh();
        }
    }
    /**
     * @param {Number} pricing 
     * @returns {Window_CraftingFormula}
     */
    setPricing(pricing = 0) {
        this._pricing = pricing || 0;
        return this;
    }

    /**
     * @param {Number} position 
     */
    drawSeparator(position = 0) {
        this.contents.paintOpacity = 64;
        this.contents.fillRect(0,
            position + this.lineHeight() / 2 - 1,
            this.contentsWidth(), 2,
            this.normalColor());
        this.contents.paintOpacity = 255;
    }
    /**
     * @param {KunRecipe} formula 
     */
    drawHeader(formula) {
        const itemData = formula.getItem();
        this.drawIcon(itemData.iconIndex, 0, 0);
        this.drawText(itemData.name + ' x' + formula.amount(), 32, 0, this.contentsWidth());
    }
    drawLevel(level = 0) {
        if (level) {
            this.changeTextColor(this.systemColor());
            this.drawText('Level ' + level, 0,
                this.hasPrice() && this.lineHeight() || 0,
                this.contentsWidth(), 'right');
        }
    }
    /**
     * @param {Number} price 
     */
    drawPrice(price = 0) {
        if (this._pricing) {
            console.log(price);
            const cost = Math.floor(price * this._pricing / 100);
            this.changeTextColor(this.textColor(14));
            this.drawText(cost + " \G", 0, 0, this.contentsWidth(), 'right');
            this.changeTextColor(this.normalColor());
        }
    }
    /**
     * @param {KunRecipe} formula 
     */
    drawDescription(formula) {
        const itemData = formula.getItem();
        //var itemText = itemData.description + (itemData.note.length > 0 ? "." + itemData.note : '');
        const itemText = itemData.description;
        const desc = this.formatDescription(itemText, 40);
        this.changeTextColor(this.normalColor());
        for (var i = 0; i < desc.length; i++) {
            this.drawText(desc[i], 0, i * this.lineHeight() + (this.lineHeight() * 2), this.contentsWidth());
        }
    }
    /**
     * @param {KunRecipe} formula 
     */
    drawIngredients(formula) {

        const summary = formula.requiredItems();
        const ingredients = Object.keys(summary);
        const baseline = this.contentsHeight() - ingredients.length * this.lineHeight();
        for (var i = 0; i < ingredients.length; i++) {
            const recipeData = this.manager().itemData(ingredients[i]);
            const available = this.manager().itemCount(ingredients[i]);
            const amount = summary[ingredients[i]];
            const position = baseline + this.lineHeight() * i;

            this.changeTextColor(this.textColor(amount > available && 7 || 0));
            this.drawIcon(recipeData.iconIndex, 0, position + 4);
            this.drawText(recipeData.name, 38, position, this.contentsWidth());
            this.drawText('x' + amount, 0, position, this.contentsWidth(), 'right');
            this.changeTextColor(this.normalColor());
        }
    }
    /**
     * @param {String} input
     * @param {Number} lineLength
     * @returns
     */
    formatDescription(input, lineLength) {
        var output = [];
        input.split('.').forEach(function (paragraph) {
            paragraph.split(' ').forEach(function (word) {
                if (output.length) {
                    if (output[output.length - 1].length + word.length + 1 < lineLength) {
                        output[output.length - 1] += output[output.length - 1].length ? ' ' + word : word;
                    }
                    else {
                        output.push(word);
                    }
                }
                else {
                    output.push(word);
                }
            });
        });
        return output;
    }
    clear() {
        if (this.contents) {
            this.contents.clear();
            this.refresh();
        }
    }
    /**
     * 
     */
    refresh() {
        const formula = this.formula();
        if (formula) {
            this.drawHeader(formula);
            this.drawLevel(formula.level());
            this.drawPrice(formula.getPrice() * formula.amount());
            this.drawSeparator(this.lineHeight() / 2);
            this.drawDescription(formula);
            this.drawIngredients(formula);
        }
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////
// class Scene_KunCrafting extends Scene_ItemBase {
///////////////////////////////////////////////////////////////////////////////////////////////////
class Scene_KunCrafting extends Scene_ItemBase {
    /**
     * 
     */
    constructor() {
        super();
    }
    /**
     * 
     */
    initialize() {
        super.initialize();
        this._level = 0;
        this._pricing = 0;
        //Scene_ItemBase.prototype.initialize.call(this);
    }
    create() {
        super.create();
        //Scene_ItemBase.prototype.create.call(this);
        this.createHeaderWindow();
        this.createItemWindow();
        this.createFormulaWindow();
    }
    /**
     * @param {Number} level 
     * @param {Number} prizing
     */
    prepare(level = 0, prizing = 0) {
        this._level = level || 0;
        this._pricing = prizing || 0;
    }
    /**
     * @returns {KunRecipe}
     */
    selectedItem() {
        return this._craftingMenu && this._craftingMenu.getItem(this._craftingMenu.index()) || null;
    }
    /**
     * @returns {KunCrafting}
     */
    manager() { return KunCrafting.manager(); }

    createHeaderWindow() {

        this._craftingHeader = new Window_CraftingHeader();
        this.addWindow(this._craftingHeader);
    }

    createFormulaWindow() {
        this._craftingFormula = new Window_CraftingFormula();
        this.addWindow(this._craftingFormula);
        this._craftingMenu.setHelpWindow(this._craftingFormula);
    }

    createItemWindow() {
        this._craftingMenu = new Window_CraftingItems(this._level, this._pricing);
        //this._craftingMenu.setLevel(this._level,this._prizing );
        this._craftingMenu.setHandler('ok', this.onCraftFormula.bind(this));
        this._craftingMenu.setHandler('cancel', this.onQuit.bind(this));
        this._craftingMenu.activate();
        this.addWindow(this._craftingMenu);

        this._craftingHeader.bindList(this._craftingMenu.formulas());
    }
    /**
     * @param {Number} price 
     * @returns {Number}
     */
    formulaPrice(price = 0) { return Math.floor(this._pricing / 100 * price); }
    /**
     * @param {Number} amount 
     * @returns {Boolean}
     */
    checkout(amount = 0) { return !amount || $gameParty.gold() >= amount; }
    /**
     * 
     * @returns 
     */
    onCraftFormula() {
        this._craftingMenu.activate();
        const manager = this.manager();
        const formula = this.selectedItem();
        if (formula) {
            if (formula.hasItems()) {
                //apply the price amount fee
                const amount = this.formulaPrice(formula.getPrice() * formula.amount());
                if (!this.checkout(amount)) {
                    manager.playMedia('fail').addMessage(manager.getText('nogold'));
                    return false;
                }
                if (formula.craft()) {
                    if (amount) {
                        $gameParty.loseGold(amount);
                        manager.playMedia('purchase');
                    }
                    else {
                        manager.playMedia('success');
                    }
                    return true;
                }
            }
        }
        SoundManager.playBuzzer();
        return false;
    }
    /**
     * @returns {Scene_KunCrafting}
     */
    /*dispatchMessages() {
        window.setTimeout(function () {
            KunCrafting.manager().dispatchMessages();
        }, 600);
        return this;
    }*/
    onQuit() {
        this._craftingMenu.deactivate();
        this._craftingMenu.deselect();
        this._craftingMenu.close();
        this._craftingFormula.close();
        this._craftingHeader.close();
        this.popScene();
    }
}








///////////////////////////////////////////////////////////////////////////////////////////////////
// PLUGIN INITIALIZER
///////////////////////////////////////////////////////////////////////////////////////////////////

(function ( /* autosetup */) {

    KunCrafting.manager();

    KunCrafting_SetupCommands();

})(/* autorun */);