//=============================================================================
// KunQuestWindow.js
//=============================================================================
/*:
 * @plugindesc Kun's Quest Manager
 * @filename KunQuestWindow.js
 * @version 1.1
 * @author KUN
 * 
 * @help
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
 * @param RewardText
 * @parent QuestLog
 * @text Reward Text
 * @desc Append this text to the reward messsage in the quest window
 * @type Text
 * 
 * @param CommandMenu
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
 * @param CommandText
 * @parent CommandMenu
 * @text Command Menu Text
 * @desc Show this text in menu to topen the Quest Log
 * @type Text
 * @default Quests
 * 
 * @param debug
 * @text Debug Mode
 * @desc Show debug info and hidden quests
 * @type boolean
 * @on Enable
 * @off Disable
 * @default false
 */


//var Imported = Imported || {};
//Imported.KunQuestMan = 1;

/**
 * @type {KUN}
 */
var KUN = KUN || {};

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
QuestLogScene.LayoutSize = 4;
QuestLogScene.prototype.create = function () {
    Scene_ItemBase.prototype.create.call(this);
    this.setupStatusWindow();
    this.setupCategoryWindow();
    this.setupQuestWindow();
    this.setupDetailWindow();
};
QuestLogScene.prototype.setupCategoryWindow = function(){
    this._categoryWindow = new QuestCatWindow( this._statusWindow.height );
    this.addWindow(this._categoryWindow);
};
QuestLogScene.prototype.setupStatusWindow = function () {
    this._statusWindow = new QuestStatusWindow( );
    this._statusWindow.setHandler('cancel', this.onQuitQuestLog.bind(this));
	this._statusWindow.setHandler('ok',   this.onSelectCategory.bind(this));
    this.addWindow(this._statusWindow);
    this._statusWindow.activate();
};
QuestLogScene.prototype.setupQuestWindow = function () {

    var y = this._statusWindow.y + this._statusWindow.height;

    this._questsWindow = new QuestLogWindow( y );
    this._statusWindow.setQuestsWindow(this._questsWindow);
    this._categoryWindow.setQuestsWindow(this._questsWindow);
    this.addWindow(this._questsWindow);
    this._questsWindow.activate();
    this._questsWindow.reload();
};
QuestLogScene.prototype.setupDetailWindow = function () {
    this._detailWindow = new QuestDetailWindow( this._questsWindow.y );
    this._questsWindow.setHelpWindow(this._detailWindow);
    this.addWindow(this._detailWindow);
    this._detailWindow.refresh();
};
QuestLogScene.prototype.onSelectCategory = function () {
    if( this._categoryWindow ){
        this._categoryWindow.nextCategory();
        if( this._statusWindow ){
            this._statusWindow.activate();
            this._statusWindow.refresh(  );
        }
        if( this._questsWindow ){
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
QuestCatWindow.prototype.initialize = function ( height ) {
    Window_Base.prototype.initialize.call(this , 0 , 0 , this.windowWidth( ) , height );
    this.category = '';
    this.color = 0;
    this.icon = 0;
    this.refresh();
};
QuestCatWindow.prototype.getCategory = function(){
    return this.category;
};
QuestCatWindow.prototype.standardFontSize = function () { return 20; };
/**
 * @returns ARray
 */
QuestCatWindow.prototype.categories = () => QuestManager.Categories();

QuestCatWindow.prototype.nextCategory = function(){
    var _categories = [''].concat( this.categories( ) );
    var _current = _categories.indexOf(this.category);
    if( _current > -1){
        if( _current < _categories.length -1 ){
            _current++;
        }
        else{
            _current = 0;
        }
        this.category = _categories[_current];
    }
    else{
        this.category = '';
    }
    this.refresh();
};
QuestCatWindow.prototype.windowWidth = function () {
    return parseInt(Graphics.boxWidth / QuestLogScene.LayoutSize);
};

QuestCatWindow.prototype.renderCategory = function( ){
    var format = QuestManager.Instance.getCategoryFormat( this.category );
    var text = this.category ? this.category : 'All';
    if( format.color > 0 ){
        this.changeTextColor(this.textColor(format.color));
    }
    if( format.icon > 0 ){
        var base_line = Math.max((28 - this.standardFontSize()) / 2, 0);
        this.drawIcon( format.icon , 0 , base_line );
    }
    this.drawText( text , 0 , 0 , this.contentsWidth() , 'center' );
    this.changeTextColor(this.normalColor());
}
QuestCatWindow.prototype.refresh = function(  ){

    this.contents.clear();

    this.renderCategory( this.getCategory() );

    if (this._questsWindow  ) {
        this._questsWindow.setCategory( this.getCategory());
    }
};
QuestCatWindow.prototype.setQuestsWindow = function ( questWindow ) {
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
QuestStatusWindow.prototype.initialize = function () {
    Window_HorzCommand.prototype.initialize.call(this, this.windowX(), 0);
};
QuestStatusWindow.prototype.windowX = function(){
    return parseInt(Graphics.boxWidth / QuestLogScene.LayoutSize );
};
QuestStatusWindow.prototype.windowWidth = function () {
    return this.windowX() * (QuestLogScene.LayoutSize-1);
};
QuestStatusWindow.prototype.maxCols = function () {
    return this.maxItems();
};
QuestStatusWindow.prototype.standardFontSize = function () { return 20; };

QuestStatusWindow.prototype.update = function () {
    Window_HorzCommand.prototype.update.call(this);
    if (this._questsWindow  ) {
        this._questsWindow.setStatus( this.getStatus());
    }
};
QuestStatusWindow.prototype.getStatus = function( ){
    switch( this.currentSymbol() ){
        case 'hidden': return 1;
        case 'active': return 2;
        case 'completed': return 3;
        case 'failed': return 4;
        default: return 0;
    }
};
QuestStatusWindow.prototype.makeCommandList = function () {
    //register all visual statuses
    if( QuestManager.Instance.debug() ){
        this.addCommand('Hidden','hidden');
    }
    this.addCommand('Active','active');
    this.addCommand('Completed','completed');
    this.addCommand('Failed','failed');
    return;
};
QuestStatusWindow.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    var align = this.itemTextAlign();
    if( this.commandSymbol(index) === 'hidden' ){
        this.changeTextColor(this.systemColor());
    }
    else{
        this.resetTextColor();
    }
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
    this.resetTextColor();
};
QuestStatusWindow.prototype.setQuestsWindow = function ( questWindow ) {
    this._questsWindow = questWindow;
    //this._questsWindow.refresh();
    //this.update();
};

///////////////////////////////////////////////////////////////////////////////////////////////////
////    QuestLogWindow : Window_Selectable
///////////////////////////////////////////////////////////////////////////////////////////////////

function QuestLogWindow() {
    this.initialize.apply(this, arguments);
}
QuestLogWindow.prototype = Object.create(Window_Selectable.prototype);
QuestLogWindow.prototype.constructor = QuestLogWindow;
QuestLogWindow.prototype.initialize = function ( y ) {
    Window_Selectable.prototype.initialize.call(this, 0, y , this.windowWidth() , this.windowHeight( y ) );
    this.questStatus = Quest.Status.Active; //active status
    this.questCat = ''; //filter none
    //this.questLog = [];
    this.importItems();
};
QuestLogWindow.prototype.importItems = function(){
    this.questLog = QuestManager.Filter(  this.questStatus , this.questCat.length ? this.questCat : false ).map( (quest) => quest.key() );
}
QuestLogWindow.prototype.setCategory = function( category ){
    category = typeof category === 'string' ? category : '';
    if( this.questCat !== category ){
        this.questCat = category;
        this.reload();    
    }
};
QuestLogWindow.prototype.setStatus = function( status ){
    status = typeof status === 'number' ? status : Quest.Status.Active;
    if( this.questStatus !== status ){
        this.questStatus = status;
        this.reload();    
    }
};
/**
 * @returns Number
 */
QuestLogWindow.prototype.getStatus = function(  ){
    return this.questStatus;
}


QuestLogWindow.prototype.windowWidth = function(){
    return Graphics.boxWidth / QuestLogScene.LayoutSize;
};
QuestLogWindow.prototype.windowHeight = function( y ){
    return Graphics.boxHeight - y;
};
QuestLogWindow.prototype.maxCols = function () { return 1; };
QuestLogWindow.prototype.maxItems = function () { return this.questLog ? this.questLog.length : 0; };
QuestLogWindow.prototype.spacing = function () { return 32; };
QuestLogWindow.prototype.standardFontSize = function(){ return 20; };

/**
 * @returns {String}
 */
QuestLogWindow.prototype.getItemId = function (idx) {
    idx = typeof idx === 'number' ? idx : this.index();
    return idx >= 0 && idx < this.questLog.length ? this.questLog[idx] : Quest.INVALID;
};
QuestLogWindow.prototype.getQuest = function (idx) {
    var quest_id = this.getItemId(idx);
    return quest_id !== Quest.INVALID ? QuestManager.Instance.get( quest_id ) : null;
};
/**
 * @description Render Item in the list by its list order
 */
QuestLogWindow.prototype.drawItem = function (index) {
    var quest = this.getQuest( index );
    if (quest !== null ) {
        var rect = this.itemRect(index);
        var title_break = quest.title().split(' - ');
        if( this.questStatus < Quest.Status.Active ){
            this.changeTextColor(this.systemColor());
        }
        //this.drawTextEx( title_break[ 0 ] , rect.x , rect.y, rect.width);
        this.drawText( title_break[ 0 ] , rect.x , rect.y, rect.width , 'left' );
        this.resetTextColor();
    }
};
QuestLogWindow.prototype.setHelpWindow = function(helpWindow) {
    Window_Selectable.prototype.setHelpWindow.call( this , helpWindow );
    this.setHelpWindowItem( this.getItemId());
}
QuestLogWindow.prototype.updateHelp = function() {
    this.setHelpWindowItem(this.getItemId());
};
QuestLogWindow.prototype.setHelpWindowItem = function(item) {
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
QuestDetailWindow.prototype.initialize = function ( y ) {
    Window_Base.prototype.initialize.call(this, this.windowX(), y, this.windowWidth( ), this.windowHeight( y ) );
    this.quest_id = '';
    this.questData = null;
    this.refresh();
};
QuestDetailWindow.prototype.windowX = function(){
    return Graphics.boxWidth / QuestLogScene.LayoutSize;
};
QuestDetailWindow.prototype.windowWidth = function(){
    return this.windowX() * (QuestLogScene.LayoutSize-1);
};
QuestDetailWindow.prototype.windowHeight = function( y ){
    return Graphics.boxHeight - y;
};
QuestDetailWindow.prototype.clear = function () {
    //this.setItem();
};
QuestDetailWindow.prototype.setItem = function (quest_id) {
    this.questData = QuestManager.Quest( quest_id );
    this.refresh();
};
QuestDetailWindow.prototype.refresh = function () {
    this.contents.clear();
    if (this.questData && this.questData.key() !== Quest.INVALID) {
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
QuestDetailWindow.prototype.completedItemOpacity = function() { this.contents.paintOpacity = 192; };
QuestDetailWindow.prototype.debugItemOpacity = function() { this.contents.paintOpacity = 128; };
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
    if( icon ){
        this.drawTextEx(quest.title(), 40, base_line, width );
        this.drawIcon( quest.icon() , 0 , base_line);
    }
    else{
        this.drawTextEx(quest.title(), 0, base_line, width );
    }

    this.changeTextColor(this.textColor(23));
    //CATEGORY
    this.drawText(quest.category(), 40, base_line, width - 40 , 'right');
    this.changeTextColor(this.textColor(24));
    var line = Math.max(32, line_height);
    this.drawHorzLine(line);

    //var y = line + line_height;
    var y = line;

    //split text in lines
    quest.displayDetail( 50 ).forEach( function( line ){
        y += line_height;
        _renderer.drawTextEx( line , 0, y , width );
    });

    this.drawHorzLine(line);

    //RENDER STAGES
    var behavior = quest.behavior();
    var _debugHidden = false;
    var _debug = QuestManager.Instance.debug();
    var _stages = _debug || quest.status() > Quest.Status.Active ? quest.stages(true) : quest.visibleStages( );
    y = height - (line_height * 2) - (line_height + 8) * _stages.length;
    _stages.forEach( function( stage ) {

        var progress = stage.current();
        var objective = stage.objective();

        var text = objective > 1 ? stage.title() + ' ( ' + progress + ' / ' + objective + ' )' : stage.title();
        
        if( _debugHidden ){
            _renderer.debugItemOpacity( );
        }
        else if( progress < objective ){
            _renderer.drawIcon( QuestManager.Instance.Icons.Active() , 0 , y + 4);
            _renderer.changeTextColor(_renderer.normalColor());
        }
        else{
            _renderer.drawIcon( QuestManager.Instance.Icons.Completed() , 0, y + 4);
            _renderer.completedItemOpacity( );
        }
        _renderer.drawText( text, 35, base_line + y );
        //_renderer.drawTextEx( text, 35, y , width - 35 );
        _renderer.changeTextColor(_renderer.normalColor());
        _renderer.changePaintOpacity( true );

        y += line_height + 8;

        if( _debug && !_debugHidden && behavior === Quest.Behavior.Linear && progress < objective ){
            _debugHidden = true;
        }
    });

    this.drawGauge( 0, height - line_height * 2 , width, quest.progress(), this.textColor(4), this.textColor(6));

    // REWARD
    if( quest.reward().length ){
        if( quest.status() < Quest.Status.Completed ){
            _renderer.changeTextColor(_renderer.textColor(8));
        }
        var rewardTag = QuestManager.Instance.string('reward','');
        this.drawTextEx( rewardTag.length > 0 ?
            rewardTag + ': ' + quest.reward() :
            quest.reward() , 0, height - line_height, width);
    }

    // STATUS
    switch( quest.status() ){
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
    this.drawText(quest.displayStatus(), 0, height - line_height, width, 'right' );
    this.changeTextColor(this.normalColor());
};


/**
 * @description Empty quest window
 */
QuestDetailWindow.prototype.renderEmptyQuest = function () {

    var y = this.contentsHeight() / 3 - this.standardFontSize() / 2 - this.standardPadding();

    this.drawText("-- Empty log --", 10, y, this.contentsWidth(), 'center' );
    
    this.changeTextColor(this.textColor(8));
    this.drawText("Select a quest category with Left and Right", 0, y + 40, this.contentsWidth(), 'center');
    this.drawText("Select a quest with Up and Down", 0, y + 80, this.contentsWidth(), 'center');
    this.drawText("Switch the quest status filter with Action", 0, y + 120, this.contentsWidth(), 'center');
    this.changeTextColor(this.normalColor(8));
};





(function( Q ){


})( /* autorun */ );

