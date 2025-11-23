//=============================================================================
// KunSpecialEvents.js
//=============================================================================
/*:
 * @filename KunSpecialEvents.js
 * @plugindesc Custom Event Hooks for Game Start, Load and Random Troops, Displayable Special Event Window and Player Menu Commands
 * @version 2.1
 * @author KUN
 * 
 * 
 * @help
 * 
 * Bind common events to start and load game.
 *  - Set the Game Start Common Event
 *  - Set the Game Load Common Event
 * Now you can call common events for random spawn battles in the maps, running gameover and winning scenes.
 *  - Create a list of troops to run special events once the party wins or loses any battle.
 *  - Define a list of switches and conditions to run such events
 * Create your own event gallery window, to unlock exclusive common events
 *  - Create a common event page list, bind an unlock switch or make them all available with a master unlock switch
 * Bind common events to the player menu, to call the required events anytime from the game.
 *  - Link and give title to some special common events which will be available to the player menu anytime
 * 
 * 
 * COMMANDS:
 * 
 * KunGallery show
 *      Show the Common Event Gallery View
 * 
 * KunGallery menu [active|disabled|hidden]:
 *      Toggle the Event Gallery Menu display mode
 * 
 * KunMenuCommand toggle|set command [enabled,disabled,hidden]
 *      Toggle the custom event menu command in Player Menu
 *      Command is always named as "custom_ID" where ID is the common event ID to run
 * 
 * 
 * @param debug
 * @text Debug
 * @description Show some debug info in console ;)
 * @type Boolean
 * @default false
 * 
 * @param onLoadEvent
 * @text OnLoad Event ID
 * @desc Select the custom event to run after loading a game.
 * @type common_event
 * @default 0
 * 
 * @param onStartEvent
 * @text On Game Start Event ID
 * @desc Select the custom event to run after staring the game
 * @type common_event
 * @default 0
 * 
 * @param onGetItemEvent
 * @text On get item Event ID
 * @desc Select the custom event to run after getting an item
 * @type common_event
 * @default 0
 * 
 * @param itemVar
 * @parent onGetItemEvent
 * @text Item ID Export Variable
 * @desc Set the item variable to export to onGetItemEvent
 * @type Variable
 * @default 0
 * 
 * @param amountVar
 * @parent onGetItemEvent
 * @text Item Amount to be exported on firing OnGetItemEvent
 * @desc Set the item variable to export to onGetItemEvent
 * @type Variable
 * @default 0
 * 
 * @param menuCommonEvents
 * @text Menu Common Events
 * @desc Add common events to the menu
 * @type struct<MenuEvent>[]
 * 
 * @param gameOverEvents
 * @text Troop Events
 * @desc List the Random Troop Custom Events for Victories and Gameovers
 * @type struct<TroopEvent>[]
 * 
 * @param victoryEvents
 * @text Victory Events
 * @desc List the Troop Victoryu Custom Events
 * @type struct<TroopEvent>[]
 * 
 * @param galleryEvents
 * @text Common Event Gallery Pages
 * @type struct<EventPage>[]
 * 
 * @param galleryUnlocker
 * @parent galleryEvents
 * @type switch
 * @text Unlock by Switch
 * @desc Game Switch to unlock all the gallery contents
 * @default 0
 * 
 * @param portraitWindow
 * @text Show Portrait
 * @type boolean
 * @default false
 * 
 * @param galleryColumns
 * @parent galleryEvents
 * @text Page columns
 * @type Number
 * @min 1
 * @max 6
 * @default 1
 * 
 * @param galleryTitle
 * @parent galleryEvents
 * @text Event Pages Menu Text
 * @type text
 * @default Common Event Gallery
 * 
 * @param lockedText
 * @parent galleryEvents
 * @text Locked Text
 * @type Text
 * @default Locked
 * 
 */
/*~struct~MenuEvent:
 * @param title
 * @text Command Title
 * @type text
 * @default Custom Event
 * 
 * @param eventId
 * @text Common Event
 * @desc Select the common event to run
 * @type common_event
 * 
 * @param status
 * @text Command Status
 * @type select
 * @option Enabled
 * @value enabled
 * @option Disabled
 * @value disabled
 * @option Hidden
 * @value hidden
 * @default enabled
 */
/*~struct~TroopEvent:
 * @param tag
 * @text Tag
 * @desc Won't be imported into the game
 * @type text
 * @default New Troop
 * 
 * @param eventId
 * @text Event ID
 * @desc Event ID
 * @type common_event
 * @default 0
 * 
 * @param troopId
 * @text Troop ID
 * @desc Firing Troop ID
 * @type troop[]
 * @default []
 * 
 * @param switchOn
 * @text Switch ON
 * @desc Activate these Switches
 * @type switch[]
 * 
 * @param switchOff
 * @text Switch OFF
 * @desc Disable these Switches
 * @type switch[]
 *
 */
