//=============================================================================
// KunHirelings.js
//=============================================================================
/*:
 * @filename KunHirelings.js
 * @plugindesc Add Random Hirelings by class to the party and Save/Manage them in a hub!
 * @version 2.27
 * @author Kun
 * 
 * @help
 * 
 * KunHireling create hornet:mothgirl:hornet:hornet:mothgirl:hornet 5
 * KunHireling manager debug
 * 
 * 
 * COMMANDS
 * 
 *  KunHireling show|manager [type:type:type] [level] [upgradeVar] [debug]
 *  - Display the hireling manager window
 *  - Filter the hireling selection by types
 *  - Allow to define a level to create or operate on hireling progress
 *  - Set an upgradeVar game variable to allow leveling up hirelings while draining the upgradevar counter
 *  
 *  KunHireling count game_var [all|classId] [party|home]
 *  - Export the hireling count into the game_var
 *  - Define a classId|className to filter the hirelings to count. Leave to all or 0 to get them all.
 *  - Define where count the hirelings, from party or home hub (Hireling Manager home by default)
 *  
 *  KunHireling create|prepare actor_id hireling_name [level]
 *  - Prepares a new hireling in actor_id's actor slot
 *  - Defines the hireling type with hireling_name
 *  - Defines the hireling level optionally
 *  - Defines a hireling's specific variation
 * 
 *  KunHireling join actor_id hireling_name [level]
 *  - Joins a new hireling overriding actor_id's actor slot
 *  - Defines the hireling type with hireling_name
 *  - Defines the hireling level optionally
 *  - Defines a hireling's specific variation
 * 
 *  KunHireling disband [actor_id|all]
 *  - Removes hirelings from party by class
 *  - Use all instead to remove all hirelings
 *  - Set save flag to move them to the hub and join them again later
 * 
 *  KunHireling reset [all]
 *  - Resets and cleanups all hirelings
 *  - Define all to remove all active pary hireling members
 * 
 * FUNCTIONS / CONDITIONS
 * 
 * @param debug
 * @text Debug Mode
 * @type boolean
 * @default false
 * 
 * @param hirelings
 * @text Hirelings
 * @desc Hirelings are generic companions which can be duplicated from a single hireling template overriding the mapped selected characters.
 * @type struct<Hireling>[]
 * 
 * @param types
 * @parent hirelings
 * @type struct<ClassType>[]
 * @text Class Types
 * @desc Define hireling groups by class types
 * 
 * @param slots
 * @text Hireling Slots
 * @desc Available Hireling Slots (warning, reserve these actors to be oftenly overriden by this plugin)
 * @type actor[]
 * 
 * @param onCollapse
 * @text Select on collapse behaviour
 * @select
 * @option Default
 * @value deafault
 * @option Send Home
 * @value gohome
 * @option Remove (lose hireling)
 * @value remove
 * @default default
 * 
 * @param limit
 * @text Hireling Manager Limit
 * @type number
 * @min 0
 * @max 100
 * @default 0
 * 
 * @param maxBattleMembers
 * @text Max Battle Members
 * @desc Override the default max battle members available. LEave to 0 to deault or avoid conflict with other plugins
 * @type number
 * @min 0
 * @max 20
 * @default 0
 * 
 * @param homeText
 * @type text
 * @name Home Text
 * @default Hireling Home
 * 
 * @param partyText
 * @parent homeText
 * @type text
 * @name Party Text
 * @default Party
 * 
 * @param removeText
 * @parent homeText
 * @type text
 * @name Remove Hireling Text
 * @default Remove
 * 
 * @param upgradeText
 * @parent homeText
 * @type text
 * @name Upgrade Hireling Text
 * @default Upgrade
 * 
 * @param createText
 * @parent homeText
 * @type text
 * @name Create Hireling Text
 * @default Create
 * 
 * @param disbandText
 * @parent homeText
 * @type text
 * @name Disband Hireling Text
 * @default Disband
 * 
 * @param joinText
 * @parent homeText
 * @type text
 * @name Join Hireling Text
 * @default Join
 */
/*~struct~ClassType:
 * @param type
 * @text Type
 * @type text
 * @default type
 * 
 * @param class
 * @type class[]
 * @text Sub-Classes
 * @desc List here all classes from this type
 */
/*~struct~Hireling:
 * @param name
 * @text Name
 * @type text
 * @default Hireling
 * 
 * @param class
 * @text Class
 * @type class
 * @default 0
 * 
 * @param variations
 * @text Variations
 * @detail Define a list of face-character display variations
 * @type struct<Graphics>[]
 * 
 * @param names
 * @text Names
 * @type text[]
 * 
 * @param lastNames
 * @text Last Names
 * @type text[]
 * 
 * @param armorSet
 * @text Armor Set
 * @type armor[]
 * 
 * @param weaponSet
 * @text Weapons
 * @type weapon[]
 * 
 * @param itemSet
 * @text Items
 * @type item[]
 */
/*~struct~Graphics:
 * @param characterSet
 * @text character Set
 * @type file
 * @require 1
 * @dir img/characters/
 * 
 * @param characterId
 * @text Character Set Id
 * @type number
 * @min 0
 * @max 7
 * @default 1
 * 
 * @param faceSet
 * @text FaceSet
 * @type file
 * @require 1
 * @dir img/faces/
 * 
 * @param faceId
 * @text Face
 * @type number
 * @min 0
 * @max 7
 * @default 1
 * 
 * @param svBattler
 * @text SideView Battler
 * @type file
 * @require 1
 * @dir img/sv_actors/
 * 
 */

/**
 * @class {KunHirelings}
 */
class KunHirelings {
    /**
     * 
     * @returns {KunHirelings}
     */
    constructor() {
        if (KunHirelings.__instance) {
            return KunHirelings.__instance;
        }

        KunHirelings.__instance = this.initialize();
    }
    /**
     * @returns {KunHirelings}
     */
    initialize() {


        const _parameters = KunHirelings.PluginData();
        //var _parameters = this.parameters();

        this._debug = _parameters.debug;
        this._slots = _parameters.slots || [];
        this._limit = _parameters.limit || 0;
        this._maxBattleMembers = _parameters.maxBattleMembers || 0;
        this._oncollapse = _parameters.onCollapse || KunHirelings.Collapse.Default;
        //this._emptyClass = _parameters.emptyClassId || 0;
        //this._partyHas = _parameters.partyHas || false;

        this._text = {
            home: _parameters.homeText || 'Home',
            party: _parameters.partyText || 'Party',
            create: _parameters.createText || 'Create',
            remove: _parameters.removeText || 'Remove',
            disband: _parameters.disbandText || 'Send Home',
            join: _parameters.joinText || 'Join',
            upgrade: _parameters.upgradeText || 'Upgrade',
        };

        this._templates = this.importTemplates(_parameters.hirelings || []);
        this._types = this.importTypes(_parameters.types || []);
        this._home = new HirelingHome();

        return this;
    }
    /**
     * @returns {Boolean}
     */
    debug() {
        return this._debug;
    };
    /**
     * @returns {HirelingHome}
     */
    home() { return this._home; }
    /**
     * @returns {KunHirelings.Collapse|String}
     */
    oncollapse() { return this._oncollapse; }
    /**
     * @param {Object} content 
     * @returns {HirelingHome}
     */
    load(content = null) {
        if (content) {
            this._home = HirelingHome.load(content);
        }
        return this.home();
    }

