//=============================================================================
// KunEquipHacks.js
//=============================================================================
/*:
 * @filename KunEquipHacks.js
 * @author KUN
 * @plugindesc Equipment handlers
 * 
 * @param debug
 * @text Debug
 * @description Show some debug info in console ;)
 * @type Boolean
 * @default false
 * 
 * @param equipEventId
 * @text Equip ON Event
 * @desc Use this event to handle an item being equipped, and map to the [Actor Variable ID] and [Item Variable ID] used
 * @type common_event
 * @default 0
 * 
 * @param unEquipEventId
 * @text Equip OFF Event
 * @desc Use this event to handle an item being unequipped, and map to the [Actor Variable ID] and [Item Variable ID] used
 * @type common_event
 * @default 0
 * 
 * @param dropEquipEventId
 * @text Equip Drop Event
 * @desc Use this event to handle an item being dropped or stolen while equiped ( through the drop function|command ), and map to the [Actor Variable ID] and [Item Variable ID] used
 * @type common_event
 * @default 0
 * 
 * @param slotPriority
 * @type Number[]
 * @text Slot Priority Check
 * @min 0
 * 
 * @param itemVarId
 * @text Item Variable ID
 * @desc The variable used to map the equippable item's id
 * @type Variable
 * @min 0
 * @default 0
 * 
 * @param actorVarId
 * @text Actor Variable ID
 * @desc The variable used to handle the actor whose equipment is being changed
 * @type Variable
 * @min 0
 * @default 0
 * 
 * @param enemyVarId
 * @text Enemy Variable ID
 * @desc The variable used to handle the enemy's battler target ID
 * @type Variable
 * @min 0
 * @default 0
 * 
 * @help
 * 
 * KunEquipHacks will help you out in 2 major cases:
 * 
 * To setup several events and variables to fire different common events wether
 * a party member's equipment is being CHANGED or STOLEN  in order to provide
 * a better control on what happens when such gear is equipped [Equip ON Event]
 * or removed [Equip OFF Event], such as changing actor graphics or firing
 * other events.
 * 
 * Also features the option [Equip Drop Event] (through function and command)
 * to drop an equip with firing a special event with different rules than the
 * [Equip OFF Event] in such cases where an equiped item is being removed,
 * dropped or stolen.
 * 
 * A second feature from KunEquipHacks, is tracking the focused actor and the
 * enemy who perform the battle turn  in combat, so we can handle WHO is firing
 * a special or scripted skill and who receives the effect.
 * 
 * COMMANDS
 * 
 * - KunEquipHacks unequip actor_id slot_id [export]
 *      Unequips any equiped item attached to the slot_id from the selected actor_id,
 *      while exports the detached item_id and actor_id, then fires the selected
 *      Change Equip Custom Event
 * - KunEquipHacks drop actor_id slot_id [export]
 *      Drops any equiped item attached to the slot_id from the selected actor_id,
 *      while exports the detached item_id and actor_id, then fires the selected
 *      drop Custom Event
 * - KunEquipHacks random
 *      Picks and exports a random actor_id from the active party into the
 *      selected variable
 * - KunEquipHacks count
 *      Exports the active party actor count into the selected variable
 * - KunEquipHacks capture
 *      Fires the capture event which will export the current actor_id
 *      and enemy_id into the selected variables, as their respective
 *      roles as caster or target
 */

/**
 * @description KUN Modules
 * @type KUN
 */
var KUN = KUN || {};


/**
 * 
 * @returns KunEquipHacks
 */
