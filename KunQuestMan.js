//=============================================================================
// KunQuestMan.js
//=============================================================================
/*:
 * @plugindesc Kun's Quest Manager
 * @filename KunQuestMan.js
 * @version 1.96
 * @author KUN
 * 
 * @help
 * 
 * Create a full quest log, with different types of quest behaviors and customizable display!
 * 
 * You may categorize your quests and navigate through them all in the QuestLog menu option. Use the DebugMode ON to track and list all the hidden quests and stages to run.
 * 
 * Each quest can handle several stages, and each stage can handle a counter to provide an accurate progress. Define a chained set of quests, by adding the Next Quest's name.
 * 
 * Quest Type/Behaviors:
 * 
 *   Create Default quests, to track and control the progress of all stages. On after finishing all stages, the quest will be marked as completed automatically.
 *   Example: An assestment list.
 * 
 *   Create Linear quests to display only the active stages and focus on the current task. Upon you clear all the stages, the quest will be marked as completed.
 *   Example: A main quest, you can only watch your progress as you complete the required tasks.
 * 
 *   Create Optional quests to provide full control on the in-game plugin commands and script functions. You need to complete the quest manually, even if all the stages are clear.
 *   Example: A sidequest task master who requires to evaluate which stages have you completed and which ones can be omitted.
 * 
 * Display the questLog in a command menu, define a range of sounds and icons to display on each quest update, integrate the notification messages with the KunNotifier Plugin
 * 
 * Quest State Conditions (to use with Conditional Branches):
 * 
 *      quest_status( quest , [ stage ] )
 *          - Returns Quest or the QuestStage Status
 *      quest_active( quest , [ stage ] )
 *          - Returns boolean if quest or quest stage is running
 *      quest_completed( quest , [ stage ] )
 *          - Returns boolean if quest or quest stage is completed
 *      quest_ready( quest )
 *          - Returns true if quest is ready to start (hidden)
 *      quest_failed( quest )
 *          - Returns true if quest has been cancelled or failed
 *      quest_stage( quest , stage )
 *          - Returns the current value of this quest stage
 *      quest_check( quest | quest.stage , status )
 *          - Returns true or false if the quest or quest stage meets the defined conditions in the status tag
 *          - Check status: hidden|ready, active|running,completed,failed|cancelled
 * 
 *      Remember to use the quotes for all the non-numeric parameters ("myQuestId")
 * 
 * Quest State Functions:
 * 
 *      quest_start( quest )
 *          - Starts a new quest
 *      quest_update( quest , [stage|false] , [ progress ] )
 *          - Update and progress the quest or quest stage
 *      quest_remaining( quest )
 *          - Counts the amount of stages left to complete
 *      quest_complete( quest , [stage] )
 *          - Completes a quest or quest stage
 *      quest_complete_all( quest )
 *          - Totally completes a quest and all its stages
 *      quest_cancel( qust )
 *          - Cancels a quest
 *      quest_reset( quest )
 *          - Set a quest to it's original state and ready to get started (nice for random radiant quests)
 * 
 *      Remember to use the quotes for all the non-numeric parameters ("myQuestId")
 * 
 * Commands:
 * 
 *      KunQuestMan start quest [restart]
 *          - Start quest
 *          - Restart this quest if required (will reset this quest)
 *      KunQuestMan restart quest
 *          - Restarts a quest  (backwards compatibility)
 *      KunQuestMan update quest [ stage ] [ amount ( default is 1 )]
 *          - Updates a quest or a quest stage
 *          - Define the update amount if required to fill the stage objectives
 *      KunQuestMan complete quest [stage]
 *          - Complete a quest and/ or quest stage
 *      KunQuestMan completeAll quest
 *          - Totally completes a quest and all its stages
 *      KunQuestMan cancel quest
 *          - Cancels a running quest
 *      KunQuestMan fail quest
 *          - Cancels a running quest (backwards compatibility)
 *      KunQuestMan reset quest
 *          - Resets a quest as ready to be started again (random cycling quests)
 *      KunQuestMan remaining quest gameVar
 *          - Exports a selected quest's remaining stages to complete into a gameVar variable
 *      KunQuestMan check [quest|quest.stage] [status] [switchId]
 *          - Export to switchId if the required status is met with the quest or quest stage
 *          - Type status as: ready|hidden, active|running, completed, failed|cancelled
 *      KunQuestMan menu [enabled|disabled|hiden]
 *          - How to display in Player Menu
 *      KunQuestMan display|show
 *          - Open the QuestLog window
 *      KunQuestMan MigrateQuestData
 *          - Migrate all quests to the new format
 *      KunQuestMan muted
 *          - Mute any quest update
 *      KunQuestMan notify
 *          - Activate the sound effect on each quest update
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
 * @type text
 * 
 * @param detailChars
 * @parent QuestLog
 * @text Detail's length
 * @desc Define the line length of the quest and stage details.
 * @type number
 * @default 50
 * 
 * @param CommandText
 * @text Command Menu Text
 * @desc Show this text in menu to topen the Quest Log
 * @type text
 * @default Quests
 * 
 * @param CommandMenu
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
 * 
 * @param compatibility
 * @text Backwards Compatibility
 * @desc Enables former commands used in Amirian Curse
 * @type Boolean
 * @default false
 * 
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
 * @desc Add here the quest description
 * @type note
 *
 * @param Category
 * @desc Show this quest in different tabs
 * @type text
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
 * @type text
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
 * @type note
 * @desc Type in quest progress details here
 *
 * @param Objective
 * @desc Define the number of objectives to fulfill in this stage (ie: get 10 coins), default is 1.
 * @type number
 * @min 1
 * @max 999
 * @default 1
 * 
 * @param varId
 * @text Variable Id
 * @type variable
 * @desc Update this Game Variable when this stage is completed
 * @default 0
 * 
 * @param varValue
 * @parent varId
 * @text Update Value
 * @type number
 * @min 1
 * @desc Define an amount to update this game variable
 * @default 1
 * 
 * @param varMethod
 * @parent varId
 * @text Update Method
 * @desc Define the update behaviour for this game variable
 * @type select
 * @option Set value
 * @value set
 * @option Add value
 * @value add
 * @option Substract value
 * @value sub
 * @default set
 */
/*~struct~Category:
 * @param category
 * @text Category
 * @type text
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

function QuestMan() { throw new Error('This is a static class'); };
/**
 * Initialize all quest stuff
 * hooked in the game initializer
 * @return QuestMan
 */
QuestMan.setup = function () { return this.initMembers().createPartyQuestData(); };
/**
 * @returns QuestMan
 */
QuestMan.createPartyQuestData = function(){
    $gameParty.createQuestData();
    return this;
};
/**
 * Translation interface
 * @param {String} text_id 
 * @param {String} content 
 * @returns String
 */
QuestMan.Translate = function (text_id, content) {
    return typeof KunQuestLocale === 'function' ? KunQuestLocale.Translate(text_id, content) : content;
};
/**
 * @returns QuestMan
 */
QuestMan.initMembers = function () {

    var parameters = this.importParameters();
    //console.log( parameters);
    this._scene = null;
    this._selected = null;

    this._quests = {};
    this._categories = {};
    this._questItemEventId = parseInt(parameters.onGetQuestItemEvent);
    this._questItemVarId = parseInt(parameters.itemVarId);
    this._questItemAmountId = parseInt(parameters.amountVarId);
    this._detailsLength = parseInt(parameters.detailChars || 50);
    this._debug = parameters.debug === 'true';
    this._compatibility = parameters.compatibility === 'true';
    this._menuStatus = parameters.CommandMenu || QuestMan.MenuStatus.Enabled;
    this._muted = false;
    this._layoutSize = 4;
    this._icons = {
        'active': parseInt(parameters.ActiveIcon),
        'completed': parseInt(parameters.CompletedIcon),
        'failed': parseInt(parameters.FailedIcon),
        'default': parseInt(parameters.QuestIcon)
    };
    this._media = {
        'start': parameters.QuestStartFX || '',
        'update': parameters.QuestUpdateFX || '',
        'complete': parameters.QuestCompleteFX || '',
        'fail': parameters.QuestFailFX || '',
    };
    this._strings = {
        'command': parameters.CommandText || '',
        'reward': parameters.RewardText || '',
    };

    if (this._questItemEventId > 0) {
        QuestManager_registerQuestItemEvent();
    }

    this.importQuests(parameters.QuestLog.length > 0 ? JSON.parse(parameters.QuestLog) : []);
    this.importCategories(parameters.QuestCategories && parameters.QuestCategories.length ? JSON.parse(parameters.QuestCategories) : []);

    return this;
};
/**
 * @returns Number
 */
QuestMan.detailsLength = function () {
    return this._detailsLength;
};
/**
 * @returns String
 */
QuestMan.defaultMenuStatus = function(){
    return this._menuStatus;
};
/**
 * @param Boolean reset
 * @returns Object
 */
