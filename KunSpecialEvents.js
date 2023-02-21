//=============================================================================
// KunSpecialEvents.js
//=============================================================================
/*:
 * @filename KunSpecialEvents.js
 * @plugindesc Custom Gameover Events and after-load events
 * @author KUN
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
 * @type common_event[]
 * 
 * @param gameOverEvents
 * @text GameOver Events
 * @desc List the GameOver Custom Events
 * @type struct<GameOverEvent>[]
 * 
 * @param galleryEvents
 * @text Common Event Gallery
 * @type struct<CommonEventPage>[]
 * 
 * @param galleryColumns
 * @parent galleryEvents
 * @text Page columns
 * @type Number
 * @min 1
 * @max 3
 * @default 1
 * 
 * @param galleryMenu
 * @parent galleryEvents
 * @text Pages Menu Display Mode
 * @desc show, disable or hide the event pages in menu, can be controlled through commands in-game
 * @type Select
 * @option Enabled
 * @value enabled
 * @option Disabled
 * @value disabled
 * @option Hidden
 * @value hidden
 * @default enabled
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
 * @help
 * What happens when you lose a battle against a random troop/encounter?
 * - you simply can't handle the gameover scenes
 *   or if you really want to show that gameover Y_Y
 * 
 * UNTIL NOW!!! :D
 * here's a quick plugin to hack the gameover scenes
 *   with specific COMMON EVENTS!!
 * 
 * Simply open the list of gameover custom events
 *   in the plugin, and fill the box.
 * 
 * Set each Troop's assigned Common Event which will
 *   be fired IF the party loses against.
 * 
 * You may setup some switches too, select the switches
 *   you want to ACTIVATE, and select those you want to turn OFF
 * 
 * How does it work with the battke manager?
 *  1st - it's a canLoose fight? event handled battles
 *        with canLose will work as usual.
 *  2nd - is there some common event attached? Setup
 *        your common event to this troop's gameover fight!
 *  3rd - go to the vanilla gameover scene! No common event
 *        defined for this troop? no problem, show gameover!
 * 
 * Setup your Troop Gameover Custom Events!
 * Description: just a description for you,
 *           it won't be used in this plugin.
 * Troop ID: choose the troop ID you don't want to show
 *           the boring gameover scene with.
 * Event ID: Choose the custom event ID you want to fire
 *           for this troop upon the battle is lost
 * Switch ON: turn these switches on before start
 *           the Common Event!!
 * Switch OFF: Turn these switches off before start
 *           the common Event!!
 * 
 * Moreover!
 * 
 * You may define custom menus in the player menu by selecting specific common events, which will close the menu and run automatically.
 * 
 * AND!!!
 * 
 * Now you may open an Event Gallery in the player menu!
 * Define a list of events, give them a name, an image to display, and so you can execute each selected common event from the menu gallery
 * 
 * You may run it with the commands:
 * 
 * KunGallery show
 *      Show the Common Event Gallery View
 * 
 * KunGallery menu [active|disabled|hidden]:
 *      Toggle the Event Gallery Menu display mode
 * 
 */
/*~struct~GameOverEvent:
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
 * @type troop
 * @default 0
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
/*~struct~CommonEventPage:
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
 * @description JayaK Modules
 * @type JayaK
 */
var KUN = KUN || {};

