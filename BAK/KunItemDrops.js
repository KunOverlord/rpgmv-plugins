//=============================================================================
// KunItemDrops.js
//=============================================================================
/*:
 * @filename KunItemDrops.js
 * @plugindesc Provide an easy way to generate different random drops to add to inventory
 * @author Kun
 * 
 * @param collections
 * @text Drop Collections
 * @type struct<DropPack>[]
 * @desc Describe here all your drop sets
 * 
 * @param dropFx
 * @text Audio FX
 * @desc Audio to play when picking a drop
 * @type file
 * @dir audio/se/
 * 
 * @param emptyFx
 * @text Empty FX
 * @desc Audio to play with empty drop
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
 * @param debug
 * @text Debug Mode
 * @type Boolean
 * @default false
 * 
 * @help
 * 
 * COMMANDS
 * 
 * KunItemDrops:
 *      Will drop a random drop package
 * KunItemDrops [collection]
 *      Will drop the selected collection
 * KunItemDrops drop [collection] (Obsolete)
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

/**
 * @description KUN Modules
 * @type KUN
 */
var KUN = KUN || {};

/**
 * Kun Drop Generator Collection
 */
function KunItemDrops() {

    var _manager = {
        'collection': {},
        'recipes': [
            //define the set of recipes here
        ],
        'text':{
            'drop':'',
            'empty':'',
        },
        'sfx': {
            'drop':'',
            'empty':'',
        },
        'debug': false,
    };
    /**
     * @returns Boolean
     */
    this.debug = () => _manager.debug;

    this.Set = {
        'DropFX': (fx) => _manager.sfx.drop = fx,
        'EmptyFX': (fx) => _manager.sfx.empty = fx,
        'DropText': ( txt ) => _manager.text.drop = txt,
        'EmptyText': ( txt ) => _manager.text.empty = txt,
        'debug': (debug) => _manager.debug = debug,
    };
    /**
     * 
     * @param {String} item_name 
     * @param {Number} icon 
     * @param {Number} amount 
     * @returns KunItemDrops
     */
    this.display = function ( item_name, icon , amount ) {

        var text = _manager.text.drop + ' ' + item_name ;
        //console.log( amount );
        if( typeof amount === 'number' && amount > 1 ){
            text += ' (x' + amount + ')';
        }

        if( typeof icon === 'number' && icon > 0 ){
            text = "\\I[" + icon + "] " + text;
        } 

        KunItemDrops.Notify(text);

        return this;
    };
    /**
     * 
     * @returns KunItemDrops
     */
    this.playMedia = ( type ) => {
        if (_manager.sfx.hasOwnProperty( type ) && _manager.sfx[type].length > 0 ) {
            AudioManager.playSe({ name: _manager.sfx[type], pan: 0, pitch: 100, volume: 100 });
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
     * 
     * @param {String} drop_id 
     * @returns boolean
     */
    this.drop = function (drop_id, silent ) {

        silent = typeof silent === 'boolean' && silent;

        if (typeof drop_id === 'undefined') {
            drop_id = this.randomDrop();
        }
        //console.log(drop_id);

        var drop = this.get(drop_id);

        if (drop !== false) {
            var pack = drop.createPack();
            if ( pack.length > 0 ) {
                var _self = this;
                pack.forEach(function (item) {
                    KunItemDrops.addItem(item, 1);
                    if( !silent ){
                        _self.display(item.name, item.iconIndex , 1 );
                        KunItemDrops.DebugLog('Added ' + item.name);    
                    }
                });
                if( !silent ){
                    this.playMedia( 'drop' );
                }
            }
            else if( !silent ){
                KunItemDrops.Notify(_manager.text.empty );
                this.playMedia( 'empty' );
            }
            return true;
        }
        else {
            KunItemDrops.DebugLog('DropPack [' + drop_id + '] is empty');
        }

        return false;
    };
}
/**
 * @param {Number} item_id 
 * @returns Object
 */
KunItemDrops.importItemData = (item_id) => item_id > 0 ? $dataItems[item_id] : false;
KunItemDrops.importArmorData = (armor_id) => armor_id > 0 ? $dataArmors[armor_id] : false;
KunItemDrops.importWeaponData = (weapon_id) => weapon_id > 0 ? $dataWeapons[weapon_id] : false;

/**
 * 
 * @param {Game_Item} item 
 * @param {Number} amount 
 */
KunItemDrops.addItem = function (item, amount) {
    $gameParty.gainItem(item, typeof amount === 'number' ? amount : 1 );
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
                        pack.push(KunItemDrops.importArmorData(armor_id));
                    }
                    break;
                case 'weapons':
                    var weapon_id = this.randomWeapon();
                    if (weapon_id > 0) {
                        pack.push(KunItemDrops.importWeaponData(weapon_id));
                    }
                    break;
                case 'items':
                    var item_id = this.randomItem();
                    if (item_id > 0) {
                        pack.push(KunItemDrops.importItemData(item_id));
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
            data.push(KunItemDrops.importItemData(item_id));
        });
        _pack.armors.forEach((armor_id) => {
            data.push(KunItemDrops.importArmorData(armor_id));
        });
        _pack.weapons.forEach((weapon_id) => {
            data.push(KunItemDrops.importWeaponData(weapon_id));
        });
        return data;
    };

    this.data = () => _pack;
}

