//=============================================================================
// KunFollowers.js
//=============================================================================
/*:
 * @filename KunFollowers.js
 * @plugindesc Add Randomly generated Hirelings by class and generic NPCs to the party. Handle the party max size in game!
 * @version 1.24
 * @author Kun
 * 
 * @help
 * 
 * Add Guest Actors to the Followers queue.
 * 
 * They won't fight, they can be joined several times (as much as Maximum Guests are allowed).
 * 
 * Define the guests which can be joined in Allowed Followers list.
 * 
 * Set the actor 
 * 
 * COMMANDS
 * 
 *  KunFollower add actor_id [amount]
 *  - Add an actor ID to the guest followers.
 *  - Define how many by number if required.
 * 
 *  KunFollower remove actor_id [all] [game_var]
 *  - Remove an actor from the guest followers
 *  - Remove them all if required. (optional)
 *  - Export removed guests to game_var if defined (optional)
 * 
 *  KunFollower count actor_id game_var
 *  - Export the actor_id guest count into the given GameVariable
 * 
 *  KunFollower max-followers game_var
 *  - Export the the maximum number of followers available
 * 
 *  KunFollower max-guests game_var
 *  - Export the the maximum number of guests available
 * 
 *  KunFollower increase [followers | guests] [amount]
 *  - Increase the number of followers|guests in the party
 *  - Define the amount to increase the party, default to 1
 * 
 *  KunFollower decrease [followers | guests] [amount]
 *  - Decrease the number of followers|guests in the party
 *  - Define the amount to decrease the party, default to 1
 * 
 *  KunFollower add-hireling hireling_id|hireling_name [level] [exportVar]
 *  - Adds a hireling in party if there's enough room available
 *  - Defines/Resets the hireling level if required
 *  - Exports the joined ActorId if requested
 * 
 *  KunFollower count-hirelings countVar [maxVar]
 *  - Exports the number of active hirelings in party
 *  - Exports the max number of allowed hirelings if required
 * 
 *  KunFollower setup-hireling hireling_id|hireling_name actor_id [level]
 *  - Overrides the selected actor_id slot (if defined as hireling slots in this plugin) with the selected hireling template
 * 
 * 
 * FUNCTIONS / CONDITIONS
 * 
 *  kun_follower_add_guest( actor_id , [amount : 1 ] )
 *  - Define the actor ID to add to add as a guest follower.
 *  - Define how many guests of this type are required. Default is 1. (optional)
 *  - Return TRUE if the actor was added successfully.
 * 
 *  kun_follower_remove_guest( actor_id , [remove_all : false] , [game_var] )
 *  - Remove a given guest follower
 *  - Remove all the same type if required (optional)
 *  - Export removed guests to game_var if defined (optional)
 *  - Return TRUE if the actor or actors were removed successfully.
 * 
 *  kun_follower_count( actor_id )
 *  - REturn all actor_id instances in the guests queue
 * 
 * 
 * @param followers
 * @text Maximum Followers
 * @desc How many followers can join the party
 * @type number
 * @min 0
 * @max 10
 * @default 4
 * 
 * @param guests
 * @text Maximum Guests
 * @desc How many guests can follow?
 * @type number
 * @min 0
 * @max 10
 * @default 0
 * 
 * @param templates
 * @text Allowed Guests
 * @parent guests
 * @desc Allow to "guest" these followers only.
 * @type actor[]
 * 
 * @param hirelings
 * @text Hirelings
 * @desc Hirelings are generic companions which can be duplicated from a single hireling template overriding the mapped selected characters.
 * @type struct<Hireling>[]
 * 
 * @param hirelingSlots
 * @parent hirelings
 * @text Hireling Slots
 * @desc Available Hireling Slots (warning, reserve these actors to be oftenly overriden by this plugin)
 * @type Actor[]
 * 
 * @param debug
 * @text Debug Mode
 * @type Boolean
 * @default false
 * 
 * 
 */
/*~struct~Hireling:
 * @param name
 * @text Name
 * @type text
 * @default Hireling
 * 
 * @param level
 * @text Default Level
 * @type number
 * @min 1
 * @max 99
 * @default 1
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
 * @text Random Names
 * @type text[]
 * 
 * @param armorSet
 * @text Armor Set
 * @type armor[]
 * 
 * @param weaponSet
 * @text Weapons
 * @type weapon
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
 * @default 0
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
 * @default 0
 * 
 * @param svBattler
 * @text SideView Battler
 * @type file
 * @required 1
 * @dir img/sv_actors/
 * 
 */
/**
 * @description KUN Modules
 * @type KUN
 */
var KUN = KUN || {};

function KunFollowers() {
    throw `${this.constructor.name} is a Static Class`;
}

