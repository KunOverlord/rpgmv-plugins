//=============================================================================
// KunUI.js
//=============================================================================
/*:
 * @filename KunUI.js
 * @plugindesc Setup UI extended layout
 * @author Kun
 * @version 1.44b
 * 
 * 
 * @help
 * 
 * Escape Chars:
 *  {TROOP:[troop_id]} - Show Troop name
 * 
 * 
 * @param debug
 * @type boolean
 * @text Debug Mode
 * @default false
 * 
 * @param battleLayout
 * @text Battle Layout
 * @desc Battle Layout type
 * @type select
 * @option Wide
 * @value wide
 * @option Extended
 * @value extended
 * @option Default
 * @value default
 * @default default
 * 
 * @param equipLayout
 * @text Equip Layout
 * @desc Window Layout
 * @type select
 * @option Default
 * @value default
 * @option Wide
 * @value wide
 * @default default
 * 
 * @param catBefore
 * @text AB Categories First
 * @desc Show A-B categories before the general item categories. False to leave them back.
 * @type boolean
 * @parent equipLayout
 * @default false
 * 
 * @param catA
 * @text Item A Category
 * @desc Define a title for Item A Category. Leave empty for hidden
 * @type text
 * @parent equipLayout
 * 
 * @param catB
 * @text Item B Category
 * @desc Define a title for Item B Category. Leave empty for hidden
 * @type text
 * @parent equipLayout
 * 
 * @param itemListColumns
 * @parent equipLayout
 * @text Item List Columns
 * @desc change the columns of the display item list in player menu
 * @type number
 * @min 1
 * @max 4
 * @default 2
 * 
 * @param gaugeOffset
 * @text Gauge Offset
 * @desc Offset vanilla gauge
 * @type boolean
 * @default false
 * 
 * @param extendedMapName
 * @text Extended Map Name
 * @desc Allow icons and Escape Chars in the map display name
 * @type boolean
 * @default false
 * 
 * @param actorStatus
 * @text Extended Actor Status Tab
 * @desc Show a gauge for XP progress
 * @type boolean
 * @default false
 * 
 * @param fillWindowCommandHeight
 * @text Fill Window Comand Height
 * @type boolean
 * @default false
 *
 * @param extendedMenu
 * @text Extended Choice Menu
 * @desc Allow Icons, colors and random text display (separated by |)
 * @type boolean
 * @default false
 *
 * @param standardFontSize
 * @text Standard Font Size
 * @type number
 * @min 0
 * @default 0
 * 
 * @param standardFontWeight
 * @text Standard Font Weight
 * @parent standardFontSize
 * @type select
 * @option 800
 * @option 700
 * @option 600
 * @option 500
 * @option 400
 * @option 300
 * @option 200
 * @option 100
 * @option 0
 * @default 0
 * 
 * @param standardFontOutline
 * @text STandard Font Outline
 * @parent standardFontSize
 * @type number
 * @min 0
 * @default 0
 * 
 * @param standardPadding
 * @text Standard Padding
 * @parent standardFontSize
 * @type number
 * @min 0
 * @default 0
 * 
 * @param textPadding
 * @text Text Padding
 * @parent standardFontSize
 * @type number
 * @min 0
 * @default 0
 * 
 * @param switchOn
 * @text Switch On Icon
 * @type number
 * @default 0
 * 
 * @param switchOff
 * @text Switch Off Icon
 * @type number
 * @default 0
 * 
 * @param escapeChars
 * @text Extended Escape Chars
 * @type boolean
 * @default false
 * 
 * @param nickName
 * @parent escapeChars
 * @text Enable Nickname Escape Char
 * @desc Keep disabled if causes conflict with other plugins
 * @type boolean
 * @default false
 * 
 * @param showGainItem
 * @type boolean
 * @text Show Gain Item Message
 * @desc requires KunNotifier to display a notification when earned an item.
 * 
 * @param gainItemText
 * @type text[]
 * @text Messages to show the items found
 * @parent showGainItem
 */

/**
 * @class {KunUI}
 */
class KunUI {
    /**
     * 
     */
    constructor() {

        if (KunUI.__instance) {
            return KunUI.__instance;
        }

        KunUI.__instance = this.initialize();
    }
    /**
     * @returns {KunUI}
     */
    initialize() {

        const _parameters = KunUI.PluginData();

        this._debug = _parameters.debug;

        this._itemCatBefore = _parameters.catBefore || false;
        this._itemCatA = _parameters.catA || '';
        this._itemCatB = _parameters.catB || '';
        this._extendMapName = _parameters.extendedMapName;
        this._extendActorStatus = _parameters.actorStatus;
        this._extendedMenu = _parameters.extendedMenu;
        this._commandFullHeight = _parameters.fillWindowCommandHeight;
        this._gaugeOffset = _parameters.gaugeOffset;
        this._equipLayout = _parameters.equipLayout || KunUI.EquipLayout.Default;
        this._escapeChars = _parameters.escapeChars;
        this._nickName = _parameters.nickName;
        this._itemColumns = _parameters.itemListColumns || 2;

        this._battleLayout = _parameters.battleLayout || KunUI.BattleLayout.Default;

        this._showGainItem = _parameters.showGainItem || false;
        this._gainItemText = _parameters.gainItemText || []

        this._icons = {
            'on': _parameters.switchOn || 0,
            'off': _parameters.switchOff || 0,
        };


        return this;
    }