    /**
     * @param {String} string 
     * @returns {String}
     */
    text(string = '') { return this._text.hasOwnProperty(string) ? this._text[string] : string; };
    /**
     * @returns {Number}
     */
    limit() { return this._limit; };
    /**
     * @returns {Number}
     */
    maxBattleMembers() { return this._maxBattleMembers };
    /**
     * @param {Number} actor_id 
     * @returns {KunHirelings}
     */
    addSlot = function (actor_id) {
        if (!this._slots.includes(actor_id)) {
            this._slots.push(actor_id);
        }
        return this;
    };
    /**
     * @returns {Number[]}
     */
    slots() { return this._slots; };
    /**
     * @param {Number} actor_id 
     * @returns {Boolean}
     */
    isHireling(actor_id = 0) {
        return actor_id && this.slots().includes(actor_id) || false;
    };
    /**
     * @param {Boolean} mapTypes 
     * @returns {HirelingTemplate[]}
     */
    templates() { return this._templates; };
    /**
     * @returns {Object}
     */
    typeData() { return this._types; }
    /**
     * @returns {String[]}
     */
    listTypes() { return Object.keys(this.typeData()); }
    /**
     * @param {Number} cls 
     * @returns {String}
     */
    classType(cls = 0) {
        return cls && this.listTypes().find(type => this.typeData()[type].includes(cls)) || '';
    }
    /**
     * @param {Number} cls 
     * @returns {String[]}
     */
    classTypes(cls = 0) {
        return cls && this.listTypes().slice().filter(type => this.typeData()[type].includes(cls)) || [];
    }
    /**
     * @returns {String[]}
     */
    random() {
        const list = this.templates().map( tpl => tpl.type());
        return list[Math.floor(Math.random() * list.length)];
    };
    /**
     * @param {String} name 
     * @returns {Boolean}
     */
    has(name = '') {
        return name && this.templates().some(tpl => tpl.type() === name) || false;
    };
    /**
     * @param {Number} actor_id 
     * @param {String} type
     * @param {Number} level (optional)
     * @returns {Game_Hireling}
     */
    create(type = '', level = 0) {
        const base = this.templates().find(tpl => tpl.type() === type) || null;
        return base && base.create(level) || null;
        //return this.has(hireling) ? this.templates()[hireling].create(level) : null;
    };



    /**
     * @param {Object[]} data 
     * @returns {Object}
     */
    importTypes(data = []) {
        const types = {};
        data.forEach(content => {
            const type = content.type.toLowerCase();
            const list = types[type] || [];
            content.class.filter(c => !list.includes(c)).forEach(c => list.push(c));
            types[type] = list;
        });
        return types;
    }

    /**
     * 
     * @param {Object[]} input 
     * @returns {KunHirelings}
     */
    importTemplates(input = []) {
        return input.map(content => {
            const tpl = new HirelingTemplate(
                content.name.toLowerCase(),
                content.class || 0,
                content.level || 0
            );
            if (Array.isArray(content.names)) {
                content.names.forEach(name => tpl.addName(name));
            }
            if (Array.isArray(content.lastNames)) {
                content.lastNames.forEach(lastName => tpl.addLastName(lastName));
            }
            if (Array.isArray(content.armorSet)) {
                content.armorSet.forEach(armor_id => tpl.addArmor(armor_id));
            }
            if (Array.isArray(content.weaponSet)) {
                content.weaponSet.forEach(weapon_id => tpl.addWeapon(weapon_id));
            }
            if (Array.isArray(content.variations)) {
                content.variations.forEach(g => {
                    tpl.addGraphics(
                        g.characterSet,
                        g.characterId,
                        g.faceSet,
                        g.faceId,
                        g.svBattler
                    );
                });
            }
            return tpl;
        });
    };
    /**
     * @param {*} content
     */
    static DebugLog() {
        if (KunHirelings.manager().debug()) {
            console.log('[ KunHirelings ]', ...arguments);
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

        return _kunPluginReaderV2('KunHirelings', PluginManager.parameters('KunHirelings'));
    };

    /**
     * @param {String\Number} className 
     * @returns {Number}
     */
    static getClassId(name = '') {
        if (name) {
            var match = $dataClasses !== null && $dataClasses.filter(cls => cls && cls.name === name) || [];
            return match.length ? match[0].id : 0;
        }
        return 0;
    };

    /**
     * @param {String[]} types
     * @param {Number} upgrade
     * @param {Boolean} create
     * @param {Boolean} debug
     */
    static show(types = [], upgrade = 0, create = false, debug = false) {
        SceneManager.push(Scene_Hirelings);
        if (SceneManager.isSceneChanging()) {
            SceneManager.prepareNextScene(types, upgrade, create, debug);
        }
    }
    /**
     * @param {String} command 
     * @returns {Boolean}
     */
    static command(command = '') {
        return ['kunhireling', 'kunhirelings'].includes(command.toLowerCase());
    }

    /**
     * @returns {KunHirelings}
     */
    static manager() { return KunHirelings.__instance || new KunHirelings(); }
}
/**
 * @type {KunHirelings.Collapse|String}
 */
KunHirelings.Collapse = {
    Default: 'default',
    Home: 'home',
    Remove: 'remove',
};


/**
 * @class {HirelingHome}
 */
class HirelingHome {
    /**
     * @returns {HirelingHome}
     */
    constructor() {

        if (HirelingHome.__instance) {
            return HirelingHome.__instance;
        }

        HirelingHome.__instance = this.reset();
    }
    /**
     * @returns {KunHirelings}
     */
    manager() { return KunHirelings.manager(); }
    /**
     * @returns {HirelingHome}
     */
    reset() {
        this._pool = [];
        return this;
    }
    /**
     * @returns {Game_Hireling[]}
     */
    pool() { return this._pool; }
    /**
     * @param {String} type
     * @returns {Game_Hireling[]}
     */
    hirelings(type = '') { return type && this.pool().filter(h => h.className() === type) || this.pool(); }
    /**
     * @returns {Game_Hireling[]}
     */
    party() { return $gameParty.allMembers().filter(actor => actor.isHireling()).map(actor => actor.hireling()); }
    /**
     * @param {String[]} types 
     * @param {Boolean} save 
     * @param {Boolean} reset 
     * @returns {Boolean}
     */
    disband( types = [] , save = false , reset = false ){
        const party = $gameParty || null;
        if( party ){
            const actors = party.hirelings().filter(actor => actor.hasClassType(types));
            actors.forEach(actor => {
                    party.removeActor(actor.actorId());
                    save && this.add(actor.hireling(reset));
                });
            return !!actors.length;
        }
        return false;
    }
    /**
     * @param {Boolean} mapnames
     * @returns {Number}
     */
    classes(mapnames = false) {
        var list = [];
        this.hirelings().map(h => h.class()).filter(id => id > 0).forEach(id => {
            if (!out.includes(id)) {
                out.push(id);
            }
        });
        return mapnames ? list.map(id => $dataClasses[id].name) : list;
    }
    /**
     * @param {String} type filter
     * @returns {Number}
     */
    count(type = '') { return this.hirelings(type).length; }
    /**
     * @returns {Boolean}
     */
    empty() {
        return this.count() === 0;
    }
    /**
     * @returns {Boolean}
     */
    full() {
        return this.manager().limit() > 0 && this.manager().limit() >= this.count();
    }
    /**
     * @param {Number} id
     * @returns {Boolean}
     */
    has(id) {
        return id >= 0 && id < this.count();
    }
    /**
     * @param {Game_Hireling} hireling
     * @returns {HirelingHome}
     */
    add(hireling) {
        if (hireling instanceof Game_Hireling && !this.full()) {
            this._pool.push(hireling);
        }
        return this;
    }
    /**
     * @returns {Game_Hireling}
     */
    last(){ return this.count() && this.pool()[this.count()-1] || null; }
    /**
     * @param {Number} index
     * @returns {HirelingHome}
     */
    drop(index = -1) {
        this.out(index);
        return this;
    }
    /**
     * @param {Number} index
     * @returns {Game_Hireling}
     */
    out(index = -1) { return this.has(index) ? this.hirelings().splice(index, 1)[0] : null; }
    /**
     * @param {Game_Hireling} hireling 
     * @returns {Boolean}
     */
    remove( hireling = null ){
        if( hireling instanceof Game_Hireling){
            const index = this.pool().indexOf(hireling);
            return index >= 0 && this.out(index) && true;
        }
        return false;
    }
    /**
     * @returns {Number[]}
     */
    available() {
        const party = $gameParty.allMembers().map(actor => actor.actorId());
        return this.manager().slots().filter(slot => !party.includes(slot));
    }
    /**
     * @returns {Number}
     */
    slot() { return this.available().length ? this.available()[0] : 0; }
    /**
     * @param {Game_Hireling} hireling 
     * @returns {Boolean}
     */
    join( hireling = null ){
        if( hireling instanceof Game_Hireling){
            const index = this.hirelings().indexOf(hireling);
            if( index >= 0){
                this.out(index);
                hireling.join();
                KunHirelings.DebugLog(`${hireling.name()} has joined the party!`);
                return true;
            }
            KunHirelings.DebugLog(`Cannot join ${hireling.name()}`);
        }
        return false;
    }
    /**
     * Send a hireling to the hub
     * @param {Number} index
     * @returns {Boolean}
     */
    hub(index = 0) {
        const actor = $gameParty.hirelings().find(actor => actor.actorId() === index) || null;
        if (actor) {
            this.add(actor.hireling());
            actor.resetHireling();
            return true;
        }
        return false;
    }
    /**
     * @param {Game_Actor} actor 
     * @returns {Boolean}
     */
    defeat(actor = null) {
        const manager = KunHirelings.manager();
        if (actor instanceof Game_Actor && manager.isHireling(actor.actorId())) {
            switch (manager.oncollapse()) {
                case KunHirelings.Collapse.Remove:
                    //remove and leave it behind /no saving
                    $gameParty.removeActor(actor.actorId());
                    return true;
                case KunHirelings.Collapse.Home:
                    //remove from party and send home
                    $gameParty.removeActor(actor.actorId());
                    this.add(actor.hireling(true));
                    return true;
                case KunHirelings.Collapse.Default:
                    break;
            }
        }
        return false;
    }
    /**
     * @param {String} type
     * @param {Number|Number[]} level or random level selection
     * @param {Boolean} join
     * @returns {Boolean}
     */
    create(type, level = 0, join = false) {

        const hireling = this.manager().create(type, level);

        if (hireling) {
            const slot = this.slot();
            if (join && slot > 0) {
                const actor = $gameActors.actor(slot);
                if (hireling.export(actor)) {
                    $gameParty.addActor(slot);
                    KunHirelings.DebugLog(`Joined ${hireling}`);
                    return true;
                }
            }
            else {
                this.add(hireling);
                KunHirelings.DebugLog(`Saved ${hireling.name(true)}`);
                return true;
            }
        }
        return false;
    }
    /**
     * @returns {HirelingHome}
     */
    preloadImages() {
        const loaded = [];
        this.hirelings().map(hireling => hireling._charSet).forEach(picture => {
            if (!loaded.includes(picture)) {
                //ImageManager.reserveFace(picture);
                ImageManager.reserveCharacter(picture);
                loaded.push(picture);
            }
        });
        return this;
    }