function KunSpecialEvents() {

    _controller = {
        'debug': false,
        'onLoadEventId': 0,
        'onStartEventId': 0,
        'onGetItemEvent': 0,
        'itemVar': 0,
        'amountVar': 0,
        'galleryMenu': KunSpecialEvents.GalleryMenu.Enabled,
        'galleryTitle': 'Gallery',
        'lockedText': 'Locked',
        'pageColumns': 1,
        'gameOverEvents': [
            //list all gameover troop events here
        ],
        'pageEvents': [
            //list all page events here
        ],
        'menuEvents': {
            //list all menu events here
        },
    };
    /**
     * Setters
     */
    this.Set = {
        'Debug': function (debug) { _controller.debug = typeof debug === 'boolean' && debug || false; },
        'OnLoad': (event_id) => _controller.onLoadEventId = parseInt(event_id),
        'OnStart': (event_id) => _controller.onStartEventId = parseInt(event_id),
        'OnGetItem': (event_id) => _controller.onGetItemEvent = parseInt(event_id),
        'ItemVar': (var_id) => _controller.itemVar = parseInt(var_id),
        'AmountVar': (var_id) => _controller.amountVar = parseInt(var_id),
        'GalleryMenu': (mode) => _controller.galleryMenu = mode || KunSpecialEvents.GalleryMenu.Enabled,
        'GalleryTitle': (title) => _controller.galleryTitle = title || 'Gallery' ,
        'GalleryColumns': (columns) => _controller.pageColumns = columns || 1,
        'LockedText': (text) => _controller.lockedText = text || 'locked',
    };
    /**
     * @returns Boolean
     */
    this.debug = () => _controller.debug;
    /**
     * @param {Number} evend_id 
     * @returns 
     */
    this.addMenuCommand = function (event_id) {

        if (event_id > 0) {
            var name = 'custom_' + event_id;

            if (_controller.menuEvents.hasOwnProperty(name)) {
                return false;
            }

            _controller.menuEvents[name] = {
                'command': name,
                'event_id': event_id,
                'title': function () {
                    return $dataCommonEvents.length > this.event_id ? $dataCommonEvents[this.event_id].name : this.command;
                }
            };
        }
        return false;
    };
    /**
     * @returns Array
     */
    this.listMenuCommands = () => Object.values(_controller.menuEvents);


    /**
     * @param {String} title 
     * @param {Number} event_id 
     * @param {Number} switch_id 
     * @param {String} picture 
     * @param {Array} switches_on 
     * @returns 
     */
    this.addPage = function (title, event_id, switch_id, picture, switches_on, switches_off) {

        _controller.pageEvents.push(new KunEventPage(title, event_id, switch_id, switches_on, switches_off, picture));

        /*_controller.pageEvents.push({
            'title': title,
            'event_id': event_id,
            'switch_id': switch_id || 0,
            'switch_on': switches_on || [],
            'switch_off': switches_off || [],
            'picture': picture || '',
        });*/

        return this;
    };
    /**
     * @returns Number
     */
    this.countPages = () => _controller.pageEvents.length;
    /**
     * @returns Array
     */
    this.listPages = () => _controller.pageEvents;
    /**
     * @param {Number} page_id 
     * @param {Boolean} unlocked
     * @returns Object|null
     */
    this.getPage = function (page_id, unlocked) {
        var page = _controller.pageEvents[page_id];
        if (typeof unlocked === 'boolean' && unlocked) {
            if (!this.getSwitch(page.switch_id)) {
                return null;
            }
        }
        return page;
    };
    /**
     * @param {String} mode 
     * @returns KunSpecialEvents
     */
     this.toggleGalleryMenu = function( mode ){
        //console.log( mode );
        if( typeof mode === 'string' && mode.length > 0 ){
            _controller.galleryMenu =  mode ;
            KunSpecialEvents.PlayerMenu.setStatus( '_galleryMenu' , mode );
        }
        return this;
    };
    /**
     * @returns String
     */
    this.galleryMenuDisplay = function() {

        if( KunSpecialEvents.PlayerMenu.has( '_galleryMenu' ) ){
            return KunSpecialEvents.PlayerMenu.status( '_galleryMenu' );
        }

        return _controller.galleryMenu;
    }
    /**
     * @returns Boolean
     */
    this.showGalleryInMenu = () => this.galleryMenuDisplay() !== KunSpecialEvents.GalleryMenu.Hidden;
    /**
     * @returns String
     */
    this.galleryTitle = () => _controller.galleryTitle;
    /**
     * @returns Number
     */
    this.galleryColumns = () => _controller.pageColumns;
    /**
     * 
     * @returns String
     */
    this.lockedText = () => _controller.lockedText;


    /**
     * @returns Boolean
     */
    this.hasItemEvent = () => _controller.onGetItemEvent > 0;
    /**
     * @returns KunSpecialEvents
     */
    this.onStartEvent = function () {
        if (_controller.onStartEventId > 0) {
            this.runCommonEvent(_controller.onStartEventId);
        }

        return this;
    };
    /**
     * @returns KunSpecialEvents
     */
    this.onLoadEvent = function () {
        if (_controller.onLoadEventId > 0) {
            this.runCommonEvent(_controller.onLoadEventId);
        }
        return this;
    };
    /**
     * @returns Boolean
     */
    this.hasLoadEvent = () => _controller.onLoadEventId > 0;


    /**
    * @param {Number} item_id 
    * @param {Number} amount 
    * @returns 
    */
    this.onGetItemEvent = function (item_id, amount) {
        if (_controller.onGetItemEvent > 0) {
            if (_controller.itemVar > 0) {
                $gameVariables.setValue(_controller.itemVar, item_id);
            }
            if (_controller.amountVar > 0) {
                $gameVariables.setValue(_controller.amountVar, amount);
            }

            this.runCommonEvent(_controller.onGetItemEvent);
        }
        return this;
    };
    /**
     * 
     * @param {Number} troopID 
     * @param {Number} eventID 
     * @param {Array|Number} switchOn 
     * @param {Array|Number} switchOff 
     * @returns KunSpecialEvents
     */
    this.addGameOver = function (troopID, eventID, switchOn, switchOff) {

        _controller.gameOverEvents.push({
            'troop_id': troopID,
            'event_id': eventID,
            'switch_on': switchOn,
            'switch_off': switchOff
        });

        return this;
    };
    /**
     * @param {Number} troopID 
     * @returns Boolean
     */
    this.getGameOver = function (troopID) {
        if (troopID > 0) {
            for (var i = 0; i < _controller.gameOverEvents.length; i++) {
                if (_controller.gameOverEvents[i].troop_id === troopID) {
                    return _controller.gameOverEvents[i];
                }
            }
        }
        return false;
    };
    /**
     * @returns {Array}
     */
    this.gameOverEvents = () => _controller.gameOverEvents;
    /**
     * 
     * @param {Number} troopID 
     * @returns 
     */
    this.runGameOver = function (troopID) {
        var evt = this.getGameOver(troopID);
        if (evt !== false) {
            evt.switch_on.forEach(function (swc) {
                KUN.SpecialEvents.setSwitch(swc, true);
            });

            evt.switch_off.forEach(function (swc) {
                KUN.SpecialEvents.setSwitch(swc, false);
            });
            this.runCommonEvent(evt.event_id);
            return true;
        }
        return false;
    };

    /**
     * @returns Number
     */
    this.getGameTroopId = () => $gameTroop._troopId;
    /**
     * @returns Boolean
     */
    this.checkGameTroop = function () { return this.runGameOver(this.getGameTroopId()); };


    /**
     * @param {Number} event_id 
     * @returns KunSpecialEvents
     */
    this.runCommonEvent = function (event_id) {
        $gameTemp.reserveCommonEvent(event_id);
        return this;
    };
    /**
     * @param {Number} switch_id 
     * @returns Boolean
     */
    this.getSwitch = function (switch_id) {
        return $gameSwitches.value(switch_id);
    };
    /**
     * 
     * @param {Number} switch_id 
     * @param {boolean} status 
     * @returns KunSpecialEvents
     */
    this.setSwitch = function (switch_id, status) {
        $gameSwitches.setValue(switch_id, typeof status === 'boolean' && status || false);
        return this;
    }

    return this;
}
/**
 * 
 */