/*~struct~EventPage:
 * @param title
 * @text Page Title
 * @type text
 * @default Archive
 * 
 * @param eventId
 * @text Common Event
 * @type Common_event
 * @default 0
 * 
 * @param switchId
 * @type Switch
 * @text Game Switch
 * @default 0
 * 
 * @param portrait
 * @text Image Portrait
 * @type file
 * @require 1
 * @dir images/enemies/
 * 
 * @param switchOn
 * @text Switch On
 * @type Switch[]
 * @desc List of switches to activate
 * @default []
 * 
 * @param switchOff
 * @text Switch Off
 * @type Switch[]
 * @desc List of switches to activate
 * @default []
 */


/**
 * @class {KunSpecialEvents}
 */
class KunSpecialEvents {

    constructor() {
        if (KunSpecialEvents.__instance) {
            return KunSpecialEvents.__instance;
        }

        KunSpecialEvents.__instance = this;

        this.initialize();
    }
    /**
     * @returns {KunSpecialEvents}
     */
    initialize() {

        const _parameters = KunSpecialEvents.PluginData();

        this._debug = _parameters.debug || false;
        this._onLoadEventId = _parameters.onLoadEvent || 0;
        this._onStartEventId = _parameters.onStartEvent || 0;
        this._onGetItemEvent = _parameters.onGetItemEvent || 0;
        this._itemVar = _parameters.itemVar || 0;
        this._amountVar = _parameters.amountVar;

        //this._galleryMenu = parameters.galleryMenu;
        this._galleryTitle = _parameters.galleryTitle || 'Gallery';
        this._lockedText = _parameters.lockedText || 'Locked';
        this._pageColumns = _parameters.galleryColumns || 1;
        this._showPortrait = _parameters.portraitWindow || false;
        this._pageUnlocker = _parameters.galleryUnlocker || 0;
        this._galleryStatus = _parameters.galleryStatus || KunEventCommand.Status.Hidden;

        this._gameoverEvents = this.createTroops(Array.isArray(_parameters.gameOverEvents) && _parameters.gameOverEvents || []);
        this._victoryEvents = this.createTroops(Array.isArray(_parameters.victoryEvents) && _parameters.victoryEvents || []);
        this._galleryPages = this.createPages(Array.isArray(_parameters.galleryEvents) && _parameters.galleryEvents || []);
        this._customCommands = this.createCommands(Array.isArray(_parameters.menuCommonEvents) && _parameters.menuCommonEvents || []);

        if (this.hasGallery()) {
            //add gallery command
            this._customCommands.push(new KunGalleryCommand(this._galleryStatus));
        }

        return this;
    }


    //// MOVE HERE ALL METHODS FROM KunSpecialEvents function

    /**
     * @returns {Boolean}
     */
    debug() { return this._debug; };


    //PLUGIN DATA IMPORT

    /**
     * @param {Object[]} input 
     * @returns {KunEventTroop[]}
     */
    createTroops(input = []) {
        return input.map(content => {
            return new KunEventTroop(
                content.troopId && content.troopId.length && content.troopId || [],
                content.eventId || 0,
                content.switchOn || 0,
                content.switchOff || 0,
            );
        }).filter(e => e.troops().length);
    }
    /**
     * @param {Object[]} input
     * @returns {KunEventCommand[]}
     */
    createCommands(input = []) {
        return input.map(content => {
            return new KunEventCommand(
                content.eventId,
                content.title,
                content.status,
            );
        }).filter(menu => !!menu.event());
    };
    /**
     * @param {Object[]} input 
     * @returns {KunEventPage[]}
     */
    createPages(input = []) {
        return input.map(content => {
            return new KunEventPage(
                content.title,
                content.eventId,
                content.switchId,
                content.switchOn,
                content.switchOff,
                content.portrait,
            );
        }).filter(page => !!page.eventId());
    };



    // KUN GALLERY PAGES

    /**
     * 
     * @returns {Boolean}
     */
    unlocked() { return this._pageUnlocker && $gameSwitches.value(this._pageUnlocker); };
    /**
     * @returns {Boolean}
     */
    displayPortrait() { return this._showPortrait; };


    // CUYSTOM COMMAND MANAGERS