    /**
     * @returns {HirelingHome}
     */
    static manager() {
        return HirelingHome.__instance || new HirelingHome();
    }
    /**
     * @param {Object[]} data 
     * @returns {HirelingHome}
     */
    static load(data = []) {
        const manager = new HirelingHome();
        manager._pool = (data || []).map(hireling => Game_Hireling.load(hireling));
        return manager;
    }
}

/**
 * @type {HirelingHome.Hub|String}
 */
HirelingHome.Hub = {
    Home: 'home',
    Party: 'party',
};
/**
 * @type {HirelingHome.Actions|String}
 */
HirelingHome.Actions = {
    Move: 'move',
    Remove: 'remove',
    Create: 'create',
    Upgrade: 'upgrade',
    Invalid: 'invalid',
};




/**
 * @param {String} name 
 * @param {Number} actorClass 
 * 
 * @class {HirelingTemplate}
 */
class HirelingTemplate {
    /**
     * @param {String} type 
     * @param {Number} actorClass 
     */
    constructor(type = '', actorClass = 0) {
        this._type = type.toLowerCase() || 'hero';
        this._firstNames = [];
        this._lastNames = [];
        this._class = actorClass;
        this._graphics = [];
        this._armors = [];
        this._weapons = [];
        this._items = [];
    }
    /**
     * @returns {String}
     */
    toString() {
        return this.type();
    }
    /**
     * @returns {Number}
     */
    class() { return this._class; }
    /**
     * @param {Number} level
     * @returns {Game_Hireling}
     */
    create(level = 0) {
        const hireling = new Game_Hireling( this.name(), this.class(), level || 1);
        const graphics = this.graphics();
        if (graphics !== null) {
            hireling.setup(graphics.character, graphics.character_id, graphics.face, graphics.face_id, graphics.battler);
        }
        hireling.equip(this.armor(), this.weapon());
        //hireling.inventory(this.item());
        return hireling;
    }
    /**
     * @param {String} character
     * @param {Number} character_id
     * @param {String} face
     * @param {Number} face_id
     * @param {String} battler
     * @returns {HirelingTemplate}
     */
    addGraphics(character = '', character_id = 1, face = '', face_id = 1, battler = '') {
        this._graphics.push({
            'character': character,
            'character_id': character_id,
            'face': face,
            'face_id': face_id,
            'battler': battler,
        });
        return this;
    }
    /**
    * @param {String} name
    * @returns {KunHireling}
    */
    addName(name = '') {
        if (name && !this._firstNames.includes(name)) {
            this._firstNames.push(name);
        }
        return this;
    }
    /**
    /**
    * @param {String} name
    * @returns {KunHireling}
    */
    addLastName(lastname = '') {
        if (lastname && !this._lastNames.includes(lastname)) {
            this._lastNames.push(lastname);
        }
        return this;
    }
    /**
     * @param {Number} weapon_id
     * @returns {String}
     */
    addWeapon(weapon_id = 0) {
        if (weapon_id && !this._weapons.includes(weapon_id)) {
            this._weapons.push(weapon_id);
        }
        return this;
    }
    /**
     * @param {Number} armor_id
     * @returns {String}
     */
    addArmor(armor_id = 0) {
        if (armor_id && !this._armors.includes(armor_id)) {
            this._armors.push(armor_id);
        }
        return this;
    }
    /**
     * @returns {Object}
     */
    graphics() {
        return this._graphics.length ? this._graphics[Math.floor(Math.random() * this._graphics.length)] : null;
    }
    /**
     * @returns {String}
     */
    type() { return this._type; }
    /**
     * @param {Boolean} generate
     * @returns {String}
     */
    name() {
        const firstname = this._firstNames.length ? this._firstNames[Math.floor(Math.random() * this._firstNames.length)] : this.type();
        const lastname = this._lastNames.length ? this._lastNames[Math.floor(Math.random() * this._lastNames.length)] : '';
        return lastname.length ? firstname + ' ' + lastname : firstname;
    }
    /**
     * @returns {Number}
     */
    armor() {
        return this._armors.length ? this._armors[Math.floor(Math.random() * this._armors.length)] : 0;
    }
    /**
     * @returns {Number}
     */
    weapon() {
        return this._weapons.length ? this._weapons[Math.floor(Math.random() * this._weapons.length)] : 0;
    }
    /**
     * @param {Number} count
     * @returns {Number[]}
     */
    item(count = 1) {
        const items = [];
        if (this._items.length) {
            for (var i = 0; i < count; i++) {
                items.push(this._items[Math.floor(Math.random() * this._items.length)]);
            }
        }
        return items;
    }
};



/**
 * @param {String} name 
 * @param {Number} actorClass 
 * @param {Number} level
 * 
 * @class {Game_Hireling}
 */
class Game_Hireling {
    /**
     * @param {String} name 
     * @param {Number} actorClass 
     * @param {Number} level 
     */
    constructor(name = '', actorClass = 0, level = 1) {
        //this._type = type.toLowerCase() || 'hero';
        this._class = actorClass || 0;
        this._name = name || this.className();
        this._level = level || 1;
        this._skills = [];
        this._armors = [];
        this._weapon = 0;
        this._actorId = 0;

        this._battler = '';
        this._faceSet = '';
        this._charSet = '';
        this._faceId = 0;
        this._charId = 0;
    }
    /**
     * @returns {HirelingHome}
     */
    home() { return KunHirelings.manager().home(); }
    /**
     * Import an alive hireling from an actor profile
     * @param {Game_Actor} actor
     * @param {Boolean} reset reset this actor's level, learning and traits
     * @returns {Game_Hireling}
     */
    static import(actor = null, reset = false) {
        if (actor instanceof Game_Actor && actor.isHireling()) {
            const hireling = new Game_Hireling(
                actor._name,
                actor._classId,
                reset ? 1 : actor._level
            );
            hireling.setId(actor.actorId());
            hireling._skills = actor._skills || [];
            //target actor skills to save the individual progress for next updates
            //actor._skills
            //health and mana
            actor.recoverAll();
            hireling.setup(
                actor.characterName(),
                actor.characterIndex(),
                actor.faceName(),
                actor.faceIndex(),
                actor.battlerName());
            return hireling;
        }
        return null;
    }
    /**
     * @returns {String}
     */
    toString() { return this.className().toLowerCase(); }
    /**
     * @param {Number} actor_id
     * @returns {Game_Hireling}
     */
    setId(actor_id = 0) {
        this._actorId = actor_id;
        return this;
    }
    /**
     * @returns {Number}
     */
    id() { return this._actorId; }
    /**
     * @returns {Game_Actor}
     */
    actor() {
        return $gameActors.actor(this.id()) || null;
    }
    /**
     * @param {String} charSet
     * @param {Number} char_id
     * @param {String} faceSet
     * @param {Number} face_id
     * @param {String} battler
     * @returns {Game_Hireling}
     */
    setup(charSet = '', char_id = 0, faceSet = '', face_id = 0, battler = '') {
        this._battler = battler;
        this._faceSet = faceSet;
        this._faceId = face_id;
        this._charSet = charSet;
        this._charId = char_id;
        return this;
    }
    /**
     * @param {Number} armor
     * @param {Number} weapon
     * @returns {Game_Hireling}
     */
    equip(armor = 0, weapon = 0) {
        if (armor) {
            this._armors.push(armor);
        }
        if (weapon) {
            this._weapon = weapon;
        }
        return this;
    }
    /**
     * @param {Boolean} fullName
     * @returns {String}
     */
    name(fullName = false) { return fullName ? `${this._name} the ${this.className()}` : this._name; }
    /**
     * @returns {Number}
     */
    class() { return this._class; }
    /**
     * @returns {String}
     */
    className() {
        const cls = this.class() && $dataClasses[this.class() % $dataClasses.length] || null;
        return cls && cls.name || '';
        //return this.class() ? $dataClasses[this.class() % $dataClasses.length].name : '';
    }
    /**
     * @returns {String[]}
     */
    classTypes() {
        return [
            this.className().toLowerCase(),
            ...KunHirelings.manager().classTypes(this.class())
        ];
    }
    /**
     * @param {String} type 
     * @returns {Boolean}
     */
    isType( type = '' ){
        return !!type && this.classTypes().includes(type);
    }
    /**
     * @param {String[]} types 
     * @returns {Boolean}
     */
    isAnyOf( types = [] ){ return types.some( t => this.isType(t) ); }
    /**
     * @returns {String}
     */
    //type() { return this._type; }
    /**
     * @returns {Number}
     */
    level() { return this._level; }
    /**
     * @returns {Number[]}
     */
    skills() {
        return this._skills;
    }
    /**
     * @returns {Number[]}
     */
    armors() {
        return this._armors;
    }
    /**
     * @returns {Number}
     */
    weapon() {
        return this._weapon;
    }
    /**
     * @returns {Boolean}
     */
    join() {
        const slot = this.home().slot();
        if (slot) {
            if (this.export($gameActors.actor(slot))) {
                $gameParty.addActor(slot);
                return true;
            }
        }
        return false;
    }
    /**
     * 
     * @param {Number} amount
     * @returns {Game_Hireling} 
     */
    levelUp(amount = 1) {
        this._level += amount;
        return this;
    }
    /**
     * Add an armor definition to the template
     * @param {Number} armor
     * @returns {Game_Hireling}
     */
    addArmor(armor = 0) {
        armor && this._armors.push(armor);
        return this;
    }
    /**
     * Add a weapon definition to the template
     * @param {Number} weapon
     * @returns {Game_Hireling}
     */
    setWeapon(weapon = 0) {
        this._weapon = weapon || 0;
        return this;
    }
    /**
     * @param {Game_Actor} actor
     * @returns {Boolean}
     */
    export(actor = null, reset = false) {
        if (actor instanceof Game_Actor && actor.isHireling()) {
            actor.setName(this.name());
            actor.changeClass(this.class(), false);
            actor._level = this.level();
            actor.initExp();
            this.setupSkills(actor, reset);
            this.setupGraphics(actor);
            //this.setupEquipment(actor);
            reset && actor.setup();
            return true;
        }
        return false;
    }
    /**
     * @param {Game_Actor} actor 
     * @param {Boolean} reset
     */
    setupSkills(actor = null, reset = false) {
        if (actor instanceof Game_Actor) {
            //parse skills or reset them, as defined by the reset flag
            if (reset || this._skills.length === 0) {
                actor.initSkills();
            }
            else {
                actor._skills = this._skills || [];
            }
        }
    }
    /**
     * @param {Game_Actor} actor 
     */
    setupGraphics(actor = null) {
        if (actor instanceof Game_Actor) {
            if (this._charSet.length) {
                actor.setCharacterImage(this._charSet, this._charId);
            }
            if (this._faceSet.length) {
                actor.setFaceImage(this._faceSet, this._faceId);
            }
            if (this._battler.length) {
                actor.setBattlerImage(this._battler);
            }
        }
    }
    /**
     * @param {Game_Actor} actor 
     */
    setupEquipment(actor = null) {
        if (actor instanceof Game_Actor) {
            const equip = this.prepareEquipment();
            Object.keys(equip).forEach(slot => actor.changeEquipById(slot, equip[slot]));
        }
    }
    /**
     * @returns {Object}
     */
    prepareEquipment() {
        const slots = {};
        slots[0] = this.weapon();
        this.armors()
            .map(id => $dataArmors[id] || null)
            .filter(armor => !!armor)
            .forEach(armor => slots[armor.etypeId - 1] = armor.id);
        return slots;
    }
    /**
     * @param {Object} data 
     * @returns {Game_Hireling}
     */
    static load(data = null) {
        if (data instanceof Object) {
            const hireling = new Game_Hireling();
            Object.keys(data).forEach(key => hireling[key] = data[key]);
            return hireling;

        }
        return null;
    }
};



/**
 * 
 */
function KunHirelings_SetupDataManager() {
    //CREATE NEW
    const _KunHirelings_DataManager_Create = DataManager.createGameObjects;
    DataManager.createGameObjects = function () {
        _KunHirelings_DataManager_Create.call(this);
        //add hireling manager
        KunHirelings.manager().load();
    };
    //SAVE
    const _KunHirelings_DataManager_Save = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function () {
        const contents = _KunHirelings_DataManager_Save.call(this);
        //save hireling data
        contents.hirelings = HirelingHome.manager().hirelings();
        return contents;
    };
    //LOAD
    const _KunHirelings_DataManager_Load = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function (contents) {
        _KunHirelings_DataManager_Load.call(this, contents);
        //backwards compatibility (selecting from _pool attribute)
        const hirelings = contents.hirelings && contents.hirelings._pool || contents.hirelings;
        //load hireling data
        KunHirelings.manager().load(hirelings || []);
    };
}
/**
 * 
 */
function KunHirelings_SetupGameParty() {
    /**
     * @returns {Boolean}
     */
    Game_Actor.prototype.isHireling = function () {
        return KunHirelings.manager().isHireling(this.actorId());
    };
    /**
     * @param {Boolean} reset
     * @returns {Game_Hireling}
     */
    Game_Actor.prototype.hireling = function (reset = false) {
        return Game_Hireling.import(this, reset);
    };
    /**
     * @returns {Boolean}
     */
    Game_Actor.prototype.resetHireling = function () {
        if (this.isHireling()) {
            this.setup(this.actorId());
            if (!!$gameParty.hireling(this.actorId())) {
                $gameParty.removeActor(this.actorId());
            }
            return true;
        }
        return false;
    };
    /**
     * @param {Game_Hireling} hireling 
     * @returns {Boolean}
     */
    Game_Actor.prototype.replaceHireling = function (hireling) {
        return hireling.export(this);
    };
    /**
     * @returns {String}
     */
    Game_Actor.prototype.className = function () {
        return this._classId && $dataClasses[this._classId % $dataClasses.length].name;
    };
    /**
     * @returns {String[]}
     */
    Game_Actor.prototype.classTypes = function () {
        return [this.className().toLowerCase(), ...KunHirelings.manager().classTypes(this._classId)];
        //const className = this.className().toLowerCase();
        //const classTypes = KunHirelings.instance().classTypes(this._classId);
        //classTypes.push(className);
        //return classTypes;
    }
    /**
     * @param {String} type 
     * @returns {Boolean}
     */
    Game_Actor.prototype.isClassType = function (type = '') {
        return !!type && this.classTypes().includes(type);
    }
    /**
     * @param {String[]} types 
     * @returns {Boolean}
     */
    Game_Actor.prototype.hasClassType = function (types = []) {
        //console.log(types);
        return types.length && !!types.filter(type => this.isClassType(type)).length || true;
    }
    /**
     * @returns {String}
     */
    /*Game_Actor.prototype.hirelingType = function(){
        return KunHirelings.instance().classType(this._classId);
        //return this._hirelingType;
    }*/
    /**
     * actor down in battle override
     */
    const _KunHirelings_GameActor_Collapse = Game_Actor.prototype.performCollapse;
    Game_Actor.prototype.performCollapse = function () {
        _KunHirelings_GameActor_Collapse.call(this);
        if (this.isHireling()) {
            //remove from party, send to home or disband
            KunHirelings.manager().home().defeat(this);
        }
    };





    if (KunHirelings.manager().maxBattleMembers() > 0) {
        Game_Party.prototype.maxBattleMembers = function () {
            return KunHirelings.manager().maxBattleMembers();
        };
    }
    /**
     * List of hirelings
     * @param {String} type
     * @returns {Game_Actor[]}
     */
    Game_Party.prototype.hirelings = function (type = '') {
        const hirelings = this.allMembers().filter(actor => actor.isHireling());
        return !!type && hirelings.filter(actor => actor.isClassType(type)) || hirelings;
    };
    /**
     * @param {Number} id 
     * @returns {Game_Actor}
     */
    Game_Party.prototype.hireling = function (id = 0) {
        return this.hirelings().find(actor => actor.actorId() === id) || null;
    }


    /**
     * @param {Number} type 
     * @returns {Boolean}
     */
    Game_Party.prototype.hasHirelings = function (type = '') {
        return type ?
            !!this.hirelings().filter(actor => actor.isClassType(type)).length :
            !!this.hirelings().length;
    };
    /**
     * @param {Boolean} all
     * @param {String[]} types 
     * @param {Boolean} save
     * @param {Boolean} reset
     * @returns {Boolean}
     */
    /*Game_Party.prototype.removeHirelings = function (types = [], save = false, reset = false) {
        //console.log(types);
        const home = KunHirelings.manager().home();
        const actors = this.hirelings().filter(actor => actor.hasClassType(types));
        actors.forEach(actor => {
            this.removeActor(actor.actorId());
            save && home.add(actor.hireling(reset));
        });
        return !!actors.length;
    };*/


    /**
     * @param {Boolean} stepAnime 
     */
    Game_Follower.prototype.setStepAnime = function (stepAnime) {
        this._stepAnime = this.isHireling() || stepAnime;
    };
    /**
     * @returns {Boolean}
     */
    Game_Follower.prototype.isHireling = function () {
        //const ishireling = $gameParty.members()[this._memberIndex] && $gameParty.members()[this._memberIndex].isHireling() || false;
        const member = $gameParty.allMembers()[this._memberIndex] || null;
        const ishireling = !!member && !!$gameParty.hireling(member.actorId());
        return this.isVisible() && ishireling;
    };
};



/**
 * @class {KunHirelingCommand}
 */
class KunHirelingCommand {
    /**
     * @param {String[]} input 
     * @param {Game_Interpreter} context
     */
    constructor(input = [], context = null) {
        this._context = context instanceof Game_Interpreter && context || null;
        this.initialize(input);
        KunHirelings.DebugLog(this);
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
        const command = content.replace(regex, '').trim().split(' ');
        this._command = command[0] || '';
        this._args = command.length > 1 && command.slice(1) || [];
    }
    /**
     * @returns {String}
     */
    toString() {
        return `${this.command()} ${this.arguments().join(' ')} (${this._flags.join('|')})`;
    }
    /**
     * @returns {String[]}
     */
    arguments() { return this._args; }
    /**
     * @returns {String}
     */
    command() { return this._command; }
    /**
     * @returns {HirelingHome}
     */
    hirelings() { return KunHirelings.manager().home(); }
    /**
     * @returns {KunHirelings}
     */
    manager() { return KunHirelings.manager(); }
    /**
     * @returns {Game_Interpreter}
     */
    context() { return this._context; }
    /**
     * @param {String} flag 
     * @returns {Boolean}
     */
    has(flag = '') { return flag && this._flags.includes(flag) || false; }
    /**
     * @param {String} mode 
     * @returns {KunHirelingCommand}
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
     * @param {Number} fps
     * @returns {KunHirelingCommand}
     */
    wait(fps = 0) {
        if (this.context() && fps) {
            this.context().wait(fps);
        }
        //return this._wait;
        return this;
    }

