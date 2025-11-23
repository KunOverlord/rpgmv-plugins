//=============================================================================
// KunItemFeatures.js
//=============================================================================
/*:
 * @filename KunItemFeatures.js
 * @plugindesc Provide an easy way to generate different random drops to add to inventory
 * @author Kun
 * 
 * @param collections
 * @text Drop Collections
 * @type struct<DropPack>[]
 * @desc Describe here all your drop sets
 * 
 * @param formulas
 * @text Recipe Formulas
 * @type struct<Recipe>[]
 * @desc Describe the database of crafting formulas
 * 
 * @param dropFx
 * @text Audio FX
 * @desc Audio to play when picking a drop
 * @type file
 * @dir audio/se/
 * 
 * @param itemMessage
 * @text Item Message
 * @desc Message to display when getting an intem [Item Message] + [ Generated Item ]
 * @type text
 * @default You've got
 * 
 * @param emptyMessage
 * @text Empty Message
 * @type text
 * @default it's empty...
 * 
 * @param hiddenItemA
 * @text Hidden Item A
 * @type text
 * 
 * @param hiddenItemB
 * @text Hidden Item B
 * @type text
 * 
 * @param showIcon
 * @text Show Item Icon
 * @type Boolean
 * @default false
 * 
 * @param debug
 * @text Debug Mode
 * @type Boolean
 * @default false
 * 
 * @help
 * 
 * COMMANDS
 * 
 * KunItemFeatures:
 *      Will drop a random drop package
 * KunItemFeatures [collection]
 *      Will drop the selected collection
 * KunItemFeatures drop [collection] (Obsolete)
 *      Will drop the selected collection
 * 
 */
