//=============================================================================
// KunQuestLog.js
//=============================================================================
/*:
 * @plugindesc Kun's Quest Log Manager
 * @filename KunQuestLog.js
 * @version 1.04
 * @author KUN
 * 
 * @help
 * 
 * COMMANDS: 
 * 
 * QuestLog start {quest:quest:quest:...} [reset]
 *      Starts a quest or list of quests
 *      Set the reset flag to reset any already started quest
 * 
 * QuestLog restart {quest:quest:quest:...}
 *      Restarts a quest or list of quests
 * 
 * QuestLog reset {quest:quest:quest:...}  [start|restart]
 *      Resets a quest or list of quets
 *      Allows to restart the quest
 * 
 * QuestLog update {quest:stage}
 *      Updates a quest or an active quest stage
 * 
 * QuestLog complete {quest:quest:...}
 *      Complete a list of quests
 * 
 * QuestLog completeall {quest:quest:...}
 *      Completes all objectives and quests from a list of quests
 * 
 * QuestLog fail|cancel
 *      Fails a list of quests
 * 
 * QuestLog check
 * QuestLog mapstages
 * QuestLog tostage {quest:stage:stage:...} {fallback:fallback:...}
 *     Will jump to any active providen stage of a valid active quest
 *     If no stages are defined, current quest stage will be used instead
 *     If no valid active stages found, will jump to fallback labels
 * 
 * QuestLog jumpto {quest:stage:stage:stage} {fallback:fallback:...}
 *      Jumps to a label named with the active quest name or its stages
 *      If no quest or stages found, fallback labels will be used
 * 
 * QuestLog status
 * QuestLog finished
 * QuestLog unfinished
 * QuestLog active
 * QuestLog running
 * QuestLog ready
 * QuestLog progress
 * QuestLog remaining
 * QuestLog inventory|items
 * QuestLog menu
 * 
 * QuestLog display|show {quest}
 *      Shows the quest log scene
 *      provide a quest to load a quest view straiht
 * 
 * QuestLog mute|silenced|notify
 *      Toggles quest update notification
 * 
 * QuestLog updateif {quest:stage:stage:...} {label:label:...} {fallback:fallback:...}
 *      Complete a given quest or any of the quest stages as active
 *      Jump to success labels if succeeds
 *      Jump to fallback labels if fails
 * 
 * QuestLog completeif {quest:stage:stage:...} {label:label:...} {fallback:fallback:...}
 *      Complete a given quest or any of the quest stages as active
 *      Jump to success labels if succeeds
 *      Jump to fallback labels if fails
 * 
 * QuestLog commands
 *      List all commands available (only in debug mode)
 * 
 * 
 * 
 * @param debug
 * @text Debug Mode
 * @desc Show debug info and hidden quests
 * @type boolean
 * @on Enable
 * @off Disable
 * @default false
 * 
 * @param kqmSupport
 * @type boolean
 * @text KunQuestMan compatibility
 * @desc Activate to import and migrate quests from KunQuestMan plugin format
 * @default false
 * 
 * @param kqmCalls
 * @parent kqmSupport
 * @type boolean
 * @text Kunquestman functions
 * @desc Activate to enable some KunQuestMan functions for compatibility
 * @default false
 * 
 * @param categories
 * @text Quest Categories
 * @desc Define a format for the quest categories
 * @type struct<Category>[]
 * @default []
 * 
 * @param icons
 * @text Icons
 * @desc Quest icons in order: default,active,completed,failed,category
 * @type number[]
 * 
 * @param sounds
 * @text Sounds
 * @desc Quest sounds in order: quest,update,complete,cancel
 * @type file[]
 * @require 1
 * @dir audio/se/
 * 
 * @param rewardText
 * @text Reward Text
 * @desc Append this text to the reward messsage in the quest window
 * @type text
 * 
 * @param detailChars
 * @text Detail's length
 * @desc Define the line length of the quest and stage details.
 * @type number
 * @default 50
 * 
 * @param commandMenu
 * @text Display in Player Menu
 * @desc Select the questlog status in Command Menu
 * @type select
 * @option Enabled
 * @value enabled
 * @option Disabled
 * @value disabled
 * @option Hidden
 * @value hidden
 * @default enabled
 * 
 * @param menuText
 * @parent commandMenu
 * @text Player Menu Text
 * @desc Show this text in menu to topen the Quest Log
 * @type text
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
 */
/*~struct~Category:
 * @param category
 * @text Category
 * @desc Unique category name to organize the quests
 * @type text
 * @default main
 * 
 * @param title
 * @text Category Title
 * @desc Category Text to show in the quest log header
 * @default Main
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
 * @param quest
 * @text Quest Name
 * @type text
 * @desc Unique quest name (ie: mainquest01 )
 * @default newquest01
 * 
 * @param title
 * @type text
 * @default New Quest
 * 
 * @param details
 * @text Details
 * @desc Add here the quest description
 * @type note
 *
 * @param type
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
 * @param icon
 * @type number
 * @default 0
 *
 * @param stages
 * @text Quest Stages
 * @desc add all stages here
 * @type struct<Stage>[]
 */
/*~struct~Stage:
 * @param stage
 * @text Stage Name
 * @type text
 * @desc Unique stage key within this quest (ie: getcoins01 )
 * @default stage01
 * 
 * @param title
 * @type text
 * @default New Stage
 *
 * @param details
 * @type note
 * @desc Type in quest progress details here
 *
 * @param objective
 * @desc Define the number of objectives to fulfill in this stage (ie: get 10 coins), default is 1.
 * @type number
 * @min 1
 * @max 999
 * @default 1
 * 
 * @param changeStatus
 * @text Set Quest Status
 * @desc change quest status on complete this stage
 * @type list
 * @option None
 * @value none
 * @option Complete
 * @value completed
 * @option Cancel
 * @value cancel
 * @option Reset
 * @value reset
 * @default none
 * 
 * @param actions
 * @text Run Actions
 * @desc Run these actions when this stage is set
 * @type struct<Action>[]
 * 
 * @param location
 * @text Locations
 * @type text[]
 * @desc Set the currently active location for this stage
 * 
 * @param bindItems
 * @text Quest Items
 * @desc Check for these invetory items to update the stage progress   
 * @type item[]
 */
/*~struct~Reward:
 * @param reward
 * @text Reward
 * @type text
 * 
 * @param icon
 * @text Reward Display Icon
 * @desc Show some cute icon on popup the reward
 * 
 * @param coins
 * @text Reward Coins
 * @type number
 * @min 0
 * @default 0
 * 
 * @param items
 * @text Reward Items
 * @type item[]
 * @default 0
 * 
 * @param actions
 * @text Reward Actions
 * @type struct<Action>
 * @desc Toggle switches and game variables
 */
/*~struct~Action:
 * @param gamevar
 * @text Update Variable
 * @type variable
 * @min 0
 * 
 * @param value
 * @type number
 * @text Amount
 * @min 0
 * @default 0
 * 
 * @param operator
 * @text Operator
 * @type list
 * @option Set
 * @value set
 * @option Add
 * @value add
 * @option Substract
 * @value sub
 * @default set
 * 
 * @param on
 * @text Switch ON
 * @desc mark ON all these switches
 * @type switch[]
 * 
 * @param off
 * @text Switch Off
 * @desc Mark OFF all these switches
 * @type switch[]
 */

/**
 * @class {QuestLog}
 */
class QuestLog {
    /**
     * @returns {QuestLog}
     */
    constructor() {
        if (QuestLog.__instance) {
            return QuestLog.__instance;
        }
        QuestLog.__instance = this.initialize();
    }
    /**
     * @returns {QuestLog}
     */
    initialize() {

        const _parameters = QuestLog.pluginData();
        //console.log( parameters);
        this._categories = [
            //quest category definitions
        ];
        this._questData = [
            //here will be the base quest templates
        ];
        this._quests = [
            //this is the list of gameplay quests (for status loading/saving)
        ];

        this._debug = _parameters.debug || false;
        this._kqmSupport = _parameters.kqmSupport || false;
        this._kqmCalls = _parameters.kqmCalls || false;
        this._jumpTo = _parameters.enableJumpTo || false;
        this._itemEvent = _parameters.onGetQuestItemEvent || 0;
        this._itemVar = _parameters.itemVarId || 0;
        this._amountVar = _parameters.amountVarId || 0;
        this._detailsLength = _parameters.detailChars || 50;
        this._settings = { menu: _parameters.commandMenu || QuestLog.Menu.Enabled, };
        this._muted = false;
        this._layoutSize = 4;
        this._icons = {
            default: _parameters.icons[0] || 0,
            active: _parameters.icons[1] || 0,
            completed: _parameters.icons[2] || 0,
            failed: _parameters.icons[3] || 0,
        };
        this._media = {
            start: _parameters.sounds[0] || '',
            update: _parameters.sounds[1] || '',
            complete: _parameters.sounds[2] || '',
            fail: _parameters.sounds[3] || '',
        };
        this._strings = {
            command: _parameters.menuText || '',
            reward: _parameters.rewardText || '',
        };

        return this.importContent(_parameters.categories || []);
    }
    /**
     * @returns {Boolean}
     */
    debug() { return this._debug; }
    /**
     * @returns {Boolean}
     */
    parseQuestMan(){ return this._kqmSupport; }
    /**
     * @returns {Boolean}
     */
    questManCalls(){ return this._kqmCalls; }
    /**
     * @returns {Boolean}
     */
    enableJumpTo() { return this._jumpTo; }
    /**
     * @returns {String}
     */
    setting(setting = '') { return setting && this._settings[setting] || ''; '' }
    /**
     * @setting {String} setting 
     * @param {String|Number|Boolean|Object} value 
     * @returns {QuestLog}
     */
    set(setting, value = '') {
        if (this._settings.hasOwnProperty(setting)) {
            this._settings[setting] = value;
        }
        return this;
    };
    /**
     * @param {Object} data 
     * @returns {QuestLog}
     */
    loadData(data = null) {
        this.reset();
        if (data) {
            const quests = data.quests || {};
            const settings = data.settings || {};
            Object.keys(settings).forEach( name => this.set(name,settings[name]));
            Object.keys( quests ).forEach(name => {
                const quest = this.quest(name) || null;
                if (quest) {
                    const content = quests[name];
                    const stagedata = content.stages || {};
                    quest.set(content.status || Quest.Status.Hidden);
                    quest.load( stagedata );
                }
            });
        }
        return this;
    }
    /**
     * Backwards compatibility with KunQuestMan plugin, parse save data into load method
     * @param {Object} data 
     * @returns {Object}
     */
    loadQuestMan( data = null ){
        //console.log(data);
        const menustatus = data._menu || this.setting('menu');
        const questdata = data._data || {};
        const quests = {};
        Object.keys(questdata).forEach( quest => {
            const content = questdata[quest];
            //console.log(quest,content,Object.keys(content));
            const stages = {};
            Object.keys(content).filter( key => !['status','stages'].includes(key)).forEach( key => stages[key] = content[key] );
            quests[quest] = {
                'stages': stages,
                'status': content.status || Quest.Status.Hidden,
            };
        });
        const content = data instanceof Object && {
            'quests': quests,
            'settings': {'menu': menustatus }
        } || null;
        QuestLog.DebugLog(`Parsing KunQuestMan plugin save data into QuestLog ...`, content);
        return this.loadData(content);
    }
    /**
     * @returns {Object}
     */
    content() {
        const quests = {};
        this.quests().forEach(quest => quests[quest.name()] = quest.content());
        return {
            quests: quests,
            settings: this._settings
        };
    }