    /**
     * @returns {KunEventCommand[],String}
     */
    menuCommands(mapname = false) { return mapname ? this._customCommands.map(cmd => cmd.command()) : this._customCommands; };
    /**
     * @returns {Boolean}
     */
    hasCommands() { return this.menuCommands().length > 0; }
    /**
     * @param {String} command 
     * @returns {Boolean}
     */
    hasMenuCommand(command = '') { return command.length && this.menuCommands().some(cmd => cmd.command() === command) > 0; };
    /**
     * @param {String} command 
     * @param {String} status 
     * @returns {Boolean}
     */
    toggle(command = '', status = '') {
        const toggle = this.menuCommands().find(cmd => cmd.command() === command.toLowerCase()) || null;
        return toggle && toggle.set(status || KunEventCommand.Status.Hidden);
    }
    /**
     * @returns {KunEventCommand[]}
     */
    visibleCommands() { return this.menuCommands().filter(command => command.visible()); };
    /**
     * Prepare to save data
     * @returns {Object}
     */
    exportCommands() {
        const commands = {};
        this.menuCommands().forEach(cmd => {
            commands[cmd.command()] = cmd.status();
        });
        KunSpecialEvents.DebugLog('Preparing data for save', commands);
        return commands;
    }
    /**
     * Import from saved data
     * @param {Object} commands 
     * @returns {KunSpecialEvents}
     */
    importCommands(commands = null) {
        KunSpecialEvents.DebugLog('Importing saved commands', commands);
        if (commands) {
            const list = Object.keys(commands);
            this.menuCommands().filter(cmd => list.includes(cmd.command())).forEach(cmd => {
                if (commands.hasOwnProperty(cmd.command())) {
                    cmd.set(commands[cmd.command()]);
                }
            });
        }
        return this;
    }


    //GALLERY MANAGER

    /**
     * @returns {KunEventPage[]}
     */
    galleryPages() { return this._galleryPages; };
    /**
     * @returns {Boolean}
     */
    hasGallery() { return this.galleryPages().length > 0; }
    /**
     * @param {Number} page_id 
     * @param {Boolean} unlocked
     * @returns {KunEventPage}
     */
    getPage(page_id = 0, unlocked = false) {
        if (this.hasGallery()) {
            const pages = this.galleryPages();
            const page = pages[page_id % pages.length];
            return unlocked || page.unlocked() ? page : null;
        }
        return null;
    };
    /**
     * @returns {String}
     */
    galleryTitle() { return this._galleryTitle; };
    /**
     * @returns {Number}
     */
    galleryColumns() { return this._pageColumns; };
    /**
     * @returns {String}
     */
    lockedText() { return this._lockedText; };



    //GENERAL GAME EVENT HANDLERS

    /**
     * @returns {Boolean}
     */
    hasItemEvent() { return this._onGetItemEvent > 0; };
    /**
     * @returns {Boolean}
     */
    hasStartEvent() { return this._onStartEventId > 0; };
    /**
     * @returns {Boolean}
     */
    hasLoadEvent() { return this._onLoadEventId > 0; };
    /**
     * @returns {KunSpecialEvents}
     */
    onLoadEvent() {
        if (this.hasLoadEvent()) {
            this.runCommonEvent(this._onLoadEventId);
            KunSpecialEvents.DebugLog(`Load Event Id ${this._onLoadEventId} Started!`);
        }
        return this;
    };
    /**
     * @returns {KunSpecialEvents}
     */
    onStartEvent() {
        if (this.hasStartEvent()) {
            this.runCommonEvent(this._onStartEventId);
            KunSpecialEvents.DebugLog(`Start Event Id ${this._onStartEventId} Started!`);
        }

        return this;
    };

    /**
    * @param {Number} item_id 
    * @param {Number} amount 
    * @returns {KunSpecialEvents}
    */
    onGetItemEvent(item_id, amount = 0) {
        if (item_id && this._onGetItemEvent > 0) {
            if (this._itemVar > 0) {
                $gameVariables.setValue(this._itemVar, item_id);
            }
            if (this._amountVar > 0) {
                $gameVariables.setValue(this._amountVar, amount);
            }

            this.runCommonEvent(this._onGetItemEvent);
        }
        return this;
    };


    // TROOP WIN/LOSE EVENT MANAGERS

    /**
     * @returns {KunEventTroop[]}
     */
    gameoverEvents() { return this._gameoverEvents; };
    /**
     * @param {Number} troop 
     * @returns {KunEventTroop}
     */
    getGameOver(troop) {
        if (troop) {
            const gameover = this.gameoverEvents().filter(event => event.troops().includes(troop));
            return gameover.length ? gameover[Math.floor(Math.random() * gameover.length)] : null;
        }
        return null;
    };
    /**
     * @returns {Boolean}
     */
    hasTroopEvents() { return this.gameoverEvents().length || this.victoryEvents().length || false; }
    /**
     * @param {Number} troop 
     * @returns 
     */
    runGameOver(troop) {
        const gameover = this.getGameOver(troop);
        KunSpecialEvents.DebugLog( `Running Gameover Event ` , gameover);
        if (gameover) {
            return gameover.run();
        }
        return false;
    };

