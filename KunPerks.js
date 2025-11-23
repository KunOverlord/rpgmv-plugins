//=============================================================================
// KunPerks.js
//=============================================================================
/*:
 * @plugindesc KunPerks
 * @filename KunPerks.js
 * @author KUN
 * @version 1.14C
 * 
 * @help
 * 
 * COMMANDS
 * 
 * KunPerks add [actor_id:tags...] Title 1,Title 2,Title 3, ...
 * KunPerks perk [actor_id:tags...] Title 1,Title 2,Title 3, ...
 *      Add perks to an actor by actor_id
 *      Add 1 or more perk at once, separated by commas
 *      Tag a specific perk or list of perks
 * 
 * KunPerks unlock [actor_id:tags...] Title 1,Title 2,Title 3, ...
 *      Adds perks one by one within the title list to the selected actor.
 *      As one perk is unlocked, it adds the next one.
 *      Use tag to filter per npc/faction
 * 
 * KunPerks reset [actor_id:tag] | all
 *      Reset actor_id's titles, or all actors' titles
 *      Reset a scope of perks by tags
 * 
 * @param debug
 * @text Debug
 * @desc Show debug info
 * @type Boolean
 * @default false
 * 
 * @param processNickName
 * @text NickName Escape Char
 * @desc Process Actor's NickNames \AN[] as default or as perks. Select none to avoid conflicts with other plugins.
 * @type select
 * @option None
 * @value none
 * @option Default
 * @value default
 * @option Perks
 * @value perks
 * @default none
 * 
 */

function KunPerks(){
    throw `${this.constructor.name} is a Static Class`;
}
/**
 * 
 */
KunPerks.Initialize = function(){

    var parameters = this.parameters();

    this._debug = parameters.debug === 'true';
    this._nickName = parameters.processNickName;
};
/**
 * @returns Object
 */
KunPerks.parameters = function(){
    return  PluginManager.parameters('KunPerks');
};
/**
 * @returns Boolean
 */
KunPerks.debug = function(){
    return this._debug;
};
/**
 * @returns String
 */
KunPerks.nickName = function(){
    return this._nickName;
};
/**
 * @returns Boolean
 */
KunPerks.processNickName = function(){
    return this.nickName() !== KunPerks.NickNameTypes().NONE;
};
/**
 * @returns Boolean
 */
KunPerks.nickNameAsPerks = function(){
    return this.nickName() === KunPerks.NickNameTypes().PERKS;
};
/**
 * @param {String|Object} message 
 */
KunPerks.DebugLog = function( message ){
    if( this.debug() ){
        console.log( '[KunPerks]' , message );
    }
};

/**
 * 
 */
KunPerks.NickNameTypes = function(){
    return {
        'NONE': 'none',
        'DEFAULT': 'default',
        'PERKS': 'perks',
    };
};
/**
 * 
 */
KunPerks.Upgrade1 = function(){
    $gameActors._data.filter( actor => actor !== null && actor.hasOwnProperty('_perks')).forEach( function(actor ){
        //upgrade all perk tags
        actor._perks = actor.perks().map( function(perk){
            return Array.isArray(perk.tags) ? {
                'title':perk.title,
                'tags': perk.tags.length ? perk.tags[0] : '',
            } : perk;
        });
        KunPerks.DebugLog(`Upgraded perks for ${actor.name()} ${actor.perks(true).join(', ')}`);
    });
};


/**
 * 
 */
