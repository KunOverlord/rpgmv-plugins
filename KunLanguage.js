//=============================================================================
// KunLanguage.js
//=============================================================================
/*:
 * @plugindesc KunLanguage
 * @filename KunLanguage.js
 * @author KUN
 * @version 1.00
 * 
 * @param debug
 * @text Debug
 * @desc Show debug data in console
 * @type Boolean
 * @default false
 * 
 * @param languages
 * @text Languages
 * @type struct<GameLanguage>[]
 * 
 * @param menuPos
 * @text Menu Positon
 * @type number
 * @min 0
 * @default 0
 * 
 * @param menuLayout
 * @text Menu Layout
 * @type select
 * @option Transparent
 * @value 2
 * @option Dim
 * @value 1
 * @option Window
 * @value 0
 * @default 2
 * 
 */
/*~struct~GameLanguage:
 * @param code
 * @text Language Code
 * @type string
 * 
 * @param language
 * @text Language
 * @type String
 */
function KunLanguage(){
    throw `${this.constructor.name} is a Static Class`;
}
/**
 * 
 */
KunLanguage.Initialize = function(){

    var parameters = this.parameters();

    this._debug = parameters.debug === 'true';
    this._supported = {};
    this._language = 'en';
    this._pos = parseInt(parameters.menuPos);
    this._layout = parseInt(parameters.menuLayout);
    (parameters.languages.length > 0 ? JSON.parse( parameters.languages) : []).map( lang => JSON.parse(lang)).forEach( function( lang ){
        KunLanguage.add( lang.code , lang.language );
    });

    this._strings = new KunLanguageStrings();
};
/**
 * @returns Number
 */
KunLanguage.menuPosition = function(){
    return this._pos;
};
/**
 * @returns Number
 */
KunLanguage.menuLayout = function(){
    return this._layout;
};
/**
 * @param {String} code 
 * @param {String} language 
 * @returns KunLanguage
 */
KunLanguage.add = function( code , language ){
    if( !this.has(code)){
        this._supported[code] = language;
    }
    return this;
};
/**
 * @param {String} code 
 * @returns Boolean
 */
KunLanguage.has = function( code ){
    return this._supported.hasOwnProperty(code);
};
/**
 * @param {String} code 
 * @returns String
 */
KunLanguage.get = function( code ){
    return this.has( code ) ? this.languages()[code] : code;
};
/**
 * @param {Boolean} display
 * @returns String
 */
KunLanguage.language = function( display ){
    return typeof display === 'boolean' && display && this.has(this._language) ?  this._supported[this._language] : this._language;
};
/**
 * @param {String} code 
 * @returns KunLanguage
 */
KunLanguage.set = function( code ){
    if( this.has( code ) && this._language !== code ){
        this._language = code;
        this.reload();        
    }
    return this;
};
/**
 * @returns KunLanguage
 */
KunLanguage.reload = function(){
    this._strings.load( this.language());
    return this;
};
/**
 * @param {Boolean} list 
 * @returns Object[] | Object
 */
KunLanguage.languages = function( list ){
    return typeof list === 'boolean' && list ? Object.keys( this._supported) : this._supported;
};
/**
 * @returns Boolean
 */
KunLanguage.debug = function(){
    return this._debug;
};
/**
 * @param {String|Object} message
 */
KunLanguage.DebugLog = function( message ){
    if( this.debug()){
        console.log( typeof message === 'object' ? message : `[ KunLanguage ] : ${message}` );
    }
};
/**
 * @returns Object
 */
KunLanguage.parameters = function(){
    return  PluginManager.parameters('KunLanguage');
};
/**
 * @param {String} text 
 * @param {String} translation 
 */
KunLanguage.register = function( text , translation ){
    this._strings.register( text , translation );
};
/**
 * @param {String} text 
 * @returns String
 */
KunLanguage.Translate = function( text ){
    return this._strings.string( text );
};

/**
 * String Manager
 */
function KunLanguageStrings(){
    //add in here all sting databases
    this.clear(true);
};
/**
 * @param {String} language
 * @returns KunLanguageStrings
 */
KunLanguageStrings.prototype.load = function( language ){
    //
    KunLanguageLoader.import( language , this.register );

    return this;
};
/**
 * 
 * @param {String} text 
 * @param {String} translation 
 * @returns KunLanguageStrings
 */
KunLanguageStrings.prototype.register = function( text , translation ){
    this._stationary.push( {
        'text': text,
        'translation': translation,
    } );
    return this;
};
/**
 * @param {String} text 
 * @param {String} translation 
 * @returns KunLanguageStrings
 */
KunLanguageStrings.prototype.registerLocal = function( text , translation ){
    this._local.push( {
        'text': text,
        'translation': translation,
    } );
    return this;
};

/**
 * @param {Boolean} fullClear 
 * @returns KunLanguageStrings
 */
KunLanguageStrings.prototype.clear = function( fullClear ){
    this._local = [];
    if( typeof fullClear === 'boolean' && fullClear){
        this._stationary = [];
    }
    return this;
};
/**
 * @param {String} text 
 * @returns String
 */
KunLanguageStrings.prototype.string = function( text ){
    var output = this._stationary.filter( t => t.text === text);
    if( output.length ){
        return output[0].translation;
    }
    output = this._local.filter( t => t.text === text);

    return output.length > 0 ? output[0].translation : text;
};


/**
 * Language loader
 */
function KunLanguageLoader(){
    throw `${this.constructor.name} is a Static Class`;
};
/**
 * @param {String} language 
 * @param {Function} callback
 */