    /**
     * @returns {KunEventTroop[]}
     */
    victoryEvents() { return this._victoryEvents; };
    /**
     * @param {Number} troop 
     * @returns {KunEventTroop}
     */
    getVictory(troop = 0) {
        if (troop) {
            const victory = this.victoryEvents().filter(event => event.troops().includes(troop));
            return victory.length ? victory[Math.floor(Math.random() * victory.length)] : null;
        }
        return null;
    };
    /**
     * @param {Number} troop 
     * @returns 
     */
    runVictory(troop = 0) {
        const victory = this.getVictory(troop);
        KunSpecialEvents.DebugLog( `Running Victory Event ` , victory);
        if (victory) {
            return victory.run();
        }
        return false;
    };

    //CAPTURE TROOP EVENTS

    /**
     * @returns {Number}
     */
    getGameTroopId() { return $gameTroop._troopId; };
    /**
     * @returns {Boolean}
     */
    checkGameOver() { return this.runGameOver(this.getGameTroopId()); };
    /**
     * @returns {Boolean}
     */
    checkVictory() { this.runVictory(this.getGameTroopId()); };



    //RUN EVENTS AND SWITCHES

    /**
     * @param {Number} event_id 
     * @returns {KunSpecialEvents}
     */
    runCommonEvent(event_id = 0) {
        if (event_id) {
            $gameTemp.reserveCommonEvent(event_id);
        }
        return this;
    };
    /**
     * @param {Number} switch_id 
     * @returns {Boolean}
     */
    getSwitch(switch_id) { return $gameSwitches.value(switch_id); };
    /**
     * 
     * @param {Number} switch_id 
     * @param {boolean} status 
     * @returns {KunSpecialEvents}
     */
    setSwitch(switch_id, status = false) {
        $gameSwitches.setValue(switch_id, status);
        return this;
    }


    //VERSION UTILS

    /**
     * @returns {Boolean}
     */
    static migrate() {
        const manager = KunSpecialEvents.manager();
        if (manager.migrate1()) {
            if (manager.migrate2()) {

            }
        }
    };
    /**
     * Removes $gameParty._kunSpecialEventsMenu and moves it all to the plugin components
     * @returns {Boolean}
     */
    migrate1() {
        if ($gameParty.hasOwnProperty('_kunSpecialEventsMenu')) {
            delete $gameParty._kunSpecialEventsMenu;
            return true;
        }
        return false;
    }
    /**
     * Removes $gameSystem._galleryMenu and $gameSystem._customEventCommands and handles it all
     * from the plugin components
     * @returns {Boolean}
     */
    migrate2() {
        if ($gameSystem._customEventCommands) {
            delete $gameSystem._customEventCommands;
        }
        if ($gameSystem._galleryMenu) {
            delete $gameSystem._galleryMenu;
        }
        return true;
    };


    //GENERAL PLUGIN SETUP

    /**
     * @param {String} message 
     */
    static DebugLog() {
        if (KunSpecialEvents.manager().debug()) {
            console.log('[KunSpecialEvents] ', ...arguments);
        }
    };
    /**
     * @returns {Object}
     */
    static PluginData() {

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

        return _kunPluginReaderV2('KunSpecialEvents', PluginManager.parameters('KunSpecialEvents'));
    };

    /**
     * @returns {KunSpecialEvents}
     */
    static manager() { return KunSpecialEvents.__instance || new KunSpecialEvents(); }
}



/**
 * Menu event handler to associate custom player menu commands to common events
 */
class KunEventCommand {
    /**
     * 
     * @param {Number} event_id 
     * @param {String} title 
     * @param {String} status 
     */
    constructor(event_id = 0, title = '', status = '') {
        this._event_id = event_id || 0;
        //this._command = 'custom_' + this._event_id;
        this._title = title || this.command();
        this._status = status || KunEventCommand.Status.Hidden;
    }
    /**
     * @returns {KunSpecialEvents}
     */
    manager() { return KunSpecialEvents.manager(); }
    /**
     * @returns {String}
     */
    toString() {
        return `${this.title()}(${this.command()})`;
    };
    /**
     * @returns {Number}
     */
    event() { return this._event_id; }
    /**
     * @returns {String}
     */
    command() { return 'custom_' + this.event(); };
    /**
     * @returns {String}
     */
    title() { return this._title; };
    /**
     * @returns {String}
     */
    commandTitle() {
        const _events = $dataCommonEvents;
        return _events.length && $dataCommonEvents[event_id % _events.length].name.replace('#', "//") || this.command();
    };
    /**
     * @returns {String}
     */
    status() { return this._status };
    /**
     * @param {String} status 
     * @returns {Boolean}
     */
    set(status = KunEventCommand.Status.Hidden) {
        if (this.status() !== status) {
            this._status = status;
            return true;
        }
        return false;
    }
    /**
     * @returns {KunEvent}
     */
    run() {
        KunSpecialEvents.manager().runCommonEvent(this.event());
        return this;
    };
    /**
     * @returns {Boolean}
     */
    visible() { return this.status() !== KunEventCommand.Status.Hidden; };
    /**
     * @returns {Boolean}
     */
    enabled() { return this.status() === KunEventCommand.Status.Enabled; };
}

