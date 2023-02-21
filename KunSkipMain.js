//=============================================================================
// KunSkipMain.js
//=============================================================================
/*:
 * @filename KunSkipMain.js
 * @plugindesc Start the game in the starting map
 * @author Kun
 * 
 * 
 * @help
 */
(function() {
    Scene_Boot.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        SoundManager.preloadImportantSounds();
        if (DataManager.isBattleTest()) {
            DataManager.setupBattleTest();
            SceneManager.goto(Scene_Battle);
        } else {
            this.checkPlayerLocation();
            DataManager.setupNewGame();
            SceneManager.goto(Scene_Map);
        }
        this.updateDocumentTitle();
    };
})();