    /**
     * @returns {Boolean}
     */
    run() {
        const commandName = `${this.command()}Command`;
        if (typeof this[commandName] === 'function') {
            this[commandName](this.arguments());
            return true;
        }
        this.defaultCommand(this.arguments());
        return false;
    }
    /**
     * @param {String} args 
     */
    defaultCommand(args = []) {
        KunHirelings.DebugLog(`Invalid command ${this.toString()}`);
    }
    /**
     * @param {String[]} args 
     */
    showCommand(args = []) {
        KunHirelings.show(
            args[0] && args[0] !== 'all' && args[0].split(':') || [],   //filter
            args[1] && parseInt(args[1]) || 0,      //Upgrade var. Level up any hireling with a game variable counter 
            this.has('create'),                //enable create Command
            this.has('debug'),                 //enable debug
        );
    }
    /**
     * @param {String[]} args 
     */
    createCommand(args = []) {
        if (args.length) {
            const levels = args[1] && args[1].split(':').map(level => parseInt(level)) || [1];
            args[0].split(':').forEach(name => {
                this.hirelings().create(
                    name.toLowerCase(),
                    levels[Math.floor(Math.random() * levels.length)]
                );
            });
        }
    }
    /**
     * @param {String[]} args 
     */
    joinCommand(args = []) {
        if (args.length) {
            const levels = args[1] && args[1].split(':').map(level => parseInt(level)) || [1];
            this.hirelings().create(
                args[0].toLowerCase(),
                levels[Math.floor(Math.random() * levels.length)],
                true);
        }
    }
    /**
     * @param {String[]} args 
     */
    disbandCommand(args = []) {
        if ($gameParty.hirelings().length) {
            const types = args[0] && args[0].split(':') || [];
            if( this.hirelings().disband(types,this.has('save'))){
                KunHirelings.DebugLog(`Disbanded ${types}`);
            }
        }
    }
    /**
     * @param {String[]} args 
     */
    resetCommand(args = []) {
        this.hirelings().disband();
        this.hirelings().reset();
    }
    /**
     * @param {String[]} args 
     */
    countCommand(args = []) {
        if (args.length) {
            const type = args[1] || '';
            const party = this.has('party');
            const count = party ?
                $gameParty.hirelings(type).length :
                this.hirelings().count(type);
            $gameVariables.setValue(parseInt(args[0]), count);
        }
    }

