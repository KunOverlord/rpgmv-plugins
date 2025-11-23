//=============================================================================
// KunQuestMan.js
//=============================================================================
/*:
 * @plugindesc Kun's Quest Manager
 * @filename KunQuestMan.js
 * @version 2.26
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
 *      quest_progress( quest , stage )
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
 *      quest_cancel( qust , silent )
 *          - Cancels a quest
 *          - Mutes the quest update if silent is true
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
 *      KunQuestMan update quest [ stage ] [ amount ( default is 1 )] [whenactive]
 *          - Updates a quest or a quest stage
 *          - Define the update amount if required to fill the stage objectives
 *      KunQuestMan complete [quest:quest:...] [stage]
 *          - Complete a quest and/ or quest stage
 *          - Complete a list of active ( running) quests when more than one are providen.
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
 *      KunQuestMan progress [gamevar] [quest|quest.stage]
 *          - Returns the quest status or the quest stage value
 *          - As quest stages can hold counters, the progress will return its value
 *          - Import the quest status or stage value into the providen gamevar
 * 
 *      KunQuestMan jumptoquest [LABEL:quest] [LABEL:quest:stage] [LABEL:quest:stage] [LABEL:quest]
 *          - Jump to the label providen when a quest or quest and quest stage is active
  * 
 *      KunQuestMan finished [gameVar] [quest1:quest2:quest3:...]
 *          - Count all finished (completed|failed) quests from the quest list into gameVar
 *      KunQuestMan unfinished [gameVar] [quest1:quest2:quest3:...]
 *          - Count all unfinished (ready|active) quests from the quest list into gameVar
 *      KunQuestMan status [gameVar] [quest1:quest2:quest3:...] [status]
 *          - Count all quests in the quest list matching the status into gameVar
 * 
 * 
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
 *      KunQuestMan mapstages [quest]
 *          - Prepares the list of active stages for an event label jump
 *      KunQuestMan jumptostage [default] [random]
 * 
 *      KunQuestMan remove [quest:quest:quest]
 *          - Removes all quest data related to quest in the saved state
 *          - Allows multiple quest names
 * 
 *      No quotation required here ;)
 * 
 * 
 * @param QuestCategories
 * @text Quest Categories
 * @desc Define a format for the quest categories
 * @type struct<Category>[]
 * @default []
 * 
 * @param QuestIcon
 * @parent QuestCategories
 * @text Default Quest Icon
 * @desc Default icon used for quest openers
 * @type Number
 * @default 0
 * 
 * @param ActiveIcon
 * @parent QuestCategories
 * @text Active Quest Icon
 * @desc Default icon used for Active quests
 * @type Number
 * @default 0
 * 
 * @param CompletedIcon
 * @parent QuestCategories
 * @text Completed Quest Icon
 * @desc Default icon used for Completed quests
 * @type Number
 * @default 0
 * 
 * @param FailedIcon
 * @parent QuestCategories
 * @text Failed Quest Icon
 * @desc Default icon used for Failed quests
 * @type Number
 * @default 0
 * 
 * @param QuestStartFX
 * @parent QuestCategories
 * @text Quest Start FX
 * @desc Default Audio used for new Quests
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param StageUpdateFX
 * @parent QuestCategories
 * @text Stage Update FX
 * @desc Default Audio used for Updated stages
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param QuestUpdateFX
 * @parent QuestCategories
 * @text Quest Update FX
 * @desc Default Audio used for Updated quests
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param QuestCompleteFX
 * @parent QuestCategories
 * @text Quest Complete FX
 * @desc Default Audio used for Completed quests
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param QuestFailFX
 * @parent QuestCategories
 * @text Quest Fail FX
 * @desc Default Audio used for Failed quests
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param RewardText
 * @parent QuestCategories
 * @text Reward Text
 * @desc Append this text to the reward messsage in the quest window
 * @type text
 * 
 * @param detailChars
 * @parent QuestCategories
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
/*~struct~Category:
 * @param category
 * @text Category
 * @desc Unique category name to organize the quests
 * @type text
 * @default Main
 * 
 * @param title
 * @text Category Title
 * @desc Category Text to show in the quest log header
 *
 * @param quests
 * @type struct<Quest>[]
 * @text Quests
 * @desc Define here all the quests for your category :)
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
 * @param location
 * @text Locations
 * @type text[]
 * @desc Set the currently active location for this stage
 */


function QuestMan() { throw new Error('This is a static class'); };
/**
 * Initialize all quest stuff
 * hooked in the game initializer
 * @return {QuestMan}
 */
QuestMan.setup = function () {
    return this.initialize();
    //return this.initialize().createPartyQuestData();
};
/**
 * @returns {Boolean}
 */
QuestMan.initialized = function(){
    return this.hasOwnProperty('_quests');
};
/**
 * Translation interface
 * @param {String} text_id 
 * @param {String} content 
 * @returns {String}
 */
QuestMan.Translate = function (text_id, content) {
    return typeof KunQuestLocale === 'function' ? KunQuestLocale.Translate(text_id, content) : content;
};
/**
 * @returns QuestMan
 */