/**
 * @type {KunEventCommand.Status,String}
 */
KunEventCommand.Status = {
    Hidden: 'hidden',
    Disabled: 'disabled',
    Enabled: 'enabled',
    Toggle: 'toggle',
};
/**
 * 
 */
class KunGalleryCommand extends KunEventCommand {
    /**
     * @param {String} status 
     */
    constructor(status = '') {
        super(0, KunSpecialEvents.manager().galleryTitle(), status || KunEventCommand.Status.Hidden);
    }
    /**
     * @returns {String}
     */
    command() { return KunGalleryCommand.Gallery(); }
    /**
     * @returns {KunGalleryCommand}
     */
    run() {
        //super.run();
        Scene_KunEventGallery.Show();
        return this;
    }


    static Gallery() { return 'kungallery' };
}


/**
 * Associate Troops with common events
 */
class KunEventTroop {
    /**
     * @param {Number[]} troop 
     * @param {Number} event 
     * @param {Number} switchId 
     * @param {Number[]} on 
     * @param {Number[]} off 
     */
    constructor(troop = [], event = 0, on = [], off = []) {
        this._troops = Array.isArray(troop) && troop || [troop];
        this._event = event || 0;
        this._on = on || [];
        this._off = off || [];
    }
    /**
     * @returns {Number[]}
     */
    troops() { return this._troops; }
    /**
     * @returns {Number}
     */
    troop() { return this._troops[0] || 0; };
    /**
     * @returns {Number}
     */
    event() { return this._event; };
    /**
     * @returns {Number[]}
     */
    on() { return this._on; };
    /**
     * @returns {Number}
     */
    off() { return this._off; };
    /**
     * @returns {Boolean}
     */
    run() {
        if (this.event()) {
            this.on().forEach(function (gs) {
                $gameSwitches.setValue(gs, true);
            });
            this.off().forEach(function (gs) {
                $gameSwitches.setValue(gs, false);
            });
            KunSpecialEvents.manager().runCommonEvent(this.event());
            return true;
        }
        return false;
    };
}


/**
 * Handle the custom common event menu display
 */
class KunEventPage {
    /**
     * @param {String} title 
     * @param {Number} eventId 
     * @param {Number} switchId 
     * @param {Array|Number} switchOn 
     * @param {Array|Number} switchOff 
     * @param {String} picture 
     */
    constructor(title, eventId = 0, switchId = 0, switchOn = [], switchOff = [], picture = '') {
        this._title = title;
        this._event = eventId || 0;
        this._gameSwitch = switchId || 0;
        this._on = Array.isArray(switchOn) ? switchOn : [switchOn];
        this._off = Array.isArray(switchOff) ? switchOff : [switchOff];
        this._picture = picture || '';
    };
    /**
     * @returns {KunSpecialEvents}
     */
    manager() { return KunSpecialEvents.manager(); }
    /**
     * @returns {String}
     */
    title() {
        return this._title;
    };
    /**
     * @returns {String}
     */
    eventId() {
        return this._event;
    };
    /**
     * @returns {String}
     */
    switchId() {
        return this._gameSwitch;
    };
    /**
     * @returns {String}
     */
    picture() {
        return this._picture;
    };
    /**
     * @returns {Boolean}
     */
    hasPicture() {
        return this._picture.length > 0;
    };
    /**
     * @returns {KunEventPage}
     */
    on() {
        this._on.forEach(switch_id => {
            this.manager().setSwitch(switch_id, true);
        });
        return this;
    };
    /**
     * @returns {KunEventPage}
     */
    off() {
        this._off.forEach(switch_id => {
            this.manager().setSwitch(switch_id, false);
        });
        return this;
    };
    /**
     * @param {Boolean} unlocked
     * @returns {Boolean}
     */
    run(unlocked = false) {
        if (this.eventId() && (this.unlocked() || unlocked)) {
            this.on().off();
            this.manager().runCommonEvent(this.eventId());
            KunSpecialEvents.DebugLog(`Running Common Event Id ${this.eventId()}`);
            return true;
        }
        return false;
    };
    /**
     * @returns {Boolean}
     */
    unlocked() { return this.switchId() ? KunSpecialEvents.manager().getSwitch(this.switchId()) : true; }
}



/**
 * 
 */