KunFollowers.Initialize = function () {

    var _parameters = this.PluginManager();

    this._debug = _parameters.debug === 'true';
    this._guestSlots = parseInt(_parameters.guests) || 0;
    this._partySlots = parseInt(_parameters.followers) || 0;
    this._guests = [];
    this._hirelings = [];
    this._hirelingTemplates = {};
    this._hirelingNames = [];



    (_parameters.templates.length > 0 ? JSON.parse(_parameters.templates) : []).map(actor_id => parseInt(actor_id)).forEach(function (actor_id) {
        KunFollowers.addGuest(actor_id);
    });

    (_parameters.hirelingSlots.length > 0 ? JSON.parse(_parameters.hirelingSlots) : []).map(actor_id => parseInt(actor_id)).forEach(function (actor_id) {
        KunFollowers.addHirelingSlot(actor_id);
    });

    (_parameters.hirelings.length > 0 ? JSON.parse(_parameters.hirelings) : []).forEach(function (hireling) {
        var _tpl = KunHireling.Import(hireling);
        if (hireling !== null) {
            KunFollowers.addHirelingTemplate(_tpl);
        }
    });

};

/**
 * @returns Boolean
 */
KunFollowers.debug = function () {
    return this._debug;
};
/**
 * @param {Number} actor_id 
 * @returns 
 */
KunFollowers.addGuest = function (actor_id) {
    if (!this._guests.contains(actor_id)) {
        this._guests.push(actor_id);
    }
    return this;
};
/**
 * @param {Number} actor_id 
 * @returns Boolean
 */
KunFollowers.hasGuest = function( actor_id ){
    return this._guests.contains( actor_id );
};
/**
 * @param {Number} actor_id 
 * @returns Boolean
 */
KunFollowers.hasHireling = function( actor_id ){
    return this._hirelings.contains( actor_id );
};
/**
 * @param {Number} actor_id 
 * @returns KunFollowers
 */
KunFollowers.addHirelingSlot = function (actor_id) {
    if (!this._hirelings.contains(actor_id)) {
        this._hirelings.push(actor_id);
    }
    return this;
};
/**
 * @param {KunHireling} hirelingTpl 
 * @returns KunFollowers
 */
KunFollowers.addHirelingTemplate = function (hirelingTpl) {
    if (hirelingTpl instanceof KunHireling) {
        if (!this._hirelingTemplates.hasOwnProperty(hirelingTpl.name())) {
            this._hirelingTemplates[hirelingTpl.name().toLowerCase()] = hirelingTpl;
        }
    }
    return this;
};
/**
 * 
 * @param {Number|String} hireling_id 
 * @param {Number} actor_id 
 * @param {Number} level (optional)
 * @param {Number} variation (optional)
 * @returns Boolean
 */
KunFollowers.updateHireling = function (hireling_id, actor_id, level, variation) {

    var _overriden = false;
    if (typeof hireling_id !== 'string') {
        hireling_id = this.getHirelingName(hireling_id);
    }

    if (hireling_id.length > 0 && this._hirelingTemplates.hasOwnProperty(hireling_id)) {
        var _overriden = this._hirelingTemplates[hireling_id].overrideActor(actor_id, level, variation);
    }

    return _overriden;
};
/**
 * Join a hireling in party
 * @param {String|Number} hireling 
 * @param {Number} level  (optional)
 * @param {Number} variation (optional)
 * @returns Number The joined Hireling actor ID or 0 if failure
 */
KunFollowers.joinHireling = function (hireling, level, variation) {
    var _slot = this.availableHirelingSlot();
    var _available = $gameParty.maxBattleMembers() > $gameParty.size();
    //console.log( `${_slot} , ${_available}`);
    if (_slot > -1 && _available) {
        var _actor_id = this._hirelings[_slot];
        if (this.updateHireling(hireling, _actor_id, level, variation)) {
            $gameParty.addActor(_actor_id);
            if (this._debug) {
                console.log(`Hireling Id${_actor_id}: ${hireling}(${level || 1}) - Slot: ${_slot}  - Available: ${_available}`);
            }
            return _actor_id;
        }
    }
    return 0;
};
/**
 * Remove the selected hirelings in party by actor_id or actor class
 * @param {Number|String} selection 
 */
KunFollowers.removeHirelings = function (selection) {
    switch (typeof selection) {
        case 'string':
            var _hireling = this.getHireling(selection);
            if (_hireling !== null) {
                this.partyHirelings().forEach(function (actor_id) {
                    if ($gameActors.actor(actor_id).currentClass() === _hireling.class().name) {
                        $gameParty.removeActor(actor_id);
                    }
                });
            }
            break;
        case 'number':
            if (this._hirelings.contains(selection)) {
                $gameParty.removeActor(selection);
            }
            break;
        case 'undefined':
            this.partyHirelings().forEach(function (actor_id) {
                $gameParty.removeActor(actor_id);
            });
            break;
    }
};
/**
 * @param {Number} id 
 * @returns String
 */