QuestMan.importSelected = function (reset) {

    if (this._selected.length > 0) {

        var quest = this.quest(this._selected);
        if (typeof reset === 'boolean' && reset) {
            this._selected = '';
        }
        return quest;
    }
    return null;
};
QuestMan.selectQuest = function (name) {
    this._selected = name || '';
};
/**
 * @returns Boolean
 */
QuestMan.debug = function () { return this._debug; };
/**
 * @returns Boolean
 */
QuestMan.compatibility = function () { return this._compatibility; };
/**
 * @returns Array
 */
QuestMan.commands = function () {
    return this.compatibility() ? ['KunQuestMan', 'QuestLog'] : ['KunQuestMan'];
};
/**
 * @returns Number
 */
QuestMan.layoutSize = function () { return this._layoutSize; };
/**
 * @param {Boolean} list 
 * @returns Array | Object
 */
QuestMan.quests = function (list) {
    return typeof list === 'boolean' && list ? Object.values(this._quests) : this._quests;
};
/**
 * @param {Number} status 
 * @param {String} category 
 * @returns Quest[]
 */
QuestMan.filter = function (status, category) {
    if (typeof category === 'undefined') {
        category = '';
    }
    return this.quests(true).filter(function (quest) {
        return quest.status() === status && (category.length === 0 || quest.category() === category);
    });
};
/**
 * @param {String} name
 * @returns Quest
 */
QuestMan.quest = function (name) {
    var key = typeof name === 'string' && name.length ? name.split('.') : [''];
    return this.has(key[0]) ? this.quests()[key[0]] : null;
};
/**
 * @param {String} name 
 * @returns Boolean
 */
QuestMan.has = function (name) {
    return this._quests.hasOwnProperty(name);
};
/**
 * @param {Quest} quest 
 * @returns QuestMan
 */
QuestMan.addQuest = function (quest) {
    if (quest instanceof Quest && !this.has(quest.name())) {
        this._quests[quest.name()] = quest;
    }
    return this;
};
/**
 * @param {Boolean} list 
 * @returns Array | Object
 */
QuestMan.categories = function (list) {
    return typeof list === 'boolean' && list ? Object.keys(this._categories) : this._categories;
};
/**
 * @param {String} category 
 * @param {Number} icon
 * @param {Number} color
 * @returns QuestMan
 */
QuestMan.addCategory = function (category, icon, color) {
    if (!this._categories.hasOwnProperty(category)) {
        this._categories[category] = {
            'icon': parseInt(icon) || 0,
            'color': parseInt(color) || 0,
        };
    }
    else {
        if (typeof icon === 'number' && icon) {
            this._categories[category].icon = icon;
        }
        if (typeof color === 'number' && color) {
            this._categories[category].color = color;
        }
    }
    return this;
};
/**
 * @param {Object} input 
 * @returns QuestMan
 */
QuestMan.importCategories = function (input) {
    (Array.isArray(input) ? input : []).filter(c => c.length > 0).map(c => JSON.parse(c)).forEach(function (c) {
        QuestMan.addCategory(
            QuestMan.Translate('category', c.category),
            parseInt(c.icon),
            parseInt(c.color));
    });
    return this;
};
/**
 * @param {String} category 
 * @returns Number
 */
QuestMan.getCategoryIcon = function (category) {
    return this._categories.hasOwnProperty(category) ? this._categories[category].icon : this.icon('default');
};
/**
 * @param {String} category 
 * @returns Number
 */
QuestMan.getCategoryColor = function (category) {
    return this._categories.hasOwnProperty(category) ? this._categories[category].color : 0;
};
/**
 * @param {Object} input 
 * @returns QuestMan
 */