    ////COMMAND ALIAS
    /**
     * @param {String[]} args 
     */
    managerCommand(args = []) {
        this.showCommand(args);
    }
    /**
     * @param {String[]} args 
     */
    prepareCommand(args = []) {
        this.createCommand(args);
    }
    /**
     * @param {String[]} args 
     */
    addCommand(args = []) {
        this.joinCommand(args);
    }


    /**
     * @param {Game_Interpreter} interpreter 
     * @param {String[]} input 
     * @returns {KunHirelingCommand}
     */
    static create(interpreter = null, input = []) {
        return interpreter instanceof Game_Interpreter ? new KunHirelingCommand(input, interpreter) : null;
    }
    /**
     * @returns {Boolean}
     */
    static isCommand(command = '') {
        return ['kunhireling', 'kunhirelings'].includes(command.toLowerCase());
    };
}


/**
 * 
 */
function KunHirelings_SetupCommands() {
    const _KunHirelings_Commands = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunHirelings_Commands.call(this, command, args);
        if (KunHirelingCommand.isCommand(command)) {
            KunHirelingCommand.create(this, args).run();
        }
    };
};

/**
 * 
 */
function KunHirelings_SetupEscapeChars() {
    //Window_Base.prototype.JayaKSetup_escapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    const _KunHirelings_Escape_Characters = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        return _KunHirelings_Escape_Characters.call(this, text)
            .replace(/\{LAST_HIRELING\}/g, function () {
                const hireling = KunHirelings.manager().home().last();
                return hireling && hireling.name() || '';
            }.bind(this));
    };
}