function KunEquipHacks(){

    var _mgr = {
        'debug': false,
        'onEquipId': 0,
        'onUnequipId': 0,
        'onDropId': 0,
        'itemVarId': 0,
        'actorVarId': 0,
        'targetVarId': 0,
        'slots':[],
        'partyMemberLimit': 8
    };

    this.Set = {
        'Debug': ( debug ) => _mgr.debug = debug,
        'EquipId': ( id ) => _mgr.onEquipId = id,
        'UnequipId': ( id ) => _mgr.onUnequipId = id,
        'DropId': ( id ) => _mgr.onDropId = id,
        'ItemVarId': ( id ) => _mgr.itemVarId = id,
        'ActorVarId': ( id ) => _mgr.actorVarId = id,
        'TargetVarId': ( id ) => _mgr.targetVarId = id,
    };
    /**
     * @returns Boolean
     */
    this.debug = () => _mgr.debug;
    /**
     * @param {Number} slot_id 
     * @returns Boolean
     */
    this.addSlot = function( slot_id ){
        for( var i =  0 ; i < _mgr.slots.length ; i++ ){
            if( _mgr.slots[i] === slot_id ){
                return false;
            }
        }
        _mgr.slots.push( slot_id );
        return true;
    };
    /**
     * @returns Array
     */
    this.slots = () => _mgr.slots;
    /**
     * @param {Number} item_id 
     * @returns KunEquipHacks
     */
    this.exportItemId = function( item_id ){
        if( _mgr.itemVarId ){
            $gameVariables.setValue( _mgr.itemVarId , item_id );
        }
        return this;
    };
    /**
     * @param {Number} actor_id 
     * @returns KunEquipHacks
     */
    this.exportActorId = function( actor_id ){
        if( _mgr.actorVarId ){
            $gameVariables.setValue( _mgr.actorVarId , actor_id );
        }
        return this;
    };
    /**
     * @returns Number
     */
    this.actorId = () => $gameVariables.value(_mgr.actorVarId );
    /**
     * @param {Number} actor_id 
     * @returns KunEquipHacks
     */
    this.exportTargetId = function( target_id ){
        if( _mgr.targetVarId ){
            $gameVariables.setValue( _mgr.targetVarId , target_id );
        }
        return this;
    };
    /**
     * @returns Number
     */
    this.targetId = () => $gameVariables.value(_mgr.targetVarId );
    /**
     * @param {Number} item_id 
     * @param {Number} actor_id
     * @returns KunEquipHacks
     */
     this.onEquip = function( item_id , actor_id ){
        if( _mgr.onEquipId ){
            //export variables
            this.exportItemId( item_id ).exportActorId( actor_id );
            //run event!
            $gameTemp.reserveCommonEvent( _mgr.onEquipId );

            KunEquipHacks.DebugLog( 'Item['+item_id+'] attached on Actor['+actor_id+']' );
        }
        return this;
    };
    /**
     * @param {Number} item_id 
     * @param {Number} actor_id
     * @returns KunEquipHacks
     */
     this.onDrop = function( item_id , actor_id ){

        if( _mgr.onDropId > 0 ){
            //export variables
            this.exportItemId( item_id ).exportActorId( actor_id );
            //run event!
            $gameTemp.reserveCommonEvent( _mgr.onDropId );
            
            KunEquipHacks.DebugLog( 'Item['+item_id+'] dropped from Actor[' + actor_id + ']' );

            //return this;
        }
        return this;
    };
    /**
     * @returns Boolean
     */
    this.canDrop = ( ) => _mgr.onDropId > 0;
    this.canEquip = ( ) => _mgr.onEquipId > 0;
    this.canUnequip = ( ) => _mgr.onUnequipId > 0;
    this.onDropId = ( ) => _mgr.onDropId;
    this.onEquipId = ( ) => _mgr.onEquipId;
    this.onUnequipId = ( ) => _mgr.onUnequipId;
    /**
     * @returns Number
     */
    this.exportBattlerTarget = function( ){
        
        if( $gameParty.inBattle() && BattleManager._action !== null ){

            var targetEnemy = BattleManager._action._subjectActorId > 0;

            var caster_id = targetEnemy ?
                //caster is party character, CAREFUL!!! this is the actual ACTOR ID, not the party member in  the troop!!!
                BattleManager._action._subjectActorId :
                //caster is troop enemy (-1 if not used)
                BattleManager._action._subjectEnemyIndex;
            
            var target_id = targetEnemy ? 
                //target is troop enemy
                BattleManager._action._targetIndex :
                //target is party member
                $gameParty.members().length > 1 ? Math.floor( Math.random() * $gameParty.members().length ) : 0;
            
            var actor_id = targetEnemy ? caster_id : $gameParty.members()[ target_id ]._actorId;
            var enemy_id = $gameTroop.members()[ targetEnemy ? target_id : caster_id ]._enemyId;

            this.exportActorId( actor_id ).exportTargetId(enemy_id);

            return targetEnemy ? enemy_id : actor_id;
        }

        return 0;
    };

    return this;
};