KunFollowers.getHirelingName = function (id) {
    var names = Object.keys(this._hirelingTemplates);
    return id < names.length ? names[id] : '';
};
/**
 * @param {Number|String} hireling 
 * @returns KunHireling
 */
KunFollowers.getHireling = function (hireling) {
    if (typeof hireling !== 'string') {
        hireling = this.getHirelingName(hireling);
    }
    return this._hirelingTemplates.hasOwnProperty(hireling) ? this._hirelingTemplates[hireling] : null;
};
/**
 * @param {Boolean} list 
 * @returns Object|KunHireling[]
 */
KunFollowers.hirelings = function (list) {
    return typeof list === 'boolean' && list ? Object.values(this._hirelingTemplates) : this._hirelingTemplates;
};
/**
 * List all active hireling slots within the active gameParty actor list
 * @returns Number[]
 */
KunFollowers.partyHirelings = function(){
    return $gameParty.allMembers().map(actor => actor.actorId()).filter(actor_id => this.hirelings().contains(actor_id));
};
/**
 * @returns Number
 */
KunFollowers.availableHirelingSlot = function () {
    var _party = this.partyHirelings();
    for (var i = 0; i < this._hirelings.length; i++) {
        if (!_party.includes(this._hirelings[i])) {
            return i;
        }
    }
    return -1;
};
/**
 * @returns Number
 */
KunFollowers.countHirelings = function () {
    return this.partyHirelings().length;
}
/**
 * @returns Number
 */
KunFollowers.maxHirelings = function(){
    return this.hirelings().length;
};
/**
 * @param {Number} actor_id 
 * @returns Boolean
 */
KunFollowers.canFollow = function (actor_id) {
    return this.hasGuest( actor_id ) || this.hasHireling(actor_id);
};
/**
 * @returns Array
 */
KunFollowers.guestList = function(){
    return this._guests;
};
/**
 * @returns Number
 */
KunFollowers.maxGuests = function() {
    return this._guestSlots;
};
/**
 * @returns Number
 */
KunFollowers.maxBattleMembers = function(){
    return this._partySlots;
};
/**
 * @returns Number
 */
KunFollowers.maxPartyMembers = function(){
    return this._partySlots;
};
/**
 * @returns Number
 */
KunFollowers.maxMembers = function(){
    return this.maxPartyMembers() + this.maxGuests();
};
/**
 * @param {Number} amount 
 * @return KunFollowers
 */
KunFollowers.addPartySlot = function (amount) {
    this._partySlots += (typeof amount === 'number' && amount > 0 ? amount : 1);
    $gamePlayer._followers.populate();
    return this;
};
/**
 * @param {Number} amount
 * @return KunFollowers
 */
KunFollowers.addGuestSlot = function (amount) {
    this._guestSlots += (typeof amount === 'number' && amount > 0 ? amount : 1);
    return this;
};
/**
 * @param {Number} amount 
 * @return KunFollowers
 */
KunFollowers.removePartySlot = function (amount) {
    if (this._partySlots > 1) {
        this._partySlots -= (typeof amount === 'number' && amount > 0 ? amount : 1);
    }
    return this;
};
/**
 * @param {Number} amount 
 * @return KunFollowers
 */
KunFollowers.removeGuestSlot = function (amount) {
    if (this._guestSlots > 0) {
        this._guestSlots -= (typeof amount === 'number' && amount > 0 ? amount : 1);
    }
    return this;
};
/**
 * @returns Object
 */
KunFollowers.PluginManager = function () {
    return PluginManager.parameters('KunFollowers');
};
/**
 * 
 * @param {String} name 
 * @param {Number} actorClass 
 * @param {Number} level
 * @param {String} mode
 * @returns 
 */
function KunHireling(name, actorClass, level, mode) {

    this._name = name || 'Hero';
    this._nameList = [];
    this._class = actorClass || 0;
    this._graphics = [];
    this._level = level || 1;
    this._armors = [];
    this._weapons = [];
    this._items = [];
};

/**
 * @param {String} character 
 * @param {Number} character_id 
 * @param {String} face 
 * @param {Number} face_id 
 * @param {String} battler 
 * @returns 
 */
KunHireling.prototype.addGraphics = function (character, character_id, face, face_id, battler) {
    this._graphics.push({
        'character': character,
        'character_id': character_id,
        'face': face,
        'face_id': face_id,
        'battler': battler,
    });
    return this;
};
/**
 * @returns Object
 */