    /**
     * @returns {Boolean}
     */
    showGainItem() {
        return this._showGainItem;
    }
    /**
     * @returns {String}
     */
    gainItemText() {
        return this._gainItemText.length ? this._gainItemText[Math.floor(Math.random() * this._gainItemText.length)] : '';
    }
    /**
     * @param {Object} item 
     * @param {Number} amount 
     * @returns {KunUI}
     */
    lootMessage(item = null, amount = 0) {

        if (item && amount > 0) {
            var icon = item.iconIndex ? `\\I[${item.iconIndex}] ` : '';
            var message = icon + this.gainItemText() + ' ' + item.name;
            if (amount > 1) {
                message += ` (x${amount})`;
            }
            this.KunNotifier(message);
        }
        return this;
    }
    /**
     * @param {String} message 
     */
    KunNotifier(message) {
        if (typeof kun_notify === 'function') {
            kun_notify(message);
        }
    }
    /**
     * @returns {Number}
     */
    itemColumns() {
        return this._itemColumns;
    };
    /**
     * @returns {String}
     */
    equipLayout() {
        return this._equipLayout;
    };
    /**
     * @returns {String}
     */
    battleLayout() {
        return this._battleLayout;
    }
    /**
     * @returns {Boolean}
     */
    extendedEscapeChars() {
        return this._escapeChars;
    };
    /**
     * @returns {Boolean}
     */
    escapeNickName() {
        return this._nickName || false;
    };
    /**
     * @returns {Boolean}
     */
    extendMapName() {
        return this._extendMapName;
    };
    /**
     * @returns {Boolean}
     */
    extendedMenu() {
        return this._extendedMenu;
    };
    /**
     * @returns {Boolean}
     */
    commandFullHeight() {
        return this._commandFullHeight;
    };
    /**
     * @returns {Boolean}
     */
    extendActorStatus() {
        return this._extendActorStatus;
    };
    /**
     * @returns {Boolean}
     */
    gaugeOffset() {
        return this._gaugeOffset;
    };
    /**
     * @returns {Boolean}
     */
    debug() {
        return this._debug;
    };
    /**
     * @returns {Boolean}
     */
    categoriesBefore() {
        return this._itemCatBefore;
    };
    /**
     * @returns {String}
     */
    itemCatA() {
        return this._itemCatA;
    };
    /**
     * @returns {String}
     */
    itemCatB() {
        return this._itemCatB;
    };
    /**
     * @returns {Boolean}
     */
    customCategories() {
        return this.itemCatA().length + this.itemCatB().length;
    };
    /**
     * @returns {Number|String}
     */
    switchIcon(value = false) {
        return value ? this._icons.on : this._icons.off;
    };