/**
 * @param {*} message 
 */
 KunEquipHacks.DebugLog = ( message ) =>{
    if( KUN.EquipHacks.debug() ){
        if( typeof message === 'object' ){
            console.log( '[ KunEquipHacks Object Data ] ');
            console.log( message );
        }
        else{
            console.log( '[ KunEquipHacks ] - ' + message );
        }
        
    }
};
/**
 * Hack Actor equip and Unequip Events
 */
KunEquipHacks.SetupEquipEvents = function(){

    //OVERRIDE  changeEquip method
    Game_Actor.prototype.onEquipChange = Game_Actor.prototype.changeEquip;
    /**
     * This override will be handled through the inventory and vanilla user controls
     * @param {Number} slot_id 
     * @param {Game_Item} item 
     */
    Game_Actor.prototype.changeEquip = function (slot_id, item) {
        var unequiped_id = this.getEquipedItem( slot_id ).id;
        this.onEquipChange( slot_id, item );
        this.onEquipItem( item !== null ? item.id : 0 , this._actorId );
        if( unequiped_id > 0 ){
            //called wethere there's a new item or not (empty item)
            this.onUnequipItem( unequiped_id , this._actorId );
        }
    }
    /**
     * Cause the equip event to fire
     * @param {Number} item_id 
     * @param {Number} actor_id 
     */
    Game_Actor.prototype.onEquipItem = function( item_id , actor_id ){
        if( KUN.EquipHacks.canEquip()){
                //export variables
                KUN.EquipHacks.exportItemId( item_id ).exportActorId( actor_id );
                //run event!
                $gameTemp.reserveCommonEvent( KUN.EquipHacks.onEquipId() );
                KunEquipHacks.DebugLog( `Item[${item_id}] unequipped from Actor[${actor_id}]` );
        }
    }
    /**
     * Cause the unequip event to fire
     * @param {Number} item_id 
     * @param {Number} actor_id 
     */
    Game_Actor.prototype.onUnequipItem = function( item_id , actor_id ){
        if( KUN.EquipHacks.canUnequip()){
                //export variables
                KUN.EquipHacks.exportItemId( item_id ).exportActorId( actor_id );
                //run event!
                $gameTemp.reserveCommonEvent( KUN.EquipHacks.onUnequipId() );
                KunEquipHacks.DebugLog( `Item[${item_id}] equipped by Actor[${actor_id}]` );
        }
    }
    /**
     * Cause the drop event to fire
     * @param {Number} item_id 
     * @param {Number} actor_id 
     */
    Game_Actor.prototype.onDropItem = function( item_id , actor_id ){
        if( KUN.EquipHacks.canDrop()){
                //export variables
                KUN.EquipHacks.exportItemId( item_id ).exportActorId( actor_id );
                //run event!
                $gameTemp.reserveCommonEvent( KUN.EquipHacks.onDropId() );
                KunEquipHacks.DebugLog( `Item[${item_id}] dropped from Actor[${actor_id}]` );
        }
    }

    /**
     * Attach the item capture by slot ID
     * @param {Number} slot_id 
     * @returns Game_Item | null
     */
    Game_Actor.prototype.getEquipedItem = function( slot_id ){
        if( this.validSlotId( slot_id ) ){
            var item = this.equips()[ slot_id ];
            return item !== null ? item : null;
        }
        return {'id':0};
    };
    /**
     * @param Number slot_id
     * @param Boolean remove
     */
    Game_Actor.prototype.dropEquip = function ( slot_id , remove ) {

        if( typeof slot_id === 'number' && slot_id > 0 ){
            //capture current item in slot
            var item = this.getEquipedItem( slot_id - 1 );
            if( item.id > 0 ){
                var item_id = item.id;
                //unequip item
                this.onEquipChange( slot_id - 1, null );
                //console.log( 'SLOT: ' +slot_id );
                if( typeof remove === 'boolean' && remove ){
                    //remove
                    $gameParty.loseItem( item , 1 );
                }
                //handle through the drop equip event
                this.onDropItem( item_id , this._actorId );
                
                return item_id;
            }
        }
        return 0;
    }
    /**
     * @param {Number} slot_id 
     * @returns Boolean
     */
    Game_Actor.prototype.validSlotId = function( slot_id ){
        return slot_id && slot_id < this.equips().length;
    };
}
/**
 * Add Party Hacks
 */