/***********************************************************************************
 * @Scene_Hirelings
 * HIRELING SCENE HUB
 **********************************************************************************/
class Scene_Hirelings extends Scene_Base {
    /**
     * 
     */
    constructor() {
        super(...arguments);
        //this.initialize(arguments);

        this._types = [];
        this._upgradeVar = 0;
        this._debug = false;
        this._create = false;
    }
    //SETUP HIRELING MANAGER
    initialize() {
        super.initialize();
    }
    /**
     *
     */
    create() {
        super.create();
        this.createBackground();
        this.createWindowLayer();
        this.setupHome();
        this.setupList();
        this.setupActions();

        this.reload();
    }
    createBackground() {
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
        this.addChild(this._backgroundSprite);
    }
    /**
     * @param {String[]} types 
     * @param {Number} upgradeVar
     * @param {Boolean} create
     * @param {Boolean} debug
     */
    prepare(types = [], upgradeVar = 0, create = false, debug = false) {
        this._create = create || false;
        this._debug = debug || false;
        this._types = types || [];
        this._upgradeVar = upgradeVar || 0;
    }
    /**
     * @returns {KunHirelings}
     */
    setup() { return KunHirelings.manager(); }
    /**
     * @returns {String[]}
     */
    types() {
        return this._types;
    }
    /**
     * @returns {HirelingTemplate[]}
     */
    templates() {
        const templates = KunHirelings.manager().templates();
        const filter = this.types();
        return filter.length ? templates.filter(tpl => filter.includes(tpl.type())) : templates;
    }
    /**
     * @returns {HirelingHome}
     */
    home() { return KunHirelings.manager().home(); }
    /**
     * @returns {Boolean}
     */
    debug() {
        return this._debug;
    }
    /**
     * @returns {String[]}
     */
    randomTypes() {
        const list = this.templates().map(tpl => tpl.type());
        return list[Math.floor(Math.random() * list.length)];
    }
    /**
     * @returns {String}
     */
    hub() {
        return this._headerWindow.selected();
    }
    /**
     * @returns {Boolean}
     */
    isHome() {
        return this.hub() === HirelingHome.Hub.Home;
    }
    /**
     * @returns {Number}
     */
    index() {
        return this._hirelingWindow.index();
    }
    /**
     * @returns {Boolean}
     */
    hasItems() {
        return this.index() > -1;
    }
    /**
     * @returns {Game_Hireling}
     */
    item() {
        console.log(this.index());
        return this.hireling(this.index());
        //const index = this.index();
        //return index >= 0 && this._hirelingWindow.items()[index % this._hirelingWindow.maxItems()] || null;
    }
    /**
     * @param {Number} index 
     * @returns {Game_Hireling}
     */
    hireling( index = 0 ){
        return this._hirelingWindow.items()[Math.max(index,0) % this._hirelingWindow.maxItems()] || null;
    }
    /**
     * @returns {Number[]}
     */
    classes() {
        return this.home().classes();
    }