KunLanguageLoader.import = function( language , callback ){
    var path = `language/${language}.txt`;
    var request = new XMLHttpRequest();
    request.open("GET", path);
    //request.overrideMimeType('application/json');
    request.overrideMimeType('text/plain');
    request.onload = function () {
        if (this.readyState === 4 && this.status === 200) {
            var buffer = this.responseText;
            //KunLanguage.DebugLog(buffer);
            KunLanguageLoader.extract( buffer , callback );
        }
        else {
            KunLanguageLoader.message(request.status);
        }
    };
    request.send();
};
/**
 * @param {String} buffer 
 * @param {Function} callback 
 */
KunLanguageLoader.extract = function( buffer , callback ){
    if( buffer.length && typeof callback === 'function' ){
        //KunLanguage.DebugLog( buffer );
        buffer.split("\n")
            .map( line => line.split("\t"))
            .filter( text => text[0].length > 0 && text.length > 1 )
            .forEach( function( text ){
                //KunLanguage.DebugLog( text );
                KunLanguage.register( text[0] , text[1]);
            });
    }
};
/**
 * @param {String} message 
 */
KunLanguageLoader.message = function( message ){
    KunLanguage.DebugLog(message);
};


function KunLanguage_WindowTitle(){

    var _KunLanguage_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function() {
        _KunLanguage_TitleCommand_makeCommandList.call(this);
        //this.addCommand(TextManager.options,   'options' );
        this.addCommand( 'Language',   'language' );
    };

    var _KunLanguage_SceneTitle_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        _KunLanguage_SceneTitle_createCommandWindow.call(this);
        this._commandWindow.setHandler('language',  this.commandLanguage.bind(this));
    };
    Scene_Title.prototype.commandLanguage = function() {
        this._commandWindow.close();
        SceneManager.push(Scene_Language);
    };

    //LANGUAGE SCENE AND WINDOWS
    function Scene_Language() {
        this.initialize.apply(this, arguments);
    }
    
    Scene_Language.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_Language.prototype.constructor = Scene_Language;
    
    Scene_Language.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };
    
    Scene_Language.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createLanguageList();
    };
    Scene_Language.prototype.createLanguageList = function() {
        this._languageWindow = new Window_LanguageSelector();
        this._languageWindow.setHandler('ok',  this.commandSetLanguage.bind(this));
        this._languageWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._languageWindow);
    };
    Scene_Language.prototype.commandSetLanguage = function(){
        var selected = this._languageWindow.selectedLanguage();
        if( selected.length ){
            KunLanguage.set( selected );
            KunLanguage.DebugLog(KunLanguage.language(true) + ' selected');
        }
        this.popScene();
    };
    Scene_Language.prototype.terminate = function() {
        Scene_MenuBase.prototype.terminate.call(this);
    };
    


    function Window_LanguageSelector() {
        this.initialize.apply(this, arguments);
    }
    
    Window_LanguageSelector.prototype = Object.create(Window_Selectable.prototype);
    Window_LanguageSelector.prototype.constructor = Window_LanguageSelector;
    
    Window_LanguageSelector.prototype.initialize = function( ) {
        var width = 240;
        var height = Graphics.boxHeight - 192;
        var x = KunLanguage.menuPosition() > 0 ? KunLanguage.menuPosition() : (Graphics.boxWidth - width) / 2;
        var y = 96;
        this.makeLanguageList();
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this.setBackgroundType(KunLanguage.menuLayout());
        this.refresh();
        this.select(0);
        this.activate();
    };
    /**
     * @returns Number
     */
    Window_LanguageSelector.prototype.maxCols = function(  ){
        return 1;
    };
    /**
     * @returns Number
     */
    Window_LanguageSelector.prototype.maxItems = function(  ){
        return this.languages().length;
    };
    /**
     * @returns Object[]
     */
    Window_LanguageSelector.prototype.drawItem = function( index ){
            var rect = this.itemRectForText(index);
            this.drawText(KunLanguage.get( this.languages()[index] ), rect.x, rect.y, rect.width, 'center');    
    };
    /**
     * @returns Object[]
     */
    Window_LanguageSelector.prototype.selectedLanguage = function(){
        return this.hasLanguages() ? this.languages()[ this.index() ] : '';
    };
    /**
     * @returns Object[]
     */
    Window_LanguageSelector.prototype.importLanguages = function(){
        return KunLanguage.languages(true);
    };
    /**
     * @returns Window_LanguageSelector
     */
    Window_LanguageSelector.prototype.makeLanguageList = function(){
        this._list = this.importLanguages();
        return this;
    };
    /**
     * @returns String[]
     */
    Window_LanguageSelector.prototype.languages = function(){
        return this._list;
    };
    /**
     * @returns Boolean
     */
    Window_LanguageSelector.prototype.hasLanguages = function(){
        return this.maxItems() > 0;
    };
};


function KunLanguage_ContentTranslation(){

    var _KunLanguage_Window_DrawText = Window_Base.prototype.drawText;
    Window_Base.prototype.drawText = function(text, x, y, maxWidth, align) {
        _KunLanguage_Window_DrawText.call(this , KunLanguage.Translate(text) , x , y , maxWidth, align );
    };
    var _KunLanguage_Window_DrawTextEx = Window_Base.prototype.drawTextEx;
    Window_Base.prototype.drawTextEx = function(text, x, y ) {
        _KunLanguage_Window_DrawTextEx.call(this , KunLanguage.Translate(text) , x , y );
    };
    var _KunLanguage_GameMessage_Add = Game_Message.prototype.add;
    Game_Message.prototype.add = function(text) {
        _KunLanguage_GameMessage_Add.call(this,KunLanguage.Translate(text));
    };

};

/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function ( /* args */) {

    KunLanguage.Initialize();
    KunLanguage_WindowTitle();
    KunLanguage_ContentTranslation();
})( /* initializer */);

