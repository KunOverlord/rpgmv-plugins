//=============================================================================
// KunFollowers.js
//=============================================================================
/*:
 * @filename KunFollowers.js
 * @plugindesc Add Randomly generated Hirelings by class and generic NPCs to the party. Handle the party max size in game!
 * @version 1.03
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
 * @type Number
 * @min 0
 * @max 10
 * @default 4
 * 
 * @param guests
 * @text Maximum Guests
 * @desc How many guests can follow?
 * @type Number
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
  * @type Text
  * @default Hireling
  * 
  * @param level
  * @text Default Level
  * @type Number
  * @min 1
  * @max 99
  * @default 1
  * 
  * @param class
  * @text Class
  * @type Class
  * @default 0
  * 
  * @param variations
  * @text Variations
  * @detail Define a list of face-character display variations
  * @type struct<Graphics>[]
  * 
  * @param names
  * @text Random Names
  * @type String[]
  * 
  * @param armorSet
  * @text Armor Set
  * @type Armor[]
  * 
  * @param weaponSet
  * @text Weapons
  * @type Weapon
  * 
  * @param itemSet
  * @text Items
  * @type Item[]
  */
 /*~struct~Graphics:
  * @param characterSet
  * @text character Set
  * @type File
  * @require 1
  * @dir img/characters/
  * 
  * @param characterId
  * @text Character Set Id
  * @type Number
  * @min 0
  * @default 0
  * 
  * @param faceSet
  * @text FaceSet
  * @type File
  * @require 1
  * @dir img/faces/
  * 
  * @param faceId
  * @text Face
  * @type Number
  * @default 0
  * 
  * @param svBattler
  * @text SideView Battler
  * @type File
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

    var _controller = {
        'maxGuests': 0,
        'maxFollowers': 0,
        'guests': [],
        'hirelings': [],
        'hirelingTemplates':{},
        'hirelingNames':[],
        'debug': false,
    };

    this.Set = {
        'MaxGuests': (count) => _controller.maxGuests = parseInt(count),
        'MaxFollowers': (count) => _controller.maxFollowers = parseInt(count),
        'Debug': ( debug ) => _controller.debug = debug,
    };
    /**
     * @returns Boolean
     */
    this.debug = () => _controller.debug;
    /**
     * @param {Number} actor_id 
     * @returns 
     */
    this.addGuest = function (actor_id) {
        if (!_controller.guests.contains(actor_id)) {
            _controller.guests.push(actor_id);
        }
        return this;
    };
    /**
     * @param {Number} actor_id 
     * @returns KunFollowers
     */
    this.addHirelingSlot = function( actor_id ){
        if( !_controller.hirelings.contains(actor_id) ){
            _controller.hirelings.push( actor_id );
        }
        return this;
    };
    /**
     * @param {KunHireling} hirelingTpl 
     * @returns KunFollowers
     */
    this.addHirelingTemplate = function( hirelingTpl ){
        if( hirelingTpl instanceof KunHireling ){
            if( !_controller.hirelingTemplates.hasOwnProperty( hirelingTpl.name())){
                _controller.hirelingTemplates[ hirelingTpl.name().toLowerCase() ] = hirelingTpl;
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
    this.updateHireling = function( hireling_id , actor_id , level , variation ){

        var _overriden = false;
        if( typeof hireling_id !== 'string' ){
            hireling_id = this.getHirelingName( hireling_id );
        }

        if( hireling_id.length > 0 && _controller.hirelingTemplates.hasOwnProperty(hireling_id) ){
            var _overriden = _controller.hirelingTemplates[hireling_id].overrideActor(actor_id ,level ,variation );
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
    this.joinHireling = function( hireling , level , variation ){
        var _slot = this.availableHirelingSlot();
        var _available = $gameParty.maxBattleMembers() > $gameParty.size();
        //console.log( `${_slot} , ${_available}`);
        if( _slot > -1 && _available ){
            var _actor_id = _controller.hirelings[ _slot ];
            if( this.updateHireling( hireling , _actor_id , level , variation ) ){
                $gameParty.addActor( _actor_id );
                if( _controller.debug ){
                    console.log( `Hireling Id${_actor_id}: ${hireling}(${level || 1}) - Slot: ${_slot}  - Available: ${_available}` ) ;
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
    this.removeHirelings = function( selection ){
        switch( typeof selection ){
            case 'string':
                var _hireling = this.getHireling( selection );
                if( _hireling !== null ){
                    this.partyHirelings().forEach(function( actor_id ){
                        if( $gameActors.actor( actor_id ).currentClass() === _hireling.class().name  ){
                            $gameParty.removeActor( actor_id );
                        }
                    });    
                }
                break;
            case 'number':
                if( _controller.hirelings.contains( selection ) ){
                    $gameParty.removeActor(selection);
                }
                break;
            case 'undefined':
                this.partyHirelings().forEach(function( actor_id ){
                    $gameParty.removeActor( actor_id );
                });
                break;
        }
    };
    /**
     * @param {Number} id 
     * @returns String
     */
    this.getHirelingName = function( id ){
        var names = Object.keys( _controller.hirelingTemplates );
        return id < names.length ? names[id] : '';
    };
    /**
     * @param {Number|String} hireling 
     * @returns KunHireling
     */
    this.getHireling = function( hireling ){
        if( typeof hireling !== 'string' ){
            hireling = this.getHirelingName( hireling );
        }
        return _controller.hirelingTemplates.hasOwnProperty( hireling ) ? _controller.hirelingTemplates[hireling] : null;
    };
    /**
     * @param {Boolean} list 
     * @returns Object|KunHireling[]
     */
    this.hirelings = function( list ){
        return typeof list === 'boolean' && list ? Object.values( _controller.hirelingTemplates ) : _controller.hirelingTemplates;
    };
    /**
     * List all active hireling slots within the active gameParty actor list
     * @returns Number[]
     */
    this.partyHirelings = () => $gameParty.allMembers().map( actor => actor.actorId() ).filter( actor_id => _controller.hirelings.contains( actor_id ) );
    /**
     * @returns Number
     */
    this.availableHirelingSlot = function(){
        var _party = this.partyHirelings();
        for( var i = 0 ; i < _controller.hirelings.length ; i++ ){
            if( !_party.includes( _controller.hirelings[i] ) ){
                return i;
            }
        }
        return -1;
    };
    /**
     * @returns Number
     */
    this.countHirelings = function(){
        return this.partyHirelings().length;
    }
    /**
     * @returns Number
     */
    this.maxHirelings = () => _controller.hirelings.length;
    /**
     * @param {Number} actor_id 
     * @returns Boolean
     */
    this.canFollow = function (actor_id) {
        return _controller.guests.contains(actor_id);
    };
    /**
     * @returns Array
     */
    this.guestList = () => _controller.guests;
    /**
     * @returns Number
     */
    this.maxGuests = () => _controller.maxGuests;
    /**
     * @returns Number
     */
    this.maxFollowers = () => _controller.maxFollowers;
    /**
     * @param {Number} amount 
     * @return KunFollowers
     */
    this.increaseMaxFollowers = function( amount ){
        _controller.maxFollowers += (typeof amount === 'number' && amount > 0 ? amount : 1);
        $gamePlayer._followers.populate();
        return this;
    };
    /**
     * @param {Number} amount
     * @return KunFollowers
     */
    this.increaseMaxGuests = function( amount ){
        _controller.maxGuests += (typeof amount === 'number' && amount > 0 ? amount : 1);
        return this;
    };
    /**
     * @param {Number} amount 
     * @return KunFollowers
     */
    this.decreaseMaxFollowers = function( amount ){
        if( _controller.maxFollowers > 1 ){
            _controller.maxFollowers -= (typeof amount === 'number' && amount > 0 ? amount : 1);
        }
        return this;
    };
    /**
     * @param {Number} amount 
     * @return KunFollowers
     */
    this.decreaseMaxGuests = function( amount ){
        if( _controller.maxGuests > 0 ){
            _controller.maxGuests -= (typeof amount === 'number' && amount > 0 ? amount : 1);
        }
        return this;
    };
}
/**
 * 
 * @param {String} name 
 * @param {Number} actorClass 
 * @param {Number} level
 * @param {String} mode
 * @returns 
 */
function KunHireling( name, actorClass , level , mode ){
    var _hireling = {
        'name': name || 'Hero',
        'nameList': [],
        'class': actorClass || 0,
        'graphics':[],
        'level': level || 1,
        'armors': [],
        'weapons': [],
        'items': [],
    };
    /**
     * @param {String} character 
     * @param {Number} character_id 
     * @param {String} face 
     * @param {Number} face_id 
     * @param {String} battler 
     * @returns 
     */
    this.addGraphics = function( character , character_id , face , face_id , battler ){
        _hireling.graphics.push({
            'character': character,
            'character_id':character_id,
            'face':face,
            'face_id':face_id,
            'battler':battler,
        });
        return this;
    };
    /**
     * @returns Object
     */
    this.dump = () => _hireling;
    /**
     * @returns String
     */
    this.name = () => _hireling.name;
    /**
     * @returns Object
     */
    this.class = () => $dataClasses[ _hireling.class ];
    /**
     * @returns Number
     */
    this.level = () => _hireling.level;
     /**
      * @returns Number[]
      */
    this.armors = () => _hireling.armors;
     /**
      * @returns Number[]
      */
    this.weapons = () => _hireling.weapons;
     /**
      * @returns Number[]
      */
    this.items = () => _hireling.items;
    /**
     * @returns Object
     */
    this.generateGraphics = function( variation ){
        variation = typeof variation === 'number' ? variation : _hireling.graphics[ Math.floor( Math.random( ) * _hireling.graphics.length  ) ];
        return _hireling.graphics.length > 0 ? variation : {'character':'','character_id':0,'face':'','face_id':0,'battler':''};
    };
    /**
     * @param {String} name 
     * @returns KunHireling
     */
     this.addName = function( name ){
        if( !_hireling.nameList.includes(name)){
            _hireling.nameList.push( name );
        }
        return this;
    };
    /**
     * @returns String
     */
    this.generateName = function(){
        return _hireling.nameList.length > 0 ? _hireling.nameList[Math.floor( Math.random() * _hireling.nameList.length ) ] : _hireling.name;
    };
    /**
     * @returns String[]
     */
    this.listNames = () => _hireling.nameList;
    /**
     * @param {Number} actor_id 
     * @param {Number} level (optional)
     * @param {Number|Boolean} variation (optional)
     * @returns Boolean
     */
    this.overrideActor = function( actor_id , level , variation ){
        var _actor = $gameActors.actor( actor_id );
        if( _actor !== null ){
            //reset actor class
            _actor.changeClass( _hireling.class , false );
            //reset actor level
            _actor._level = typeof level === 'number' && level > 0 ? level : _hireling.level;
            //rename
            _actor._name = this.generateName();

            var graphics = this.generateGraphics( variation || false );
            if( graphics.character.length ){
                _actor.setCharacterImage( graphics.character ,  graphics.character_id );
            }
            if( graphics.face.length ){
                _actor.setFaceImage( graphics.face,graphics.face_id );
            }
            if( graphics.battler.length ){
                _actor.setBattlerImage( graphics.battler );
            }
            if( KUN.Followers.debug()){
                console.log( `Actor ID ${actor_id} overriden by Hireling[${this.name()}] (level:${ _actor._level })` );
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
    this.addItem = function( item ){
        _hireling.items.push( item );
        return this;
    };
    /**
     * Add an armor definition to the template
     * @param {Number} armor 
     * @returns 
     */
    this.addArmor = function( armor ){
        _hireling.armors.push( armor );
        return this;
    };
    /**
     * Add a weapon definition to the template
     * @param {Number} weapon 
     * @returns 
     */
    this.addWeapon = function( weapon ){
        _hireling.weapons.push( weapon );
        return this;
    };

    return this;
};
/**
 * @param {String} data
 * @return KunHireling
 */
KunHireling.Import = function( data ){
    if( typeof data === 'string' && data.length ){
        var hireling = JSON.parse(data);
        var graphics = hireling.variations.length > 0 ? JSON.parse(hireling.variations).map( variation => JSON.parse(variation )) : [];
        
        var _hireling = new KunHireling(
                hireling.name || 'Hero',
                parseInt( hireling.class || 0 ),
                parseInt( hireling.level || 0 ));

        if( hireling.names.length ){
            JSON.parse(hireling.names).forEach( name => _hireling.addName(name) );
        }
        if( hireling.armorSet.length > 0 ){
            JSON.parse(hireling.armorSet).forEach( armor_id => _hireling.addArmor( parseInt(armor_id )) );
        }
        if( hireling.itemSet.length > 0 ){
            JSON.parse(hireling.itemSet).forEach( item_id => _hireling.addItem( parseInt(item_id )) );
        }
        if( hireling.weaponSet.length > 0 ){
            _hireling.addWeapon( parseInt( hireling.weaponSet ) );
        }

        graphics.forEach( function( g ){
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
KunFollowers.OverrideParty = function() {
    
    Game_Party.prototype.maxBattleMembers = function () {
        return KUN.Followers.maxFollowers();
    };

    var _KunFollowers_GameFollower = Game_Follower.prototype.initialize;
    Game_Follower.prototype.initialize = function (memberIndex, isGuest) {
        _KunFollowers_GameFollower.call(this, memberIndex);
        //set the guest override behavior
        this._isGuest = typeof isGuest === 'boolean' && isGuest;
    };

    Game_Follower.prototype.actor = function () {
        return this._isGuest ?
            $gameActors.actor(this._memberIndex) :
            $gameParty.battleMembers()[this._memberIndex];
    };

    var _KunFollowers_GameFollower_Update = Game_Follower.prototype.update;
    Game_Follower.prototype.update = function() {
        _KunFollowers_GameFollower_Update.call(this);
        this.setStepAnime(this._isGuest);
    }

    Game_Followers.prototype.initialize = function() {
        this._visible = $dataSystem.optFollowers;
        this._gathering = false;
        this._data = [];
        this.populate();
    };
    /**
     * 
     */
    Game_Followers.prototype.populate = function(){
        var _slots = $gameParty.maxBattleMembers() - this._data.length;
        if( _slots > 0 ){
            for (var i = 1; i < _slots; i++) {
                this._data.push(new Game_Follower(i));
            }    
        }
        else if( _slots < 0 ){
            //remove last followers
        }
    };

    /**
     * @returns Array
     */
    Game_Followers.prototype.guests = function ( actor_id ) {
        actor_id = actor_id || 0;
        return this._data.filter(function (follower) {
            return follower._isGuest && ( actor_id === 0 || follower._memberIndex === actor_id );
        });
    }
    /**
     * @param {Number} actor_id 
     * @param {Boolean} remove_all
     * @returns Number removed instances (one by default, many if remove_all is active)
     */
    Game_Followers.prototype.dropGuest = function ( actor_id, remove_all ) {
        var counter = 0;
        var justOnce = !( typeof remove_all === 'boolean' && remove_all );
        for (var i = this._data.length - 1; i >= 0; i--) {
            if (this._data[i]._isGuest && this._data[i]._memberIndex === actor_id) {
                if (SceneManager._scene instanceof Scene_Map) {
                    SceneManager._scene._spriteset.dropFollower( this._data[i] );
                    $gamePlayer.refresh();
                    $gameMap.requestRefresh();
                }
                this._data.splice(i,1);
                counter++;
                if( justOnce ){ break; }
            }
        }
        return counter;
    }
    /**
     * @param {Number} actor_id 
     * @returns Boolean
     */
    Game_Followers.prototype.addGuest = function (actor_id) {
        if (KUN.Followers.canFollow(actor_id) && this.countGuests() < this.maxGuests( ) ) {
            var guest = new Game_Follower(actor_id, true);
            guest.locate( $gamePlayer.x , $gamePlayer.y );
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
    }
    /**
     * @returns Number
     */
    Game_Followers.prototype.countGuests = function () {
        return this.guests().length;
    }
    /**
     * @returns Number
     */
    Game_Followers.prototype.maxGuests = function ( ) {
        return KUN.Followers.maxGuests();
        return guestsOnly ?
            KUN.Followers.maxGuests() :
            $gameParty.maxBattleMembers() + $gameParty.maxBattleMembers();
    };
    /**
     * @returns Numnber
     */
    Game_Followers.prototype.maxFollowers = function(){
        return $gameParty.maxBattleMembers() + this.maxGuests();
    };

    Spriteset_Map.prototype.addCharacter = function ( character ) {
        var spr = new Sprite_Character(character);
        this._characterSprites.push(spr);
        this._tilemap.addChild(spr);
    };

    Spriteset_Map.prototype.dropFollower = function ( follower ){
        var sprites = this._characterSprites;
        for (var i = 0; i < sprites.length; i++) {
            var spr = sprites[i];
            if (spr._character === follower) {
                this._characterSprites.splice(i, 1);
                this._tilemap.removeChild(spr);
                break;
            }
        }
    };
}

/*function kun_follower_override_game_actors(){
    
    if( typeof Game_Actors.prototype.count === 'undefined' ){
        Game_Actors.prototype.count = function() { return this._data.length; };
    }
}*/

/**
 * Under research
 */
function kun_followers_initialize_game_party(){

    Game_Party.prototype.addActor = function(actorId) {
        //remove vanilla actor limit
        this._actors.push(actorId);
        $gamePlayer.refresh();
        $gameMap.requestRefresh();
        return;


        //vanilla filter
        if (!this._actors.contains(actorId)) {
            this._actors.push(actorId);
            $gamePlayer.refresh();
            $gameMap.requestRefresh();
        }
    };
    
    /*Game_Party.prototype.removeActor = function(actorId) {
        //vanilla
        if (this._actors.contains(actorId)) {
            this._actors.splice(this._actors.indexOf(actorId), 1);
            $gamePlayer.refresh();
            $gameMap.requestRefresh();
        }
    };*/
}


/**
 * 
 */
KunFollowers.InitializeCommands = function(){
    var _KunFollowers_Commands = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunFollowers_Commands.call(this, command, args);
        if (command === 'KunFollower') {
            if (args && args.length) {
                switch (args[0]) {
                    case 'add-guest':
                    case 'add':
                        kun_follower_add_guest(parseInt(args[1]) , args.length > 2 ? parseInt( args[2]) : 1 )
                        break;
                    case 'remove':
                    case 'remove-guest':
                        kun_follower_remove_guest(parseInt(args[1]),
                            args.length > 2 && args[2] === 'all' ,
                            args.length > 3 ? parseInt( args[3] ) : false );
                        break;
                    case 'count':
                        if( args.length > 2 ){
                            $gameVariables.setValue( parseInt(args[2]) , kun_follower_count( parseInt(args[1])));
                        }
                        break;
                    case 'count-guests':
                        if( args.length > 1 ){
                            $gameVariables.setValue( parseInt( args[1 ] ) , $gamePlayer._followers.countGuests() );
                        }
                        break;
                    case 'max-followers':
                        if( args.length > 1 ){
                            //$gameVariables.setValue( parseInt(args[1]) , KUN.Followers.maxFollowers());
                            $gameVariables.setValue( parseInt(args[1]) , $gameParty.maxBattleMembers());
                        }
                        break;
                    case 'max-guests':
                        if( args.length > 1 ){
                            $gameVariables.setValue( parseInt(args[1]) , KUN.Followers.maxGuests());
                        }
                        break;
                    case 'setup-hireling':
                        if( args.length > 2 ){
                            kun_follower_reset_hireling(
                                Number.isInteger( args[1] ) ? parseInt(args[1]) : args[1] ,
                                args[2] ,
                                args.length > 3 ? parseInt(args[3]) : 0 ,
                                args.length > 4 ? parseInt( args[4]) : false );
                        }
                        break;
                    case 'remove-hirelings':
                        KUN.Followers.removeHirelings();
                        break;
                    case 'add-hireling':
                        if( args.length > 1 ){
                            var _level = 1;
                            if( args.length > 2 ){
                                //import level from gamevar
                                _level = $gameVariables.value( parseInt( args[2]) );
                            }
                            var _actor_id = kun_follower_join_hireling( args[1] , _level , args.length > 4 ? parseInt( args[4]) : false );
                            if( _actor_id > 0 && args.length > 3 && args[3] > 0 ){
                                //export joined hireling actor ID
                                $gameVariables.setValue( parseInt( args[3]) , _actor_id );
                            }
                        }
                        break;
                    case 'count-hirelings':
                        if( args.length > 1){
                            $gameVariables.setValue( parseInt( args[1]) , kun_follower_count_hirelings() );
                            if( args.length > 2 ){
                                $gameVariables.setValue( parseInt( args[2]) , kun_follower_max_hirelings() );
                            }
                        }
                        break;
                    case 'increase':
                        if( args.length > 1 ){
                            var amount = args.length > 2 ? parseInt( args[2] ) : 1;
                            switch( args[1 ] ){
                                case 'followers':
                                    KUN.Followers.increaseMaxFollowers( amount || 1 );
                                    break;
                                case 'guests':
                                    KUN.Followers.increaseMaxGuests( amount || 1 );
                                    break;
                            }
                        }
                        break;
                    case 'decrease':
                        if( args.length > 1 ){
                            var amount = args.length > 2 ? parseInt( args[2] ) : 1;
                            switch( args[1 ] ){
                                case 'followers':
                                    KUN.Followers.decreaseMaxFollowers( amount || 1 );
                                    break;
                                case 'guests':
                                    KUN.Followers.decreaseMaxGuests( amount || 1 );
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
    return $gamePlayer.followers().guests(actor_id || 0 ).length;
}
/**
 * 
 * @param {Number} actor_id 
 * @param {Amount} amount Optional
 * @returns 
 */
//function kun_follower_add( actor_id , amount ) {
function kun_follower_add_guest( actor_id , amount ) {
    return $gamePlayer.followers().addGuest(actor_id , amount || 1);
}
/**
 * @param {Number} actor_id 
 * @param {Boolean} removeAll Remove all from the same actor_id
 * @param {Number} exportVar export removed actors to this variable
 * @returns 
 */
//function kun_follower_remove(actor_id , removeAll , exportVar ) {
function kun_follower_remove_guest(actor_id , removeAll , exportVar ) {
    
    var removed = $gamePlayer.followers().dropGuest(actor_id , removeAll );

    if( typeof exportVar === 'number' && exportVar > 0 ){
        $gameVariables.setValue( exportVar , removed );
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
function kun_follower_reset_hireling( hireling , actor_id , level , variation ){

    return KUN.Followers.updateHireling( hireling , actor_id , level , variation );
}
/**
 * 
 * @param {String|Number} hireling 
 * @param {Number} level 
 * @param {Number} variation (optional)
 * @returns Number|Boolean Joined Actor ID or false if failure
 */
function kun_follower_join_hireling( hireling , level , variation ){
    return KUN.Followers.joinHireling( hireling , level , variation );
};
/**
 * @returns Number
 */
function kun_follower_count_hirelings(  ){
    return KUN.Followers.countHirelings();
};
/**
 * @returns Number
 */
 function kun_follower_max_hirelings( ){
    return KUN.Followers.maxHirelings() ;
 }


(function () {

    var parameters = PluginManager.parameters('KunFollowers');

    KUN.Followers = new KunFollowers();
    KUN.Followers.Set.MaxFollowers(parameters.followers);
    KUN.Followers.Set.MaxGuests(parameters.guests);
    KUN.Followers.Set.Debug(parameters.debug === 'true' );

    if (parameters.templates.length > 0) {
        JSON.parse(parameters.templates).forEach(function (actor_id) {
            KUN.Followers.addGuest(parseInt(actor_id));
        });
    }
    if (parameters.hirelingSlots.length > 0) {
        JSON.parse(parameters.hirelingSlots).forEach(function (actor_id) {
            KUN.Followers.addHirelingSlot(parseInt(actor_id));
        });
    }
    if (parameters.hirelings.length > 0) {
        JSON.parse(parameters.hirelings).forEach(function (hireling) {
            var _tpl = KunHireling.Import( hireling );
            if( hireling !== null ){
                KUN.Followers.addHirelingTemplate( _tpl );
            }
        });
    }

    KunFollowers.OverrideParty();
    KunFollowers.InitializeCommands();
    //kun_follower_override_game_actors();

})();

















