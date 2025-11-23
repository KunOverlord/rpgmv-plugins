//=============================================================================
// KunItemCrafting.js
//=============================================================================
/*:
 * @filename KunItemCrafting.js
 * @plugindesc Provide an easy way to define an item crafting database
 * @version 1.8
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
 * KunRecipes open [level] [import]:
 *      Display the crafting station menu.
 *      Use a level filter if required or 0 (default) to skip the level check
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
 * @param levelText
 * @text Not enough level message
 * @desc Message to display when not requierd level
 * @type text
 * @default You've got not enough level...
 * 
 * @param debug
 * @text Debug Mode
 * @type Boolean
 * @default false
 * 
 * 
 */
/*~struct~Recipe:
 * @param item_id
 * @text Item ID
 * @type Item
 * @desc Item ID to be crafted
 * 
 * @param amount
 * @text Item Amount
 * @type Number
 * @desc Units to be crafted
 * @min 1
 * @default 1
 * 
 * @param level
 * @text Required Level
 * @type Number
 * @desc Level match to pass the recipe. 0 by default
 * @min 0
 * @default 0
 * 
 * @param recipe
 * @text Recipe
 * @type Item[]
 * @desc Item list to craft the recipe
 * 
 *
 */

/**
 * @description KUN Modules
 * @type KUN
 */
//var KUN = KUN || {};


function KunItemCrafting() {
    throw `${this.constructor.name} is a Static Class`;
}
/**
 * @returns Object
 */
KunItemCrafting.importParameters = function () {
    return PluginManager.parameters('KunItemCrafting');
};

/**
 * Kun Drop Generator Collection
 */
KunItemCrafting.Initialize = function () {

    //var parameters = this.importParameters();
    var parameters = this.PluginData();

    this._debug = parameters.debug;
    this._position = parameters.position || KunItemCrafting.Position.Center;
    this._sfx = {
        'success': parameters.successFx || '',
        'fail': parameters.failFx || '',
        'add': parameters.addFx || '',
        'drop': parameters.dropFx || '',
    };
    this._text = {
        'success': parameters.successText || '',
        'fail': parameters.failText || '',
        'level': parameters.levelText || '',
        'title': parameters.craftingTitle || '',
    };

    this._level = 0;
    this._window = null;
    this._scene = null;

    this._recipes = [];
    this._messages = [];
    this._container = [];

    return this.importRecipes( parameters.recipes );
};
/**
 * @returns Boolean
 */
KunItemCrafting.debug = function () {
    return this._debug;
};
/**
 * @param {String} type 
 * @returns String
 */
KunItemCrafting.getText = function (type) {
    return this._text.hasOwnProperty(type) && this._text[type].length > 0 ? this._text[type] : type;
};
/**
 * @param {String} message 
 * @returns KunItemCrafting
 */
KunItemCrafting.addMessage = function (message) {
    this._messages.push(message);
    return this;
};
/**
 * @returns KunItemCrafting
 */
KunItemCrafting.dispatchMessages = function () {
    this._messages.forEach(function (text) {
        KunItemCrafting.Notify(text);
    });
    this._messages = [];
    return this;
};
/**
 * @returns String
 */
KunItemCrafting.position = function () {
    return this._position;
};
/**
 * @returns Boolean
 */
KunItemCrafting.setLevelFilter = function (level) {
    this._level = typeof level === 'number' && level > 0 ? level : 0;
    return this;
};
/**
 * Replace the levelVar by a straight level input formthe commands
 * @returns Number
 */
KunItemCrafting.level = function () {
    return this._level;
};
/**
 * @returns String
 */
KunItemCrafting.title = function () {
    return this.getText('title');
};
/**
 * 
 * @param {String} item_name 
 * @param {Number} icon 
 * @param {Number} amount 
 * @returns KunItemCrafting
 */
KunItemCrafting.display = function (item_name, icon, amount) {

    var text = this._text.success + ' ' + item_name;

    if (typeof amount === 'number' && amount > 1) {
        text += ' (x' + amount + ')';
    }

    if (typeof icon === 'number' && icon > 0) {
        text = "\\I[" + icon + "] " + text;
    }

    //KunItemCrafting.Notify(text);
    return this.addMessage(text);
};
/**
 * @param {String} sfx 
 * @returns Boolean
 */
KunItemCrafting.hasMedia = function (sfx) {
    return this._sfx.hasOwnProperty(sfx) && this._sfx[sfx].length > 0;
};
/**
 * @param {String} sfx 
 * @returns 
 */
KunItemCrafting.playMedia = function (sfx) {
    if (this.hasMedia(sfx)) {
        AudioManager.playSe({ name: this._sfx[sfx], pan: 0, pitch: 100, volume: 100 });
    }
    return this;
};
/**
 * @returns KunItemCrafting
 */