    /**
     * @param {*} message 
     */
    static DebugLog(message = '') {
        if (KunUI.instance().debug()) {
            console.log('[ KunUI ]', message);
        }
    };
    /**
     * @returns {Object}
     */
    static PluginData() {
        function _kunPluginParser(key, value) {
            if (typeof value === 'string' && value.length) {
                try {
                    if (/^\{.*\}$|^\[.*\]$/.test(value)) {
                        return JSON.parse(value, _kunPluginParser);
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
            return value;
        };

        var _data = PluginManager.parameters('KunUI');
        var _output = {};
        Object.keys(_data).forEach(function (key) {
            _output[key] = _kunPluginParser(key, _data[key]);
        });
        return _output;
    };


    /**
     * @returns {KunUI}
     */
    static instance() {
        return KunUI.__instance || new KunUI();
    }
}

/**
 * @type {KunUI.EquipLayout|String}
 */
KunUI.EquipLayout = {
    Default: 'default',
    Wide: 'wide',
};
/**
 * @type {KunUI.BattleLayout|String}
 */
KunUI.BattleLayout = {
    Default: 'default',
    Extended: 'extended',
    Wide: 'wide',
};





function KunUI_GainItem_Override() {
    const _KunUI_GameParty_GainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function (item, amount, includeEquip) {
        _KunUI_GameParty_GainItem.call(this, item, amount, includeEquip)
        KunUI.instance().lootMessage(item, amount);
    };
}

function KunUI_ExtendedMenu() {
    Window_Command.prototype.drawItem = function (index) {
        var rect = this.itemRectForText(index);
        var align = this.itemTextAlign();
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawTextEx(this.commandName(index), rect.x, rect.y, rect.width, align);
    };
    Window_Command.prototype.drawItemEx = function (index) {
        var rect = this.itemRectForText(index);
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawTextEx(this.commandName(index), rect.x, rect.y, rect.width);
    }
    Game_Interpreter.prototype.setupChoices = function (params) {
        var choices = params[0].clone().map(function (option) {
            //split to get different texts for the same topic
            var variants = option.split('|');
            return variants.length > 1 ? variants[Math.floor(Math.random() * variants.length)] : variants[0];
        });
        var cancelType = params[1];
        var defaultType = params.length > 2 ? params[2] : 0;
        var positionType = params.length > 3 ? params[3] : 2;
        var background = params.length > 4 ? params[4] : 0;
        if (cancelType >= choices.length) {
            cancelType = -2;
        }
        $gameMessage.setChoices(choices, defaultType, cancelType);
        $gameMessage.setChoiceBackground(background);
        $gameMessage.setChoicePositionType(positionType);
        $gameMessage.setChoiceCallback(function (n) {
            this._branch[this._indent] = n;
        }.bind(this));
    };
}

function KunUI_BattleLayoutExtended() {
    Window_BattleStatus.prototype.numVisibleRows = function () {
        return $gameParty.members().length > 4 ? $gameParty.members().length : 4;
    }
    Window_BattleEnemy.prototype.numVisibleRows = function () {
        return $gameParty.members().length > 4 ? $gameParty.members().length : 4;
    };
    Window_PartyCommand.prototype.numVisibleRows = function () {
        return $gameParty.members().length > 4 ? $gameParty.members().length : 4;
    };
    Window_ActorCommand.prototype.numVisibleRows = function () {
        return $gameParty.members().length > 4 ? $gameParty.members().length : 4;
    };
}

/**
 * Fix gauge's height
 */
function KunUI_AdjustGaugeOffset() {

    Window_Base.prototype.drawGaugeOverride = Window_Base.prototype.drawGauge;
    /**
     * @description Override current gauge's top positon offset
     */
    Window_Base.prototype.drawGauge = function (x, y, width, rate, color1, color2, offset) {
        y = y + (typeof offset === 'number' ? offset : 4);
        this.drawGaugeOverride(x, y, width, rate, color1, color2);
    }
}
/**
 * 
 */
function KunUI_AdjustCommandMenu() {

    var _KunUI_CommandWindow_Create = Scene_Menu.prototype.create;

    Scene_Menu.prototype.create = function () {
        _KunUI_CommandWindow_Create.call(this);
        this._commandWindow.height = this._goldWindow.y;
    }
}
/**
 * 
 */
function KunUI_WindowMapName() {
    Window_MapName.prototype.refresh = function () {
        this.contents.clear();
        if ($gameMap.displayName()) {
            var width = this.contentsWidth();
            this.drawBackground(0, 0, width, this.lineHeight());
            this.drawTextEx($gameMap.displayName(), 0, 0, width);
            //this.drawText($gameMap.displayName(), 0, 0, width, 'center');
        }
    };
};

/**
 * Improve Actor Status Layout
 */
function KunUI_ExtendActorStatus() {

    Window_Status.prototype.drawBlock1 = function (y) {
        this.drawActorName(this._actor, 6, y);
        //this.drawActorClass(this._actor, 456, y);
        this.drawActorNickname(this._actor, 456, y);
    }
    Window_Base.prototype.drawActorClass = function (actor, x, y, width) {
        //width = width || 168;
        width = width || 220;
        this.changeTextColor(this.systemColor());
        this.drawText(actor.currentClass().name, x, y, width);
    };
    /**
     * @param Number x
     * @param Number y
     */
    Window_Status.prototype.drawExpInfo = function (x, y) {
        this.drawActorLevel(this._actor, x, y, 270);
        this.drawActorExpGauge(x, y + this.lineHeight(), 270);
    };
    Window_Base.prototype.drawActorLevel = function (actor, x, y, width) {
        width = width || 100;
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.levelA, x, y, 48);
        this.resetTextColor();
        this.drawText(actor.level, x, y, width, 'right');
    };
    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     */
    Window_Status.prototype.drawActorExpGauge = function (x, y, width) {
        var lineHeight = this.lineHeight();
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.expTotal.format(TextManager.exp), x, y, width);
        this.resetTextColor();
        this.drawText(this._actor.currentExp(), x, y, width, 'right');
        if (!this._actor.isMaxLevel()) {
            var levelExp = (this._actor.nextLevelExp() - this._actor.currentLevelExp());
            var currentExp = Math.abs(this._actor.nextRequiredExp() - levelExp) / levelExp;
            //this.drawGauge(x, y+4, width, currentExp, this.textColor(14), this.textColor(6));
            this.drawGauge(x, y + 4, width, currentExp, this.textColor(3), this.textColor(6));
            this.changeTextColor(this.systemColor());
            this.drawText(TextManager.expNext.format(TextManager.level), x, y + lineHeight, width);
            this.resetTextColor();
            this.drawText(this._actor.nextRequiredExp(), x, y + lineHeight, width, 'right');
        }
    };

    Window_Status.prototype.drawBasicInfo = function (x, y) {
        var lineHeight = this.lineHeight();
        this.drawActorClass(this._actor, x, y);
        this.drawActorHp(this._actor, x, y + lineHeight * 1);
        this.drawActorMp(this._actor, x, y + lineHeight * 2);
        this.drawActorIcons(this._actor, x, y + lineHeight * 4);
    };

    //DRAW HERE THE ACTOR SIDEVIEW ANIMATION SPRITE
    //Window_Status.prototype._KunSetupActorEquipment = Window_Status.prototype.drawEquipments;
    /*Window_Status.prototype.drawEquipments = function(x, y) {
        this._KunSetupActorEquipment( x, y );

        var _spriteStatus = new Sprite_Actor();

    }*/
}

/**
 * Window_ActorCommand
 * Window_PartyCommand
 * Window_BattleActor
 * Window_BattleEnemy
 * Window_BattleStatus
 * Window_BattleSkill
 * Window_BattleItem
 * Window_BattleLog
 * 
     this.createLogWindow();
    this.createStatusWindow();
    this.createPartyCommandWindow();
    this.createActorCommandWindow();
    this.createHelpWindow();
    this.createSkillWindow();
    this.createItemWindow();
    this.createActorWindow();
    this.createEnemyWindow();
    this.createMessageWindow();
    this.createScrollTextWindow();
 */
function KunUI_BattleLayoutWide() {

    KunUI_OverrideActorCommand();
    KunUI_OverridePartyCommand();

    KunUI_OverrideBattleStatus();
    KunUI_OverrideBattleEnemy();
    KunUI_OverrideBattleItemSkill();
    KunUI_OverrideSceneBattle();

}
/**
 * 
 */
function KunUI_OverrideBattleItemSkill() {
    /**
     * @returns {Number}
     */
    Window_BattleSkill.prototype.maxCols = function () {
        return 1;
    };
    /**
     * @returns {Number}
     */
    Window_ItemList.prototype.maxCols = function () {
        return 1;
    };
    /**
     * @returns {Number}
     */
    Window_BattleSkill.prototype.standardFontSize = function () {
        return Window_Base.prototype.standardFontSize.call(this) - 8;
    };
    /**
     * @returns {Number}
     */
    Window_ItemList.prototype.standardFontSize = function () {
        return Window_Base.prototype.standardFontSize.call(this) - 8;
    };
    /*Window_Base.prototype.standardFontSize = function() {
        return 28;
    };*/
}
/**
 * 
 */
function KunUI_OverrideBattleEnemy() {

    /**
     * @returns {Number}
     */
    Window_BattleEnemy.prototype.standardFontSize = function () {
        return Window_Base.prototype.standardFontSize.call(this) - 8;
    };
    /**
     * @returns {Number}
     */
    Window_BattleEnemy.prototype.windowWidth = function () {
        return 256;
        //return Graphics.boxWidth - 192;
    };

    /**
     * @returns {Number}
     */
    Window_BattleEnemy.prototype.windowHeight = function () {
        return Graphics.boxHeigh;
        //return this.fittingHeight(this.numVisibleRows());
    };
    /**
     * @returns {Number}
     */
    Window_BattleEnemy.prototype.numVisibleRows = function () {
        return this.maxItems() || 4;
    };
    /**
     * @returns {Number}
     */
    Window_BattleEnemy.prototype.maxCols = function () {
        return 1;
    };
}
/**
 * 
 */
function KunUI_OverrideSceneBattle() {
    /**
     * @returns {Number}
     */
    Scene_Battle.prototype.standardPadding = function () {
        return this._statusWindow && this._statusWindow.standardPadding() || 18;
    }
    /**
     * 
     */
    Scene_Battle.prototype.createSkillWindow = function () {
        const width = 300;
        const height = Graphics.boxHeight - 56 - this.standardPadding();
        const x = Graphics.boxWidth - width;
        const y = 0;
        this._skillWindow = new Window_BattleSkill(x, y, width, height);
        this._skillWindow.setHelpWindow(this._helpWindow);
        this._skillWindow.setHandler('ok', this.onSkillOk.bind(this));
        this._skillWindow.setHandler('cancel', this.onSkillCancel.bind(this));
        this.addWindow(this._skillWindow);
    };
    /**
     * 
     */
    Scene_Battle.prototype.createItemWindow = function () {
        const width = 300;
        const height = Graphics.boxHeight - 56 - this.standardPadding();
        const y = 0;
        const x = Graphics.boxWidth - width;
        this._itemWindow = new Window_BattleItem(x, y, width, height);
        this._itemWindow.setHelpWindow(this._helpWindow);
        this._itemWindow.setHandler('ok', this.onItemOk.bind(this));
        this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
        this.addWindow(this._itemWindow);
    };

    Scene_Battle.prototype.createEnemyWindow = function () {
        //this._enemyWindow = new Window_BattleEnemy(0, this._statusWindow.y);
        this._enemyWindow = new Window_BattleEnemy(0, 0);
        //this._enemyWindow.x = Graphics.boxWidth - this._enemyWindow.width;
        //this._enemyWindow.x = 0;
        this._enemyWindow.setHandler('ok', this.onEnemyOk.bind(this));
        this._enemyWindow.setHandler('cancel', this.onEnemyCancel.bind(this));
        this.addWindow(this._enemyWindow);
    };
    /**
     * Move battle status window
     */
    Scene_Battle.prototype.updateWindowPositions = function () {
        //var statusX = this._statusWindow.width / 2;
        var statusX = 0;
        if (BattleManager.isInputting()) {
            statusX = Graphics.boxWidth - this._statusWindow.width;
        } else {
            statusX = Graphics.boxWidth;
        }
        if (this._statusWindow.x < statusX) {
            this._statusWindow.x += 16;
            if (this._statusWindow.x > statusX) {
                this._statusWindow.x = statusX;
            }
        }
        if (this._statusWindow.x > statusX) {
            this._statusWindow.x -= 16;
            if (this._statusWindow.x < statusX) {
                this._statusWindow.x = statusX;
            }
        }
    };
}
/**
 * {Window_BattleStatus}
 */
function KunUI_OverrideBattleStatus() {
    /**
     * 
     */
    Window_BattleStatus.prototype.initialize = function () {
        const width = this.windowWidth();
        const height = this.windowHeight();
        const x = Graphics.boxWidth - width;
        const y = 0;
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this.refresh();
        this.openness = 0;
        this._background = 0;
        this.setBackgroundType(0);
    };
    /**
     * @returns {Number}
     */
    Window_BattleStatus.prototype.standardFontSize = function () {
        return Window_Base.prototype.standardFontSize.call(this) - 8;
    };
    /**
     * @returns {Number}
     */
    Window_BattleStatus.prototype.windowWidth = function () {
        return 192;
        return Graphics.boxWidth;
        //return Graphics.boxWidth - 192;
    };

    Window_BattleStatus.prototype.windowHeight = function () {
        return Graphics.boxHeight;
        return Graphics.boxHeight - 56 - this.standardPadding() * 2;
        return this.fittingHeight(this.numVisibleRows());
    };
    /**
     * @returns {Number}
     */
    Window_BattleStatus.prototype.numVisibleRows = function () {
        return this.maxItems() || 4;
        //return 4;
    };
    /**
     * @returns {Number}
     */
    Window_BattleStatus.prototype.maxItems = function () {
        return $gameParty.battleMembers().length;
    };
    /**
     * @returns {Number}
     */
    Window_BattleStatus.prototype.maxCols = function () {
        return 1;
    };
    /**
     * @returns {Number}
     */
    /*Window_BattleStatus.prototype.itemWidth = function(){
        return Math.floor((this.width - this.padding * 2 +
                       this.spacing()) / this.maxCols() - this.spacing());
    }*/
    /**
     * @returns {Number}
     */
    Window_BattleStatus.prototype.itemHeight = function () {
        return this.lineHeight() * 2;
    }
    /**
     * @returns {Number}
     */
    Window_BattleStatus.prototype.fittingHeight = function (numLines) {
        return numLines * this.itemHeight() + this.standardPadding() * 2;
    };
    /**
     * @param {Number} index 
     */
    Window_BattleStatus.prototype.drawItem = function (index) {
        const actor = $gameParty.battleMembers()[index];
        const rect = this.itemRect(index || 0);
        this.drawBasicArea(rect, actor);
        this.drawGaugeArea(rect, actor);
        //this.drawBasicArea(this.basicAreaRect(index), actor);
        //this.drawGaugeArea(this.gaugeAreaRect(index), actor);
    };
    /**
     * @param {Rectangle} rect (x,y,w,h)
     * @param {Game_Actor} actor 
     */
    Window_BattleStatus.prototype.drawBasicArea = function (rect, actor) {
        this.drawActorName(actor, rect.x, rect.y, rect.width, 'right');
        //this.drawActorIcons(actor, rect.x + 156, rect.y, rect.width - 156);
        this.drawActorIcons(actor, rect.x0, rect.y, rect.width - 156);
    };
    /**
     * 
     * @param {Game_Actor} actor 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {String} align
     */
    Window_BattleStatus.prototype.drawActorName = function (actor, x = 0, y = 0, width = 168, align = 'left') {
        width = width || 168;
        this.changeTextColor(this.hpColor(actor));
        this.drawText(actor.name(), x, y, width, align);
    };
    /**
     * @param {Rectangle} rect (x,y,w,h)
     * @param {Game_Actor} actor 
     */
    Window_BattleStatus.prototype.drawGaugeArea = function (rect, actor) {
        if (actor) {
            this.drawActorHp(actor, rect.x, rect.y, rect.width, true);
            this.drawActorMp(actor, rect.x, rect.y + this.lineHeight() / 3, rect.width, true);

            if ($dataSystem.optDisplayTp) {
                //this.drawGaugeAreaWithTp(rect, actor);
                this.drawActorTp(actor, rect.x, rect.y + this.lineHeight() / 1.3, rect.width, true);
            }
            else {
                //this.drawGaugeAreaWithoutTp(rect, actor);
            }
        }
    };
    /**
     * @param {Rectangle} rect (x,y,w,h)
     * @param {Game_Actor} actor 
     */
    Window_BattleStatus.prototype.drawGaugeAreaWithTp = function (rect, actor) {
        this.drawActorHp(actor, rect.x, rect.y, rect.width, true);
        this.drawActorMp(actor, rect.x, rect.y + this.lineHeight() / 2, rect.width, true);
        this.drawActorTp(actor, rect.x, rect.y + this.lineHeight(), rect.width, true);
    };
    /**
     * @param {Rectangle} rect (x,y,w,h)
     * @param {Game_Actor} actor 
     */
    Window_BattleStatus.prototype.drawGaugeAreaWithoutTp = function (rect, actor) {
        this.drawActorHp(actor, rect.x, rect.y, rect.width, true);
        this.drawActorMp(actor, rect.x, rect.y + this.lineHeight() / 2, rect.width, true);

        //this.drawActorHp(actor, rect.x + 0, rect.y, 201 , true );
        //this.drawActorMp(actor, rect.x + 216,  rect.y, 114 , true );
    };

}
/**
 * {Window_BattleStatus}
 */
function KunUI_OverrideActorCommand() {

    /**
     * @returns {Number}
     */
    Window_ActorCommand.prototype.windowWidth = function () {
        return Graphics.boxWidth;
        //return 192;
    };
    /**
     * @returns {Number}
     */
    Window_ActorCommand.prototype.windowHeight = function () {
        return 56 + this.standardPadding();
    };
    /**
     * @returns {Number}
     */
    Window_ActorCommand.prototype.numVisibleRows = function () {
        return 1;
    };
    /**
     * @returns {Number}
     */
    Window_ActorCommand.prototype.maxCols = function () {
        return this.countCommands();
        //return 4;
    };
    /**
     * @returns {Number}
     */
    Window_ActorCommand.prototype.countCommands = function () {
        return this.maxItems() || 4;
    }
    /**
     * @returns {String}
     */
    Window_ActorCommand.prototype.itemTextAlign = function () {
        return 'center';
    };
}
/**
 * {Window_PartyCommand}
 */
function KunUI_OverridePartyCommand() {
    /**
     * @returns {Number}
     */
    Window_PartyCommand.prototype.windowWidth = function () {
        return Graphics.boxWidth;
        return 192;
    };
    /**
     * @returns {Number}
     */
    Window_PartyCommand.prototype.windowHeight = function () {
        return 56 + this.standardPadding();
    };
    /**
     * @returns {Number}
     */
    Window_PartyCommand.prototype.numVisibleRows = function () {
        return 1;
    };
    /**
     * @returns {Number}
     */
    Window_PartyCommand.prototype.maxCols = function () {
        return 2;
    };
    /**
     * @returns {String}
     */
    Window_PartyCommand.prototype.itemTextAlign = function () {
        return 'center';
    };
}

/**
 * Imprive and enlarge Actor Equipment Layout
 */
function KunUI_EquipWideLayout() {
    Window_EquipStatus.prototype.initialize = function (x, y) {
        //var width = this.windowWidth();
        var width = Graphics.boxWidth / 2;
        var height = this.windowHeight();
        //var height = this.windowHeight() + 156;
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this._tempActor = null;
        this.refresh();
    };
    Scene_Equip.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createCommandWindow();
        this.createStatusWindow();
        this.createSlotWindow();
        this.createItemWindow();
        this.refreshActor();
    };
    /**
     * @override
     */
    Scene_Equip.prototype.createHelpWindow = function () {
        this._helpWindow = new Window_Help();
        //this._helpWindow.y = Graphics.boxHeight - this._helpWindow.height;
        this.addWindow(this._helpWindow);
    };
    Scene_Equip.prototype.createCommandWindow = function () {
        var wx = 0;
        var wy = this._helpWindow.height;
        var ww = Graphics.boxWidth;
        this._commandWindow = new Window_EquipCommand(wx, wy, ww);
        this._commandWindow.setHelpWindow(this._helpWindow);
        this._commandWindow.setHandler('equip', this.commandEquip.bind(this));
        this._commandWindow.setHandler('optimize', this.commandOptimize.bind(this));
        this._commandWindow.setHandler('clear', this.commandClear.bind(this));
        this._commandWindow.setHandler('cancel', this.popScene.bind(this));
        this._commandWindow.setHandler('pagedown', this.nextActor.bind(this));
        this._commandWindow.setHandler('pageup', this.previousActor.bind(this));
        this.addWindow(this._commandWindow);
    };
    Scene_Equip.prototype.createStatusWindow = function () {
        var wy = this._commandWindow.height + this._commandWindow.y;
        this._statusWindow = new Window_EquipStatus(0, wy);
        this.addWindow(this._statusWindow);
    };
    Scene_Equip.prototype.createSlotWindow = function () {
        var wx = this._statusWindow.width;
        var wy = this._statusWindow.y;
        var ww = Graphics.boxWidth - this._statusWindow.width;
        var wh = this._statusWindow.height;
        this._slotWindow = new Window_EquipSlot(wx, wy, ww, wh);
        this._slotWindow.setHelpWindow(this._helpWindow);
        this._slotWindow.setStatusWindow(this._statusWindow);
        this._slotWindow.setHandler('ok', this.onSlotOk.bind(this));
        this._slotWindow.setHandler('cancel', this.onSlotCancel.bind(this));
        this.addWindow(this._slotWindow);
    };
    Scene_Equip.prototype.createItemWindow = function () {
        //var wx = this._statusWindow.width;
        //var wy = this._slotWindow.y + this._slotWindow.height;
        //var ww = Graphics.boxWidth - this._statusWindow.width;
        //var wh = this._statusWindow.height - this._slotWindow.height;
        var wx = 0;
        var wy = this._statusWindow.y + this._statusWindow.height;
        var ww = Graphics.boxWidth;
        var wh = Graphics.boxHeight - wy;
        this._itemWindow = new Window_EquipItem(wx, wy, ww, wh);
        this._itemWindow.setHelpWindow(this._helpWindow);
        this._itemWindow.setStatusWindow(this._statusWindow);
        this._itemWindow.setHandler('ok', this.onItemOk.bind(this));
        this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
        this._slotWindow.setItemWindow(this._itemWindow);
        this.addWindow(this._itemWindow);
    };

}

