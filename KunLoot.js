//=============================================================================
// KunLoot.js
//=============================================================================
/*:
 * @filename KunLoot.js
 * @plugindesc Kun Looting and Item Pack generator
 * @version 1.2
 * @author KUN
 * 
 *
 * @help
 * 
 * KunLoot skillmenu {actorid} {skill:skill:...} {random|last|skip|disable|first} {left|middle|right} {window|dim|transparent|none} [import|filter]
 *      Displays a skill menu to select and learn for actorid (use import to import actorid from a gamevar)
 *      Use filter flag to filter out the learned skills from the list. If list remains empty, won't show skill menu.
 *      Select a cancelType option from random|last|skip|disable|first
 *      Select a layout position from left|middle|right
 *      Select a window display type from window|dim|transparent
 * 
 * KunLoot learn|learnskill {actor_id} {skill1:skill2:skill3:...} {exportVar} [import|random]
 *      Unlock a new skill for actor_id from the skill id list, from the first, to the last
 *      Use exportVar to export the skill ID added
 *      Use import tag to import actor_id from a gameVariable
 *      Use random tag to learn a random spell from the list provided
 * 
 * KunLoot loot [item1:item2:item3:...] [amount:amount:...]
 * KunLoot items [item1:item2:item3:...] [amount:amount:...]
 * KunLoot weapons [item1:item2:item3:...] [amount:amount:...]
 * KunLoot armors [item1:item2:item3:...] [amount:amount:...]
 *      Generate a loot of items, weapons or armors, given an amount to generate
 * 
 * 
 * @param debug
 * @text Debug
 * @type boolean
 * @default false
 * 
 * @param packs
 * @type struct<Loot>[]
 * @text Chests
 * @desc Build packs of Ids from items, armors, weapons or skills.
 */
/*~struct~Loot:
 * @param name
 * @type text
 * @text Pack Name
 * @desc name here all pack ids for items, armors or any types you want to group
 * @default Items
 * 
 * @param detail
 * @type text
 * @desc Pack content description (for inner dev. notes)
 * 
 * @param type
 * @type select
 * @option Default
 * @value default
 * @option Item Loot
 * @value loot
 * @option Single Item
 * @value item
 * @option Many Items
 * @value items
 * @option Single Armor
 * @value armor
 * @option Many Armors
 * @value armors
 * @option Single Weapon
 * @value weapon
 * @option Many Weapons
 * @value weapons
 * @option Skills and Magic
 * @value skills
 * @default default
 *
 * @param list
 * @type number[]
 * @text Id List
 * @desc Create a list of ids to manage this pack
 * @min 1
 * 
 * @param amount
 * @type number[]
 * @text Amount
 * @min 0
 * @max 10
 */


/**
 * @class{KunItemPacks}
 */
class KunItemPacks {
    /**
     * 
     * @returns {KunItemPacks}
     */
    constructor() {
        if (KunItemPacks.__instance) {
            return KunItemPacks.__instance;
        }

        KunItemPacks.__instance = this.initialize();
    }
    /**
     * 
     * @returns {KunItemPacks}
     */
    initialize() {

        const _parameters = KunItemPacks.PluginData();

        this._debug = _parameters.debug;

        this._packs = (_parameters.packs || []).map(pack => new KunLoot(
            pack.name,
            pack.type,
            pack.list,
            pack.amount
        ));

        //console.log(_parameters);

        return this;
    }
    /**
     * @returns {Boolean}
     */
    debug() { return this._debug; };
    /**
     * @returns {KunLoot[]}
     */
    packs(){ return this._packs; }
    /**
     * @param {String} name 
     * @returns {KunLoot}
     */
    box( name = '' ){ return this.packs().find( box => box.name() === name.toLowerCase() ) || null; }


    
    /**
     * @return {Object}
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

        return _kunPluginReaderV2('KunLoot', PluginManager.parameters('KunLoot'));
    };
    /**
     * @param {String|Object} message 
     */
    static DebugLog() {
        if (KunItemPacks.manager().debug()) {
            console.log('[ KunItemPacks ]', ...arguments);
        }
    };

    /**
     * @returns {KunItemPacks}
     */
    static manager() {
        return KunItemPacks.__instance || new KunItemPacks();
    };
}