    /**
     *
     */
    selectHub() {
        if (this.count()) {
            this._headerWindow.deactivate();
            this._actionWindow.setHub(this.hub()).activate();
            this._actionWindow.toggleCreate(this.isHome());
        }
        else {
            //play buzzer
            this._headerWindow.activate();
        }
    }
    /**
     *
     */
    cancelHome() {
        this.popScene();
    }
    /**
     *
     */
    reload() {
        this._hirelingWindow.change(this.hub());
    }
    /**
     * @returns {Number}
     */
    count() {
        return this._hirelingWindow.items().length;
    }
    /**
     *
     */
    setupHome() {
        this._headerWindow = new Window_HirelingHeader();
        this._headerWindow.setHandler('ok', this.selectHub.bind(this));
        this._headerWindow.setHandler('cancel', this.cancelHome.bind(this));
        this._headerWindow.setHandler('change', this.reload.bind(this));
        this.addWindow(this._headerWindow);
    }
    /**
     *
     */
    setupList() {
        this._hirelingWindow = new Window_Hirelings(this._types.map(type => type.toLowerCase()));
        this._hirelingWindow.reserveCharacterImages();
        this._hirelingWindow.refresh();
        this.addWindow(this._hirelingWindow);
    }
    /**
     *
     */
    setupActions() {
        this._actionWindow = new Window_HirelingActions(this._upgradeVar, this._create || false);
        this._actionWindow.setHandler('ok', this.actionOk.bind(this));
        this._actionWindow.setHandler('cancel', this.actionBack.bind(this));
        this.addWindow(this._actionWindow);
    }
    /**
     *
     */
    actionOk() {
        const action = this._actionWindow.action();
        switch (action) {
            case HirelingHome.Actions.Create:
                this.home().create(this.randomTypes(), 1);
                break;
            case HirelingHome.Actions.Move:
                if (this.transfer()) {
                    this.updateIndex();
                }
                break;
            case HirelingHome.Actions.Remove:
                if (this.remove()) {
                    this.updateIndex();
                    //this._hirelingWindow.select(Math.max(this._hirelingWindow.index(), -1));
                }
                break;
            case HirelingHome.Actions.Upgrade:
                //level up binding a gamevariable
                this.levelUp();
                break;
        }
        this._hirelingWindow.refresh();
        if (this.count() === 0) {
            this.actionBack();
        }
    }
    /**
     * @returns {Scene_Hirelings}
     */
    updateIndex() {
        const index = this.count() ? Math.max(this._hirelingWindow.index() - 1, 0) : -1;
        this._hirelingWindow.select(index);
        return this;
    }
    /**
     * @param {Game_Hireling} hireling
     * @param {Boolean} remove do not save in hireling home, will be lost.
     * @returns {Boolean}
     */
    disband(hireling, remove = false) {
        if (hireling !== null && $gameParty.hireling(hireling.id())) {
            $gameParty.allMembers()
                .filter(actor => actor.isHireling() && actor.actorId() === hireling.id())
                .forEach(actor => actor.setup(actor.actorId()));
            $gameParty.removeActor(hireling.id());
            if (!remove) {
                this.home().add(hireling);
            }
            return true;
        }
        return false;
    }
    /**
     * 
     */
    levelUp() {
        const hireling = this.item();
        const amount = this._upgradeVar && $gameVariables.value(this._upgradeVar) || 0;
        if (hireling && amount) {
            hireling.levelUp(1);
            //level up, remove amount
            $gameVariables.setValue(this._upgradeVar, --amount);
        }
    }
    /**
     */
    transfer() {
        switch (this.hub()) {
            case HirelingHome.Hub.Party:
                //Send to hub
                return this.disband(this.item());
            case HirelingHome.Hub.Home:
                //send to party
                return this.home().join(this.item());
        }
        return false;
    }
    /**
     * @returns {Boolean}
     */
    remove() {
        switch (this.hub()) {
            case HirelingHome.Hub.Party:
                return this.disband(this.item(), true);
            case HirelingHome.Hub.Home:
                return this.home().remove(this.item());
        }
        return false;
    }
    /**
     * @param {Game_Hireling} hireling
     * @returns {Boolean}
     */
    partyRemove(id) {
        if ($gameParty.hireling(id)) {
            $gameParty.removeActor(id);
            return true;
        }
        return false;
    }
    actionBack() {
        this._actionWindow.deactivate();
        this._headerWindow.activate();
    }
    /**
     *
     */
    update() {
        Scene_Base.prototype.update.call(this);
    }
}


/***********************************************************************************
 * @Window_HirelingHeader
 * HOME SELECTION
 **********************************************************************************/
/**
 * @class {Window_HirelingHeader}
 */
class Window_HirelingHeader extends Window_HorzCommand {
    /**
     * 
     */
    constructor() {
        super(...arguments);
    }
    /**
     * 
     */
    initialize() {
        super.initialize(0, 0);
    }
    /**
     * @returns {KunHirelings}
     */
    manager() { return KunHirelings.manager(); }
    /**
     * @returns {Number}
     */
    windowWidth() {
        return Graphics.boxWidth;
    }
    /**
     * @returns {Number}
     */
    windowHeight() {
        return 80;
    }

    /**
     * 
     */
    makeCommandList() {
        this.addCommand(this.manager().text('home'), HirelingHome.Hub.Home);
        this.addCommand(this.manager().text('party'), HirelingHome.Hub.Party);
    }
    /**
     * @returns {String}
     */
    selected() {
        return this.index() >= 0 ? this.commandSymbol(this.index()) : HirelingHome.Hub.Home;
    }
    /**
     * @returns {Number}
     */
    numVisibleRows() {
        return 1;
    }
    /**
     * @returns {Number}
     */
    maxCols() {
        return 2;
    }
    /**
     * @returns {String}
     */
    itemTextAlign() {
        return 'center';
    }
    /**
     * 
     * @param {Number} index 
     */
    select(index = 0) {
        super.select(index);
        this.callHandler('change');
    }
    /**
     * 
     */
    toggleCommands() {
        this._list.forEach(cmd => cmd.enabled = this.active);
    }
    /**
     *
     */
    activate() {
        super.activate();
        this.refresh();
    }
    /**
     *
     */
    deactivate() {
        super.deactivate();
        this.refresh();
    }
    /**
     * Avoid overriding drawText from other plugins
     * @param {Number} index 
     */
    drawItem(index = 0) {
        const rect = this.itemRectForText(index);
        const align = this.itemTextAlign();
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
    };
    /**
     * 
     */
    refresh() {
        this.toggleCommands();
        super.refresh();
    }
}


/***********************************************************************************
 * @Window_Hirelings
 * HIRELING SELECTION LIST
 **********************************************************************************/
/**
 * @class {Window_Hirelings}
 */
class Window_Hirelings extends Window_Selectable {
    /**
     * 
     */
    constructor() {
        super(...arguments);
    }
    /**
     * @returns {HirelingHome}
     */
    manager() {
        return KunHirelings.manager().home();
    }
    /**
     * @param {String[]} types
     */
    initialize(types = []) {
        super.initialize(0, 80, this.windowWidth(), this.windowHeight());
        this._source = HirelingHome.Hub.Home;
        this._types = types || [];
    }

