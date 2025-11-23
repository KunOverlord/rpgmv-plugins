//=============================================================================
// KunSetupUI.js
//=============================================================================
/*:
 * @filename KunSetupUI.js
 * @plugindesc Setup UI extended layout
 * @author Kun
 * @version 1.1
 * 
 * 
 * @param equipLayout
 * @text Equip Layout
 * @desc Window Layout
 * @type select
 * @option Default
 * @option Wide
 * @default Default
 * 
 * @param categoryA
 * @text Show Item A Category
 * @type Text
 * @parent equipLayout
 * 
 * @param categoryB
 * @text Show Item B Category
 * @type Text
 * @parent equipLayout
 * 
 * @param gaugeOffset
 * @text Gauge Offset
 * @desc Offset vanilla gauge
 * @type Boolean
 * @default false
 * 
 * @param actorStatus
 * @text Extended Actor Status Tab
 * @desc Show a gauge for XP progress
 * @type Boolean
 * @default false
 * 
 * @param extendPartyBattle
 * @text Extend Party Battle Window
 * @desc show all party members in the battle status window
 * @type Boolean
 * @default false
 * 
 * @param fillWindowCommandHeight
 * @text Fill Window Comand Height
 * @type Boolean
 * @default false
 *
 * @param allowWindowCommandIcons
 * @text Allow Window Command Icons
 * @type Boolean
 * @default false
 *
 * @param centerTitleMenu
 * @text Select Title Menu Option Display
 * @type Select
 * @option Left
 * @value left
 * @option Center
 * @value center
 * @option Right
 * @value right
 * @default left
 * 
 * @param titleMenuX
 * @text Title Menu X Pos
 * @parent centerTitleMenu
 * @type Number
 * @min 0
 * @default 0
 * 
 * @param titleMenuY
 * @text Title Menu Y Pos
 * @parent centerTitleMenu
 * @type Number
 * @min 0
 * @default 0
 *
 * @param titleMenuWidth
 * @text Title Menu Width
 * @parent centerTitleMenu
 * @type Number
 * @min 0
 * @default 0
 * 
 * @param titleMenuBackground
 * @text Title Menu Background
 * @parent centerTitleMenu
 * @type Select
 * @option Window
 * @value 0
 * @option Dim
 * @value 1
 * @option None
 * @value 2
 * @default 0
 * 
 * @param titleFontSize
 * @text Title Font Size
 * @type Number
 * @min 0
 * @default 0
 * 
 * @param titleAlign
 * @text Title Align
 * @parent titleFontSize
 * @type Select
 * @option Left
 * @value left
 * @option Center
 * @value center
 * @option Right
 * @value right
 * @default center
 * 
 * @param titlePosX
 * @text Title X position
 * @parent titleFontSize
 * @type Number
 * @min 0
 * @default 0
 * 
 * @param titlePosY
 * @text Title Y position
 * @parent titleFontSize
 * @type Number
 * @min 0
 * @default 0
 * 
 * @param titleOutlineWidth
 * @text Title Outline Width
 * @parent titleFontSize
 * @type Number
 * @min 0
 * @default 0
 * 
 * @param standardFontSize
 * @text Standard Font Size
 * @type Number
 * @min 0
 * @default 0
 * 
 * @param standardFontWeight
 * @text Standard Font Weight
 * @parent standardFontSize
 * @type Select
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
 * @type Number
 * @min 0
 * @default 0
 * 
 * @param standardPadding
 * @text Standard Padding
 * @parent standardFontSize
 * @type Number
 * @min 0
 * @default 0
 * 
 * @param textPadding
 * @text Text Padding
 * @parent standardFontSize
 * @type Number
 * @min 0
 * @default 0
 * 
 *
 * @help
 */

/**
 * @description JayaK Modules
 * @type JayaK
 */
 var KUN = KUN || {};