/**
 * @class {KunPack}
 */
class KunLoot {
    /**
     * @param {String} name 
     * @param {String} type
     * @param {String} desc 
     * @param {Number[]} list 
     * @param {Number[]} amount 
     */
    constructor(name = '', type = '', desc = '', list = [], amount = []) {
        this._name = name && name.toLowerCase() || 'chest';
        this._desc = desc || '';
        this._type = type || KunLoot.ItemType.Loot;
        this._list = list || [];
        this._amount = amount || [1];
    }
    /**
     * @returns {String}
     */
    name() {
        return this._name;
    }
    /**
     * @returns {String}
     */
    type() { return this._type };
    /**
     * @returns {Number}[]
     */
    list() {
        return this._list;
    }
    /**
     * @returns {Boolean}
     */
    empty() {
        return this.list().length === 0;
    }
    /**
     * @returns {Boolean}
     */
    isSingle() {
        return KunLoot.singleTypes().includes(this.type());
    }
    /**
     * @returns {Boolean}
     */    
    isMany(){
        return KunLoot.manyTypes().includes(this.type());
    }
    /**
     * @returns {Boolean}
     */
    isItem() {
        return KunLoot.itemTypes().includes(this.type());
    }
    /**
     * @returns {Boolean}
     */
    hasAmount() {
        return KunLoot.amountTypes().includes(this.type());
    }
    /**
     * @returns {Number}
     */
    random() {
        const items = this.list();
        return items[Math.floor(Math.random() * items.length)];
    }
    /**
     * @returns {Number[]}
     */
    select() {
        if (!this.empty()) {
            if (!this.isItem() || this.isSingle()) {
                //skills
                return [this.random()];
            }
            else {
                const selection = [];
                for (var i = 0; i < this.amount(); i++) {
                    selection.push(this.random());
                }
                return selection;
            }
        }
        return [];
    }
    /**
     * @returns {Number}
     */
    amount() {
        const amount = this._amount;
        switch (true) {
            case amount.length > 2:
                return amount[Math.floor(Math.random() * amount.length)];
            case amount.length > 1:
                return Math.floor(Math.random() * (amount[1] - amount[0])) + amount[0];
            case amount.length:
                return amount[0];
        }
        return 1;
    }

    /**
     * @return {Boolean} 
     */
    loot() {
        const contents = this.select();
        switch (this.type()) {
            case KunLoot.ItemType.Loot: // loot will allow many items, multiple amounts
            case KunLoot.ItemType.Item: // Item will allow single item, by amount
                contents.forEach(item => this.addItem(item, this.amount()));
                break;
            case KunLoot.ItemType.Drop: //drops are random single items from a list
            case KunLoot.ItemType.Items: // items will allow many random items once
                contents.forEach(item => this.addItem(item, 1));
                break;
            case KunLoot.ItemType.Armor: // single armor by amount
                contents.forEach(item => this.addArmor(item, this.amount()));
                break;
            case KunLoot.ItemType.Armors: // many armors once
                contents.forEach(item => this.addArmor(item, 1));
                break;
            case KunLoot.ItemType.Weapons: //many weapons once
                contents.forEach(item => this.addWeapon(item, 1));
                break;
            case KunLoot.ItemType.Weapon: // single weapon by amount
                contents.forEach(item => this.addWeapon(item, this.amount()));
                break;
        }
        return !!contents.length;
    }
    /**
     * @param {Boolean} random
     * @returns {Number} skill_id
     */
    learn( random = false ){
        const actor_id = this.amount();
        if( this.type() === KunLoot.ItemType.Skills && actor_id ){
            const actor = $gameActors.actor( actor_id );
            if( actor ){
                const skills = this.list().filter(id => !actor.isLearnedSkill(id));
                if (skills.length) {
                    const skill = random ? skills[Math.floor(Math.random() * skills.length)] : skills[0];
                    actor.learnSkill(skill);
                    return skill;
                }            
            }
        }
        return 0;
    }