function KunUI_ExtendItemCategories() {

    Window_ItemList.prototype.maxCols = function () {
        return KunUI.instance().itemColumns() || 2;
    };

    Window_ItemList.prototype.includes = function (item) {
        switch (this._category) {
            case 'item':
                return DataManager.isItem(item) && item.itypeId === 1;
            case 'weapon':
                return DataManager.isWeapon(item);
            case 'armor':
                return DataManager.isArmor(item);
            case 'keyItem':
                return this.isKeyItem(item);
            case 'hidden_a':
                return this.isCatAItem(item);
            case 'hidden_b':
                return this.isCatBItem(item);

            default:
                return false;
        }
    };
    /**
     * @param {Game_Item} item 
     * @returns {Boolean}
     */
    Window_ItemList.prototype.isKeyItem = function (item) {
        return DataManager.isItem(item) && item.itypeId === 2;
    };
    /**
     * @param {Game_Item} item 
     * @returns {Boolean}
     */
    Window_ItemList.prototype.isCatAItem = function (item) {
        return DataManager.isItem(item) && item.itypeId === 3;
    };
    /**
     * @param {Game_Item} item 
     * @returns {Boolean}
     */
    Window_ItemList.prototype.isCatBItem = function (item) {
        return DataManager.isItem(item) && item.itypeId === 4;
    };
    /**
     * @returns {Number}
     */
    Window_ItemCategory.prototype.maxCols = function () {
        const ui = KunUI.instance();
        const a = ui.itemCatA() && 1 || 0;
        const b = ui.itemCatB() && 1 || 0;
        return 4 + a + b;
    };
    /**
     * 
     */
    Window_ItemCategory.prototype.makeCommandList = function () {
        this.addCommand(TextManager.item, 'item');

        const kunui = KunUI.instance();

        if (kunui.categoriesBefore()) {
            this.makeHiddenCommandItems();
        }

        this.addCommand(TextManager.weapon, 'weapon');
        this.addCommand(TextManager.armor, 'armor');
        this.addCommand(TextManager.keyItem, 'keyItem');

        if (!kunui.categoriesBefore()) {
            this.makeHiddenCommandItems();
        }
    };

    Window_ItemCategory.prototype.makeHiddenCommandItems = function () {
        const kunui = KunUI.instance();
        if (kunui.itemCatA()) {
            this.addCommand(kunui.itemCatA(), 'hidden_a');
        }
        if (kunui.itemCatB()) {
            this.addCommand(kunui.itemCatB(), 'hidden_b');
        }
    };
}