function KunPerks_GameActor(){

    var _KunPerks_GameActor_Initialize = Game_Actor.prototype.initialize;
    Game_Actor.prototype.initialize = function(actorId) {
        _KunPerks_GameActor_Initialize.call(this,actorId);
        this.perks();
    };

    if( KunPerks.nickName() ){
        //if defined in the parameters, override the setNickname to use nickname as a perk
        //allowing tag from the nickname event setup
        var _KunPerks_GameActor_SetNickName = Game_Actor.prototype.setNickname;
        Game_Actor.prototype.setNickname = function(nickname) {
            if( typeof nickname === 'string' && nickname.length ){
                var title = nickname.split(':');
                if( title.length > 1 ){
                    //do not update the nickname, add to the filtered title list
                    this.addPerk( title[title.length - 1 ] , title[0] );
                }
                else{
                    //add as a normal nickname and register in the title list
                    _KunPerks_GameActor_SetNickName.call( this, title[0] );
                    this.addPerk( title[0] );
                }    
            }
        };
    
    }

    /**
     * @param {Boolean} map
     * @param {String} tag
     * @returns {String[]|Object[]}
     */
    Game_Actor.prototype.perks = function( map = false , tag = 'all' ) {
        
        if( !this.hasOwnProperty( '_perks' )){
            this._perks = [];
        }

        var selection = typeof tag === 'string' && tag.length ?
            this._perks.filter( perk => perk.tags === tag || tag==='all' ) :
            this._perks.filter(perk => perk.tags.length === 0);
        
        return typeof map === 'boolean' && map ? selection.map( perk => perk.title ) : selection;
    };    
    /**
     * @param {String} tag
     * @returns Game_Actor
     */
    Game_Actor.prototype.resetPerks = function( tag ) {
        if( typeof tag === 'string' && tag.length && tag !== 'all' ){
            var exclude = this.perks(true,tag);
            this._perks = this.perks().filter( perk => !exclude.includes(perk.title));
        }
        else{
            //reset adding the current nickname?
            this._perks = [];
        }
        KunPerks.DebugLog(this.perks());
        return this;
    };
    /**
     * @param {String} title 
     * @returns Boolean
     */
    Game_Actor.prototype.hasPerk = function( title ) {
        return this.perks( true ).filter( perk => perk === title ).length > 0;
    }
    /**
     * Registers a new perk (cannot duplicate not even with different tags)
     * @param {String} title 
     * @param {String} tags 
     * @returns Game_Actor
     */
    Game_Actor.prototype.addPerk = function( title , tags ) {
        if( !this.hasPerk(title)){
            this._perks.push({
                'title':title,
                'tags': typeof tags === 'string' ? tags : '',
            });
            KunPerks.DebugLog( `Added ${title} perk for ${this.name()}` );
        }
        return this;
    };
    /**
     * Remove all matching perks|titles
     * @param {String} title 
     * @returns Game_Actor
     */
    Game_Actor.prototype.dropPerk = function( title ) {
        if( this.hasPerk(title)){
            this._perks = this.perks().filter( perk => perk.title !== title );
            KunPerks.DebugLog( `Removed ${title} perk from ${this.name()}` );
        }
        return this;
    };
    /**
     * Get a random perk, use a tag to filter
     * @param {String} tag 
     * @returns String
     */
    Game_Actor.prototype.perk = function( tag = '') {
        var selection = this.perks(true,tag);
        return selection.length > 0 ? selection[ Math.floor(Math.random() * selection.length )] : this.nickname();
    };
}

/**
 * 
 */
function KunPerks_PluginCommands(){
    var _KunPerks_CommandInterpreter = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunPerks_CommandInterpreter.call(this, command, args);
        if( command === 'KunPerks' && args.length > 1 ){
            switch( args[0] ){
                case 'add':
                case 'perk':
                    var target = args[1].split(':');
                    var nicknames = args.slice( 2 , args.length).join(' ').split(',');
                    var actor_id = parseInt(target.shift());
                    if( !Number.isNaN(actor_id) && actor_id > 0 ){
                        nicknames.forEach( function(nn){
                            $gameActors.actor(actor_id).addPerk( nn , target.length ? target[0] : '' );
                        });    
                    }
                    break;
                case 'unlock':
                    var target = args[1].split(':');
                    var nicknames = args.slice( 2 , args.length).join(' ').split(',');
                    var actor_id = parseInt(target.shift());
                    if( !Number.isNaN(actor_id) && actor_id > 0 ){
                        var locked = nicknames.filter( perk => !$gameActors.actor(actor_id).hasPerk(perk));
                        if( locked.length ){
                            $gameActors.actor(actor_id).addPerk( locked[0] , target.length ? target[0] : '' );
                        }
                    }
                    break;
                case 'remove':
                    var actor_id = parseInt(args[1]);
                    var nicknames = args.slice( 2 , args.length).join(' ').split(',');
                    if( !Number.isNaN(actor_id) && actor_id > 0 ){
                        nicknames.forEach( function(nn){
                            $gameActors.actor(actor_id).dropPerk( nn );
                        });    
                    }
                    break;
                case 'reset':
                    //reset short and last names (do it after loading a saved game)
                    if( args.length > 1 ){
                        var tags = args.length > 2 ? args.slice(2, args.length) : [];
                        if( args[1] === 'all'){
                            $gameActors._data.filter( actor => actor !== null ).forEach( function( actor ){
                                actor.resetPerks(tags.length > 0 ? tags[0] : '');
                            });
                        }
                        else{
                            var actor_id = parseInt(args[1]);
                            if( !isNaN(actor_id) ){
                                $gameActors.actor(actor_id).resetPerks(tags.length > 0 ? tags[0] : '' );
                            }    
                        }
                    }
                    break;
                case 'upgrade':
                    KunPerks.Upgrade1();
                    break;
            }
        }
    }
}
/**
 * 
 */
