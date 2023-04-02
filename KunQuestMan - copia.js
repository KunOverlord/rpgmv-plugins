//=============================================================================
// KunQuestMan.js
//=============================================================================
/*:
 * @plugindesc Kun's Quest Manager
 * @filename KunQuestMan.js
 * @version 1.5
 * @author KUN
 * 
 * @help
 * 
 * Quest State Checks (to use with Conditional Branches):
 * 
 *      quest_status( questID Or questID.stageID )
 *          - Returns Quest Status
 *      quest_active( questID Or questID.stageID )
 *          - Returns boolean if quest or quest stage is running
 *      quest_completed( questID Or questID.stageID )
 *          - Returns boolean if quest or quest stage is completed
 *      quest_ready( questID Or questID.stageID )
 *          - Returns true if quest is ready to start (hidden)
 *      quest_failed( questID Or questID.stageID )
 *          - Returns true if quest has been cancelled or failed
 * 
 *      Remember to use the quotes for all the non-numeric parameters ("myQuestId")
 * 
 * Quest State Functions:
 * 
 *      quest_start( myQuestID )
 *          - Starts a new quest
 *      quest_update( myQuestID Or myQuestID.myStageID )
 *          - Update and progress the quest or quest stage
 *      quest_complete( myQuestID Or myQuestID.myStageID )
 *          - Completes a quest or quest stage
 *      quest_cancel( myQuestID )
 *          - Cancels a quest
 *      quest_reset( myQuestID )
 *          - Set a quest to it's original state and ready to get started (nice for random radiant quests)
 * 
 *      Remember to use the quotes for all the non-numeric parameters ("myQuestId")
 * 
 * Commands:
 * 
 *      KunQuestMan start myQuestID
 *      KunQuestMan update myQuestID OR myQuestID.myStageID
 *      KunQuestMan complete myQuestID OR myQuestID.myStageID
 *      KunQuestMan cancel myQuestID
 *      KunQuestMan reset myQuestID
 *      KunQuestMan menu [enabled|disabled|hiden]
 *          - How to display in Player Menu
 *      KunQuestMan display|show
 *          - Open the QuestLog window
 *      KunQuestMan migrate quest_id|quest_stage_id new_id
 *          - Override and migrate quest and stage ids to new game updates when required.
 * 
 *      No quotation required here ;)
 * 
 * 
 * @param QuestLog
 * @text Quest Log
 * @desc Define here all the quests for your game :)
 * @type struct<Quest>[]
 * 
 * @param QuestCategories
 * @text Quest Category Formats
 * @desc Define a format for the quest categories
 * @type struct<Category>[]
 * @default []
 * 
 * @param QuestIcon
 * @parent QuestLog
 * @text Default Quest Icon
 * @desc Default icon used for quest openers
 * @type Number
 * @default 0
 * 
 * @param ActiveIcon
 * @parent QuestLog
 * @text Active Quest Icon
 * @desc Default icon used for Active quests
 * @type Number
 * @default 0
 * 
 * @param CompletedIcon
 * @parent QuestLog
 * @text Completed Quest Icon
 * @desc Default icon used for Completed quests
 * @type Number
 * @default 0
 * 
 * @param FailedIcon
 * @parent QuestLog
 * @text Failed Quest Icon
 * @desc Default icon used for Failed quests
 * @type Number
 * @default 0
 * 
 * @param QuestStartFX
 * @parent QuestLog
 * @text Quest Start FX
 * @desc Default Audio used for new Quests
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param QuestUpdateFX
 * @parent QuestLog
 * @text Quest Update FX
 * @desc Default Audio used for Updated quests
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param QuestCompleteFX
 * @parent QuestLog
 * @text Quest Complete FX
 * @desc Default Audio used for Completed quests
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param QuestFailFX
 * @parent QuestLog
 * @text Quest Fail FX
 * @desc Default Audio used for Failed quests
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param RewardText
 * @parent QuestLog
 * @text Reward Text
 * @desc Append this text to the reward messsage in the quest window
 * @type Text
 * 
 * @param CommandMenu
 * @text Display in Player Menu
 * @desc Select the questlog status in Command Menu
 * @type select
 * @option Enabled
 * @value enabled
 * @option Disabled
 * @value disabled
 * @option Hidden
 * @value hidden
 * @default active
 * 
 * @param CommandText
 * @parent CommandMenu
 * @text Command Menu Text
 * @desc Show this text in menu to topen the Quest Log
 * @type Text
 * @default Quests
 * 
 * @param onGetQuestItemEvent
 * @text Quest Item Event ID
 * @desc Select the custom event to run after getting an item which will hook all item based quests
 * @type common_event
 * @default 0
 * 
 * @param itemVarId
 * @parent onGetQuestItemEvent
 * @text Item Var ID
 * @desc Var ID used to capture the gained item
 * @type Variable
 * @min 0
 * @default 0
 * 
 * @param amountVarId
 * @parent onGetQuestItemEvent
 * @text Amount Var ID
 * @desc Var ID used to capture the item amount
 * @type Variable
 * @min 0
 * @default 0
 * 
 * @param debug
 * @text Debug Mode
 * @desc Show debug info and hidden quests
 * @type boolean
 * @on Enable
 * @off Disable
 * @default false
 */
/*~struct~Quest:
 * @param Key
 * @text Unique Quest Name
 * @type text
 * @desc Unique quest key (ie: mainquest01 )
 * 
 * @param Title
 * @type text
 * @default new quest
 * 
 * @param Details
 * @text Details
 * @type text
 *
 * @param Category
 * @desc Show this quest in different tabs
 * @type Text
 * @default Main
 * 
 * @param Behavior
 * @desc How this quest works
 * @type select
 * @option Default
 * @value default
 * @option Linear
 * @value linear
 * @option Optional
 * @value optional
 * @default default
 * 
 * @param Reward
 * @type text
 * 
 * @param Next
 * @text Next Quest Id
 * @type Text
 *
 * @param Icon
 * @type number
 * @default 0
 *
 * @param Stages
 * @type struct<Stage>[]
 */

/*~struct~Stage:
 * @param Key
 * @text Unique Stage Name
 * @type text
 * @desc Unique stage key within this quest (ie: getcoins01 )
 * 
 * @param Title
 * @type text
 * @default new stage
 *
 * @param Details
 * @type text
 * @desc Type in quest progress details here
 *
 * @param Objective
 * @desc Define the number of objectives to fulfill in this stage (ie: get 10 coins), default is 1.
 * @type number
 * @min 1
 * @max 999
 * @default 1
 */
/*~struct~Category:
 * @param category
 * @text Category
 * @type Text
 * @default Main
 *
 * @param color
 * @text Color
 * @type Number
 * @min 0
 * @max 32
 * @default 0
 *
 * @param icon
 * @text Icon
 * @type Number
 * @min 0
 * @default 0
 * 
 */



//var Imported = Imported || {};
//Imported.KunQuestMan = 1;

/**
 * @type {KUN}
 */
var KUN = KUN || {};
/**
 * @type {QuestManager}
 */
