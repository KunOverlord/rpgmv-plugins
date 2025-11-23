//=============================================================================
// KunMenuEvents.js
//=============================================================================
/*:
 * @filename KunMenuEvents.js
 * @plugindesc Custom Event Hooks for Game Start, Load and Random Troops, Displayable Special Event Window and Player Menu Commands
 * @version 1.31
 * @author KUN
 * 
 * @help
 * 
 * Create your own event gallery window, to unlock exclusive common events
 *  - Create a common event page list, bind an unlock switch or make them all available with a master unlock switch
 * Bind common events to the player menu, to call the required events anytime from the game.
 *  - Link and give title to some special common events which will be available to the player menu anytime
 * 
 * COMMANDS:
 * 
 * KunMenu gallery {show|enabled|disabled|hidden}
 *      Toggle the gallery menu option among enabled, disabled and hidden
 *      Show the Common Event Gallery View by default
 * 
 * KunMenu toggle|set command [enabled,disabled,hidden]
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
 * @param menuEvents
 * @text Menu Events
 * @desc Add custom event to menu
 * @type struct<Menu>[]
 * 
 * @param galleryEvents
 * @text Gallery Pages
 * @type struct<Gallery>[]
 * 
 * @param galleryUnlocker
 * @parent galleryEvents
 * @type switch
 * @text Unlock Switch
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
 * @text Gallery columns
 * @type number
 * @min 1
 * @max 6
 * @default 1
 * 
 * @param galleryTitle
 * @parent galleryEvents
 * @text Gallery Header
 * @type text
 * @default Gallery
 * 
 * @param lockedText
 * @parent galleryEvents
 * @text Locked Text
 * @type text
 * @default Locked
 * 
 */
/*~struct~Menu:
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
/*~struct~Gallery:
 * @param title
 * @text Page Title
 * @type text
 * @default Archive
 * 
 * @param eventId
 * @text Common Event
 * @type common_event
 * @default 0
 * 
 * @param switchId
 * @type switch
 * @text Game Switch
 * @default 0
 * 
 * @param switchOn
 * @text Switch On
 * @type switch[]
 * @desc List of switches to activate
 * @default []
 * 
 * @param switchOff
 * @text Switch Off
 * @type switch[]
 * @desc List of switches to activate
 * @default []
 * 
 * @param portrait
 * @text Image Portrait
 * @type file
 * @require 1
 * @dir img/faces/
 * 
 * @param portraitid
 * @parent portrait
 * @text Image Portrait ID
 * @type number
 * @min 1
 * @default 1
 */


/**
 * @class {KunMenuEvents}
 */
class KunMenuEvents {

    constructor() {
        if (KunMenuEvents.__instance) {
            return KunMenuEvents.__instance;
        }

        KunMenuEvents.__instance = this;

        this.initialize();
    }
    /**
     * @returns {KunMenuEvents}
     */
    initialize() {

        const _parameters = KunMenuEvents.PluginData();

        this._debug = _parameters.debug || false;

        this._galleryTitle = _parameters.galleryTitle || 'Gallery';
        this._lockedText = _parameters.lockedText || 'Locked';
        this._pageColumns = _parameters.galleryColumns || 1;
        this._showPortrait = _parameters.portraitWindow || false;
        this._pageUnlocker = _parameters.galleryUnlocker || 0;
        this._galleryStatus = _parameters.galleryStatus || KunEventCommand.Status.Hidden;

        this._galleryPages = this.createPages(Array.isArray(_parameters.galleryEvents) && _parameters.galleryEvents || []);
        this._customCommands = this.createCommands(Array.isArray(_parameters.menuEvents) && _parameters.menuEvents || []);

        if (this.hasGallery()) {
            //add gallery command
            this._customCommands.push(new KunGalleryCommand(this._galleryStatus));
        }

        return this;
    }


    //// MOVE HERE ALL METHODS FROM KunMenuEvents function