KunSpecialEvents.GalleryMenu = {
    'Hidden': 'hidden',
    'Disabled': 'disabled',
    'Enabled': 'enabled',
};

KunSpecialEvents.Debug = function (message) {
    console.log(message);
};
/**
 * @type {KunSpecialEvents.PlayerMenu}
 */
KunSpecialEvents.PlayerMenu = {
    'init':function(){
        if( !$gameParty.hasOwnProperty( '_kunSpecialEventsMenu' ) ){
            $gameParty._kunSpecialEventsMenu = {};
        }
        return this;
    },
    /**
     * @param {String} menu_id 
     * @returns 
     */
    'has': function( menu_id ){
        this.init();
        return $gameParty._kunSpecialEventsMenu.hasOwnProperty(menu_id );
    },
    /**
     * @param {String} menu_id 
     * @returns KunSpecialEvents.PlayerMenu
     */
    'status': function( menu_id ){
        this.init();
        return this.has(menu_id) ? $gameParty._kunSpecialEventsMenu[ menu_id ] : '';
    },
    /**
     * @param {String} menu_id 
     * @param {String} status 
     * @returns KunSpecialEvents.PlayerMenu
     */
    'setStatus': function( menu_id , status ){
        this.init();
        $gameParty._kunSpecialEventsMenu[menu_id] = status;
        return this;
    },
};

/**
 * 
 * @param {String} input 
 * @returns Array
 */