function QuestManager( ){

    var _manager = {
        /**
         * @type Quest[]
         */
        'quests':{},
        /**
         * @type Array
         */
        'categories':{},
        /**
         * @type Object
         */
        'menuCommand':{
            'visible': false,
            'enabled': false,
        },
        'menuStatus': 'enabled',
        'questItemEvendId': 0,
        'questItemVarId':0,
        'questItemAmountId':0,
        /**
         * @type Boolean
         */
        'debug': false,
        /**
         * @type Boolean
         */
        'muted':false,
        /**
         * Window render properties
         */
        'layoutSize': 4,
        /**
         * Icon setup
         */
        'icons':{
            'active':0,
            'completed':0,
            'failed':0,
            'default':0
        },
        /**
         * SFX Setup
         */
        'media':{
            'start':'',
            'update':'',
            'complete':'',
            'fail':''
        },
        /**
         * Text setup
         */
        'strings':{
            'command': 'Quests',
            'reward': ''
        }
    };
    /**
     * Setters
     */
    this.Set = {
        'Debug': ( debug ) => _manager.debug = debug,
        'String': ( text , type ) => {
            if( typeof text === 'string' && _manager.strings.hasOwnProperty( type ) ){
                _manager.strings[ type ] = text;
            }
        },
        'Icon': ( icon , type ) => {
            if( _manager.icons.hasOwnProperty( type ) ){
                _manager.icons[ type ] = parseInt( icon );
            }
        },
        'Media': ( media, type ) => {
            if( _manager.media.hasOwnProperty( type ) ){
                _manager.media[ type ] = media;
            }
        },
        'QuestItemEventId': ( event_id ) => _manager.questItemEvendId = parseInt( event_id ) || 0,
        'ItemVarId': ( item_id ) => _manager.questItemVarId = parseInt( item_id ),
        'AmountVarId': ( item_id ) => _manager.questItemAmountId = parseInt( item_id ),
        'MenuStatus': ( status ) => _manager.menuStatus = status || 'enabled',
    };
    /**
     * @type QuestManager.Icons
     */
     this.Icons = {
        'Active': () => _manager.icons.active,
        'Completed': () => _manager.icons.completed,
        'Failed': () => _manager.icons.failed,
        'Default': () => _manager.icons.default
    };
    /**
     * @param {Boolean} mute 
     * @returns QuestManager
     */
    this.mute = function( mute ){
        _manager.muted = typeof mute === 'boolean' && mute;
        return this;
    };
    /**
     * @returns Boolean
     */
    this.muted = () => _manager.muted;
    /**
     * @param {String} type 
     * @returns QuestManager
     */
    this.playMedia = function( type ){
        if(  !_manager.muted && _manager.media.hasOwnProperty( type ) && _manager.media[type].length ){
            //_manager.media[ type ] = media;
            AudioManager.playSe({name: _manager.media[type], pan: 0, pitch: 100, volume: 100});
        }
        return this;
    };
    /**
     * @param {Number} itemId
     * @param {Number} amount
     * @returns QuestManager
     */
     this.onGetQuestItem = function ( itemId , amount ) {
        if( _manager.questItemEvendId > 0 ){
            if( _manager.questItemVarId > 0 ){
                $gameVariables.setValue( _manager.questItemVarId , itemId || 0 );
                if( _manager.questItemAmountId > 0 ){
                    $gameVariables.setValue( _manager.questItemAmountId , amount || 0 );
                }
            }
            $gameTemp.reserveCommonEvent(_manager.questItemEvendId);
        }
        return this;
    };
    /**
     * @param {String} message
     * @returns QuestManager
     */
     this.notify = function( message ){

        if( !_manager.muted ){
            if( typeof kun_notify === 'function' ){
                kun_notify( message );
                //var icon = this.Icons.Default();
                //kun_notify( "\\I[" + icon + "] " +  message );
            }
            else if( _manager.debug ){
                console.log( message );
            }    
        }
        return this;
    };
    /**
     * @param {String} type
     * @param {String} missing (optional)
     * @returns string
     */
    this.string = ( type , missing ) => _manager.strings.hasOwnProperty( type ) ?
        _manager.strings[ type ] :
        typeof missing === 'string' ? missing : '';
    /**
     * @returns Number
     */
    this.layoutSize = () => _manager.layoutSize;
    /**
     * @returns Quest.Data
     */
    //this.db = () => new Quest.Data();
    this.db = () => $gameParty.QuestData();
    /**
     * @param {Boolean} activate 
     * @returns Boolean
     */
    this.debug = function( activate ){
        if( typeof activate === 'boolean' ){
            _manager.debug = activate;
        }
        return _manager.debug;
    };
    /**
     * @returns Object
     */
    this.dump = function(){
        var output = [];
        var quests = this.quests( true );
        for(var q in quests ){
            output.push( quests[ q ].dump( )  );
        }
        return output;
    };
    /**
     * 
     * @returns QuestManager
     */
    this.initQuestData = function(){
        var db = this.db().reset();
        this.quests( true ).forEach( function( quest ){
            db.reset( quest.key() );
            quest.stages( true ).forEach( function( stage ){
                db.reset( quest.key() , stage.key() );
            });
        });
        return this;
    };
    /**
     * @param {String} status 
     * @return {QuestManager}
     */
    this.setMenuStatus = function( status ){
        this.db().setParam( 'menu_status' , status || QuestManager.MenuStatus.Enabled );
        _manager.menuStatus = status || QuestManager.MenuStatus.Enabled;
        return this;
    };
    /**
     * 
     * @returns {Boolean}
     */
     this.menuStatus = function(){
        return this.db().param( 'menu_status' , _manager.menuStatus );
    }
    /**
     * 
     * @returns {Boolean}
     */
    this.isMenuEnabled = function(){
        return this.db().param( 'command_visible' , _manager.menuStatus ) === QuestManager.MenuStatus.Enabled;
    } 
    /**
     * 
     * @returns {Boolean}
     */
    this.isMenuVisible = function(){
        return this.db().param( 'command_visible' , _manager.menuStatus ) !== QuestManager.MenuStatus.Hidden;
    } 
    /**
     * 
     * @param {Object} categories 
     * @returns {QuestManager}
     */
    this.importCategories = function( categories ){
        var _self = this;
        //console.log( categories );
        categories.forEach( function( cat ){
            _self.setCategoryFormat( cat.category , cat.icon , cat.color );
        });
        //console.log( _manager.categories );
        return this;
    };
    /**
     * @param {String} category 
     * @returns {QuestManager}
     */
    this.addCategory = function( category ){
        if( !_manager.categories.hasOwnProperty( category )){
            _manager.categories[category] = {
                'icon':0,
                'color':0,
            };
        }
        return this;
    };
    /**
     * @param {String} category 
     * @returns object
     */
    this.getCategoryFormat = function( category ){
        return _manager.categories.hasOwnProperty( category )? 
                _manager.categories[category] :
                {'icon':0,'color':0};
    };
    /**
     * Define a set of category formats.
     * @param {String} category 
     * @param {Number} icon 
     * @param {Number} color 
     * @returns 
     */
    this.setCategoryFormat = function( category , icon , color ){
        var _categories = Object.keys( _manager.categories );
        //console.log( `${_categories} : ${category}` );
        if( _categories.includes( category ) ){
            _manager.categories[category].icon = parseInt(icon) || 0;
            _manager.categories[category].color = parseInt(color) || 0;
        }
        return this;
    };
    /**
     * @param {Object} data
     * @returns {QuestManager}
     */
    this.importQuests = function( data ){
        if( data.length ){
            var _self = this;
            data.forEach( function(q){
                var quest = new Quest(
                    q.Key,
                    q.Title,
                    q.Category,
                    q.Details,
                    q.Icon,
                    q.Behavior,
                    q.Reward
                );
                //attached extra parameters
                quest.setNextQuest( q.Next );
                //data[q].next
                q.Stages.forEach( function(s){
                    quest.add(
                        s.Key,
                        s.Title,
                        s.Details,
                        s.Objective
                    );
                });
                _self.add( quest ).addCategory( q.Category );
            });
            //QuestManager.DebugLog(this.quests(true).length + ' quests loaded!! :D' );
        }
        return this;
    };
    /**
     * @param {Boolean} list return as array
     * @returns Array|Object
     */
    this.categories = ( list ) => typeof list === 'boolean' && list ? Object.keys( _manager.categories ) : _manager.categories;
    /**
     * List all quests
     * @param {Boolean} list
     * @returns Quest[]
     */
    this.quests = function( list ){
        
        //return list||false ? Object.values( _manager.quests ) : _manager.quests;
        return list||false ? Object.keys( _manager.quests ).map( ( key ) => _manager.quests[key] ) : _manager.quests;

    };
    /**
     * @param {Number} status 
     * @param {String} category 
     * @returns Quest[]
     */
    this.filter = function( status , category ){
        //var output = [];

        if( typeof category === 'undefined'){
            category = false;
        }
        return this.quests( true ).filter( function( quest ){
            //return quest.status() === status;
            return quest.status() === status && ( !category || quest.category() === category );
        });
    };
    /**
     * @param {Quest} quest 
     * @returns QuestManager
     */
    this.add = function( quest ){
        if( quest instanceof Quest && !_manager.quests.hasOwnProperty(quest.key())){

            _manager.quests[ quest.key() ] = quest;
            
            //QuestManager.DebugLog( quest.title() + " added!!" );
        } 
        return this;
    };
    /**
     * @param {String} id
     * @returns Quest|Boolean
     */
    this.get = function( id ){
        if( typeof id === 'string' ){
            var key = id.split('.');
            if( this.quests().hasOwnProperty( key[0] ) ){
                return this.quests()[key[0]];
            }
        }
        return false;
    };

    return this;
}

QuestManager.MenuStatus = {
    'Enabled':'enabled',
    'Disabled':'disabled',
    'Hidden':'hidden',
};

QuestManager.Migrate = function( id , override ){
    //var db = new Quest.Data();
    //db.migrate( id , override );
    $gameParty.QuestManager().migrate( id , override );
};

/**
 * @type {QuestManager}
 */
//QuestManager.Instance = {};
/**
 * 
 */