KunEquipHacks.SetupPartyHacks = function(){
    /**
     * @returns Number
     */
    Game_Actors.prototype.count = function(){
        return $dataActors.length;
    };
    /**
     * REturn a Random active Actor's ID
     * @param {Number} exportVar Export the captured Actor ID into this variable | 0 by default to ignore export variable
     * @returns Number
     */
    Game_Party.prototype.getRandomMember = function( exportVar ){
        var id = parseInt( Math.random() * this.members().length );
        var actor = this.members()[ id ];

        if( typeof exportVar === 'number' && exportVar > 0 ){
            $gameVariables.setValue( exportVar , actor._actorId );
        }

        return actor._actorId;
    };
    /**
     * @param {Number} exportVar 
     * @returns {Number}
     */
    Game_Party.Count = function( exportVar ){
        var count = $gameParty.members().length;
        if( typeof exportVar === 'number' && exportVar > 0 ){
            $gameVariables.setValue( exportVar , count );
        }
        return count;
    };
    /**
     * @param {Number} actor_id
     * @returns {String}
     */
    Game_Party.ActorName = function( actor_id ){
        if( actor_id < $gameParty.members().length ){
            return $gameParty.members()[ actor_id ].name().toString().toLowerCase();
        }
        return '';
    };
    /**
     * REturn the actor ID by it's party position in the list of active characters
     * @param {Number} party_id
     * @param {Number} exportVar
     * @returns {Number}
     */
    Game_Party.ActorID = function( party_id , exportVar ){
        var id = party_id > 0 ? party_id - 1 : 0;
        exportVar = typeof exportVar === 'number' && exportVar > 0 ? exportVar : 0;
        if( id < $gameParty.members().length ){
            var actor_id = $gameParty.members()[ id ].actorId();
            if( exportVar ){
                $gameVariables.setValue( exportVar , actor_id );
            }
            return actor_id;
        }
        return 0;
    };
    /**
     * @param {Number} enemy_id 
     * @returns String
     */
    Game_Troop.EnemyName = function( enemy_id ){
        KunEquipHacks.DebugLog( 'enemy id is ' + enemy_id );
        if( enemy_id > 0 && enemy_id < $dataEnemies.length ){
            var enemy = $dataEnemies[ enemy_id ];
            return enemy.name;
        }
        return '--';
    }
};
/**
 * Add Commands
 */