KunSpecialEvents.ImportEventPage = function (input) {

    var output = [];

    var data = input.length > 0 ? JSON.parse(input) : [];
    if (data.length) {
        for (var i in data) {
            var page = JSON.parse(data[i]);
            output.push({
                'title': page.title,
                'portrait': page.portrait || '',
                'eventId': parseInt(page.eventId),
                'switchId': parseInt(page.switchId),
                'switchOn': page.switchOn.length > 0 ? JSON.parse(page.switchOn).map((switch_id) => parseInt(switch_id)) : [],
                'switchOff': page.switchOff.length > 0 ? JSON.parse(page.switchOff).map((switch_id) => parseInt(switch_id)) : [],
            });
        }
    }

    return output;
};

/**
 * @param {String} input 
 * @returns Array
 */
KunSpecialEvents.ImportGameOver = function (input) {

    var output = [];

    var data = input.length > 0 ? JSON.parse(input) : [];
    if (data.length) {
        for (var i in data) {
            var evt = JSON.parse(data[i]);
            var switchOn = evt.switchOn.length > 0 ? JSON.parse(evt.switchOn).map((id) => parseInt(id)) : [];
            var switchOff = evt.switchOff.length > 0 ? JSON.parse(evt.switchOff).map((id) => parseInt(id)) : [];
            output.push({
                'troopId': parseInt(evt.troopId),
                'eventId': parseInt(evt.eventId),
                'switchOn': switchOn,
                'switchOff': switchOff
            });
        }
    }
    return output;
};

/**
 * @param {String} input 
 * @returns Array
 */
KunSpecialEvents.ImportCustomMenu = function (input) {

    return typeof input === 'string' && input.length > 0 ? JSON.parse(input) : [];
};


/**
 * 
 * @param {String} title 
 * @param {Number} eventId 
 * @param {Number} switchId 
 * @param {Array|Number} switchOn 
 * @param {Array|Number} switchOff 
 * @param {String} picture 
 * @returns 
 */
function KunEventPage(title, eventId, switchId, switchOn, switchOff, picture) {

    var _page = {
        'title': title,
        'event_id': eventId || 0,
        'switch_id': switchId || 0,
        'switch_on': Array.isArray(switchOn) ? switchOn : [switchOn],
        'switch_off': Array.isArray(switchOff) ? switchOff : [switchOff],
        'picture': picture || '',
    };
    /**
     * @returns String
     */
    this.title = () => _page.title;
    /**
     * @returns String
     */
    this.eventId = () => _page.event_id;
    /**
     * @returns String
     */
    this.switchId = () => _page.switch_id;
    /**
     * @returns String
     */
    this.picture = () => _page.picture;
    /**
     * @returns Boolean
     */
    this.hasPicture = () => _page.picture.length > 0;
    /**
     * @returns KunEventPage
     */
    this.switchOn = function () {
        _page.switch_on.forEach(function (switch_id) {
            KUN.SpecialEvents.setSwitch(switch_id, true);
        });
        return this;
    };
    /**
     * @returns KunEventPage
     */
    this.switchOff = function () {
        _page.switch_off.forEach(function (switch_id) {
            KUN.SpecialEvents.setSwitch(switch_id, false);
        });
        return this;
    };
    /**
     * @param {Boolean} unlocked
     * @returns Boolean
     */
    this.runEvent = function (unlocked) {
        if (_page.event_id > 0 && (this.unlocked() || unlocked)) {
            this.switchOn().switchOff();
            KUN.SpecialEvents.runCommonEvent(_page.event_id);
            return true;
        }

        return false;
    };
    /**
     * @returns Boolean
     */
    this.unlocked = () => _page.switch_id > 0 ? KUN.SpecialEvents.getSwitch(_page.switch_id) : true;

    return this;
}


function kun_special_events_setup_onload() {
    var _KunSpecialEvents_GameLoad = Game_System.prototype.onAfterLoad;
    Game_System.prototype.onAfterLoad = function () {
        _KunSpecialEvents_GameLoad.call(this);
        KUN.SpecialEvents.onLoadEvent();
    }
    var _KunSpecialEvents_SetupNewGame = DataManager.setupNewGame;
    DataManager.setupNewGame = function() {
        _KunSpecialEvents_SetupNewGame.call( this );
        KUN.SpecialEvents.onStartEvent();
    }
}