QuestManager.Setup = function( parameters ){
    
    QuestManager.Instance = new QuestManager();
    
    QuestManager.Instance.Set.Debug( parameters['debug'] === 'true' );

    if( parseInt( parameters.onGetQuestItemEvent ) > 0 ){
        QuestManager.Instance.Set.QuestItemEventId( parameters.onGetQuestItemEvent );
        QuestManager.Instance.Set.ItemVarId( parameters.itemVarId );
        QuestManager.Instance.Set.AmountVarId( parameters.amountVarId );
        QuestManager.RegisterQuestItemEvent();
    }

    QuestManager.Instance.Set.Icon( parameters['QuestIcon'] , 'default' );
    QuestManager.Instance.Set.Icon( parameters['ActiveIcon'] , 'active' );
    QuestManager.Instance.Set.Icon( parameters['CompletedIcon'] , 'completed' );
    QuestManager.Instance.Set.Icon( parameters['FailedIcon'] , 'failed' );

    QuestManager.Instance.Set.Media( parameters['QuestStartFX'] , 'start');
    QuestManager.Instance.Set.Media( parameters['QuestUpdateFX'] , 'update');
    QuestManager.Instance.Set.Media( parameters['QuestCompleteFX'] , 'complete');
    QuestManager.Instance.Set.Media( parameters['QuestFailFX'] , 'fail');

    QuestManager.Instance.Set.String( parameters['CommandText'] , 'command' );
    QuestManager.Instance.Set.String( parameters['RewardText'] , 'reward' );
    QuestManager.Instance.Set.MenuStatus(parameters.CommandMenu);
    
    //QuestManager.Instance.debug( Boolean( parameters['debug'] ) );

    QuestManager.ParseQuestData(parameters.QuestLog).forEach( function( q ){
            var quest = new Quest(
                q.Key,
                q.Title,
                q.Category,
                q.Details,
                q.Icon,
                q.Behavior,
                q.Reward
            );
            //attached extra parameters
            quest.setNextQuest( q.Next );
            q.Stages.forEach( function(s){
                quest.add( s.Key, s.Title, s.Details, s.Objective );
            });
            QuestManager.Instance.add( quest ).addCategory( q.Category );
    });

    if( parameters.QuestCategories && parameters.QuestCategories.length ){
        QuestManager.Instance.importCategories( JSON.parse( parameters.QuestCategories ).map( (cat) => JSON.parse(cat) ) );
    }

    QuestManager.RegisterMenu();
    QuestManager.RegisterQuestData();

    Scene_Title.prototype.commandNewGame = function() {

        DataManager.setupNewGame();
        ///initialize the quest manager
        QuestManager.Instance.initQuestData();

        this._commandWindow.close();
        this.fadeOutAll();
        SceneManager.goto(Scene_Map);
    };
}
/**
 * List all categories
 * @returns Array
 */
QuestManager.Categories = ( ) => QuestManager.Instance.categories( true );
/**
 * List all quests (dump)
 * @param {Boolean} serialize 
 * @returns Quest[]|Object
 */
QuestManager.Quests = ( serialize ) => QuestManager.Instance.quests( serialize );
/**
 * Get a Quest
 * @param {String} id
 * @returns Quest|Boolean
 */
QuestManager.Quest = (id ) => QuestManager.Instance.get ( id );
/**
 * Filter quests
 * @param {Number} status
 * @param {String} category
 * @returns Quest[]|Object
 */
QuestManager.Filter = ( status , category ) => QuestManager.Instance.filter( status , category );
/**
 * @param {String} input 
 * @returns Object
 */
 QuestManager.ParseQuestData = function( input ){
    
    var questDB = [];
    //var quests = typeof input === "string" && input.length ? JSON.parse( input ) : [];

    //QuestManager.DebugLog( 'reading ' + quests.length + ' quests ...');
    (typeof input === "string" && input.length ? JSON.parse( input ) : [ ] ).map( quest => JSON.parse( quest ) ).forEach( function( quest ){
        //console.log( quest );
        var stages = [];
        //quest.Stages = [];
        quest.Icon = parseInt( quest.Icon );
        //var stages = quest.hasOwnProperty('Stages') && quest.Stages.length > 0 ? JSON.parse( quest.Stages ) : [];
        ( quest.hasOwnProperty('Stages') && quest.Stages.length > 0 ? JSON.parse( quest.Stages ) : [ ] ).map( stage => JSON.parse( stage ) ).forEach( function( stage ){
            stage.Objective = parseInt( stage.Objective );
            stages.push( stage );
        });
        quest.Stages = stages;
        questDB.push( quest );
    } );
    console.log(questDB );
    return questDB;
};

QuestManager.RegisterQuestData = function(){
    Game_Party.prototype.QuestData = function(){
        /**
         * @param {String} quest_id 
         * @param {String} stage_id 
         * @returns Boolean
         */
        this.has = function( quest_id , stage_id ){
            if( typeof quest_id === 'string' && quest_id.length > 0 && quest_id !== 'STATUS' ){
                if( this.data().hasOwnProperty( quest_id ) ){
                    return typeof stage_id === 'string' && stage_id.length > 0 ?
                        //return quest stage exists
                        this.data()[ quest_id ].hasOwnProperty( stage_id ) :
                        //return quest exists
                        true;
                }
            }
            else{
                //check if the full questdata engine is initialized
                //return Object.keys(this.data()).length > 0;
            }
            return false;
        };
        /**
         * Update quest and stage data
         * @param {String} quest_id 
         * @param {String} stage_id 
         * @param {Number} amount 
         * @returns Number
         */
        this.update = function( quest_id , stage_id , amount ){
            amount = typeof amount === 'number' && amount > 1 ? amount : 1;
            var value = this.get( quest_id , stage_id ) + amount;
            this.set( quest_id , stage_id , value );
            return value;
        };
        /**
         * @param {String} quest_id 
         * @param {String} stage_id 
         * @returns 
         */
        this.get = function( quest_id , stage_id ){
            if( typeof quest_id === 'string' ){
    
                if( typeof stage_id === 'string' ){
                    return this.has(quest_id,stage_id) ? this.data()[ quest_id ][ stage_id ] : 0;
                }
                else{
                    return this.has( quest_id ) ? this.data()[ quest_id ].STATUS : Quest.Status.Hidden;
                }
            }
            return Quest.Status.Hidden;
        };
        /**
         * @param {String} quest_id 
         * @param {String} stage_id 
         * @param {Number} amount 
         * @returns Game_Party.QuestData
         */
        this.set = function( quest_id , stage_id , amount ){
            if( typeof amount !== 'number' || amount < 1 ){
                amount = 0;
            }
            if( this.has( quest_id ) ){
                this.data()[ quest_id ][ stage_id ] = amount;
            }
            return this;
        };
        /**
         * @param {String} quest_id 
         * @returns Number
         */
        this.status = function( quest_id ){
            return this.has( quest_id ) ? this.data()[ quest_id ].STATUS : Quest.Status.Hidden;
        };
        /**
         * @param {String} quest_id 
         * @param {Number} status 
         * @returns 
         */
        this.setStatus = function( quest_id , status ){
            if( this.has( quest_id ) ){
                this.data()[ quest_id ].STATUS = status;
            }
            else{
                //Allow setup on the fly
                this.data()[ quest_id ] = {'STATUS':status};
            }
            return this.data()[ quest_id ].STATUS;
        };
        /**
         * @param {String} quest_id 
         * @returns GameParty.QuestData
         */
        this.reset = function( quest_id , stages ){
            this.data()[ quest_id ] = {'STATUS':Quest.Status.Hidden};
            if( Array.isArray( stages )) {
                for( var s in stages ){
                    this.set( quest_id , stages[s ] );
                }
            }
            return this;
        };
        /**
         * Compatibility
         * @param {String} quest_id
         * @returns GameParty.QuestData
         */
        this.register = function( quest_id ){
            return this.reset( quest_id );
        };
        /**
         * @param {String} quest_id 
         * @returns Array
         */
        this.list = function( quest_id ){
            return typeof quest_id === 'string' && this.has(quest_id) ?
                Object.keys( this.data()[ quest_id ] ).filter( key => key !== 'STATUS' ) :
                Object.keys( this.data() );
        };
        /**
         * @returns Object
         */
        this.data = function(){
            if( !this.hasOwnProperty( '_questData' ) ){ this._questData = {}; }
            return this._questData;
        };
        /**
         * @returns Object
         */
        this.parameters = function(){
            if(!$gameParty.hasOwnProperty('_questParams')) $gameParty._questParams = {};
            return $gameParty._questParams;
        };

        /**
         * @param {String} param 
         * @param {Boolean} value 
         * @returns 
         */
        this.param = function( param , value ){

            return this.parameters().hasOwnProperty( param ) ?
                Boolean( this.parameters()[ param ] ) :
                value;
        };
        /**
         * @param {String} param 
         * @param {Boolean} value 
         * @returns GameParty.QuestData
         */
        this.setParam = function( param , value ){
            this.parameters()[param] = value;
            return this;
        };
        /**
         * Change the quest identifiers wuen required by a game update or migration
         * @param {String} id 
         * @param {String} override 
         * @returns GameParty.QuestData
         */
        this.migrate = function( id , override ){
            if( typeof id !== 'string' || typeof override !== 'string' ){
                return this;
            }
            var key = id.split('.');
            if( this.has( id ) && override.length && !this.has( `${key[0]}.${override}` )){
                if( key.length > 1 ){
                    var data = this.data()[key[0]][key[1]];
                    this.data()[key[0]][override] = data;
                    delete this.data()[key[0]][key[1]];
                }
                else{
                    //quest override
                    var data = this.data()[key[0]];
                    this.data()[override] = data;
                    delete this.data()[key[0]];
                }    
            }
            return this;
        };    

        return this;
    };
};