(function( /* autosetup */ ){

    var parameters = PluginManager.parameters('KunSetupUI');

    KUN.SetupUI = {
        'get': function( setting , value ){
            var _parameters = PluginManager.parameters('KunSetupUI');
            return _parameters.hasOwnProperty( setting ) ? _parameters[setting] : value || '';
        },
        'getInt': function( setting , value ){
            return parseInt( this.get( setting , value || 0) );
        },
        'getArray': function( setting ){
            var _value = this.get( setting , '' );
            return _value.length > 0 ? JSON.parse(_value) : [];
        },
        'titleMenuAlign' : function(){
            return this.get('centerTitleMenu','left');
        },
        'itemCatA': function(){
            return this.get('categoryA','');
        },
        'itemCatB': function(){
            return this.get('categoryB','');
        },
        'hasCustomCategories': function(){
            return this.itemCatA().length + this.itemCatB().length > 0;
        },
    }
    /*KUN.SetupUI = {
        //override with plugin command manager
        'equipLayout': parameters['equipLayout'],
        'gaugeOffset': parameters['gaugeOffset'] === 'true',
        'actorStatus': parameters['actorStatus'] === 'true',
        'fillCommandMenu': parameters['fillWindowCommandHeight'] === 'true',
        'allowCommandIcons': parameters['allowWindowCommandIcons'] === 'true',
    };*/
    
    //console.log(KUN.SetupUI);

    if( parameters.extendPartyBattle === 'true' ){
        KunSetupUI_BattleParty();
    }

    if( parameters.allowWindowCommandIcons === 'true' ){
        KunSetupUI_AllowMenuIcons();
    }

    if( parameters.fillWindowCommandHeight === 'true' ){
        KunSetupUI_AdjustCommandMenu();
    }

    if( parameters.gaugeOffset === 'true' ){
        KunSetupUI_AdjustGaugeOffset();
    }

    if( parameters.actorStatus === 'true' ){
        KunSetupUI_ExtendActorStatus();
    }
    
    if( KUN.SetupUI.hasCustomCategories() ){
        KunSetupUI_ExtendItemCategories();
    }


    KunSetupUI_TitleMenu();

    switch ( parameters.equipLayout || 'default' ){
        case 'Wide':
            KunSetupUI_EquipWideLayout();
            break;
        default:
            break;
    }

})( /* */ );

function KunSetupUI_TitleMenu(){
    Window_TitleCommand.prototype.itemTextAlign = function() { return KUN.SetupUI.titleMenuAlign(); }

    Window_TitleCommand.prototype.updatePlacement = function() {

        var _x = KUN.SetupUI.getInt('titleMenuX');
        var _y = KUN.SetupUI.getInt('titleMenuY');

        this.x = _x > 0 ? _x : (Graphics.boxWidth - this.width) / 2;
        this.y = _y > 0 ? _y : Graphics.boxHeight - this.height - 96;
    }

    Window_TitleCommand.prototype.windowWidth = function() {
        var _width = KUN.SetupUI.getInt('titleMenuWidth');
        return _width > 0 ? _width : 240;
    };

    var _KunSetupUI_TitleCommand_Override = Window_TitleCommand.prototype.initialize;
    Window_TitleCommand.prototype.initialize = function() {
        _KunSetupUI_TitleCommand_Override.call(this);
        this.setBackgroundType(KUN.SetupUI.getInt('titleMenuBackground',0));
    }

    Scene_Title.prototype.drawGameTitle = function() {
        var x = KUN.SetupUI.getInt( 'titlePosX', 0) ||  20;
        var y = KUN.SetupUI.getInt( 'titlePosY',0) || Graphics.height / 4;
        var maxWidth = Graphics.width - x * 2;
        var fontSize = KUN.SetupUI.getInt( 'titleFontSize', 48);
        var text = $dataSystem.gameTitle;
        //this._gameTitleSprite.bitmap.outlineColor = 'black';
        this._gameTitleSprite.bitmap.outlineWidth = KUN.SetupUI.getInt( 'titleOutlineWidth', 0);
        this._gameTitleSprite.bitmap.fontSize = fontSize;
        this._gameTitleSprite.bitmap.drawText(text, x, y, maxWidth, fontSize, KUN.SetupUI.get( 'titleAlign','center'));
    };

    Window_Base.prototype.resetFontSettings = function() {
        this.contents.fontFace = this.standardFontFace();
        this.contents.fontSize = this.standardFontSize();
        this.contents.outlineWidth = KUN.SetupUI.getInt( 'standardFontOutline', 0);
        this.contents.fontweight = KUN.SetupUI.getInt( 'standardFontWeight', 0)
        this.resetTextColor();
    };

    Window_Base.prototype.standardFontSize = function() {
        return KUN.SetupUI.getInt( 'standardFontSize', 19);
    };
    
    Window_Base.prototype.standardPadding = function() {
        return KUN.SetupUI.getInt( 'standardPadding', 18);
    };
    
    Window_Base.prototype.textPadding = function() {
        return KUN.SetupUI.getInt( 'textPadding', 6);;
    };
}