KunEquipHacks.SetupInterpreter = function(){
    //override vanilla
    var _KunQuestMan_Interpreter_Command = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _KunQuestMan_Interpreter_Command.call(this, command, args);
        if( command === 'KunEquipHacks' && args.length > 0 ){
            switch( args[0] ){
                case 'export':
                    _actorId = args.length > 2 ? $gameVariables.value( parseInt(args[1]) ) : 1;
                    $gameVariables.setValue(
                        args.length > 2 ? parseInt(args[2]) : parseInt(args[1]) ,
                        kun_protection( _actorId > 0 ? _actorId : 1 ) );
                    break;
                case 'unequip':
                    if( args.length > 2 ){
                        //KunEquipHacks.DebugLog( args );
                        //drop by slot id
                        kun_unequip(
                            //actor_id
                            parseInt(args[1]) ,
                            //slot_id
                            parseInt(args[2]) ,
                            //export Var
                            args.length > 3 && args[3] === 'import' );
                    }
                    break;
                case 'drop':
                    if( args.length > 2 ){
                        //KunEquipHacks.DebugLog( args );
                        //drop by slot id
                        kun_drop_equip(
                            //actor_id
                            parseInt(args[1]) ,
                            //slot_id
                            parseInt(args[2]) ,
                            //export Var
                            args.length > 3 && args[3] === 'remove' );
                    }
                    break;
                case 'count':
                    if( args.length > 1 ){
                        //export party count into a selected var
                        kun_count_party( parseInt( args[ 1 ] ) );
                    }
                    break;
                case 'random':
                    if( args.length > 1 ){
                        //export random party member ID into a selected var
                        kun_random_member( parseInt( args[ 1 ] ) );
                    }
                    break;
                case 'capture':
                    //all capture and caster IDS are exported into the parameter defined variables (enemyId and actorId)
                    kun_capture_target();
                    break;
            }
        }
    };
};
/**
 * Override the window escape characters
 */