/*~struct~DropPack:
 * @param collectionId
 * @text Collection ID
 * @type text
 * 
 * @param itemCount
 * @text Item Amount
 * @type number
 * @desc How many items are droped
 * @min 1
 * @default 1
 * 
 * @param random
 * @text Randomize Count
 * @type boolean
 * @desc Random the number of drops from 0 to Item Amount. False will drop all Item Amount units
 * @default false
 * 
 * @param itemList
 * @text Item List
 * @desc a Droppable Item Collection 
 * @type item[]
 * 
 * @param weaponList
 * @text Weapon List
 * @desc a Droppable Weapon Collection 
 * @type weapon[]
 * 
 * @param armorList
 * @text Armor List
 * @desc a Droppable Armor Collection 
 * @type armor[]
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
function KunItemFeatures() {

    var _manager = {
        'collection': {},
        'recipes': [
            //define the set of recipes here
        ],
        'pot': [
            //add crafting materials here
        ],
        'message': '',
        'empty': '',
        'sfx': '',
        'showIcon': false,
        'hiddenItem1': '',
        'hiddenItem2': '',
        'window': null,
        'debug': false,
    };
    /**
     * @returns Boolean
     */
    this.debug = () => _manager.debug;

    this.Set = {
        'sfx': (fx) => _manager.sfx = fx,
        'message': (message) => _manager.message = message,
        'empty': (message) => _manager.empty = message,
        'icon': (show) => _manager.showIcon = show,
        'hidden1': (text) => _manager.hiddenItem1 = text,
        'hidden2': (text) => _manager.hiddenItem2 = text,
        'debug': (debug) => _manager.debug = debug,
    };

    this.display = function (message, icon , amount ) {

        var text = _manager.message + ' ' + message ;

        if( typeof amount === 'number' && amount > 1 ){
            text += ' (x' + amount + ')';
        }

        if( typeof icon === 'number' && icon > 0 ){
            text = "\\I[" + icon + "] " + text;
        } 

        KunItemFeatures.Notify(text);

        return this;
    };

    this.hiddenItemA = () => _manager.hiddenItem1;

    this.hiddenItemB = () => _manager.hiddenItem2;


    this.playMedia = () => {
        if (_manager.sfx.length > 0) {
            AudioManager.playSe({ name: _manager.sfx, pan: 0, pitch: 100, volume: 100 });
        }
        return this;
    };

    this.add = function (dropPack) {
        if (dropPack instanceof KunDropPack && !_manager.collection.hasOwnProperty(dropPack.name())) {
            _manager.collection[dropPack.name()] = dropPack;
        }
    };
    /**
     * 
     * @param {String} drop_id 
     * @returns Boolean
     */
    this.has = (drop_id) => _manager.collection.hasOwnProperty(drop_id);
    /**
     * @param {String} drop_id 
     * @returns KunDropPack | boolean
     */
    this.get = function (drop_id) {

        return this.has(drop_id) ? _manager.collection[drop_id] : false;
    };
    /**
     * @returns Array<String>
     */
    this.list = () => Object.keys(_manager.collection);
    /**
     * @returns Array<KunDropPack>
     */
    this.collection = () => Object.values(_manager.collection);
    /**
     * @returns String
     */
    this.randomDrop = () => {
        var list = this.list();
        var drop = parseInt(Math.random() * list.length);
        return list[drop];
    };
    /**
     * @returns KunItemFeatures
     */
    this.displayWindow = function(){
        if( _manager.window === null ){
            _manager.window = new Window_Crafting( 0 , 0 );
            SceneManager._scene.addChild( _manager.window );    
        }
        return _manager.window;
    };
    /**
     * @returns KunItemFeatures
     */
     this.closeWindow = function(){
        if( _manager.window !== null ){
            _manager.window.close();
            _manager.window = null;
        }
        return this;
    }
    /**
     * @param {Number} item_id 
     * @param {Array} recipe 
     * @returns 
     */
    this.addRecipe = function (recipe) {
        if (recipe instanceof KunRecipe) {
            _manager.recipes.push(recipe);
        }
        return this;
    };
    /**
     * @param {Boolean} remove
     * @returns KunItemFeatures
     */
    this.empty = function (remove) {

        remove = typeof remove === 'boolean' && remove;

        if (!remove) {
            _manager.pot.forEach(function (item_id) {
                var item = KunItemFeatures.importItemData(item_id);
                //restore item to the inventory
                if (item !== false) {
                    KunItemFeatures.addItem(item, 1);
                }
            });
        }
        _manager.pot = [];
        
        return this.closeWindow();
    };
    this.recipes = () => _manager.recipes;
    /**
     * @returns Number
     */
    this.ingredients = () => _manager.pot.length;
    /**
     * @param {Boolean} remove 
     * @returns Boolean
     */
    this.craft = function (remove) {
        if (_manager.pot.length > 0) {
            console.log(_manager.pot);
            for (var i in _manager.recipes) {
                console.log(_manager.recipes[i]);
                var crafted_id = _manager.recipes[i].formula(_manager.pot);

                if (crafted_id > 0) {
                    console.log(_manager.recipes[i]);
                    //craft and stop searching
                    var item = KunItemFeatures.importItemData(crafted_id);
                    if (item !== false) {
                        KunItemFeatures.addItem(item, 1);
                        _manager.pot = [];
                        this.closeWindow();
                        return true;
                    }
                    else {
                        KunItemFeatures.DebugLog('Invalid Item Id [' + crafted_id + ']');
                        break;
                    }
                }
            }
            this.empty(remove);
        }
        return false;
    };
    /**
     * @param {Number} item_id 
     * @returns KunItemFeatures
     */
    this.addIngredient = function (item_id) {

        var item = KunItemFeatures.importItemData(item_id);

        if (item !== false) {
            KunItemFeatures.addItem(item, -1);
            _manager.pot.push(item_id);

            this.displayWindow().addItem( item.iconIndex );
        }
        
        return this;
    };

    /**
     * 
     * @param {String} drop_id 
     * @returns boolean
     */
    this.drop = function (drop_id) {

        if (typeof drop_id === 'undefined') {
            drop_id = this.randomDrop();
        }
        console.log(drop_id);

        var drop = this.get(drop_id);
        var _self = this;

        if (drop !== false) {
            //$gameParty.gainItem($dataItems[this._params[0]], value);
            var pack = drop.createPack();
            if (pack.length > 0) {
                pack.forEach(function (item) {
                    KunItemFeatures.addItem(item, 1);
                    //$gameParty.gainItem(item, 1);
                    //_self.display( item.name , _manager.showIcon && item.iconIndex > 0 ? item.iconIndex : 0 );
                    KunItemFeatures.DebugLog('Added ' + item.name);
                });
                //this.playMedia( _manager.sfx );
            }
            else {
                KunItemFeatures.Notify(_manager.empty);
            }
            return true;
        }
        else {
            KunItemFeatures.DebugLog('DropPack [' + drop_id + '] is empty');
        }

        return false;
    };
}
/**
 * @param {Number} item_id 
 * @returns Object
 */
