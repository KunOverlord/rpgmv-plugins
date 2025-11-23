//=============================================================================
// KunQuests.js
//=============================================================================
/*:
 * @plugindesc Kun's Quest Manager
 * @filename KunQuests.js
 * @version 0.01
 * @author KUN
 * 
 * @help
 * 
 * Hierarchical quest log
 * 
 * @param quests
 * @text Quests
 * @desc Throw in all your quests here ;)
 * @type struct<Quest>[]
 * 
 * @param iconDefault
 * @parent quests
 * @text Default Quest Icon
 * @desc Default icon used for quest openers
 * @type Number
 * @default 0
 * 
 * @param iconActive
 * @parent quests
 * @text Active Quest Icon
 * @desc Default icon used for Active quests
 * @type Number
 * @default 0
 * 
 * @param iconCompleted
 * @parent quests
 * @text Completed Quest Icon
 * @desc Default icon used for Completed quests
 * @type Number
 * @default 0
 * 
 * @param iconFailed
 * @parent quests
 * @text Failed Quest Icon
 * @desc Default icon used for Failed quests
 * @type Number
 * @default 0
 * 
 * @param soundStart
 * @parent quests
 * @text Quest Start FX
 * @desc Default Audio used for new Quests
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param soundUpdate
 * @parent quests
 * @text Quest Update FX
 * @desc Default Audio used for Updated quests
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param soundComplete
 * @parent quests
 * @text Quest Complete FX
 * @desc Default Audio used for Completed quests
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param soundFail
 * @parent quests
 * @text Quest Fail FX
 * @desc Default Audio used for Failed quests
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * 
 * @param charLength
 * @parent quests
 * @text Detail's length
 * @desc Define the line length of the quest and stage details.
 * @type number
 * @default 50
 * 
 * @param display
 * @parent CommandText
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
 * @param onQuestItem
 * @text Quest Item Event ID
 * @desc Select the custom event to run after getting an item which will hook all item based quests
 * @type common_event
 * @default 0
 * 
 * @param questItemId
 * @parent onQuestItem
 * @text Item Var ID
 * @desc Var ID used to capture the gained item
 * @type Variable
 * @min 0
 * @default 0
 * 
 * @param questAmountId
 * @parent onQuestItem
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
 * 
 */
/*~struct~Quest:
 * @param name
 * @text Name
 * @text Unique Quest Name
 * @type text
 * @desc Unique quest key (ie: mainquest01 )
 * 
 * @param title
 * @text Title
 * @type text
 * @default new quest
 * 
 * @param detail
 * @text Quest Detail
 * @desc Add here the quest description
 * @type note
 * 
 * @param objectives
 * @text Quest Objectives
 * @desc how many times to update this quest to complete?
 * @type number
 * @min 1
 * @max 500
 * @default 1
 *
 * @param behaviour
 * @text Behaviour
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
 * @param reward
 * @text Reward
 * @type text
 * 
 * @param location
 * @text Location
 * @type text[]
 * @desc Describe the quest location in game
 * 
 * @param next
 * @text Next Quest
 * @type text
 *
 * @param icon
 * @text Icon
 * @type number
 * @min 0
 * @default 0
 *
 * @param stages
 * @text Sub-Quests (Stages)
 * @desc Define gere all quest stages
 * @type struct<Quest>[]
 */


$gameQuests = null;


/**
 * 
 */
function KunQuests(){
    throw new Error('This is a static class');
}
/**
 * @returns {String[]}
 */
KunQuests.commands = function(){
    return ['KunQuests','QuestLog','QuestMan'];
}
/**
 * 
 */
KunQuests.initialize = function(){
    
    const parameters = PluginManager.parameters('KunQuests');
    
    this._quests = [];
};



/**
 * @type {KunQuests.MenuStatus}
 */
KunQuests.MenuStatus = {
    'Enabled': 'enabled',
    'Disabled': 'disabled',
    'Hidden': 'hidden',
};

/**
 * @type {Quest}
 */