function KunSetupUI_AllowMenuIcons(){
    Window_Command.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var align = this.itemTextAlign();
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawTextEx(this.commandName(index), rect.x, rect.y, rect.width, align);
    };
    Window_Command.prototype.drawItemEx = function(index) {
        var rect = this.itemRectForText(index);
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawTextEx(this.commandName(index), rect.x, rect.y, rect.width);
    }
}

function KunSetupUI_BattleParty(){
        Window_BattleStatus.prototype.numVisibleRows = function() {
            return $gameParty.members().length > 4 ? $gameParty.members().length : 4;
        }
        Window_BattleEnemy.prototype.numVisibleRows = function() {
            return $gameParty.members().length > 4 ? $gameParty.members().length : 4;
        };
        Window_PartyCommand.prototype.numVisibleRows = function() {
            return $gameParty.members().length > 4 ? $gameParty.members().length : 4;
        };
        Window_ActorCommand.prototype.numVisibleRows = function() {
            return $gameParty.members().length > 4 ? $gameParty.members().length : 4;
        };    
}

function KunSetupUI_EscapeCharacters(){
    //Window_Base.prototype.JayaKSetup_escapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    var _KunSetupUI_EscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        var parsed = _KunSetupUI_EscapeCharacters.call(this, text);

        //include item names here
        parsed = parsed.replace(/\x1bIT\[(\d+)\]/gi, function () {
            //get item by id
            return this.displayItemNote(parseInt(arguments[1]));
        }.bind(this));

        //include item DESCRIPTIONS HERE
        parsed = parsed.replace(/\x1bID\[(\d+)\]/gi, function () {
            //get item by id
            return this.displayItemDescription(parseInt(arguments[1]));
        }.bind(this));

        //include item names here
        parsed = parsed.replace(/\x1bIN\[(\d+)\]/gi, function () {
            //get item by id
            return this.displayItemName(parseInt(arguments[1]));
        }.bind(this));

        //include item ICONS HERE
        parsed = parsed.replace(/\x1bIC\[(\d+)\]/gi, function () {
            //get item by id
            return this.displayItemIcon(parseInt(arguments[1]));
        }.bind(this));

        //actor nick names
        parsed = parsed.replace(/\x1bAN\[(\d+)\]/gi, function () {
            //get actor by id
            return this.displayNickName(parseInt(arguments[1]));
        }.bind(this));

        //actor class name
        parsed = parsed.replace(/\x1bAC\[(\d+)\]/gi, function () {
            //get actor by id
            return this.displayActorClassName(parseInt(arguments[1]));
        }.bind(this));

        //include party member name
        parsed = parsed.replace(/\x1bPN\[(\d+)\]/gi, function () {
            //get actor by id
            return this.displayPartyMemberName(parseInt(arguments[1]));
        }.bind(this));

        //Game Skills
        parsed = parsed.replace(/\x1bSK\[(\d+)\]/gi, function () {
            //get skill ID
            return this.displaySkillName(parseInt(arguments[1]));
        }.bind(this));

        parsed = parsed.replace(/\x1bSI\[(\d+)\]/gi, function () {
            //get skill ID
            return this.displaySkillIcon(parseInt(arguments[1]));
        }.bind(this));

        //enemies
        parsed = parsed.replace(/\x1bEN\[(\d+)\]/gi, function () {
            //Enemy Name
            return this.displayEnemyName(parseInt(arguments[1]));
        }.bind(this));

        //switch icon status
        parsed = parsed.replace(/SWITCH\[(\d+)\]/gi, function () {
            return this.displaySwitchIcon(parseInt(arguments[1]));
        }.bind(this));

        //var icon status
        parsed = parsed.replace(/CHECK\[(\d+\:\d+)\]/gi, function () {
            var compare = arguments[1].split(':');
            return compare.length > 1 ? this.displayVarIcon(parseInt(compare[0]),parseInt(compare[1])) : '#' + arguments[1];
        }.bind(this));

        return parsed;
    };
    Window_Base.prototype.displayVarIcon = function ( gameVar , compare ) {

        if( gameVar > 0 ){
            var value = $gameVariables.value( gameVar );
            var icon = JayaK.Mods.getIcon( value == compare );
            return icon > 0 ? "\I[" + icon + "]" : '';
        }
        return '#' + gameVar;
    };
    Window_Base.prototype.displaySwitchIcon = function ( switchVar ) {
        if( switchVar > 0 ){
            var value = $gameSwitches.value( switchVar );
            var icon = JayaK.Mods.getIcon( value );
            var text = value ? '+' : '-';
            //return switchVar;
            return icon > 0 ? "\I[" + icon + "]" : text;
        }
        return '#' + switchVar;
    };
    Window_Base.prototype.displayNickName = function (n) {
        var actor = n >= 1 ? $gameActors.actor(n) : null;
        return actor ? actor.nickname() : '';
    };
    Window_Base.prototype.displayActorClassName = function (id) {
        var actor = Number.isSafeInteger(id) && id > 0 ? $gameActors.actor(id) : null;
        return actor ? actor.currentClass().name : '{EMPTY_PARTY_SLOT_' + id + '}';
    };
    Window_Base.prototype.displayPartyMemberName = function (id) {
        //get actor by id
        if (Number.isSafeInteger(id)) {
            var idx = id - 1;
            if (idx < $gameParty.members().length) {
                return $gameParty.members()[idx].name();
            }
        }
        return '{EMPTY_PARTY_SLOT_' + id + '}';
    };
    Window_Base.prototype.displayItemName = function (id) {
        //get item by id
        if (Number.isSafeInteger(id) && id > 0 && id < $dataItems.length ) {
            //item.name
            return $dataItems[id].name;
        }
        return '{INVALID_ITEM_ID_' + id + '}';
    };
    Window_Base.prototype.displayItemDescription = function (id) {
        //get item by id
        if (Number.isSafeInteger(id) && id > 0 && id < $dataItems.length) {
            //item.name
            return $dataItems[id].description;
        }
        return '{INVALID_ITEM_ID_' + id + '}';
    };
    Window_Base.prototype.displayItemNote = function (id) {
        //get item by id
        if (Number.isSafeInteger(id) && id > 0 && id < $dataItems.length) {
            //item.name
            return $dataItems[id].note;
        }
        return '{INVALID_ITEM_ID_' + id + '}';
    };
    Window_Base.prototype.displayItemIcon = function (id) {
        //get item by id
        if (Number.isSafeInteger(id) && id > 0 && id < $dataItems.length) {
            //item.iconIndex
            var icon = parseInt( $dataItems[id].iconIndex );
            return "\I[" + icon  + "] ";
        }
        return '#' + id;
    };
    Window_Base.prototype.displaySkillName = function (id) {
        //get skill ID
        return Number.isSafeInteger(id) && $dataSkills.length > id ?
            $dataSkills[id].name :
            '{INVALID_SKILL_ID_' + id + '}';
    };
    Window_Base.prototype.displaySkillIcon = function (id) {
        //get skill ID
        if (Number.isSafeInteger(id) && id > 0 && id < $dataSkills.length ) {
            //item.iconIndex
            var icon = parseInt( $dataSkills[id].iconIndex );
            return '\I[' + icon + ']';
        }
        return '#' + id;
    };
    Window_Base.prototype.displayEnemyName = function (enemy_id) {
        //get skill ID
        return Number.isSafeInteger(enemy_id) ?
            Game_Troop.EnemyName(enemy_id) :
            '{INVALID_ENEMY_ID_' + enemy_id + '}';
    };
};