KunItemCrafting.displayWindow = function (showMenu) {
    if (this._window === null) {
        this._window = new Window_Crafting(0, 0);
        SceneManager._scene.addChild(this._window);
    }
    return this._window;
};
/**
 * @returns KunItemCrafting
 */
KunItemCrafting.closeWindow = function () {
    if (this._window !== null) {
        this._window.close();
        this._window = null;
    }
    return this.dispatchMessages();
}
/**
 * @param {Number} level 
 */
KunItemCrafting.openCraftingScene = function (level) {

    this.setLevelFilter(level || 0);

    SceneManager.push(Scene_Crafting);
};
/**
 * @param {Number} item_id 
 * @param {Array} recipe 
 * @returns 
 */
KunItemCrafting.createRecipe = function (recipe) {
    if (recipe instanceof KunRecipe) {
        this._recipes.push(recipe);
    }
    return this;
};
/**
 * @param {Boolean} remove
 * @returns KunItemCrafting
 */
KunItemCrafting.cleanRecipe = function (remove) {

    remove = typeof remove === 'boolean' && remove;

    this._container.forEach(function (item_id) {
        var item = KunItemCrafting.importItemData(item_id);
        //restore item to the inventory
        if (item !== false) {
            if (!remove || !item.consumable) {
                KunItemCrafting.addItem(item, 1);
            }
        }
    });

    this._container = [];

    return this.closeWindow();
};
KunItemCrafting.formulas = function( level ){
    return typeof level === 'number' && level > 0 ? this._recipes.filter( recipe => recipe.level() <= level ) : this._recipes;
};
/**
 * @param {Number} level 
 * @returns Number
 */
KunItemCrafting.count = function (level) {
    return this.formulas(level).length;
};
/**
 * @param {Number} recipe_id 
 * @returns KunRecipe | boolean
 */
KunItemCrafting.getRecipe = function (recipe_id) {
    if (recipe_id >= 0 && recipe_id < this._recipes.length) {
        return this._recipes[recipe_id];
    }
    return false;
};
/**
 * @returns Number
 */
KunItemCrafting.container = function () {
    return this._container;
};
/**
 * @param {Number} level 0 if not requierd
 * @param {Boolean} remove 
 * @returns Number Returned Item Id
 */
KunItemCrafting.craft = function (level, remove) {
    level = typeof level === 'number' && level > 0 ? level : 0;
    if (this._container.length > 0) {
        for (var i in this._recipes) {
            if (this._recipes[i].matchFormula(this._container)) {
                var formula = this._recipes[i];
                var item = formula.getItem();
                var amount = formula.amount();
                if (level > 0 && level < formula.level()) {
                    //do not match the level
                    KunItemCrafting.Notify(this._text.level + ' ' + item.name + (amount > 1 ? ' x' + amount : ''));
                    break;
                }
                if (item !== false) {
                    KunItemCrafting.addItem(item, formula.amount(), true);
                    this.cleanRecipe(true);
                    return formula.itemId();
                }
                else {
                    KunItemCrafting.DebugLog(`Invalid Item Id [${formula.itemId()}]`);
                    break;
                }
            }
        }
        this.cleanRecipe(remove).playMedia('fail');
    }
    return 0;
};
/**
 * @param {Number} item_id 
 * @returns KunItemCrafting
 */
KunItemCrafting.add = function (item_id) {
    //console.log( `Item Id ${item_id}`);
    var item = KunItemCrafting.importItemData(item_id);

    if (item !== false) {
        KunItemCrafting.addItem(item, -1);
        this._container.push(item_id);

        this.displayWindow().addItem(item.iconIndex);
    }

    return this;
};
/**
 * @returns KunItemCrafting
 */
KunItemCrafting.drop = function () {
    if (this._container.length > 0) {
        var item_id = this._container.pop();
        var item = KunItemCrafting.importItemData(item_id);
        if (item !== false) {
            KunItemCrafting.addItem(item, 1);
            this.displayWindow().dropItem();
        }
    }
    return this;
};
/**
 * @returns Array
 */
KunItemCrafting.dump = function () {
    var output = "RECIPES:\n";
    this._recipes.forEach(function (formula) {
        var recipe = formula.dump();
        if (recipe.length > 0) {
            output += "\n" + recipe;
        }
    });

    return output;
};
/**
 * 
 */
KunItemCrafting.Position = {
    'Center': 'center',
    'Left': 'left',
    'Right': 'right',
};

/**
 * @param {Number} item_id 
 * @returns Object
 */
KunItemCrafting.importItemData = (item_id) => item_id > 0 ? $dataItems[item_id] : false;
/**
 * @param {Number} item_id 
 * @returns Number
 */