class Quest{
    /**
     * 
     * @param {String} name 
     * @param {String} title 
     * @param {String} detail 
     * @param {String} behaviour 
     * @param {Number} objectives 
     * @param {String} next 
     * @param {Number} icon 
     * @param {String[]} location 
     */
    constructor( name = 'newquest01', title = 'New Quest' , detail = '', behaviour = 'default', objectives = 1, next = '' , icon = 0 , location = []){
        this._name = name;
        this._title = title;
        this._detail = detail;
        this._behaviour = behaviour || Quest.Behaviour.Default;
        this._next = next || '';
        this._icon = icon || 0;
        this._location = location || [];
        this._objectives = 1;
        
        /**
         * @type {Quest[]}
         */
        this._stages = [];

        this._status = Quest.Status.Hidden;
        this._parent = null;

        this._data = new QuestData(this.path(true)); 
    }
    /**
     * @returns {QuestData}
     */
    data(){
        return this._data;
    }
    /**
     * @returns {String}
     */
    name(){
        return this._name;
    }
    /**
     * @returns {String}
     */
    title(){
        return this._title;
    }
    /**
     * @returns {String}
     */
    detail(){
        return this._detail;
    }
    /**
     * @returns {String}
     */
    behaviour(){
        return this._behaviour;
    }
    /**
     * @returns {String}
     */
    next(){
        return this._next;
    }
    /**
     * @returns {Number}
     */
    icon(){
        return this._icon;
    }
    /**
     * @param {Boolean} asText
     * @returns {String[]|String}
     */
    location( asText = false ){
        return asText ? this._location.join(', ') : this._location;
    }
    /**
     * @returns {Number}
     */
    status(){
        return this.data().status();
    }
    /**
     * @param {Boolean} totalObjectives
     * @returns {Number}
     */
    objectives( totalObjectives = false ){
        return totalObjectives ? this._objectives : this.data().counter();
    }
    /**
     * @returns {Number}
     */
    progress( ){
        return this.objectives() / this.objectives(true);
    }
    /**
     * @param {Number} status 
     * @returns {Boolean}
     */
    change( status = Quest.Status.Hidden ){
        return this.data().change(status);
    }
    /**
     * @param {Number} points 
     * @returns {Quest}
     */
    update( points = 1 ){
        if( this.active()){
            this.data().update(points,this.objectives(true));
            return this.checkout();    
        }
        return this;
    }
    /**
     * @returns {Quest}
     */
    checkout( ){
        if( this.progress() < 1 ){
            //send update notification
            const progress = this.objectives(true) > 1 ? ` (${this.objectives()} / ${this.objectives(true)})` : '';
            this.notify( 'updated' + progress ).playSound('update');
        }
        else if( this.change(Quest.Status.Completed) ){
            //send completed notification
            this.notify( 'completed' ).playSound('complete');
        }

        return this;
    }
    /**
     * @param {String} message 
     * @returns {Quest}
     */
    notify( message = '' ){
        if( typeof kun_notify === 'function'){
            const icon = this.icon() ? `\\I[${this.icon()}]` : '';
            kun_notify( `${icon}${this.title()} ${message}` );
        }
        return this;
    }
    /**
     * @param {String} se 
     * @returns {Quest}
     */
    playSound( se = 'update' ){
        // play media here
        return this;
    }


    /**
     * @returns {Quest}
     */
    parent(){
        return this._parent;
    }
    /**
     * @returns {Boolean}
     */
    hasParent(){
        return this.parent() !== null;
    }
    /**
     * @param {Quest} quest 
     * @returns {Quest}
     */
    setParent( quest = null ){
        if( quest instanceof Quest && this._parent === null ){
            this._parent = quest;
        }
        return this;
    }
    /**
     * @param {Boolean} asText
     * @returns {String[]}
     */
    path( asText = false){
        const list =  this.hasParent() ? this.parent().path() : [];
        list.push(this.name());
        return asText ? list.join('.') : list;
    }




    /**
     * @param {Boolean} active 
     * @returns {Quest[]}
     */
    stages( active = false ){
        return active ? this._stages.filter( quest => quest.active() ) : this._stages;
    }
    /**
     * @returns {Boolean}
     */
    ready(){
        return this.status() === Quest.Status.Hidden;
    }
    /**
     * @returns {Boolean}
     */
    hidden(){
        return this.ready();
    }
    /**
     * @returns {Boolean}
     */
    active(){
        return this.status() === Quest.Status.Active;
    }
    /**
     * @returns {Boolean}
     */
    completed(){
        return this.status() === Quest.Status.Completed;
    }
    /**
     * @returns {Boolean}
     */
    failed(){
        return this.status() === Quest.Status.Failed;
    }
}
/**
 * @type {Quest.Status}
 */