    /**
     * @param {Number} item_id 
     * @param {Number} amount 
     */
    addItem(item_id, amount = 1) {
        item_id && $gameParty.gainItem($dataItems[ Math.min(item_id,$dataItems.length) ], amount || 1 );
    };
    /**
     * @param {Number} armor_id 
     * @param {Number} amount 
     */
    addArmor(armor_id = 0, amount = 0) {
        armor_id && $gameParty.gainItem($dataArmors[ Math.min(armor_id,$dataArmors.length) ], amount || 1 );
    };
    /**
     * @param {Number} weapon_id 
     * @param {Number} amount 
     */
    addWeapon(weapon_id, amount = 0) {
        weapon_id && $gameParty.gainItem($dataWeapons[ Math.min(weapon_id,$dataWeapons.length) ], amount || 1 );
    };


    /**
     * @param {String} type 
     * @param {Number[]} items 
     * @param {Number[]} amount 
     * @returns {KunLoot}
     */
    static createLoot( type = '' , items = [] , amount = []){
        return new KunLoot(type ,type,'',items,amount);
    }

    /**
     * @param {Number} actor_id
     * @param {Number[]} skills 
     * @returns {KunLoot}
     */
    static createSkillSet( actor_id = 0, skills = [] ){
        return new KunLoot(KunLoot.ItemType.Skills,KunLoot.ItemType.Skills,'',skills || [], actor_id);
    }

    /**
     * @returns {String}[]
     */
    static singleTypes() {
        return [
            KunLoot.ItemType.Drop,
            KunLoot.ItemType.Item,
            KunLoot.ItemType.Armor,
            KunLoot.ItemType.Weapon,
        ];
    }
    /**
     * @returns {String}[]
     */
    static manyTypes() {
        return [
            KunLoot.ItemType.Loot,
            KunLoot.ItemType.Items,
            KunLoot.ItemType.Armors,
            KunLoot.ItemType.Weapons,
        ];
    }
    /**
     * @returns {String}[]
     */
    static amountTypes() {
        return [
            KunLoot.ItemType.Loot,
            KunLoot.ItemType.Item,
            KunLoot.ItemType.Armor,
            KunLoot.ItemType.Weapon,
        ];
    }
    /**
     * @returns {String}[]
     */
    static itemTypes() {
        return [
            KunLoot.ItemType.Item,
            KunLoot.ItemType.Items,
            KunLoot.ItemType.Loot,
            KunLoot.ItemType.Armor,
            KunLoot.ItemType.Armors,
            KunLoot.ItemType.Weapon,
            KunLoot.ItemType.Weapons,
        ];
    }
}

/**
 * @type {KunLoot.ItemType|String}
 */
KunLoot.ItemType = {
    Armor: 'armor',
    Armors: 'armors',
    Weapon: 'weapon',
    Weapons: 'weapons',
    Items: 'items',
    Item: 'item',
    Loot: 'loot',
    Drop: 'drop',
    //Troops: 'troops',
    Skills: 'skills',
};

/**
 * @class {KunItemPackCommand}
 */