KunItemCrafting.importItemCount = function (item_id) {
    if (item_id) {
        var item = KunItemCrafting.importItemData(item_id);
        return item !== false ? $gameParty.numItems(item) : 0;
    }
    return 0;
};

/**
 * 
 * @param {Game_Item} item 
 * @param {Number} amount 
 * @param {Boolean} notify 
 */
KunItemCrafting.addItem = function (item, amount, notify) {
    if (item !== null) {
        $gameParty.gainItem(item, typeof amount === 'number' ? amount : 1, false, true);
        if (amount > 0 && typeof notify === 'boolean' && notify) {
            var text = `\\I[${item.iconIndex}] ${this.getText('success')} ${item.name}`;
            if (typeof amount === 'number' && amount > 1) {
                text += ` (x${amount})`;
            }
            this.addMessage(text);
        }
    }
};
/**
 * @param {Object[]} recipes 
 * @returns Array
 */
KunItemCrafting.importRecipes = function (recipes) {
    (Array.isArray(recipes) ? recipes : []).forEach(function (formula) {
        var recipe = new KunRecipe( formula.item_id, formula.amount, formula.level);

        (Array.isArray(formula.recipe) ? formula.recipe : [] ).forEach(function (item) {
            recipe.add(item);
        });

        KunItemCrafting.createRecipe(recipe);
    });
    return this;
};
/**
 * @param {String} message 
 */
KunItemCrafting.Notify = function (message) {
    if (typeof kun_notify === 'function') {
        kun_notify(message);
    }
    else {
        KunItemCrafting.DebugLog(message);
    }
};
/**
 * @param {String|Object} message 
 */
KunItemCrafting.DebugLog = function (message) {
    if (KunItemCrafting.debug()) {
        console.log(typeof message !== 'object' ? '[ KunItemCrafting ] : ' + message : message);
    }
};

/**
 * @returns Object
 */
KunItemCrafting.PluginData = function () {
    function _parsePluginData ( key , value ) {
        if (typeof value === 'string' && value.length ) {
            try {
                if (/^\{.*\}$|^\[.*\]$/.test(value)) {
                    return JSON.parse(value, _parsePluginData );
                }
            } catch (e) {
                // If parsing fails or it's not an object/array, return the original value
            }
            if( value === 'true' || value === 'false'){
                return value === 'true';
            }
            if( !isNaN(value) ){
                return parseInt(value);
            }
        }
        else if( typeof value === 'object' && !Array.isArray(value) ){
            var _output = {};
            Object.keys( value ).forEach( function(key ){
                _output[key] = _parsePluginData( key , value[key] );
            });
            return _output;
        }
        return value;
    };

    return _parsePluginData( 'KunItemCrafting', PluginManager.parameters('KunItemCrafting'));
};



/**
 * @param {Number} item_id 
 * @returns KunRecipe
 */
function KunRecipe(item_id, amount, level) {

    this._item_id = item_id;
    this._amount = amount || 1;
    this._level = level || 0;
    this._list = [];

    this.add = function (item_id) {
        this._list.push(item_id);
        return this;
    };
}
/**
 * @returns Boolean
 */
KunRecipe.prototype.hasItems = function () {
    var amount = this.summary();
    var keys = Object.keys(amount);
    for (var i = 0; i < keys.length; i++) {
        var item_id = parseInt(keys[i]);
        if (KunItemCrafting.importItemCount(item_id) < amount[item_id]) {
            return false;
        }
    }
    return true;
};
/**
 * @returns Object
 */
KunRecipe.prototype.summary = function () {
    var amount = {};
    for (var idx in this._list) {
        var item_id = this._list[idx];
        if (!amount.hasOwnProperty(item_id)) {
            amount[item_id] = 1;
        }
        else {
            amount[item_id]++;
        }
    }
    return amount;
};
/**
 * @returns ARray
 */
KunRecipe.prototype.listIcons = function () {
    var icons = [];
    this._list.forEach(function (item_id) {
        var item = KunItemCrafting.importItemData(item_id);
        if (item !== false) {
            icons.push(item.iconIndex);
        }
    });
    return icons;
};
/**
 * @param {Number[]} list 
 * @returns Boolean
 */