/**
 * 
 */
function KunUI_Setup_EscapeChars() {
    //Window_Base.prototype.JayaKSetup_escapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    const _KunUI_Escape_Characters = Window_Base.prototype.convertEscapeCharacters;
    /**
     * @param {String} text
     * @returns {String}
     */
    Window_Base.prototype.parseNickName = function (text) {
        const parsed = _KunUI_Escape_Characters.call(this, text);
        if (KunUI.instance().escapeNickName()) {
            //actor nick names
            parsed = parsed.replace(/\x1bAN\[(\d+)\]/gi, function () {
                //get actor by id
                return this.displayNickName(parseInt(arguments[1]));
            }.bind(this));
        }
        return parsed;
    };
    /**
     * @param {String} text 
     * @returns {String}
     */
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        //catch up nickname first (selected by plugin parameter)
        return this.parseNickName(text)
            //bind map Name
            .replace(/\x1bMAP\[(\d+)\]/gi, function () {
                return this.displayMapName(parseInt(arguments[1]));
            }.bind(this))
            //include item names here
            .replace(/\x1bIT\[(\d+)\]/gi, function () {
                //get item by id
                return this.displayItemNote(parseInt(arguments[1]));
            }.bind(this))
            //include item DESCRIPTIONS HERE
            .replace(/\x1bID\[(\d+)\]/gi, function () {
                //get item by id
                return this.displayItemDescription(parseInt(arguments[1]));
            }.bind(this))
            //include item names here
            .replace(/\x1bIN\[(\d+)\]/gi, function () {
                //get item by id
                return this.displayItemName(parseInt(arguments[1]));
            }.bind(this))
            //include item ICONS HERE
            .replace(/\x1bIC\[(\d+)\]/gi, function () {
                //get item by id
                return this.displayItemIcon(parseInt(arguments[1]));
            }.bind(this))
            //Troop Names
            .replace(/\{TROOP:([A-Za-z0-9]+)\}/gi, function () {
                //get troops by Id
                return this.displayTroopName(arguments[1] && parseInt(arguments[1]) || 0);
            }.bind(this))
            //actor class name
            .replace(/\x1bAC\[(\d+)\]/gi, function () {
                //get actor by id
                return this.displayActorClassName(parseInt(arguments[1]));
            }.bind(this))
            //include party member name
            .replace(/\x1bPN\[(\d+)\]/gi, function () {
                //get actor by id
                return this.displayPartyMemberName(parseInt(arguments[1]));
            }.bind(this))
            //Game Skills
            .replace(/\x1bSK\[(\d+)\]/gi, function () {
                //get skill ID
                return this.displaySkillName(parseInt(arguments[1]));
            }.bind(this))
            .replace(/\x1bSI\[(\d+)\]/gi, function () {
                //get skill ID
                return this.displaySkillIcon(parseInt(arguments[1]));
            }.bind(this))
            //enemies
            .replace(/\x1bEN\[(\d+)\]/gi, function () {
                //Enemy Name
                return this.displayEnemyName(parseInt(arguments[1]));
            }.bind(this))
            //switch icon status
            .replace(/{SWITCH:(\d+)\}/g, function () {
                return this.displaySwitchIcon(parseInt(arguments[1]));
            }.bind(this))
            //var icon status(OLD VERSION)
            .replace(/{CHECK:(\d+)\}/g, function () {
                return this.displaySwitchIcon(parseInt(arguments[1]));
            }.bind(this))
            //var icon status
            .replace(/\{VARIS:(\d+\:\d+)\}/gi, function () {
                const compare = arguments[1].split(':');
                return compare.length > 1 ? this.displayVarIcon(parseInt(compare[0]), parseInt(compare[1])) : '#' + arguments[1];
            }.bind(this));
    };
    /**
     * @param {Number} map_id 
     * @returns {String}
     */
    Window_Base.prototype.displayMapName = function (map_id = 0) {
        const map = $dataMapInfos[parseInt(map_id) % $dataMapInfos.length] || null;
        return map && map.name || `MAP_${map_id}`;
    };
    /**
     * @param {Number} gameVar 
     * @param {Number} compare 
     * @returns  {String}
     */
    Window_Base.prototype.displayVarIcon = function (gameVar = 0, compare = 0) {
        const value = !!gameVar && $gameVariables.value(gameVar) === compare;
        const icon = KunUI.instance().switchIcon(value);
        return icon && `\x1bI[${icon}]` || `${value ? 'ON' : 'OFF'}`;
    };
    /**
     * @param {Number} switchVar 
     * @returns  {String}
     */
    Window_Base.prototype.displaySwitchIcon = function (switchVar) {
        if (switchVar > 0) {
            const value = $gameSwitches.value(switchVar);
            const icon = KunUI.instance().switchIcon(value);
            return icon > 0 ? `\x1bI[${icon}]` : `${value ? 'ON' : 'OFF'}`;
        }
        return '#' + switchVar;
    };
    /**
     * @param {Number} actor_id 
     * @returns  {String}
     */
    Window_Base.prototype.displayNickName = function (actor_id) {
        var actor = typeof actor_id === 'number' && actor_id > 0 ? $gameActors.actor(actor_id) : null;
        return actor ? actor.nickname() : `{INVALID_ACTOR_ID[${actor_id}]}`;
    };
    /**
     * @param {Number} actor_id 
     * @returns  {String}
     */
    Window_Base.prototype.displayActorClassName = function (actor_id) {
        var actor = typeof actor_id === 'number' && actor_id > 0 ? $gameActors.actor(actor_id) : null;
        return actor ? actor.currentClass().name : '{INVALID_ACTOR_ID[' + actor_id + ']}';
    };
    /**
     * @param {Number} member_id 
     * @returns {String}
     */
    Window_Base.prototype.displayPartyMemberName = function (member_id) {
        //get actor by id
        if (typeof member_id === 'number' && member_id > 0) {
            member_id--;
            if (member_id < $gameParty.members().length) {
                return $gameParty.members()[member_id].name();
            }
        }
        return `{INVALID_MEMBER_ID[${member_id}]}`;
    };
    /**
     * @param {Number} item_id 
     * @returns  {String}
     */
    Window_Base.prototype.displayItemName = function (item_id) {
        //get item by id
        if (typeof item_id === 'number' && item_id > 0 && item_id < $dataItems.length) {
            //item.name
            return $dataItems[item_id].name;
        }
        return `{INVALID_ITEM_ID[${item_id}]}`;
    };
    /**
     * @param {Number} item_id 
     * @returns  {String}
     */
    Window_Base.prototype.displayItemDescription = function (item_id) {
        //get item by id
        if (typeof item_id === 'number' && item_id > 0 && item_id < $dataItems.length) {
            //item.name
            return $dataItems[item_id].description;
        }
        return `{INVALID_ITEM_ID[${item_id}]}`;
    };
    /**
     * @param {Number} item_id 
     * @returns  {String}
     */
    Window_Base.prototype.displayItemNote = function (item_id) {
        //get item by id
        if (typeof item_id === 'number' && item_id > 0 && item_id < $dataItems.length) {
            //item.name
            return $dataItems[item_id].note;
        }
        return `{INVALID_ITEM_ID[${item_id}]}`;
    };
    /**
     * @param {Number} item_id 
     * @returns  {String}
     */
    Window_Base.prototype.displayItemIcon = function (item_id = 0) {
        //get item by id
        const item = $dataItems[parseInt(item_id) % $dataItems.length] || null;
        if (item) {
            //item.iconIndex
            return item.iconIndex && `\x1bI[${item.iconIndex}]` || '';
        }
        return ' ';
    };
    /**
     * @param {Number} troop_id 
     * @returns {String}
     */
    Window_Base.prototype.displayTroopName = function (troop_id = 0) {
        return troop_id && $dataTroops[troop_id].name || '';
    }
    /**
     * @param {Number} skill_id 
     * @returns  {String}
     */
    Window_Base.prototype.displaySkillName = function (skill_id) {
        //get skill ID
        return typeof skill_id === 'number' && skill_id > 0 && skill_id < $dataSkills.length ?
            $dataSkills[skill_id].name :
            `SKILL_ID[${skill_id}]`;
    };
    /**
     * @param {Number} skill_id 
     * @returns  {String}
     */
    Window_Base.prototype.displaySkillIcon = function (skill_id = 0) {
        //get skill ID
        if (skill_id) {
            //item.iconIndex
            const icon = $dataSkills[skill_id] && $dataSkills[skill_id].iconIndex || 0;
            return icon && `\I[${icon}]` || '';
        }
        return `SKILL_ICON[${skill_id}]`;
    };
    /**
     * @param {Number} enemy_id 
     * @returns  {String}
     */
    Window_Base.prototype.displayEnemyName = function (enemy_id) {
        if (typeof enemy_id === 'number' && enemy_id > 0 && enemy_id < $dataEnemies.length) {
            return $dataEnemies[enemy_id].name;
        }
        return `{INVALID_ENEMY_ID[${enemy_id}]}`;
    };
}