    /**
     * @returns {Boolean}
     */
    debug() { return this._debug; };


    //PLUGIN DATA IMPORT
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
                content.portraitid,
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
     * @returns {KunEventCommand[]}
     */
    commands() { return this._customCommands; };
    /**
     * @param {String} command 
     * @returns {KunEventCommand}
     */
    command(command = '') { return command && this.commands().find(cmd => cmd.command() === command.toLowerCase()) || null; }
    /**
     * @returns {Boolean}
     */
    empty() { return !this.commands().length; }
    /**
     * @param {String} command 
     * @returns {Boolean}
     */
    has(command = '') { return command && this.commands().some(cmd => cmd.command() === command.toLowerCase()); };
    /**
     * @param {String} command 
     * @param {String} status 
     * @returns {Boolean}
     */
    toggle(command = '', status = '') {
        const cmd = this.command(command);
        return !!cmd && cmd.set(status || KunEventCommand.Status.Hidden);
    }
    /**
     * @param {String} command 
     * @returns {KunEventCommand.Status|String}
     */
    status(command = '') {
        const cmd = this.command(command);
        return cmd && cmd.status() || KunEventCommand.Status.Hidden;
    }
    /**
     * @returns {KunEventCommand[]}
     */
    visibleCommands() { return this.commands().filter(command => command.visible()); };
    /**
     * Prepare to save data
     * @returns {Object}
     */
    exportCommands() {
        const commands = {};
        this.commands().forEach(cmd => {
            commands[cmd.command()] = cmd.status();
        });
        KunMenuEvents.DebugLog('Preparing data for save', commands);
        return commands;
    }
    /**
     * Import from saved data
     * @param {Object} commands 
     * @returns {KunMenuEvents}
     */
    importCommands(commands = null) {
        KunMenuEvents.DebugLog('Importing saved commands', commands);
        if (commands) {
            const list = Object.keys(commands);
            this.commands().filter(cmd => list.includes(cmd.command())).forEach(cmd => {
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
    gallery() { return this._galleryPages; };
    /**
     * @returns {Boolean}
     */
    hasGallery() { return !!this.gallery().length; }
    /**
     * @param {Number} page_id 
     * @param {Boolean} unlocked
     * @returns {KunEventPage}
     */
    getPage(page_id = 0, unlocked = false) {
        if (this.hasGallery()) {
            const pages = this.gallery();
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


    //GENERAL PLUGIN SETUP

    /**
     * @param {String} message 
     */
    static DebugLog() {
        if (KunMenuEvents.manager().debug()) {
            console.log('[KunMenuEvents] ', ...arguments);
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

        return _kunPluginReaderV2('KunMenuEvents', PluginManager.parameters('KunMenuEvents'));
    };

    /**
     * @param {String} command 
     * @returns {Boolean}
     */
    static command(command = '') {
        return ['kunmenuevents', 'kunmenuevent', 'kunmenu'].includes(command.toLowerCase());
    }

    /**
     * @returns {KunMenuEvents}
     */
    static manager() { return KunMenuEvents.__instance || new KunMenuEvents(); }
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
     * @returns {KunMenuEvents}
     */
    manager() { return KunMenuEvents.manager(); }
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
     * @returns {Boolean}
     */
    visible() { return this.status() !== KunEventCommand.Status.Hidden; };
    /**
     * @returns {Boolean}
     */
    enabled() { return this.status() === KunEventCommand.Status.Enabled; };
    /**
     * @param {String} status 
     * @returns {Boolean}
     */
    set(status = '') {
        if (this.status() !== status) {
            this._status = status || KunEventCommand.Status.Hidden;
            return true;
        }
        return false;
    }
    /**
     * @returns {KunEvent}
     */
    run() {
        this.event() && $gameTemp.reserveCommonEvent(this.event());
        return this;
    };
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
        super(0, KunMenuEvents.manager().galleryTitle(), status || KunEventCommand.Status.Hidden);
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
        Scene_KunGallery.Show();
        return this;
    }


    static Gallery() { return 'kungallery' };
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
    constructor(title, eventId = 0, switchId = 0, switchOn = [], switchOff = [], picture = '', pictureid = 0) {
        this._title = title;
        this._event = eventId || 0;
        this._gameSwitch = switchId || 0;
        this._on = Array.isArray(switchOn) ? switchOn : [switchOn];
        this._off = Array.isArray(switchOff) ? switchOff : [switchOff];
        this._picture = picture || '';
        this._pictureid = pictureid && pictureid-1 || 0;
    };
    /**
     * @returns {KunMenuEvents}
     */
    manager() { return KunMenuEvents.manager(); }
    /**
     * @returns {String}
     */
    title() { return this._title; };
    /**
     * @returns {String}
     */
    eventId() { return this._event; };
    /**
     * @returns {String}
     */
    switchId() { return this._gameSwitch; };
    /**
     * @returns {String}
     */
    picture() { return this._picture; };
    /**
     * @returns {Number}
     */
    pictureid() { return this._pictureid; }
    /**
     * @returns {Boolean}
     */
    hasPicture() { return !!this._picture; };
    /**
     * @returns {KunEventPage}
     */
    on() {
        this._on.forEach(switch_id => {
            $gameSwitches.setValue(switch_id, true);
        });
        return this;
    };
    /**
     * @returns {KunEventPage}
     */
    off() {
        this._off.forEach(switch_id => {
            $gameSwitches.setValue(switch_id, false);
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
            $gameTemp.reserveCommonEvent(this.eventId());
            KunMenuEvents.DebugLog(`Running Common Event Id ${this.eventId()}`);
            return true;
        }
        return false;
    };
    /**
     * @returns {Boolean}
     */
    unlocked() { return this.switchId() && $gameSwitches.value(this.switchId()) || true; }
}



/**
 * 
 */
function KunMenuEvents_SetupMenu() {

    const _kunMenuEvents_CustomCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function () {
        _kunMenuEvents_CustomCommands.call(this);

        KunMenuEvents.manager().visibleCommands().forEach(cmd => {
            this.addCommand(cmd.title(), cmd.command(), cmd.enabled());
        });
    };

    const _kunMenuEvents_CustomCommandEvent = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function () {
        _kunMenuEvents_CustomCommandEvent.call(this);
        this.commandCustomEvent();
    };

    Scene_Menu.prototype.commandCustomEvent = function () {
        KunMenuEvents.manager().commands()
            .filter(cmd => cmd.visible())
            .forEach(cmd => {
                this._commandWindow.setHandler(cmd.command(), (function (command) {
                    KunMenuEvents.DebugLog(command);
                    //should pop if gallery?
                    this.popScene();
                    command.run();
                }).bind(this, cmd));
            });
    };
}


/**
 * DataManager to handle actor's attributes
 */
function KunMenuEvents_SetupDataManager() {
    //CREATE NEW
    const _kunMenuEvents_DataManager_Create = DataManager.createGameObjects;
    DataManager.createGameObjects = function () {
        _kunMenuEvents_DataManager_Create.call(this);
    };
    const _kunMenuEvents_DataManager_Save = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function () {
        const contents = _kunMenuEvents_DataManager_Save.call(this);
        contents.gameSpecialMenu = KunMenuEvents.manager().exportCommands();
        return contents;
    };
    //LOAD
    const _kunMenuEvents_DataManager_Load = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function (contents) {
        _kunMenuEvents_DataManager_Load.call(this, contents);
        KunMenuEvents.manager().importCommands(contents.gameSpecialMenu);
    };
}

/**
 * 
 */
function KunMenuEvents_Commands() {
    const _kunMenuEvents_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _kunMenuEvents_pluginCommand.call(this, command, args);
        if (KunMenuEvents.command(command)) {
            const manager = KunMenuEvents.manager();
            if (args.length) {
                switch (args[0]) {
                    case 'gallery':
                        if (args.length > 1) {
                            //const current = manager.status(KunGalleryCommand.Gallery());
                            //const status = args[1] || current === KunEventCommand.Status.Enabled ? 
                            manager.toggle(
                                KunGalleryCommand.Gallery(),
                                args[1] || KunEventCommand.Status.Hidden
                            );
                        }
                        else {
                            Scene_KunGallery.Show();
                        }
                        break;
                    case 'toggle':
                        args[1].split(':').forEach(function (cmd) {
                            manager.toggle(cmd, args[2] || KunEventCommand.Status.Enabled);
                        });
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
class Scene_KunGallery extends Scene_ItemBase {
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
     * @returns {KunMenuEvents}
     */
    manager() { return KunMenuEvents.manager(); }

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
    /**
     * 
     */
    setupWindows() {

        this.setupTitleWindow();
        this.setupListWindow();
        //this.setupImageWindow()();
    }
    /**
     * 
     */
    setupTitleWindow() {
        this._titleWindow = new Window_KunPageTitle();
        this.addWindow(this._titleWindow);
    }
    /**
     * 
     */
    setupListWindow() {
        this._listWindow = new Window_KunPageList();
        //this._listWindow.setHandler('select', this.onUpdatePageIndex.bind(this));
        this._listWindow.setHandler('cancel', this.onClose.bind(this));
        this._listWindow.setHandler('ok', this.onSelectPage.bind(this));
        this.addWindow(this._listWindow);
    }
    /**
     * 
     */
    setupImageWindow() {
        this._portraitWindow = null;

        if (Scene_KunGallery.DisplayPortrait()) {
            this._portraitWindow = new Window_KunPagePicture();
            this._listWindow.setHelpWindow(this._portraitWindow);
            this.addWindow(this._portraitWindow);
        }
    }
    /**
     * 
     */
    onClose() {
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
    /**
     * 
     */
    terminate() {
        if (this._selected) {
            this._selected.run(this.manager().unlocked());
        }
    }

    /**
     * @returns {Boolean}
     */
    static DisplayPortrait() { return KunMenuEvents.manager().displayPortrait(); }

    /**
     * @returns {Number}
     */
    static TitleHeight() { return 64; }

    /**
     * @param {Boolean} context
     */
    static Show(context = false) {
        SceneManager.push(Scene_KunGallery);
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
        super.initialize(0, 0, Graphics.boxWidth, Scene_KunGallery.TitleHeight());

        this.setBackgroundType(0);
        this.createContents();
        this.drawText(KunMenuEvents.manager().galleryTitle(), -2, -2, this.contentsWidth(), 'center');
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
        this._showportrait = Scene_KunGallery.DisplayPortrait();

        if (this.showPostrait()) {
            this.preloadImages();
        }

        //const portrait = Scene_KunGallery.DisplayPortrait();
        const offset = false;

        super.initialize(0,
            Scene_KunGallery.TitleHeight(),
            offset ? Graphics.boxWidth / 2 : Graphics.boxWidth,
            Graphics.boxHeight - Scene_KunGallery.TitleHeight());

        if (this.countItems() > 0) {
            this.select(0);
        }
        this.refresh();
        //this.show();
        this.activate();

    }
    /**
     * @returns {Window_KunPageList}
     */
    preloadImages() {
        const loaded = [];
        const portraits = KunMenuEvents.manager().gallery().filter(page => page.hasPicture()).map(page => page.picture());
        portraits.forEach(portrait => {
            if (!loaded.includes(portrait)) {
                ImageManager.reserveFace(portrait);
                loaded.push(portrait);
            }
        });
        return this;
    }
    /**
     * @returns {Boolean}
     */
    showPostrait() { return this._showportrait; }
    /**
     * @returns {Boolean}
     */
    unlocked() { return KunMenuEvents.manager().unlocked(); }
    /**
     * @returns {Number}
     */
    countItems() { return KunMenuEvents.manager().gallery().length; }
    /**
     * @returns {KunEventPage[]}
     */
    listItems() { return KunMenuEvents.manager().gallery(); }
    /**
     * @returns {Boolean}
     */
    isCurrentItemEnabled() {
        var _page = this.getItem(this.index());
        return _page !== null && (_page.unlocked() || this.unlocked());
    }
    /**
     * @param {Number} index
     * @returns {KunEventPage}
     */
    getItem(index = 0) { return index >= 0 && this.listItems()[index % this.countItems()] || null; }
    /**
     * @param {Number} index 
     */
    select(index = 0) {
        if (this.contents) {
            this.contents.clear();
        }

        super.select(index);
        this.refresh();

        if (this.isCurrentItemEnabled()) {
            const item = this.getItem(this.index());
            this.setHelpWindowItem(item && item.picture() || null);
        }
        else {
            this.setHelpWindowItem();
        }

        this.callHandler('select');
    }
    /**
     * @param {Number} index 
     */
    drawItem(index = 0) {
        const page = this.getItem(index);
        if (page) {
            const rect = this.itemRect(index);
            if (page.unlocked() || this.unlocked()) {
                this.changeTextColor(this.normalColor());
                //console.log(this.itemWidth(),this.itemHeight(),this.maxCols(),this.contentsWidth());
                if( this.showPostrait() ){
                    page.hasPicture() && this.drawFace(page.picture(), page.pictureid(), rect.x, rect.y);
                    this.drawText(page.title(), rect.x, rect.y + 144, rect.width, 'center');
                }
                else{
                    this.drawText(page.title(), rect.x, rect.y, rect.width, 'center');
                }
                //this.drawTextEx(page.title(), rect.x, rect.y, rect.width);
            }
            else {
                this.changeTextColor(this.textColor(8));
                this.drawText(KunMenuEvents.lockedText(), rect.x, rect.y, rect.width, 'center');
                //this.drawTextEx(KunMenuEvents.manager().lockedText(), rect.x, rect.y, rect.width);
            }
        }
    }
    /**
     * @param {String} face 
     * @param {Number} index 
     * @param {Number} x 
     * @param {Number} y 
     */
    drawFace(face, index, x = 0, y = 0) {
        //Window_Base.prototype.drawFace = function(faceName, faceIndex, x, y, width, height) {
        const width = 144;
        const height = 144;
        super.drawFace(face, index, x, y, width, height);
    }
    /**
     * @returns {Number}
     */
    itemWidth() {
        return Math.floor((this.width - this.padding * 2 +
            this.spacing()) / this.maxCols() - this.spacing());
    };
    /**
     * @returns {Number}
     */
    itemHeight() {
        return this.showPostrait() && this.lineHeight() + 144 || this.lineHeight();
    };
    /**
     * @returns {Number}
     */
    maxCols() {
        //return this.showPostrait() && this.contentsWidth() / 144 || KunMenuEvents.manager().galleryColumns();
        return this.showPostrait() && 4 || KunMenuEvents.manager().galleryColumns();
        //return KunMenuEvents.manager().galleryColumns();
    }
    /**
     * @returns {Number}
     */
    maxItems() { return this.countItems(); }
    /**
     * @returns {Number}
     */
    spacing() { return 32; }
    /**
     * @returns {Number}
     */
    standardFontSize() { return 20; }
    /**
     * 
     */
    close() { super.close(); }
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
            Scene_KunGallery.TitleHeight(),
            Graphics.boxWidth / 2,
            Graphics.boxHeight - Scene_KunGallery.TitleHeight()
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

    KunMenuEvents.manager();
    KunMenuEvents_SetupDataManager();
    KunMenuEvents_Commands();
    KunMenuEvents_SetupMenu();

})(/* autorun */);