function KunPerks_EscapeChars(){
    var _KunPerks_EscapeCharacters = Window_Base.prototype.convertEscapeCharacters;

    Window_Base.prototype.convertEscapeCharacters = function (text) {
        
        var parsed = _KunPerks_EscapeCharacters.call(this, text);

        if( KunPerks.processNickName() ){
            parsed = parsed.replace(/\x1bAN\[(.+)\]/gi, function () {
                return this.displayNickName( parseInt( arguments[1]));
            }.bind(this));        
        }

        //use this one to test new format \AT:TAG[ACTOR_ID]  || \AT[ACTOR_ID]
        parsed = parsed.replace(/\x1bAT(?::([A-Za-z]+))?\[(\d+)\]/g, function(match, tag = '', actor_id = 0) {
            //return `TAG=${tag || "(none)"}, NUM=${num}`;
            //console.log(match,tag,actor_id);
            return this.displayPerk( actor_id || 0 , tag && tag.toLowerCase() || '' );
        }.bind(this));

        //use this one to test new format \AT:TAG[ACTOR_ID]  || \AT[ACTOR_ID]
        parsed = parsed.replace(/\x1bAT2(?::([A-Za-z]+))?\[(\d+)\]/g, function(match, tag = '', value = 0) {
            //return `TAG=${tag || "(none)"}, NUM=${num}`;
            //console.log(match,tag,value);
            return this.displayPerks( value || 0 , 2 , tag && tag.toLowerCase()  || '' );
        }.bind(this));

        //use this one to test new format \AT:TAG[ACTOR_ID]  || \AT[ACTOR_ID]
        parsed = parsed.replace(/\x1bAT3(?::([A-Za-z]+))?\[(\d+)\]/g, function(match, tag = '', value = 0) {
            //return `TAG=${tag || "(none)"}, NUM=${num}`;
            //console.log(match,tag,value);
            return this.displayPerks( value || 0 , 3 , tag && tag.toLowerCase()  || '' );
        }.bind(this));

        return parsed;
    };
    /**
     * @param {Number} actor_id 
     * @returns {String}
     */
    Window_Base.prototype.displayNickName = function ( actor_id = 0 ) {
        return actor_id ? KunPerks.nickNameAsPerks() && this.displayPerk( actor_id ) || $gameActors.actor( actor_id ).nickname(  ) : '{INVALID_ACTOR_ID}';
    };
    /**
     * @param {Number} actor_id 
     * @param {String} tag 
     * @returns {String}
     */
    Window_Base.prototype.displayPerk = function ( actor_id = 0 , tag = '' ) {
        return actor_id && $gameActors.actor( actor_id ).perk( tag ) || '{INVALID_ACTOR_ID}';
    };
    /**
     * @param {Number} actor_id 
     * @param {Number} amount 
     * @param {String} tag 
     * @returns {String}
     */
    Window_Base.prototype.displayPerks = function ( actor_id = 0, amount = 1, tag  = '' ) {
        const titles = actor_id && $gameActors.actor( actor_id ).perks( true, tag ).slice() || [];
        if( titles.length > amount ){
            for(var idx = 0 ; idx < amount ; idx++ ){
                var swap = Math.floor(Math.random() * titles.length);
                if( idx !== swap ){
                    [titles[idx],titles[swap]] = [titles[swap],titles[idx]];
                }
            }    
        }
        return titles.length ? titles.slice(0, amount).join(', ') : this.displayNickName(actor_id);
    };
}

/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function ( /* args */) {

    KunPerks.Initialize();

    KunPerks_GameActor();
    KunPerks_PluginCommands();
    KunPerks_EscapeChars();

})( /* initializer */);