Quest.Status = {
    'Hidden': 0,
    'Active': 1,
    'Completed': 2,
    'Failed': 3,
};
/**
 * @type {Quest.Behaviour}
 */
Quest.Behaviour = {
    'Default': 'default',
    'Linear': 'linear',
    'Optional': 'optional',
};


/**
 * @type {QuestData}
 */
class QuestData{
    /**
     * @param {String} name
     * @returns {QuestData}
     */
    constructor(name){
        this._name = name;
        return this.reset();
    }
    /**
     * @returns {Object}
     */
    data(){
        return $gameQuests || {};
    }
    /**
     * @returns {QuestData}
     */
    reset(){
        if( $gameQuests === null ){
            $gameQuests = {};
        }
        this.data()[this.name()] = {
                'status': Quest.Status.Hidden,
                'counter': 0,
        };    
        return this;
    }    
    /**
     * @returns {String}
     */
    name(){
        return this._name;
    }
    /**
     * @returns {Boolean}
     */
    ready( ){
        return this.data().hasOwnProperty( this.name() );
    }
    /**
     * @returns {Number}
     */
    status(){
        return this.ready() && this.data()[this.name()].status || 0;
    }
    /**
     * @returns {Number}
     */
    counter(){
        return this.ready() && this.data()[this.name()].counter || 0;
    }
    /**
     * @param {Number} points 
     * @returns {QuestData}
     */
    set( points = 0){
        if( this.ready()){
            this.data()[this.name()].counter = points;
        }
        return this;
    }
    /**
     * @param {Number} points 
     * @param {Number} limit 
     * @returns {Number}
     */
    update( points = 1 , limit = 1){
        if( this.counter() + points < limit ){
            this.set( this.counter() + points );
        }
        else{
            this.set( limit );
        }
        return this.counter();
    }
    /**
     * @param {Number} status 
     * @returns {Boolean}
     */
    change( status = Quest.Status.Hidden){
        if( this.ready() && this.status() !== status){
            this.data()[this.name()].status = status;
            return true;
        }
        return false;
    }
}




/**
 * Hook the commands
 */
function KunQuests_RegisterCommands() {
    //override vanilla
    const _KunQuests_GameInerpreter_PluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunQuests_GameInerpreter_PluginCommand.call(this, command, args);
        if (KunQuests.commands().includes(command)) {
            //if (command === 'KunQuests' || command === 'QuestLog') {
            //override with plugin command manager
            switch (args[0]) {
                case 'start':
                    break;
                case 'restart':
                    break;
                case 'reset':
                    break;
                case 'update':
                    break;
                case 'complete':
                    break;
                case 'fail': //backwards compatibility
                case 'cancel':
                    break;
                case 'check':
                    break;
                case 'active':
                    break;
                case 'remaining':
                    break;
                case 'inventory':
                    break;
                case 'menu':
                    break;
                case 'show':
                case 'display':
                    break;
                case 'muted':
                case 'silent':
                    break;
                case 'notify':
                    break;
            }
        }
    };
};


///////////////////////////////////////////////////////////////////////////////////////////////////
////    KunQuestScene : Scene_ItemBase
///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @KunQuestScene
 */
KunQuestScene = function () {

    this.initialize.apply(this, arguments);

}
KunQuestScene.prototype = Object.create(Scene_ItemBase.prototype);
KunQuestScene.prototype.constructor = KunQuestScene;
KunQuestScene.prototype.initialize = function () {
    Scene_ItemBase.prototype.initialize.call(this);
};
/**
 * Set the acative quest here to open
 */
KunQuestScene.LayoutSize = 4;
KunQuestScene.prototype.create = function () {
    
    Scene_ItemBase.prototype.create.call(this);

};


(function () {

    QuestManager_registerMenu();
    QuestManager_RegisterQuestData();
    QuestManager_registerCommands();
    QuestManager_registerEscapeCharacters();
    QuestManager_registerNewGame();

})( /* autorun */);