KunRecipe.prototype.matchFormula = function (list) {
    if (Array.isArray(list)) {
        var input = list.sort();
        var recipe = this._list.sort();
        if (input.length === recipe.length) {
            for (var i in recipe) {
                if (recipe[i] !== input[i]) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
};
/**
 * @param {Number} level 
 * @returns Boolean
 */
KunRecipe.prototype.matchLevel = function (level) {
    return level >= this.level();
};
/**
 * @returns Number
 */
KunRecipe.prototype.level = function () {
    return this._level;
};
/**
 * @returns Number[]
 */
KunRecipe.prototype.list = function () {
    return this._list;
};
/**
 * @returns Number
 */
KunRecipe.prototype.itemId = function () {
    return this._item_id;
};
/**
 * @returns DataItem | Boolean
 */
KunRecipe.prototype.getItem = function () {
    return KunItemCrafting.importItemData(this._item_id);
};
/**
 * @returns Number
 */
KunRecipe.prototype.amount = function () {
    return this._amount;
};
/**
 * @param {Number} level
 * @returns Boolean
 */
KunRecipe.prototype.craft = function (level) {

    level = typeof level === 'number' && level > 0 ? level : 0;

    if (this.hasItems()) {

        var summary = this.summary();
        var ingredients = Object.keys(summary);

        for (var i = 0; i < ingredients.length; i++) {
            var item_id = ingredients[i];
            var item = KunItemCrafting.importItemData(item_id);
            if (item !== false) {
                var amount = summary[item_id];
                KunItemCrafting.addItem(item, -amount);
            }
        }

        if (level > 0 && !this.matchLevel(level)) {
            return false;
        }

        KunItemCrafting.addItem(this.getItem(), this.amount(), true);

        return true;
    }

    return false;
};
/**
 * @param boolean iconize
 * @returns Object|Boolean
 */
this.dump = function (iconize) {

    var item = this.getItem();
    var list = [];

    if (item !== false) {
        this._list.forEach(function (id) {
            var ingredient = KunItemCrafting.importItemData(id);
            if (ingredient !== false) {
                list.push(iconize ? "\\I[" + ingredient.iconIndex + "] " : ingredient.name);
            }
        });
        return (iconize ? `\\I[${item.iconIndex}]\\{${item.name}\\}` : `\\{${item.name}\\}`)
            + (this._level > 0 ? ` \\C[8](level ${this._level})\\C[0]` : '')
            + '\n    ' + item.description
            + (this._amount > 1 ? ' x' + this._amount : '')
            + "\n    \\C[8]Ingredients:\\C[0] " + list.join('');
    }
    return '';
};

function kun_item_crafting_setup_escape_chars() {
    var _KunItemCrafting_EscapeChars = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        //parse first the vanilla strings
        var parsed = _KunItemCrafting_EscapeChars.call(this, text);
        //include item names here
        parsed = parsed.replace(/\x1bRECIPE\[(\d+)\]/gi, function () {
            //get item by id
            var recipe_id = parseInt(arguments[1]);
            if (typeof recipe_id === 'number') {
                return this.displayKunRecipe(recipe_id);
            }
        }.bind(this));
    }
    /**
     * @param {Number} recipe_id 
     * @returns String
     */
    Window_Base.prototype.displayKunRecipe = function (recipe_id) {
        var recipe = KunItemCrafting.getRecipe(recipe_id);
        return recipe !== false ? recipe.dump() : '[INVALID_RECIPE_ID ' + recipe_id + ']';
    };
}

/**
 * 
 */
function kun_item_crafting_setup_commands() {
    var _KunItemCrafting_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunItemCrafting_pluginCommand.call(this, command, args);
        if (command === 'KunRecipes') {
            if (args && args.length) {
                switch (args[0]) {
                    case 'open':
                        var level = args.length > 1 ? parseInt(args[1]) : 0;
                        if (level > 0) {
                            KunItemCrafting.openCraftingScene(args.length > 2 && args[2] === 'import' ? $gameVariables.value(level) : level);
                        }
                        else {
                            KunItemCrafting.openCraftingScene();
                        }
                        break;
                    case 'add':
                        if (args.length > 1) {
                            var item_id = parseInt(args[1]);
                            KunItemCrafting.add(args.length > 2 && args[2] === 'import' ? $gameVariables.value(item_id) : item_id);
                        }
                        break;
                    case 'drop':
                        KunItemCrafting.drop();
                        break;
                    case 'craft':
                        var level = args.length > 1 ? parseInt(args[1]) : 0;
                        kun_item_craft(
                            //set leveled crafting
                            level > 0 && args.length > 4 && args[4] === 'import' ? $gameVariables.value(level) : level,
                            //remove crafted items
                            args.length > 2 && args[2] === 'remove',
                            //export crafted item ID to specified variable
                            args.length > 3 ? parseInt(args[3]) : 0);
                        break;
                    case 'clear':
                        KunItemCrafting.cleanRecipe(args.length > 1 && args[1] === 'remove');
                        break;
                    case 'count':
                        if (args.length > 1) {
                            $gameVariables.setValue(parseInt(args[1]), KunItemCrafting.container().length);
                        }
                        break;
                    case 'recipes':
                        if (args.length > 1) {
                            $gameVariables.setValue(parseInt(args[1]), KunItemCrafting.count());
                        }
                        break;
                    case 'display':
                        if (args.length > 1) {
                            var recipe_id = $gameVariables.value(parseInt(args[1]));
                            var recipe = KunItemCrafting.getRecipe(recipe_id);
                            if (recipe !== false) {
                                //$gameMessage.setBackgroundType(1);
                                //$gameMessage.setPositionType(1);
                                $gameMessage.add(recipe.dump(true));
                            }
                        }
                        break;
                    case 'dump':
                        KunItemCrafting.DebugLog(KunItemCrafting.dump());
                        break;
                }
            }
        }
    };
}

function kun_item_crafting_override_item_layout() {

    Window_ItemList.prototype.includes = function (item) {
        switch (this._category) {
            case 'item':
                return DataManager.isItem(item) && item.itypeId === 1;
            case 'weapon':
                return DataManager.isWeapon(item);
            case 'armor':
                return DataManager.isArmor(item);
            case 'keyItem':
                return DataManager.isItem(item) && item.itypeId === 2;

            case 'hidden_a':
                return DataManager.isItem(item) && item.itypeId === 3;
            case 'hidden_b':
                return DataManager.isItem(item) && item.itypeId === 4;

            default:
                return false;
        }
    };

    Window_ItemCategory.prototype.maxCols = function () {

        var hidden = 0;

        hidden += KunItemCrafting.categoryA().length > 0 ? 1 : 0;
        hidden += KunItemCrafting.categoryB().length > 0 ? 1 : 0;

        return 4 + hidden;
    };

    Window_ItemCategory.prototype.makeCommandList = function () {
        this.addCommand(TextManager.item, 'item');

        if (KunItemCrafting.categoryA().length) {
            this.addCommand(KunItemCrafting.categoryA(), 'hidden_a');
        }

        if (KunItemCrafting.categoryB().length) {
            this.addCommand(KunItemCrafting.categoryB(), 'hidden_b');
        }

        this.addCommand(TextManager.keyItem, 'keyItem');
        this.addCommand(TextManager.weapon, 'weapon');
        this.addCommand(TextManager.armor, 'armor');
    };

}
/**
 * @param {Number} level
 * @param {Boolean} remove 
 * @param {Number} exportVar
 * @returns Boolean
 */
function kun_item_craft(level, remove, exportVar) {

    var crafted_id = KunItemCrafting.craft(level || 0, typeof remove === 'boolean' && remove);

    if (typeof exportVar === 'number' && exportVar > 0) {
        $gameVariables.setValue(exportVar, crafted_id);
    }

    return crafted_id > 0;
}


///////////////////////////////////////////////////////////////////////////////////////////////////
////    Window_Crafting : Window_Base
///////////////////////////////////////////////////////////////////////////////////////////////////

function Window_Crafting() {
    this.initialize.apply(this, arguments);
}

Window_Crafting.prototype = Object.create(Window_Base.prototype);
Window_Crafting.prototype.constructor = Window_Crafting;

Window_Crafting.prototype.initialize = function () {

    this._items = [];
    var x = Window_Base._iconWidth;
    var y = this.posY();
    var width = this.displayWidth();
    var height = this.displayHeight();
    //console.log( width + ':' + height + ':' + x + ':' + y );

    Window_Base.prototype.initialize.call(this, 0, 0, 0, 0);
    this.initMembers();
    this.setBackgroundType(this._background);

};

Window_Crafting.prototype.initMembers = function () {
    this._positionType = 2;
    this._waitCount = 0;
    this._background = 0;
    this._positionLayout = KunItemCrafting.position();
};

Window_Crafting.prototype.slots = function () {
    return this._items.length > 0 ? this._items.length : 1;
}

Window_Crafting.prototype.posX = function () {
    switch (this._positionLayout) {
        case KunItemCrafting.Position.Left:
            return this.padding;
        case KunItemCrafting.Position.Right:
            return Graphics.boxWidth - this.displayWidth() - this.padding;
        case KunItemCrafting.Position.Center:
        default:
            return Graphics.boxWidth / 2 - (this.displayWidth() / 2);
    }
};

Window_Crafting.prototype.posY = function () {
    return Graphics.boxHeight - this.displayHeight() - this.padding;
};

Window_Crafting.prototype.displayWidth = function () {
    return Window_Base._iconWidth * (this._items.length > 0 ? this._items.length : 1) + (this.padding * 2);
}
Window_Crafting.prototype.displayHeight = function () {
    return Window_Base._iconHeight + (this.padding * 2);
}

Window_Crafting.prototype.renderWindow = function () {
    this.width = this.displayWidth();
    this.height = this.displayHeight();
    this.x = this.posX();
    this.y = this.posY();
    this.createContents();
    //console.log( this.width + ':' + this.height + ':' + this.x + ':' + this.y );
}

Window_Crafting.prototype.drawContent = function () {
    this.renderWindow();
    for (var i in this._items) {
        var iconIndex = this._items[i];
        this.drawIcon(iconIndex, i * Window_Base._iconWidth, 0);
    }
};

Window_Crafting.prototype.reset = function () {
    this._items = [];
}
Window_Crafting.prototype.addItem = function (icon_id) {
    this._items.push(icon_id);
    this.drawContent();
};
Window_Crafting.prototype.dropItem = function () {
    if (this._items.length > 0) {
        this._items.pop();
        this.drawContent();
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
////    Window_CraftingItems : Window_Selectable
///////////////////////////////////////////////////////////////////////////////////////////////////

function Window_CraftingItems() {
    this.initialize.apply(this, arguments);
}
Window_CraftingItems.prototype = Object.create(Window_Selectable.prototype);
Window_CraftingItems.prototype.constructor = Window_CraftingItems;
Window_CraftingItems.prototype.initialize = function () {
    Window_Selectable.prototype.initialize.call(this, 0, this.windowOffset(), this.windowWidth(), this.windowHeight());
    this._helpWindow = null;
    this.importItems();
    this.resetList();
};
Window_CraftingItems.prototype.windowWidth = function () {
    return Graphics.boxWidth / 2;
};
Window_CraftingItems.prototype.windowHeight = function () {
    return Graphics.boxHeight - this.windowOffset();
};
Window_CraftingItems.prototype.windowOffset = function () {
    return (Window_Base._iconHeight + (this.standardPadding() * 2));
}
Window_CraftingItems.prototype.listItems = function () { return this._formulaList; };
Window_CraftingItems.prototype.maxCols = function () { return 1; };
Window_CraftingItems.prototype.maxItems = function () { return typeof this._formulaList === 'object' ? this._formulaList.length : 0; };
Window_CraftingItems.prototype.spacing = function () { return 32; };
Window_CraftingItems.prototype.standardFontSize = function () { return 20; };

Window_CraftingItems.prototype.select = function (index) {
    if (this.contents) {
        this.contents.clear();
    }
    Window_Selectable.prototype.select.call(this, index);
    this.setHelpWindowItem(this.getItem());
    //console.log(this._helpWindow);
    this.callHandler('select');
};

Window_CraftingItems.prototype.resetList = function () {
    //this.createContents();
    //this.resetScroll(); //set top row
    //this.select(this._formulaList.length > 0 ? 0 : -1);
    this.activate();
    //this.refresh();
};
Window_CraftingItems.prototype.importItems = function () {
    this._formulaList = KunItemCrafting.formulas(this.importLevel());
}
Window_CraftingItems.prototype.importLevel = function () {
    return KunItemCrafting.level();
}
/**
 * @param {Number} idx
 * @returns KunRecipe |Boolean
 */
Window_CraftingItems.prototype.getItem = function (idx) {

    if (typeof idx !== 'number') {
        idx = this.index();
    }

    return idx > -1 && idx < this._formulaList.length ?
        this._formulaList[idx] :
        false;
};
/**
 * @param {String} name
 * @param {Number} iconIndex
 * @param {Number} amount
 * @returns {String}
 */
Window_CraftingItems.prototype.displayItem = function (name, iconIndex, amount) {

    var text = typeof iconIndex === 'number' && iconIndex > 0 ? '\\I[' + iconIndex + '] ' + name : name;

    if (typeof amount === 'number' && amount > 1) {
        text += ' x' + amount;
    }
    return text;
};
Window_CraftingItems.prototype.hasItems = function (idx) {
    var formula = this.getItem(idx);
    if (formula !== false) {
        return formula.hasItems();
    }
    return false;
}
/**
 * @description Render Item in the list by its list order
 */
Window_CraftingItems.prototype.drawItem = function (idx) {

    var formula = this.getItem(idx);
    if (formula !== false) {
        var rect = this.itemRect(idx);
        rect.width -= this.textPadding();
        var item = formula.getItem();
        if (item !== false) {
            this.drawTextEx(this.displayItem(item.name, item.iconIndex, formula.amount()), rect.x, rect.y, rect.width);
        }
    }
};
Window_CraftingItems.prototype.refresh = function () { this.drawAllItems(); };
Window_CraftingItems.prototype.processOk = function () {
    if (this.isCurrentItemEnabled()) {
        //this.playOkSound();
        this.updateInputData();
        this.deactivate();
        this.callOkHandler();
    }
};
Window_CraftingItems.prototype.playOkSound = function () {
    if (KunItemCrafting.hasMedia('success')) {
        KunItemCrafting.playMedia('success');
    }
    else {
        Window_Selectable.prototype.playOkSound.call(this);
    }
}
Window_CraftingItems.prototype.update = function () {
    Window_Selectable.prototype.update.call(this);
    this.refresh();
}

///////////////////////////////////////////////////////////////////////////////////////////////////
////    Window_CraftingHeader : Window_Base
///////////////////////////////////////////////////////////////////////////////////////////////////

function Window_CraftingHeader() {
    this.initialize.apply(this, arguments);
}

Window_CraftingHeader.prototype = Object.create(Window_Base.prototype);
Window_CraftingHeader.prototype.constructor = Window_CraftingHeader;
Window_CraftingHeader.prototype.initialize = function () {
    Window_Base.prototype.initialize.call(this, 0, 0, this.windowWidth(), this.windowHeight());
    this._callItems = () => [];
    this.setBackgroundType(0);
    this.display();
};
Window_CraftingHeader.prototype.display = function () {
    this.createContents();
    this.drawTextEx(KunItemCrafting.title(), -2, -2, this.contentsWidth());
    this.drawText(this.count() + ' recipes', 0, -2, this.contentsWidth(), 'right');
}
Window_CraftingHeader.prototype.posX = function () {
    switch (KunItemCrafting.position()) {
        case KunItemCrafting.Position.Right:
            return this.windowWidth();
        case KunItemCrafting.Position.Center:
            return (Graphics.boxWidth / 2) - (this.windowWidth() / 2)
        case KunItemCrafting.Position.Left:
        default:
            return 0;
    }
};
Window_CraftingHeader.prototype.windowWidth = function () {
    return Graphics.boxWidth;
    return Graphics.boxWidth / 2;
};
Window_CraftingHeader.prototype.windowHeight = function () {
    return Window_Base._iconHeight + (this.standardPadding() * 2);
};

Window_CraftingHeader.prototype.bindList = function (list) {
    if (Array.isArray(list)) {
        this._callItems = () => list;
        this.display();
    }
    return this;
};
/**
 * @returns Number
 */
Window_CraftingHeader.prototype.count = function () {
    var items = this._callItems();
    return items.length;
};

Window_CraftingHeader.prototype.standardFontSize = function () { return 24; };

///////////////////////////////////////////////////////////////////////////////////////////////////
////    Window_CraftingFormula : Window_Base
///////////////////////////////////////////////////////////////////////////////////////////////////

function Window_CraftingFormula() {
    this.initialize.apply(this, arguments);
}
Window_CraftingFormula.prototype = Object.create(Window_Base.prototype);
Window_CraftingFormula.prototype.constructor = Window_CraftingFormula;
Window_CraftingFormula.prototype.initialize = function () {
    Window_Base.prototype.initialize.call(this, this.posX(), this.posY(), this.windowWidth(), this.windowHeight());
    this.setBackgroundType(0);
};
Window_CraftingFormula.prototype.posY = function () {
    return Window_Base._iconHeight + (this.standardPadding() * 2);
    return Graphics.boxHeight - this.windowHeight();
}
Window_CraftingFormula.prototype.posX = function () {
    return this.windowWidth();
};
Window_CraftingFormula.prototype.windowWidth = function () {
    return Graphics.boxWidth / 2;
};
Window_CraftingFormula.prototype.windowHeight = function () {
    return Graphics.boxHeight - this.posY();
    return Window_Base._iconHeight + (this.standardPadding() * 2);
};
/**
 * @param {KunRecipe} formula 
 */
Window_CraftingFormula.prototype.setItem = function (formula) {
    //console.log( formula );
    if (formula instanceof KunRecipe) {
        this.clear();
        var summary = formula.summary();
        var list = Object.keys(summary);

        var itemData = formula.getItem();
        //var itemText = itemData.description + (itemData.note.length > 0 ? "." + itemData.note : '');
        var itemText = itemData.description;
        var desc = this.formatDescription(itemText, 40);

        this.drawIcon(itemData.iconIndex, 0, 0);
        this.drawText(itemData.name + ' x' + formula.amount(), 32, 0, this.contentsWidth());
        if (formula.level() > 0) {
            this.changeTextColor(this.systemColor());
            this.drawText('Level ' + formula.level(), 0, 0, this.contentsWidth(), 'right');
        }

        this.changeTextColor(this.normalColor());
        for (var i = 0; i < desc.length; i++) {
            this.drawText(desc[i], 0, i * this.lineHeight() + (this.lineHeight() * 2), this.contentsWidth());
        }

        var posY = this.contentsHeight() - list.length * this.lineHeight();
        //this.changeTextColor(this.systemColor());
        //this.drawText( 'Formula' , 0 , posY - this.lineHeight() *2, this.contentsWidth() , );

        for (var i = 0; i < list.length; i++) {
            var recipeData = KunItemCrafting.importItemData(list[i]);
            var available = KunItemCrafting.importItemCount(list[i]);
            var amount = summary[list[i]];
            var posItem = posY + this.lineHeight() * i;

            this.changeTextColor(this.textColor(amount > available ? 7 : 0));
            this.drawIcon(recipeData.iconIndex, 0, posItem + 4);
            this.drawText(recipeData.name, 38, posItem, this.contentsWidth());
            this.drawText('x' + amount, 0, posItem, this.contentsWidth(), 'right');
            this.changeTextColor(this.normalColor());
        }
    }
};
/**
 * @param {String} input 
 * @param {Number} lineLength 
 * @returns 
 */
Window_CraftingFormula.prototype.formatDescription = function (input, lineLength) {
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
};

Window_CraftingFormula.prototype.clear = function () {
    if (this.contents) {
        this.contents.clear();
    }
    return this;
};

Window_CraftingFormula.prototype.drawContent = function (message) {
    this.clear();
    //this.createContents();
    this.drawTextEx(message, -2, -2, this.contentsWidth());
}

Window_CraftingFormula.prototype.importRecipe = function (items) {
    var icons = [];
    items.forEach(function (icon_id) {
        icons.push('\\I[' + icon_id + ']');
    });
    this.drawContent(icons.join(''));
}


///////////////////////////////////////////////////////////////////////////////////////////////////
// Scene_Crafting : Scene_ItemBase
///////////////////////////////////////////////////////////////////////////////////////////////////
function Scene_Crafting() {
    this.initialize.apply(this, arguments);
}

Scene_Crafting.prototype = Object.create(Scene_ItemBase.prototype);
Scene_Crafting.prototype.constructor = Scene_Crafting;

Scene_Crafting.prototype.initialize = function () {
    Scene_ItemBase.prototype.initialize.call(this);
};

Scene_Crafting.prototype.create = function () {
    Scene_ItemBase.prototype.create.call(this);

    this.createHeaderWindow();
    this.createItemWindow();
    this.createFormulaWindow();
    //this._craftingMenu.showHelpWindow();
    this._craftingMenu.setHelpWindow(this._craftingFormula);
    this._craftingHeader.bindList(this._craftingMenu.listItems());
};

Scene_Crafting.prototype.createHeaderWindow = function () {

    this._craftingHeader = new Window_CraftingHeader();
    this.addWindow(this._craftingHeader);
}

Scene_Crafting.prototype.createFormulaWindow = function () {
    this._craftingFormula = new Window_CraftingFormula();
    this.addWindow(this._craftingFormula);
}

Scene_Crafting.prototype.createItemWindow = function () {
    this._craftingMenu = new Window_CraftingItems();
    this._craftingMenu.setHandler('select', this.onSelectFormula.bind(this));
    this._craftingMenu.setHandler('ok', this.onCraftFormula.bind(this));
    this._craftingMenu.setHandler('cancel', this.onQuit.bind(this));

    this.addWindow(this._craftingMenu);
};

Scene_Crafting.prototype.onSelectFormula = function () {
    return;
    var item = this._craftingMenu.getItem();
    if (item !== false) {
        this._craftingFormula.importRecipe(item.listIcons());
    }
    else {
        this._craftingFormula.createContents();
    }
}

Scene_Crafting.prototype.onCraftFormula = function () {
    this._craftingMenu.activate();
    var formula = this._craftingMenu.getItem();
    if (formula !== false) {
        if (formula.hasItems()) {
            if (formula.craft(KunItemCrafting.level())) {
                KunItemCrafting.playMedia('success');
            }
            else {
                KunItemCrafting.playMedia('fail').addMessage(KunItemCrafting.getText('fail'));
            }
            this.dispatchMessages().onQuit();
            return;
        }
    }
    SoundManager.playBuzzer();
}
/**
 * @returns Scene_Crafting
 */
Scene_Crafting.prototype.dispatchMessages = function () {
    window.setTimeout(function () {
        KunItemCrafting.dispatchMessages();
    }, 600);
    return this;
};
Scene_Crafting.prototype.onQuit = function () {
    this._craftingMenu.deactivate();
    this._craftingMenu.deselect();
    this._craftingMenu.close();
    this._craftingFormula.close();
    this._craftingHeader.close();
    this.popScene();
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// PLUGIN INITIALIZER
///////////////////////////////////////////////////////////////////////////////////////////////////

(function ( /* autosetup */) {

    KunItemCrafting.Initialize();

    kun_item_crafting_setup_commands();

})(/* autorun */);