QuestMan.importQuests = function (input) {

    (Array.isArray(input) ? input : []).filter(q => q.length > 0).map(q => JSON.parse(q)).forEach(function (q) {
        var quest = new Quest(
            q.Key,
            q.Title,
            q.Category,
            (q.Details || '').replace(/\\n/g, " ").replace(/\"/g, ""),
            parseInt(q.Icon),
            q.Behavior,
            q.Next || '',
            q.Reward.length > 0 ? QuestMan.Translate(q.Key + '.reward', q.Reward) : ''
        );
        var stages = (q.hasOwnProperty('Stages') && q.Stages.length > 0 ? JSON.parse(q.Stages) : []).filter(s => s.length > 0).map(s => JSON.parse(s));
        //var stages = quest.hasOwnProperty('Stages') && quest.Stages.length > 0 ? JSON.parse( quest.Stages ) : [];
        stages.forEach(function (stage) {
            quest.addStage(
                stage.Key,
                stage.Title || stage.Key,
                (stage.Details || '').replace(/\\n/g, " ").replace(/\"/g, ""),
                parseInt(stage.Objective),
                parseInt(stage.varId || 0),
                parseInt(stage.varValue || 1),
                stage.varMethod || QuestStage.VariableMethod.Add);
        });
        QuestMan.addQuest(quest).addCategory(quest.category());
    });
    return this;
};
/**
 * @returns Game_Party.QuestData
 */
QuestMan.data = function () { return $gameParty.QuestData() };
/**
 * @returns Boolean
 */
QuestMan.hasData = function(){
    return $gameParty.QuestData() instanceof Game_QuestData;
};
/**
 * @returns QuestMan
 */
QuestMan.initQuestData = function () {

    return this;
    var params = this.importParameters();
    this.setMenuStatus(params.CommandMenu);

    return this;
};
/**
 * @param {String} status 
 * @return {QuestMan}
 */
QuestMan.setMenuStatus = function (status) {
    if( this.hasData() ){
        this.data().setMenuStatus(status);
    }
    return this;
};
/**
 * @returns {Boolean}
 */
/*QuestMan.menuStatus = function () {
    return this.data().menuStatus();
}*/
/**
 * @returns {Boolean}
 */
QuestMan.isMenuEnabled = function () { return this.data().isMenuEnabled(); }
/**
 * @returns {Boolean}
 */
QuestMan.isMenuVisible = function () { return this.data().isMenuVisible(); }
/**
 * @returns Boolean
 */
QuestMan.isMuted = function () { return this._muted; };
/**
 * @param {String} media 
 * @returns String
 */
QuestMan.media = function (media) {
    return this._media.hasOwnProperty(media) ? this._media[media] : '';
};
/**
 * @param {String} media 
 * @returns Number
 */
QuestMan.icon = function (icon) {
    return this._icons.hasOwnProperty(icon) ? this._icons[icon] : 0;
};
/**
 * @param {String} string 
 * @returns String
 */
QuestMan.string = function (string) {
    return this._strings && this._strings.hasOwnProperty(string) ? this._strings[string] : string;
};
/**
 * @returns Object
 */
QuestMan.dump = function () {
    var output = {};
    Object.keys(this).filter(key => key.match(/^[\_]+/)).forEach(function (key) {
        output[key] = this[key];
    });
    return output;
};
/**
 * 
 * @param {String} param 
 * @param {String|Number|Boolean|Object} value 
 * @returns QuestMan
 */
QuestMan.set = function (param, value) {
    if (this.hasOwnProperty(`_${param}`)) {
        this[`_${param}`] = value;
    }
    return this;
};
/**
 * @returns Object
 */
QuestMan.importParameters = function () {
    return PluginManager.parameters('KunQuestMan');
};


/**
 * @param {String} type 
 * @returns QuestMan
 */
QuestMan.playMedia = function (type) {
    if (!this.isMuted()) {
        var media = this.media(type);
        AudioManager.playSe({ name: media, pan: 0, pitch: 100, volume: 100 });
    }
    return this;
};
/**
 * @param {Number} itemId
 * @param {Number} amount
 * @returns QuestMan
 */
QuestMan.onGetQuestItem = function (itemId, amount) {
    if (this._questItemEventId) {
        if (this._questItemVarId) {
            $gameVariables.setValue(this._questItemVarId, itemId || 0);
            if (this._questItemAmountId) {
                $gameVariables.setValue(this._questItemAmountId, amount || 0);
            }
        }
        $gameTemp.reserveCommonEvent(this._questItemEventId);
    }
    return this;
};
/**
 * @param {String} message
 * @returns QuestMan
 */
QuestMan.notify = function (message) {

    if (!this._muted) {
        if (typeof kun_notify === 'function') {
            kun_notify(message);
        }
        else if (this.debug()) {
            console.log(message);
        }
    }
    return this;
};
/**
 * @param {Boolean} mute 
 * @returns QuestMan
 */
QuestMan.mute = function (mute) {
    this._muted = typeof mute === 'boolean' && mute;
    return this;
};
/**
 * @param {String} quest_id 
 * @returns QuestMan
 */
QuestMan.Show = function (name) {

    //set the default quest to open
    QuestMan.selectQuest(name);

    SceneManager.push(QuestLogScene);

    return this;
};
/**
 * @returns QuestMan
 */
QuestMan.Close = function () {
    if (this._scene !== null && this._scene instanceof QuestLogScene) {
        this._scene.terminate();
        this._scene = null;
    }
    return this;
};
/**
 * @param {name} id 
 * @param {Boolean} override 
 * 
 * @returns QuestMan
 */
QuestMan.Migrate = function () {
    $gameParty.migrateQuestData();
    return this;
};

/**
 * @param {String} mode 
 * @returns QuestMan
 */
QuestMan.ToggleMenu = function (mode) {
    return this.setMenuStatus(mode).playMedia('update');
};

/**
 * @param {String} message 
 */
QuestMan.DebugLog = function (message) {
    if (this.debug()) {
        console.log(typeof message !== 'object' ? '[ KunQuestMan ] - ' + message : message);
    }
};


/**
 * @type QuestMan.MenuStatus
 */
QuestMan.MenuStatus = {
    'Enabled': 'enabled',
    'Disabled': 'disabled',
    'Hidden': 'hidden',
};
/**
 * @param {String} name 
 * @returns String
 */
QuestMan.ParseName = function( name ){
    //return typeof name === 'string' && name.length ? name.toUpperCase() : '';
    return typeof name === 'string' && name.length ? name.toLowerCase() : '';
    //return typeof name === 'string' && name.length ? name : '';
};
/**
 * 
 */
function Game_QuestData() {
    this.initialize.apply(this, arguments);
}
/**
 * 
 */
Game_QuestData.prototype.initialize = function () {

    this._data = {};
    this._menu = QuestMan.defaultMenuStatus();
};
/**
 * Game Quest Data (saveable)
 * @returns Object
 */
Game_QuestData.prototype.data = function () {
    return this._data;
};
/**
 * @param {String} quest_id 
 * @param {String} stage_id 
 * @returns Boolean
 */
Game_QuestData.prototype.has = function (quest_id, stage_id) {
    if (typeof quest_id === 'string' && quest_id.length && this.data().hasOwnProperty(quest_id)) {
        if (typeof stage_id === 'string') {
            return stage_id.length && stage_id !== 'STATUS' ? this.data()[quest_id].hasOwnProperty(stage_id) : false;
        }
        return true;
    }
    return false;
};
/**
 * @param {String} quest_id 
 * @param {String} stage_id 
 * @param {Number} amount 
 * @returns Game_Party.QuestData
 */
Game_QuestData.prototype.set = function (quest_id, stage_id, amount) {
    if (typeof amount !== 'number' || amount < 1) {
        amount = 0;
    }
    if (this.has(quest_id)) {
        this.data()[quest_id][stage_id] = amount;
    }
    return this;
};
/**
 * @param {String} quest_id 
 * @param {String} stage_id 
 * @returns 
 */
Game_QuestData.prototype.get = function (quest_id, stage_id) {
    if (typeof quest_id === 'string') {

        if (typeof stage_id === 'string') {
            return this.has(quest_id, stage_id) ? this.data()[quest_id][stage_id] : 0;
        }
        else {
            return this.has(quest_id) ? this.data()[quest_id].STATUS : Quest.Status.Hidden;
        }
    }
    return Quest.Status.Hidden;
};
/**
 * Update quest and stage data
 * @param {String} quest_id 
 * @param {String} stage_id 
 * @param {Number} amount 
 * @returns Number
 */
Game_QuestData.prototype.update = function (quest_id, stage_id, amount) {
    if (this.has(quest_id, stage_id)) {
        var value = this.get(quest_id, stage_id) + (typeof amount === 'number' && amount > 1 ? amount : 1);
        //QuestMan.DebugLog( value );
        this.set(quest_id, stage_id, value);
        return value;
    }
    return 0;
};
/**
 * @param {String} quest_id 
 * @returns Number
 */
Game_QuestData.prototype.status = function (quest_id) {
    return this.has(quest_id) ? this.data()[quest_id].STATUS : Quest.Status.Hidden;
};
/**
 * @param {String} quest_id 
 * @param {Number} status 
 * @returns Number
 */
Game_QuestData.prototype.setStatus = function (quest_id, status) {
    if (this.has(quest_id)) {
        this.data()[quest_id].STATUS = status;
    }
    else {
        //Allow setup on the fly
        this.data()[quest_id] = { 'STATUS': status };
    }
    return this.data()[quest_id].STATUS;
};
/**
 * @param {String} quest_id 
 * @returns GameParty.QuestData
 */
Game_QuestData.prototype.reset = function (quest_id, stages) {
    this.data()[quest_id] = { 'STATUS': Quest.Status.Hidden };
    if (Array.isArray(stages)) {
        for (var s in stages) {
            this.set(quest_id, stages[s]);
            QuestMan.DebugLog(`Reset ${quest_id}.${stages[s]}...`);
        }
    }
    return this;
};
/**
 * Compatibility
 * @param {String} quest_id
 * @returns GameParty.QuestData
 */
Game_QuestData.prototype.register = function (quest_id) {
    return this.reset(quest_id);
};
/**
 * @param {String} name 
 * @returns Array
 */
Game_QuestData.prototype.list = function (name) {
    return typeof name === 'string' && this.has(name) ?
        Object.keys(this.data()[name]).filter(id => id !== 'STATUS') :
        Object.keys(this.data());
};
/**
 * @param {String} param 
 * @param {Boolean} value 
 * @returns GameParty.QuestData
 */
Game_QuestData.prototype.setMenuStatus = function (status) {
    this._menu = status || QuestMan.MenuStatus.Enabled;
};
/**
 * @param {String} param 
 * @param {Boolean} value 
 * @returns GameParty.QuestData
 */
Game_QuestData.prototype.menuStatus = function () {
    return this._menu;
};
/**
 * @returns Boolean
 */
Game_QuestData.prototype.isMenuEnabled = function () {
    return this._menu === QuestMan.MenuStatus.Enabled
    ;
};
/**
 * @returns Boolean
 */
Game_QuestData.prototype.isMenuVisible = function () {
    return this._menu !== QuestMan.MenuStatus.Hidden;
};
/**
 * @returns Game_QuestData
 */
Game_QuestData.prototype.migrate = function(){
    //console.log( this._data);
    this._data = Game_QuestData.ParseQuestData( this._data );
    //console.log( this._data);
    return this;
};
/**
 * Migrates all saved quest data to a new format
 * @param {Object} input 
 * @returns Object
 */
Game_QuestData.ParseQuestData = function( input ){
    var output = {};
    if( typeof input === 'object' ){
        Object.keys( input ).forEach( function( quest ){
            var quest_id = QuestMan.ParseName(quest);
            output[quest_id] = {};
            Object.keys( input[ quest ] ).forEach( function( stage ){
                output[quest_id][stage === 'STATUS' ? stage : QuestMan.ParseName(stage)] = input[ quest ][ stage ];
            });
        });
    }
    return output;
};

/**
 * Register the quest data manager
 */
function QuestManager_RegisterQuestData() {
    //var _QuestManager_PartyInit = Game_Party.prototype.initialize;
    /*Game_Party.prototype.initialize = function () {

        _QuestManager_PartyInit.call(this);

        if( this.canCreateQuestData() ){
            this.createQuestData();
        }
    };*/
    /**
     * Initialize the quest data container
     */
    Game_Party.prototype.createQuestData = function () {
        if( this.canCreateQuestData() ){
            //backwards compatibility / quick import - Check if the previous release had _questData object definition and parse it to the new format
            var data = Game_QuestData.ParseQuestData( typeof this._questData === 'object' ? this._questData : { } );
            //capture the menu status from previous data format or set it as default
            var status = typeof this._questParams === 'object' && this._questParams.hasOwnProperty('menu_status') ?
                this._questParams['menu_status'] :
                QuestMan.defaultMenuStatus();
            //setup the new quest data engine
            this._questData = new Game_QuestData();
            this._questData._data = data;
            this._questData._menu = status;
            //remove older data
            if( typeof this._questParams === 'object'){
                delete this._questParams;
            }
        }
    };
    /**
     * @returns Boolean
     */
    Game_Party.prototype.migrateQuestData = function(){
        if( this._questData instanceof Game_QuestData ){
            this._questData.migrate();
            return true;
        }
        return false;
    };
    /**
     * @returns Boolean
     */
    Game_Party.prototype.canCreateQuestData = function(){
        return !(this._questData instanceof Game_QuestData);
        return typeof this._questData !== 'object' || !(this._questData instanceof Game_QuestData);
    };
    /**
     * Quest Data Manager (update, save, load)
     * @returns Game_Party.QuestData
     */
    Game_Party.prototype.QuestData = function () {

        return this._questData || {};
    };
};
/**
 * Hook the quest item common event
 */
function QuestManager_registerQuestItemEvent() {
    var _kunQuestMan_GainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function (item, amount, includeEquip) {
        _kunQuestMan_GainItem.call(this, item, amount, includeEquip);

        if (item !== null && amount > 0) {
            //console.log( `${item.name}: ${amount}` );
            QuestMan.onGetQuestItem(item.id, amount);
        }
    }
};

/**
 * Register quest Manager Menu
 */
function QuestManager_registerMenu() {

    var _kunQuestMan_OriginalMenuCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function () {
        _kunQuestMan_OriginalMenuCommands.call(this);
        if (QuestMan.isMenuVisible()) {
            this.addCommand(QuestMan.string('command', 'Quests'), 'quest', QuestMan.isMenuEnabled());
        }
    };
    var _kunQuestMan_CreateCommands = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function () {
        _kunQuestMan_CreateCommands.call(this);
        if (QuestMan.isMenuEnabled()) {
            this._commandWindow.setHandler('quest', this.commandQuestLog.bind(this));
        }
    };
    Scene_Menu.prototype.commandQuestLog = function () {
        QuestMan.Show();
    };
};
/**
 * Hook the questt manager setup
 */
function QuestManager_registerNewGame() {
    var _kunQuestMan_NewGame = Scene_Title.prototype.commandNewGame;
    Scene_Title.prototype.commandNewGame = function () {
        _kunQuestMan_NewGame.call(this);
        QuestMan.setup();
    };
    var _kunQuestMan_GameLoad = Game_System.prototype.onAfterLoad;
    Game_System.prototype.onAfterLoad = function () {
        _kunQuestMan_GameLoad.call(this);
        QuestMan.setup();
    }
}
/**
 * Setup text dialogs
 */
function QuestManager_registerEscapeCharacters() {
    //Window_Base.prototype.JayaKSetup_escapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    var _KunQuestMan_EscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        var parsed = _KunQuestMan_EscapeCharacters.call(this, text);

        //include the quest names and stages here
        return parsed.replace(/\x1bQUEST\[(\s+)\]/gi, function () {
            //get quest Id
            return this.displayQuestData(parseInt(arguments[1]));
        }.bind(this));
    };

    Window_Base.prototype.displayQuestData = function (name) {
        var path = name.split('.');
        var quest = QuestMan.quest(path[0]);
        if (quest !== null) {
            if (path.length > 1) {
                var stage = quest.stage(path[1]);
                return stage !== null ? stage.title() : '<INVALID STAGE>';
            }
            return quest.title(true);
        }
        return '<INVALID QUEST>';
    };
};
/**
 * Hook the commands
 */
function QuestManager_registerCommands() {
    //override vanilla
    var _kunQuestMan_CommandInterpreter = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _kunQuestMan_CommandInterpreter.call(this, command, args);
        if (QuestMan.commands().includes(command)) {
            //if (command === 'KunQuestMan' || command === 'QuestLog') {
            //override with plugin command manager
            switch (args[0]) {
                case 'start':
                    var quests = args[1].split(':');
                    var reset = args.length > 2 && args[2] === 'reset';
                    quests.forEach(q => quest_start(q, reset));
                    break;
                case 'restart':
                    var quests = args[1].split(':');
                    quests.forEach(q => quest_restart(q));
                    break;
                case 'reset':
                    var quests = args[1].split(':');
                    quests.forEach(q => quest_reset(q));
                    break;
                case 'update':
                    if (args.length > 1) {
                        var amount = args.length > 3 ? parseInt(args[3]) : 1;
                        if (args.length > 4 && args[4] === 'import') {
                            amount = $gameVariables.value(amount);
                        }
                        quest_update(args[1], args.length > 2 ? args[2] : '', amount);
                    }
                    break;
                case 'complete':
                    if (args.length > 1) {
                        quest_complete(args[1], args.length > 2 ? args[2] : '');
                    }
                    break;
                case 'completeAll':
                    if (args.length > 1) {
                        quest_complete_all( args[1] );
                    }
                    break;
                case 'fail': //backwards compatibility
                case 'cancel':
                    if (args.length > 1) {
                        var quests = args[1].split(':');
                        quests.forEach(q => quest_cancel(q));
                    }
                    break;
                case 'check':
                    if( args.length > 3 && !Number.isNaN(args[3])){
                        $gameSwitches.setValue( parseInt(args[3]) , quest_check( args[1] , args[2] ) );
                    }
                    break;
                case 'remaining':
                    if( args.length > 2 && !Number.isNaN(args[2])){
                        $gameVariables.setValue( parseInt(args[2]) , quest_remaining( args[1] ) );
                    }
                    break;
                case 'inventory':
                    if (args.length > 1) {
                        quest_inventory(parseInt(args[1]));
                    }
                    break;
                case 'menu':
                    QuestMan.ToggleMenu(args.length > 1 ? args[1] : QuestMan.MenuStatus.Enabled);
                    break;
                case 'show':
                case 'display':
                    QuestMan.Show();
                    break;
                case 'muted':
                case 'silent':
                    QuestMan.mute(true);
                    break;
                case 'notify':
                    QuestMan.mute(false);
                    break;
                case 'MigrateQuestData':
                    QuestMan.Migrate();
                    break;
            }
        }
    };
};