KunItemFeatures.importItemData = (item_id) => item_id > 0 ? $dataItems[item_id] : false;
KunItemFeatures.importArmorData = (armor_id) => armor_id > 0 ? $dataArmors[armor_id] : false;
KunItemFeatures.importWeaponData = (weapon_id) => weapon_id > 0 ? $dataWeapons[weapon_id] : false;

/**
 * 
 * @param {Game_Item} item 
 * @param {Number} amount 
 */
KunItemFeatures.addItem = function (item, amount) {
    $gameParty.gainItem(item, typeof amount === 'number' ? amount : 1 , false , true );
};

/**
 * @param {String} drop_id 
 * @param {Number} amount 
 * @param {Boolean} randomize 
 */
function KunDropPack(drop_id, amount, randomize) {

    var _pack = {
        'drop_id': drop_id,
        'items': [],
        'weapons': [],
        'armors': [],
        'amount': amount || 1,
        'randomize': randomize || false
    };
    /**
     * @returns String
     */
    this.name = () => _pack.drop_id;
    /**
     * @param {Number} item_id 
     * @returns KunDropPack
     */
    this.addItem = function (item_id) {
        if (!_pack.items.includes(item_id)) {
            _pack.items.push(item_id);
        }
        return this;
    };
    /**
     * @param {Number} armor_id 
     * @returns KunDropPack
     */
    this.addArmor = function (armor_id) {
        if (!_pack.armors.includes(armor_id)) {
            _pack.armors.push(armor_id);
        }
        return this;
    };
    /**
     * @param {Number} weapon_id 
     * @returns KunDropPack
     */
    this.addWeapon = function (weapon_id) {
        if (!_pack.weapons.includes(weapon_id)) {
            _pack.weapons.push(weapon_id);
        }
        return this;
    };
    /**
     * @returns Number
     */
    this.randomItem = function () {
        if (_pack.items.length > 0) {
            var item_id = parseInt(Math.random() * _pack.items.length);
            return _pack.items[item_id];
        }
        return 0;
    };
    /**
     * @returns Number
     */
    this.randomArmor = function () {
        if (_pack.armors.length > 0) {
            var armor_id = parseInt(Math.random() * _pack.armors.length);
            return _pack.armors[armor_id];
        }
        return 0;
    };
    /**
     * @returns Number
     */
    this.randomWeapon = function () {
        if (_pack.weapons.length > 0) {
            var weapon_id = parseInt(Math.random() * _pack.weapons.length);
            return _pack.weapons[weapon_id];
        }
        return 0;
    };
    /**
     * @returns Number
     */
    this.getAmount = () => _pack.randomize ? parseInt(Math.random() * _pack.amount) + 1 : _pack.amount;
    /**
     * @returns String
     */
    this.randomType = function () {
        if (this.hasArmors() && this.hasItems() && this.hasWeapons()) {
            switch (parseInt(Math.random() * 3)) {
                case 2: return 'armors';
                case 1: return 'weapons';
                default: return 'items';
            }
        }
        else {
            switch (true) {
                case this.hasArmors() && this.hasItems():
                    return parseInt(Math.random() * 2) > 0 ? 'armors' : 'items';
                case this.hasWeapons() && this.hasItems():
                    return parseInt(Math.random() * 2) > 0 ? 'weapons' : 'items';
                case this.hasArmors():
                    return 'armors';
                case this.hasWeapons():
                    return 'weapons';
                default:
                    return 'items';
            }
        }
    };
    /**
     * @returns Boolean
     */
    this.hasArmors = () => _pack.armors.length > 0;
    /**
     * @returns Boolean
     */
    this.hasItems = () => _pack.items.length > 0;
    /**
     * @returns Boolean
     */
    this.hasWeapons = () => _pack.weapons.length > 0;

    /**
     * @returns Array
     */
    this.createPack = function () {

        var pack = [];

        var amount = this.getAmount();

        for (var i = 0; i < amount; i++) {
            var type = this.randomType();
            switch (type) {
                case 'armors':
                    var armor_id = this.randomArmor();
                    if (armor_id > 0) {
                        pack.push(KunItemFeatures.importArmorData(armor_id));
                    }
                    break;
                case 'weapons':
                    var weapon_id = this.randomWeapon();
                    if (weapon_id > 0) {
                        pack.push(KunItemFeatures.importWeaponData(weapon_id));
                    }
                    break;
                case 'items':
                    var item_id = this.randomItem();
                    if (item_id > 0) {
                        pack.push(KunItemFeatures.importItemData(item_id));
                    }
                    break;
            }
        }

        return pack;
    };
    /**
     * @returns Array
     */
    this.list = function (generatePack) {

        var items = [];

        var content = generatePack ? this.createPack() : this.export();

        content.forEach((item) => {
            if (typeof item === 'object' && item.hasOwnProperty('name')) {
                items.push(item.name);
            }
        });

        return items;
    };
    /**
     * @returns Array
     */
    this.export = function () {
        var data = [];
        //var _self = this;
        _pack.items.forEach((item_id) => {
            data.push(KunItemFeatures.importItemData(item_id));
        });
        _pack.armors.forEach((armor_id) => {
            data.push(KunItemFeatures.importArmorData(armor_id));
        });
        _pack.weapons.forEach((weapon_id) => {
            data.push(KunItemFeatures.importWeaponData(weapon_id));
        });
        return data;
    };

    //this.importArmorData = ( armor_id ) => armor_id > 0 ? $dataArmors[armor_id] : false;
    //this.importItemData = ( item_id ) => item_id > 0 ? $dataItems[item_id] : false;
    //this.importWeaponData = ( weapon_id ) => weapon_id > 0 ? $dataWeapons[weapon_id] : false;

    this.data = () => _pack;
}
/**
 * @param {Number} item_id 
 * @returns KunRecipe
 */