class KunItemPackCommand {
    /**
     * @param {String[]} input 
     * @param {Game_Interpreter} context
     */
    constructor(input = [], context = null) {
        this._context = context instanceof Game_Interpreter && context || null;
        this.initialize(input);
        KunItemPacks.DebugLog(this);
    }
    /**
     * @param {String[]} input 
     * @returns {String[]}
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
        const command = content.replace(regex, '').split(' ').filter(arg => arg.length);
        this._command = command.shift();
        this._args = command;
        return this;
    }
    /**
     * @returns {String}
     */
    toString() { return `${this.command()} ${this.arguments().map( arg => `{${arg}}`).join(' ')} [${this._flags.join('|')}]`; }
    /**
     * @returns {KunItemPacks}
     */
    manager() { return KunItemPacks.manager(); }
    /**
     * @returns {Game_Interpreter}
     */
    context() { return this._context; }
    /**
     * @returns {Game_Event}
     */
    event(){ return this.context().character() || null; }
    /**
     * @param {String} flag 
     * @returns {Boolean}
     */
    has(flag = '') { return flag && this._flags.includes(flag) || false; }
    /**
     * @returns {String[]}
     */
    arguments() { return this._args; }
    /**
     * @returns {String}
     */
    command() { return this._command; }
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
     * Find any matching loot box within the templates
     * @param {String[]} args 
     * @returns {Boolean}
     */
    defaultCommand( args = []){
        return this.boxCommand( [this.command()]);
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    learnskillCommand(args = []) {
        return this.learnCommand(args);
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    spellCommand( args = []){
        return this.learnCommand(args);
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    skillCommand( args = []){
        return this.learnCommand(args);
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    learnCommand(args = []) {
        if (args.length > 1) {
            const actor_id = this.has('import') && actor_id ? $gameVariables.value(parseInt(args[0])) : parseInt(args[0]);
            const learned = KunLoot.createSkillSet(
                actor_id,
                args[1].split(':').map(id => parseInt(id))
            ).learn(this.has('random'));
            const exportVar = args.length > 2 ? parseInt(args[2]) : 0;
            if(exportVar){
                $gameVariables.setValue(exportVar,learned);
            }
            return !!learned;
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    boxCommand( args = [] ){
        const box = args[0] && this.manager().box(args[0]);
        return !!box && box.loot();
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    chestCommand( args = []){
        return this.boxCommand(args);
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    itemCommand(args = []) {
        return this.lootCommand(args);
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    weaponsCommand(args = []) {
        return this.lootCommand(args);
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    itemsCommand(args = []) {
        return this.lootCommand(args);
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    armorsCommand(args = []) {
        return this.lootCommand(args);
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    dropitemsCommand(args = []){
        return this.lootCommand( args );
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    dropCommand(args = []){
        return this.lootCommand( args );
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    lootCommand(args = []) {
        if (args.length) {
            //item id list
            const items = args[0].split(':').map(id => parseInt(id));
            //drop amounts
            const amounts = args.length > 1 ? args[1].split(':').map(value => parseInt(value)) : [1];
            return KunLoot.createLoot( this.command(), items, amounts).loot();
        }
        return false;
    }



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

    ///interpretet hacks

    /**
     * @param {String[]} labels 
     * @param {Boolean} random 
     * @returns {Boolean}
     */
    jumpToLabels( labels = [] ,random = false ){
        KunItemPacks.DebugLog(`Searching for Label in [${labels.join(',')}]... ${random && '(random)' || '(fallback)'}`);
        return random ?
            //jump to random labels in the list
            this.jumpToLabel( labels.length && labels[ Math.floor(Math.random() * labels.length) ] || '' ) :
            //jump to first available label in the list
            labels.find( lbl => this.jumpToLabel(lbl) ) || false;
    }
    /**
     * @param {String} label
     * @returns {Boolean}
     */
    jumpToLabel( label = ''){
        const context = this.context();
        if ( context && label) {
            const lbl = label.toUpperCase();
            KunItemPacks.DebugLog(`Searching for Label [${lbl}]...`);
            for (var i = 0; i < context._list.length; i++) {
                var command = context._list[i];
                if (command.code === 118 && command.parameters[0] === lbl) {
                    context.jumpTo(i);
                    KunItemPacks.DebugLog(`Jumping to Label [${lbl}]`);
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * @param {String} mode 
     * @returns {KunItemPackCommand}
     */
    setWaitMode(mode = 'message') {
        if (this.context()) {
            //set this to wait for a response
            //this.context()._index++;
            this.context().setWaitMode(mode);
        }
        return this;
    }
    /**
     * @returns {KunItemPackCommand}
     */
    waitMessage(){ return this.setWaitMode('message'); }
    /**
     * @param {Number} fps
     * @returns {KunItemPackCommand}
     */
    wait(fps = 0) {
        if (this.context() && fps) {
            this.context().wait(fps);
        }
        //return this._wait;
        return this;
    }


    /**
     * @param {Game_Interpreter} context 
     * @param {String[]} input 
     * @returns {KunItemPackCommand}
     */
    static create(context = null, input = []) {
        return context instanceof Game_Interpreter ? new KunItemPackCommand(input, context) : null;
    }
    /**
     * @returns {Boolean}
     */
    static command( command = '' ) { return ['kunloot', 'kunitems', 'kunitempack' ].includes(command.toLowerCase()); }
}


/**
 * 
 */
function KunItemPack_SetupCommands() {
    const _KunItemPack_PluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunItemPack_PluginCommand.call(this, command, args);
        if (KunItemPackCommand.command(command)) {
            KunItemPackCommand.create(this, args).run();
        }
    }
};

(function ( /* autosetup */) {
    KunItemPacks.manager();
    KunItemPack_SetupCommands();
})( /* */);

