//=============================================================================
// KunItemCrafting.js
//=============================================================================
/*:
 * @filename KunItemCrafting.js
 * @plugindesc Provide an easy way to define an item crafting database
 * @version 1.6
 * @author Kun
 * 
 * @param recipes
 * @text Recipe Formulas
 * @type struct<Recipe>[]
 * @desc Describe the database of crafting formulas
 * 
 * @param position
 * @text Recipe Position
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
var KUN = KUN || {};

/**
 * Kun Drop Generator Collection
 */
function KunItemCrafting() {

    var _manager = {
        'recipes': [
            //define the set of recipes here
        ],
        'container': [
            //add crafting materials here
        ],
        'position': 'center',
        'text': {
            'success': '',
            'fail': '',
            'level': '',
            'title':'',
        },
        'sfx': {
            'success': '',
            'fail': '',
            'add': '',
            'drop': '',
        },
        //'category': { 'A': '', 'B': '', },
        'level': 0,
        'window': null,
        'scene': null,
        'messages':[],
        'debug': false,
    };
    /**
     * @returns Boolean
     */
    this.debug = () => _manager.debug;

    this.Set = {
        'Position': (position) => _manager.position = position.toLowerCase() || KunItemCrafting.Position.Left,
        'SFX': (fx, type) => {
            if ( typeof fx === 'string' && _manager.sfx.hasOwnProperty(type)) {
                _manager.sfx[type] = fx;
            }
        },
        'Text': (txt, type) => {
            if ( typeof txt === 'string' && _manager.text.hasOwnProperty(type)) {
                _manager.text[type] = txt;
            }
        },
        //'CategoryA': (text) => _manager.category.A = text || '',
        //'CategoryB': (text) => _manager.category.B = text || '',
        'debug': (debug) => _manager.debug = debug || false,
    };
    /**
     * @param {String} type 
     * @returns String
     */
    this.getText = function( type ){
        return _manager.text.hasOwnProperty(type) ? _manager.text[type] : '';
    };
    /**
     * @param {String} message 
     * @returns KunItemCrafting
     */
    this.addMessage = function( message ){
        _manager.messages.push( message) ;
        return this;
    };
    /**
     * @returns KunItemCrafting
     */
    this.dispatchMessages = function(){
        _manager.messages.forEach( function( text ){
            KunItemCrafting.Notify( text );
        });
        _manager.messages = [];
        return this;
    };
    /**
     * @returns String
     */
    this.position = () => _manager.position;
    /**
     * @returns Boolean
     */
    this.setLevelFilter = function( level ){
        _manager.level = typeof level === 'number' && level > 0 ? level : 0;
        return this;
    };
    /**
     * Replace the levelVar by a straight level input formthe commands
     * @returns Number
     */
    this.level = () => _manager.level;
    /**
     * @returns String
     */
    this.title = () => _manager.text.title;
    /**
     * 
     * @param {String} item_name 
     * @param {Number} icon 
     * @param {Number} amount 
     * @returns KunItemCrafting
     */
    this.display = function (item_name, icon, amount) {

        var text = _manager.text.success + ' ' + item_name;

        if (typeof amount === 'number' && amount > 1) {
            text += ' (x' + amount + ')';
        }

        if (typeof icon === 'number' && icon > 0) {
            text = "\\I[" + icon + "] " + text;
        }

        //KunItemCrafting.Notify(text);
        return this.addMessage( text );
    };

    //this.hasCategoryA = () => _manager.category.A.length > 0;
    //this.categoryA = () => _manager.category.A;
    //this.hasCategoryB = () => _manager.category.B.length > 0;
    //this.categoryB = () => _manager.category.B;
    /**
     * @param {String} sfx 
     * @returns Boolean
     */
    this.hasMedia = function(sfx) {
        return _manager.sfx.hasOwnProperty(sfx) && _manager.sfx[sfx].length > 0;
    };
    /**
     * @param {String} sfx 
     * @returns 
     */
    this.playMedia = function( sfx ) {
        if (this.hasMedia( sfx )) {
            AudioManager.playSe({ name: _manager.sfx[sfx], pan: 0, pitch: 100, volume: 100 });
        }
        return this;
    };
    /**
     * @returns KunItemCrafting
     */
    this.displayWindow = function (showMenu) {
        if (_manager.window === null) {
            _manager.window = new Window_Crafting(0, 0);
            SceneManager._scene.addChild(_manager.window);
        }
        return _manager.window;
    };
    /**
     * @returns KunItemCrafting
     */
    this.closeWindow = function () {
        if (_manager.window !== null) {
            _manager.window.close();
            _manager.window = null;
        }
        return this.dispatchMessages();
    }
    /**
     * @param {Number} level 
     */
    this.openCraftingScene = function ( level ) {

        this.setLevelFilter( level || 0 );

        SceneManager.push(Scene_Crafting);
    };
    /**
     * @param {Number} item_id 
     * @param {Array} recipe 
     * @returns 
     */
    this.createRecipe = function (recipe) {
        if (recipe instanceof KunRecipe) {
            _manager.recipes.push(recipe);
        }
        return this;
    };
    /**
     * @param {Boolean} remove
     * @returns KunItemCrafting
     */
    this.cleanRecipe = function (remove) {

        remove = typeof remove === 'boolean' && remove;

        _manager.container.forEach(function (item_id) {
            var item = KunItemCrafting.importItemData(item_id);
            //restore item to the inventory
            if (item !== false) {
                if (!remove || !item.consumable) {
                    KunItemCrafting.addItem(item, 1);
                }
            }
        });
        _manager.container = [];

        return this.closeWindow();
    };
    /**
     * @param Number level Filter per level
     * @returns KunRecipe[]
     */
    this.list = function (level) {
        if (typeof level === 'number') {
            var output = [];
            _manager.recipes.forEach(function (r) {
                if (level >= r.level()) {
                    output.push(r);
                }
            });
            return output;
        }
        return _manager.recipes;
    };
    /**
     * @param {Number} level 
     * @returns Number
     */
    this.count = function (level) {
        return this.list(level).length;
    };
    /**
     * @param {Number} recipe_id 
     * @returns KunRecipe | boolean
     */
    this.getRecipe = function (recipe_id) {
        if (recipe_id >= 0 && recipe_id < _manager.recipes.length) {
            return _manager.recipes[recipe_id];
        }
        return false;
    };
    /**
     * @returns Number
     */
    this.container = () => _manager.container;
    /**
     * @param {Number} level 0 if not requierd
     * @param {Boolean} remove 
     * @returns Number Returned Item Id
     */
    this.craft = function ( level, remove ) {
        level = typeof level === 'number' && level > 0 ? level : 0;
        if (_manager.container.length > 0) {
            for (var i in _manager.recipes) {
                if (_manager.recipes[i].matchFormula(_manager.container)) {
                    var formula = _manager.recipes[i];
                    var item = formula.getItem();
                    var amount = formula.amount();
                    if ( level > 0 && level < formula.level()) {
                        //do not match the level
                        KunItemCrafting.Notify(_manager.text.level + ' ' + item.name + (amount > 1 ? ' x' + amount : ''));
                        break;
                    }
                    if (item !== false) {
                        KunItemCrafting.addItem(item, formula.amount(),true);
                        this.cleanRecipe(true);
                        return formula.itemId();
                    }
                    else {
                        KunItemCrafting.DebugLog( `Invalid Item Id [${formula.itemId()}]`);
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
    this.add = function (item_id) {
        //console.log( `Item Id ${item_id}`);
        var item = KunItemCrafting.importItemData(item_id);

        if (item !== false) {
            KunItemCrafting.addItem(item, -1);
            _manager.container.push(item_id);

            this.displayWindow().addItem(item.iconIndex);
        }

        return this;
    };
    /**
     * @returns KunItemCrafting
     */
    this.drop = function () {
        if (_manager.container.length > 0) {
            var item_id = _manager.container.pop();
            var item = KunItemCrafting.importItemData(item_id);
            if( item !== false ){
                KunItemCrafting.addItem(item, 1);
                this.displayWindow().dropItem();    
            }
        }
        return this;
    };
    /**
     * @returns Array
     */
    this.dump = function () {
        var output = "RECIPES:\n";
        _manager.recipes.forEach(function (formula) {
            var recipe = formula.dump();
            if (recipe.length > 0) {
                output += "\n" + recipe;
            }
        });

        return output;
    };
}
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
KunItemCrafting.importItemCount = function( item_id ){
    if( item_id ){
        var item = KunItemCrafting.importItemData( item_id );
        return item !== false ? $gameParty.numItems( item ) : 0;
    }
    return 0;
}; 

/**
 * 
 * @param {Game_Item} item 
 * @param {Number} amount 
 * @param {Boolean} notify 
 */
KunItemCrafting.addItem = function (item, amount , notify ) {
    if (item !== null) {
        $gameParty.gainItem(item, typeof amount === 'number' ? amount : 1, false, true);

        if( amount > 0 && typeof notify === 'boolean' && notify ){
            var text = "\\I[" + item.iconIndex + "] " + KUN.Recipes.getText('success') + ' ' + item.name;

            if (typeof amount === 'number' && amount > 1) {
                text += ' (x' + amount + ')';
            }
            KUN.Recipes.addMessage( text );
        }
    }
};


/**
 * @param {Number} item_id 
 * @returns KunRecipe
 */
function KunRecipe(item_id, amount, level) {

    var _recipe = {
        'item_id': item_id,
        'amount': amount || 1,
        'level': level || 0,
        'list': []
    };

    this.add = function (item_id) {
        _recipe.list.push(item_id);
        return this;
    };
    /**
     * @returns Boolean
     */
    this.hasItems = function () {

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
    this.summary = function () {
        var amount = {};
        for (var idx in _recipe.list) {
            var item_id = _recipe.list[idx];
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
    this.listIcons = function () {
        var icons = [];
        _recipe.list.forEach(function (item_id) {
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
    this.matchFormula = function (list) {
        if (Array.isArray(list)) {
            var input = list.sort();
            var recipe = _recipe.list.sort();
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
    this.matchLevel = function( level ){
        return level >= this.level();
    };
    this.level = () => _recipe.level;
    /**
     * @returns Number[]
     */
    this.list = () => _recipe.list;
    /**
     * @returns Number
     */
    this.itemId = () => _recipe.item_id;
    /**
     * @returns DataItem | Boolean
     */
    this.getItem = () => KunItemCrafting.importItemData(_recipe.item_id);
    /**
     * @returns Number
     */
    this.amount = () => _recipe.amount;
    /**
     * @param {Number} level
     * @returns Boolean
     */
    this.craft = function ( level ) {

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

            if( level > 0 && !this.matchLevel( level ) ){
                return false;
            }

            KunItemCrafting.addItem(this.getItem(), this.amount(),true);

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
            _recipe.list.forEach(function (id) {
                var ingredient = KunItemCrafting.importItemData(id);
                if (ingredient !== false) {
                    list.push(iconize ? "\\I[" + ingredient.iconIndex + "] " : ingredient.name);
                }
            });
            return (iconize ? `\\I[${item.iconIndex}]\\{${item.name}\\}` : `\\{${item.name}\\}` )
                + (_recipe.level > 0 ? ` \\C[8](level ${_recipe.level})\\C[0]` : '')
                + '\n    ' + item.description
                + (_recipe.amount > 1 ? ' x' + _recipe.amount : '')
                + "\n    \\C[8]Ingredients:\\C[0] " + list.join('');
        }
        return '';
    };

    return this;
}

/**
 * @param {String} input 
 * @returns Array
 */
KunItemCrafting.ImportRecipes = function (input) {

    var output = [];

    var data = JSON.parse(input);
    if (data.length) {
        for (var content in data) {
            var formula = JSON.parse(data[content]);
            var recipe = {
                'item_id': parseInt(formula.item_id),
                'amount': parseInt(formula.amount),
                'level': parseInt(formula.level),
                'recipe': formula.recipe.length > 0 ? JSON.parse(formula.recipe) : [],
            };
            output.push(recipe);
        }
    }

    return output;
};

KunItemCrafting.Notify = function (message) {
    if (typeof kun_notify === 'function') {
        kun_notify(message);
    }
    else {
        KunItemCrafting.DebugLog(message);
    }
};


KunItemCrafting.DebugLog = function (message) {
    if (KUN.Recipes.debug()) {
        console.log(typeof message !== 'object' ? '[ KunItemCrafting ] : ' + message : message);
    }
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
        var recipe = KUN.Recipes.getRecipe(recipe_id);
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
                        if( level > 0 ){
                            KUN.Recipes.openCraftingScene( args.length > 2 && args[2] === 'import' ? $gameVariables.value( level ) : level );
                        }
                        else{
                            KUN.Recipes.openCraftingScene( );
                        }
                        break;
                    case 'add':
                        if (args.length > 1) {
                            var item_id =  parseInt(args[1]);
                            KUN.Recipes.add( args.length > 2 && args[2] === 'import' ?  $gameVariables.value( item_id ) : item_id );
                        }
                        break;
                    case 'drop':
                        KUN.Recipes.drop();
                        break;
                    case 'craft':
                        var level = args.length > 1 ? parseInt(args[1]) : 0;
                        kun_item_craft(
                            //set leveled crafting
                            level > 0 && args.length > 4 && args[4] === 'import' ? $gameVariables.value( level ) : level ,
                            //remove crafted items
                            args.length > 2 && args[2] === 'remove',
                            //export crafted item ID to specified variable
                            args.length > 3 ? parseInt( args[3] ) : 0 );
                        break;
                    case 'clear':
                        KUN.Recipes.cleanRecipe(args.length > 1 && args[1] === 'remove');
                        break;
                    case 'count':
                        if (args.length > 1) {
                            $gameVariables.setValue(parseInt(args[1]), KUN.Recipes.container().length);
                        }
                        break;
                    case 'recipes':
                        if (args.length > 1) {
                            $gameVariables.setValue(parseInt(args[1]), KUN.Recipes.count());
                        }
                        break;
                    case 'display':
                        if (args.length > 1) {
                            var recipe_id = $gameVariables.value(parseInt(args[1]));
                            var recipe = KUN.Recipes.getRecipe(recipe_id);
                            if (recipe !== false) {
                                //$gameMessage.setBackgroundType(1);
                                //$gameMessage.setPositionType(1);
                                $gameMessage.add(recipe.dump(true));
                            }
                        }
                        break;
                    case 'dump':
                        KunItemCrafting.DebugLog(KUN.Recipes.dump());
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

        hidden += KUN.Recipes.categoryA().length > 0 ? 1 : 0;
        hidden += KUN.Recipes.categoryB().length > 0 ? 1 : 0;

        return 4 + hidden;
    };

    Window_ItemCategory.prototype.makeCommandList = function () {
        this.addCommand(TextManager.item, 'item');

        if (KUN.Recipes.categoryA().length) {
            this.addCommand(KUN.Recipes.categoryA(), 'hidden_a');
        }

        if (KUN.Recipes.categoryB().length) {
            this.addCommand(KUN.Recipes.categoryB(), 'hidden_b');
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
function kun_item_craft( level , remove, exportVar) {
    
    var crafted_id = KUN.Recipes.craft( level || 0, typeof remove === 'boolean' && remove );

    if (typeof exportVar === 'number' && exportVar > 0) {
        $gameVariables.setValue(exportVar, crafted_id );
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
    this._positionLayout = KUN.Recipes.position();
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
Window_CraftingItems.prototype.windowOffset = function(){
    return (Window_Base._iconHeight + (this.standardPadding() * 2));
}
Window_CraftingItems.prototype.listItems = function () { return this._formulaList; };
Window_CraftingItems.prototype.maxCols = function () { return 1; };
Window_CraftingItems.prototype.maxItems = function () { return typeof this._formulaList === 'object' ? this._formulaList.length : 0; };
Window_CraftingItems.prototype.spacing = function () { return 32; };
Window_CraftingItems.prototype.standardFontSize = function () { return 20; };

Window_CraftingItems.prototype.select = function(index) {
    if( this.contents ){
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
    this._formulaList = KUN.Recipes.list( this.importLevel() );
}
Window_CraftingItems.prototype.importLevel = function () {
    return KUN.Recipes.level();
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
Window_CraftingItems.prototype.displayItem = function ( name , iconIndex , amount ) {
    
    var text =  typeof iconIndex === 'number' && iconIndex > 0 ? '\\I[' + iconIndex + '] ' + name : name;

    if( typeof amount === 'number' && amount > 1 ){
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
    if( formula !== false ){
        var rect = this.itemRect(idx);
        rect.width -= this.textPadding();
        var item = formula.getItem();
        if( item !== false ){
            this.drawTextEx( this.displayItem(item.name,item.iconIndex,formula.amount()), rect.x, rect.y, rect.width);
        }
    }
};
Window_CraftingItems.prototype.refresh = function () { this.drawAllItems(); };
Window_CraftingItems.prototype.processOk = function() {
    if (this.isCurrentItemEnabled()) {
        //this.playOkSound();
        this.updateInputData();
        this.deactivate();
        this.callOkHandler();
    }
};
Window_CraftingItems.prototype.playOkSound = function() {
    if( KUN.Recipes.hasMedia('success')){
        KUN.Recipes.playMedia('success');
    }
    else{
        Window_Selectable.prototype.playOkSound.call( this );
    }
}
Window_CraftingItems.prototype.update = function() {
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
Window_CraftingHeader.prototype.display = function(){
    this.createContents();
    this.drawTextEx( KUN.Recipes.title() , -2 , -2 , this.contentsWidth( ) );
    this.drawText( this.count() + ' recipes' , 0 , -2 , this.contentsWidth( ) , 'right' );
}
Window_CraftingHeader.prototype.posX = function(){
    switch (KUN.Recipes.position()) {
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

Window_CraftingHeader.prototype.bindList = function( list ){
    if( Array.isArray( list ) ){
        this._callItems = () => list;
        this.display();
    }
    return this;
};
/**
 * @returns Number
 */
Window_CraftingHeader.prototype.count = function(){
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
Window_CraftingFormula.prototype.posY = function(){
    return Window_Base._iconHeight + (this.standardPadding() * 2);
    return Graphics.boxHeight - this.windowHeight();
}
Window_CraftingFormula.prototype.posX = function(){
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
Window_CraftingFormula.prototype.setItem = function( formula ){
    //console.log( formula );
    if( formula instanceof KunRecipe ){
        this.clear();
        var summary = formula.summary();
        var list = Object.keys( summary );

        var itemData = formula.getItem();
        //var itemText = itemData.description + (itemData.note.length > 0 ? "." + itemData.note : '');
        var itemText = itemData.description;
        var desc = this.formatDescription( itemText , 40 );
        
        this.drawIcon( itemData.iconIndex, 0 , 0 );
        this.drawText( itemData.name + ' x' + formula.amount() , 32 , 0 , this.contentsWidth() );
        if( formula.level() > 0 ){
            this.changeTextColor( this.systemColor() );
            this.drawText( 'Level ' + formula.level(), 0 , 0 , this.contentsWidth() , 'right');
        }

        this.changeTextColor( this.normalColor() );
        for(var i = 0 ; i < desc.length ; i++ ){
            this.drawText( desc[i], 0 , i * this.lineHeight() + (this.lineHeight()*2) , this.contentsWidth());
        }

        var posY = this.contentsHeight() - list.length * this.lineHeight();
        //this.changeTextColor(this.systemColor());
        //this.drawText( 'Formula' , 0 , posY - this.lineHeight() *2, this.contentsWidth() , );

        for( var i = 0 ; i < list.length ; i++ ){
            var recipeData = KunItemCrafting.importItemData( list[ i ] );
            var available = KunItemCrafting.importItemCount(list[i]);
            var amount = summary[ list[i] ];
            var posItem = posY + this.lineHeight() * i;

            this.changeTextColor( this.textColor( amount > available ? 7 : 0 ) );
            this.drawIcon( recipeData.iconIndex, 0 , posItem + 4);
            this.drawText( recipeData.name , 38 , posItem, this.contentsWidth( ) );
            this.drawText( 'x' + amount , 0 , posItem, this.contentsWidth() , 'right' );
            this.changeTextColor(this.normalColor());
        }
    } 
};
/**
 * @param {String} input 
 * @param {Number} lineLength 
 * @returns 
 */
Window_CraftingFormula.prototype.formatDescription = function( input , lineLength ){
    var output = [];
    input.split('.').forEach( function( paragraph ){
        paragraph.split(' ').forEach( function( word ){
            if (output.length) {
                if (output[output.length - 1].length + word.length + 1 < lineLength ) {
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

Window_CraftingFormula.prototype.clear = function(){
    if( this.contents ){
        this.contents.clear();
    }
    return this;
};

Window_CraftingFormula.prototype.drawContent = function( message ){
    this.clear();
    //this.createContents();
    this.drawTextEx( message , -2 , -2, this.contentsWidth( ) );
}

Window_CraftingFormula.prototype.importRecipe = function( items ){
    var icons = [];
    items.forEach( function( icon_id){
        icons.push('\\I[' + icon_id + ']');
    });
    this.drawContent( icons.join('') );
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
    this._craftingMenu.setHelpWindow( this._craftingFormula );
    this._craftingHeader.bindList( this._craftingMenu.listItems() );
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

Scene_Crafting.prototype.onSelectFormula = function(){
    return;
    var item = this._craftingMenu.getItem();
    if( item !== false ){
        this._craftingFormula.importRecipe( item.listIcons() );
    }
    else{
        this._craftingFormula.createContents();
    }
}

Scene_Crafting.prototype.onCraftFormula = function () {
    this._craftingMenu.activate();
    var formula = this._craftingMenu.getItem();
    if (formula !== false) {
        if( formula.hasItems()){
            if( formula.craft(KUN.Recipes.level())) {
                KUN.Recipes.playMedia('success');
            }
            else{
                KUN.Recipes.playMedia('fail').addMessage(KUN.Recipes.getText('fail') );
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
Scene_Crafting.prototype.dispatchMessages = function(){
    window.setTimeout(function(){
        KUN.Recipes.dispatchMessages();
    },600);
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

    var parameters = PluginManager.parameters('KunItemCrafting');

    KUN.Recipes = new KunItemCrafting();
    KUN.Recipes.Set.Position(parameters['position']);

    KUN.Recipes.Set.SFX(parameters['successFx'],'success');
    KUN.Recipes.Set.SFX(parameters['failFx'],'fail');
    //KUN.Recipes.Set.SFX(parameters['addFx'],'add');
    //KUN.Recipes.Set.SFX(parameters['dropFx'],'drop');
    KUN.Recipes.Set.Text(parameters['successText'], 'success');
    KUN.Recipes.Set.Text(parameters['failText'], 'fail');
    KUN.Recipes.Set.Text(parameters['levelText'], 'level');
    KUN.Recipes.Set.Text(parameters['craftingTitle'], 'title');

    //KUN.Recipes.Set.CategoryA(parameters['categoryA'])
    //KUN.Recipes.Set.CategoryB(parameters['categoryB'])
    KUN.Recipes.Set.debug(Boolean(parameters['debug']));

    KunItemCrafting.ImportRecipes(parameters['recipes']).forEach(function (formula) {
        //console.log(recipe);
        var recipe = new KunRecipe(formula.item_id, formula.amount, formula.level);
        formula.recipe.forEach(function (item) {
            recipe.add(parseInt(item));
        });
        KUN.Recipes.createRecipe(recipe);
    });

    //kun_item_crafting_setup_escape_chars();
    kun_item_crafting_setup_commands();
    //move to HUD plugin
    //kun_item_crafting_override_item_layout();

})(/* autorun */);