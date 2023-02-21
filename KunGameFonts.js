//=============================================================================
// KunGameFonts.js
//=============================================================================
/*:
 * @filename KunGameFonts.js
 * @plugindesc Change Game Title
 * @author JayaKun
 *
 * @help
 * 
 */

/**
 * @description KUN Modules
 * @type KUN
 */
 var KUN = KUN || {};

if( !KUN.hasOwnProperty('Parameters')){
    KUN.Parameters = function( plugin ){
        return PluginManager.parameters(plugin);
    };
}

function kun_game_fonts_setup(){

    Scene_Title.prototype.drawGameTitle = function() {
        var x = 20;
        var y = Graphics.height / 4;
        var maxWidth = Graphics.width - x * 2;
        var text = $dataSystem.gameTitle;
        //this._gameTitleSprite.bitmap.outlineColor = 'black';
        //this._gameTitleSprite.bitmap.outlineWidth = 8;
        this._gameTitleSprite.bitmap.outlineWidth = 0;
        this._gameTitleSprite.bitmap.fontSize = 48;
        this._gameTitleSprite.bitmap.drawText(text, x, y, maxWidth, 48, 'center');
    };

    Window_Base.prototype.resetFontSettings = function() {
        this.contents.fontFace = this.standardFontFace();
        this.contents.fontSize = this.standardFontSize();
        this.contents.outlineWidth = 0;
        this.contents.fontweight = 100;
        this.resetTextColor();
    };

    Window_Base.prototype.standardFontSize = function() {
        return 19;
    };
    
    Window_Base.prototype.standardPadding = function() {
        return 18;
    };
    
    Window_Base.prototype.textPadding = function() {
        return 6;
    };

}

( function(){

    kun_game_fonts_setup();


})();