KunHireling.prototype.dump = function () {
    return this;
};
/**
 * @returns String
 */
KunHireling.prototype.name = function () {
    return this._name;
};
/**
 * @returns Object
 */
KunHireling.prototype.class = function () {
    return $dataClasses[this._class];
};
/**
 * @returns Number
 */
KunHireling.prototype.level = function () {
    return this._level;
};
/**
 * @returns Number[]
 */
KunHireling.prototype.armors = function () {
    return this._armors;
};
/**
 * @returns Number[]
 */
KunHireling.prototype.weapons = function () {
    return this._weapons;
};
/**
 * @returns Number[]
 */
KunHireling.prototype.items = function () {
    return this._items;
};
/**
 * @returns Object
 */
KunHireling.prototype.generateGraphics = function (variation) {
    variation = typeof variation === 'number' ? variation : this._graphics[Math.floor(Math.random() * this._graphics.length)];
    return this._graphics.length > 0 ? variation : { 'character': '', 'character_id': 0, 'face': '', 'face_id': 0, 'battler': '' };
};
/**
 * @param {String} name 
 * @returns KunHireling
 */
KunHireling.prototype.addName = function (name) {
    if (!this._nameList.includes(name)) {
        this._nameList.push(name);
    }
    return this;
};
/**
 * @returns String
 */
KunHireling.prototype.generateName = function () {
    return this._nameList.length > 0 ? this._nameList[Math.floor(Math.random() * this._nameList.length)] : this._name;
};
/**
 * @returns String[]
 */
KunHireling.prototype.listNames = function () {
    return this._nameList;
};
/**
 * @param {Number} actor_id 
 * @param {Number} level (optional)
 * @param {Number|Boolean} variation (optional)
 * @returns Boolean
 */
KunHireling.prototype.overrideActor = function (actor_id, level, variation) {
    var _actor = $gameActors.actor(actor_id);
    if (_actor !== null) {
        //reset actor class
        _actor.changeClass(this._class, false);
        //reset actor level
        _actor._level = typeof level === 'number' && level > 0 ? level : this._level;
        //rename
        _actor._name = this.generateName();

        var graphics = this.generateGraphics(variation || false);
        if (graphics.character.length) {
            _actor.setCharacterImage(graphics.character, graphics.character_id);
        }
        if (graphics.face.length) {
            _actor.setFaceImage(graphics.face, graphics.face_id);
        }
        if (graphics.battler.length) {
            _actor.setBattlerImage(graphics.battler);
        }
        if (KunFollowers.debug()) {
            console.log(`Actor ID ${actor_id} overriden by Hireling[${this.name()}] (level:${_actor._level})`);
        }
        return true;
    }
    return false;
};
/**
 * Add an item definition to the template
 * @param {Number} item 
 * @returns 
 */
KunHireling.prototype.addItem = function (item) {
    this._items.push(item);
    return this;
};
/**
 * Add an armor definition to the template
 * @param {Number} armor 
 * @returns 
 */
KunHireling.prototype.addArmor = function (armor) {
    this._armors.push(armor);
    return this;
};
/**
 * Add a weapon definition to the template
 * @param {Number} weapon 
 * @returns 
 */
KunHireling.prototype.addWeapon = function (weapon) {
    this._weapons.push(weapon);
    return this;
};

/**
 * @param {String} data
 * @return KunHireling
 */
KunHireling.Import = function (data) {
    if (typeof data === 'string' && data.length) {
        var hireling = JSON.parse(data);
        var graphics = hireling.variations.length > 0 ? JSON.parse(hireling.variations).map(variation => JSON.parse(variation)) : [];

        var _hireling = new KunHireling(
            hireling.name || 'Hero',
            parseInt(hireling.class || 0),
            parseInt(hireling.level || 0));

        if (hireling.names.length) {
            JSON.parse(hireling.names).forEach(name => _hireling.addName(name));
        }
        if (hireling.armorSet.length > 0) {
            JSON.parse(hireling.armorSet).forEach(armor_id => _hireling.addArmor(parseInt(armor_id)));
        }
        if (hireling.itemSet.length > 0) {
            JSON.parse(hireling.itemSet).forEach(item_id => _hireling.addItem(parseInt(item_id)));
        }
        if (hireling.weaponSet.length > 0) {
            _hireling.addWeapon(parseInt(hireling.weaponSet));
        }

        graphics.forEach(function (g) {
            _hireling.addGraphics(
                g.characterSet,
                g.characterId,
                g.faceSet,
                g.faceId,
                g.svBattler
            );
        });

        return _hireling;
    }
    return null;
};

/**
 * 
 */