QuestMan.initialize = function () {

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
    //initialize labels
    this.clearLabels();
    this._icons = {
        'active': parseInt(parameters.ActiveIcon),
        'completed': parseInt(parameters.CompletedIcon),
        'failed': parseInt(parameters.FailedIcon),
        'default': parseInt(parameters.QuestIcon)
    };
    this._media = {
        'start': parameters.QuestStartFX || '',
        'stage': parameters.StageUpdateFX || '',
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

    this.importContent(parameters.QuestCategories && parameters.QuestCategories.length ? JSON.parse(parameters.QuestCategories) : []);

    return this;
};
/**
 * @returns {Number}
 */
QuestMan.detailsLength = function () {
    return this._detailsLength;
};
/**
 * @returns {String}
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
 * @returns {Number}
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
    return this.initialized() ? this._quests.hasOwnProperty(name) : false;
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
 * @returns Boolean
 */
QuestMan.hasCategory = function( category ){
    return this._categories.hasOwnProperty(category);
};
/**
 * @param {String} category 
 * @param {Number} icon
 * @param {Number} color
 * @param {String} title
 * @returns QuestMan
 */
QuestMan.addCategory = function (category, icon, color, title ) {
    if (!this.hasCategory(category)) {
        this._categories[category] = {};
    }
    this._categories[category].icon = typeof icon === 'number' && icon ? icon : 0;
    this._categories[category].color = typeof color === 'number' ? color : 0;
    this._categories[category].title = typeof title === 'string' && title.length > 0 ? title : category;
    return this;
};
/**
 * @param {Object} input 
 * @returns {QuestMan}
 */
QuestMan.importContent = function (input) {
    (Array.isArray(input) ? input : []).filter(c => c.length > 0).map(c => JSON.parse(c)).forEach(function (c) {
        var category = c.category.toLowerCase().replace(/[\s_]+/g);
        //register category
        QuestMan.addCategory(
            category,
            typeof c.icon === 'string' && c.icon.length > 0 ? parseInt(c.icon) : 0,
            typeof c.color === 'string' && c.color.length > 0 ? parseInt( c.color ) : 0,
            QuestMan.Translate('category', c.title) );
        //Add quests
        QuestMan.importQuests(c.quests.length > 0 ? JSON.parse(c.quests) : [] , category );
    });
    return this;
};
/**
 * @param {String} category 
 * @returns {Number}
 */
QuestMan.getCategoryIcon = function (category) {
    return this.hasCategory(category) ? this.categories()[category].icon : this.icon('default');
};
/**
 * @param {String} category 
 * @returns {Number}
 */
QuestMan.getCategoryColor = function (category) {
    return this.hasCategory(category) ? this.categories()[category].color : 0;
};
/**
 * @param {String} category 
 * @returns {String}
 */
QuestMan.getCategoryTitle = function( category ){
    return this.hasCategory(category) ? this.categories()[category].title : category;
};
/**
 * @param {Object} input 
 * @returns QuestMan
 */
QuestMan.importQuests = function (input , category ) {

    (Array.isArray(input) ? input : []).filter(q => q.length > 0).map(q => JSON.parse(q)).forEach(function (q) {
        var quest = new Quest(
            q.Key,
            q.Title,
            //q.Category,
            category,
            //q.Details || '',
            (q.Details || '').replace(/\\\\/g, "\\").replace(/\"/g, ""),
            //(q.Details || '').replace(/\\n/g, " ").replace(/\"/g, ""),
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
                stage.hasOwnProperty('location') && stage.location.length ? JSON.parse(stage.location) : [],
            );
        });
        QuestMan.addQuest(quest);
    });
    return this;
};
/**
 * @returns {Game_QuestData}
 */
QuestMan.data = function () {
    return $gameQuestData;
    //return $gameParty.QuestData();
};
/**
 * @returns {Boolean}
 */
QuestMan.hasData = function(){
    return this.data() instanceof Game_QuestData;
};
/**
 * @param {String} status 
 * @return {QuestMan}
 */
QuestMan.setMenuStatus = function (status = QuestMan.MenuStatus.Active ) {
    if( this.hasData() ){
        this.data().setMenu(status);
    }
    return this;
};
/**
 * @returns {Boolean}
 */
QuestMan.isMenuEnabled = function () {
    return this.data() && this.data().menu() === QuestMan.MenuStatus.Enabled;
    //return this.hasData() && this.data().isMenuEnabled();
}
/**
 * @returns {Boolean}
 */
QuestMan.isMenuVisible = function () {
    return this.data() && this.data().menu() !== QuestMan.MenuStatus.Hidden;
    //return this.hasData() && this.data().isMenuVisible();
}
/**
 * @returns Boolean
 */
QuestMan.isMuted = function () { return this._muted; };
/**
 * @param {String} media 
 * @returns {String}
 */
QuestMan.media = function (media) {
    return this._media.hasOwnProperty(media) ? this._media[media] : '';
};
/**
 * @param {Number} icon 
 * @returns {Number}
 */
QuestMan.icon = function (icon) {
    return this._icons.hasOwnProperty(icon) ? this._icons[icon] : 0;
};
/**
 * @param {String} string 
 * @returns {String}
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
 * @returns {QuestMan}
 */