///////////////////////////////////////////////////////////////////////////////////////////////////
////    Quest Object
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 
 * @param {String} name 
 * @param {String} title 
 * @param {String} category 
 * @param {String} details
 * @param {Number} icon 
 * @param {String} behaviour 
 * @param {String} next
 * @param {String} reward
 * @returns Quest
 */
function Quest(name, title, category, details, icon, behaviour, next, reward) {
    this._name = QuestMan.ParseName(name);
    this._title = QuestMan.Translate(this._name + '.title', title);
    this._details = QuestMan.Translate(this._name + '.details', details || '' );
    this._category = QuestMan.Translate(this._name + '.category', category || 'main' );
    this._icon = icon || 0;
    this._behaviour = behaviour || Quest.Behaviour.Default;
    this._reward = reward || '';
    this._stages = {};
    this._next = typeof next === 'string' && next.length ? QuestMan.ParseName(next) : '';
};

//public getters
/**
 * @returns string
 */
Quest.prototype.name = function () { return this._name; };
/**
 * @param Boolean display Icon + Title
 * @returns string
 */
Quest.prototype.title = function (display) {
    return typeof display === 'boolean' && display ? `\\\I[${this.icon()}] ${this._title}` : this._title;
};
/**
 * Backwards compatibility
 * @returns String
 */
Quest.prototype.displayTitle = function () { return this.title(true); };
/**
 * @returns string
 */
Quest.prototype.category = function () { return this._category };
/**
 * @returns string
 */
Quest.prototype.reward = function () { return this._reward; };
/**
 * @returns Boolean
 */
Quest.prototype.hasReward = function () { return this._reward.length > 0; };
/**
 * @returns Quest
 */
Quest.prototype.next = function () { return this.hasNext() ? QuestMan.quest(this._next) : null; };
/**
 * @returns Boolean
 */
Quest.prototype.hasNext = function () { return this._next.length > 0; };
/**
 * @returns Quest
 */
Quest.prototype.checkNext = function () {
    var next = this.next();
    //start new quest if required
    if (next !== null) {
        next.start();
    }
    return this;
}
/**
 * @returns string
 */
Quest.prototype.icon = function () {
    return this.hasIcon() ? this._icon : QuestMan.getCategoryIcon(this.category());
};
/**
 * @returns string
 */
Quest.prototype.hasIcon = function () { return this._icon > 0; };

/**
* @returns string
*/
Quest.prototype.details = function () {

    var details = this._details.length > 0 ? this._details : '';

    if (this.behaviour() === Quest.Behaviour.Linear) {
        var stage = this.current();
        if (stage !== false) {
            details += stage.details();
        }
    }

    return details;
};
/**
 * @returns string
 */
Quest.prototype.details = function () {

    var details = this._details.length > 0 ? this._details + "\n" : '';

    if (this.behaviour() === Quest.Behaviour.Linear) {
        var current = this.current();
        if (current !== false) {
            details += current.details();
        }
    }

    return details;
};
/**
 * @param Number wordLimit Words per line, 50 by default
 * @returns {Array}
 */
