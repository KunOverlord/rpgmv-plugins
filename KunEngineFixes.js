//=============================================================================
// KunEngineFixes.js
//=============================================================================
/*:
 * @filename KunEngineFixes.js
 * @plugindesc Fixes issues with the RPG Maker MV engine
 * @version 1.1
 * @author KUN
 * @target MV
 * 
 * @help
 * 
 * Thanks to Dunnask for finding this tip ^_^
 * 
 * URL:
 * https://forums.rpgmakerweb.com/index.php?threads/rpg-maker-mv-games-graphics-will-freeze-but-sound-keeps-playing-the-problem-the-solution.151887/
 * 
 * 
 *
 * @param debug
 * @text Debug
 * @type boolean
 * @default false
 * 
 * @param renderFix
 * @text Graphics Render Patch
 * @type boolean
 * @desc Enables the graphics render patch to avoid freezing on specific computer framerates
 * @default true
 * 
 * @param mouseWheelFix
 * @text MouseWheel Fix
 * @type boolean
 * @desc Prevents the scroll error and unable to scroll after upgrading NWJS
 * @default false
 * 
 * @param slotFix
 * @text Equip Slot Fix
 * @type boolean
 * @desc Captch all for out of range slots @_@
 * @default false
 * 
 * @param disableDev
 * @text Disable Dev
 * @type boolean
 * @default false
 */

function KunEngineFixes() {
    throw `${this.constructor.name} is a Static Class`;
};

KunEngineFixes.initialize = function () {
    var parameters = PluginManager.parameters('KunEngineFixes');

    this._debug = parameters.debug === 'true' || false;
    this._renderFix = parameters.renderFix === 'true' || true;
    this._mouseWheelFix = parameters.mouseWheelFix === 'true' || false;
    this._equipSlotFix = parameters.slotFix === 'true';
    this._disableDev = parameters.disableDev === 'true';


    if (this._renderFix) {
        this.graphicsRenderFix();
    }
    if (this._mouseWheelFix) {
        KunEngineFixes.TouchInputWheelFix();
    }
    if (this._equipSlotFix) {
        this.equipSlotFix();
    }
    if (this._disableDev) {
        this.disableDev();
    }
};

KunEngineFixes.DebugLog = function (message) {
    if (this._debug) {
        console.log(typeof message === 'object' ? message : `[KunEngineFixes] ${message}`);
    }
};

KunEngineFixes.disableDev = function () {
    const _KunEngineFixes_Graphics_keyDown = Graphics._onKeyDown;
    Graphics._onKeyDown = function (event) {
        if (!event.ctrlKey && !event.altKey && event.keyCode === 123) {
            event.preventDefault();
        }
        _KunEngineFixes_Graphics_keyDown.apply(this, arguments);
    };
}


/**
 * Overrides the Graphics.render with a fix to prevent frames going below 0
 */
KunEngineFixes.graphicsRenderFix = function () {
    const _KunEngineFixes_Graphics_Render = Graphics.render;
    Graphics.render = function (stage) {
        if (this._skipCount < 0) {
            this._skipCount = 0;
            KunEngineFixes.DebugLog('Graphics.render bug catched and fixed!');
        }
        _KunEngineFixes_Graphics_Render.call(this, stage);
    };
};
/**
 * 
 */
KunEngineFixes.TouchInputWheelFix = function () {
    /**
     * @static
     * @method _onWheel
     * @param {WheelEvent} event
     * @private
     */
    TouchInput._onWheel = function (event) {
        this._events.wheelX += event.deltaX;
        this._events.wheelY += event.deltaY;
        //event.preventDefault();
    };
};

/**
 * 
 */
KunEngineFixes.equipSlotFix = function () {

    Game_Actor.prototype.changeEquip = function (slotId, item) {

        const canTrade = this.tradeItemWithParty(item, this.equips()[slotId]);

        if (canTrade && (!item || this.equipSlots()[slotId] === item.etypeId)) {
            const equip = this._equips[slotId] || null;
            if (equip) {
                //console.log( slotId, equip);
                equip.setObject(item);
                this.refresh();
            }
        }
    }
};

(function () {
    KunEngineFixes.initialize();
})();