function KunSpecialEvents_Setup_Menu() {

    const _kunSpecialEvents_CustomCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function () {
        _kunSpecialEvents_CustomCommands.call(this);

        KunSpecialEvents.manager().visibleCommands().forEach(cmd => {
            this.addCommand(cmd.title(), cmd.command(), cmd.enabled());
        });
    };

    const _kunSpecialEvents_CustomCommandEvent = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function () {
        _kunSpecialEvents_CustomCommandEvent.call(this);
        this.commandCustomEvent();
    };

    Scene_Menu.prototype.commandCustomEvent = function () {
        KunSpecialEvents.manager().menuCommands()
            .filter(cmd => cmd.visible())
            .forEach(cmd => {
                this._commandWindow.setHandler(cmd.command(), (function (command) {
                    KunSpecialEvents.DebugLog(command);
                    //should pop if gallery?
                    this.popScene();
                    command.run();
                }).bind(this, cmd));
            });
    };
}


function KunSpecialEvents_Setup_Battle() {
    //OVERRIDE BATTLEMANAGER UPDATES
    BattleManager.updateBattleEnd = function () {
        switch (true) {
            case this.isBattleTest():
                AudioManager.stopBgm();
                SceneManager.exit();
                break;
            case !this._escaped && $gameParty.leader().isDead():
                //case !this._escaped && $gameParty.isAllDead():
                //CHECK CAN-LOSE FLAG, THEN THE PLUGIN CUSTOM EVENTS
                KunSpecialEvents.DebugLog('Running Gameovers',this.isRandomTroop());
                if (this._canLose || KunSpecialEvents.manager().checkGameOver()) {
                    $gameParty.reviveBattleMembers();
                    SceneManager.pop();
                }
                else {
                    SceneManager.goto(Scene_Gameover);
                }
                break;
            default:
                SceneManager.pop();
                break;
        }
        this._phase = null;
    };

    //DO NOT OVERRIDE YET, THIS MUST FIRE ONLY WHEN IS A MAP GENERATED TROOP BATTLE, NOT A COMMON EVENT BATTLE!

    const _KunSpecialEvents_BattleManager_Victory = BattleManager.processVictory;
    BattleManager.processVictory = function () {
        _KunSpecialEvents_BattleManager_Victory.call(this);

        if (this.isRandomTroop()) {
            //surprise troop?
            KunSpecialEvents.manager().checkVictory();
        }
    };

    //OVERRIDE BattleManager and random executing encounter methods to mark if can attach victory event

    /**
     * @returns {Boolean}
     */
    Game_Player.prototype.executeEncounter = function () {
        if (!$gameMap.isEventRunning() && this._encounterCount <= 0) {
            this.makeEncounterCount();
            var troopId = this.makeEncounterTroopId();
            if ($dataTroops[troopId]) {
                BattleManager.setup(troopId, true, false, true);
                BattleManager.onEncounter();
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };
    /**
     * @param {Number} troopId 
     * @param {Boolean} canEscape 
     * @param {Boolean} canLose 
     * @param {Boolean} mapEncounter 
     */
    BattleManager.setup = function (troopId, canEscape, canLose, mapEncounter = false) {
        //vanilla initializers
        this.initMembers();
        this._canEscape = canEscape;
        this._canLose = canLose;
        //add map encounter flag (KunSpecialEvents)
        this._mapEncounter = mapEncounter;

        $gameTroop.setup(troopId);
        $gameScreen.onBattleStart();
        this.makeEscapeRatio();
    };
    /**
     * @returns {Boolean}
     */
    BattleManager.isRandomTroop = function () {
        return this._mapEncounter || false;
        //return typeof this._mapEncounter === 'boolean' && this._mapEncounter;
    };
}

/**
 * 
 */
function KunSpecialEvents_System_Load() {
    const _KunSpecialEvents_GameSystem_onLoad = Game_System.prototype.onAfterLoad;
    Game_System.prototype.onAfterLoad = function () {
        _KunSpecialEvents_GameSystem_onLoad.call(this);
        KunSpecialEvents.manager().onLoadEvent();
    }
}
/**
 * 
 */
function KunSpecialEvents_Scene_NewGame() {
    const _KunSpecialEvents_SceneTitle_NewGame = Scene_Title.prototype.commandNewGame;
    Scene_Title.prototype.commandNewGame = function () {
        _KunSpecialEvents_SceneTitle_NewGame.call(this);
        KunSpecialEvents.manager().onStartEvent();
    }
}
/**
 * DataManager to handle actor's attributes
 */
function KunSpecialEvents_SetupDataManager() {
    //CREATE NEW
    const _KunSpecialEvents_DataManager_Create = DataManager.createGameObjects;
    DataManager.createGameObjects = function () {
        _KunSpecialEvents_DataManager_Create.call(this);
    };
    const _KunSpecialEvents_DataManager_Save = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function () {
        const contents = _KunSpecialEvents_DataManager_Save.call(this);
        contents.gameSpecialMenu = KunSpecialEvents.manager().exportCommands();
        return contents;
    };
    //LOAD
    const _KunSpecialEvents_DataManager_Load = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function (contents) {
        _KunSpecialEvents_DataManager_Load.call(this, contents);
        KunSpecialEvents.manager().importCommands(contents.gameSpecialMenu);
    };
}

/**
 * 
 */
function KunSpecialEvents_Setup_Items() {
    const _kunSpecialEvents_GameParty_GainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function (item, amount, includeEquip) {
        _kunSpecialEvents_GameParty_GainItem.call(this, item, amount, includeEquip);

        KunSpecialEvents.manager().onGetItemEvent(item && item.id && 0, amount);
    }
}
/**
 * 
 */
function KunSpecialEvent_Commands() {
    const _KunSpecialEvents_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunSpecialEvents_pluginCommand.call(this, command, args);
        if (command === 'KunSpecialEvents') {
            if (args.length) {
                switch (args[0]) {
                    case 'gallery':
                        if (args.length > 1) {
                            KunSpecialEvents.manager().toggle(
                                KunGalleryCommand.Gallery(),
                                args[1] || KunEventCommand.Status.Hidden
                            );
                        }
                        else {
                            Scene_KunEventGallery.Show();
                        }
                        break;
                    case 'toggle':
                        args[1].split(':').forEach(function (cmd) {
                            KunSpecialEvents.manager().toggle(cmd, args[2] || KunEventCommand.Status.Enabled);
                        });
                        break;
                    case 'migrate':
                        if (KunSpecialEvents.migrate()) {
                            break;
                        }
                        break;
                }
            }
        }
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
////    EVENT PAGE SCENE
/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @Scene_KunEvents
 */
class Scene_KunEventGallery extends Scene_ItemBase {
    /**
     * 
     */
    constructor() {
        super();
    }
    /**
     * @param {Boolean} context 
     */
    prepare(context = false) {
        this._context = context;
    }
    /**
     * @returns {KunSpecialEvents}
     */
    manager() { return KunSpecialEvents.manager(); }

    /**
     * 
     */
    initialize() {
        super.initialize();
        this._context = false;
        this._selected = null;
    }
    /**
     * 
     */
    create() {
        super.create();
        this.setupWindows();
    }
    setupWindows() {

        this._titleWindow = new Window_KunPageTitle();
        this.addWindow(this._titleWindow);

        this._listWindow = new Window_KunPageList();
        //this._listWindow.setHandler('select', this.onUpdatePageIndex.bind(this));
        this._listWindow.setHandler('cancel', this.onClose.bind(this));
        this._listWindow.setHandler('ok', this.onSelectPage.bind(this));
        this.addWindow(this._listWindow);

        this._portraitWindow = null;

        if (Scene_KunEventGallery.DisplayPortrait()) {
            this._portraitWindow = new Window_KunPagePicture();
            this._listWindow.setHelpWindow(this._portraitWindow);
            this.addWindow(this._portraitWindow);
        }
    }
    /**
     * 
     */
    onClose() {
        //this._titleWindow.close();
        //this._listWindow.close();
        if (this._portraitWindow) {
            //this._portraitWindow.close();
        }
        SceneManager.goto(Scene_Map);
    }
    /**
     * @returns {Boolean}
     */
    onSelectPage() {

        this._listWindow.activate();
        if (this._listWindow.index() > -1) {
            const index = this._listWindow.index();
            //create here the new scene
            this._selected = this.manager().getPage(index);
            if (this._selected) {
                SoundManager.playOk();
                this.onClose();
                return true;
            }
        }
        this._listWindow.activate();
        this._listWindow.refresh();
        SoundManager.playCancel();
        return false;
    }
    terminate() {
        if( this._selected ){
            this._selected.run(this.manager().unlocked());
        }
    }
    /**
     * @returns {Boolean}
     */
    static DisplayPortrait() { return KunSpecialEvents.manager().displayPortrait(); }

    /**
     * @returns {Number}
     */
    static TitleHeight() { return 64; }

    /**
     * @param {Boolean} context
     */
    static Show(context = false) {
        SceneManager.push(Scene_KunEventGallery);
        if (SceneManager.isSceneChanging()) {
            SceneManager.prepareNextScene(context);
        }
    }
    /**
     * @returns {String}
     */
    static Context() {
        if (SceneManager._previousClass === Scene_Menu) {
            return 'menu';
        }
        return '';
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
////    EVENT PAGE TITLE WINDOW
/////////////////////////////////////////////////////////////////////////////////////////////////////
class Window_KunPageTitle extends Window_Base {
    constructor() {
        super();
    }
    initialize() {
        super.initialize(0, 0, Graphics.boxWidth, Scene_KunEventGallery.TitleHeight());

        this.setBackgroundType(0);
        this.createContents();
        this.drawText(KunSpecialEvents.manager().galleryTitle(), -2, -2, this.contentsWidth(), 'center');
        this.show();
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
////    EVENT PAGE SELECTION WINDOW
/////////////////////////////////////////////////////////////////////////////////////////////////////
class Window_KunPageList extends Window_Selectable {
    /**
     * 
     */
    constructor() {
        super();
    }
    /**
     * 
     */
    initialize() {

        this._portrait = null;

        const portrait = Scene_KunEventGallery.DisplayPortrait();

        super.initialize(0,
            Scene_KunEventGallery.TitleHeight(),
            portrait ? Graphics.boxWidth / 2 : Graphics.boxWidth,
            Graphics.boxHeight - Scene_KunEventGallery.TitleHeight());

        if (this.countItems() > 0) {
            this.select(0);
        }
        this.refresh();
        //this.show();
        this.activate();

    }
    close() {
        super.close();
    }
    countItems() { return KunSpecialEvents.manager().galleryPages().length; }
    listItems() { return KunSpecialEvents.manager().galleryPages(); }
    /**
     * @returns {Boolean}
     */
    isCurrentItemEnabled() {
        var _page = this.getItem(this.index());
        return _page !== null && (_page.unlocked() || this.unlockAll());
    }
    select(index) {
        if (this.contents) {
            this.contents.clear();
        }

        super.select(index);
        this.refresh();

        if (this.isCurrentItemEnabled()) {
            var item = this.getItem(this.index());
            if (null !== item) {
                this.setHelpWindowItem(this.getItem(this.index()).picture());
            }
            else {
                this.setHelpWindowItem();
            }
        }
        else {
            this.setHelpWindowItem();
        }

        this.callHandler('select');
    }
    /**
     *
     * @param {Number} idx
     * @returns Object
     */
    getItem(idx) {
        return idx > -1 && idx < this.countItems() ? this.listItems()[idx] : null;
    }
    drawItem(idx) {
        if (idx > -1 && idx < this.countItems()) {
            var rect = this.itemRect(idx);
            var page = this.getItem(idx);
            if (page !== null) {
                if (page.unlocked() || this.unlockAll()) {
                    this.changeTextColor(this.normalColor());
                    //this.drawText(page.title(), rect.x, rect.y, rect.width, 'center');
                    this.drawTextEx(page.title(), rect.x, rect.y, rect.width);
                }
                else {
                    this.changeTextColor(this.textColor(8));
                    //this.drawText(KunSpecialEvents.lockedText(), rect.x, rect.y, rect.width, 'center');
                    this.drawTextEx(KunSpecialEvents.manager().lockedText(), rect.x, rect.y, rect.width);
                }
            }
        }
    }
    unlockAll() { return KunSpecialEvents.manager().unlocked(); }
    maxCols() { return KunSpecialEvents.manager().galleryColumns(); }
    maxItems() { return this.countItems(); }
    spacing() { return 32; }
    standardFontSize() { return 20; }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
////    EVENT PAGE PORTRAIT WINDOW
/////////////////////////////////////////////////////////////////////////////////////////////////////
class Window_KunPagePicture extends Window_Base {
    constructor() {
        super();
    }
    initialize() {
        this._portrait = new Sprite();
        super.initialize(
            Graphics.boxWidth / 2,
            Scene_KunEventGallery.TitleHeight(),
            Graphics.boxWidth / 2,
            Graphics.boxHeight - Scene_KunEventGallery.TitleHeight()
        );
        //this.refresh();
    }
    close() {
        this.clear();
        super.close();
    }
    clear() {
        if (this.contents) {
            this.contents.clear();
        }
        if (this._portrait !== null && this._portrait.bitmap) {
            //this._portrait.bitmap.clear();
            this._portrait.bitmap = null;
        }
    }
    setItem(item) {
        this.clear();
        if (typeof item === 'string' && item.length) {
            this._portrait.bitmap = ImageManager.loadEnemy(item);
            var x = (this.contentsWidth() / 2) - (this._portrait.width / 2);
            var y = (this.contentsHeight() / 2) - (this._portrait.height / 2);
            this.contents.blt(this._portrait.bitmap, 0, 0, this._portrait.width, this._portrait.height, x, y);

        }
    }
    refresh() {
        if (this.contents) {
            this.contents.clear();
            //this.drawAllItems();
        }
    }
}


(function ( /* autosetup */) {

    const manager = KunSpecialEvents.manager();

    KunSpecialEvents_SetupDataManager();
    KunSpecialEvent_Commands();
    KunSpecialEvents_Setup_Menu();

    if (manager.hasTroopEvents()) {
        KunSpecialEvents_Setup_Battle();
    }
    if (manager.hasItemEvent()) {
        KunSpecialEvents_Setup_Items();
    }
    if (manager.hasLoadEvent()) {
        KunSpecialEvents_System_Load();
    }
    if (manager.hasStartEvent()) {
        KunSpecialEvents_Scene_NewGame();
    }

})(/* autorun */);