/**
 * @param {String} input 
 * @returns Array
 */
KunItemDrops.ImportDrops = function (input) {

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


KunItemDrops.Notify = function (message) {
    if (typeof kun_notify === 'function') {
        kun_notify(message);
    }
    else {
        KunItemDrops.DebugLog(message);
    }
};

KunItemDrops.DebugLog = function (message) {
    if (KUN.Drops.debug()) {
        console.log('[ KunItemDrops ] : ' + message);
    }
};
/**
 * 
 */
function kun_item_drops_setup_commands() {
    var _KunItemDrops_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunItemDrops_pluginCommand.call(this, command, args);
        if (command === 'KunDrops') {
            if (args && args.length) {
                switch (args[0]) {
                    case 'list':
                        if (args.length > 1) {
                            var drop = KUN.Drops.get(args[1]);
                            if (drop !== false) {
                                KunItemDrops.DebugLog(drop.list());
                            }
                        }
                        else {
                            KunItemDrops.DebugLog(KUN.Drops.list());
                        }
                        break;
                    default:
                        KUN.Drops.drop(args[0], args.length > 1 && args[1] === 'silent' );
                        break;
                }
            }
            else {
                KUN.Drops.drop( /* generate a random drop list */);
            }
        }
    };
}

function kun_item_drops_override_gain_item() {

    //Game_Party.prototype._KunItemDropsgainItem = Game_Party.prototype.gainItem;
    //append the notify flag, so it can generate a visual advice with the item.
    /*Game_Party.prototype.gainItem = function (item, amount, includeEquip, notify) {
        this._KunItemDropsgainItem(item, amount, includeEquip);
        if (typeof notify === 'boolean' && true) {
            if (amount > 0 && item !== null) {
                KUN.Drops.display(item.name, item.iconIndex , amount );
            }
        }
    }*/

    // Change Items
    Game_Interpreter.prototype.command126 = function () {
        var value = this.operateValue(this._params[1], this._params[2], this._params[3]);
        var item = $dataItems[this._params[0]];
        $gameParty.gainItem(item, value );
        if( value > 0 ){
            KUN.Drops.display(item.name, item.iconIndex , value );
        }
        return true;
    };
}

(function ( /* autosetup */) {

    var parameters = PluginManager.parameters('KunItemDrops');

    KUN.Drops = new KunItemDrops();
    KUN.Drops.Set.DropFX(parameters['dropFx']);
    KUN.Drops.Set.EmptyFX(parameters['emptyFx']);
    KUN.Drops.Set.DropText(parameters['itemMessage']);
    KUN.Drops.Set.EmptyText(parameters['emptyMessage']);
    KUN.Drops.Set.debug(Boolean(parameters['debug']));
    KunItemDrops.ImportDrops(parameters['collections']).forEach(function (pack) {

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

    kun_item_drops_setup_commands();
    kun_item_drops_override_gain_item();

})(/* autorun */);