Quest.prototype.displayDetail = function (wordLimit) {
    var output = [];
    wordLimit = wordLimit || 40;
    this.details().split("\n").forEach(function (line) {
        line.split(' ').forEach(function (word) {
            if (output.length) {
                if (output[output.length - 1].length + word.length + 1 < wordLimit) {
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
 * @returns Game_Party.QuestData
 */
Quest.prototype.data = function () { return $gameParty.QuestData(); };
/**
 * @returns number
 */
Quest.prototype.status = function () { return this.data().status(this.name()); };
/**
 * @returns Number
 */
Quest.prototype.completed = function () { return this.status() === Quest.Status.Completed; };
/**
 * @returns Number
 */
Quest.prototype.active = function () { return this.status() === Quest.Status.Active; };
/**
 * @returns Number
 */
Quest.prototype.failed = function () { return this.status() === Quest.Status.Failed; };
/**
 * @returns Number
 */
Quest.prototype.hidden = function () { return this.status() === Quest.Status.Hidden; };
/**
 * @returns String
 */
Quest.prototype.displayStatus = function () { return Quest.Status.display(this.status()); };
/**
 * @returns string
 */
Quest.prototype.behaviour = function () { return this._behaviour; };
/**
 * @returns Boolean
 */
Quest.prototype.isLinear = function () { return this.behaviour() === Quest.Behaviour.Linear; };
/**
 * @returns Boolean
 */
Quest.prototype.isOptional = function () { return this.behaviour() === Quest.Behaviour.Optional; };
/**
 * @returns Number
 */
Quest.prototype.progress = function () {
    var objectives = 0
    var completed = 0;
    this.stages(true).forEach((stage) => {
        objectives += stage.objective();
        completed += stage.current();
    });
    return objectives > 0 ? completed / objectives : 0;
};
/**
 * @returns Number
 */
Quest.prototype.remaining = function () {
    var stagesLeft = this.list().length - this.stages(true).filter(stage => stage.completed()).length;
    return stagesLeft < 0 ? 0 : stagesLeft;
};
/**
 * @param {Boolean} list 
 * @returns Array | Object
 */
Quest.prototype.stages = function (list) {
    return typeof list === 'boolean' && list ? Object.values(this._stages) : this._stages;
};
/**
 * @returns Array
 */
Quest.prototype.list = function () { return Object.keys(this.stages()); };
/**
 * @returns Number
 */
Quest.prototype.countStages = function () { return this.stages().length; };
/**
 * @returns Array
 */
Quest.prototype.visibleStages = function () {
    if ( this.isLinear( ) && this.status() < Quest.Status.Completed ) {
        var list = this.list();
        var current = this.current();
        var _quest = this;
        if (current !== false && list.includes(current.name())) {
            var from = list.indexOf(current.name());
            var visible = list.slice(0, from < list.length ? from + 1 : from );
            //return output.map(stage_id => _quest.stage(stage_id));
            return this.stages(true).filter( stage => visible.includes( stage.name( ) ) );
            //this.stages(true).forEach()
            //return output;
        }
        return [];
    }
    return this.stages(true);
};
/**
 * @param {String} stage_id 
 * @returns QuestStage
 */
Quest.prototype.stage = function (stage_id) { return this.has(stage_id) ? this.stages()[stage_id] : null; };
/**
 * @param {String} stage_id 
 * @returns Boolean
 */
Quest.prototype.has = function (stage_id) {
    return typeof stage_id === 'string' && stage_id.length && this._stages.hasOwnProperty(stage_id);
};
/**
 * Current quest stage if Linear behavior is enabled
 * @returns QuestStage|Boolean
 */
Quest.prototype.current = function () {
    if (this.status() === Quest.Status.Active) {
        //if( this.behaviour() === Quest.Behaviour.Linear || this.behaviour() === Quest.Behaviour.Default ){
        var stages = this.stages(true).filter(s => s.status() < Quest.Status.Completed);
        if (stages.length) {
            return stages[0];
        }
    }
    return false;
};
/**
 * @param {String} stage 
 * @param {String} title 
 * @param {String} details 
 * @param {Number} objective 
 * @param {Number} varId
 * @param {Number} varAmount
 * @param {String} varMethod
 * @returns Quest
 */
Quest.prototype.addStage = function (stage, title, details, objective, varId, varAmount, varMethod) {

    stage = QuestMan.ParseName(stage);

    if (!this.has(stage)) {
        this._stages[stage] = new QuestStage(
            this.name(),
            stage,
            title,
            details || "",
            objective || 1,
            varId || 0,
            varAmount || 1,
            varMethod || QuestStage.VariableMethod.Add);
    }

    return this;
};
/**
 * @param {Number} status 
 * @returns Quest
 */
Quest.prototype.set = function (status) {
    this.data().setStatus(this.name(), status);
    return this;
};
/**
 * @param {String} id
 * @returns Quest
 */
Quest.prototype.reset = function () {
    this.data().reset(this.name(), this.list());
    return this;
};
/**
 * @param {Number} status 
 * @param {Boolean} mute
 * @returns Boolean
 */
Quest.prototype.start = function ( mute ) {
    if (this.status() < Quest.Status.Active) {
        this.reset().set(Quest.Status.Active).notify(this.displayTitle() + ' started.');
        if( !(typeof mute === 'boolean' && mute) ){
            this.playMedia('start')
        }
    }
    return this.active();
};
/**
 * 
 * @param {String} stage_id 
 * @param {Number} amount
 * @returns Number
 */
Quest.prototype.update = function (stage_id, amount) {
    if (this.status() < Quest.Status.Completed) {
        if (this.status() < Quest.Status.Active) {
            //start quest
            return this.start();
        }
        else {
            //quest running, check update by behavior
            var stage = this.isLinear() ? this.current() : this.stage(stage_id);
            if (stage !== null && stage.active()) {
                if (this.isLinear() && typeof stage_id === 'string' && stage_id.length && stage_id !== stage.name()) {
                    //do nothing, linear quests can just be updated on their specific stage. Use current stage name or just questname to update it's curretn stage
                    QuestMan.DebugLog(`Only current quest stage can be updated in Linear Quest ${this.name()}`);
                    return this.status();
                }
                stage.update(amount || 1);
                QuestMan.DebugLog(`${this.name()}.${stage.name()}  ${stage.value()} / ${stage.objective()}`);
                if (this.remaining() > 0 || this.isOptional()) {
                    this.notify(this.displayTitle() + ' updated.').playMedia('update');
                }
                else {
                    this.set(Quest.Status.Completed).notify(this.displayTitle() + ' completed.').playMedia('complete').checkNext();
                }
            }
        }
    }
    return this.status();
};
/**
 * @param {String} stage_id (stage)
 * @returns Quest
 */
Quest.prototype.complete = function (stage_id) {
    if (this.status() < Quest.Status.Completed) {
        if (this.has(stage_id)) {
            if (this.stage(stage_id).complete() === Quest.Status.Completed) {
                if (this.remaining() > 0 || this.isOptional()) {
                    this.notify(this.displayTitle() + ' updated.').playMedia('update');
                }
                else {
                    return this.complete();
                    //this.set(Quest.Status.Completed).notify(this.displayTitle() + ' completed.').playMedia('complete').checkNext();
                }
                return true;
            }
        }
        else {
            this.set(Quest.Status.Completed);
            this.notify(this.displayTitle() + ' completed.').playMedia('complete').checkNext();
        }
    }
    return this.completed();
};
/**
 * Complete this quest and all the stages (used to mark as totally completed)
 * @returns Quest
 */
Quest.prototype.completeAll = function(){
    this.stages(true).forEach( stage => stage.complete() );
    this.set( Quest.Status.Completed );
    return this;
};
/**
 * @param {Number} status 
 * @returns Quest
 */
Quest.prototype.cancel = function () {
    if (this.status() < Quest.Status.Completed) {
        this.set(Quest.Status.Failed).notify(this.displayTitle() + ' failed.').playMedia('fail');
    }
    return this.status() === Quest.Status.Failed;
};

/**
* @returns Object
*/
Quest.prototype.dump = function () {
    return {
        'name': this.name(),
        'title': this.title(),
        'category': this.category(),
        'icon': this.icon(),
        'behaviour': this.behaviour(),
        'status': this.status(),
        'stages': this.stages(true).map((s) => output.stages.push(s.dump())),
    };
};
/**
 * @param {String} media 
 * @returns Quest
 */
Quest.prototype.playMedia = function (media) {
    QuestMan.playMedia(media);
    return this;
};
/**
 * @param {String} message 
 * @returns Quest
 */
Quest.prototype.notify = function (message) {
    QuestMan.notify(message);
    return this;
};

Quest.INVALID = 'INVALID';

Quest.Status = {
    'Invalid': 0,
    'Hidden': 1,
    'Active': 2,
    'Completed': 3,
    'Failed': 4
};
/**
 * @param {Number} status 
 * @returns String[]
 */
Quest.CheckStatus = function( status ){
    switch( status ){
        case Quest.Status.Hidden:
            return ['ready','hidden'];
        case Quest.Status.Active:
            return ['running','active'];
        case Quest.Status.Completed:
            return ['completed'];
        case Quest.Status.Failed:
            return ['failed','cancelled'];
        default:
            return [];
    }
};
Quest.Status.display = function (status) {
    switch (status) {
        case this.Hidden: return 'Hidden';
        case this.Active: return 'Active';
        case this.Completed: return 'Completed';
        case this.Failed: return 'Failed';
        default: return 'Invalid';
    }
};

Quest.Behaviour = {
    'Default': 'default',
    'Linear': 'linear',
    'Optional': 'optional',
};

Quest.Category = {
    'Main': 'main',
    'Secondary': 'secondary',
    'Jobs': 'jobs'
};

/**
 * @param string quest
 * @param string stage
 * @param string title
 * @param string details
 * @param number objective
 * @param number varId
 * @param number varAmount
 * @param string updateMethod
 * @returns QuestStage
 */
function QuestStage(quest, stage, title, details, objective, varId, varAmount, updateMethod) {
    this._quest = QuestMan.ParseName(quest);
    this._name = QuestMan.ParseName(stage);
    this._title = QuestMan.Translate(`${this._quest}.${this._name}.title`, title || stage);
    this._details = QuestMan.Translate(`${this._quest}.${this._name}.details`, details || '');
    this._objecive = objective || 1;

    this._varId = varId || 0;
    this._varAmount = varAmount || 1;
    this._updateMethod = updateMethod || this.VariableMethod.Set;

    return this;
};
/**
 * @returns Quest.Data
 */
QuestStage.prototype.data = function () {
    return $gameParty.QuestData();
};
/**
 * @param {Boolean} fullName show as QuestName.StageName (true) or only as StageName (false:default)
 * @returns String
 */
QuestStage.prototype.name = function (fullName) {
    return typeof fullName === 'boolean' && fullName ? this.quest() + '.' + this._name : this._name;
};
/**
 * @returns String
 */
QuestStage.prototype.title = function () { return this._title; };
/**
 * @returns String
 */
QuestStage.prototype.details = function () { return this._details; };
/**
 * @returns String
 */
QuestStage.prototype.objective = function () { return this._objecive; };
/**
 * @returns Object
 */
QuestStage.prototype.dump = function () {
    return {
        'name': this.name(),
        'title': this.title(),
        'details': this.details(),
        'objective': this.objective(),
        'status': this.current()
    };
};
/**
 * @returns String
 */
QuestStage.prototype.quest = function(){
    return this._quest;
};
/**
 * @returns String
 */
QuestStage.prototype.stageId = function () { return this._name; };
/**
 * @param {Boolean} display
 * @returns String
 */
QuestStage.prototype.title = function (display) {
    if (typeof display === 'boolean' && display) {
        return this.objective() > 1 ? `${this._title} ( ${this.value()} / ${this.objective()} )` : this._title;
    }
    return this._title;
};
/**
 * @returns Number
 */
QuestStage.prototype.value = function () { return this.data().get(this.quest(), this.name()); };
/**
 * @returns Number
 */
QuestStage.prototype.current = function () { return this.value(); };
/**
 * Complete this stage if still in progress
 * @returns Number
 */
QuestStage.prototype.complete = function () {
    if (this.status() < Quest.Status.Completed) {
        this.data().set(this.quest(), this.name(), this.objective());
    }
    return this.status();
};
/**
 * Make an increment over the stage's status
 * @param {Number} amount
 * @returns Number
 */
QuestStage.prototype.update = function (amount) {
    if (this.status() === Quest.Status.Active) {
        var value = this.value() + ( typeof amount === 'number' && amount > 0 ? amount : 1);
        var points = value < this.objective() ? value : this.objective();
        this.data().set( this.quest(), this.name(), points );
        //QuestMan.DebugLog(`Adding ${points} points to ${this.quest()}.${this.name()}`);
        /*if (this.value() + amount < this.objective()) {
            this.data().update(this.quest(), this.name(), amount);
        }
        else {
            this.data().set(this.quest(), this.name(), this.objective());
        }*/

        if (this.status() === Quest.Status.Completed) { this.updateGameVar(); }
    }
    return this.status();
};
/**
 * @returns Float
 */
QuestStage.prototype.progress = function () {
    return this.value() / parseFloat(this.objective());
};
/**
 * @returns Number
 */
QuestStage.prototype.status = function () {
    return this.completed() ? Quest.Status.Completed : Quest.Status.Active;
}
/**
 * @returns Boolean
 */
QuestStage.prototype.completed = function () {
    return !this.active();
};
/**
 * @returns Boolean
 */
QuestStage.prototype.active = function () {
    return this.value() < this.objective();
};
/**
 * @returns QuestStage
 */
QuestStage.prototype.reset = function () {
    //console.log( this.name());
    this.data().set(this.quest(), this.name(), 0);
    return this;
};
/**
 * @returns Boolean
 */
QuestStage.prototype.hasGameVar = function () { return this._varId > 0; };
/**
 * @returns QuestStage
 */
QuestStage.prototype.updateGameVar = function () {
    if (this.hasGameVar()) {
        var value = $gameVariables.value(this._varId);
        switch (this._updateMethod) {
            case this.VariableMethod.Add:
                $gameVariables.setValue(this._varId, value + this._varAmount);
                break;
            case this.VariableMethod.Substract:
                $gameVariables.setValue(this._varId, value - this._varAmount > 0 ? value - this._varAmount : 0);
                break;
            case this.VariableMethod.Set:
                $gameVariables.setValue(this._varId, this._varAmount);
                break;
        }
    }
    return this;
};

QuestStage.VariableMethod = {
    'Add': 'add',
    'Substract': 'sub',
    'Set': 'set',
};



///////////////////////////////////////////////////////////////////////////////////////////////////
////    Functions
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @param {String} quest 
 * @param {String} status 
 * @returns Number
 */
function quest_check( quest , status ){
    if( typeof quest === 'string' && quest.length ){
        var name = quest.split('.');
        return Quest.CheckStatus( quest_status( name[0] , name.length > 1 ? name[1] : '' )).includes( status );
    }
    return false;
};
/**
 * @returns String[]
 */
function quest_categories(){
    return Object.keys( QuestMan.categories( ) );
}
/**
 * @param {String} status
 * @param {String} category
 * @returns String[]
 */
function quest_list( status , category ){
    var list = QuestMan.quests(true);

    if( typeof status === 'string' && status.length ){
        list = list.filter( function( quest ){
            return Quest.CheckStatus(quest.status()).includes(status);
        });
    }
    if( typeof category === 'string' && category.length ){
        list = list.filter( function( quest ){
            return quest.category() === category;
        });
    }
    
    return list.map( quest => quest.name() );
};
/**
 * @param {String} quest
 * @param {String} stage
 * @returns Number
 */
function quest_status(quest, stage) {
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    if (q !== null) {
        if (typeof stage === 'string' && stage.length) {
            var s = q.stage(QuestMan.ParseName(stage));
            return s !== null && !s.completed() ? Quest.Status.Active : Quest.Status.Completed;
        }
        return q.status();
    }

    QuestMan.DebugLog('Invalid quest ID ' + quest);

    return Quest.Status.Invalid;
}
/**
 * @param {String} quest 
 * @param {String} stage 
 * @returns Number
 */
function quest_stage( quest , stage ){
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    if (q !== null) {
        if (typeof stage === 'string' && stage.length) {
            var s = q.stage(QuestMan.ParseName(stage));
            return s !== null ? s.value() : 0;
        }
    }
    return 0;
};
/**
 * Obsolete function support
 * @param {String} quest
 * @param {String} stage
 * @returns Boolean
 */
function quest_running(quest, stage) { return quest_active(quest, stage); }
/**
 * @param {String} quest
 * @param {String} stage
 * @returns Boolean
 */
function quest_active(quest, stage) {
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    if (q !== null) {
        if (q.active()) {
            if (typeof stage === 'string' && stage.length) {
                //stages
                var s = q.stage(QuestMan.ParseName(stage));
                if (q.behaviour() === Quest.Behaviour.Linear) {
                    return s !== null && !s.completed() && s.name() === q.current().name();
                }
                return s !== null && !s.completed();
            }
            return true;
        }
    }
    else {
        QuestMan.DebugLog('Invalid quest ID ' + quest);
    }

    return false;
}
/**
 * @param {String} quest
 * @param {String} stage
 * @returns Boolean
 */
function quest_completed(quest, stage) {
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    if (q !== null) {
        if (typeof stage === 'string' && stage.length) {
            var s = q.stage(QuestMan.ParseName(stage));
            return s !== null && s.completed();
        }
        return q.completed();
    }
    return false;
}
/**
 * @param {String} quest 
 * @returns Boolean
 */
function quest_ready(quest) {
    return quest_status(QuestMan.ParseName(quest)) === Quest.Status.Hidden;
}
/**
 * @param {String} quest 
 * @returns Boolean
 */
function quest_failed(quest) {
    return quest_status(QuestMan.ParseName(quest)) === Quest.Status.Failed;
}
/**
 * Start a quest
 * @param {String} quest 
 * @param {Boolean} reset 
 * @returns Boolean
 */
function quest_start(quest, reset) {
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    if (q !== null) {
        return typeof reset === 'boolean' && reset ? q.reset().start() : q.start();
    }
    else {
        QuestMan.DebugLog('Invalid quest ID ' + quest);
    }
    return false;
}
/**
 * @param {String} quest 
 * @param {String} stage
 * @param {Number} progress
 * @returns Boolean
 */
function quest_update(quest, stage, progress) {
    //console.log(`${id}: ${progress || 1}`);
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    if (q !== null) {
        return q.update( typeof stage === 'string' ? QuestMan.ParseName(stage) : '', progress);
    }

    QuestMan.DebugLog('Invalid quest ID ' + quest);

    return false;
}
/**
 * Return the list of QuestStages left to complete. Will return 0 if the quest doesn't exist.
 * Backwards compatibility. Use quest_remaining() instead
 * @param {String} quest 
 * @returns Number
 */
function quest_stages_left(quest) {
    return quest_remaining( quest );
}
/**
 * Return the list of QuestStages left to complete. Will return 0 if the quest doesn't exist.
 * @param {String} quest 
 * @returns Number
 */
function quest_remaining(quest) {
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    return q !== null ? q.remaining() : 0;
}
/**
 * Complete a quest or quest stage
 * @param {String} name Quest or Quest.Stage ID
 * @param {String} stage
 * @returns Boolean
 */
function quest_complete(quest, stage) {

    var q = QuestMan.quest(QuestMan.ParseName(quest));
    if (q !== null) {
        return typeof stage === 'string' && stage.length > 0 ?
            q.complete(QuestMan.ParseName(stage)) :
            q.complete();
    }

    QuestMan.DebugLog('Invalid quest ID ' + quest);

    return false;
}
/**
 * Complete a quest or quest stage
 * @param {String} name Quest ID
 * @returns Boolean
 */
function quest_complete_all(quest) {
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    return q !== null ? q.completeAll().status() : Quest.Status.Invalid;
}
/**
 * Cancel a quest
 * @param {String} quest
 */
function quest_cancel(quest) {
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    if (q !== null) {
        q.cancel();
    }
    else {
        QuestMan.DebugLog('Invalid quest ID ' + quest);
    }
}
/**
 * Reset a quest/Stage
 * @param {String} quest 
 * @returns Boolean
 */
function quest_reset(quest) {

    var q = QuestMan.quest(QuestMan.ParseName(quest));
    if (q !== null) {
        q.reset();
        return true;
    }

    QuestMan.DebugLog('Invalid quest ID ' + quest);

    return false;
}

/**
 * Restart a quest/Stage
 * @param {String} quest 
 * @returns Boolean
 */
function quest_restart(quest) { return quest_reset(quest) ? quest_start(quest) : false; }
/**
 * check the inventory for quest items by item_id
 * @param {Number} item_id 
 * @returns Boolean
 */
function quest_inventory(item_id) {

    var items = $gameParty.items().filter(function (item) {
        return item.id === item_id;
    });

    if (items.length) {
        var amount = $gameParty.numItems(items[0]);
        QuestMan.onGetQuestItem(item_id, amount);
        return amount > 0;
    }
    return false;
}

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
/**
 * Set the acative quest here to open
 */
QuestLogScene.LayoutSize = 4;
QuestLogScene.prototype.create = function () {
    Scene_ItemBase.prototype.create.call(this);

    var quest = QuestMan.importSelected(true);

    this.setupStatusWindow(quest !== null ? quest.status() : Quest.Status.Active);
    this.setupCategoryWindow(quest !== null ? quest.category() : '');
    this.setupQuestWindow(quest);
    this.setupDetailWindow(quest);
};
/**
 * @returns Quest
 */
QuestLogScene.prototype.importActiveQuest = function () {
    var quest = QuestMan.Selected.length ? QuestMan.quest(QuestMan.Selected) : null;
    QuestMan.Selected = '';
    return quest;
};
/**
 * @param {String} category 
 */
QuestLogScene.prototype.setupCategoryWindow = function (category) {
    this._categoryWindow = new QuestCatWindow(this._statusWindow.height, category);
    this.addWindow(this._categoryWindow);
};
/**
 * @param {Number} status 
 */
QuestLogScene.prototype.setupStatusWindow = function (status) {
    this._statusWindow = new QuestStatusWindow(status);
    this._statusWindow.setHandler('cancel', this.onQuitQuestLog.bind(this));
    this._statusWindow.setHandler('ok', this.onSelectCategory.bind(this));
    this.addWindow(this._statusWindow);
    this._statusWindow.activate();
};
/**
 * @param {String} name 
 * @param {String} category
 * @param {Number} status
 */
QuestLogScene.prototype.setupQuestWindow = function (quest) {

    var y = this._statusWindow.y + this._statusWindow.height;

    this._questsWindow = new QuestLogWindow(y, quest);
    this._statusWindow.setQuestsWindow(this._questsWindow);
    this._categoryWindow.setQuestsWindow(this._questsWindow);
    this.addWindow(this._questsWindow);
    this._questsWindow.activate();
    this._questsWindow.reload();
};
/**
 * @param {String} name 
 */
QuestLogScene.prototype.setupDetailWindow = function (quest) {
    this._detailWindow = new QuestDetailWindow(this._questsWindow.y, quest);
    this._questsWindow.setHelpWindow(this._detailWindow);
    this.addWindow(this._detailWindow);
    this._detailWindow.refresh();
};
QuestLogScene.prototype.onSelectCategory = function () {
    if (this._categoryWindow) {
        this._categoryWindow.nextCategory();
        if (this._statusWindow) {
            this._statusWindow.activate();
            this._statusWindow.refresh();
        }
        if (this._questsWindow) {
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
QuestCatWindow.prototype.initialize = function (height, category) {
    Window_Base.prototype.initialize.call(this, 0, 0, this.windowWidth(), height);
    this.category = typeof category === 'string' && category.length ? category : '';
    this.color = 0;
    this.icon = 0;
    this.refresh();
};
QuestCatWindow.prototype.getCategory = function () {
    return this.category;
};
QuestCatWindow.prototype.standardFontSize = function () { return 20; };
/**
 * @returns ARray
 */
QuestCatWindow.prototype.categories = () => QuestMan.categories(true);

QuestCatWindow.prototype.nextCategory = function () {
    var _categories = [''].concat(this.categories());
    var _current = _categories.indexOf(this.category);
    if (_current > -1) {
        if (_current < _categories.length - 1) {
            _current++;
        }
        else {
            _current = 0;
        }
        this.category = _categories[_current];
    }
    else {
        this.category = '';
    }
    this.refresh();
};
QuestCatWindow.prototype.windowWidth = function () {
    return parseInt(Graphics.boxWidth / QuestLogScene.LayoutSize);
};
QuestCatWindow.prototype.renderCategory = function () {
    var text = this.category ? this.category : 'All';
    var color = QuestMan.getCategoryColor(this.category);
    var icon = QuestMan.getCategoryIcon(this.category);
    if (icon > 0) {
        var base_line = Math.max((28 - this.standardFontSize()) / 2, 0);
        this.drawIcon(icon, 0, base_line);
    }
    this.changeTextColor(this.textColor(color));
    this.drawText(text, 0, 0, this.contentsWidth(), 'center');
    this.changeTextColor(this.normalColor());
}
QuestCatWindow.prototype.refresh = function () {

    this.contents.clear();

    this.renderCategory(this.getCategory());

    if (this._questsWindow) {
        this._questsWindow.setCategory(this.getCategory());
    }
};
QuestCatWindow.prototype.setQuestsWindow = function (questWindow) {
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
QuestStatusWindow.prototype.initialize = function (status) {
    Window_HorzCommand.prototype.initialize.call(this, this.windowX(), 0);

    if (typeof status === 'number' && status > Quest.Status.Invalid) {
        //initializedefault status
    }
};
QuestStatusWindow.prototype.windowX = function () {
    return parseInt(Graphics.boxWidth / QuestLogScene.LayoutSize);
};
QuestStatusWindow.prototype.windowWidth = function () {
    return this.windowX() * (QuestLogScene.LayoutSize - 1);
};
QuestStatusWindow.prototype.maxCols = function () {
    return this.maxItems();
};
QuestStatusWindow.prototype.standardFontSize = function () { return 20; };

QuestStatusWindow.prototype.update = function () {
    Window_HorzCommand.prototype.update.call(this);
    if (this._questsWindow) {
        this._questsWindow.setStatus(this.getStatus());
    }
};
QuestStatusWindow.prototype.getStatus = function () {
    switch (this.currentSymbol()) {
        case 'hidden': return 1;
        case 'active': return 2;
        case 'completed': return 3;
        case 'failed': return 4;
        default: return 0;
    }
};
QuestStatusWindow.prototype.makeCommandList = function () {
    //register all visual statuses
    if (QuestMan.debug()) {
        this.addCommand('Hidden', 'hidden');
    }
    this.addCommand('Active', 'active');
    this.addCommand('Completed', 'completed');
    this.addCommand('Failed', 'failed');
    return;
};
QuestStatusWindow.prototype.drawItem = function (index) {
    var rect = this.itemRectForText(index);
    var align = this.itemTextAlign();
    if (this.commandSymbol(index) === 'hidden') {
        this.changeTextColor(this.systemColor());
    }
    else {
        this.resetTextColor();
    }
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
    this.resetTextColor();
};
QuestStatusWindow.prototype.setQuestsWindow = function (questWindow) {
    this._questsWindow = questWindow;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
////    QuestLogWindow : Window_Selectable
///////////////////////////////////////////////////////////////////////////////////////////////////

function QuestLogWindow() {
    this.initialize.apply(this, arguments);
}
QuestLogWindow.prototype = Object.create(Window_Selectable.prototype);
QuestLogWindow.prototype.constructor = QuestLogWindow;
QuestLogWindow.prototype.initialize = function (y, quest) {
    Window_Selectable.prototype.initialize.call(this, 0, y, this.windowWidth(), this.windowHeight(y));

    this.questStatus = Quest.Status.Active; //active status
    this.questCat = ''; //filter none

    if (quest !== null && quest instanceof Quest) {
        this.questStatus = quest.status();
        this.questCat = quest.category();
    }

    //this.questLog = [];
    this.importItems();
};
QuestLogWindow.prototype.importItems = function () {
    this.questLog = QuestMan.filter(this.questStatus, this.questCat).map((quest) => quest.name());
}
QuestLogWindow.prototype.setCategory = function (category) {
    category = typeof category === 'string' ? category : '';
    if (this.questCat !== category) {
        this.questCat = category;
        this.reload();
    }
};
QuestLogWindow.prototype.setStatus = function (status) {
    status = typeof status === 'number' ? status : Quest.Status.Active;
    if (this.questStatus !== status) {
        this.questStatus = status;
        this.reload();
    }
};
/**
 * @returns Number
 */
QuestLogWindow.prototype.getStatus = function () {
    return this.questStatus;
}


QuestLogWindow.prototype.windowWidth = function () {
    return Graphics.boxWidth / QuestLogScene.LayoutSize;
};
QuestLogWindow.prototype.windowHeight = function (y) {
    return Graphics.boxHeight - y;
};
QuestLogWindow.prototype.maxCols = function () { return 1; };
QuestLogWindow.prototype.maxItems = function () { return this.questLog ? this.questLog.length : 0; };
QuestLogWindow.prototype.spacing = function () { return 32; };
QuestLogWindow.prototype.standardFontSize = function () { return 20; };

/**
 * @returns {String}
 */
QuestLogWindow.prototype.getItemId = function (idx) {
    idx = typeof idx === 'number' ? idx : this.index();
    return idx >= 0 && idx < this.questLog.length ? this.questLog[idx] : Quest.INVALID;
};
QuestLogWindow.prototype.getQuest = function (idx) {
    var quest_id = this.getItemId(idx);
    return quest_id !== Quest.INVALID ? QuestMan.quest(quest_id) : null;
};
/**
 * @description Render Item in the list by its list order
 */
QuestLogWindow.prototype.drawItem = function (index) {
    var quest = this.getQuest(index);
    if (quest !== null) {
        var rect = this.itemRect(index);
        var title_break = quest.title().split(' - ');
        if (this.questStatus < Quest.Status.Active) {
            this.changeTextColor(this.systemColor());
        }
        //this.drawTextEx( title_break[ 0 ] , rect.x , rect.y, rect.width);
        this.drawText(title_break[0], rect.x, rect.y, rect.width, 'left');
        this.resetTextColor();
    }
};
QuestLogWindow.prototype.setHelpWindow = function (helpWindow) {
    Window_Selectable.prototype.setHelpWindow.call(this, helpWindow);
    this.setHelpWindowItem(this.getItemId());
}
QuestLogWindow.prototype.updateHelp = function () {
    this.setHelpWindowItem(this.getItemId());
};
QuestLogWindow.prototype.setHelpWindowItem = function (item) {
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
QuestDetailWindow.prototype.initialize = function (y, quest) {
    Window_Base.prototype.initialize.call(this, this.windowX(), y, this.windowWidth(), this.windowHeight(y));
    //this.quest_id = '';
    this.questData = null;

    if (quest !== null && quest instanceof Quest) {
        this.questData = quest;
    }

    this.refresh();
};
QuestDetailWindow.prototype.windowX = function () {
    return Graphics.boxWidth / QuestLogScene.LayoutSize;
};
QuestDetailWindow.prototype.windowWidth = function () {
    return this.windowX() * (QuestLogScene.LayoutSize - 1);
};
QuestDetailWindow.prototype.windowHeight = function (y) {
    return Graphics.boxHeight - y;
};
QuestDetailWindow.prototype.clear = function () {
    //this.setItem();
};
/**
 * @param {String} name 
 */
QuestDetailWindow.prototype.setItem = function (name) {
    this.questData = QuestMan.quest(name);
    this.refresh();
};
QuestDetailWindow.prototype.refresh = function () {
    this.contents.clear();
    if (this.questData && this.questData.name() !== Quest.INVALID) {
        this.renderQuestData(this.questData);
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
QuestDetailWindow.prototype.completedItemOpacity = function () { this.contents.paintOpacity = 192; };
QuestDetailWindow.prototype.debugItemOpacity = function () { this.contents.paintOpacity = 128; };
QuestDetailWindow.prototype.baseLine = function () { return Math.max((28 - this.standardFontSize()) / 2, 0); };
/**
 * @param {Quest} quest
 */
QuestDetailWindow.prototype.renderQuestData = function (quest) {

    //pass  through anonymous
    this.changeTextColor(this.normalColor());
    // quest heading
    var base_line = this.baseLine();
    var width = this.contentsWidth();
    var icon = quest.icon();
    //TITLE
    if (icon) {
        this.drawTextEx(quest.title(), 40, base_line, width);
        this.drawIcon(quest.icon(), 0, base_line);
    }
    else {
        this.drawTextEx(quest.title(), 0, base_line, width);
    }
    this.changeTextColor(this.textColor(23));
    //CATEGORY
    this.drawText(quest.category(), 40, base_line, width - 40, 'right');

    this.changeTextColor(this.textColor(24));

    var line = Math.max(32, this.lineHeight());

    this.drawHorzLine(line);

    this.renderQuestDetail(quest.displayDetail(QuestMan.detailsLength()), line);
    //this.drawHorzLine(line);

    //RENDER STAGES
    this.renderQuestStages(QuestMan.debug() || quest.status() > Quest.Status.Active ? quest.stages(true) : quest.visibleStages(), quest.isLinear() );

    this.drawGauge(0, this.contentsHeight() - 10 - this.lineHeight() * 2, width, quest.progress(), this.textColor(4), this.textColor(6));

    this.renderQuestStatus(quest.status());

    // REWARD
    if (quest.hasReward()) {
        this.renderQuestReward(quest.reward(), !quest.completed());
    }
};
/**
 * @param {String|String[]} text 
 * @param {Number} y 
 */
QuestDetailWindow.prototype.renderQuestDetail = function (text, y) {
    if (typeof text === 'string') {
        this.drawTextEx(text, 0, y + this.lineHeight(), this.contentsWidth());
    }
    else if (Array.isArray(text)) {
        for (var i = 0; i < text.length; i++) {
            this.drawTextEx(text[i], 0, y + (this.lineHeight() * (i + 1)), this.contentsWidth());
        }
    }
};
/**
 * 
 * @param {QuestStage[]} stages 
 * @param {Boolean} hideInactive 
 */
QuestDetailWindow.prototype.renderQuestStages = function (stages, hideInactive ) {
    var _debugHidden = false;
    var _debug = QuestMan.debug();
    var line_height = this.lineHeight();
    var base_line = this.baseLine();
    y = this.contentsHeight() - (line_height * 2) - (line_height + 8) * stages.length;
    var _renderer = this;
    stages.forEach(function (stage) {
        if (_debugHidden) {
            _renderer.debugItemOpacity();
        }
        else if (stage.active()) {
            _renderer.drawIcon(QuestMan.icon('active'), 0, y + 4);
            _renderer.changeTextColor(_renderer.normalColor());
        }
        else {
            _renderer.drawIcon(QuestMan.icon('completed'), 0, y + 4);
            _renderer.completedItemOpacity();
        }
        _renderer.drawText(stage.title(true), 35, base_line + y);
        //_renderer.drawTextEx( text, 35, y , width - 35 );
        _renderer.changeTextColor(_renderer.normalColor());
        _renderer.changePaintOpacity(true);

        y += line_height + 8;

        if (_debug && !_debugHidden && hideInactive && stage.active()) {
            _debugHidden = true;
        }
    });
};
/**
 * @param {String} reward 
 * @param {Boolean} locked 
 */
QuestDetailWindow.prototype.renderQuestReward = function (reward, locked) {
    if (typeof locked === 'boolean' && locked) {
        this.changeTextColor(this.textColor(8));
    }
    var rewardTag = QuestMan.string('reward', '');
    this.drawTextEx(rewardTag.length > 0 ? `${rewardTag}: ${reward}` : reward, 0, this.contentsHeight() - this.lineHeight() - 4, this.contentsWidth());
};
/**
 * @param {Number} status 
 */
QuestDetailWindow.prototype.renderQuestStatus = function (status) {

    // STATUS
    switch (status) {
        case Quest.Status.Invalid:
            return;
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
    this.drawText(Quest.Status.display(status), 0, this.contentsHeight() - this.lineHeight() - 4, this.contentsWidth(), 'right');
    this.changeTextColor(this.normalColor());
};
/**
 * @description Empty quest window
 */
QuestDetailWindow.prototype.renderEmptyQuest = function () {

    var y = this.contentsHeight() / 3 - this.standardFontSize() / 2 - this.standardPadding();

    this.drawText("-- Empty log --", 10, y, this.contentsWidth(), 'center');

    this.changeTextColor(this.textColor(8));
    this.drawText("Left and Right to filter Quest Status", 0, y + 40, this.contentsWidth(), 'center');
    this.drawText("Up and Down to select Quest", 0, y + 80, this.contentsWidth(), 'center');
    this.drawText("Action to switch Quest Category filter", 0, y + 120, this.contentsWidth(), 'center');
    this.changeTextColor(this.normalColor(8));
};

(function (Q) {

    QuestManager_registerMenu();
    QuestManager_RegisterQuestData();
    QuestManager_registerCommands();
    QuestManager_registerEscapeCharacters();
    QuestManager_registerNewGame();

})( /* autorun */);