    /**
     * @returns {Game_Hireling[]}
     */
    hirelings() {
        const types = this._types || [];
        return types.length ?
            this.manager().hirelings().filter(hireling => hireling.isAnyOf(types) ) :
            this.manager().hirelings();
    }
    /**
     *
     */
    reserveCharacterImages() {
        this.preloadImages();
        this.hirelings()
            .map(hireling => hireling.actor())
            .filter(actor => !!actor)
            .forEach(actor => { actor && ImageManager.reserveCharacter(actor.characterName()); });
    }
    /**
     * 
     */
    preloadImages() {
        this.manager().preloadImages();
    }
    /**
     * @returns {Number}
     */
    windowHeight() {
        return Graphics.boxHeight - 160;
    }
    /**
     * @returns {Number}
     */
    windowWidth() {
        return Graphics.boxWidth;
    }
    /**
     * @param {String} source
     */
    change(source = '') {
        if (this._source !== source) {
            this._source = source;
            this.refresh();
        }
    }
    /**
     * 
     */
    refresh() {
        this.toggle();
        super.refresh();
    }
    /**
     * 
     */
    toggle() {
        if (this.items().length === 0) {
            this.deactivate();
            this.select(-1);
        }
        else if (!this.active) {
            //this._index = 0;
            this.select(0);
            this.activate();
        }
    }
    /**
     * @returns {Game_Hireling[]}
     */
    items() {
        return this._source === HirelingHome.Hub.Party ? this.manager().party() : this.hirelings();
    }
    /**
     * @returns {Number}
     */
    maxItems() {
        return this.items().length;
    }
    /**
     * @returns {Game_Hireling}
     */
    item() {
        var index = this.index();
        return this.maxItems() && index >= 0 ? this.items()[index] : null;
    }
    /**
     * @returns {Game_Hireling}
     */
    first() {
        return this.maxItems() ? this.items()[0] : null;
    }
    /**
     * @param {Number} index
     */
    drawItem(index) {
        if (this.maxItems() && index >= 0) {
            this.drawItemBackground(index);
            this.drawItemImage(index);
            this.drawItemStatus(index);
        }
    }
    drawItemBackground(index) {
        if (index === this._pendingIndex) {
            var rect = this.itemRect(index);
            var color = this.pendingColor();
            this.changePaintOpacity(false);
            this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, color);
            this.changePaintOpacity(true);
        }
    }
    /**
     * @param {Number} index
     */
    drawItemImage(index) {
        var hireling = this.items()[index];
        var rect = this.itemRect(index);
        this.drawHireling(hireling, rect.x, rect.y);
        //this.changePaintOpacity(true);
    }
    /**
     * @param {Game_Hireling} hireling
     * @param {Number} x
     * @param {Number} y
     */
    drawHireling(hireling, x = 0, y = 0) {
        //this.drawFace(hireling._faceSet, hireling._faceId, x, y, Window_Base._faceWidth / 2, Window_Base._faceHeight / 2);
        this.drawCharacter(hireling._charSet, hireling._charId, x + 24, y + (this.itemHeight() * 3 / 4));
    }
    /**
     * @param {Number} index
     */
    drawItemStatus(index = 0) {
        var hireling = this.items()[index];
        var rect = this.itemRect(index);
        var x = rect.x + 80;
        var y = rect.y + rect.height / 2 - this.lineHeight() * 1.5;
        var width = rect.width - x - this.textPadding();
        //this.drawActorSimpleStatus(actor, x, y, width);
        //var rect = this.itemRect(index);
        this.drawText(hireling.name(true), x, y, width, 'left');
        this.drawText('Level: ' + hireling.level(), x, y, width, 'right');
        this.drawSkills(hireling, x, y + 40);
    }
    /**
     * @param {Game_Hireling} hireling
     * @param {Number} x
     * @param {Number} y
     * @returns {Number[]}
     */
    drawSkills(hireling = null, x = 0, y = 0) {
        var skills = hireling instanceof Game_Hireling ? hireling.skills()
            .filter(id => id > 0)
            .map(skill => $dataSkills[skill].iconIndex) : [];
        for (var i in skills) {
            this.drawIcon(skills[i], x + (i * 40), y);
        }
    }
    /**
     * @returns {Number}
     */
    itemHeight() {
        var clientHeight = this.windowHeight() - this.padding * 2;
        return Math.floor(clientHeight / this.numVisibleRows());
    }
    /**
     * @returns {Number}
     */
    numVisibleRows() {
        return 4;
    }
    /**
     * @returns {Number}
     */
    maxCols() {
        return 1;
    }
    /**
     * @returns {String}
     */
    itemTextAlign() {
        return 'center';
    }
    /**
     * 
     * @returns 
     */
    processOk() {
        return;
        if (this.isCurrentItemEnabled()) {
            this.playOkSound();
            this.updateInputData();
            this.deactivate();
            this.callOkHandler();
        } else {
            this.playBuzzerSound();
        }
    }
    /**
     * 
     * @returns 
     */
    processCancel() {
        return;
        SoundManager.playCancel();
        this.updateInputData();
        this.deactivate();
        this.callCancelHandler();
    }
    /**
     * 
     */
    processCursorMove() {
        if (this.isCursorMovable()) {
            var lastIndex = this.index();
            if (Input.isRepeated('down') && lastIndex < this.items().length - 1) {
                this.cursorDown(Input.isTriggered('down'));
            }
            if (Input.isRepeated('up') && lastIndex > 0) {
                this.cursorUp(Input.isTriggered('up'));
            }
            if (Input.isRepeated('right')) {
                this.cursorRight(Input.isTriggered('right'));
            }
            if (Input.isRepeated('left')) {
                this.cursorLeft(Input.isTriggered('left'));
            }
            if (!this.isHandled('pagedown') && Input.isTriggered('pagedown')) {
                this.cursorPagedown();
            }
            if (!this.isHandled('pageup') && Input.isTriggered('pageup')) {
                this.cursorPageup();
            }
            if (this.index() !== lastIndex) {
                SoundManager.playCursor();
            }
        }
    }
}


/***********************************************************************************
 * @Window_HirelingActions
 * HIRELING ACTIONS [join | disband | remove | ...]
 **********************************************************************************/
/**
 * @class {Window_HirelingActions}
 */
class Window_HirelingActions extends Window_HorzCommand {
    /**
     * 
     */
    constructor() {
        super(...arguments);
    }
    /**
     * @param {Number} upgradeVar
     * @param {Boolean} canCreate
     */
    initialize(upgradeVar = 0, canCreate = false) {

        this._upgradeVar = upgradeVar || 0;
        this._canCreate = canCreate || false;

        this.setHub();
        super.initialize(0, Graphics.boxHeight - 80);
        this.deactivate();
    }
    /**
     * @returns {KunHirelings}
     */
    manager() { return KunHirelings.manager(); }
    /**
     * @returns {Boolean}
     */
    canUpgrade() { return this._upgradeVar && $gameVariables.value(this._upgradeVar) || false; }
    /**
     * @returns {Boolean}
     */
    canCreate() { return this._canCreate }
    /**
     * @returns {Number}
     */
    windowWidth() {
        return Graphics.boxWidth;
    }
    /**
     * @returns {Number}
     */
    windowHeight() { return 80; }
    /**
     * @returns {String}
     */
    itemTextAlign() { return 'center'; }
    /**
     * 
     */
    toggleCreate(enabled = false) {
        const index = this.findSymbol('create');
        if (index >= 0) {
            this._list[index].enabled = enabled || false;
            this.refresh();
        }
    }
    /**
     * 
     */
    makeCommandList() {
        if (this.canCreate()) {
            this.addCommand('create', HirelingHome.Actions.Create);
        }
        if (this.canUpgrade()) {
            this.addCommand('upgrade', HirelingHome.Actions.Upgrade);
        }
        this.addCommand('move', HirelingHome.Actions.Move);
        //this.addCommand(KunHirelings.text('create'), HirelingHome.Actions.Create);
        this.addCommand('remove', HirelingHome.Actions.Remove);
    }
    /**
     * @param {Number} index
     * @returns {String}
     */
    commandName(index = 0) {
        const name = super.commandName(index);
        const home = this.hub() === HirelingHome.Hub.Home;
        const title = name === 'move' ? home && 'join' || 'disband' : name;
        return this.manager().text(title);
    }
    /**
     * @param {String} hub
     * @returns {Window_HirelingActions}
     */
    setHub(hub = HirelingHome.Hub.Home) {
        this._hub = hub;
        return this;
    }
    /**
     * @returns {String}
     */
    hub() { return this._hub; }
    /**
     * @returns {String}
     */
    action() {
        return this.index() >= 0 ? this.commandSymbol(this.index()) : HirelingHome.Actions.Invalid;
    }
    /**
     * @returns {Number}
     */
    maxCols() {
        return this.maxItems();
        //return 2;
    }
    /**
     * 
     */
    processOk() {
        if (this.isCurrentItemEnabled()) {
            this.playOkSound();
            this.updateInputData();
            //this.deactivate();
            this.callOkHandler();
        } else {
            this.playBuzzerSound();
        }

    }
    /**
     *
     */
    activate() {
        super.activate();
        this.refresh();
    }
    /**
     *
     */
    deactivate() {
        super.deactivate();
        this.refresh();
    }
    /**
     * Avoid overriding drawText from other plugins
     * @param {Number} index 
     */
    drawItem(index = 0) {
        const rect = this.itemRectForText(index);
        const align = this.itemTextAlign();
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
    };
    /**
     * Show or hide commands when toggled
     */
    refresh() {
        if (this.contents) {
            this.contents.clear();
            this.toggle();
        }
    }
    /**
     * 
     */
    toggle() {
        if (this.active) {
            this.drawAllItems();
            this.reselect();
            this.select(0);
        }
        else {
            this.deselect();
        }
    }
};


(function ( /* args */) {
    KunHirelings.manager();
    KunHirelings_SetupDataManager();
    KunHirelings_SetupGameParty();
    KunHirelings_SetupCommands();
    KunHirelings_SetupEscapeChars();
})( /* initializer */);