QuestMan.Close = function () {
    if (this._scene !== null && this._scene instanceof QuestLogScene) {
        this._scene.terminate();
        this._scene = null;
    }
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
 * @returns {String}
 */
QuestMan.ParseName = function( name = ''){
    return name.toLowerCase();
};
/**
 * @returns QuestMan
 */
QuestMan.clearLabels = function(){
    this._labels = [];
    return this;
};
/**
 * @returns {String}[]
 */
QuestMan.labels = function(){
    return this._labels;
};
/**
 * @param {String} label 
 * @returns QuestMan
 */
QuestMan.addLabel = function( label ){
    if( typeof label === 'string' && label.length){
        this._labels.push(label.toUpperCase().replace(/[\s-]/g,'_'));
    }
    return this;
};
/**
 * @param {Boolean} random 
 * @returns {String}
 */
QuestMan.label = function( random ){
    if( this.labels().length > 0 ){
        return typeof random === 'boolean' && random ? this.labels()[Math.floor(Math.random() * this.labels().length)] : this.labels()[0];
    }
    return '';
};
/**
 * @param {String} quest 
 */
QuestMan.removeData = function( quest = '' ){
    if( $gameQuestData ){
        $gameQuestData.remove(quest);
    }
};


/**
 * Quest Data Contents
 */
/**
 * @type {Game_QuestData}
 */
var $gameQuestData = null;
/**
 * 
 */
function Game_QuestData() {
    this._data = {};
    this._menu = QuestMan.MenuStatus.Enabled;
}
/**
 * @returns {Boolean}
 */
Game_QuestData.prototype.hasData = function(){
    return Object.keys(this._data).length > 0;
};
/**
 * @returns {Object}
 */
Game_QuestData.prototype.data = function () {
    return this._data;
};
/**
 * @param {Boolean} list 
 * @returns {String[]|Object}
 */
Game_QuestData.prototype.quests = function( list = false ){
    return list ? Object.keys(this.data()) :  this.data();
}
/**
 * @param {String} quest_id 
 * @param {Number} status 
 * @returns {Game_QuestData}
 */
Game_QuestData.prototype.create = function( quest_id , status = Quest.Status.Hidden){
    if( !this.has(quest_id) ){
        this.data()[quest_id] = {
            'stages':{},
            'status':status,
        };
    }
    return this;
};
/**
 * @param {String} quest_id 
 * @param {String} stage_id 
 * @returns {Boolean}
 */
Game_QuestData.prototype.has = function (quest_id = '', stage_id = '' ) {
    if ( quest_id && this.data().hasOwnProperty(quest_id)) {
        if ( stage_id.length ) {
            return this.data()[quest_id].hasOwnProperty(stage_id);
        }
        return true;
    }
    return false;
};
/**
 * @param {String} quest_id 
 * @param {String} stage_id 
 * @param {Number} amount
 * @returns {Game_QuestData}
 */
Game_QuestData.prototype.set = function (quest_id, stage_id, amount = 0) {
    this.create(quest_id,Quest.Status.Active).data()[quest_id][stage_id] = amount;
    return this;
};
/**
 * @param {String} quest_id 
 * @param {String} stage_id 
 * @returns 
 */
Game_QuestData.prototype.get = function (quest_id= '', stage_id = '') {
    if (stage_id.length) {
        return this.has(quest_id, stage_id) ? this.data()[quest_id][stage_id] : 0;
    }
    return this.has(quest_id) ? this.data()[quest_id].status : Quest.Status.Hidden;
    //return this.has(quest_id) ? this.data()[quest_id].STATUS : Quest.Status.Hidden;
};
/**
 * Update quest and stage data
 * @param {String} quest_id 
 * @param {String} stage_id 
 * @param {Number} amount 
 * @returns {Number}
 */
Game_QuestData.prototype.update = function (quest_id, stage_id, amount = 1) {
    if (this.has(quest_id, stage_id)) {
        var value = this.get(quest_id, stage_id) + amount;
        this.set(quest_id, stage_id, value);
        return value;
    }
    return 0;
};
/**
 * @param {String} quest_id 
 * @returns {Number}
 */
Game_QuestData.prototype.status = function (quest_id) {
    return this.has(quest_id) ? this.data()[quest_id].status : Quest.Status.Hidden;
    //return this.has(quest_id) ? this.data()[quest_id].STATUS : Quest.Status.Hidden;
};
/**
 * @param {String} quest_id 
 * @param {Number} status 
 * @returns {Number}
 */
Game_QuestData.prototype.setStatus = function (quest_id, status = Quest.Status.Hidden) {
    if (this.has(quest_id)) {
        this.data()[quest_id].status = status;
        //this.data()[quest_id].STATUS = status;
    }
    else {
        //Allow setup on the fly
        this.data()[quest_id] = {
            'status': status,
            'stages': {},
        };
        //this.data()[quest_id] = { 'STATUS': status };
    }
    return this.data()[quest_id].status;
    //return this.data()[quest_id].STATUS;
};
/**
 * @param {String} quest_id 
 * @param {String[]} stages
 * @returns {Game_QuestData}
 */
Game_QuestData.prototype.reset = function (quest_id, stages) {
    this.data()[quest_id] = {'status': Quest.Status.Hidden ,'stages':{}};
    //this.data()[quest_id] = { 'STATUS': Quest.Status.Hidden };
    /*if (Array.isArray(stages)) {
        for (var s in stages) {
            this.set(quest_id, stages[s]);
            QuestMan.DebugLog(`Reset ${quest_id}.${stages[s]}...`);
        }
    }*/
    return this;
};
/**
 * @param {String} quest_id 
 * @returns {Game_QuestData}
 */
Game_QuestData.prototype.remove = function( quest_id ){
    if( this.has(quest_id)){
        delete this.data()[quest_id];
    }
    return this;
};
/**
 * Compatibility
 * @param {String} quest_id
 * @returns {Game_QuestData}
 */
Game_QuestData.prototype.register = function (quest_id) {
    return this.reset(quest_id);
};
/**
 * @param {String} name 
 * @returns {String[]}
 */
Game_QuestData.prototype.list = function (name = '') {
    return Object.keys(this.has(name) ? this.data()[name].stages : this.data());
    return this.has(name) ?
        Object.keys(this.data()[name]).filter(id => id !== 'STATUS') :
        Object.keys(this.data());
};
/**
 * @param {String} param 
 * @param {Boolean} value 
 * @returns {Game_QuestData}
 */
Game_QuestData.prototype.setMenu = function (status = QuestMan.MenuStatus.Enabled) {
    this._menu = status;
};
/**
 * @param {String} param 
 * @param {Boolean} value 
 * @returns {Game_QuestData}
 */
Game_QuestData.prototype.menu = function () {
    return this._menu;
};
/**
 * @returns Game_QuestData
 */
Game_QuestData.prototype.migrate = function(){
    //console.log( this._data);
    this._data = Game_QuestData.Migrate1( this._data );
    //console.log( this._data);
    return this;
};
/**
 * Migrates all saved quest data to a new format
 * @param {Object} input 
 * @returns Object
 */
Game_QuestData.Migrate1 = function( input ){
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
 * Prepare for next upgrade migration
 * Do not apply until new format is ready in all Game_QuestData class
 * @returns {Game_QuestData}
 */
Game_QuestData.prototype.migrate2 = function(){

    var check = Object.values(this.data()).filter( q => q.hasOwnProperty('STATUS') ).length;
    if( check === 0 ){
        // do not override if upgrade has been already performed
        QuestMan.DebugLog('Game_QuestData already was already upgraded. No more actions needed.');
        return this;
    }
    QuestMan.DebugLog('Performing Game_QuestData conversion ...');
    const quests = {};
    const data = this.data();
    Object.keys(data).forEach( quest => {
        var stages = {};
        Object.keys(data[quest]).filter( stage => stage !== 'STATUS').forEach(function(stage){
            stages[stage] = data[quest][stage];
        });
        quests[ quest ] = {
            'stages': stages,
            'status': data[quest].STATUS || Quest.Status.Hidden,
        };
    });
    //data overriden!
    this._data = quests;
    return this;
};
/**
 * @param {Boolean} removeOld 
 */
Game_QuestData.Migrate2 = function( removeOld = false ){
    if( $gameQuestData ){
        if( !$gameQuestData.hasData()){
            $gameQuestData._data = $gameParty._questData._data;
            $gameQuestData._menu = $gameParty._questData._menu;    
            if(removeOld){
                delete $gameParty._questData;
            }
        }
    }
};

/**
 * Register the quest data manager
 */
function QuestManager_RegisterQuestData() {
    /**
     * Initialize the quest data container
     */
    Game_Party.prototype.createQuestData = function () {
        if( this.canCreateQuestData() ){
            //backwards compatibility / quick import - Check if the previous release had _questData object definition and parse it to the new format
            var data = Game_QuestData.Migrate1( typeof this._questData === 'object' ? this._questData : { } );
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
     * @returns {Boolean}
     */
    Game_Party.prototype.canCreateQuestData = function(){
        return !(this._questData instanceof Game_QuestData);
    };
    /**
     * Quest Data Manager (update, save, load)
     * @returns {Game_QuestData}
     */
    Game_Party.prototype.QuestData = function () {
        return $gameQuestData || {};
        //return this._questData || {};
    };
};
/**
 * Hook the quest item common event
 */
function QuestManager_registerQuestItemEvent() {
    var _kunQuestMan_GainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function (item, amount, includeEquip) {
        _kunQuestMan_GainItem.call(this, item, amount, includeEquip);

        if (item && amount > 0) {
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
 * Obsolete, handle it all from KunQuestMan_SetupDataManager
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
 * DataManager to handle actor's attributes
 */
function KunQuestMan_SetupDataManager() {
    //CREATE NEW
    const _KunQuestMan_DataManager_Create = DataManager.createGameObjects;
    DataManager.createGameObjects = function () {
        _KunQuestMan_DataManager_Create.call(this);
        $gameQuestData = new Game_QuestData();
    };
    const _KunQuestMan_DataManager_Save = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function () {
        const contents = _KunQuestMan_DataManager_Save.call(this);
        contents.questData = $gameQuestData;
        return contents;
    };
    //LOAD
    const _KunQuestMan_DataManager_Load = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function (contents) {
        _KunQuestMan_DataManager_Load.call(this, contents);
        $gameQuestData = contents.questData || new Game_QuestData();
    };
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
        if ( ['KunQuestMan', 'QuestLog'].includes(command)) {
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
                        var stage = args.length > 2 ? args[2] : '';
                        args[1].split(':').forEach( quest => quest_complete(quest,stage));
                        //quest_complete(args[1], args.length > 2 ? args[2] : '');
                    }
                    break;
                case 'completeall':
                case 'completeAll':
                    if (args.length > 1) {
                        quest_complete_all( args[1] );
                    }
                    break;
                case 'fail': //backwards compatibility
                case 'cancel':
                    if (args.length > 1) {
                        var quests = args[1].split(':');
                        var silent = args.length > 2 && args[2] === 'silent';
                        quests.forEach(q => quest_cancel(q,silent));
                    }
                    break;
                case 'check':
                    if( args.length > 3 && !Number.isNaN(args[3])){
                        $gameSwitches.setValue( parseInt(args[3]) , quest_check( args[1] , args[2] ) );
                    }
                    break;
                case 'mapstages':
                    if( args.length > 1){
                        var stages = quest_map_to_labels( args[1] );
                        if( args.length > 2 ){
                            //count all stages into a game variable
                            $gameVariables.setValue(parseInt(args[2]),stages);
                        }
                    }
                    break;
                case 'tostage':
                    var label = QuestMan.label( args.includes('random') );
                    if( label.length ){
                        this.jumpToLabel( label );
                    }
                    else if( args.length > 1 && args[1] !== 'random' ){
                        this.jumpToLabel(args[1])
                    }
                    break;
                case 'jumptoquest':
                    var tags = args.slice(1)
                        .map( tag => tag.split(':'))
                        .filter( tag => tag.length > 1 && quest_active(tag[1] , tag.length > 2 && tag[2] || ''))
                        .map( tag => tag[0]);
                    if( tags.length ){
                        if( args.includes('random') && tags.length > 1 ){
                            this.jumpToLabel(tags[Math.floor(Math.random() * tags.length)]);
                        }
                        else{
                            this.jumpToLabel(tags[0]);
                        }
                    }
                    break;
                case 'finished':
                    if( args.length > 2){
                        var quests = args[2].split(':')
                            .map( quest => quest_status( quest ) )
                            .filter( status => status > Quest.Status.Active );
                        $gameVariables.setValue( parseInt(args[1]) , quests.length );
                    }
                    break;
                case 'unfinished':
                    if( args.length > 2){
                        var quests = args[2].split(':')
                            .map( quest => quest_status( quest ) )
                            .filter( status => status < Quest.Status.Completed );
                        $gameVariables.setValue( parseInt(args[1]) , quests.length );
                    }
                    break;
                case 'status':
                    if( args.length > 3){
                        var status = args[3];
                        var quests = args[2].split(':')
                            .map( quest => quest_status( quest ) )
                            .filter( s => s === status );
                        $gameVariables.setValue( parseInt(args[1]) , quests.length );
                    }
                    break;
                case 'progress':
                    if( args.length > 2 ){
                        var quest = args[2].split('.').map( q => QuestMan.ParseName(q));
                        $gameVariables.setValue( parseInt(args[1]), quest_progress( quest[0] , quest[1] || '') );
                    }
                case 'active':
                case 'running':
                    if( args.length > 2){
                        var quests = args[1].split(':')
                            .map( quest => quest_status( quest ) )
                            .filter( status => status === Quest.Status.Active );
                        $gameVariables.setValue( parseInt(args[2]) , quests.length );
                    }
                    break;
                case 'ready':
                    if( args.length > 2){
                        var quests = args[1].split(':')
                            .map( quest => quest_status( quest ) )
                            .filter( status => status === Quest.Status.Hidden );
                        $gameVariables.setValue( parseInt(args[2]) , quests.length );
                    }
                    break;
                case 'remaining':
                    if( args.length > 2 && !Number.isNaN(args[2])){
                        $gameVariables.setValue( parseInt(args[2]) , quest_remaining( args[1] ) );
                    }
                    break;
                case 'inventory':
                    if (args.length > 3) {
                        var item = args.includes('import') ? $gameVariables.value(parseInt(args[3])) : parseInt(args[3]);
                        quest_inventory(args[1],args[2],item);
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
                    $gameParty.migrateQuestData();
                    break;
                case 'migrate2':
                    Game_QuestData.Migrate2(args.includes('remove'));
                    $gameQuestData.migrate2();
                    break;
                case 'remove':
                    if( args.length > 1 ){
                        args[1].split(':').forEach( quest => {
                            QuestMan.removeData(QuestMan.ParseName(quest));
                        });
                    }
                    break;
            }
        }
    };

    // Jump to Label (avoid issues with KunCommands!!!)
    if( typeof Game_Interpreter.prototype.jumpToLabel !== 'function' ){
        /**
         * @param {String} labelName 
         * @returns {Boolean}
         */
        Game_Interpreter.prototype.jumpToLabel = function( labelName ) {
            for (var i = 0; i < this._list.length; i++) {
                var command = this._list[i];
                if (command.code === 118 && command.parameters[0] === labelName) {
                    this.jumpTo(i);
                    return true;
                }
            }
            return false;
        };    
    }
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
 * @param {Boolean} showIcon
 * @returns {String}
 */
Quest.prototype.title = function (showIcon = false) {
    return showIcon ? `\\\I[${this.icon()}] ${this._title}` : this._title;
};
/**
 * Backwards compatibility
 * @returns {String}
 */
Quest.prototype.displayTitle = function () { return this.title(true); };
/**
 * @returns string
 */
Quest.prototype.category = function () { return this._category };
/**
 * @returns string
 */
Quest.prototype.displayCategory = function(){
    return this._category;
};
/**
 * @param {Boolean} display
 * @returns string
 */
Quest.prototype.reward = function ( display = false ) {
    var rewardText = QuestMan.string('reward', '');
    return display && rewardText.length ? `${rewardText}: ${this._reward}` : this._reward;
};
/**
 * @returns Boolean
 */
Quest.prototype.hasReward = function () { return this._reward.length > 0; };
/**
 * @param {Boolean} display 
 * @returns {String}
 */
Quest.prototype.location = function( display ){
    var active = this.current();
    var location = active ? this.current().location() : [];
    return typeof display === 'boolean' && display ? location.join(', ') : location;
};
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
/*Quest.prototype.details = function () {

    var details = this._details.length > 0 ? this._details : '';

    if (this.behaviour() === Quest.Behaviour.Linear) {
        var stage = this.current();
        if (stage !== false) {
            details += stage.details();
        }
    }

    return details;
};*/
/**
 * @returns string
 */
Quest.prototype.details = function () {

    var details = this._details.length > 0 ? this._details + "\\n" : '';

    if (this.behaviour() === Quest.Behaviour.Linear) {
        var stage = this.current();
        if (stage) {
            details += stage.details();
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
    this.details().split("\\n").forEach(function (line) {
        line.split(' ').forEach(function (word) {
            if ( output.length && output[output.length - 1].length + word.length + 1 < wordLimit) {
                output[output.length - 1] += ' ' + word;
            }
            else {
                output.push(word);
            }
        });
        //libe break
        //output.push('');
    });

    return output;
}

/**
 * @returns Game_Party.QuestData
 */
Quest.prototype.data = function () {
    return QuestMan.data();
};
/**
 * @returns {Number}
 */
Quest.prototype.status = function () { return this.data().status(this.name()); };
/**
 * @returns {Number}
 */
Quest.prototype.completed = function () { return this.status() === Quest.Status.Completed; };
/**
 * @returns {Number}
 */
Quest.prototype.active = function () { return this.status() === Quest.Status.Active; };
/**
 * @returns {Number}
 */
Quest.prototype.failed = function () { return this.status() === Quest.Status.Failed; };
/**
 * @returns {Number}
 */
Quest.prototype.hidden = function () { return this.status() === Quest.Status.Hidden; };
/**
 * @returns {String}
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
 * @returns {Number}
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
 * @returns {Number}
 */
Quest.prototype.remaining = function () {
    return this.activeStages().length;
};
/**
 * @param {Boolean} list 
 * @returns Array | Object
 */
Quest.prototype.stages = function (list) {
    return typeof list === 'boolean' && list ? Object.values(this._stages) : this._stages;
};
/**
 * @returns QuestStage[]
 */
Quest.prototype.activeStages = function(){
    return this.stages(true).filter( stage => stage.active());
};
/**
 * @returns Array
 */
Quest.prototype.list = function () { return Object.keys(this.stages()); };
/**
 * @returns {Number}
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
        if (current && list.includes(current.name())) {
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
 * @returns {QuestStage}
 */
Quest.prototype.current = function () {
    if (this.status() === Quest.Status.Active) {
        //if( this.behaviour() === Quest.Behaviour.Linear || this.behaviour() === Quest.Behaviour.Default ){
        var stages = this.stages(true).filter(s => s.status() < Quest.Status.Completed);
        if (stages.length) {
            return stages[0];
        }
    }
    return null;
};
/**
 * @param {String} stage 
 * @param {String} title 
 * @param {String} details 
 * @param {Number} objective 
 * @param {String[]} locations
 * @returns {Quest}
 */
Quest.prototype.addStage = function (stage, title, details, objective, locations) {

    stage = QuestMan.ParseName(stage);

    if (!this.has(stage)) {
        this._stages[stage] = new QuestStage(
            this.name(),
            stage,
            title,
            details || "",
            objective || 1,
            locations
        );
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
        this.reset().set(Quest.Status.Active).notify('started.');
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
 * @returns {Number}
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
            if (stage && stage.active()) {
                if (this.isLinear() && typeof stage_id === 'string' && stage_id.length && stage_id !== stage.name()) {
                    //do nothing, linear quests can just be updated on their specific stage. Use current stage name or just questname to update it's curretn stage
                    QuestMan.DebugLog(`Only current quest stage can be updated in Linear Quest ${this.name()}`);
                    return this.status();
                }
                stage.update(amount || 1);
                QuestMan.DebugLog(`${this.name()}.${stage.name()}  ${stage.value()} / ${stage.objective()}`);
                if (this.remaining() > 0 || this.isOptional()) {
                    this.notify('updated').playMedia(stage.value() < stage.objective() ? 'stage' : 'update');
                }
                else {
                    this.set(Quest.Status.Completed).notify('completed').playMedia('complete').checkNext();
                }
            }
        }
    }
    return this.status();
};
/**
 * @param {String} stage_id (stage)
 * @returns {Quest}
 */
Quest.prototype.complete = function (stage_id = '') {
    if (this.active()) {
        if (this.has(stage_id)) {
            //if (this.stage(stage_id).complete() === Quest.Status.Completed) {
            if (this.stage(stage_id).complete().completed()) {
                if (this.remaining() === 0 && !this.isOptional()) {
                    //complete when no more stages are left and ain't optional
                    return this.complete();
                }
                this.notify('updated').playMedia('update');
                return true;
            }
        }
        else {
            this.set(Quest.Status.Completed);
            this.notify('completed').playMedia('complete').checkNext();
            if( this.hasReward()){
                QuestMan.notify(this.reward(true));
            }
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
    if( this.hasReward()){
        QuestMan.notify(this.reward(true));
    }
    return this;
};
/**
 * @param {Boolean} silent
 * @returns Quest
 */
Quest.prototype.cancel = function ( silent ) {
    //if (this.status() < Quest.Status.Completed) {
    //only change this quest status if running
    if( this.active() ){
        this.set(Quest.Status.Failed);
        if( !(typeof silent === 'boolean' && silent) ){
            this.notify('failed').playMedia('fail');
        } 
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
 * @returns {Quest}
 */
Quest.prototype.notify = function (message) {
    if( message.length ){
        message = this.title(true) + ' ' + message;
        QuestMan.notify( message);
    }
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
 * @returns {String}[]
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
 * @param {string | string[]} locations
 * @returns {QuestStage}
 */
function QuestStage(quest, stage, title, details, objective, locations) {
    this._quest = QuestMan.ParseName(quest);
    this._name = QuestMan.ParseName(stage);
    this._title = QuestMan.Translate(`${this._quest}.${this._name}.title`, title || stage);
    this._details = QuestMan.Translate(`${this._quest}.${this._name}.details`, details || '');
    this._objecive = objective || 1;
    this._locations = Array.isArray( locations ) ? locations : locations.split(',');

    return this;
};
/**
 * @returns {Game_QuestData}
 */
QuestStage.prototype.data = function () {
    return QuestMan.data();
};
/**
 * @param {Boolean} fullName show as QuestName.StageName (true) or only as StageName (false:default)
 * @returns {String}
 */
QuestStage.prototype.name = function (fullName) {
    return typeof fullName === 'boolean' && fullName ? this.quest() + '.' + this._name : this._name;
};
/**
 * @returns {String}
 */
QuestStage.prototype.title = function () { return this._title; };
/**
 * @param {Boolean} display
 * @returns {String}[]
 */
QuestStage.prototype.location = function( display ){
    return typeof display === 'boolean' && display ? this._locations.join(', ') : this._locations;
};
/**
 * @returns Boolean
 */
QuestStage.prototype.hasLocation = function(){
    return this._locations.length > 0;
};
/**
 * @returns {String}
 */
QuestStage.prototype.details = function () { return this._details; };
/**
 * @returns {String}
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
 * @returns {String}
 */
QuestStage.prototype.quest = function(){
    return this._quest;
};
/**
 * @returns {String}
 */
QuestStage.prototype.stageId = function () { return this._name; };
/**
 * @param {Boolean} display
 * @returns {String}
 */
QuestStage.prototype.title = function (display) {
    if (typeof display === 'boolean' && display) {
        return this.objective() > 1 ? `${this._title} ( ${this.value()} / ${this.objective()} )` : this._title;
    }
    return this._title;
};
/**
 * @returns {Number}
 */
QuestStage.prototype.value = function () { return this.data().get(this.quest(), this.name()); };
/**
 * @returns {Number}
 */
QuestStage.prototype.current = function () { return this.value(); };
/**
 * Complete this stage if still in progress
 * @returns {QuestStage}
 */
QuestStage.prototype.complete = function () {
    if (this.status() < Quest.Status.Completed) {
        this.data().set(this.quest(), this.name(), this.objective());
    }
    return this;
    //return this.status();
};
/**
 * Make an increment over the stage's status
 * @param {Number} amount
 * @returns {Number}
 */
QuestStage.prototype.update = function (amount) {
    if (this.status() === Quest.Status.Active) {
        var value = this.value() + ( typeof amount === 'number' && amount > 0 ? amount : 1);
        var points = value < this.objective() ? value : this.objective();
        this.data().set( this.quest(), this.name(), points );
        //if (this.status() === Quest.Status.Completed) { this.updateGameVar(); }
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
 * @returns {Number}
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


///////////////////////////////////////////////////////////////////////////////////////////////////
////    Functions
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @param {String} quest 
 * @param {String} status 
 * @returns {Number}
 */
function quest_check( quest , status ){
    if( typeof quest === 'string' && quest.length ){
        var name = quest.split('.');
        return Quest.CheckStatus( quest_status( name[0] , name.length > 1 ? name[1] : '' )).includes( status );
    }
    return false;
};
/**
 * @returns {String}[]
 */
function quest_categories(){
    return Object.keys( QuestMan.categories( ) );
}
/**
 * @param {String} status
 * @param {String} category
 * @returns {String}[]
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
 * @returns {Number}
 */
function quest_status(quest, stage = '') {
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    if (q !== null) {
        if ( stage.length) {
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
 * @returns {Number}
 */
function quest_progress( quest , stage = '' ){
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    if (q !== null) {
        if ( stage.length ) {
            var s = q.stage(QuestMan.ParseName(stage));
            return s !== null ? s.value() : 0;
        }
        q.status();
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
 * @param {String|String[]} quest
 * @param {String} stage
 * @returns Boolean
 */
function quest_active(quest, stage = '') {
    /*if( Array.isArray(quest)){
        //return how many of these quests are active
        var active = 0;
        quest.forEach( function( name ){
            var q = QuestMan.quest(QuestMan.ParseName(name));
            if( q !== null && q.active()){
                active++;
            }
        });
        return  active;
    }*/
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    //console.log(q);
    if (q !== null) {
        if (q.active()) {
            if (stage.length) {
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
 * @returns {Boolean}
 */
function quest_update(quest, stage = '', progress = 1) {
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    if (q !== null) {
        return q.update( stage.length ? QuestMan.ParseName(stage) : '', progress);
    }
    QuestMan.DebugLog('Invalid quest ID ' + quest);
    return false;
}
/**
 * Return the list of QuestStages left to complete. Will return 0 if the quest doesn't exist.
 * Backwards compatibility. Use quest_remaining() instead
 * @param {String} quest 
 * @returns {Number}
 */
function quest_stages_left(quest) {
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    return q !== null ? q.activeStages().map( stage => stage.name() ) : [];
}
/**
 * @param {String} quest 
 * @returns {Number}
 */
function quest_map_to_labels(quest){
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    if( q !== null ){
        QuestMan.clearLabels();
        q.activeStages().map( stage => stage.name() ).forEach( stage => QuestMan.addLabel(stage) );
        return QuestMan.labels().length;
    }
    return 0;
}
/**
 * Return the list of QuestStages left to complete. Will return 0 if the quest doesn't exist.
 * @param {String} quest 
 * @returns {Number}
 */
function quest_remaining(quest) {
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    return q !== null ? q.remaining() : 0;
}
/**
 * Complete a quest or quest stage
 * @param {String} name Quest or Quest.Stage ID
 * @param {String} stage
 * @returns {Boolean}
 */
function quest_complete(quest = '', stage = '') {

    var q = QuestMan.quest(QuestMan.ParseName(quest));
    if (q !== null) {
        return stage.length > 0 ?
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
 * @param {Boolean} silent
 */
function quest_cancel(quest , silent ) {
    var q = QuestMan.quest(QuestMan.ParseName(quest));
    if (q !== null) {
        q.cancel( silent );
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
 * @param {String} quest_id
 * @param {String} stage_id
 * @param {Number} item_id 
 * @returns {Boolean}
 */
function quest_inventory( quest_id = '', stage_id = '', item_id = 0) {
    const items = Object.keys($gameParty._items).map(id => parseInt(id)).filter( item => item === item_id );
    //sum all amounts of the selected item
    const amount = items.map( item => $gameParty._items[item]).reduce( (a , b) => a + b , 0);
    if( quest_id && stage_id && amount ){
        quest_update( QuestMan.ParseName( quest_id ) , QuestMan.ParseName( stage_id ) , amount);
        //QuestMan.onGetQuestItem(item_id, amount);
        QuestMan.DebugLog( `${quest_id}.${stage_id}: ${item_id}(${amount})` );
    }
    return amount > 0;
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
QuestCatWindow.prototype.categories = () => [''].concat(QuestMan.categories(true));

QuestCatWindow.prototype.nextCategory = function () {
    var _categories = this.categories();
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
    var text = this.category.length > 0 ? QuestMan.getCategoryTitle( this.category ) : 'All';
    var color = QuestMan.getCategoryColor(this.category);
    var icon = QuestMan.getCategoryIcon(this.category);
    //console.log( text, icon,color);
    if (icon > 0) {
        var base_line = Math.max((28 - this.standardFontSize()) / 2, 0);
        this.drawIcon(icon, 0, base_line);
    }
    this.changeTextColor(this.textColor(color));
    this.drawText(text, 0, 0, this.contentsWidth(), 'center');
    this.changeTextColor(this.normalColor());
    //console.log(this.category);
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
 * @returns {Number}
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
    this.drawText(QuestMan.getCategoryTitle(quest.category()), 40, base_line, width - 40, 'right');

    this.changeTextColor(this.textColor(24));

    var line = Math.max(32, this.lineHeight());

    this.drawHorzLine(line);

    this.renderQuestDetail(quest.displayDetail(QuestMan.detailsLength()), line);
    //this.drawHorzLine(line);

    //RENDER STAGES
    this.renderQuestStages(QuestMan.debug() || quest.status() > Quest.Status.Active ? quest.stages(true) : quest.visibleStages(), quest.isLinear() );

    this.drawGauge(0, this.contentsHeight() - 10 - this.lineHeight() * 2, width, quest.progress(), this.textColor(4), this.textColor(6));

    //if active, show curretn location, if completed, show reward
    if( quest.completed()  && quest.hasReward()) {
        this.renderQuestReward(quest.reward(true), !quest.completed());
    }
    else if(quest.active()){
        this.renderLocation(quest.location(true));        
    }
    //render right
    this.renderQuestStatus(quest.status());
};
/**
 * @param {String|String[]} text 
 * @param {Number} y 
 */
QuestDetailWindow.prototype.renderQuestDetail = function (text = '', y = 0) {
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
    this.drawTextEx(reward, 0, this.contentsHeight() - this.lineHeight() - 4, this.contentsWidth());
};
/**
 * @param {String} Location
 */
QuestDetailWindow.prototype.renderLocation = function (location) {
    if( typeof location === 'string' && location.length){
        this.changeTextColor(this.textColor(6));
        this.drawTextEx( 'Location: ' + location , 0, this.contentsHeight() - this.lineHeight() - 4, this.contentsWidth());
        this.changeTextColor(this.normalColor());    
    }
}
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

(function () {

    QuestMan.initialize();
    //new manager for new|load|save
    KunQuestMan_SetupDataManager();

    QuestManager_registerMenu();
    QuestManager_RegisterQuestData();
    QuestManager_registerCommands();
    //QuestManager_registerEscapeCharacters();
    //QuestManager_registerNewGame();

})( /* autorun */);