function KunRecipe(item_id, amount) {

    var _recipe = {
        'item_id': item_id,
        'amount': amount || 1,
        'list': []
    };

    this.add = function (item_id) {
        _recipe.list.push(item_id);
        return this;
    };
    /**
     * @param {Number[]} list 
     * @returns Number
     */
    this.formula = function (list) {
        if (Array.isArray(list)) {
            var input = list.sort();
            var recipe = _recipe.list.sort();
            if (input.length === recipe.length) {
                for (var i in recipe) {
                    if (recipe[i] !== input[i]) {
                        return 0;
                    }
                }
                return _recipe.item_id;
            }
        }
        return 0;
    };
    /**
     * @returns Number
     */
    this.ingredients = () => _recipe.list;

    return this;
}


/**
 * @param {String} input 
 * @returns Array
 */
KunItemFeatures.ImportDrops = function (input) {

    var output = [];

    var data = JSON.parse(input);
    if (data.length) {
        for (var content in data) {
            var pack = JSON.parse(data[content]);
            var dropPack = {
                'collectionId': pack.collectionId,
                'amount': parseInt(pack.itemCount),
                'random': Boolean(pack.random),
                'items': pack.itemList.length > 0 ? JSON.parse(pack.itemList) : [],
                'weapons': pack.weaponList.length > 0 ? JSON.parse(pack.weaponList) : [],
                'armors': pack.armorList.length > 0 ? JSON.parse(pack.armorList) : []
            };
            output.push(dropPack);
        }
    }

    return output;
};

/**
 * @param {String} input 
 * @returns Array
 */
KunItemFeatures.ImportRecipes = function (input) {

    var output = [];

    var data = JSON.parse(input);
    if (data.length) {
        for (var content in data) {
            var formula = JSON.parse(data[content]);
            var recipe = {
                'item_id': parseInt(formula.item_id),
                'amount': parseInt(formula.amount),
                'recipe': formula.recipe.length > 0 ? JSON.parse(formula.recipe) : [],
            };
            output.push(recipe);
        }
    }

    return output;
};

