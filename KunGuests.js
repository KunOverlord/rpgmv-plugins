//=============================================================================
// KunGuests.js
//=============================================================================
/*:
 * @filename KunGuests.js
 * @plugindesc Add non-party member guests followers.
 * @version 1.40
 * @author Kun
 * 
 * @help
 * 
 * Add Guest Actors to the Followers queue.
 * 
 * Not party members, no party management, no battlers, just GUESTS!
 * 
 * And yes, you can join many of the same actor profile ^^
 * 
 * Define the guests which can be joined in the Allowed Guests list.
 * 
 * You can also use the Change Party Member command to join guests,
 * if the actor is a guest, it will be joined as many times as allowed guest followers.
 * 
 * COMMANDS
 * 
 *  KunGuest add|join [actor_id:actor_id:actor_id:actor_id]
 *  - Add an actor ID to the guest followers.
 * 
 *  KunGuest remove [actor_id|all] [gameVar] [all]
 *  - Remove an actor from the guest followers
 *  - Set the removed amount to gameVar when defined
 *  - Remove them all if required. (optional)
 * 
 *  KunGuest count [game_var] [actor_id]
 *  - Count how many guests are in party
 *  - Filter guest count by actor_id
 * 
 *  KunGuest max [game_var]
 *  - Export the maximum available guests in party
 * 
 *  KunGuest setup
 *  - Initialize the guest list in Game_Party. Use it to upgrade old saved games.
 * 
 * @param maxGuests
 * @text Maximum Guests
 * @desc How many guests can follow?
 * @type number
 * @min 0
 * @max 10
 * @default 0
 * 
 * @param allowed
 * @text Allowed Guests
 * @desc Allow to "guest" these followers only.
 * @type actor[]
 * 
 * @param commands
 * @type text[]
 * @text Plugin Commands
 * @desc Backward compatiblity commands for older plugins support
 * 
 * @param debug
 * @text Debug Mode
 * @type Boolean
 * @default false
 * 
 * 
 */

/**
 * @class {KunGuests}
 */
class KunGuests{
    /**
     * @returns {KunGuests}
     */
    constructor(){

        if( KunGuests.__intsance){
            return KunGuests.__intsance;
        }

        KunGuests.__intsance = this.initialize();
    }
    /**
     * @returns {KunGuests}
     */
    initialize(){

        const _parameters = this.pluginData();

        this._debug = _parameters.debug === 'true';
        this._max = parseInt(_parameters.maxGuests);
        this._commands = _parameters.commands.length ? JSON.parse(_parameters.commands) : [];
        this._guests = (_parameters.allowed.length > 0 ? JSON.parse(_parameters.allowed) : []).map(actor_id => parseInt(actor_id));

        return this;
    }

    /**
     * @returns Boolean
     */
    debug () {
        return this._debug;
    };
    /**
     * @param {String} command 
     * @returns {Boolean}
     */
    command( command = ''){
        return ['kunguests','kunguest'].includes(command.toLowerCase());
    }
    /**
     * @returns {Number}
     */
    max () {
        return this._max;
    };
    /**
     * @returns {Number}
     */
    guests () {
        return this._guests;
    };
    /**
     * @param {Number} actor_id
     * @returns {Boolean}
     */
    has (actor_id = 0) {
        return actor_id > 0 ? this.guests().includes(actor_id) : false;
    };
    /**
     * @returns Object
     */
    pluginData () {
        return PluginManager.parameters('KunGuests');
    };    

    /**
     * @param {String|Object} message 
     */
    static DebugLog (message = '') {
        if (KunGuests.instance().debug()) {
            console.log('[ KunGuests ] ', message);
        }
    };

    /**
     * @returns {KunGuests}
     */
    static instance(){
        return KunGuests.__intsance || new KunGuests();
    }
}


/**
 * 
 */