QuestManager.RegisterQuestItemEvent = function(){
        var _kunQuestMan_GainItem = Game_Party.prototype.gainItem;
        Game_Party.prototype.gainItem = function (item, amount, includeEquip) {
            _kunQuestMan_GainItem.call(this, item, amount, includeEquip);
    
            if (item !== null && amount > 0) {
                //console.log( `${item.name}: ${amount}` );
                QuestManager.Instance.onGetQuestItem(item.id, amount);
            }
        }
};

/**
 * @param {Array} args 
 */
QuestManager.Command = function( args ){
    switch (args[0]) {
        case 'start':
            quest_start( args[1] );
            break;
        case 'update':
            var amount = 1;
            if( args.length > 2 ){
                if( args.length > 3 && args[3] === 'import') {
                    amount = $gameVariables.value( parseInt(args[2]) );
                }
                else{
                    amount = parseInt(args[2]);
                }
            }
            quest_update( args[1] , amount );
            break;
        case 'complete':
            quest_complete( args[1] );
            break;
        case 'fail':
        case 'cancel':
            quest_cancel( args[1] );
            break;
        case 'reset':
            quest_reset( args[1] );
            break;
        case 'restart':
            quest_restart( args[1] );
            break;
        case 'inventory':
            if( args.length > 1 ){
                quest_items( parseInt( args[1] ) );
            }
            break;
        case 'menu':
            QuestManager.ToggleMenu( args.length > 1 ? args[1] : QuestManager.MenuStatus.Enabled );
            break;
        case 'show':
        case 'display':
            QuestManager.Show( );
            break;
        case 'muted':
            QuestManager.Instance.mute(true);
            break;
        case 'notify':
            QuestManager.Instance.mute(false);
            break;
        case 'migrate':
            if( args.length > 2 ){
                QuestManager.Migrate( args[1] , args[2] );
            }
    }
};
/**
 * @param {String} mode 
 */
QuestManager.ToggleMenu = function( mode ){
    QuestManager.Instance.setMenuStatus( mode );
    QuestManager.Play('update');
};

/**
 * @param {*} message 
 */
QuestManager.DebugLog = ( message ) =>{
    if( QuestManager.Instance.debug() ){
        console.log( typeof message !== 'object' ? '[ KunQuestMan ] - ' + message  : message );
    }
};

/**
 * Debug output
 * @param {String} message 
 * @returns void
 */
QuestManager.Notify = ( message ) => QuestManager.Instance.notify( message );

/**
 * Play Sound FX
 * @param {String} type 
 * @returns void
 */
 QuestManager.Play = ( type ) => QuestManager.Instance.playMedia( type );

/**
 * Register quest Menu
 */
QuestManager.RegisterMenu = function(){

        var _self = this;
        var addMenuOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
        Window_MenuCommand.prototype.addOriginalCommands = function () {
            addMenuOriginalCommands.call(this);
            if( QuestManager.Instance.isMenuVisible( ) ){
                this.addCommand( QuestManager.Instance.string('command', 'Journal') , 'quest', QuestManager.Instance.isMenuEnabled( ) );
            }
        };
        var createCommandWindow = Scene_Menu.prototype.createCommandWindow;
        Scene_Menu.prototype.createCommandWindow = function () {
            createCommandWindow.call(this);
            if( QuestManager.Instance.isMenuEnabled( ) ){
                this._commandWindow.setHandler('quest', this.commandQuestLog.bind(this));
            }
        };
        Scene_Menu.prototype.commandQuestLog = function () {
            QuestManager.Show();
        };
};

