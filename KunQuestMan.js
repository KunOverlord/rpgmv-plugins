//=============================================================================
// KunQuestMan.js
//=============================================================================
/*:
 * @plugindesc Kun's Quest Manager
 * @filename KunQuestMan.js
 * @version 1.7
 * @author KUN
 * 
 * @help
 * 
 * Quest State Checks (to use with Conditional Branches):
 * 
 *      quest_status( questID Or questID.stageID )
 *          - Returns Quest Status
 *      quest_active( quest , stage )
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
 * @type Text
 * 
 * @param CommandText
 * @text Command Menu Text
 * @desc Show this text in menu to topen the Quest Log
 * @type Text
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
 * @text Stages
 * @type struct<Stage>[]
 * @desc Define here the list of stages for your quest
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

function QuestMan() { throw new Error('This is a static class'); };
/**
 * Initialize all quest stuff
 * hooked in the game initializer
 * @param {Boolean} init
 */
QuestMan.setup = function (init) {

    return typeof init === 'boolean' && init ? this.initMembers().initQuestData() : this.initMembers();

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
    this._debug = parameters.debug === 'true';
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
        QuestMan.addCategory(c.category, parseInt(c.icon), parseInt(c.color));
    });
    return this;
};
/**
 * @param {String} category 
 * @returns Object
 */
QuestMan.getCategoryFormat = function (category) {
    return this._categories.hasOwnProperty(category) ? this._categories[category] : { 'icon': 0, 'color': 0 };
};
/**
 * @param {Object} input 
 * @returns QuestMan
 */
QuestMan.importQuests = function (input) {

    (Array.isArray(input) ? input : []).filter(q => q.length > 0).map(q => JSON.parse(q)).forEach(function (q) {

        var stages = (q.hasOwnProperty('Stages') && q.Stages.length > 0 ? JSON.parse(q.Stages) : []).filter(s => s.length > 0).map(s => JSON.parse(s));
        var quest = new Quest(
            q.Key,
            q.Title,
            q.Category,
            q.Details,
            parseInt(q.Icon),
            q.Behavior,
            q.Reward
        );
        quest.setNextQuest(q.Next);
        //var stages = quest.hasOwnProperty('Stages') && quest.Stages.length > 0 ? JSON.parse( quest.Stages ) : [];
        stages.forEach(function (s) {
            quest.add(s.Key, s.Title, s.Details, parseInt(s.Objective));
        });
        QuestMan.addQuest(quest).addCategory(q.Category);
    });
    return this;
};
/**
 * @returns Game_Party.QuestData
 */
QuestMan.db = function () { return $gameParty.QuestData() };
/**
 * @returns QuestMan
 */
QuestMan.initQuestData = function () {
    var db = this.db();
    this.quests(true).forEach(function (quest) {
        db.reset(quest.name(), quest.list());
        //quest.stages(true).forEach(function (stage) {
        //    db.reset(quest.name(), stage.name());
        //});
    });

    var params = this.importParameters();
    this.setMenuStatus(params.CommandMenu);

    return this;
};
/**
 * @param {String} status 
 * @return {QuestMan}
 */
QuestMan.setMenuStatus = function (status) {
    this.db().setParam('menu_status', status || QuestMan.MenuStatus.Enabled);
    return this;
};
/**
 * @returns {Boolean}
 */
/*QuestMan.menuStatus = function () {
    return this.db().param('menu_status', QuestMan.MenuStatus.Enabled);
}*/
/**
 * @returns {Boolean}
 */
QuestMan.isMenuEnabled = function () {
    return this.db().param('menu_status', '') === QuestMan.MenuStatus.Enabled;
}
/**
 * @returns {Boolean}
 */
QuestMan.isMenuVisible = function () {
    return this.db().param('menu_status', '') !== QuestMan.MenuStatus.Hidden;
}
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
    return this._strings.hasOwnProperty(string) ? this._strings[string] : string;
};
/**
 * @returns Object
 */