KunItemFeatures.Notify = function (message) {
    if (typeof kun_notify === 'function') {
        kun_notify(message);
    }
    else {
        KunItemFeatures.DebugLog(message);
    }
};


KunItemFeatures.DebugLog = function (message) {
    if (KUN.Drops.debug()) {
        console.log('[ KunItemFeatures ] : ' + message);
    }
};
/**
 * 
 */
function kun_item_features_setup_commands() {
    var _KunItemFeatures_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunItemFeatures_pluginCommand.call(this, command, args);
        if (command === 'KunRecipes') {
            if (args && args.length) {
                switch (args[0]) {
                    case 'clear':
                        KUN.Drops.empty();
                        break;
                    case 'count_ingredients':
                        if (args.length > 1) {
                            $gameVariables.setValue(parseInt(args[1]), KUN.Drops.ingredients());
                        }
                        break;
                    case 'import_ingredient':
                        if (args.length > 1) {
                            var item_id = $gameVariables.value(parseInt(args[1]));
                            if (item_id > 0) {
                                KUN.Drops.addIngredient(item_id);
                                //kun_manager_add_ingredient( item_id );
                            }
                        }
                        break;
                    case 'ingredient':
                        if (args.length > 1) {
                            KUN.Drops.addIngredient(parseInt(args[1]));
                            //kun_manager_add_ingredient( parseInt( args[1 ] ) );
                        }
                        break;
                    case 'craft':
                        kun_items_craft_recipe(args.length > 1 && args[1] === 'remove');
                        break;
                }
            }
        }
        if (command === 'KunDrops') {
            if (args && args.length) {
                switch (args[0]) {
                    case 'list':
                        if (args.length > 1) {
                            var drop = KUN.Drops.get(args[1]);
                            if (drop !== false) {
                                KunItemFeatures.DebugLog(drop.list());
                            }
                        }
                        else {
                            KunItemFeatures.DebugLog(KUN.Drops.list());
                        }
                        break;
                    default:
                        KUN.Drops.drop(args[0]);
                        break;
                }
            }
            else {
                KUN.Drops.drop( /* generate a random drop list */);
            }
        }
    };
}

function kun_item_features_override_gain_item() {

    Game_Party.prototype._KunDropsgainItem = Game_Party.prototype.gainItem;
    //append the notify flag, so it can generate a visual advice with the item.
    Game_Party.prototype.gainItem = function (item, amount, includeEquip, notify) {

        this._KunDropsgainItem(item, amount, includeEquip);

        if (typeof notify === 'boolean' && true) {
            
            if (amount > 0 && item !== null) {
                KUN.Drops.display(item.name, item.iconIndex , amount );
            }
        }
    }

    // Change Items
    Game_Interpreter.prototype.command126 = function () {
        var value = this.operateValue(this._params[1], this._params[2], this._params[3]);
        var notify = value > 0;
        $gameParty.gainItem($dataItems[this._params[0]], value, false, notify);
        return true;
    };
}

function kun_item_features_override_item_layout() {

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

        hidden += KUN.Drops.hiddenItemA().length > 0 ? 1 : 0;
        hidden += KUN.Drops.hiddenItemB().length > 0 ? 1 : 0;

        return 4 + hidden;
    };

    Window_ItemCategory.prototype.makeCommandList = function () {
        this.addCommand(TextManager.item, 'item');

        if (KUN.Drops.hiddenItemA().length) {
            this.addCommand(KUN.Drops.hiddenItemA(), 'hidden_a');
        }

        if (KUN.Drops.hiddenItemB().length) {
            this.addCommand(KUN.Drops.hiddenItemB(), 'hidden_b');
        }

        this.addCommand(TextManager.keyItem, 'keyItem');
        this.addCommand(TextManager.weapon, 'weapon');
        this.addCommand(TextManager.armor, 'armor');
    };

}
/**
 * @param {Boolean} remove 
 * @returns Boolean
 */