KunFollowers.SetupGameParty = function () {

    var _KunFollowers_Game_Party = Game_Party.prototype.initialize;
    Game_Party.prototype.initialize = function() {
        _KunFollowers_Game_Party.call( this );
        //members available for battle
        this._maxBattleMembers = KunFollowers.maxPartyMembers();
        //additional party guests
        //this._maxPartyMembers = this._maxBattleMembers;
        this._maxGuests = KunFollowers.maxGuests();
    }
    /**
     * @returns Number
     */
    Game_Party.prototype.maxBattleMembers = function () {
        return this._maxBattleMembers;
    };
    /**
     * @returns Number
     */
    Game_Party.prototype.maxPartyMembers = function(){
        return this._maxBattleMembers + this._maxGuests;
    };
    /**
     * @param {Number} amount 
     * @returns Game_Party
     */
    Game_Party.prototype.increaseLimit = function( amount ){
        this._maxBattleMembers += typeof amount === 'number' && amount > 0 ? amount : 1;
        return this;
    };
    /**
     * @param {Number} amount 
     * @returns Game_Party
     */
    Game_Party.prototype.decreaseLimit = function( amount ){
        amount = typeof amount === 'number' && amount > 0 ? amount : 0;
        if( amount && this._maxMembers - amount > 0 ){
            this._maxBattleMembers -= amount;
        }
        return this;
    }
    /**
     * @returns Number
     */
    /*Game_Party.prototype.maxMembers = function(){
        return KunFollowers.maxMembers();
    };*/
    /**
     * @returns Boolean
     */
    Game_Actor.prototype.isGuest = function(){
        return KunFollowers.hasGuest( this.actorId());
    };
    /**
     * @returns Boolean
     */
    Game_Actor.prototype.isHireling = function(){
        return KunFollowers.hasHireling( this.actorId());
    };

    Game_Party.prototype.canJoin = function (actorId) {
        return KunFollowers.canFollow( actorId ) || !this._actors.contains(actorId);
    }

    Game_Party.prototype.addActor = function (actorId) {
        //remove vanilla actor limit
        if( this.canJoin( actorId ) ){
            this._actors.push(actorId);
            $gamePlayer.refresh();
            $gameMap.requestRefresh();

            if (SceneManager._scene instanceof Scene_Map) {
                //refresh the scene to change all required characters
                SceneManager._scene._spriteset.refreshCharacters();
            }            
        }
        return;


        //vanilla filter
        if (!this._actors.contains(actorId)) {
            this._actors.push(actorId);
            $gamePlayer.refresh();
            $gameMap.requestRefresh();
        }
    };
    Game_Party.prototype.removeActor = function(actorId) {
        //vanilla
        if (this._actors.contains(actorId)) {
            this._actors.splice(this._actors.indexOf(actorId), 1);
            $gamePlayer.refresh();
            $gameMap.requestRefresh();
        }
    };
    /**
     * Count all party guests
     * @returns Number
     */
    Game_Party.prototype.countGuests = function(){
        return this.allMembers().filter( function( actor ){
            return actor.isGuest();
        } ).length;
    };
    /**
     * Count all party guests
     * @returns Number
     */
    Game_Party.prototype.countHirelings = function(){
        return this.allMembers().filter( function( actor ){
            return actor.isHireling();
        } ).length;
    };
    /**
     * @returns Number
     */
    Game_Party.prototype.countEveryone = function(){
        return this.allMembers().length;
    };


    //var _KunFollowers_GameFollower = Game_Follower.prototype.initialize;
    /**
     * Override adding memberType to classify the party followers
     * @param {Number} memberIndex 
     * @param {String} memberType 
     */
    /*Game_Follower.prototype.initialize = function ( memberIndex, memberType ) {
        _KunFollowers_GameFollower.call(this, memberIndex);
        //set the guest override behavior
        //this._isGuest = typeof isGuest === 'boolean' && isGuest;
        this._memberType = memberType || Game_Follower.MemberType.Actor;
    };*/
    /**
     * Game_Actor Override
     * @returns Game_Actor
     */
    /*Game_Follower.prototype.actor = function () {
        return this.isGuest() ?
            //guests are handled aside
            $gameActors.actor(this._memberIndex) :
            //actors and hirelings can fight
            $gameParty.battleMembers()[this._memberIndex];
    };*/

    //var _KunFollowers_GameFollower_Update = Game_Follower.prototype.update;
    /*Game_Follower.prototype.update = function () {
        _KunFollowers_GameFollower_Update.call(this);
        this.setStepAnime(this.isGuest());
    }
    /**
     * @returns Boolean
     */
    /*Game_Follower.prototype.isGuest = function(){
        return this._memberType === this.MemberType.Guest;
    };*/
    /**
     * @returns Boolean
     */
    /*Game_Follower.prototype.isHireling = function(){
        return this._memberType === this.MemberType.Hireling;
    };*/
    /**
     * 
     */
    /*Game_Follower.MemberType = {
        'Actor':'actor',
        'Hireling': 'hireling',
        'Guest': 'guest',
    };*/

    /**
     * Refresh Override
     */
    /*Game_Follower.prototype.refresh = function() {
        var characterName = this.isVisible() ? this.actor().characterName() : '';
        var characterIndex = this.isVisible() ? this.actor().characterIndex() : 0;
        this.setImage(characterName, characterIndex);
    };*/

    //////////////////////////////////////////////////////////////////////////////////////////////
    //// GAME FOLLOWERS 
    //////////////////////////////////////////////////////////////////////////////////////////////
    Game_Followers.prototype.initialize = function () {
        this._visible = $dataSystem.optFollowers;
        this._gathering = false;
        this._data = [];
        this.populate();
    };
    /**
     * 
     * @returns Game_Followers
     */
    Game_Followers.prototype.updatePartyMembers = function(){

        var _members = $gameParty.countEveryone();

        if( _members > this._data.length ){
            //add followers
            this.addFollower( this._data.length + 1 );
        }
        else if( _members < this._data.length && _members >= $gameParty.maxBattleMembers() ){
            //remove remaining followers
            this._data.splice(this._data.indexOf( _members + 1 ), this._data.length - _members );
        }

        return this;
    };
    Game_Followers.prototype.refresh = function(){
        //update party members previous to iterate over each one of them
        this.updatePartyMembers().forEach(function(follower) {
            return follower.refresh();
        }, this);    
    };
    /**
     * 
     */
    Game_Followers.prototype.populate = function () {
        var _slots = $gameParty.maxPartyMembers();
        if (_slots > 0) {
            for (var i = 1; i < _slots; i++) {
                this.addFollower( i );
                //this._data.push(new Game_Follower( i ) );
            }
        }
    };
    /**
     * @param {Number} follower_id 
     * @returns Game_Followers
     */
    Game_Followers.prototype.addFollower = function( follower_id ){
        if( follower_id ){
            this._data.push(new Game_Follower( follower_id ) );
        }
        return this;
    };
    /**
     * @returns Array
     */
    /*Game_Followers.prototype.guests = function (actor_id) {
        actor_id = actor_id || 0;
        return this._data.filter(function (follower) {
            return follower.isGuest() && (actor_id === 0 || follower._memberIndex === actor_id);
        });
    }*/
    /**
     * @param {Number} actor_id 
     * @param {Boolean} remove_all
     * @returns Number removed instances (one by default, many if remove_all is active)
     */
    /*Game_Followers.prototype.dropGuest = function (actor_id, remove_all) {
        var counter = 0;
        var justOnce = !(typeof remove_all === 'boolean' && remove_all);
        for (var i = this._data.length - 1; i >= 0; i--) {
            if (this._data[i].isGuest() && this._data[i]._memberIndex === actor_id) {
                if (SceneManager._scene instanceof Scene_Map) {
                    SceneManager._scene._spriteset.removeCharacter(this._data[i]);
                    $gamePlayer.refresh();
                    $gameMap.requestRefresh();
                }
                this._data.splice(i, 1);
                counter++;
                if (justOnce) { break; }
            }
        }
        return counter;
    }*/
    /**
     * @param {Number} actor_id 
     * @returns Boolean
     */
    /*Game_Followers.prototype.addGuest = function (actor_id) {
        if (KunFollowers.canFollow(actor_id) && this.countGuests() < this.maxGuests()) {
            var guest = new Game_Follower(actor_id, true);
            guest.locate($gamePlayer.x, $gamePlayer.y);
            this._data.push(guest);
            // Scene Hack
            if (SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene._spriteset.addCharacter(guest)
                $gamePlayer.refresh();
                $gameMap.requestRefresh();
            }
            return true;
        }
        return false;
    }*/
    /**
     * @returns Number
     */
    /*Game_Followers.prototype.countGuests = function () {
        return this.guests().length;
    }*/
    /**
     * @returns Number
     */
    /*Game_Followers.prototype.maxGuests = function () {
        return KunFollowers.maxGuests();
        return guestsOnly ?
            KunFollowers.maxGuests() :
            $gameParty.maxBattleMembers() + $gameParty.maxBattleMembers();
    };*/

    /*Spriteset_Map.prototype.addCharacter = function (character) {
        var spr = new Sprite_Character(character);
        this._characterSprites.push(spr);
        this._tilemap.addChild(spr);
    };

    Spriteset_Map.prototype.removeCharacter = function (follower) {
        var sprites = this._characterSprites;
        for (var i = 0; i < sprites.length; i++) {
            var spr = sprites[i];
            if (spr._character === follower) {
                this._characterSprites.splice(i, 1);
                this._tilemap.removeChild(spr);
                break;
            }
        }
    };*/
    /**
     * Checks and updates if required all character sprites rendered in the map
     * @returns Spriteset_Map
     */
    Spriteset_Map.prototype.refreshCharacters = function() {
    
        //update _characterSprites
        //var guest = new Game_Follower(actor_id, true);
        //guest.locate($gamePlayer.x, $gamePlayer.y);
        //this._data.push(guest);

        // new Sprite_Character( event , true );

        //refresh tilemaps
        var _partySprites = this.countPartySprites();
        var _partyCharacters = this.countPartyCharacters();
        if( _partySprites < _partyCharacters ){
            //add
            for( var i = _partySprites ; i < _partyCharacters ; i++ ){
                this._tilemap.addChild(this._characterSprites[i]);
            };    
        }
        else if( _partySprites > _partyCharacters ){
            //remove
            for( var i = this._tilemap.length ; i > 0 ; i-- ){
                if( typeof this._tilemap[i] === Sprite_Character && !this._characterSprites.includes( this._tilemap[i] ) ){
                    this._tilemap.splice( i, 1 );
                }
            }
        }

        return this;
        //createCharacters Vanilla
        this._characterSprites = [];
        $gameMap.events().forEach(function(event) {
            this._characterSprites.push(new Sprite_Character(event));
        }, this);
        $gameMap.vehicles().forEach(function(vehicle) {
            this._characterSprites.push(new Sprite_Character(vehicle));
        }, this);
        $gamePlayer.followers().reverseEach(function(follower) {
            this._characterSprites.push(new Sprite_Character(follower));
        }, this);
        this._characterSprites.push(new Sprite_Character($gamePlayer));
        for (var i = 0; i < this._characterSprites.length; i++) {
            this._tilemap.addChild(this._characterSprites[i]);
        }
    };
    /**
     * @returns Number
     */
    Spriteset_Map.prototype.countPartySprites = function() {
        return this._tilemap.filter( sprite => typeof sprite === Sprite_Character && sprite.isFollower()).length;
    };
    /**
     * @returns Number
     */
    Spriteset_Map.prototype.countPartyCharacters = function() {
        return this._characterSprites.length;
    };

    /**
     * Create a follower flag to handle the spriteset filtering
     */
    var _KunFollowers_SpriteCharacter_Initialize = Sprite_Character.prototype.initialize;
    /**
     * 
     * @param {Game_Event} character 
     * @param {Boolean} isFollower 
     */
    Sprite_Character.prototype.initialize = function(character , isFollower ) {

        _KunFollowers_SpriteCharacter_Initialize.call( this , character );

        this._isFollower = typeof isFollower === 'boolean' && isFollower;
    };
    /**
     * @returns Boolean
     */
    Sprite_Character.prototype.isFollower = function(){
        return this._isFollower;
    };
}