KunEquipHacks.SetupEscapeCharacters = function(){
    Window_Base.prototype._KunEquipHacksEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        //parse first the vanilla strings
        var parsed = Window_Base.prototype._KunEquipHacksEscapeCharacters.call(this, text);

        parsed = parsed.replace(/\x1bEQ\[(\d+)\]/gi, function () {
            //include item names here
            return this.displayEquipName( parseInt(arguments[1]) );
        }.bind(this));

        parsed = parsed.replace(/\x1bIT\[(\d+)\]/gi, function () {
            //include item names here
            return this.displayItemNote( parseInt(arguments[1]) );
        }.bind(this));
        
        parsed = parsed.replace(/\x1bIN\[(\d+)\]/gi, function () {
            //include item names here
            return this.displayItemName( parseInt(arguments[1]) );
        }.bind(this));

        parsed = parsed.replace(/\x1bID\[(\d+)\]/gi, function () {
            //include item DESCRIPTIONS HERE
            return this.displayItemDescription( parseInt(arguments[1]) );
        }.bind(this));

        parsed = parsed.replace(/\x1bIC\[(\d+)\]/gi, function () {
            //include item ICONS HERE
            var icon_id = this.displayItemIcon( parseInt(arguments[1]) );
            if( icon_id > 0 ){
                this.drawIcon( icon_id , 0, 0 );
            }
            return "";
        }.bind(this));

        parsed = parsed.replace(/\x1bAN\[(\d+)\]/gi, function () {
            //actor nick names
            return this.displayNickName( parseInt(arguments[1]) );
        }.bind(this));

        parsed = parsed.replace(/\x1bAC\[(\d+)\]/gi, function () {
            //actor class name
            return this.displayActorClassName( parseInt(arguments[1]) );
        }.bind(this));

        parsed = parsed.replace(/\x1bPN\[(\d+)\]/gi, function () {
            //include party member name
            return this.displayPartyMemberName( parseInt(arguments[1]) );
        }.bind( this ));

        parsed = parsed.replace(/\x1bSK\[(\d+)\]/gi, function () {
            //Game Skills
            return this.displaySkillName(parseInt(arguments[1]));
        }.bind(this));

        parsed = parsed.replace(/\x1bEN\[(\d+)\]/gi, function () {
            //Enemy Name
            return this.displayEnemyName(parseInt(arguments[1]));
        }.bind(this));

        return parsed;
    };
    /**
     * Display Actor Nickname
     * @param {Number} actor_id
     * @returns 
     */
    Window_Base.prototype.displayNickName = function(actor_id) {
        var actor = actor_id > 0 ? $gameActors.actor(actor_id) : null;
        return actor ? actor.nickname() : '{INVALID_ACTOR_ID_' + actor_id + '}';
    };
    /**
     * Display Actor class Name
     * @param {Number} id 
     * @returns 
     */
    Window_Base.prototype.displayActorClassName = function(actor_id) {
        var actor = Number.isSafeInteger(actor_id) && actor_id > 0 ? $gameActors.actor(actor_id) : null;
        return actor ? actor.currentClass().name : '{INVALID_ACTOR_ID_' + actor_id + '}';
    };
    /**
     * @param {Number} position_id 
     * @returns 
     */
    Window_Base.prototype.displayPartyMemberName = function(position_id) {
        //get actor by id
        if( Number.isSafeInteger(position_id) ){
            var idx = position_id - 1;
            if( idx < $gameParty.members().length ){
                return $gameParty.members()[ idx ].name();
            }
        }
        return '{INVALID_ACTOR_ID_' + position_id + '}';
    };
    /**
     * @param {Number} item_id 
     * @returns 
     */
    Window_Base.prototype.displayItemIcon = function(item_id) {
        //get item by id
        if (Number.isSafeInteger(item_id) && item_id > 0 && item_id < $dataItems.length) {
            //item.name
            return parseInt($dataItems[item_id].iconIndex);
        }
        return 0;
    };
    /**
     * @param {Number} item_id 
     * @returns 
     */
    Window_Base.prototype.displayItemName = function(item_id) {
        //get item by id
        if (Number.isSafeInteger(item_id) && item_id > 0 && item_id < $dataItems.length) {
            //item.name
            return $dataItems[item_id].name;
        }
        return '{INVALID_ITEM_ID_' + item_id + '}';
    };
    /**
     * @param {Number} armor_id 
     * @returns 
     */
    Window_Base.prototype.displayEquipName = function(armor_id) {
        //get item by id
        if (Number.isSafeInteger(armor_id) && armor_id > 0 && armor_id < $dataArmors.length) {
            //item.name
            //console.log('Armor Id ' + armor_id );
            return $dataArmors[armor_id].name;
        }
        return '{INVALID_EQUIP_ID_' + armor_id + '}';
    };
    /**
     * @param {Number} item_id 
     * @returns 
     */
    Window_Base.prototype.displayItemDescription = function(item_id) {
        //get item by id
        if (Number.isSafeInteger(item_id) && item_id > 0 && item_id < $dataItems.length) {
            //item.name
            return $dataItems[item_id].description;
        }
        return '{INVALID_ITEM_ID_' + item_id + '}';
    };
    /**
     * @param {Number} item_id 
     * @returns 
     */
    Window_Base.prototype.displayItemNote = function(item_id) {
        //get item by id
        if (Number.isSafeInteger(item_id) && item_id > 0 && item_id < $dataItems.length) {
            //item.name
            return $dataItems[item_id].note;
        }
        return '{INVALID_ITEM_ID_' + item_id + '}';
    };
    /**
     * @param {Number} skill_id 
     * @returns 
     */
    Window_Base.prototype.displaySkillName = function(skill_id) {
        //get skill ID
        return Number.isSafeInteger(skill_id) && $dataSkills.length > skill_id ?
                $dataSkills[ skill_id ].name :
                '{INVALID_SKILL_ID_' + skill_id + '}';
    };
    /**
     * @param {Number} enemy_id 
     * @returns 
     */
    Window_Base.prototype.displayEnemyName = function(enemy_id) {
        //get skill ID
        return Number.isSafeInteger( enemy_id) ?
                Game_Troop.EnemyName( enemy_id ) :
                '{INVALID_ENEMY_ID_' + enemy_id + '}';
    };
};

/**
 * @param Number actor_id Actor ID. 1 by default
 * @param Number slot_id Slot ID
 * @param boolean remove item
 * @returns Number Removed Item
 */
function kun_drop_equip( actor_id , slot_id , remove ){
    
    if( actor_id === 0 ){
        actor_id = KUN.EquipHacks.actorId();
    }

    var actor = actor_id > 0 && actor_id < $gameActors.count() ? $gameActors.actor( actor_id ) : null;
    
    return actor !== null && actor.validSlotId( slot_id ) ? actor.dropEquip( slot_id , remove ) : 0;
}