function KunUI_OverrideActorGauges() {
    /**
     * @param {Game_Actor} actor 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width (default 186)
     * @param {Boolean} gaugeOnly
     */
    Window_Base.prototype.drawActorHp = function (actor = null, x = 0, y = 0, width = 186, gaugeOnly = false) {
        if (actor) {
            //width = width || 186;
            const color1 = this.hpGaugeColor1();
            const color2 = this.hpGaugeColor2();
            this.drawGauge(x, y + 4, width, actor.hpRate(), color1, color2);
            if (!gaugeOnly) {
                this.changeTextColor(this.systemColor());
                this.drawText(TextManager.hpA, x, y, 44);
                this.drawCurrentAndMax(
                    actor.hp, actor.mhp, x, y, width || 186,
                    this.hpColor(actor), this.normalColor()
                );
            }
        }
    };
    /**
     * @param {Game_Actor} actor 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width (default 186)
     * @param {Boolean} gaugeOnly
     */
    Window_Base.prototype.drawActorMp = function (actor = null, x = 0, y = 0, width = 186, gaugeOnly = false) {
        //width = width || 186;
        if (actor) {
            const color1 = this.mpGaugeColor1();
            const color2 = this.mpGaugeColor2();
            this.drawGauge(x, y + 4, width, actor.mpRate(), color1, color2);
            if (!gaugeOnly) {
                this.changeTextColor(this.systemColor());
                this.drawText(TextManager.mpA, x, y, 44);
                this.drawCurrentAndMax(
                    actor.mp, actor.mmp, x, y, width || 186,
                    this.mpColor(actor), this.normalColor()
                );
            }
        }
    };
    /**
     * @param {Game_Actor} actor 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width (default 186)
     * @param {Boolean} gaugeOnly
     */
    Window_Base.prototype.drawActorTp = function (actor = null, x = 0, y = 0, width = 96, gaugeOnly = false) {
        //width = width || 96;
        if (actor) {
            const color1 = this.tpGaugeColor1();
            const color2 = this.tpGaugeColor2();
            this.drawGauge(x, y, width, actor.tpRate(), color1, color2);
            if (!gaugeOnly) {
                this.changeTextColor(this.systemColor());
                this.drawText(TextManager.tpA, x, y, 44);
                this.changeTextColor(this.tpColor(actor));
                this.drawText(actor.tp, x + width - 64, y, 64, 'right');
            }
        }
    };
}