QuestMan.data = function () {
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
QuestMan.Migrate = function (name, override) {
    //var db = new Quest.Data();
    //db.migrate( id , override );
    $gameParty.QuestManager().migrate(name, override);

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
 * Register the quest data manager
 */
function QuestManager_RegisterQuestData() {
    /**
     * Quest Data Manager (update, save, load)
     * @returns Game_Party.QuestData
     */
    Game_Party.prototype.QuestData = function () {
        /**
         * @param {String} quest_id 
         * @param {String} stage_id 
         * @returns Boolean
         */
        this.has = function (quest_id, stage_id) {
            if (typeof quest_id === 'string' && quest_id.length && this.data().hasOwnProperty(quest_id)) {
                if (typeof stage_id === 'string') {
                    return stage_id.length && stage_id !== 'STATUS' ? this.data()[quest_id].hasOwnProperty(stage_id) : false;
                }
                return true;
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
        this.update = function (quest_id, stage_id, amount) {
            amount = typeof amount === 'number' && amount > 1 ? amount : 1;
            if (this.has(quest_id, stage_id)) {
                var value = this.get(quest_id, stage_id) + amount;
                this.set(quest_id, stage_id, value);
                return value;
            }
            return 0;
        };
        /**
         * @param {String} quest_id 
         * @param {String} stage_id 
         * @returns 
         */
        this.get = function (quest_id, stage_id) {
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
         * @param {String} quest_id 
         * @param {String} stage_id 
         * @param {Number} amount 
         * @returns Game_Party.QuestData
         */
        this.set = function (quest_id, stage_id, amount) {
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
         * @returns Number
         */
        this.status = function (quest_id) {
            return this.has(quest_id) ? this.data()[quest_id].STATUS : Quest.Status.Hidden;
        };
        /**
         * @param {String} quest_id 
         * @param {Number} status 
         * @returns Number
         */
        this.setStatus = function (quest_id, status) {
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
        this.reset = function (quest_id, stages) {
            this.data()[quest_id] = { 'STATUS': Quest.Status.Hidden };
            if (Array.isArray(stages)) {
                for (var s in stages) {
                    this.set(quest_id, stages[s]);
                    console.log(`Reset ${quest_id}.${stages[s]}...`);
                }
            }
            return this;
        };
        /**
         * Compatibility
         * @param {String} quest_id
         * @returns GameParty.QuestData
         */
        this.register = function (quest_id) {
            return this.reset(quest_id);
        };
        /**
         * @param {String} name 
         * @returns Array
         */
        this.list = function (name) {
            return typeof name === 'string' && this.has(name) ?
                Object.keys(this.data()[name]).filter(id => id !== 'STATUS') :
                Object.keys(this.data());
        };
        /**
         * @returns Object
         */
        this.data = function () {
            if (!this.hasOwnProperty('_questData')) { this._questData = {}; }
            return this._questData;
        };
        /**
         * @returns Object
         */
        this.parameters = function () {
            if (!$gameParty.hasOwnProperty('_questParams')) $gameParty._questParams = {};
            return $gameParty._questParams;
        };

        /**
         * @param {String} param 
         * @param {Number|String|Boolean} value default
         * @returns 
         */
        this.param = function (param, value) {

            return this.parameters().hasOwnProperty(param) ?
                this.parameters()[param] :
                value;
        };
        /**
         * @param {String} param 
         * @param {Boolean} value 
         * @returns GameParty.QuestData
         */
        this.setParam = function (param, value) {
            this.parameters()[param] = value;
            return this;
        };
        /**
         * Change the quest identifiers wuen required by a game update or migration
         * @param {String} id 
         * @param {String} override 
         * @returns GameParty.QuestData
         */
        this.migrate = function (id, override) {
            if (typeof id !== 'string' || typeof override !== 'string') {
                return this;
            }
            var name = id.split('.');
            if (this.has(id) && override.length && !this.has(`${name[0]}.${override}`)) {
                if (name.length > 1) {
                    var data = this.data()[name[0]][name[1]];
                    this.data()[name[0]][override] = data;
                    delete this.data()[name[0]][name[1]];
                }
                else {
                    //quest override
                    var data = this.data()[name[0]];
                    this.data()[override] = data;
                    delete this.data()[name[0]];
                }
            }
            return this;
        };

        return this;
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

    //var _self = this;
    var _kunQuestMan_OriginalMenuCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function () {
        _kunQuestMan_OriginalMenuCommands.call(this);
        if (QuestMan.isMenuVisible()) {
            this.addCommand(QuestMan.string('command', 'Journal'), 'quest', QuestMan.isMenuEnabled());
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
        QuestMan.setup(true);
    };
    var _kunQuestMan_GameLoad = Game_System.prototype.onAfterLoad;
    Game_System.prototype.onAfterLoad = function () {
        _kunQuestMan_GameLoad.call(this);
        QuestMan.setup();
    }
}
/**
 * Hook the commands
 */
function QuestManager_registerCommands() {
    //override vanilla
    var _kunQuestMan_CommandInterpreter = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _kunQuestMan_CommandInterpreter.call(this, command, args);
        if (command === 'KunQuestMan' || command === 'QuestLog') {
            //override with plugin command manager
            switch (args[0]) {
                case 'start':
                    quest_start(args[1]);
                    break;
                case 'update':
                    var amount = 0;
                    var name = args[1].split('.');
                    if (args.length > 2) {
                        if (args.length > 3 && args[3] === 'import') {
                            amount = $gameVariables.value(parseInt(args[2]));
                        }
                        else {
                            amount = parseInt(args[2]);
                        }
                    }
                    quest_update(name[0], name.length > 1 ? name[1] : false, amount);
                    break;
                case 'complete':
                    var name = args[1].split('.');
                    quest_complete(name[0], name.length > 1 ? name[1] : false);
                    break;
                case 'fail':
                case 'cancel':
                    quest_cancel(args[1]);
                    break;
                case 'reset':
                    quest_reset(args[1]);
                    break;
                case 'restart':
                    quest_restart(args[1]);
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
                    QuestMan.mute(true);
                    break;
                case 'notify':
                    QuestMan.mute(false);
                    break;
                case 'migrate':
                    if (args.length > 2) {
                        QuestMan.Migrate(args[1], args[2]);
                    }
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
 * @param {String} behavior 
 * @param {String} reward
 * @returns Quest
 */
function Quest(name, title, category, details, icon, behavior, reward) {

    var _Q = {
        'name': name,
        'title': title,
        'details': details || '',
        'category': category,
        'icon': icon || 0,
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
    this.setNextQuest = function (quest_id) {
        _Q.next = quest_id || '';
        return this;
    };
    /**
     * @returns Quest|Boolean
     */
    this.next = function () {
        return (_Q.next.length && this.db().has(_Q.next)) ?
            QuestMan.quest(_Q.next) :
            false;
    };
    /**
     * @returns Quest
     */
    this.checkNext = function () {
        var next = this.next();
        //start new quest if required
        if (next !== false) {
            QuestMan.DebugLog('Starting Next Quest [' + _Q.next + ']');
            next.start();
        }
        else {
            QuestMan.DebugLog('Invalid Next Quest [' + _Q.next + ']');
        }


        return this;
    }

    //public getters
    /**
     * @returns string
     */
    this.name = () => _Q.name;
    /**
     * Backwards compatibility
     * @returns String
     */
    this.key = function () {
        return this.name();
    };
    /**
     * @param Boolean display Icon + Title
     * @returns string
     */
    this.title = function (display) {
        return typeof display === 'boolean' && display ?
            '\\\I[' + this.icon() + '] ' + _Q.title :
            _Q.title;
    };
    /**
     * Backwards compatibility
     * @returns String
     */
    this.displayTitle = function () {
        return this.title(true);
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
    this.status = function () {
        return this.db().status(this.name());
    };
    /**
     * @returns Number
     */
    this.completed = function () {
        return this.status() === Quest.Status.Completed;
    };
    /**
     * @returns Number
     */
    this.active = function () {
        return this.status() === Quest.Status.Active;
    };
    /**
     * @returns Number
     */
    this.failed = function () {
        return this.status() === Quest.Status.Failed;
    };
    /**
     * @returns Number
     */
    this.hidden = function () {
        return this.status() === Quest.Status.Hidden;
    };
    /**
     * @returns String
     */
    this.displayStatus = function () {
        return Quest.Status.display(this.status());
    };
    /**
     * @returns string
     */
    this.behavior = () => _Q.behavior;
    /**
     * @returns string
     */
    this.icon = () => _Q.icon ? _Q.icon : QuestMan.icon('default');
    /**
     * @returns string
     */
    this.details = function () {

        var details = _Q.details.length > 0 ? _Q.details + "\n" : '';

        if (this.behavior() === Quest.Behavior.Linear) {
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
    this.displayDetail = function (wordLimit) {
        var output = [];
        this.details().split("\n").forEach(function (line) {
            line.split(' ').forEach(function (word) {
                if (output.length) {
                    if (output[output.length - 1].length + word.length + 1 < (wordLimit || 50)) {
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
    this.progress = function (detailed) {
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
    this.remaining = function () {
        var _remaining = this.list().length - this.stages(true).filter(stage => stage.completed()).length;
        return _remaining < 0 ? 0 : _remaining;
    };
    /**
     * @param {Boolean} list 
     * @returns Array | Object
     */
    this.stages = function (list) {
        return list || false ? Object.values(_Q.stages) : _Q.stages;
        //return list || false ? this.list().map((name) => _Q.stages[name]) : _Q.stages;
    };
    /**
     * @returns Array
     */
    this.list = () => Object.keys(_Q.stages);
    /**
     * @returns Number
     */
    this.countStages = function () {
        return this.list().length;
    };
    /**
     * @returns Array
     */
    this.visibleStages = function () {
        if (_Q.behavior === Quest.Behavior.Linear) {
            var list = this.list();
            var current = this.current();
            var _quest = this;
            if (current !== false && list.includes(current.name())) {
                //console.log( 'current: ' + current.name());
                //console.log(list);
                var from = list.indexOf(current.name());
                var output = list.slice(0, from < list.length ? from + 1 : from);
                //console.log( output );
                return output.map(stage_id => _quest.stage(stage_id));
            }
            return [];
        }
        return this.stages(true);
    };
    /**
     * @param {String} stage_id 
     * @returns QuestStage
     */
    this.stage = function (stage_id) {
        return this.has(stage_id) ? _Q.stages[stage_id] : false;
        return _Q.stages.hasOwnProperty(stage_id) ? _Q.stages[stage_id] : false;
    };
    /**
     * @param {String} stage_id 
     * @returns Boolean
     */
    this.has = function (stage_id) {
        return typeof stage_id === 'string' && stage_id.length && _Q.stages.hasOwnProperty(stage_id);
    };
    /**
     * Current quest stage if Linear behavior is enabled
     * @returns QuestStage|Boolean
     */
    this.current = function () {
        if (this.status() === Quest.Status.Active) {
            //if( this.behavior() === Quest.Behavior.Linear || this.behavior() === Quest.Behavior.Default ){
            var stages = this.stages(true).filter(s => s.status() < Quest.Status.Completed);
            if (stages.length) {
                return stages[0];
            }
        }
        return false;
    };
    /**
     * @param {String} name 
     * @param {String} title 
     * @param {String} details 
     * @param {Number} objective 
     * @returns Quest
     */
    this.add = function (name, title, details, objective) {

        if (!_Q.stages.hasOwnProperty(name)) {
            var S = new QuestStage(name, title, details || "", objective || 1);
            var _self = this;
            S.quest = function () { return _Q.name; } //attach the quest owner identifier
            //S.check = function () { _self.check() }; //attach the quest status checker
            _Q.stages[name] = S;
        }

        return this;
    };
    /**
     * @param {Number} status 
     * @returns Quest
     */
    this.set = function (status) {
        this.db().setStatus(this.name(), status);
        return this;
    };
    /**
     * @param {String} id
     * @returns Quest
     */
    this.reset = function () {
        this.db().reset(this.name(), this.list());
        return this;
    };
    /**
     * @param {Number} status 
     * @returns Boolean
     */
    this.start = function () {
        if (this.status() < Quest.Status.Active) {
            this.set(Quest.Status.Active).notify(this.displayTitle() + ' started.').playMedia('start');
        }
        return this.status() === Quest.Status.Active;
    };
    /**
     * 
     * @param {String} stage_id 
     * @param {Number} amount
     * @returns Number
     */
    this.update = function (stage_id, amount) {
        if (this.status() < Quest.Status.Completed) {
            if (this.status() < Quest.Status.Active) {
                return this.set(Quest.Status.Active).notify(this.displayTitle() + ' started.').playMedia('start').status();
            }
            else{
                var stage = this.behavior() === Quest.Behavior.Linear ? this.current() : this.stage(stage_id);
                if( stage !== false && !stage.completed( ) ){
                    if( this.behavior() === Quest.Behavior.Linear && typeof stage_id === 'string' && stage_id.length && stage_id !== stage.name() ){
                        QuestMan.DebugLog(`Only current quest stage can be updated in Linear Quest ${this.name()}`);
                        return this.status();
                    }
                    stage.update( amount || 1 );
                    QuestMan.DebugLog(`${this.name()}.${ stage.name() } + ${amount || 1}`);
                    if( this.behavior() !== Quest.Behavior.Optional ){
                        if( this.remaining() > 0 ){
                            this.notify(this.displayTitle() + ' updated.').playMedia('update');
                        }
                        else{
                            this.set(Quest.Status.Completed).notify(this.displayTitle() + ' completed.').playMedia('complete').checkNext();
                        }
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
    this.complete = function (stage_id) {
        if (this.status() < Quest.Status.Completed) {
            if (this.has(stage_id)) {
                if (this.stage(stage_id).complete() === Quest.Status.Completed) {
                    if (this.remaining() > 0) {
                        this.notify(this.displayTitle() + ' updated.').playMedia('update');
                    }
                    else {
                        this.notify(this.displayTitle() + ' completed.').playMedia('complete').checkNext();
                    }
                    return true;
                }
            }
            else {
                this.set(Quest.Status.Completed);
                this.notify(this.displayTitle() + ' completed.').playMedia('complete').checkNext();
            }
        }
        return this.status() === Quest.Status.Completed;
    };
    /**
     * @param {Number} status 
     * @returns Quest
     */
    this.cancel = function () {
        if (this.status() < Quest.Status.Completed) {
            this.set(Quest.Status.Failed).notify(this.displayTitle() + ' failed.').playMedia('fail');
        }
        return this.status() === Quest.Status.Failed;
    };

    /**
    * @returns Object
    */
    this.dump = function () {

        var output = {
            'name': _Q.name,
            'title': _Q.title,
            'category': _Q.category,
            'icon': _Q.icon,
            'behavior': _Q.behavior,
            'status': this.status(),
            'stages': []
        };

        this.stages(true).map((s) => output.stages.push(s.dump()));

        return output;
    };
    /**
     * @param {String} media 
     * @returns Quest
     */
    this.playMedia = function (media) {
        QuestMan.playMedia(media);
        return this;
    };
    /**
     * @param {String} message 
     * @returns Quest
     */
    this.notify = function (message) {
        QuestMan.notify(message);
        return this;
    };

    return this;
}

Quest.INVALID = 'INVALID';

Quest.Status = {
    'Invalid': 0,
    'Hidden': 1,
    'Active': 2,
    'Completed': 3,
    'Failed': 4
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

Quest.Behavior = {
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
 * @param string name
 * @param string title
 * @param string details
 * @param number objective
 * @returns QuestStage
 */
function QuestStage(name, title, details, objective) {

    var _S = {
        'name': name,
        'title': title,
        'details': details,
        'objective': objective
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
    this.dump = function () {
        return {
            'name': _S.name,
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
    this.check = function () { };
    /**
     * @param {Boolean} fullName show as QuestName.StageName (true) or only as StageName (false:default)
     * @returns String
     */
    this.name = function (fullName) { return typeof fullName === 'boolean' && fullName ? this.quest() + '.' + _S.name : _S.name; };
    /**
     * @returns String
     */
    this.stageId = () => _S.name;
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
    this.value = function () {
        return this.db().get(this.quest(), this.name());
    };
    /**
     * @returns Number
     */
    this.current = function () { return this.value(); };
    /**
     * Complete this stage if still in progress
     * @returns Number
     */
    this.complete = function () {
        if (this.status() < Quest.Status.Completed) {
            this.db().set(this.quest(), this.name(), this.objective());
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
    this.update = function (amount) {
        if (this.value() + amount < this.objective()) {
            this.db().update(this.quest(), this.name(), amount);
        }
        else {
            this.db().set(this.quest(), this.name(), this.objective());
        }
        //this.check();
        return this.status();
    };
    /**
     * @returns Float
     */
    this.progress = function () {
        return this.value() / parseFloat(this.objective());
    };
    /**
     * @returns Number
     */
    this.status = function () {
        return this.completed() ? Quest.Status.Completed : Quest.Status.Active;
    }
    /**
     * @returns Boolean
     */
    this.completed = function () {
        return this.value() >= this.objective();
    };
    /**
     * @returns QuestStage
     */
    this.reset = function () {
        //console.log( this.name());
        this.db().set(this.quest(), this.name(), 0);
        return this;
    };

    return this;
};



///////////////////////////////////////////////////////////////////////////////////////////////////
////    Functions
///////////////////////////////////////////////////////////////////////////////////////////////////



/**
 * @param {String} quest
 * @param {String} stage
 * @returns Number
 */
function quest_status(quest, stage) {
    var q = QuestMan.quest(quest);
    if (q !== null) {
        if (typeof stage === 'string' && stage.length) {
            var s = q.stage(stage);
            return s !== false && !s.completed() ? Quest.Status.Active : Quest.Status.Completed;
        }
        return q.status();
    }

    QuestMan.DebugLog('Invalid quest ID ' + quest);

    return Quest.Status.Invalid;
}
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
    var q = QuestMan.quest(quest);
    if (q !== null) {
        if (q.active()) {
            if (typeof stage === 'string' && stage.length) {
                //stages
                var s = q.stage( stage );
                if( q.behavior() === Quest.Behavior.Linear ){
                    return s !== false && !s.completed() && s.name() === q.current().name();
                }
                return s !== false && !s.completed();
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
    var q = QuestMan.quest( quest );
    if (q !== null) {
        if (typeof stage === 'string' && stage.length) {
            var s = q.stage(stage);
            return s !== false && s.completed();
        }
        return q.completed();
    }
    return false;
}
/**
 * @param {String} name 
 * @returns Boolean
 */
function quest_ready(name) {
    return quest_status(name) === Quest.Status.Hidden;
}
/**
 * @param {String} name 
 * @returns Boolean
 */
function quest_failed(name) {
    return quest_status(name) === Quest.Status.Failed;
}
/**
 * Start a quest
 * @param {String} quest 
 * @returns Boolean
 */
function quest_start(quest) {
    var q = QuestMan.quest(quest);
    if (q !== null) {
        return q.start();
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
    var q = QuestMan.quest(quest);
    if (q !== null) {
        return q.update(stage || '', progress);
    }

    QuestMan.DebugLog('Invalid quest ID ' + quest);

    return false;
}
/**
 * Complete a quest or quest stage
 * @param {String} name Quest or Quest.Stage ID
 * @param {String} stage
 * @returns Boolean
 */
function quest_complete(quest, stage) {

    var q = QuestMan.quest(quest);
    if (q !== null) {
        return typeof stage === 'string' && stage.length ?
        q.complete(stage) :
        q.complete();
    }

    QuestMan.DebugLog('Invalid quest ID ' + quest);

    return false;
}
/**
 * Cancel a quest
 * @param {String} quest
 */
function quest_cancel(quest) {
    var q = QuestMan.quest(quest);
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

    var q = QuestMan.quest(quest);
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
/**
 * @param {String} category 
 * @returns Object
 */
QuestCatWindow.prototype.importCategoryFormat = function (category) {
    return QuestMan.getCategoryFormat(category);
};

QuestCatWindow.prototype.renderCategory = function () {
    var format = this.importCategoryFormat(this.category);
    var text = this.category ? this.category : 'All';
    if (format.color > 0) {
        this.changeTextColor(this.textColor(format.color));
    }
    if (format.icon > 0) {
        var base_line = Math.max((28 - this.standardFontSize()) / 2, 0);
        this.drawIcon(format.icon, 0, base_line);
    }
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
QuestDetailWindow.prototype.completedItemOpacity = function () { this.contents.paintOpacity = 192; };
QuestDetailWindow.prototype.debugItemOpacity = function () { this.contents.paintOpacity = 128; };
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

    //var y = line + line_height;
    var y = line;

    //split text in lines
    quest.displayDetail(50).forEach(function (line) {
        y += line_height;
        _renderer.drawTextEx(line, 0, y, width);
    });

    this.drawHorzLine(line);

    //RENDER STAGES
    var behavior = quest.behavior();
    var _debugHidden = false;
    var _debug = QuestMan.debug();
    var _stages = _debug || quest.status() > Quest.Status.Active ? quest.stages(true) : quest.visibleStages();
    y = height - (line_height * 2) - (line_height + 8) * _stages.length;
    _stages.forEach(function (stage) {

        var progress = stage.current();
        var objective = stage.objective();

        var text = objective > 1 ? stage.title() + ' ( ' + progress + ' / ' + objective + ' )' : stage.title();

        if (_debugHidden) {
            _renderer.debugItemOpacity();
        }
        else if (progress < objective) {
            _renderer.drawIcon(QuestMan.icon('active'), 0, y + 4);
            _renderer.changeTextColor(_renderer.normalColor());
        }
        else {
            _renderer.drawIcon(QuestMan.icon('completed'), 0, y + 4);
            _renderer.completedItemOpacity();
        }
        _renderer.drawText(text, 35, base_line + y);
        //_renderer.drawTextEx( text, 35, y , width - 35 );
        _renderer.changeTextColor(_renderer.normalColor());
        _renderer.changePaintOpacity(true);

        y += line_height + 8;

        if (_debug && !_debugHidden && behavior === Quest.Behavior.Linear && progress < objective) {
            _debugHidden = true;
        }
    });

    this.drawGauge(0, height - line_height * 2, width, quest.progress(), this.textColor(4), this.textColor(6));

    // REWARD
    if (quest.reward().length) {
        if (quest.status() < Quest.Status.Completed) {
            _renderer.changeTextColor(_renderer.textColor(8));
        }
        var rewardTag = QuestMan.string('reward', '');
        this.drawTextEx(rewardTag.length > 0 ?
            rewardTag + ': ' + quest.reward() :
            quest.reward(), 0, height - line_height, width);
    }

    // STATUS
    switch (quest.status()) {
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
    this.drawText(quest.displayStatus(), 0, height - line_height, width, 'right');
    this.changeTextColor(this.normalColor());
};
/**
 * @description Empty quest window
 */
QuestDetailWindow.prototype.renderEmptyQuest = function () {

    var y = this.contentsHeight() / 3 - this.standardFontSize() / 2 - this.standardPadding();

    this.drawText("-- Empty log --", 10, y, this.contentsWidth(), 'center');

    this.changeTextColor(this.textColor(8));
    this.drawText("Select a quest category with Left and Right", 0, y + 40, this.contentsWidth(), 'center');
    this.drawText("Select a quest with Up and Down", 0, y + 80, this.contentsWidth(), 'center');
    this.drawText("Switch the quest status filter with Action", 0, y + 120, this.contentsWidth(), 'center');
    this.changeTextColor(this.normalColor(8));
};

(function (Q) {

    QuestManager_registerMenu();
    QuestManager_RegisterQuestData();
    QuestManager_registerCommands();
    QuestManager_registerNewGame();

})( /* autorun */);