QuestManager.ShowQuest = function( id ){
    //set here the pointers
    SceneManager.push(QuestLogScene);
};
QuestManager.Show = function () {

    SceneManager.push(QuestLogScene);
};
QuestManager.Close = function () {
    if (_QM.scene !== null && _QM.scene instanceof QuestLogScene) {
        _QM.scene.terminate();
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////
////    Quest Object
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 
 * @param {String} key 
 * @param {String} title 
 * @param {String} category 
 * @param {String} details
 * @param {Number} icon 
 * @param {String} behavior 
 * @param {String} reward
 * @returns Quest
 */
function Quest( key , title , category, details , icon , behavior , reward ){

    var _Q = {
        'key':key,
        'title':title,
        'details': details || '',
        'category':category,
        'icon':icon || 0,
        'behavior': behavior || Quest.Behavior.Default,
        'reward': reward || '',
        'stages': {},
        'next': '',
        'self': this,
    };
    /**
     * @returns Game_Party.QuestData
     */
    this.db = () => $gameParty.QuestData();
    //this.db = () => new Quest.Data();
    /**
     * @param {String} quest_id 
     * @returns Quest
     */
    this.setNextQuest = function( quest_id ){
        _Q.next = quest_id || '';
        return this;
    };
    /**
     * @returns Quest|Boolean
     */
    this.next = function( ){
        return ( _Q.next.length && this.db().has( _Q.next ) ) ?
            QuestManager.Instance.get( _Q.next ) :
            false;
    };
    /**
     * @returns Quest
     */
    this.checkNext = function(){
        var next = this.next();
        //start new quest if required
        if( next !== false ){
            QuestManager.DebugLog( 'Starting Next Quest [' + _Q.next + ']');
            next.start();
        }
        else{
            QuestManager.DebugLog( 'Invalid Next Quest [' + _Q.next + ']');
        }
        

        return this;
    }

    //public getters
    /**
     * @returns string
     */
     this.key = () => _Q.key;
     /**
      * @param Boolean display Icon + Title
      * @returns string
      */
     this.title = function( display ){
        return typeof display === 'boolean' && display ?
            '\\\I[' + this.icon() + '] ' + _Q.title:
            _Q.title;
     };
    /**
     * Backwards compatibility
     * @returns String
     */
     this.displayTitle = function(){
        return this.title( true );
         return '\\\I[' + this.icon() + '] ' + this.title();
     };
     /**
      * @returns string
      */
     this.category = () => _Q.category;
     /**
      * @returns string
      */
     this.reward = () => _Q.reward;
     /**
      * @returns number
      */
     this.status = function(){
         return this.db().status( this.key() );
     };
     /**
      * @returns Number
      */
     this.completed = function(){
        return this.status() === Quest.Status.Completed;
     };
     /**
      * @returns Number
      */
     this.active = function(){
        return this.status() === Quest.Status.Active;
     };
     /**
      * @returns Number
      */
     this.failed = function(){
        return this.status() === Quest.Status.Failed;
     };
     /**
      * @returns Number
      */
     this.hidden = function(){
        return this.status() === Quest.Status.Hidden;
     };
     /**
      * @returns String
      */
     this.displayStatus = function(){
         return Quest.Status.display( this.status( ) );
     };
     /**
      * @returns string
      */
     this.behavior = () => _Q.behavior;
     /**
      * @returns string
      */
     this.icon = () => _Q.icon ? _Q.icon :  QuestManager.Instance.Icons.Default();
     /**
      * @returns string
      */
     this.details = function(){

        var details = _Q.details.length > 0 ? _Q.details + "\n" : '';
 
         if( this.behavior() === Quest.Behavior.Linear ){
            var current = this.current();
            if( current !== false ){
               details += current.details();
            }
         }
         
         return details;
     };
     /**
      * @param Number wordLimit Words per line, 50 by default
      * @returns {Array}
      */
      this.displayDetail = function ( wordLimit ) {
        var output = [];
        this.details().split("\n").forEach(function ( line ) {
            line.split(' ').forEach(function (word) {
                if (output.length) {
                    if (output[output.length - 1].length + word.length + 1 < ( wordLimit || 50 ) ) {
                        //output[output.length - 1] += output[output.length - 1].length ? ' ' + word : word;
                        output[output.length - 1] += ' ' + word;
                    }
                    else {
                        output.push(word);
                    }
                }
                else {
                    output.push(word);
                }
            });
            //libe break
            output.push('');
        });

        return output;
     }
     /**
      * @param Boolean detailed
      * @returns Number
      */
    this.progress = function( detailed ){
        var objectives = 0
        var completed = 0;
        this.stages( true ).forEach( ( stage ) => {
            objectives += stage.objective();
            completed += stage.current();
        });
        return objectives > 0 ?  completed / objectives : 0;    
    };
    /**
     * @returns Number
     */
    this.remaining = function(){
        var _remaining = this.list().length - this.stages( true ).filter( stage => stage.completed() ).length;
        return _remaining < 0 ? 0 : _remaining;
    };
    /**
     * @param {Boolean} list 
     * @returns Array | Object
     */
    this.stages = function( list ){
        return list||false ? this.list().map( ( key ) => _Q.stages[key] ) : _Q.stages;
    };
    /**
     * @returns Array
     */
    this.list = () => Object.keys( _Q.stages) ;
    /**
     * @returns Number
     */
    this.countStages = function(){
        return this.list().length;
    };
    /**
     * @returns Array
     */
    this.visibleStages = function(){
        if( _Q.behavior === Quest.Behavior.Linear ){
            var list = this.list();
            var current = this.current();
            var _quest = this;
            if( current !== false && list.includes( current.stageId() )){
                //console.log( 'current: ' + current.stageId());
                //console.log(list);
                var index = list.indexOf( current.stageId() );
                var output = list.slice( 0, index < list.length ? index + 1 : index );
                //console.log( output );
                return output.map( stage_id => _quest.stage(stage_id) );
            }
            return [];
        }
        return this.stages(true);
    };
    /**
     * @param {String} stage_id 
     * @returns QuestStage
     */
    this.stage = function( stage_id ){
        return this.has( stage_id ) ? _Q.stages[ stage_id ] : false;
        return _Q.stages.hasOwnProperty(stage_id) ? _Q.stages[stage_id] : false;
    };
    /**
     * @param {String} stage_id 
     * @returns Boolean
     */
    this.has = function( stage_id ){
        return typeof stage_id === 'string' && stage_id.length && _Q.stages.hasOwnProperty( stage_id );
    };
    /**
     * Current quest stage if Linear behavior is enabled
     * @returns QuestStage|Boolean
     */
    this.current = function(){
        if( this.status() === Quest.Status.Active ){
            //if( this.behavior() === Quest.Behavior.Linear || this.behavior() === Quest.Behavior.Default ){
            var stages = this.stages();
            for( var s in stages ){
                if( stages[s].status() < Quest.Status.Completed ){
                    return stages[s];
                }
            }
        }
        return false;
    };
    /**
     * @param {String} key 
     * @param {String} title 
     * @param {String} details 
     * @param {Number} objective 
     * @returns Quest
     */
    this.add = function( key , title , details , objective ){

        if( !_Q.stages.hasOwnProperty(key) ){
            var S = new QuestStage( key , title , details || "", objective || 1 );
            //S.quest = this.key; //attach the quest owner identifier
            var _self = this;
            S.quest = function(){ return _Q.key; } //attach the quest owner identifier
            S.check = function(){ _self.check() } ; //attach the quest status checker
            _Q.stages[key] = S;
        }

        return this;
    };
    /**
     * @param {Number} status 
     * @returns Quest
     */
    this.set = function( status ){
        this.db().setStatus( this.key() , status );
        return this;
    };
    /**
     * @param {String} id
     * @returns Quest
     */
     this.reset = function(  ){
        this.db().reset( this.key() , this.list() );
        return this;
    };
    /**
     * @param {Number} status 
     * @returns Boolean
     */
     this.start = function(){
        if( this.status() < Quest.Status.Active ){
            this.set( Quest.Status.Active ).notify( this.displayTitle() + ' started.' ).playMedia('start');
        }
        return this.status() === Quest.Status.Active;
    };
    /**
     * 
     * @param {String} stage_id 
     * @param {Number} amount
     * @returns Number
     */
     this.update = function( stage_id , amount ){
        var status = this.status();
        if( status < Quest.Status.Completed ){
            switch( true ){
                case status < Quest.Status.Active:
                    this.set(Quest.Status.Active).notify( this.displayTitle() + ' started.').playMedia('start');
                    break;
                case this.behavior() === Quest.Behavior.Optional:
                case this.behavior() === Quest.Behavior.Default:
                        if( this.has( stage_id ) ){
                            this.stage( stage_id ).update( amount );
                            if( this.status() < Quest.Status.Completed ){
                                this.notify( this.displayTitle() + ' updated.' ).playMedia('update');
                            }
                        } 
                        break;
                case this.behavior() === Quest.Behavior.Default:
                case this.behavior() === Quest.Behavior.Linear:
                    //linear quests just show current stage and advance one by one
                    var stage = this.current();
                    if( stage !== false ){
                        stage.update( amount );
                        if( this.status() < Quest.Status.Completed ){
                            this.notify( this.displayTitle() + ' updated.' ).playMedia('update');
                        }
                    }
                    break;
                default:
                    console.log(`${this.key()} : ${this.behavior()} not updated`);
                    break;
            }
        }

        return this.check();
    };
    /**
     * @returns Number
     */
    this.check = function(){
        //var status = _Q.self.status();
        var status = this.status();
        if( status === Quest.Status.Hidden ){
            //_Q.self.start();
            this.start();
        }
        else if( this.behavior() !== Quest.Behavior.Optional && status === Quest.Status.Active ){
            if( this.remaining() === 0 ){
                this.complete();
            }
        }
        ///return _Q.self.status();
        return this.status();
    };
    /**
     * @param {String} stage_id (stage)
     * @returns Quest
     */
     this.complete = function( stage_id ){
        if( this.status() < Quest.Status.Completed ){
            if( this.has( stage_id ) ){
                if( this.stage( stage_id ).complete() === Quest.Status.Completed ){
                    if( this.remaining()  > 0 ){
                        this.notify( this.displayTitle() + ' updated.' ).playMedia('update');
                    }
                    else{
                        this.notify( this.displayTitle() + ' completed.' ).playMedia('complete').checkNext();
                    }
                    return true;
                }
            }
            else{
                this.set( Quest.Status.Completed );
                this.notify( this.displayTitle() + ' completed.' ).playMedia('complete').checkNext();
            }
        }
        return this.status() === Quest.Status.Completed;
     };
    /**
     * @param {Number} status 
     * @returns Quest
     */
     this.cancel = function(){
        if( this.status() < Quest.Status.Completed ){
            this.set( Quest.Status.Failed ).notify( this.displayTitle() + ' failed.' ).playMedia('fail');
        }
        return this.status() === Quest.Status.Failed;
     };

     /**
     * @returns Object
     */
      this.dump = function(){

        var output = {
            'key': _Q.key,
            'title': _Q.title,
            'category': _Q.category,
            'icon': _Q.icon,
            'behavior': _Q.behavior,
            'status': this.status(),
            'stages': []
        };

        this.stages( true ).map( ( s ) => output.stages.push( s.dump() ) );
        
        return output;
    };
    /**
     * @param {String} media 
     * @returns Quest
     */
    this.playMedia = function( media ){
        QuestManager.Instance.playMedia( media );
        return this;
    };
    /**
     * @param {String} message 
     * @returns Quest
     */
    this.notify = function( message ){
        QuestManager.Instance.notify( message );
        return this;
    };
    
    return this;
}

Quest.INVALID = 'INVALID';

Quest.Status = {
    'Invalid':0,
    'Hidden':1,
    'Active':2,
    'Completed':3,
    'Failed':4
};
Quest.Status.display = function( status ){
    switch( status  ){
        case this.Hidden: return 'Hidden';
        case this.Active: return 'Active';
        case this.Completed: return 'Completed';
        case this.Failed: return 'Failed';
        default: return 'Invalid';
    }
};

Quest.Behavior = {
    'Default': 'default',
    'Linear':'linear',
    'Optional':'optional',
};

Quest.Category = {
    'Main':'main',
    'Secondary':'secondary',
    'Jobs':'jobs'
};

/**
 * @param string key
 * @param string title
 * @param string details
 * @param number objective
 * @returns QuestStage
 */
function QuestStage( key , title, details, objective ){
    
    var _S = {
        'key':key,
        'title':title,
        'details':details,
        'objective':objective
        //'self':this
    };
    /**
     * @returns Quest.Data
     */
    //this.db = () => new Quest.Data();
    this.db = () => $gameParty.QuestData();
    /**
     * @returns Object
     */
    this.dump = function(){
        return {
            'key': _S.key,
            'title': _S.title,
            'details': _S.details,
            'objective': _S.objective,
            'status': this.current()
        };
    };
    /**
     * @returns String
     */
    this.quest = () => Quest.INVALID;
    /**
     * @returns  Boolean
     */
    this.check = function(){};
    /**
     * @param {Boolean} fullName show as QuestName.StageName (true) or only as StageName (false:default)
     * @returns String
     */
    this.key = function( fullName ){ return typeof fullName === 'boolean' && fullName ? this.quest() + '.' + _S.key : _S.key ; };
    /**
     * @returns String
     */
    this.stageId = () => _S.key;
    /**
     * @returns String
     */
    this.title = () => _S.title;
    /**
     * @returns String
     */
    this.details = () => _S.details;
    /**
     * @returns String
     */
    this.objective = () => _S.objective;
    /**
     * @returns Number
     */
    this.current = function( ){ return this.db().status( this.quest() , this.key( ) ); };
    /**
     * Complete this stage if still in progress
     * @returns Number
     */
    this.complete = function(){
        if( this.status() < Quest.Status.Completed ){
            this.db().set( this.quest() , this.key() , this.objective() );
        }
        //call the parent quest check method
        //this.check();
        return this.status();
    };
    /**
     * Make an increment over the stage's status
     * @param {Number} amount
     * @returns Number
     */
    this.update = function( amount ){
        if( this.status() < Quest.Status.Completed ){
            if( this.current() + amount < this.objective() ){
                this.db().update( this.quest() , this.key( ) , amount );    
            }
            else{
                this.db().set( this.quest() , this.key( ) , this.objective() );    
            }
        }
        this.check();
        return this.status();
    };
    /**
     * @returns Float
     */
    this.progress = function(){
        return this.current() / parseFloat(this.objective());
    };
    /**
     * @returns Number
     */
    this.status = function(){
        return this.current() < this.objective() ?
            Quest.Status.Active :
            Quest.Status.Completed;
    }
    /**
     * @returns Boolean
     */
    this.completed = function(){
        return this.status() === Quest.Status.Completed;
    };
    /**
     * @returns QuestStage
     */
    this.reset = function(){
        //console.log( this.key());
        this.db().set( this.quest(), this.key( ) , 0 );
        return this;
    };

    return this;
};



///////////////////////////////////////////////////////////////////////////////////////////////////
////    Functions
///////////////////////////////////////////////////////////////////////////////////////////////////



/**
 * @param {String} quest_id 
 * @returns Number
 */
function quest_status( quest_id ){
    var quest = QuestManager.Instance.get( quest_id );
    if( quest !== false ){
        return quest.status();
    }
    
    QuestManager.DebugLog( 'Invalid quest ID ' + quest_id );

    return Quest.Status.Invalid;
}
/**
 * Obsolete function support
 * @param {String} quest_id 
 * @returns Boolean
 */
function quest_running( quest_id){ return quest_active( quest_id ); }
/**
 * @param {String} quest_id
 * @returns Boolean
 */
function quest_active( quest_id ){
    var id_data = quest_id.split('.');
    if( id_data.length > 1 ){
        //stages
        var quest = QuestManager.Instance.get( id_data[0] );
        if( quest !== false && quest.active()){
            if( quest.behavior() === Quest.Behavior.Optional ){
                var stage = quest.stage(id_data[1]);
                return stage !== false && !stage.completed();
            }
            else{
                var stage =  quest.current();
                return stage !== false && stage.stageId() === id_data[1];    
            }
        }
        else{
            QuestManager.DebugLog( 'Invalid quest ID ' + id_data[0] );
        }
    }

    return quest_status( id_data[0] ) === Quest.Status.Active;
}
/**
 * @param {String} id 
 * @returns Boolean
 */
 function quest_completed( id ){
    var id_data = id.split('.');
    if( id_data.length > 1 ){
        //stages
        var quest = QuestManager.Instance.get( id_data[0] );
        if( quest !== false ){
            var stage =  quest.stage(id_data[1]);
            return stage !== false && stage.completed();
        }
        else{
            QuestManager.DebugLog( 'Invalid quest ID ' + id_data[0] );
        }
    }
    return quest_status( id_data[0] ) === Quest.Status.Completed;
}
/**
 * @param {String} id 
 * @returns Boolean
 */
 function quest_ready( id ){
    return quest_status( id ) === Quest.Status.Hidden;
}
/**
 * @param {String} id 
 * @returns Boolean
 */
 function quest_failed( id ){
    return quest_status( id ) === Quest.Status.Failed;
}
/**
 * Start a quest
 * @param {String} quest_id 
 * @returns Boolean
 */
 function quest_start( quest_id ){
    var quest = QuestManager.Instance.get( quest_id );
    if( quest !== false ){
        return quest.start();
    }
    else{
        QuestManager.DebugLog( 'Invalid quest ID ' + quest_id );
    }
    return false;
}
/**
 * @param {String} id 
 * @returns Boolean
 */
function quest_update( id , amount ){
    var key = id.split('.');
    //console.log(`${id}: ${amount || 1}`);
    var quest = QuestManager.Instance.get( key[0] );
    if( quest !== false ){
        return key.length > 1 ?
            //default quests
            quest.update( key[1] , amount ) :
            //linear quests
            quest.update( '' , amount );
    }

    //QuestManager.DebugLog( 'Invalid quest ID ' + id );

    return false;
}
/**
 * Complete a quest or quest stage
 * @param {String} id Quest or Quest.Stage ID
 * @returns 
 */
function quest_complete( id ){
    
    var key = id.split('.');
    var quest = QuestManager.Instance.get( key[0] );
    if( quest !== false ){
        return  key.length > 1 ? 
            quest.complete( key[1] ) :
            quest.complete();
    }
    
    //QuestManager.DebugLog( 'Invalid quest ID ' + id );

    return false;
}
/**
 * Cancel a quest
 * @param {String} id 
 */
function quest_cancel( id ){
    var quest = QuestManager.Instance.get( id );
    if( quest !== false ){
        quest.cancel( id );
    }
    else{
        //QuestManager.DebugLog( 'Invalid quest ID ' + id );
    }
}
/**
 * Reset a quest/Stage
 * @param {String} quest_id 
 * @returns Boolean
 */
function quest_reset( quest_id ){

    var quest = QuestManager.Instance.get( quest_id );
    if( quest !== false ){
        quest.reset();
        return true;
    }
    
    //QuestManager.DebugLog( 'Invalid quest ID ' + id );

    return false;
}

/**
 * Restart a quest/Stage
 * @param {String} id 
 * @returns Boolean
 */
function quest_restart( id ){ return quest_reset( id ) ? quest_start( id ) : false; }
/**
 * check the inventory for quest items by item_id
 * @param {Number} item_id 
 * @returns Boolean
 */
function quest_items( item_id ){
    var items = $gameParty.items().filter(function( item ){
        return item.id === item_id;
    });

    if( items.length ){
        var amount = $gameParty.numItems( items[0] );
        QuestManager.Instance.onGetQuestItem( item_id , amount );
        return amount > 0;
    }
    return false;
}

/**
 * Replacer to the former JayaK Quest Log plugin
 * 
 */
var Quests = {
    'start':function( quest_id, reset ){
        return typeof reset === 'boolean' && reset ? quest_reset( quest_id ) : quest_start( quest_id );
     },
    'complete':function( quest_id, stage_id ){
        return typeof stage_id === 'string' ? quest_complete( quest_id +'.'+ stage_id ) : quest_complete( quest_id );
    },
    'cancel':function( quest_id ){ return quest_cancel( quest_id ); },
    'fail':function( quest_id ){ return quest_cancel( quest_id ); },
    'reset':function( quest_id ){ return quest_reset( quest_id ); },
    'update':function( quest_id , stage_id , value ){
         return typeof stage_id === 'string' ? quest_update( quest_id +'.'+ stage_id ) : quest_update( quest_id );
     },
     'cancelled': function( quest_id){ return quest_failed( quest_id ); },
     'failed': function( quest_id){ return quest_failed( quest_id ); },
     'running': function( quest_id){ return quest_active( quest_id ); },
     'completed': function( quest_id, stage_id ){
        return typeof stage_id === 'string' ? quest_completed( quest_id +'.'+ stage_id ) : quest_completed( quest_id );
    },
    'hidden': function( quest_id ){ return quest_ready( quest_id ); }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
////    QuestLogScene : Scene_ItemBase
///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @QuestLogScene
 */
QuestLogScene = function () {

    this.initialize.apply(this, arguments);

}
QuestLogScene.prototype = Object.create(Scene_ItemBase.prototype);
QuestLogScene.prototype.constructor = QuestLogScene;
QuestLogScene.prototype.initialize = function () {
    Scene_ItemBase.prototype.initialize.call(this);
};
QuestLogScene.LayoutSize = 4;
QuestLogScene.prototype.create = function () {
    Scene_ItemBase.prototype.create.call(this);
    this.setupStatusWindow();
    this.setupCategoryWindow();
    this.setupQuestWindow();
    this.setupDetailWindow();
};
QuestLogScene.prototype.setupCategoryWindow = function(){
    this._categoryWindow = new QuestCatWindow( this._statusWindow.height );
    this.addWindow(this._categoryWindow);
};
QuestLogScene.prototype.setupStatusWindow = function () {
    this._statusWindow = new QuestStatusWindow( );
    this._statusWindow.setHandler('cancel', this.onQuitQuestLog.bind(this));
	this._statusWindow.setHandler('ok',   this.onSelectCategory.bind(this));
    this.addWindow(this._statusWindow);
    this._statusWindow.activate();
};
QuestLogScene.prototype.setupQuestWindow = function () {

    var y = this._statusWindow.y + this._statusWindow.height;

    this._questsWindow = new QuestLogWindow( y );
    this._statusWindow.setQuestsWindow(this._questsWindow);
    this._categoryWindow.setQuestsWindow(this._questsWindow);
    this.addWindow(this._questsWindow);
    this._questsWindow.activate();
    this._questsWindow.reload();
};
QuestLogScene.prototype.setupDetailWindow = function () {
    this._detailWindow = new QuestDetailWindow( this._questsWindow.y );
    this._questsWindow.setHelpWindow(this._detailWindow);
    this.addWindow(this._detailWindow);
    this._detailWindow.refresh();
};
QuestLogScene.prototype.onSelectCategory = function () {
    if( this._categoryWindow ){
        this._categoryWindow.nextCategory();
        if( this._statusWindow ){
            this._statusWindow.activate();
            this._statusWindow.refresh(  );
        }
        if( this._questsWindow ){
            this._questsWindow.activate();   
            this._questsWindow.reload();   
        }
    }
}
QuestLogScene.prototype.onQuitQuestLog = function () {
    this._questsWindow.deselect();
    //this._statusWindow.activate();
    this.popScene();
};

///////////////////////////////////////////////////////////////////////////////////////////////////
////    QuestCatWindow : Window_Base
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @QuestCatWindow
 */
function QuestCatWindow() { this.initialize.apply(this, arguments); };
QuestCatWindow.prototype = Object.create(Window_Base.prototype);
QuestCatWindow.prototype.constructor = QuestCatWindow;
QuestCatWindow.prototype.initialize = function ( height ) {
    Window_Base.prototype.initialize.call(this , 0 , 0 , this.windowWidth( ) , height );
    this.category = '';
    this.color = 0;
    this.icon = 0;
    this.refresh();
};
QuestCatWindow.prototype.getCategory = function(){
    return this.category;
};
QuestCatWindow.prototype.standardFontSize = function () { return 20; };
/**
 * @returns ARray
 */
QuestCatWindow.prototype.categories = () => QuestManager.Categories();

QuestCatWindow.prototype.nextCategory = function(){
    var _categories = [''].concat( this.categories( ) );
    var _current = _categories.indexOf(this.category);
    if( _current > -1){
        if( _current < _categories.length -1 ){
            _current++;
        }
        else{
            _current = 0;
        }
        this.category = _categories[_current];
    }
    else{
        this.category = '';
    }
    this.refresh();
};
QuestCatWindow.prototype.windowWidth = function () {
    return parseInt(Graphics.boxWidth / QuestLogScene.LayoutSize);
};

QuestCatWindow.prototype.renderCategory = function( ){
    var format = QuestManager.Instance.getCategoryFormat( this.category );
    var text = this.category ? this.category : 'All';
    if( format.color > 0 ){
        this.changeTextColor(this.textColor(format.color));
    }
    if( format.icon > 0 ){
        var base_line = Math.max((28 - this.standardFontSize()) / 2, 0);
        this.drawIcon( format.icon , 0 , base_line );
    }
    this.drawText( text , 0 , 0 , this.contentsWidth() , 'center' );
    this.changeTextColor(this.normalColor());
}
QuestCatWindow.prototype.refresh = function(  ){

    this.contents.clear();

    this.renderCategory( this.getCategory() );

    if (this._questsWindow  ) {
        this._questsWindow.setCategory( this.getCategory());
    }
};
QuestCatWindow.prototype.setQuestsWindow = function ( questWindow ) {
    this._questsWindow = questWindow;
    //this.refresh();
};
///////////////////////////////////////////////////////////////////////////////////////////////////
////    QuestStatusWindow : Window_HorzCommand
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @QuestStatusWindow
 */
function QuestStatusWindow() { this.initialize.apply(this, arguments); };
QuestStatusWindow.prototype = Object.create(Window_HorzCommand.prototype);
QuestStatusWindow.prototype.constructor = QuestStatusWindow;
QuestStatusWindow.prototype.initialize = function () {
    Window_HorzCommand.prototype.initialize.call(this, this.windowX(), 0);
};
QuestStatusWindow.prototype.windowX = function(){
    return parseInt(Graphics.boxWidth / QuestLogScene.LayoutSize );
};
QuestStatusWindow.prototype.windowWidth = function () {
    return this.windowX() * (QuestLogScene.LayoutSize-1);
};
QuestStatusWindow.prototype.maxCols = function () {
    return this.maxItems();
};
QuestStatusWindow.prototype.standardFontSize = function () { return 20; };

QuestStatusWindow.prototype.update = function () {
    Window_HorzCommand.prototype.update.call(this);
    if (this._questsWindow  ) {
        this._questsWindow.setStatus( this.getStatus());
    }
};
QuestStatusWindow.prototype.getStatus = function( ){
    switch( this.currentSymbol() ){
        case 'hidden': return 1;
        case 'active': return 2;
        case 'completed': return 3;
        case 'failed': return 4;
        default: return 0;
    }
};
QuestStatusWindow.prototype.makeCommandList = function () {
    //register all visual statuses
    if( QuestManager.Instance.debug() ){
        this.addCommand('Hidden','hidden');
    }
    this.addCommand('Active','active');
    this.addCommand('Completed','completed');
    this.addCommand('Failed','failed');
    return;
};
QuestStatusWindow.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    var align = this.itemTextAlign();
    if( this.commandSymbol(index) === 'hidden' ){
        this.changeTextColor(this.systemColor());
    }
    else{
        this.resetTextColor();
    }
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
    this.resetTextColor();
};
QuestStatusWindow.prototype.setQuestsWindow = function ( questWindow ) {
    this._questsWindow = questWindow;
    //this._questsWindow.refresh();
    //this.update();
};

///////////////////////////////////////////////////////////////////////////////////////////////////
////    QuestLogWindow : Window_Selectable
///////////////////////////////////////////////////////////////////////////////////////////////////

function QuestLogWindow() {
    this.initialize.apply(this, arguments);
}
QuestLogWindow.prototype = Object.create(Window_Selectable.prototype);
QuestLogWindow.prototype.constructor = QuestLogWindow;
QuestLogWindow.prototype.initialize = function ( y ) {
    Window_Selectable.prototype.initialize.call(this, 0, y , this.windowWidth() , this.windowHeight( y ) );
    this.questStatus = Quest.Status.Active; //active status
    this.questCat = ''; //filter none
    //this.questLog = [];
    this.importItems();
};
QuestLogWindow.prototype.importItems = function(){
    this.questLog = QuestManager.Filter(  this.questStatus , this.questCat.length ? this.questCat : false ).map( (quest) => quest.key() );
}
QuestLogWindow.prototype.setCategory = function( category ){
    category = typeof category === 'string' ? category : '';
    if( this.questCat !== category ){
        this.questCat = category;
        this.reload();    
    }
};
QuestLogWindow.prototype.setStatus = function( status ){
    status = typeof status === 'number' ? status : Quest.Status.Active;
    if( this.questStatus !== status ){
        this.questStatus = status;
        this.reload();    
    }
};
/**
 * @returns Number
 */
QuestLogWindow.prototype.getStatus = function(  ){
    return this.questStatus;
}


QuestLogWindow.prototype.windowWidth = function(){
    return Graphics.boxWidth / QuestLogScene.LayoutSize;
};
QuestLogWindow.prototype.windowHeight = function( y ){
    return Graphics.boxHeight - y;
};
QuestLogWindow.prototype.maxCols = function () { return 1; };
QuestLogWindow.prototype.maxItems = function () { return this.questLog ? this.questLog.length : 0; };
QuestLogWindow.prototype.spacing = function () { return 32; };
QuestLogWindow.prototype.standardFontSize = function(){ return 20; };

/**
 * @returns {String}
 */
QuestLogWindow.prototype.getItemId = function (idx) {
    idx = typeof idx === 'number' ? idx : this.index();
    return idx >= 0 && idx < this.questLog.length ? this.questLog[idx] : Quest.INVALID;
};
QuestLogWindow.prototype.getQuest = function (idx) {
    var quest_id = this.getItemId(idx);
    return quest_id !== Quest.INVALID ? QuestManager.Instance.get( quest_id ) : null;
};
/**
 * @description Render Item in the list by its list order
 */
QuestLogWindow.prototype.drawItem = function (index) {
    var quest = this.getQuest( index );
    if (quest !== null ) {
        var rect = this.itemRect(index);
        var title_break = quest.title().split(' - ');
        if( this.questStatus < Quest.Status.Active ){
            this.changeTextColor(this.systemColor());
        }
        //this.drawTextEx( title_break[ 0 ] , rect.x , rect.y, rect.width);
        this.drawText( title_break[ 0 ] , rect.x , rect.y, rect.width , 'left' );
        this.resetTextColor();
    }
};
QuestLogWindow.prototype.setHelpWindow = function(helpWindow) {
    Window_Selectable.prototype.setHelpWindow.call( this , helpWindow );
    this.setHelpWindowItem( this.getItemId());
}
QuestLogWindow.prototype.updateHelp = function() {
    this.setHelpWindowItem(this.getItemId());
};
QuestLogWindow.prototype.setHelpWindowItem = function(item) {
    if (this._helpWindow) {
        this._helpWindow.setItem(item);
        this._helpWindow.refresh();
    }
};
QuestLogWindow.prototype.reload = function () {
    this.importItems();
    Window_Selectable.prototype.refresh.call(this);
    this.drawAllItems();
    this.resetScroll();
    this.select(this.questLog.length > 0 ? 0 : -1);
    //this.setHelpWindowItem( this.getItemId());
};

///////////////////////////////////////////////////////////////////////////////////////////////////
////    QuestDetailWindow : Window_Base
///////////////////////////////////////////////////////////////////////////////////////////////////
QuestDetailWindow = function () { this.initialize.apply(this, arguments); }
QuestDetailWindow.prototype = Object.create(Window_Base.prototype);
QuestDetailWindow.prototype.constructor = QuestDetailWindow;
QuestDetailWindow.prototype.initialize = function ( y ) {
    Window_Base.prototype.initialize.call(this, this.windowX(), y, this.windowWidth( ), this.windowHeight( y ) );
    this.quest_id = '';
    this.questData = null;
    this.refresh();
};
QuestDetailWindow.prototype.windowX = function(){
    return Graphics.boxWidth / QuestLogScene.LayoutSize;
};
QuestDetailWindow.prototype.windowWidth = function(){
    return this.windowX() * (QuestLogScene.LayoutSize-1);
};
QuestDetailWindow.prototype.windowHeight = function( y ){
    return Graphics.boxHeight - y;
};
QuestDetailWindow.prototype.clear = function () {
    //this.setItem();
};
QuestDetailWindow.prototype.setItem = function (quest_id) {
    this.questData = QuestManager.Quest( quest_id );
    this.refresh();
};
QuestDetailWindow.prototype.refresh = function () {
    this.contents.clear();
    if (this.questData && this.questData.key() !== Quest.INVALID) {
        this.renderQuestDetail(this.questData);
    }
    else {
        this.renderEmptyQuest();
    }
};
QuestDetailWindow.prototype.drawHorzLine = function (y) {
    this.contents.paintOpacity = 48;
    this.contents.fillRect(0,
        y + this.lineHeight() / 2 - 1,
        this.contentsWidth(), 2,
        this.normalColor());
    this.contents.paintOpacity = 255;
};
QuestDetailWindow.prototype.standardFontSize = function () { return 20; };
QuestDetailWindow.prototype.lineHeight = function () { return 30; };
QuestDetailWindow.prototype.completedItemOpacity = function() { this.contents.paintOpacity = 192; };
QuestDetailWindow.prototype.debugItemOpacity = function() { this.contents.paintOpacity = 128; };
/**
 * @param {Quest} quest
 */
QuestDetailWindow.prototype.renderQuestDetail = function (quest) {

    //pass  through anonymous
    var _renderer = this;

    this.changeTextColor(this.normalColor());
    // quest heading

    var line_height = this.lineHeight();
    var base_line = Math.max((28 - this.standardFontSize()) / 2, 0);
    var width = this.contentsWidth();
    var height = this.contentsHeight();
    var icon = quest.icon();
    //TITLE
    if( icon ){
        this.drawTextEx(quest.title(), 40, base_line, width );
        this.drawIcon( quest.icon() , 0 , base_line);
    }
    else{
        this.drawTextEx(quest.title(), 0, base_line, width );
    }

    this.changeTextColor(this.textColor(23));
    //CATEGORY
    this.drawText(quest.category(), 40, base_line, width - 40 , 'right');
    this.changeTextColor(this.textColor(24));
    var line = Math.max(32, this.lineHeight());
    this.drawHorzLine(line);

    //var y = line + line_height;
    var y = line;

    //split text in lines
    quest.displayDetail( 50 ).forEach( function( line ){
        y += line_height;
        _renderer.drawTextEx( line , 0, y , width );
    });

    this.drawHorzLine(line);

    //RENDER STAGES
    var behavior = quest.behavior();
    var _debugHidden = false;
    var _debug = QuestManager.Instance.debug();
    var _stages = _debug || quest.status() > Quest.Status.Active ? quest.stages(true) : quest.visibleStages( );
    y = height - (line_height * 2) - (line_height + 8) * _stages.length;
    _stages.forEach( function( stage ) {

        var progress = stage.current();
        var objective = stage.objective();

        var text = objective > 1 ? stage.title() + ' ( ' + progress + ' / ' + objective + ' )' : stage.title();
        
        if( _debugHidden ){
            _renderer.debugItemOpacity( );
        }
        else if( progress < objective ){
            _renderer.drawIcon( QuestManager.Instance.Icons.Active() , 0 , y + 4);
            _renderer.changeTextColor(_renderer.normalColor());
        }
        else{
            _renderer.drawIcon( QuestManager.Instance.Icons.Completed() , 0, y + 4);
            _renderer.completedItemOpacity( );
        }
        _renderer.drawText( text, 35, base_line + y );
        //_renderer.drawTextEx( text, 35, y , width - 35 );
        _renderer.changeTextColor(_renderer.normalColor());
        _renderer.changePaintOpacity( true );

        y += line_height + 8;

        if( _debug && !_debugHidden && behavior === Quest.Behavior.Linear && progress < objective ){
            _debugHidden = true;
        }
    });

    this.drawGauge( 0, height - line_height * 2 , width, quest.progress(), this.textColor(4), this.textColor(6));

    // REWARD
    if( quest.reward().length ){
        if( quest.status() < Quest.Status.Completed ){
            _renderer.changeTextColor(_renderer.textColor(8));
        }
        var rewardTag = QuestManager.Instance.string('reward','');
        this.drawTextEx( rewardTag.length > 0 ?
            rewardTag + ': ' + quest.reward() :
            quest.reward() , 0, height - line_height, width);
    }

    // STATUS
    switch( quest.status() ){
        case Quest.Status.Active:
            this.changeTextColor(this.textColor(6));
            break;
        case Quest.Status.Completed:
            this.changeTextColor(this.textColor(24));
            break;
        case Quest.Status.Failed:
            this.changeTextColor(this.textColor(2));
            break;
    }
    this.drawText(quest.displayStatus(), 0, height - line_height, width, 'right' );
    this.changeTextColor(this.normalColor());
};
/**
 * @description Empty quest window
 */
QuestDetailWindow.prototype.renderEmptyQuest = function () {

    var y = this.contentsHeight() / 3 - this.standardFontSize() / 2 - this.standardPadding();

    this.drawText("-- Empty log --", 10, y, this.contentsWidth(), 'center' );
    
    this.changeTextColor(this.textColor(8));
    this.drawText("Select a quest category with Left and Right", 0, y + 40, this.contentsWidth(), 'center');
    this.drawText("Select a quest with Up and Down", 0, y + 80, this.contentsWidth(), 'center');
    this.drawText("Switch the quest status filter with Action", 0, y + 120, this.contentsWidth(), 'center');
    this.changeTextColor(this.normalColor(8));
};





(function( Q ){
    //override vanilla
    var _KunQuestMan_Interpreter_Command = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _KunQuestMan_Interpreter_Command.call(this, command, args);
        if( command === 'KunQuestMan' || command === 'QuestLog' ){
            //override with plugin command manager
            QuestManager.Command( args );
        }
    };

    var parameters = PluginManager.parameters('KunQuestMan');
    QuestManager.Setup( parameters );

})( /* autorun */ );