(function ( /* autosetup */) {

    const _kunui = KunUI.instance();

    KunUI_OverrideActorGauges();

    switch (_kunui.battleLayout()) {
        case KunUI.BattleLayout.Extended:
            KunUI_BattleLayoutExtended();
            break;
        case KunUI.BattleLayout.Wide:
            KunUI_BattleLayoutWide();
            break;
    }

    if (_kunui.extendedMenu()) {
        KunUI_ExtendedMenu();
    }

    if (_kunui.commandFullHeight()) {
        KunUI_AdjustCommandMenu();
    }

    if (_kunui.extendMapName()) {
        KunUI_WindowMapName();
    }

    if (_kunui.gaugeOffset()) {
        KunUI_AdjustGaugeOffset();
    }

    if (_kunui.extendActorStatus()) {
        KunUI_ExtendActorStatus();
    }

    if (_kunui.customCategories()) {
        KunUI_ExtendItemCategories();
    }

    if (_kunui.extendedEscapeChars()) {
        KunUI_Setup_EscapeChars();
    }

    if (_kunui.equipLayout() === KunUI.EquipLayout.Wide) {
        KunUI_EquipWideLayout();
    }

    if (_kunui.showGainItem()) {
        KunUI_GainItem_Override();
    }

})( /* */);