/**
 * @param Number actor_id Actor ID. 1 by default
 * @param Number slot_id Slot ID
 * @param boolean importVars to get the actor_id and slot_id from $gameVariables
 * @returns Number Removed Item
 */
function kun_unequip( actor_id , slot_id , importVars ){
    
    importVars = typeof importVars === 'boolean' ? importVars : false;

    if( importVars ){
        actor_id = $gameVariables.value( actor_id );
        slot_id = $gameVariables.value( slot_id );
    }

    var actor = actor_id > 0 && actor_id < $gameActors.count() ? $gameActors.actor( actor_id ) : null;
    
    if( actor !== null && slot_id > 0 && slot_id <= actor.equips().length ){
        return actor.changeEquip( slot_id , null );
    }
    return 0;
}

/**
 * @param Number actor_id Actor ID. 1 by default
 * @returns Number Protection value
 */
 function kun_protection(actor_id) {

    if( $gameParty.allMembers().length === 0 ){
        return 0;
    }

    if (typeof actor_id !== 'number' || actor_id < 1) {
        actor_id = KUN.EquipHacks.actorId();
    }

    var actor = $gameActors.actor(actor_id || 1);

    var slots = KUN.EquipHacks.slots();
    var equips = actor.equips();

    for( var i = slots.length - 1 ; i > -1 ; i-- ){
        var slot = slots[i];
        console.log( `slot ${slot}/${equips.length}` );
        if( slot > 0 && slot <= equips.length ){
            console.log(equips[ slot - 1 ]);
            if( equips[ slot - 1 ] !== null ){
                return i+1;
            }
        }
    }

    return 0;
}

/**
 * @param {Number} exportVar Export the captured Actor ID into this variable | 0 by default to ignore export variable
 * @returns Number
 */
 function kun_random_member( exportVar ){
    return $gameParty.getRandomMember( exportVar );
};
/**
 * @param Number exportVar
 * @returns Number
 */
function kun_count_party( exportVar ){
    return Game_Party.Count( exportVar );
}
/**
 * @param Number exportVar
 * @returns Number
 */
function kun_max_party_members( exportVar ){
    
    var max = $gameParty.maxBattleMembers();
    
    if( typeof exportVar === 'number' && exportVar > 0 ){
        $gameVariables( exportVar , max );
    }

    return max;
}
/**
 * @returns Number
 */
function kun_capture_target( ){

    return KUN.EquipHacks.exportBattlerTarget();
}

/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/


 (function( /* args */ ){

    var parameters = PluginManager.parameters('KunEquipHacks');
    KUN.EquipHacks = new KunEquipHacks();
    
    var slots = parameters['slotPriority'].length > 0 ? JSON.parse(parameters['slotPriority']) : [];
    slots.forEach( function( slot_id ){
        KUN.EquipHacks.addSlot( parseInt( slot_id ) );
    });
    //console.log( KUN.EquipHacks.slots() );

    KUN.EquipHacks.Set.Debug(parameters.debug === 'true' );
    KUN.EquipHacks.Set.EquipId(parseInt(parameters.equipEventId) );
    KUN.EquipHacks.Set.DropId(parseInt(parameters.dropEquipEventId) );
    KUN.EquipHacks.Set.UnequipId(parseInt(parameters.unEquipEventId) );
    KUN.EquipHacks.Set.ItemVarId(parseInt(parameters.itemVarId) );
    KUN.EquipHacks.Set.ActorVarId(parseInt(parameters.actorVarId) );
    KUN.EquipHacks.Set.TargetVarId(parseInt(parameters.enemyVarId ) );

    KunEquipHacks.SetupEquipEvents();
    KunEquipHacks.SetupPartyHacks();
    KunEquipHacks.SetupInterpreter();
    KunEquipHacks.SetupEscapeCharacters();

})( /* initializer */);