function kun_special_events_setup_battle() {
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
                if (this._canLose || KUN.SpecialEvents.checkGameTroop()) {
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
}

function kun_special_events_setup_menu() {

    var _kunSpecialEvents_CustomCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function () {
        _kunSpecialEvents_CustomCommands.call(this);

        var _menu = this;

        KUN.SpecialEvents.listMenuCommands().forEach(function (cmd) {
            var title = _menu.convertEscapeCharacters(cmd.title().replace('#', "//"));
            _menu.addCommand(title, cmd.command, true);
        });

        if (KUN.SpecialEvents.showGalleryInMenu()) {
            var enabled = KUN.SpecialEvents.galleryMenuDisplay() === KunSpecialEvents.GalleryMenu.Enabled;
            _menu.addCommand(KUN.SpecialEvents.galleryTitle(), 'kunSpecialEvents', enabled);
        }
    };

    var _kunSpecialEvents_CustomCommandEvent = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function () {

        _kunSpecialEvents_CustomCommandEvent.call(this);

        var _customOptions = KUN.SpecialEvents.listMenuCommands();
        for (var i in _customOptions) {
            this._commandWindow.setHandler(_customOptions[i].command, (function (event_id) {
                this.popScene();
                KUN.SpecialEvents.runCommonEvent(event_id);
            }).bind(this, _customOptions[i].event_id));
        }

        if (KUN.SpecialEvents.showGalleryInMenu()) {
            this._commandWindow.setHandler('kunSpecialEvents', (function () {
                //this.popScene();
                KunEventPageScene.Show(true);
            }).bind(this));
        }
    };
}

function kun_special_events_setup_items() {

    //var _kunSpecialEvents_Command126 = Game_Interpreter.prototype.command126;
    //Game_Interpreter.prototype.command126 = function () {
    //    _kunSpecialEvents_Command126.call(this);
    //}
    //return;

    var _kunSpecialEvents_GainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function (item, amount, includeEquip) {
        _kunSpecialEvents_GainItem.call(this, item, amount, includeEquip);

        if (item !== null && amount > 0) {
            //console.log('OL');
            KUN.SpecialEvents.onGetItemEvent(item.id, amount);
        }
    }
}

function kun_special_events_commands() {
    var _KunItemCrafting_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunItemCrafting_pluginCommand.call(this, command, args);
        //if (command === 'KunSpecialEvents') {
        if (command === 'KunGallery') {
            if ( args && args.length ) {
                switch (args[0]) {
                    case 'show':
                        KunEventPageScene.Show();
                        break;
                    case 'menu':
                        KUN.SpecialEvents.toggleGalleryMenu( args.length > 1 ? args[1] : KunSpecialEvents.GalleryMenu.Enabled );
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
 * @KunEventPageScene
 */
KunEventPageScene = function () {

    this.initialize.apply(this, arguments);

}
KunEventPageScene.prototype = Object.create(Scene_ItemBase.prototype);
KunEventPageScene.prototype.constructor = KunEventPageScene;
KunEventPageScene.prototype.initialize = function () {
    Scene_ItemBase.prototype.initialize.call(this);
};
KunEventPageScene.prototype.create = function () {
    Scene_ItemBase.prototype.create.call(this);
    this.setupWindows();
};
KunEventPageScene.prototype.setupWindows = function () {

    this._titleWindow = new KunPageTitleWindow();
    this.addWindow(this._titleWindow);

    this._listWindow = new KunPageListWindow();
    //this._listWindow.setHandler('select', this.onUpdatePageIndex.bind(this));
    this._listWindow.setHandler('cancel', this.onCancel.bind(this));
    this._listWindow.setHandler('ok', this.onSelectPage.bind(this));
    this.addWindow(this._listWindow);

    this._portraitWindow = new KunPagePictureWindow();
    this._listWindow.setHelpWindow( this._portraitWindow);
    this.addWindow(this._portraitWindow);
};
KunEventPageScene.prototype.onCancel = function () {
    this.onClose();
    this.popScene();
}
KunEventPageScene.prototype.onClose = function () {
    this._titleWindow.close();
    this._listWindow.close();
    this._portraitWindow.close();
}
KunEventPageScene.prototype.onSelectPage = function () {

    if (this._listWindow.index() > -1) {
        var _index = this._listWindow.index();
        //create here the new scene
        var _page = KUN.SpecialEvents.getPage(_index);

        if (_page !== null && _page.runEvent()) {
            this.onClose();
            this.popScene();
            if( KunEventPageScene.Context() === 'menu' ){
                //jump out of the menu scene
                this.popScene();                
            }
            //console.log( `${_index}: ${page.event_id} - ${page.title}` );
            SoundManager.playOk();
            return true;

        }
    }
    this._listWindow.activate();
    this._listWindow.refresh();
    SoundManager.playCancel();
    return false;
}
KunEventPageScene.prototype.onUpdatePageIndex = function () {
    //this._listWindow.reselect();
    //this._listWindow.refresh();
    //this._listWindow.show();
    //this._listWindow.activate();
    //console.log(this._listWindow.index());
};
/**
 * @param {Boolean} context 
 */
KunEventPageScene.Show = function () {
    SceneManager.push(KunEventPageScene);
};
/**
 * @returns String
 */
KunEventPageScene.Context = function(){
    if( SceneManager._previousClass === Scene_Menu ){
        return 'menu';
    }
    return '';
}

/**
 * 
 */
KunEventPageScene.TitleHeight = 64;


/////////////////////////////////////////////////////////////////////////////////////////////////////
////    EVENT PAGE TITLE WINDOW
/////////////////////////////////////////////////////////////////////////////////////////////////////
function KunPageTitleWindow() { this.initialize.apply(this, arguments); }
KunPageTitleWindow.prototype = Object.create(Window_Base.prototype);
KunPageTitleWindow.prototype.constructor = KunPageTitleWindow;
KunPageTitleWindow.prototype.initialize = function () {

    Window_Base.prototype.initialize.call(this, 0, 0, Graphics.boxWidth, KunEventPageScene.TitleHeight);

    this.setBackgroundType(0);
    this.createContents();
    this.drawText(KUN.SpecialEvents.galleryTitle(), -2, -2, this.contentsWidth(), 'center');
    this.show();
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
////    EVENT PAGE SELECTION WINDOW
/////////////////////////////////////////////////////////////////////////////////////////////////////
function KunPageListWindow() { this.initialize.apply(this, arguments); }
KunPageListWindow.prototype = Object.create(Window_Selectable.prototype);
KunPageListWindow.prototype.constructor = KunPageListWindow;
KunPageListWindow.prototype.initialize = function () {

    this._portrait = null;

    Window_Selectable.prototype.initialize.call(this, 0, KunEventPageScene.TitleHeight, Graphics.boxWidth / 2, Graphics.boxHeight - KunEventPageScene.TitleHeight);

    if (this.countItems() > 0) {
        this.select(0);
    }
    this.refresh();
    //this.show();
    this.activate();

};
KunPageListWindow.prototype.close = function () {
    Window_Selectable.prototype.close.call(this);
}
KunPageListWindow.prototype.countItems = function () { return KUN.SpecialEvents.listPages().length; };
KunPageListWindow.prototype.listItems = function () { return KUN.SpecialEvents.listPages(); };
/**
 * @returns Boolean
 */
KunPageListWindow.prototype.isCurrentItemEnabled = function () {
    var _page = this.getItem(this.index());
    return _page !== null && _page.unlocked();
}
KunPageListWindow.prototype.select = function (index) {
    if (this.contents) {
        this.contents.clear();
    }
    
    Window_Selectable.prototype.select.call(this, index);
    this.refresh();

    if( this.isCurrentItemEnabled() ){
        //console.log(this.getItem(this.index()));
        var item = this.getItem( this.index());
        if( null !== item ){
            this.setHelpWindowItem( this.getItem( this.index()).picture());
        }
        else{
            this.setHelpWindowItem( );
        }
    }
    else{
        this.setHelpWindowItem( );
    }
    
    this.callHandler('select');
};
/**
 * 
 * @param {Number} idx 
 * @returns Object
 */
KunPageListWindow.prototype.getItem = function (idx) {
    return idx > -1 && idx < this.countItems() ? this.listItems()[idx] : null;
}
KunPageListWindow.prototype.drawItem = function (idx) {
    if (idx > -1 && idx < this.countItems()) {
        var rect = this.itemRect(idx);
        var page = this.getItem(idx);
        if (page !== null) {
            if (page.unlocked()) {
                this.changeTextColor(this.normalColor());
                this.drawText(page.title(), rect.x, rect.y, rect.width, 'center');
            }
            else {
                this.changeTextColor(this.textColor(8));
                this.drawText(KUN.SpecialEvents.lockedText(), rect.x, rect.y, rect.width, 'center');
            }
        }
    }
};
KunPageListWindow.prototype.maxCols = function () { return KUN.SpecialEvents.galleryColumns(); };
KunPageListWindow.prototype.maxItems = function () { return this.countItems(); };
KunPageListWindow.prototype.spacing = function () { return 32; };
KunPageListWindow.prototype.standardFontSize = function () { return 20; };


/////////////////////////////////////////////////////////////////////////////////////////////////////
////    EVENT PAGE PORTRAIT WINDOW
/////////////////////////////////////////////////////////////////////////////////////////////////////
function KunPagePictureWindow() { this.initialize.apply(this, arguments); }
KunPagePictureWindow.prototype = Object.create(Window_Base.prototype);
KunPagePictureWindow.prototype.constructor = KunPagePictureWindow;
KunPagePictureWindow.prototype.initialize = function () {
    this._portrait = new Sprite();
    Window_Base.prototype.initialize.call(this,
        Graphics.boxWidth / 2,
        KunEventPageScene.TitleHeight,
        Graphics.boxWidth / 2,
        Graphics.boxHeight - KunEventPageScene.TitleHeight );
    //this.refresh();
};
KunPagePictureWindow.prototype.close = function () {
    this.clear();
    Window_Base.prototype.close.call(this);
}
KunPagePictureWindow.prototype.clear = function () {
    if (this.contents) {
        this.contents.clear();
    }
    if (this._portrait !== null && this._portrait.bitmap ) {
        //this._portrait.bitmap.clear();
        this._portrait.bitmap = null;
    }
};
KunPagePictureWindow.prototype.setItem = function (item) {
    this.clear();
    if( typeof item === 'string' && item.length ){
        this._portrait.bitmap = ImageManager.loadEnemy(item);
        var x = (this.contentsWidth() / 2) - (this._portrait.width / 2 );
        var y = (this.contentsHeight() / 2) - (this._portrait.height / 2 );
        this.contents.blt(this._portrait.bitmap, 0, 0, this._portrait.width, this._portrait.height, x, y);
    
    }
};
KunPagePictureWindow.prototype.refresh = function() {
    if (this.contents) {
        this.contents.clear();
        //this.drawAllItems();
    }
};



(function ( /* autosetup */) {

    var parameters = PluginManager.parameters('KunSpecialEvents');
    //console.log( parameters );
    KUN.SpecialEvents = new KunSpecialEvents();
    KUN.SpecialEvents.Set.Debug(parameters['debug'] === 'true');
    KUN.SpecialEvents.Set.OnLoad(parseInt(parameters['onLoadEvent']));
    KUN.SpecialEvents.Set.OnStart(parseInt(parameters.onStartEvent));
    KUN.SpecialEvents.Set.OnGetItem(parseInt(parameters['onGetItemEvent']));
    KUN.SpecialEvents.Set.ItemVar(parseInt(parameters['itemVar']));
    KUN.SpecialEvents.Set.AmountVar(parseInt(parameters['amountVar']));
    KUN.SpecialEvents.Set.GalleryMenu(parameters.galleryMenu);
    KUN.SpecialEvents.Set.GalleryColumns(parameters.galleryColumns);
    KUN.SpecialEvents.Set.GalleryTitle(parameters.galleryTitle);
    KUN.SpecialEvents.Set.LockedText(parameters['lockedText']);

    KunSpecialEvents.ImportGameOver(parameters.gameOverEvents).forEach(function (evt) {
        KUN.SpecialEvents.addGameOver(
            evt.troopId,
            evt.eventId,
            evt.switchOn,
            evt.switchOff);
    });

    KunSpecialEvents.ImportEventPage(parameters.galleryEvents).forEach(function (evt) {
        KUN.SpecialEvents.addPage(
            evt.title,
            evt.eventId,
            evt.switchId,
            evt.portrait,
            evt.switchOn,
            evt.switchOff);
    });

    KunSpecialEvents.ImportCustomMenu(parameters.menuCommonEvents).forEach(function (event_id) {
        KUN.SpecialEvents.addMenuCommand(parseInt(event_id));
    });

    kun_special_events_setup_battle();
    kun_special_events_setup_menu();
    kun_special_events_commands();


    if (KUN.SpecialEvents.hasLoadEvent()) {
        kun_special_events_setup_onload();
    }
    if (KUN.SpecialEvents.hasItemEvent()) {
        kun_special_events_setup_items();
    }

    //console.log( KUN.SpecialEvents.listPageEvents() );

})(/* autorun */);