    /**
     * @param {Boolean} mapNames
     * @returns {QuestCategory[]|String[]}
     */
    categories(mapNames = false) {
        return mapNames ? this._categories.map(cat => cat.name()) : this._categories;
    }
    /**
     * @param {String} category 
     * @returns {QuestCategory}
     */
    category(category = '') {
        return this.categories().find(cat => cat.name() === category) || null;
    }
    /**
     * @returns {QuestData[]}
     */
    questData() { return this._questData; }
    /**
     * 
     */
    reset() { this._quests = []; }
    /**
     * @returns {Quest[]}
     */
    quests() { return this._quests; }
    /**
     * @returns {String[]}
     */
    list(){ return this.quests().map( q => q.name() ); }
    /**
     * @param {String} quest 
     * @returns {Boolean}
     */
    has(quest = '') { return quest && this.list().includes(quest); }
    /**
     * @param {String} name 
     * @returns {Quest|LinearQuest|OptionalQuest}
     */
    fromTemplate(name = '') {
        const base = name && this.questData().find(quest => quest.name() === name) || null;
        if (base) {
            const quest = this.fromType(base._name, base._title, base._details, base._icon, base._type);
            quest.categorize(base.category());
            base.stages().forEach(stage => quest.addStage(stage));
            this._quests.push(quest);
            return quest;
        }
        return null;
    }
    /**
     * @param {String} name 
     * @param {String} title 
     * @param {String} details 
     * @param {Number} icon 
     * @param {String} type 
     * @returns {Quest|LinearQuest|OptionalQuest}
     */
    fromType( name = '' , title = '' , details = '' , icon = 0 , type = ''){
        switch( type ){
            case Quest.Type.Linear:
                return new LinearQuest(name,title,details,icon);
            case Quest.Type.Optional:
                return new OptionalQuest(name,title,details,icon);
            default:
                return new Quest(name,title,details,icon);
        }
    }
    /**
     * Gets a quest from the game quests, or attempts to create it from the quest templates
     * @param {String} name
     * @returns {Quest|LinearQuest|OptionalQuest}
     */
    quest(name = '') { return this.quests().find(quest => quest.name() === name) || this.fromTemplate(name); };
    /**
     * @param {Object[]} content 
     * @returns {QuestLog}
     */
    importContent(content = []) {
        content.forEach(data => {
            const category = new QuestCategory(
                data.category,
                data.title || '',
                data.color || 0,
                data.icon || 0,
            );
            this._categories.push(category);
            this.importQuests(data.quests || [], category);
        });
        return this;
    }
    /**
     * @param {Object[]} content 
     * @param {QuestCategory} category
     * @returns {QuestInfo}
     */
    importQuests(content = [], category = null) {

        if (category) {
            content.forEach(data => {
                const quest = new QuestData(
                    data.quest,
                    data.title,
                    (data.details || '').replace(/\\\\/g, "\\").replace(/\"/g, ""),
                    data.icon,
                    data.type,
                );

                quest.categorize(category);
                this.importStages(data.stages || []).forEach(stage => quest.addStage(stage));
                this._questData.push(quest);
            });
        }

        return this;
    };
    /**
     * @param {Object[]} content 
     * @returns {StageData[]}
     */
    importStages(content = []) {
        return content.map(data => {
            const stage = new StageData(
                data.stage,
                data.title || '',
                (data.details || '').replace(/\\\\/g, "\\").replace(/\"/g, ""),
                data.objective || 0,
                data.changeStatus || '',
            );
            //add extra attributes here
            stage._location = data.location || [];
            stage._actions = this.importActions(data.actions || []);
            stage._rewards = this.importRewards(data.rewards || []);
            stage._items = data.bindItems || [];

            return stage;
        });
    }
    /**
     * @param {Object[]} input 
     * @returns {QuestAction[]}
     */
    importActions( input = []){
        return input.map( content => new QuestAction(
            content.gamevar || 0,
            content.value || 1,
            content.operator || QuestAction.Operator.Add,
            content.on || [],
            content.off || [],
        ));
    }
    /**
     * @param {Object[]} input 
     * @returns {RewardItem[]}
     */
    importItems( input = [] ){ return input.map( id => new RewardItem( id , 'item') ); }
    /**
     * @param {Object[]} input 
     * @returns {RewardItem[]}
     */
    importArmors( input = [] ){ return input.map( id => new RewardItem( id , 'armor') ); }
    /**
     * @param {Object[]} input 
     * @returns {RewardItem[]}
     */
    importWeapons( input = [] ){ return input.map( id => new RewardItem( id , 'weapon') ); }
    /**
     * @param {Object[]} input 
     * @returns {QuestReward[]}
     */
    importRewards( input = []){
        return input.map( content => {
            const reward = new QuestReward(
                content.reward || '',
                content.icon || 0,
                content.coins || 0,
            );
            this.importItems( content.items || [] ).forEach( item => reward._items.push(item));
            //this.importArmors( content.armors || [] ).forEach( item => reward._items.push(item));
            //this.importWeapons( content.weapons || [] ).forEach( item => reward._items.push(item));
            reward._actions = this.importActions(content.actions || []);
            return reward;
        });
    }



    /**
     * @returns {Number}
     */
    itemEvent() { return this._itemEvent; }
    /**
     * @returns {Number}
     */
    detailsLength() { return this._detailsLength; };
    /**
     * @param {Boolean} reset
     * @returns {Object}
     */
    importSelected(reset = false) {

        if (this._selected.length > 0) {

            var quest = this.quest(this._selected);
            if (reset) {
                this._selected = '';
            }
            return quest;
        }
        return null;
    };
    /**
     * @param {String} name 
     * @returns {QuestLog}
     */
    selectQuest(name = '') {
        this._selected = name || '';
        return this;
    };
    /**
     * @returns {Number}
     */
    layoutSize() { return this._layoutSize; };
    /**
     * @param {String} category 
     * @returns {Boolean}
     */
    hasCategory(category) { return this._categories.hasOwnProperty(category); };
    /**
     * @param {String} category 
     * @returns {Number}
     */
    categoryIcon = function (category) {
        return this.hasCategory(category) ? this.categories()[category].icon : this.icon('default');
    };
    /**
     * @param {String} category 
     * @returns {Number}
     */
    categoryColor = function (category) {
        return this.hasCategory(category) ? this.categories()[category].color : 0;
    };
    /**
     * @param {String} category 
     * @returns {String}
     */
    getCategoryTitle = function (category) {
        return this.hasCategory(category) ? this.categories()[category].title : category;
    };
    /**
     * @returns {Boolean}
     */
    muted() { return this._muted; };
    /**
     * @param {String} media 
     * @returns {String}
     */
    media(media = '') {
        return media && this._media.hasOwnProperty(media) ? this._media[media] : '';
    };
    /**
     * @param {Number} icon 
     * @returns {Number}
     */
    icon(icon) {
        return this._icons.hasOwnProperty(icon) ? this._icons[icon] : 0;
    };
    /**
     * @param {String} string 
     * @returns {String}
     */
    string(string) {
        return this._strings && this._strings.hasOwnProperty(string) ? this._strings[string] : string;
    };



    /**
     * @param {String} type 
     * @returns {QuestLog}
     */
    playMedia(type = '') {
        if (type && !this.muted()) {
            const media = this.media(type);
            AudioManager.playSe({ name: media, pan: 0, pitch: 100, volume: 100 });
        }
        return this;
    };
    /**
     * @param {Number} item_id
     * @param {Number} amount
     * @returns {QuestLog}
     */
    onQuestItem(item_id, amount) {
        if (this._itemEvent) {
            if (this._itemVar) {
                $gameVariables.setValue(this._itemVar, item_id || 0);
                if (this._amountVar) {
                    $gameVariables.setValue(this._amountVar, amount || 0);
                }
            }
            $gameTemp.reserveCommonEvent(this._itemEvent);
        }
        return this;
    };
    /**
     * @param {String} message
     * @returns {QuestLog}
     */
    notify(message = '') {

        if (!this.muted()) {
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
     * @returns {QuestLog}
     */
    mute(mute = true) {
        this._muted = mute;
        return this;
    };
    /**
     * @param {*} content 
     */
    static DebugLog() {
        if (QuestLog.manager().debug()) {
            console.log('[ KunQuestMan ]', ...arguments);
        }
    };


    /**
     * Quest Shortcuts
     * @param {String} quest 
     * @returns {Boolean}
     */
    static QuestReady(quest = '') {
        const q = QuestLog.manager().quest(quest);
        return !!q && q.ready();
    }
    /**
     * Quest Shortcuts
     * @param {String} quest 
     * @param {String} stage 
     * @returns {Boolean}
     */
    static QuestActive(quest = '',stage ='') {
        const q = QuestLog.manager().quest(quest);
        if( q ){
            if( stage ){
                const s =  q.stage(stage);
                return !!s && s.active();
            }
            else{
                return q.active();
            }
        }
        return false;
    }
    /**
     * Quest Shortcuts
     * @param {String} quest 
     * @param {String} stage 
     * @returns {Boolean}
     */
    static QuestCompleted(quest = '',stage ='') {
        const q = QuestLog.manager().quest(quest);
        if( q.active() ){
            if( stage ){
                return q.update( stage );
            }
            else{
                return q.complete();
            }
        }
        return false;
    }
    /**
     * Quest Shortcuts
     * @param {String} quest 
     * @returns {Boolean}
     */
    static QuestStart(quest = '') {
        const q = QuestLog.manager().quest(quest);
        return !!q && q.start();
    }
    /**
     * Quest Shortcuts
     * @param {String} quest 
     * @param {String} stage 
     * @returns {Boolean}
     */
    static QuestComplete(quest = '',stage ='') {
        const q = QuestLog.manager().quest(quest);
        if( q.active() ){
            const s = q.stage(stage);
            return s && s.completed() || q.completed();
        }
        return false;
    }
    /**
     * Quest Shortcuts
     * @param {String} quest 
     * @returns {Boolean}
     */
    static QuestCancel(quest = '') {
        const q = QuestLog.manager().quest(quest);
        return !!q && q.cancel();
    }

    /**
     * Quest Menu
     * @returns {Boolean}
     */
    static isEnabled() {
        return QuestLog.manager().setting('menu') === QuestLog.Menu.Enabled;
    }
    /**
     * Quest Menu
     * @returns {Boolean}
     */
    static isVisible() {
        return QuestLog.manager().setting('menu') !== QuestLog.Menu.Hidden;
    }
    /**
     * Quest Menu
     * @param {String} mode 
     * @returns {QuestLog}
     */
    static toggle(mode = '') {
        return QuestLog.manager().set('menu', mode).playMedia('update');
    };
    /**
     * Open Quest Log Scene
     * @param {String} quest
     */
    static Show(quest = '') {
        SceneManager.push(Scene_QuestLog);
        if (SceneManager.isSceneChanging()) {
            SceneManager.prepareNextScene(quest);
        }
    }

    /**
     * @returns {Object}
     */
    static pluginData() {

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
                if (Array.isArray(value)) {
                    return value.map(item => _kunPluginReaderV2(key, item));
                }
                const content = {};
                Object.keys(value).forEach(key => content[key] = _kunPluginReaderV2(key, value[key]));
                return content;
            }
            return value;
        };
        return _kunPluginReaderV2('KunQuestLog', PluginManager.parameters('KunQuestLog'));
    }
    /**
     * @returns {Boolean}
     */
    static command(command = '') {
        return ['kunquestman', 'questlog', 'questman'].includes(command.toLowerCase());
    };
    /**
     * @returns {QuestLog}
     */
    static manager() {
        return QuestLog.__instance || new QuestLog();
    }
}


/**
 * @type {QuestLog.Menu|String}
 */
QuestLog.Menu = {
    Enabled: 'enabled',
    Disabled: 'disabled',
    Hidden: 'hidden',
};



///////////////////////////////////////////////////////////////////////////////////////////////////
////    Quest Objects
///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class {QuestCategory}
 */
class QuestCategory {
    /**
     * @param {String} category 
     * @param {String} title 
     * @param {Number} color 
     * @param {Number} icon 
     */
    constructor(category = 'default', title = 'Default', color = 0, icon = 0) {
        this._name = category.toLowerCase().replace(/[\s_]+/g);
        this._title = title;
        this._color = color || 0;
        this._icon = icon || 0;
    }
    /**
     * @returns {String}
     */
    name() { return this._name; }
    /**
     * @returns {String}
     */
    title() { return this._title; }
    /**
     * @returns {Number}
     */
    color() { return this._color; }
    /**
     * @returns {Number}
     */
    icon() { return this._icon; }
}

/**
 * @param {String} name 
 * @param {String} title 
 * @param {String} category 
 * @param {String} details
 * @param {Number} icon 
 * @param {String} behaviour 
 * @param {String} next
 * @param {String} reward
 * @returns {QuestData}
 */
class QuestData {
    /**
     * @param {String} name 
     * @param {String} title 
     * @param {String} details 
     * @param {Number} icon 
     * @param {String} type 
     */
    constructor(name = 'quest', title = '', details = '', icon = 0, type = '') {

        this._category = null;

        this._name = name.toLowerCase().replace(/[\s_]+/g);
        this._title = title || '';
        this._details = details || '';
        this._icon = icon || 0;
        this._type = type || Quest.Type.Default;
        this._stages = [];
    }
    /**
     * @returns {QuestLog}
     */
    manager() { return QuestLog.manager(); }
    /**
     * @param {String} string 
     * @returns {String}
     */
    getString(string = '') { return this.manager().string(string); }

    /**
     * @param {QuestCategory} category 
     * @returns {QuestData}
     */
    categorize(category = null) {
        if (category instanceof QuestCategory && !this.category()) {
            this._category = category;
        }
        return this;
    }

    //public getters
    /**
     * @returns {String}
     */
    name() { return this._name; }
    /**
     * @param {Boolean} display
     * @returns {String}
     */
    title(display = false) {
        const icon = this.icon();
        return display && icon ? `\\\I[${icon}] ${this._title}` : this._title;
    }
    /**
     * @returns {String}
     */
    type() { return this._type; }
    /**
     * @returns {Boolean}
     */
    isLinear() { return this.type() === Quest.Type.Linear; }
    /**
     * @returns {Boolean}
     */
    isOptional() { return this.type() === Quest.Type.Optional; }
    /**
     * @returns {QuestCategory}
     */
    category() { return this._category; }
    /**
     * @returns {String}
     */
    categoryTitle() {
        return this.category() && this.category().title() || '';
    };
    /**
     * @returns {Number}
     */
    icon() { return this._icon; }
    /**
     * @returns {String}
     */
    details() { return this._details; }
    /**
     * @returns {StageData[]}
     */
    stages() { return this._stages; }
    /**
     * @returns {String[]}
     */
    list(){ return this.stages().map( stage => stage.name() ); }
    /**
     * @param {String} name
     * @returns {StageData}
     */
    stage(name) { return this.stages().find(stage => stage.name() === name) || null; }
    /**
     * @param {String} stage= ''
     * @returns {Boolean}
     */
    has(stage = '') { return this.list().includes(stage); }
    /**
     * @param {StageData} stage
     * @returns {QuestData}
     */
    addStage(stage = null) {
        if (stage instanceof StageData && !this.has(stage.name())) {
            this._stages.push(stage);
        }
        return this;
    }
};


/**
 * 
 */
class Quest extends QuestData {
    /**
     * @param {String} name
     * @param {String} title
     * @param {String} details
     * @param {Number} icon
     */
    constructor(name = '', title = '', details = '', icon = 0 ) {
        super(name, title, details, icon || 0 , Quest.Type.Default );
        this._status = Quest.Status.Hidden;
        //recursive quest support
        this._rounds = 0;
    }
    /**
     * @param {String} stage 
     * @returns {Boolean}
     */
    has(stage = '') { return this.stages().includes(stage); }
    /**
     * @param {Number} status 
     * @returns {Boolean}
     */
    is(status = Quest.Status.Active) { return this.status() === status; }
    /**
     * @returns {Number[]}
     */
    objectives() { return this.stages().map(stage => stage.objective()).reduce((a, b) => { a + b }, 0); };
    /**
     * @returns {Number[]}
     */
    amount() { return this.stages().map(stage => stage.value()).reduce((a, b) => { a + b }, 0); }
    /**
     * @returns {Number[]}
     */
    progress() { return this.amount() / parseFloat(this.objectives()) || 0; }
    /**
     * @param {String} category 
     * @returns {Boolean}
     */
    isCategory(category = '') { return !!this.category() && this.category().name() === category; }
    /**
     * @param {Number} status 
     * @returns {Boolean}
     */
    set(status = Quest.Status.Hidden) {
        if (this.status() !== status) {
            this._status = status;
            return true;
        }
        return false;
    }
    /**
     * Loads all data from saved game
     * @param {Object} stagedata 
     * @returns {Boolean}
     */
    load( stagedata = null ){
        if( stagedata instanceof Object ){
            const list = Object.keys(stagedata);
            this.stages()
                .filter(stage => list.includes(stage.name()))
                .forEach(stage => stage.set(stagedata[stage.name()] || 0));
            return true;
        }
        return false;
    }

    /**
     * @returns {Boolean}
     */
    hasReward() { return this.stages().some(stage => stage.rewards().length > 0); }
    /**
     * @todo Remove current (only available for linear)
     * @param {String} stage
     * @returns {String[]}
     */
    location( stage = '' ) {
        const stg = this.stage(stage);
        return stg && stg.location() || [];
    }
    /**
     * @todo Remove .current (only available for linear)
     * @param {String} stage 
     * @returns {Number}
     */
    checkItems( stage = '' ){
        const stg = this.stage(stage);
        return  stg && stg.checkItems() || 0;
    }
    /**
     * @todo Remove .current (only available for linear)
     * @param {String} stage 
     * @returns {Number}
     */
    items( stage = '' ){
        const stg = this.stage(stage);
        return stg && stg.items() || [];
    }
    /**
     * @returns {Number}
     */
    status() { return this._status; }
    /**
     * @returns {Boolean}
     */
    ready() { return this.status() === Quest.Status.Hidden; }
    /**
     * @returns {Boolean}
     */
    active() { return this.status() === Quest.Status.Active; }
    /**
     * @returns {Boolean}
     */
    completed() { return this.status() === Quest.Status.Completed; }
    /**
     * @returns {Boolean}
     */
    failed() { return this.status() === Quest.Status.Failed; }
    /**
     * @returns {Boolean}
     */
    finished() { return this.status() > Quest.Status.Active; }

    /**
     * @returns {QuestStage[]}
     */
    stages(){ return super.stages(); }
    /**
     * @param {String} name
     * @returns {QuestStage}
     */
    stage(name) { return super.stage(name); }
    /**
     * @param {StageData} stage 
     * @returns {Quest}
     */
    addStage( stage = null ){
        return super.addStage( stage instanceof QuestData && stage.clone() || null );
    }

    /**
     * @returns {QuestStage[]}
     */
    stagesActive(){ return this.stages().filter( stage => !stage.completed() ); }
    /**
     * @returns {QuestStage[]}
     */
    stagesCompleted() { return this.stages().filter(stage => stage.completed()); }
    /**
     * @returns {Number}
     */
    remaining() { return this.stagesActive().length; }
    /**
     * @returns {String}
     */
    activestage(){
        const stage = this.stagesActive()[0] || null;
        return stage && stage.name() || '';
    }

    /**
     * @param {QuestStage} stage
     * @returns {Boolean}
     */
    checkStage(stage = null) {
        if (stage instanceof QuestStage && stage.completed()) {
            stage.runActions().giveReward();
            switch (stage.whenCompleted()) {
                case StageData.CompleteStatus.Completed:
                    return this.complete();
                case StageData.CompleteStatus.Cancel:
                    return this.cancel();
                case StageData.CompleteStatus.Reset:
                    return this.reset();
            }
        }
        return false;
    }
    /**
     * @returns {Boolean}
     */
    onStagesCompleted() {
        if (this.stagesCompleted()) {
            if ([Quest.Type.Linear, Quest.Type.Default].includes(this.type())) {
                return this.complete()
            }
        }
        return false;
    }

    /**
     * @param {Boolean} start
     * @param {Boolean} silent
     * @returns {Boolean}
     */
    reset(start = false , silent = false ) {
        this.stages().forEach(stage => stage.set(0));
        if (this.set(start && Quest.Status.Active || Quest.Status.Hidden)) {
            start && this.notify('started.', !silent && 'start' || '');
            return true;
        }
        return false;
    }
    /**
     * @param {Boolean} mute
     * @param {Boolean} silent
     * @returns {Boolean}
     */
    start( mute = false , silent = false ) {
        if (this.ready()) {
            this.set(Quest.Status.Active);
            !mute && this.notify('started.', !silent && 'start' || '' );
        }
        return this.active();
    }

    /**
     * @param {String} stage 
     * @param {Number} amount 
     * @param {Boolean} silent
     * @returns {Boolean}
     */
    update(stage = '', amount = 0 , silent = false ) {
        const stageData = this.stage(stage );
        if (stageData) {
            if (stageData.update(amount)) {
                //completed stage (check when quest status chanegs)
                if (this.checkStage(stageData) || this.onStagesCompleted()) {
                    //notifications are handled within these methods    
                    return true;
                }
            }
            this.notify('updated', !silent && 'update' || '' );
            return true;
        }
        return false;
    }
    /**
     * @returns {Boolean}
     */
    complete(fullComplete = false , silent = false ) {
        if (fullComplete) {
            this.stages().forEach(stage => stage.complete());
        }
        if (!this.finished()) {
            //either no stage or last stage will compelte
            if (this.set(Quest.Status.Complete)) {
                this.notify('completed', !silent && 'complete' || '' );
                return true;
            }
        }
        return false;
    }
    /**
     * @param {Boolean} mute
     * @param {Boolean} silent
     * @returns {Boolean}
     */
    cancel( mute = false , silent = false ) {
        if (this.active() && this.set(Quest.Status.Failed)) {
            mute && this.notify('failed', !silent && 'fail' || '');
        }
        return this.failed();
    }

    /**
     * @param {String} message 
     * @param {String} media
     * @returns {Quest}
     */
    notify(message = '', media = '') {
        if (message) {
            this.manager().notify(this.title(true) + ' ' + message).playMedia(media);
        }
        return this;
    }

    /**
     * @returns {Object}
     */
    content() {
        const stages = {};
        this.stages().forEach(stage => stages[stage.name()] = stage.value());
        return {
            stages: stages,
            status: this.status(),
            //current: this.current(),
        };
    }
}
/**
 * @type {Quest.Status|Number}
 */
Quest.Status = {
    Invalid: 0,
    Hidden: 1,
    Active: 2,
    Completed: 3,
    Failed: 4
};
/**
 * @type {Quest.Type|String}
 */
Quest.Type = {
    Default: 'default',
    Linear: 'linear',
    Optional: 'optional',
};


/**
 * 
 */
class OptionalQuest extends Quest{
    /**
     * @param {String} name 
     * @param {String} title 
     * @param {String} details 
     * @param {Number} icon 
     */
    constructor( name = 'optional' ,title = '' , details = '' , icon = 0){
        super( name , title  , details , icon );
        this._type = Quest.Type.Optional;
    }
}

/**
 * 
 */
class LinearQuest extends Quest{
    /**
     * 
     * @param {String} name 
     * @param {String} title 
     * @param {String} details 
     * @param {Number} icon 
     */
    constructor( name = 'linear' ,title = '' , details = '' , icon = 0){
        super( name , title  , details , icon );
        this._type = Quest.Type.Linear;
        this._current = this.first();
    }
    /**
     * @param {Object} stagedata 
     * @returns {Boolean}
     */
    load( stagedata = null ){
        if( super.load(stagedata)){
            //this._current = this.activestage() || this.first();
            this._current = this.activestage();
            return true;
        }
        return false;
    }
    /**
     * @param {QuestStage} stage 
     * @returns {Boolean}
     */
    checkStage( stage = null ){
        if( super.checkStage(stage) ){
            if( this.active()){
                //this.moveto(this.next());
                this.moveto(this.activestage());
                //mark to auto-complete
            }
            return true;
        }
        return false;
    }
    /**
     * @param {String} stage 
     * @param {Number} amount 
     * @param {Boolean} silent 
     */
    update( stage = '', amount = 1 , silent = false ){
        return super.update(stage || this.current(), amount , silent );
    }
    /**
     * @param {Boolean} start 
     * @param {Boolean} silent 
     * @returns {Boolean}
     */
    reset( start = false , silent = false ){
        if( super.reset( start,silent) ){
            this.moveto(this.first());
            return true;
        }
        return false;
    }
    /**
     * @param {Boolean} mute 
     * @param {Boolean} silent 
     * @returns {Boolean}
     */
    start( mute = false , silent = false ){
        if(super.start(mute,silent)){
            this.moveto(this.first());
            return true;
        }
        return false;
    }
    /**
     * @param {Boolean} mute 
     * @param {Boolean} silent 
     * @returns {Boolean}
     */
    cancel( mute = false , silent = false ){
        if( super.cancel(mute,silent)){
            this.moveto(Quest.Status.Failed);
            return true;
        }
        return false;
    }



    /**
     * @returns {String}
     */
    current() { return this._current; }
    /**
     * @param {String} stage 
     * @returns {Boolean}
     */
    moveto(stage = '') {
        if (this.has(stage) && stage !== this.current()) {
            this._current = stage;
            return true;
        }
        return false;
    }
    /**
     * @returns {String}
     */
    /*next() {
        return this.activestage();
        return this.list()[this.list().indexOf(this.current()) + 1] || '';
    }*/
    /**
     * @returns {String}
     */
    first() { return this.list()[0] || ''; }
}


/**
 * @param string quest
 * @param string stage
 * @param string title
 * @param string details
 * @param number objective
 * @param {string | string[]} locations
 * @returns {StageData}
 */
class StageData {
    /**
     * @param {String} stage 
     * @param {String} title 
     * @param {String} details 
     * @param {Number} objective 
     * @param {String} onComplete 
     * @returns {StageData}
     */
    constructor(stage = '', title = '', details = '', objective = 0, onComplete = '') {
        this._name = stage || 'stage';
        this._title = title || '';
        this._details = (details || '').replace(/\\n/g, " ").replace(/\"/g, "");
        this._objective = objective || 1;
        //this._value = 0;
        this._onComplete = onComplete || StageData.CompleteStatus.None;

        this._location = [];
        this._rewards = [];
        this._actions = [];
        this._items = [];

        return this;
    }
    /**
     * @returns {String}
     */
    name() { return this._name; }
    /**
     * @param {Boolean} display
     * @returns {String}
     */
    title(display = false) {
        const title = this._title || this.name();
        return display && this.objective() > 1 && `${title} ( ${this.objective()} / ${this.objective()} )` || title;
    };
    /**
     * @returns {Boolean}
     */
    visible() { return !!this._title; }
    /**
     * @returns {String[]}
     */
    location() { return this._location; }
    /**
     * @returns {QuestReward[]}
     */
    rewards() { return this._rewards; }
    /**
     * @returns {String}
     */
    details() { return this._details; }
    /**
     * @returns {Number}
     */
    objective() { return this._objective; }
    /**
     * @returns {StageData.CompleteStatus|String}
     */
    whenCompleted() { return this._onComplete; }
    /**
     * @returns {Number[]}
     */
    items() { return this._items; }
    /**
     * @returns {QuestAction[]}
     */
    actions() { return this._actions; }
    /**
     * @param {QuestAction} action 
     * @returns {StageData}
     */
    addAction(action = null) {
        if (action instanceof QuestAction) {
            this.actions().push(action);
        }
        return this;
    }
    /**
     * @returns {QuestStage}
     */
    clone() {
        const stage = new QuestStage(
            this._name,
            this._title,
            this._details,
            this._objective,
            this._onComplete
        );
        stage._location = [...this._location];
        stage._actions = [...this._actions];
        stage._rewards = [...this._rewards];
        stage._items = [...this._items];
        return stage;
    }
};
/**
 * @type {StageData.CompleteStatus|String}
 */
StageData.CompleteStatus = {
    None: 'none',
    Completed: 'completed',
    Cancel: 'cancel',
    Reset: 'reset',
}
/**
 * 
 */
class QuestStage extends StageData{
    /**
     * @param {String} stage 
     * @param {String} title 
     * @param {String} details 
     * @param {Number} objective 
     * @param {String} onComplete 
     */
    constructor( stage = '' , title = '' , details = '' , objective = 1 , onComplete = '' ){
        super(stage, title , details , objective , onComplete );
        this._value = 0;
    }

    /**
     * @returns {Number}
     */
    value() { return this._value; }

    /**
     * @returns {Number}
     */
    progress() { return this.value() / parseFloat(this.objective()); }
    /**
     * @param {Number} amount 
     * @returns {Boolean}
     */
    update(amount = 0) { return this.set(this.value() + amount).completed() }
    /**
     * @param {Number} value 
     * @returns {QuestStage}
     */
    set(value = 0) {
        this._value = Math.min(Math.max(value, 0), this.objective());
        return this;
    }
    /**
     * @returns {QuestStage}
     */
    complete() {
        this._value = this.objective();
        return this;
    }
    /**
     * @returns {Boolean}
     */
    completed() { return this.value() >= this.objective(); }
    /**
     * @returns {Boolean}
     */
    active(){ return !this.completed(); }
    /**
     * @returns {Number}
     */
    status() { return this.completed() ? Quest.Status.Completed : Quest.Status.Active; }
    /**
     * @returns {Number}
     */
    checkItems(){
        const questItems = this.items();
        const partyItems = Object.keys($gameParty._items).map(id => parseInt(id)).filter(item => questItems.includes(item));
        //sum all amounts of the selected item
        return partyItems.map(item => $gameParty._items[item]).reduce((a, b) => a + b, 0);
    }
    /**
     * @returns {QuestStage}
     */
    runActions() {
        this.actions().forEach(action => action.run());
        return this;
    }
    /**
     * @returns {QuestStage}
     */
    giveReward(){
        const rewards = this.rewards();
        if( rewards.length ){
            //select one reward randomly
            rewards[Math.floor(Math.random() * rewards.length)].run();
        }
        return this;
    }
}


/**
 * 
 */
class QuestAction {
    /**
     * @param {Number} gameVar 
     * @param {String} operator 
     * @param {Number} amount 
     * @param {Number[]} on 
     * @param {Number[]} off 
     */
    constructor(gameVar = 0, operator = '', amount = 0, on = [], off = []) {
        this._gameVar = gameVar || 0;
        this._operator = operator || QuestAction.Operator.Set;
        this._amount = amount || 0;
        this._on = on || [];
        this._off = off || [];
    }
    /**
     * @returns {QuestAction}
     */
    run() { return this.update().on().off(); }
    /**
     * @returns {QuestAction}
     */
    on() {
        this._on.forEach(gs => gs && $gameSwitches.setValue(gs, true));
        return this;
    }
    /**
     * @returns {QuestAction}
     */
    off() {
        this._off.forEach(gs => gs && $gameSwitches.setValue(gs, false));
        return this;
    }
    /**
     * @param {Boolean} asValue 
     * @returns {Number}
     */
    gameVar(asValue = false) {
        return asValue ? this._gameVar && $gameVariables.value(this._gameVar) || 0 : this._gameVar;
    }
    /**
     * @returns {String}
     */
    operator() { return this._operator; }
    /**
     * @returns {Number}
     */
    amount() { return this._amount; }
    /**
     * @returns {QuestAction}
     */
    update() {
        const gameVar = this.gameVar();
        if (gameVar) {
            switch (this.operator()) {
                case QuestAction.Operator.Set:
                    $gameVariables.setValue(gameVar, this.amount());
                    break;
                case QuestAction.Operator.Add:
                    $gameVariables.setValue(gameVar, this.gameVar(true) + this.amount());
                    break;
                case QuestAction.Operator.Substract:
                    $gameVariables.setValue(gameVar, Math.max(this.gameVar(true) + this.amount(), 0));
                    break;
            }
        }
        return this;
    }
}

/**
 * @type {QuestAction.Operator|String}
 */
QuestAction.Operator = {
    Add: 'add',
    Substract: 'sub',
    Set: 'set',
};

/**
 * 
 */
class QuestReward {
    /**
     * 
     * @param {String} reward 
     * @param {Number} icon 
     * @param {Number} coins 
     * @param {Number[]} items 
     */
    constructor(reward = '', icon = 0, coins = 0 ) {
        this._reward = reward || '';
        this._icon = icon || 0;
        this._coins = Math.max(0,coins || 0);
        this._items = [];
    }
    /**
     * @returns {String}
     */
    reward( showIcon = false ){
        return showIcon && `\\I[${this._icon}] ${this._reward}`  || this._reward;
    }
    /**
     * @returns {Number}
     */
    icon(){ return this._icon; }
    /**
     * @returns {Number}
     */
    coins(){ return this._coins; }
    /**
     * @returns {RewardItem[]}
     */
    items(){ return this._items; }
    /**
     * @returns {QuestReward}
     */
    run(){
        if(this.coins()){
            $gameParty.gainGold(this.coins());
        }
        this.items().forEach( item => item.get() );
        QuestLog.manager().notify(this.reward(true));
        return this;
    }
}
/**
 * 
 */
class RewardItem {
    /**
     * @param {Number} item 
     * @param {String} type 
     * @param {Number} amount 
     */
    constructor(item = 0, type = '', amount = 1) {
        this._item = item || 0;
        this._type = type || '';
        this._amount = amount || 1;
    }
    /**
     * @returns {Boolean}
     */
    get(){
        const item = this.content();
        if( item ){
            $gameParty.gainItem(item,this._amount);
            return true;
        }
        return false;
    }
    /**
     * @returns {Object}
     */
    content(){
        switch(this._type){
            case 'armor': return this.armor();
            case 'weapon': return this.weapon();
            case 'item': return this.item();
            default: return null;
        }
    }
    /**
     * @returns {Object}
     */
    armor(){ return $dataArmors[this._item] || null; }
    /**
     * @returns {Object}
     */
    weapon(){ return $dataWeapons[this._item] || null; }
    /**
     * @returns {Object}
     */
    item(){ return $dataItems[this._item] || null; }
}


/**
 * Hook the quest item common event
 */
function QuestLog_registerQuestItemEvent() {
    var _kunQuestMan_GainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function (item, amount, includeEquip) {
        _kunQuestMan_GainItem.call(this, item, amount, includeEquip);

        if (item !== null && amount > 0) {
            //console.log( `${item.name}: ${amount}` );
            QuestLog.manager().onQuestItem(item.id, amount);
        }
    }
};

/**
 * Register quest Manager Menu
 */
function QuestLog_RegisterMenu() {

    var _kunQuestMan_OriginalMenuCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function () {
        _kunQuestMan_OriginalMenuCommands.call(this);
        if (QuestLog.isVisible()) {
            this.addCommand(QuestLog.manager().string('command', 'Quests'), 'quest', QuestLog.isEnabled());
        }
    };
    var _kunQuestMan_CreateCommands = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function () {
        _kunQuestMan_CreateCommands.call(this);
        if (QuestLog.isEnabled()) {
            this._commandWindow.setHandler('quest', this.commandQuestLog.bind(this));
        }
    };
    Scene_Menu.prototype.commandQuestLog = function () {
        QuestLog.Show();
    };
};

/**
 * DataManager to handle actor's attributes
 */
function KunQuestMan_SetupDataManager() {
    //define single savedata content name
    const questlog = 'kunQuestLog';
    //CREATE NEW
    const _KunQuestMan_DataManager_Create = DataManager.createGameObjects;
    DataManager.createGameObjects = function () {
        _KunQuestMan_DataManager_Create.call(this);
        QuestLog.manager().loadData();
    };
    const _KunQuestMan_DataManager_Save = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function () {
        const contents = _KunQuestMan_DataManager_Save.call(this);
        contents[questlog] = QuestLog.manager().content();
        return contents;
    };
    //LOAD
    const _KunQuestMan_DataManager_Load = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function (contents) {
        _KunQuestMan_DataManager_Load.call(this, contents);
        if( contents.questData && !contents[questlog] && QuestLog.manager().parseQuestMan() ){
            //only import once, when quest log is not yet defined
            QuestLog.manager().loadQuestMan(contents.questData || null);
        }
        else{
            QuestLog.manager().loadData(contents[questlog] || null);
        }
    };
}



/**
 * Setup text dialogs
 */
function KunQuestLog_registerEscapeCharacters() {
    //Window_Base.prototype.JayaKSetup_escapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    const _KunQuestLog_EscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        const parsed = _KunQuestLog_EscapeCharacters.call(this, text);
        //include the quest names and stages here
        return parsed.replace(/\x1bQUEST\[(\s+)\]/gi, function () {
            //get quest Id
            return this.displayQuestData(parseInt(arguments[1]));
        }.bind(this));
    };

    Window_Base.prototype.displayQuestData = function (input) {
        const name = input.split('.');
        const quest = QuestLog.manager().quest(name[0]);
        if (quest) {
            const stage = name[1] && quest.stage(name[1]) || null;
            if (stage) {
                return stage && stage.title() && '[stage]';
            }
            return quest.title();
        }
        return '[quest]';
    };
};


/**
 * @class {KunQuestCommand}
 */
class KunQuestCommand {
    /**
     * @param {String[]} input 
     * @param {Game_Interpreter} context
     */
    constructor(input = [], context = null) {
        const command = this.initialize(input);
        this._command = command.length && command[0] || '';
        this._args = command.length > 1 && command.slice(1) || [];
        this._context = context instanceof Game_Interpreter && context || null;
        QuestLog.DebugLog( this.toString() );
    }
    /**
     * @returns {String}
     */
    toString(){
        return `${this.command().toUpperCase()} ${this.arguments().join(' ')} [${this._flags.join('|')}]`;
    }
    /**
     * @param {Game_Interpreter} context 
     * @param {String[]} input 
     * @returns {KunQuestCommand}
     */
    static create(context = null, input = []) {
        return context instanceof Game_Interpreter && new KunQuestCommand(input, context) || null;
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
        //return clean args array without flags
        return content.replace(regex, '').split(' ').filter(arg => arg.length);
    }
    /**
     * @returns {QuestLog}
     */
    manager() {
        return QuestLog.manager();
    }
    /**
     * @returns {Game_Interpreter}
     */
    context() {
        return this._context;
    }
    /**
     * @returns {Game_Event}
     */
    event() {
        return this.context().character() || null;
    }
    /**
     * @param {String} flag 
     * @returns {Boolean}
     */
    has(flag = '') {
        return flag && this._flags.includes(flag) || false;
    }
    /**
     * @param {String} mode 
     * @returns {KunCommandManager}
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
     * @returns {KunCommandManager}
     */
    wait(fps = 0) {
        if (this.context() && fps) {
            this.context().wait(fps);
        }
        //return this._wait;
        return this;
    }
    /**
     * @param {String[]} labels
     * @param {Boolean} random
     * @returns {Boolean} 
     */
    jumpToLabels(labels = [] , random = false ) {
        return random ?
            //jump to random labels in the list
            this.jumpToLabel( labels.length && labels[ Math.floor(Math.random() * labels.length) ] || '' ) :
            //jump to first available label in the list
            labels.find( lbl => this.jumpToLabel(lbl) ) || false;
    }
    /**
     * @param {String} labelName 
     * @returns {Boolean}
     */
    jumpToLabel(label = '') {
        const interpreter = this.context();
        if ( label && interpreter) {
            const tag = label.toUpperCase()
            for (let i = 0; i < interpreter._list.length; i++) {
                const command = interpreter._list[i];
                if (command.code === 118 && command.parameters[0] === tag) {
                    interpreter.jumpTo(i);
                    QuestLog.DebugLog( `Jumping to label ${tag}`);
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * @returns {String[]}
     */
    arguments() {
        return this._args;
    }
    /**
     * @returns {String}
     */
    command() {
        return this._command;
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
        KunCommands.DebugLog(`Invalid command ${this.toString()}`);
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    startCommand(args = []) {
        if (args.length) {
            const quests = args[0].split(':');
            const reset = this.has('reset');
            const mute = this.has('mute');
            let silent = false;
            quests.map(quest => this.manager().quest(quest))
                .filter(quest => !!quest)
                .forEach(quest =>{
                    reset && quest.reset(true) || quest.start(mute, silent );
                    //only play sound for the first quest (do not overlapp many sounds)
                    silent = true;
                } );
        }
        return false;
    }
    /**
     * @param {String[]} args 
     */
    restartCommand(args = []) {
        if (args.length) {
            const quests = args[0].split(':');
            quests.map(quest => this.manager().quest(quest))
                .filter(quest => quest && quest.status() > Quest.Status.Hidden)
                .forEach(quest => quest.reset(true));
        }
    }
    /**
     * @param {String[]} args 
     */
    resetCommand(args = []) {
        if (args.length) {
            const quests = args[0].split(':');
            const restart = this.has('start') || this.has('restart');
            quests.map(quest => this.manager().quest(quest))
                .filter(quest => !!quest)
                .forEach(quest => quest.reset(restart));
        }
    }
    /**
     * @param {String[]} args 
     */
    updateCommand(args = []) {
        if (args.length) {
            const amount = args.length > 2 ? parseInt(args[2]) : 1;
            const quest = this.manager().quest(args[0]);
            const silent = this.has('silent');
            if (quest) {
                //update stage or update quest using current stage
                quest.update(args[1] || '', amount , silent );
            }
        }
    }
    /**
     * @param {String[]} args 
     */
    completeCommand(args = []) {
        if (args.length) {
            const stage = args[2] || '';
            args[0].split(':')
                .map(quest => this.manager().quest(quest))
                .filter(quest => quest && !quest.finished())
                .forEach(quest => {
                    if (stage) {
                        const _stage = quest.stage(stage);
                        _stage && _stage.complete();
                    }
                    else {
                        quest.complete();
                    }
                });
        }
    }
    /**
     * @param {String[]} args 
     */
    completeallCommand(args = []) {
        if (args.length) {
            let silent = false;
            args[0].split(':').map(quest => this.manager().quest(quest))
                .filter(quest => quest && !quest.finished())
                .forEach(quest => {
                    quest.complete(true, silent );
                    silent = true;
                });
        }
    }
    /**
     * @param {String[]} args 
     */
    failCommand(args = []) {
        this.cancelCommand(args);
    }
    /**
     * @param {String[]} args 
     */
    cancelCommand(args = []) {
        if (args.length) {
            const mute = this.has('mute');
            let silent = false;
            args[1].split(':')
                .map(quest => this.manager().quest(quest))
                .filter(quest => quest && quest.active())
                .forEach(quest => {
                    quest.cancel(mute, silent);
                    silent = true;
                });
        }
    }
    /**
     * @param {String[]} args 
     */
    checkCommand(args = []) {
        if (args.length > 2) {
            const quest = this.manager().quest(args[1]);
            const status = args[2] && parseInt(args[2]) || Quest.Status.Active;
            $gameSwitches.setValue(parseInt(args[2]), quest && quest.status() === status || false);
        }
    }
    /**
     * @param {String[]} args 
     */
    mapstagesCommand(args = []) {

    }
    /**
     * @param {String[]} args 
     */
    statusCommand(args = []) {
        if (args.length > 2) {
            const status = args[2];
            const quests = args[1].split(':')
                .map(quest => this.manager().quest(quest))
                .filter(quest => quest && quest.is(status));
            $gameVariables.setValue(parseInt(args[0]), quests.length);
        }
    }
    /**
     * @param {String[]} args 
     */
    finishedCommand(args = []) {
        if (args.length > 1) {
            const quests = args[1].split(':')
                .map(quest => this.manager().quest(quest))
                .filter(quest => quest && quest.finished());
            $gameVariables.setValue(parseInt(args[0]), quests.length);
        }
    }
    /**
     * @param {String[]} args 
     */
    unfinishedCommand(args = []) {
        if (args.length > 1) {
            var quests = args[1].split(':')
                .map(quest => this.manager().quest(quest))
                .filter(quest => quest && !quest.finished());
            $gameVariables.setValue(parseInt(args[0]), quests.length);
        }
    }
    /**
     * @param {String[]} args 
     */
    activeCommand(args = []) {
        if (args.length > 1) {
            const quests = args[0].split(':')
                .map(quest => this.manager().quest(quest))
                .filter(quest => quest && quest.active());
            $gameVariables.setValue(parseInt(args[1]), quests.length);
        }
    }
    /**
     * @param {String[]} args 
     */
    runningCommand(args = []) {
        this.activeCommand(args);
    }
    /**
     * @param {String[]} args 
     */
    readyCommand(args = []) {
        if (args.length > 1) {
            const quests = args[0].split(':')
                .map(quest => this.manager().quest(quest))
                .filter(quest => quest && quest.ready());
            $gameVariables.setValue(parseInt(args[1]), quests.length);
        }
    }
    /**
     * @param {String[]} args 
     */
    progressCommand(args = []) {
        if (args.length > 1) {
            const name = args[1].split('.');
            const quest = this.manager().quest(name[0]);
            const gameVar = parseInt(args[0]);
            if (quest) {
                if (name.length > 1 && name[1]) {
                    const stage = quest.stage(name[1]);
                    $gameVariables.setValue(gameVar, stage ? stage.progress() : 0);
                }
                else {
                    $gameVariables.setValue(gameVar, quest.progress());
                }
                return;
            }
            $gameVariables.setValue(gameVar, 0);
        }
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    remainingCommand(args = []) {
        if (args.length > 1) {
            const quest = this.manager().quest(args[1]);
            const remaining = quest && quest.remaining() || 0;
            $gameVariables.setValue(parseInt(args[1]), remaining);
            return true;
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    inventoryCommand(args = []) {
        if (args.length > 2) {
            const quest = QuestLog.manager().quest(args[0]);
            if( quest ){
                const stage = args[1] || '';
                const amount = quest.checkItems( stage );
                quest.update(stage,amount);
                QuestLog.DebugLog(`${quest.name()}.${stage}: ${quest.items().join(', ')} (${amount})`);
                return amount > 0;
            }
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    menuCommand(args = []) {
        QuestLog.toggle(args[0] || QuestLog.Menu.Enabled);
        return true;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    showCommand(args = []) {
        QuestLog.Show(args[0] || '');
        return true;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    displayCommand(args = []) { return this.showCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    muteCommand(args = []) {
        this.manager().mute(['mute', 'silenced'].includes(this.command()));
        return true;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    silencedCommand(args = []) {
        return this.muteCommand(args);
    }
    /**
     * @param {String[]} args 
     */
    notifyCommand(args = []) {
        return this.muteCommand(args);
    }
    /**
     * Update if any of the quest stages are completed
     * Jump to label if updated
     * updateif quest:stage:stage:... label:label:... fallback:fallback:...
     * @param {String[]} args 
     * @returns {Boolean}
     */
    updateifCommand(args = []) {
        if (args.length) {
            const manager = this.manager();
            const name = args[0].split('.');
            const quest = manager.quest(name.shift());
            const labels = args[1] && args[1].split(':') || [];
            const fallback = args[2] && args[2].split(':') || [];
            if (quest && quest.active()) {
                if (name.length) {
                    //stage update
                    const stage = quest.stage(name[0] || '');
                    if (stage && !stage.completed()) {
                        stage.update();
                        this.jumpToLabels(labels);
                        return true;
                    }
                    //jump to fallback
                    this.jumpToLabels(fallback);
                    return false;
                }
                if (quest.update()) {
                    //quest update
                    this.jumpToLabels(labels);
                    return true;
                }
                //jump to fallback
                this.jumpToLabels(fallback);
            }
        }
        return false;
    }
    /**
     * Update if any of the quest stages are completed
     * Jump to label if updated
     * {quest:stage:stage:...} {label}
     * @param {String[]} args 
     */
    completeifCommand(args = []) {
        if (args.length) {
            const manager = this.manager();
            const name = args[0].split('.');
            const quest = manager.quest(name.shift());
            if (quest && quest.active()) {
                if (name.length) {
                    //stage update
                    const stage = quest.stage(name[0] || '');
                    if (stage && !stage.completed()) {
                        stage.complete()
                        this.jumpToLabels(args[1] && args[1].split(':') || []);
                        return true;
                    }
                    //jump to fallback
                    this.jumpToLabels(args[2] && args[2].split(':') || []);
                    return false;
                }
                if (quest.complete()) {
                    //quest update
                    this.jumpToLabels(args[1] && args[1].split(':') || []);
                    return true;
                }
                //jump to fallback
                this.jumpToLabels(args[2] && args[2].split(':') || []);
            }
        }
        return false;
    }
    /**
     * Jumps to the named label of the current active quest or stage
     * Jumps to a default label if no active quest or stage found
     * @param {String[]} args {quest.stage, defalt}
     * @returns {Boolean}
     */
    jumptoCommand(args = []) {
        if (args.length) {
            const manager = this.manager();
            const name = args[0].split(':');
            const quest = manager.quest(name.shift());
            if (quest && quest.active()) {
                if (name.length) {
                    const stage = quest.stage( name[Math.floor(Math.random() * name.length)]);
                    if (stage && !stage.completed()) {
                        //jump to the stage if valid
                        return this.jumpToLabel(stage.name()) || true;
                    }
                    //fallback no stage
                    this.jumpToLabels(args[1] && args[1].split(':') || []);
                    return false;
                }
                //jump to quest if valid
                return this.jumpToLabel(quest.name()) || true;
            }
            this.jumpToLabels(args[1] && args[1].split(':') || []);
        }
        return false;
    }
    /**
     * Jumps to a quest's defined stage or current stage
     * @param {String[]} args 
     * @returns {Boolean}
     */
    tostageCommand(args = []) {
        if (args.length) {
            const manager = this.manager();
            const name = args[0].split(':').map(tag => tag.toLowerCase());
            const quest = manager.quest(name.shift());
            if (quest && quest.active()) {
                if (name.length) {
                    const stages = quest.stagesActive()
                        .map(stg => stg.name())
                        .filter(stg => name.includes(stg));
                    return this.jumpToLabels(stages);
                }
                else {
                    return this.jumpToLabel(quest.activestage());
                }
            }
            //fallback labels
            this.jumpToLabels(args[1] && args[1].split(':') || []);
        }
        return false;
    }

    /**
     * show all commands
     * @param {String[]} args 
     */
    commandsCommand(args = []) {
        QuestLog.DebugLog(this.methods());
    }
    /**
     * @returns {String[]}
     */
    methods() {
        const list = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
        return list.filter(name => typeof this[name] === 'function')
            .filter(name => name && name.endsWith('Command'))
            .map(name => name.replace(/Command$/, ''));
    }
};


/**
 * Hook the commands
 */
function QuestLog_registerCommands() {
    //override vanilla
    const _kunQuestMan_Interpreter_Command = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _kunQuestMan_Interpreter_Command.call(this, command, args);
        if (QuestLog.command(command)) {
            KunQuestCommand.create(this, args).run();
        }
    };

    // Jump to Label (avoid issues with KunCommands!!!)
    if (QuestLog.manager().enableJumpTo() && typeof Game_Interpreter.prototype.jumpToLabel !== 'function') {
        /**
         * @param {String} labelName 
         * @returns {Boolean}
         */
        Game_Interpreter.prototype.jumpToLabel = function (labelName) {
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

/**
 * Setup text dialogs
 */
function KunQuestWindow_escapeCharacters() {
    //Window_Base.prototype.JayaKSetup_escapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    const _kunQuestLog_WindowBase_EscapeChars = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        var parsed = _kunQuestLog_WindowBase_EscapeChars.call(this, text);
        //include the quest names and stages here
        return parsed.replace(/\x1bQUEST\[(\s+)\]/gi, function () {
            //get quest Id
            return this.displayQuestData(parseInt(arguments[1]));
        }.bind(this));
    };

    Window_Base.prototype.displayQuestData = function (name = '') {
        const path = name.split('.');
        const quest = QuestLog.manager().quest(path[0]);
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




///////////////////////////////////////////////////////////////////////////////////////////////////
////    QuestLogScene : Scene_ItemBase
///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @QuestLogScene
 */
class Scene_QuestLog extends Scene_ItemBase {
    /**
     * 
     */
    constructor() {
        super(...arguments)
    }
    /**
     * 
     */
    initialize(quest = '') {
        super.initialize();
        this._quest = null;
    }
    /**
     * @param {String} quest 
     */
    prepare(quest = '') {
        this._quest = quest && this.manager().quest(quest) || null;
    }
    /**
     * 
     */
    create() {
        super.create();

        //only for selected quests from commands
        const quest = this.quest() || null;
        //allways status window first
        this.setupStatusWindow(quest && quest.status() || Quest.Status.Active);
        this.setupCategoryWindow(quest && quest.category() || null, this._statusWindow.windowHeight());
        this.setupQuestWindow(quest, this._statusWindow.y + this._statusWindow.windowHeight());
        this.setupDetailWindow(quest, this._questsWindow.y);
        this.onUpdateQuestLog();
        console.log(this._statusWindow.index());
    }

    /**
     * @returns {QuestLog}
     */
    manager() { return QuestLog.manager(); }
    /**
     * @returns {Quest}
     */
    quest() { return this._quest; }
    /**
     * @param {QuestCategory} category
     * @param {Number} position
     */
    setupCategoryWindow(category = null, position = 0) {
        this._categoryWindow = new Window_QuestCategory(position, category && category.name() || '');
        this.addWindow(this._categoryWindow);
    }
    /**
     * @param {Number} status (active)
     */
    setupStatusWindow(status = Quest.Status.Active) {
        this._statusWindow = new Window_QuestStatus(status);
        this._statusWindow.setHandler('cancel', this.onQuitQuestLog.bind(this));
        this._statusWindow.setHandler('ok', this.onSelectCategory.bind(this));
        this.addWindow(this._statusWindow);
        this._statusWindow.activate();
    }
    /**
     * @param {Quest} quest
     * @param {String} category
     * @param {Number} status
     */
    setupQuestWindow(quest = null, position = 0) {

        this._questsWindow = new Window_QuestLog(quest, position);
        this._statusWindow.setQuestsWindow(this._questsWindow);
        this._categoryWindow.setQuestsWindow(this._questsWindow);
        this.addWindow(this._questsWindow);
        //this._questsWindow.activate();
        this._questsWindow.refresh();
    }
    /**
     * @param {Quest} quest
     * @param {Number} position
     */
    setupDetailWindow(quest, position = 0) {
        this._detailWindow = new Window_QuestDetail(quest, position);
        this._questsWindow.setHelpWindow(this._detailWindow);
        this.addWindow(this._detailWindow);
        //this._detailWindow.clear();
    }
    /**
     * 
     */
    onSelectCategory() {
        if (this._categoryWindow) {
            this._categoryWindow.next();
            this.onUpdateQuestLog();
        }
    }
    /**
     * 
     */
    onUpdateQuestLog() {
        if (this._statusWindow) {
            this._statusWindow.activate();
            this._statusWindow.refresh();
        }
        if (this._questsWindow) {
            this._questsWindow.activate();
            this._questsWindow.refresh();
        }
    }
    /**
     * 
     */
    onQuitQuestLog() {
        //this._questsWindow.deselect();
        //this._statusWindow.deselect();
        //this._statusWindow.activate();
        this.popScene();
    }
    /**
     * @returns {Number}
     */
    static LayoutSize() { return 4; }
}


///////////////////////////////////////////////////////////////////////////////////////////////////
////    QuestCatWindow : Window_Base
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @Window_QuestCategory
 */
class Window_QuestCategory extends Window_Base {
    constructor() {
        super(...arguments);
    }
    /**
     * 
     * @param {Number} height 
     * @param {String} category 
     */
    initialize(height = 0, category = '') {
        super.initialize(0, 0, this.windowWidth(), height);

        this._category = category || '';
        this._title = 'All';
        this._name = '';
        this._icon = 0;
        this._color = 0;

        this.refresh();
    }
    /**
     * @returns {Number}
     */
    windowWidth() { return parseInt(Graphics.boxWidth / Scene_QuestLog.LayoutSize()); }
    /**
     * @returns {QuestCategory}
     */
    category() {
        return this._category && QuestLog.manager().category(this._category) || null;
    }
    /**
     * @returns {Number}
     */
    standardFontSize() { return 20; }
    /**
     * @returns {QuestCategory}[]
     */
    categories() {
        //first category is empty, will show All quests
        return ['', ...QuestLog.manager().categories().map(cat => cat.name())];
    }
    /**
     * 
     */
    next() {
        const list = this.categories();
        const category = this._category;
        if (list.length) {
            let index = category && list.indexOf(category) || 0;
            this._category = this.categories()[++index % list.length];
        }
        this.refresh();
    }
    /**
     * 
     * @param {Window_QuestLog} questLog 
     */
    setQuestsWindow(questLog = null) {
        this._questsWindow = questLog instanceof Window_QuestLog && questLog || null;
    }
    /**
     * 
     */
    refresh() {
        this.contents.clear();
        this.renderCategory(this.category());
        if (this._questsWindow) {
            this._questsWindow.setCategory(this._category);
        }
    }
    /**
     * @param {QuestCategory} category
     */
    renderCategory(category = null) {
        if (category instanceof QuestCategory) {
            const icon = category.icon();
            const title = category.title();
            const color = category.color();
            if (icon > 0) {
                var base_line = Math.max((28 - this.standardFontSize()) / 2, 0);
                this.drawIcon(icon, 0, base_line);
            }
            this.changeTextColor(this.textColor(color));
            this.drawText(title, 0, 0, this.contentsWidth(), 'center');
            this.changeTextColor(this.normalColor());
        }
        else {
            //All quests
            this.changeTextColor(this.normalColor());
            this.drawText('All', 0, 0, this.contentsWidth(), 'center');
        }
    }

};

///////////////////////////////////////////////////////////////////////////////////////////////////
////    QuestStatusWindow : Window_HorzCommand
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @Window_QuestStatus
 */
class Window_QuestStatus extends Window_HorzCommand {

    constructor() {
        super(...arguments);
    }
    /**
     * @returns {String[]}
     */
    list() { return ['invalid', 'hidden', 'active', 'completed', 'failed']; }
    /**
     * @param {Number} status 
     */
    initialize(status = Quest.Status.Active) {
        super.initialize(Window_QuestStatus.X(), 0);
        this.setStatus(status);
    }   
    /**
     * @param {Number} status 
     */
    setStatus( status = Quest.Status.Active) {
        //this._list
        const showhidden = this._list.length > 3;
        this.select( Math.max(showhidden ? status - 1 : status - 2 , 0 ) );
    }
    /**
     * @returns {Number}
     */
    static X() { return parseInt(Graphics.boxWidth / Scene_QuestLog.LayoutSize()); }
    /**
     * @returns {Number}
     */
    static Y() { return 0; }
    /**
     * @returns {Number}
     */
    windowWidth() { return Window_QuestStatus.X() * (Scene_QuestLog.LayoutSize() - 1); }
    /**
     * @returns {Number}
     */
    maxCols() { return this.maxItems(); }
    /**
     * @returns {Number}
     */
    standardFontSize() { return 20; }
    /**
     * 
     */
    update() {
        Window_HorzCommand.prototype.update.call(this);
        if (this._questsWindow) {
            this._questsWindow.setStatus(this.getStatus());
        }
    }
    /**
     * @returns {Number}
     */
    getStatus() {
        return this.list().indexOf(this.currentSymbol()) || 0;
    }
    /**
     * 
     */
    makeCommandList() {
        //register all visual statuses
        if (QuestLog.manager().debug()) {
            this.addCommand('Hidden', 'hidden');
        }
        this.addCommand('Active', 'active');
        this.addCommand('Completed', 'completed');
        this.addCommand('Failed', 'failed');
    }
    /**
     * @param {Number} index 
     */
    drawItem(index = 0) {
        const rect = this.itemRectForText(index);
        const align = this.itemTextAlign();
        if (this.commandSymbol(index) === 'hidden') {
            this.changeTextColor(this.systemColor());
        }
        else {
            this.resetTextColor();
        }
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
        this.resetTextColor();
    }
    /**
     * @param {Window_QuestLog} questLog 
     */
    setQuestsWindow(questLog = null) {
        this._questsWindow = questLog instanceof Window_QuestLog && questLog || null;
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////
////    QuestLogWindow : Window_Selectable
///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @class {Window_QuestLog}
 */
class Window_QuestLog extends Window_Selectable {

    constructor() {
        super(...arguments);
    }

    /**
     * @param {Quest} quest 
     * @param {Number} position 
     */
    initialize(quest = null, position = 0) {
        //super.initialize( 0 , position, this.windowWidth() , this.windowHeight() );
        super.initialize(0, position, this.windowWidth(), Graphics.boxHeight - position);

        this._category = quest && quest.category() && quest.category().name() || ''; //filter none
        this._status = quest && quest.status() || Quest.Status.Active;
        this._quests = this.loadList(this._category, this._status);

        if (quest !== null && quest instanceof QuestData) {
            this._status = quest.status();
            this._category = quest.category() && quest.category().name();
        }
    }
    /**
     * @returns {String[]}
     */
    quests() { return this._quests; }
    /**
     * @param {String} category 
     * @param {Number} status 
     * @returns {Quest[]}
     */
    loadList(category = '', status = Quest.Status.Active) {
        return QuestLog.manager()
            .quests()
            .filter(quest => quest.is(status) && (!category || quest.isCategory(category)))
            .map(quest => quest.name());
    }
    /**
     * 
     */
    refreshList() {
        this._quests = this.loadList(this._category, this._status);
        this.activate();
    }
    /**
     * @param {String} category 
     */
    setCategory(category = '') {
        if (this._category !== category) {
            this._category = category;
            this.refresh();
        }
    }
    /**
     * @param {Number} status 
     */
    setStatus(status = Quest.Status.Active) {
        if ( status >= 0 && this._status !== status) {
            this._status = status;
            this.refresh();
        }
    }
    /**
     * 
     */
    activate(){ this.active = this.quests().length && true || false; }
    /**
     * 
     * @returns {Number}
     */
    windowWidth() { return Graphics.boxWidth / Scene_QuestLog.LayoutSize(); }
    /**
     * @returns {Number}
     */
    windowHeight() { return Graphics.boxHeight - this.y; }
    /**
     * @returns {Number}
     */
    maxCols() { return 1; }
    /**
     * @returns {Number}
     */
    maxItems() { return this._quests ? this._quests.length : 0; }
    /**
     * @returns {Number}
     */
    spacing() { return 32; }
    /**
     * @returns {Number}
     */
    standardFontSize() { return 20; }
    /**
     * @param {Number} index 
     * @returns {Quest}
     */
    getQuest(index = 0) {
        const quest = index >= 0 && this.quests()[index] || '';
        return quest && QuestLog.manager().quest(quest) || null;
    }
    /**
     * @returns {Quest}
     */
    selectedQuest() { return this.getQuest(this.index()); }
    /**
     * @description Render Item in the list by its list order
     */
    drawItem(index) {
        const quest = this.getQuest(index);
        if (quest) {
            const rect = this.itemRect(index);
            const title = quest.title().split(' - ');
            if (this._status < Quest.Status.Active) {
                this.changeTextColor(this.systemColor());
            }
            //this.drawTextEx( title_break[ 0 ] , rect.x , rect.y, rect.width);
            this.drawText(title[0], rect.x, rect.y, rect.width, 'left');
            this.resetTextColor();
        }
    }
    /**
     * @param {Window_QuestDetail} questWindow 
     */
    setHelpWindow(questWindow = null) {
        if (questWindow instanceof Window_QuestDetail) {
            //Window_Selectable.prototype.setHelpWindow.call(this, helpWindow);
            super.setHelpWindow(questWindow);
            this.callUpdateHelp();
        }
    }
    /**
     * 
     */
    callUpdateHelp() {
        if ( this._helpWindow) {
            this.setHelpWindowItem(this.selectedQuest());
            this.updateHelp();
        }
    }
    /**
     * @param {Quest} quest 
     */
    setHelpWindowItem(quest = null) {
        if (this._helpWindow) {
            this._helpWindow.setItem(quest);
        }
    }
    /**
     * 
     */
    selectFirst() {
        this.select(this.quests().length > 0 ? 0 : -1);
    }
    /**
     * 
     */
    refresh() {
        this.refreshList();
        super.refresh();
        //Window_Selectable.prototype.refresh.call(this);
        this.drawAllItems();
        this.resetScroll();
        this.selectFirst();
        this.callUpdateHelp();
    }
}



///////////////////////////////////////////////////////////////////////////////////////////////////
////    Window_QuestDetail : Window_Base
///////////////////////////////////////////////////////////////////////////////////////////////////
class Window_QuestDetail extends Window_Base {

    constructor() {
        super(...arguments);
    }
    /**
     * @param {Quest} quest 
     * @param {Number} position 
     */
    initialize(quest = null, position = 0) {
        super.initialize(
            Window_QuestDetail.X(),
            position,
            this.windowWidth(),
            Graphics.boxHeight - position
        );
        this._quest = quest instanceof Quest && quest || null;
        this.refresh();
    }
    /**
     * @returns {QuestLog}
     */
    manager() { return QuestLog.manager(); }
    /**
     * @returns {Boolean}
     */
    debugMode() {
        return this.manager().debug();
    }
    /**
     * @returns {Number}
     */
    iconQuest() { return this.manager().icon(); }
    /**
     * @returns {Number}
     */
    iconActive() { return this.manager().icon('active'); }
    /**
     * @returns {Number}
     */
    iconCompleted() { return this.manager().icon('completed'); }
    /**
     * @returns {Number}
     */
    iconFailed() { return this.manager().icon('failed'); }
    /**
     * @returns {Number}
     */
    static X() { return Graphics.boxWidth / Scene_QuestLog.LayoutSize(); }
    /**
     * @returns {Number}
     */
    windowWidth() { return Window_QuestDetail.X() * (Scene_QuestLog.LayoutSize() - 1); }
    /**
     * @returns {Number}
     */
    windowHeight() { return Graphics.boxHeight - this.y; }
    /**
     * @param {Quest} quest
     */
    setItem(quest = null) {
        //this._quest = this.manager().quest(quest);
        this._quest = quest instanceof Quest && quest || null;
        this.clear();
    }
    /**
     * 
     */
    clear() {
        this.contents.clear();
        this.refresh();
    }
    /**
     * 
     */
    refresh() {
        if (this._quest) {
            this.renderQuestData(this._quest);
        }
        else {
            this.renderEmptyQuest();
        }
    }
    /**
     * 
     * @param {Number} position 
     */
    drawHorzLine(position) {
        this.contents.paintOpacity = 48;
        this.contents.fillRect(0,
            position + this.lineHeight() / 2 - 1,
            this.contentsWidth(), 2,
            this.normalColor());
        this.contents.paintOpacity = 255;
    }
    /**
     * @returns {Number}
     */
    standardFontSize() { return 20; }
    /**
     * @returns {Number}
     */
    lineHeight() { return 30; }
    /**
     * @returns {Number}
     */
    completedItemOpacity() { this.contents.paintOpacity = 192; }
    /**
     * @returns {Number}
     */
    baseLine() { return Math.max((28 - this.standardFontSize()) / 2, 0); }
    /**
     * 
     */
    debugItemOpacity() { this.contents.paintOpacity = 128; }
    /**
     * @param {Quest} quest
     */
    renderQuestData(quest) {
        //TITLE
        this.renderTitle(quest.title(), quest.icon());
        //CATEGORY
        // quest heading
        const category = quest.category() && quest.category().title() || '';
        if (category) {
            this.renderCategory(category);
        }
        this.changeTextColor(this.textColor(24));
        this.drawHorzLine(this.lineHeight());
        this.renderDetail(quest.details(), this.lineHeight());
        //RENDER STAGES
        this.renderQuestStages(quest);
        this.renderProgress(quest.progress());

        //if active, show curretn location, if completed, show reward
        if (quest.completed() && quest.hasReward()) {
            //this.renderQuestReward(quest.reward(true), !quest.completed());
        }
        else if (quest.active()) {
            this.renderLocation(quest.location());
        }
        //render right
        this.renderQuestStatus(quest.status());
    }
    /**
     * @param {Number} progress 
     */
    renderProgress(progress = 0) {
        this.drawGauge(0,
            this.contentsHeight() - 10 - this.lineHeight() * 2,
            this.contentsWidth(),
            progress,
            this.textColor(4),
            this.textColor(6)
        );
    }
    /**
     * @param {String} category 
     */
    renderCategory(category = '') {
        this.changeTextColor(this.textColor(23));
        this.drawText(category, 40, this.baseLine(), this.contentsWidth() - 40, 'right');
    }
    /**
     * 
     * @param {String} title 
     * @param {Number} icon 
     */
    renderTitle(title = '', icon = 0) {
        this.changeTextColor(this.normalColor());
        if (icon) {
            this.drawIcon(icon, 0, this.baseLine());
        }
        this.drawTextEx(title, icon && 40 || 0, this.baseLine(), this.contentsWidth());
    }
    /**
     * @param {String|String[]} text
     * @param {Number} position
     */
    renderDetail(text = '', position = 0) {
        const content = this.displayDetail(text, this.manager().detailsLength());
        for (var i = 0; i < content.length; i++) {
            this.drawTextEx(content[i], 0, position + (this.lineHeight() * (i + 1)), this.contentsWidth());
        }
    }
    /**
     * @param {Number} wordLimit Words per line, 50 by default
     * @returns {String[]}
     */
    displayDetail(text, wordLimit = 40) {
        const output = [];
        text.split("\\n").forEach(function (line) {
            line.split(' ').forEach(function (word) {
                if (output.length && output[output.length - 1].length + word.length + 1 < wordLimit) {
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
     * @param {Quest} quest
     */
    renderQuestStages(quest) {

        const line = this.lineHeight() * 1.2;
        const debugHiddenItem = false;
        const debug = this.debugMode();
        const linear = quest.isLinear();
        const stages = !debug || quest.type() === Quest.Type.Linear ? quest.stagesCompleted() : quest.stages();
        //from the bottom window, calculate the lines and line height ,adding 2 more lines for bottom progress
        const base = this.contentsHeight() - (line * (stages.length + 2));
        let index = 0;

        this.changeTextColor(this.normalColor());
        stages.forEach(stage => {
            if (debugHiddenItem) {
                this.debugItemOpacity();
            }
            this.renderStage(stage.title(), stage.completed(), base + (line * index++), debugHiddenItem);
            if (debug && !debugHiddenItem && linear && !stage.completed()) {
                debugHiddenItem = true;
            }
        });
    }
    /**
     * @param {String} title 
     * @param {Boolean} completed 
     * @param {Number} position 
     * @param {Boolean} showDebug 
     */
    renderStage(title = '', completed = false, position = 0, showDebug = false) {
        if (showDebug) {
            this.debugItemOpacity();
        }
        this.drawIcon(this.manager().icon(completed ? 'completed' : 'active'), 0, position + 4);
        this.drawText(title, 40, position);
        if (showDebug) {
            this.changePaintOpacity(true);
        }
    }
    /**
     * @param {String} reward
     * @param {Boolean} locked
     */
    renderQuestReward(reward = '', locked = false) {
        if (locked) {
            this.changeTextColor(this.textColor(8));
        }
        this.drawTextEx(reward, 0, this.contentsHeight() - this.lineHeight() - 4, this.contentsWidth());
    }
    /**
     * @param {String[]} Location
     */
    renderLocation(location = []) {
        if (location.length) {
            this.changeTextColor(this.textColor(6));
            this.drawTextEx(location.join(', '), 0, this.contentsHeight() - this.lineHeight() - 4, this.contentsWidth());
            this.changeTextColor(this.normalColor());
        }
    }
    /**
     * @param {Number} status
     */
    renderQuestStatus(status = Quest.Status.Hidden) {
        const statusList = ['Invalid', 'Hidden', 'Active', 'Completed', 'Failed'];
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
        this.drawText(statusList[status] || '', 0, this.contentsHeight() - this.lineHeight() - 4, this.contentsWidth(), 'right');
        this.changeTextColor(this.normalColor());
    }
    /**
     * @description Empty quest window
     */
    renderEmptyQuest() {
        const position = this.contentsHeight() / 3 - this.standardFontSize() / 2 - this.standardPadding();
        this.drawText("-- Empty log --", 10, position, this.contentsWidth(), 'center');
        //this.changeTextColor(this.textColor(8));
        //this.drawText("Left and Right to filter Quest Status", 0, position + 40, this.contentsWidth(), 'center');
        //this.drawText("Up and Down to select Quest", 0, position + 80, this.contentsWidth(), 'center');
        //this.drawText("Action to switch Quest Category filter", 0, position + 120, this.contentsWidth(), 'center');
        //this.changeTextColor(this.normalColor(8));
    }
}

/**
 * Backward compatibility functions
 * @param {String} quest 
 * @returns {Boolean}
 */
function quest_ready( quest ){
    return QuestLog.QuestReady( quest );

}
/**
 * Backward compatibility functions
 * @param {String} quest 
 * @param {String} stage 
 * @returns {Boolean}
 */
function quest_active( quest = '' , stage = '' ){
    return QuestLog.QuestActive( quest , stage );
}
/**
 * Backward compatibility functions
 * @param {String} quest 
 * @param {String} stage 
 * @returns {Boolean}
 */
function quest_completed( quest = '',stage = ''){
    return QuestLog.QuestCompleted( quest , stage );
}

/**
 * Backward compatibility functions
 * @param {String} quest 
 * @param {String} stage 
 * @returns {Boolean}
 */
function quest_start( quest = '' ){
    return QuestLog.QuestStart( quest );
}
/**
 * Backward compatibility functions
 * @param {String} quest 
 * @param {String} stage 
 * @returns {Boolean}
 */
function quest_complete( quest = '',stage = ''){
    return QuestLog.QuestComplete( quest , stage );
}
/**
 * Backward compatibility functions
 * @param {String} quest 
 * @param {String} stage 
 * @returns {Boolean}
 */
function quest_cancel( quest = '',stage = ''){
    return QuestLog.QuestCancel( quest , stage );
}


(function () {

    const questman = QuestLog.manager();

    //new manager for new|load|save
    KunQuestMan_SetupDataManager();
    QuestLog_RegisterMenu();
    QuestLog_registerCommands();


    if (questman.itemEvent() > 0) {
        QuestLog_registerQuestItemEvent();
    }

    if( questman.questManCalls() ){
        //QuestLog_registerKQMFunctions();
    }

})( /* autorun */);