function kun_items_craft_recipe(remove) {
    return KUN.Drops.craft(remove);
}


//-----------------------------------------------------------------------------
// Window_Crafting
//
// The window for displaying text messages.

function Window_Crafting() {
    this.initialize.apply(this, arguments);
}
 
Window_Crafting.prototype = Object.create(Window_Base.prototype);
Window_Crafting.prototype.constructor = Window_Crafting;

Window_Crafting.prototype.initialize = function() {

    this._items = [];
    //var x = this.posX();
    var x = Window_Base._iconWidth;
    var y = this.posY();
    var width = this.displayWidth();
    var height = this.displayHeight();
    console.log( width + ':' + height + ':' + x + ':' + y );

    Window_Base.prototype.initialize.call(this, x , y , width, height );
    this.initMembers();
    this.setBackgroundType( this._background );
};

Window_Crafting.prototype.initMembers = function(){
    this._positionType = 2;
    this._waitCount = 0;
    //this.openness = 0;
    this._background = 0;
    //this._positionType = $gameMessage.positionType();
};

Window_Crafting.prototype.posX = function(){
    //return Graphics.boxWidth / 12;
    return Graphics.boxWidth / 2 - ( this.displayWidth() / 2);
};

Window_Crafting.prototype.posY = function(){
    //return Graphics.boxHeight / 2 - ( this.displayHeight() / 2);
    return Graphics.boxHeight - this.displayHeight() - this.padding;
};

Window_Crafting.prototype.displayWidth = function(){
    return Window_Base._iconWidth * ( this._items.length > 0 ? this._items.length : 1 ) + ( this.padding * 2 );
}
Window_Crafting.prototype.displayHeight = function(){ 
    return Window_Base._iconHeight + ( this.padding * 2 );
}

Window_Crafting.prototype.renderWindow = function(){
    this.width = this.displayWidth();
    this.height = this.displayHeight();
    this.x = this.posX();
    this.y = this.posY();
    this.createContents();
    console.log( this.width + ':' + this.height + ':' + this.x + ':' + this.y );
}

Window_Crafting.prototype.drawContent = function(  ){
    this.renderWindow();
    for( var i in this._items ){
        var iconIndex = this._items[ i ];
        this.drawIcon( iconIndex, i * Window_Base._iconWidth , 0);
    }
};

Window_Crafting.prototype.reset = function(  ){
    this._items = [];
}   
Window_Crafting.prototype.addItem = function( icon_id ){
    this._items.push( icon_id );
    this.drawContent();
};


(function ( /* autosetup */) {

    var parameters = PluginManager.parameters('KunItemFeatures');

    KUN.Drops = new KunItemFeatures();
    KUN.Drops.Set.sfx(parameters['dropFx']);
    KUN.Drops.Set.message(parameters['itemMessage']);
    KUN.Drops.Set.empty(parameters['emptyMessage']);
    //KUN.Drops.Set.icon( Boolean(parameters['showIcon']));
    KUN.Drops.Set.hidden1(parameters['hiddenItemA'])
    KUN.Drops.Set.hidden2(parameters['hiddenItemB'])
    KUN.Drops.Set.debug(parameters['debug'] === 'true' );
    KunItemFeatures.ImportDrops(parameters['collections']).forEach(function (pack) {

        var dropPack = new KunDropPack(
            pack.collectionId,
            pack.amount,
            pack.random
        );

        pack.items.forEach((item) => dropPack.addItem(item));
        pack.weapons.forEach((weapon) => dropPack.addWeapon(weapon));
        pack.armors.forEach((armor) => dropPack.addArmor(armor));

        KUN.Drops.add(dropPack);
    });

    KunItemFeatures.ImportRecipes(parameters['formulas']).forEach(function (formula) {
        //console.log(recipe);
        var recipe = new KunRecipe(formula.item_id, formula.amount);
        formula.recipe.forEach(function (item) {
            recipe.add(parseInt(item));
        });
        KUN.Drops.addRecipe(recipe);
    });

    kun_item_features_setup_commands();
    kun_item_features_override_gain_item();
    kun_item_features_override_item_layout();


})(/* autorun */);