/*function kun_follower_override_game_actors(){
    
    if( typeof Game_Actors.prototype.count === 'undefined' ){
        Game_Actors.prototype.count = function() { return this._data.length; };
    }
}*/



/**
 * 
 */
KunFollowers.SetupCommands = function () {
    var _KunFollowers_Commands = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunFollowers_Commands.call(this, command, args);
        if (command === 'KunFollower') {
            if (args && args.length) {
                switch (args[0]) {
                    case 'add-guest':
                    case 'add':
                        kun_follower_add_guest(parseInt(args[1]), args.length > 2 ? parseInt(args[2]) : 1)
                        break;
                    case 'remove':
                    case 'remove-guest':
                        kun_follower_remove_guest(parseInt(args[1]),
                            args.length > 2 && args[2] === 'all',
                            args.length > 3 ? parseInt(args[3]) : false);
                        break;
                    case 'count':
                        if (args.length > 2) {
                            $gameVariables.setValue(parseInt(args[2]), kun_follower_count(parseInt(args[1])));
                        }
                        break;
                    case 'count-guests':
                        if (args.length > 1) {
                            $gameVariables.setValue(parseInt(args[1]), $gameParty.countGuests());
                            //$gameVariables.setValue(parseInt(args[1]), $gamePlayer._followers.countGuests());
                        }
                        break;
                    case 'max-followers':
                        if (args.length > 1) {
                            //$gameVariables.setValue( parseInt(args[1]) , KunFollowers.maxPartyMembers());
                            $gameVariables.setValue(parseInt(args[1]), $gameParty.maxBattleMembers());
                        }
                        break;
                    case 'max-guests':
                        if (args.length > 1) {
                            $gameVariables.setValue(parseInt(args[1]), KunFollowers.maxGuests());
                        }
                        break;
                    case 'setup-hireling':
                        if (args.length > 2) {
                            kun_follower_reset_hireling(
                                Number.isInteger(args[1]) ? parseInt(args[1]) : args[1],
                                args[2],
                                args.length > 3 ? parseInt(args[3]) : 0,
                                args.length > 4 ? parseInt(args[4]) : false);
                        }
                        break;
                    case 'remove-hirelings':
                        KunFollowers.removeHirelings();
                        break;
                    case 'add-hireling':
                        if (args.length > 1) {
                            var _level = 1;
                            if (args.length > 2) {
                                //import level from gamevar
                                _level = $gameVariables.value(parseInt(args[2]));
                            }
                            var _actor_id = kun_follower_join_hireling(args[1], _level, args.length > 4 ? parseInt(args[4]) : false);
                            if (_actor_id > 0 && args.length > 3 && args[3] > 0) {
                                //export joined hireling actor ID
                                $gameVariables.setValue(parseInt(args[3]), _actor_id);
                            }
                        }
                        break;
                    case 'count-hirelings':
                        if (args.length > 1) {
                            $gameVariables.setValue(parseInt(args[1]), kun_follower_count_hirelings());
                            if (args.length > 2) {
                                $gameVariables.setValue(parseInt(args[2]), kun_follower_max_hirelings());
                            }
                        }
                        break;
                    case 'increase':
                        if (args.length > 1) {
                            var amount = args.length > 2 ? parseInt(args[2]) : 1;
                            switch (args[1]) {
                                case 'followers':
                                    KunFollowers.addPartySlot(amount || 1);
                                    break;
                                case 'guests':
                                    KunFollowers.addGuestSlot(amount || 1);
                                    break;
                            }
                        }
                        break;
                    case 'decrease':
                        if (args.length > 1) {
                            var amount = args.length > 2 ? parseInt(args[2]) : 1;
                            switch (args[1]) {
                                case 'followers':
                                    KunFollowers.removePartySlot(amount || 1);
                                    break;
                                case 'guests':
                                    KunFollowers.removeGuestSlot(amount || 1);
                                    break;
                            }
                        }
                        break;
                }
            }
        }
    };
}
/**
 * @param {Number} actor_id 
 * @returns 
 */