KunGuests_SetupGameParty = function () {

    /**
     * @returns {Boolean}
     */
    Game_Actor.prototype.isGuest = function () {
        return KunGuests.instance().has(this.actorId());
    };


    /**
     * @param {Number} actorId 
     */
    const _KunGuests_GameParty_Initialize = Game_Party.prototype.initialize;
    Game_Party.prototype.initialize = function () {
        _KunGuests_GameParty_Initialize.call(this);
        this.setupGuests();
    };
    /**
     * 
     */
    Game_Party.prototype.setupGuests = function ( ) {
        this._guests = [];
        for (var i = 0; i < this.maxGuests(); i++) {
            this._guests.push(0);
        }
    };
    /**
     * @returns {Number}
     */
    Game_Party.prototype.maxGuests = function () {
        return KunGuests.instance().max();
    };
    /**
     * @param {Boolean} visibleOnly
     * @returns {Number[]}
     */
    Game_Party.prototype.guests = function ( visibleOnly = false ) {
        return this._guests ? ( visibleOnly ? this._guests.filter( id => id > 0) : this._guests) : [];
    };
    /**
     * @param {Number} guestId 
     * @returns {Number}
     */
    Game_Party.prototype.countGuests = function (guestId = 0) {
        return (guestId > 0 ?
            this.guests(true).filter( id => id === guestId) :
            this.guests(true) ).length;
    };
    /**
     * @param {Number} actor_id
     * @returns {Boolean}
     */
    Game_Party.prototype.addGuest = function (actor_id) {
        if (KunGuests.instance().has(actor_id)) {
            for (var i = 0; i < this.guests().length; i++) {
                if (this._guests[i] < 1) {
                    this._guests[i] = actor_id;
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * @param {Number} actor_id Leave to zero to remove any
     * @param {Boolean} all
     */
    Game_Party.prototype.removeGuest = function (actor_id = 0, all = false) {
        var count = this.countGuests(actor_id);
        if( actor_id === 0 && all ){
            this.setupGuests();
            return count;
        }
        if( count ){
            if (all) {
                this._guests = this.guests().filter(id => id !== actor_id);
                for( var i = 0 ; i < count ; i++ ){
                    this._guests.push(0);
                }
                return count;
            }
            else {
                this.guests().splice(this.guests().indexOf(actor_id), 1);
                this._guests.push(0);
                return 1;
            }
        }
        return 0;
    };
    /**
     * @param {Number} actorId 
     */
    const _KunGuests_GameParty_AddActor = Game_Party.prototype.addActor;
    Game_Party.prototype.addActor = function (actorId) {
        if (KunGuests.instance().has(actorId) && this.size()) {
            this.addGuest(actorId);
            $gamePlayer.refresh();
            $gameMap.requestRefresh();
            KunGuests.DebugLog(`Joined Guest ${actorId}`);
        }
        else {
            _KunGuests_GameParty_AddActor.call(this, actorId);
            KunGuests.DebugLog(`Joined Actor ${actorId}`);
        }
    };
    /**
     * @param {Number} actorId 
     */
    const _KunGuests_GameParty_RemoveActor = Game_Party.prototype.removeActor;
    Game_Party.prototype.removeActor = function (actorId) {
        if (KunGuests.instance().has(actorId) && this.countGuests(actorId)) {
            this.removeGuest(actorId);
            $gamePlayer.refresh();
            $gameMap.requestRefresh();
            KunGuests.DebugLog(`Removed Guest ${actorId}`);
        }
        else {
            _KunGuests_GameParty_RemoveActor.call(this, actorId);
            KunGuests.DebugLog(`Removed Actor ${actorId}`);
        }
    };
    /**
     * @param {Boolean} includeGuests
     * @return {Number[]}
     */
    Game_Party.prototype.followers = function (includeGuests = false) {
        //const followers = this.size() > 0 ? this._actors.slice(1).map( (id,idx) => idx ) : [];
        const followers = this.size() > 0 ? this._actors.slice(1) : [];
        return includeGuests ? followers.concat(this.guests(true)) : followers;
    };
    /**
     * @returns Number
     */
    Game_Party.prototype.maxFollowers = function () {
        //remove the party leader
        return this.maxBattleMembers() + this.maxGuests() - 1;
    };

    //////////////////////////////////////////////////////////////////////////////////////////////
    //// GAME FOLLOWERS 
    //////////////////////////////////////////////////////////////////////////////////////////////
    var _KunGuests_GameFollowers_Initialize = Game_Followers.prototype.initialize;
    Game_Followers.prototype.initialize = function () {

        _KunGuests_GameFollowers_Initialize.call(this);

        for (var i = 0; i < $gameParty.maxGuests(); i++) {
            //add guest slots (reset to 0)
            this._data.push(new Game_Follower(-1));
        }
    };
    /**
     * Override
     */
    Game_Followers.prototype.refresh = function () {
        var followers = $gameParty.followers(true);
        var members = $gameParty.followers().length;
        for (var i = 0; i < this._data.length; i++) {
            if (i < members ) {
                //refresh all party members
                this._data[i].reset(i + 1, false);
            }
            else if (i < followers.length) {
                //refresh all guests
                this._data[i].reset(followers[i], true);
            }
            else {
                //reset and hide all remaining instances
                this._data[i].reset();
            }
            this._data[i].refresh();
        }
        KunGuests.DebugLog(this._data.map(d => d._memberIndex));
        //vanilla
        /*this.forEach(function(follower) {
            return follower.refresh();
        }, this);*/
    };

    //OVERRIDING GAME FOLLOWER

    var _KunGuests_GameFollower_Initialize = Game_Follower.prototype.initialize;
    Game_Follower.prototype.initialize = function (memberIndex) {
        this._guest = false;
        _KunGuests_GameFollower_Initialize.call(this, memberIndex);
    };

    var _KunGuests_GameFollower_isVisible = Game_Follower.prototype.isVisible;
    Game_Follower.prototype.isVisible = function () {
        //define visible if is guest or call the default method if not
        return this.isGuest() || _KunGuests_GameFollower_isVisible.call(this);
    };
    /**
     * @returns Number
     */
    Game_Follower.prototype.memberIndex = function () {
        return this._memberIndex;
    };
    /**
     * @param {Number} memberIndex 
     * @param {Boolean} guest 
     */
    Game_Follower.prototype.reset = function (memberIndex = 0, guest = false) {
        //member index 0 is leading party member, do not touch!
        this._memberIndex = memberIndex > 0 ? memberIndex : -1;
        this._guest = guest;
    };
    /**
     * Here's the big deal, a guest can use a party member slot below maxBattleMembers when the party is not full.
     * If we added the guests after the maxBattleMembers always, the guests would leave empty party character slots ;R
     * 
     * @param {Number} actorId (optional to check actorId verification)
     * @returns Boolean
     */
    Game_Follower.prototype.isGuest = function (actorId) {
        //member index must be more than 0 to validate
        if (this._guest && KunGuests.instance().has(this.memberIndex())) {
            return typeof actorId === 'number' && actorId > 0 ? this.memberIndex() === actorId : true;
        }
        return false;
    };
    /**
     * And here's another big gap
     * visible members defined my maxBattleMembers
     * invisible members are in background, not rendered
     * then come the guest members ;D which are visible again, but the party slot id gaps are big.
     * 
     * 
     * @returns Game_Actor
     */
    const _KunGuests_GameFollower_Actor = Game_Follower.prototype.actor;
    Game_Follower.prototype.actor = function () {
        return this.isGuest() ?
            //return guest from GameActors
            $gameActors.actor(this.memberIndex()) :
            //return member from GameParty
            _KunGuests_GameFollower_Actor.call(this);
    };
    var _KunGuests_GameFollower_Update = Game_Follower.prototype.update;
    Game_Follower.prototype.update = function () {
        _KunGuests_GameFollower_Update.call(this);
        this.setStepAnime(this.isGuest());
    }
}


/**
 * 
 */
function KunGuests_SetupCommands() {
    var _KunGuests_Commands = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunGuests_Commands.call(this, command, args);
        if( KunGuests.instance().command(command) ) {
            if (args && args.length) {
                switch (args[0]) {
                    case 'setup':
                        $gameParty.setupGuests();
                        break;
                    case 'add':
                    case 'join':
                        if( args.length > 1 ){
                            var amount = 0;
                            args[1].split(':').map( id => parseInt(id)).forEeach(function(id){
                                if( $gameParty.addGuest(id) ){
                                    amount++;
                                }
                            });
                            if( amount ){
                                $gamePlayer.refresh();
                                $gameMap.requestRefresh();
                            }
                            if( args.length > 2 ){
                                $gameVariables.setValue(parseInt(args[2]),amount);
                            }
                        }
                        break;
                    case 'remove':
                        if (args.length > 1) {
                            var amount = $gameParty.removeGuest( args[1] === 'all' ? 0 : parseInt(args[1]) , args.includes('all') );
                            if( amount ){
                                $gamePlayer.refresh();
                                $gameMap.requestRefresh();
                            }
                            var gameVar = args.length > 2 ? parseInt(args[2]) : 0;
                            if (gameVar) {
                                $gameVariables.setValue(gameVar, amount);
                            }
                        }
                        break;
                    case 'count':
                        if (args.length > 1) {
                            var gameVar = parseInt(args[1]);
                            var guests = $gameParty.countGuests(args.length > 2 ? parseInt(args[2]) : 0);
                            $gameVariables.setValue(gameVar, guests);
                        }
                        break;
                    case 'max':
                        if (args.length > 1) {
                            var gameVar = parseInt(args[1]);
                            $gameVariables.setValue(gameVar, $gameParty.maxGuests());
                        }
                        break;
                }
            }
        }
    };
}

(function () {

    KunGuests.instance();
    KunGuests_SetupGameParty();
    KunGuests_SetupCommands();

})();

