/**
 * Fix gauge's height
 */
function KunSetupUI_AdjustGaugeOffset(){
    
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
function KunSetupUI_AdjustCommandMenu(){

    var _KunSetupUI_CommandWindow_Create = Scene_Menu.prototype.create;
    
    Scene_Menu.prototype.create = function() {
        _KunSetupUI_CommandWindow_Create.call( this );
        this._commandWindow.height = this._goldWindow.y;
    }
}

/**
 * Improve Actor Status Layout
 */
function KunSetupUI_ExtendActorStatus(){

    Window_Status.prototype.drawBlock1 = function(y) {
        this.drawActorName(this._actor, 6, y);
        this.drawActorClass(this._actor, 456, y);
        this.drawActorNickname(this._actor, 200, y);
    }
    Window_Base.prototype.drawActorClass = function(actor, x, y, width) {
        //width = width || 168;
        width = width || 220;
        this.changeTextColor(this.systemColor());
        this.drawText( actor.currentClass().name, x, y, width );
    };    
    /**
     * @param Number x
     * @param Number y
     */
    Window_Status.prototype.drawExpInfo = function (x, y) {
        this.drawActorLevel(this._actor, x, y, 270 );
        this.drawActorExpGauge( x , y + this.lineHeight() , 270 );
    };
    Window_Base.prototype.drawActorLevel = function(actor, x, y , width ) {
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
    Window_Status.prototype.drawActorExpGauge = function( x , y , width ){
        var lineHeight = this.lineHeight();
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.expTotal.format(TextManager.exp), x, y, width);
        this.resetTextColor();
        this.drawText( this._actor.currentExp(), x, y , width, 'right');
        if( !this._actor.isMaxLevel()){
            var levelExp = (this._actor.nextLevelExp() - this._actor.currentLevelExp());
            var currentExp = Math.abs(this._actor.nextRequiredExp() - levelExp) / levelExp;
            this.drawGauge(x, y+4, width, currentExp, this.textColor(14), this.textColor(6));
            this.changeTextColor(this.systemColor());
            this.drawText(TextManager.expNext.format(TextManager.level), x, y + lineHeight, width);
            this.resetTextColor();
            this.drawText(this._actor.nextRequiredExp(), x, y + lineHeight , width, 'right');
        }
    };

    Window_Status.prototype.drawBasicInfo = function(x, y) {
        var lineHeight = this.lineHeight();
        this.drawActorHp(this._actor, x, y + lineHeight * 0);
        this.drawActorMp(this._actor, x, y + lineHeight * 1);
        this.drawActorIcons(this._actor, x, y + lineHeight * 2);
    };

    //DRAW HERE THE ACTOR SIDEVIEW ANIMATION SPRITE
    //Window_Status.prototype._KunSetupActorEquipment = Window_Status.prototype.drawEquipments;
    /*Window_Status.prototype.drawEquipments = function(x, y) {
        this._KunSetupActorEquipment( x, y );

        var _spriteStatus = new Sprite_Actor();

    }*/
}

/**
 * Imprive and enlarge Actor Equipment Layout
 */
function KunSetupUI_EquipWideLayout(){
    Window_EquipStatus.prototype.initialize = function(x, y) {
        //var width = this.windowWidth();
        var width = Graphics.boxWidth / 2;
        var height = this.windowHeight();
        //var height = this.windowHeight() + 156;
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this._tempActor = null;
        this.refresh();
    };
    Scene_Equip.prototype.create = function() {
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
    Scene_Equip.prototype.createHelpWindow = function() {
        this._helpWindow = new Window_Help();
        //this._helpWindow.y = Graphics.boxHeight - this._helpWindow.height;
        this.addWindow(this._helpWindow);
    };
    Scene_Equip.prototype.createCommandWindow = function() {
        var wx = 0;
        var wy = this._helpWindow.height;
        var ww = Graphics.boxWidth;
        this._commandWindow = new Window_EquipCommand( wx , wy , ww );
        this._commandWindow.setHelpWindow(this._helpWindow);
        this._commandWindow.setHandler('equip',    this.commandEquip.bind(this));
        this._commandWindow.setHandler('optimize', this.commandOptimize.bind(this));
        this._commandWindow.setHandler('clear',    this.commandClear.bind(this));
        this._commandWindow.setHandler('cancel',   this.popScene.bind(this));
        this._commandWindow.setHandler('pagedown', this.nextActor.bind(this));
        this._commandWindow.setHandler('pageup',   this.previousActor.bind(this));
        this.addWindow(this._commandWindow);
    };
    Scene_Equip.prototype.createStatusWindow = function() {
        var wy = this._commandWindow.height + this._commandWindow.y;
        this._statusWindow = new Window_EquipStatus(0, wy );
        this.addWindow(this._statusWindow);
    };
    Scene_Equip.prototype.createSlotWindow = function() {
        var wx = this._statusWindow.width;
        var wy = this._statusWindow.y;
        var ww = Graphics.boxWidth - this._statusWindow.width;
        var wh = this._statusWindow.height;
        this._slotWindow = new Window_EquipSlot(wx, wy, ww, wh);
        this._slotWindow.setHelpWindow(this._helpWindow);
        this._slotWindow.setStatusWindow(this._statusWindow);
        this._slotWindow.setHandler('ok',       this.onSlotOk.bind(this));
        this._slotWindow.setHandler('cancel',   this.onSlotCancel.bind(this));
        this.addWindow(this._slotWindow);
    };
    Scene_Equip.prototype.createItemWindow = function() {
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
        this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
        this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
        this._slotWindow.setItemWindow(this._itemWindow);
        this.addWindow(this._itemWindow);
    };
}


function KunSetupUI_ExtendItemCategories() {
    Window_ItemList.prototype.includes = function (item) {
        switch (this._category) {
            case 'item':
                return DataManager.isItem(item) && item.itypeId === 1;
            case 'weapon':
                return DataManager.isWeapon(item);
            case 'armor':
                return DataManager.isArmor(item);
            case 'keyItem':
                return DataManager.isItem(item) && item.itypeId === 2;

            case 'hidden_a':
                return DataManager.isItem(item) && item.itypeId === 3;
            case 'hidden_b':
                return DataManager.isItem(item) && item.itypeId === 4;

            default:
                return false;
        }
    };

    Window_ItemCategory.prototype.maxCols = function () {

        var hidden = 0;

        hidden += KUN.SetupUI.itemCatA().length > 0 ? 1 : 0;
        hidden += KUN.SetupUI.itemCatB().length > 0 ? 1 : 0;

        return 4 + hidden;
    };

    Window_ItemCategory.prototype.makeCommandList = function () {
        this.addCommand(TextManager.item, 'item');

        if (KUN.SetupUI.itemCatA().length) {
            this.addCommand(KUN.SetupUI.itemCatA(), 'hidden_a');
        }

        if (KUN.SetupUI.itemCatB().length) {
            this.addCommand(KUN.SetupUI.itemCatB(), 'hidden_b');
        }

        this.addCommand(TextManager.keyItem, 'keyItem');
        this.addCommand(TextManager.weapon, 'weapon');
        this.addCommand(TextManager.armor, 'armor');
    };

}