function kun_follower_count( actor_id ) {
    return $gameParty.allMembers().filter( id => id === actor_id ).length;
    return $gamePlayer.followers().guests(actor_id || 0).length;
}
/**
 * 
 * @param {Number} actor_id 
 * @param {Amount} amount Optional
 * @returns 
 */
//function kun_follower_add( actor_id , amount ) {
function kun_follower_add_guest(actor_id, amount) {
    return $gameParty.addActor( actor_id );
    return $gamePlayer.followers().addGuest(actor_id, amount || 1);
}
/**
 * @param {Number} actor_id 
 * @param {Boolean} removeAll Remove all from the same actor_id
 * @param {Number} exportVar export removed actors to this variable
 * @returns 
 */
//function kun_follower_remove(actor_id , removeAll , exportVar ) {
function kun_follower_remove_guest(actor_id, removeAll, exportVar) {
    //define if this is a required method
    return 0;

    var removed = $gamePlayer.followers().dropGuest(actor_id, removeAll);

    if (typeof exportVar === 'number' && exportVar > 0) {
        $gameVariables.setValue(exportVar, removed);
    }

    return removed > 0;
}
/**
 * @param {Number|String} hireling 
 * @param {Number} actor_id 
 * @param {Number} level (optional, default 1)
 * @param {Number} variation (optional)
 * @return Boolean
 */
function kun_follower_reset_hireling(hireling, actor_id, level, variation) {

    return KunFollowers.updateHireling(hireling, actor_id, level, variation);
}
/**
 * 
 * @param {String|Number} hireling 
 * @param {Number} level 
 * @param {Number} variation (optional)
 * @returns Number|Boolean Joined Actor ID or false if failure
 */
function kun_follower_join_hireling(hireling, level, variation) {
    return KunFollowers.joinHireling(hireling, level, variation);
};
/**
 * @returns Number
 */
function kun_follower_count_hirelings() {
    return KunFollowers.countHirelings();
};
/**
 * @returns Number
 */
function kun_follower_max_hirelings() {
    return KunFollowers.maxHirelings();
}


(function () {

    KunFollowers.Initialize();
    KunFollowers.SetupGameParty();
    KunFollowers.SetupCommands();
    //kun_follower_override_game_actors();

})();

















