//=============================================================================
// KunFullNames.js
//=============================================================================
/*:
 * @plugindesc KunFullNames
 * @filename KunFullNames.js
 * @author KUN
 * @version 1.15
 * 
 * @help
 * 
 * COMMANDS
 * 
 * KunFullNames lastname actor_id LastName
 *      Set actor_id's last name
 * 
 * 
 * 
 * @param debug
 * @text Debug
 * @desc Show debug info
 * @type Boolean
 * @default false
 * 
 * @param inputNameMod
 * @type boolean
 * @text Input Name Layout
 * @desc Show a bigger input for the inputname
 * @default false
 * 
 * @param inputNameLimit
 * @parent inputNameMod
 * @text Input Name Size
 * @desc Override Input Name Size Limit
 * @type number
 * @min 0
 * @max 48
 * @default 0
 * 
 */

function KunFullNames(){
    throw `${this.constructor.name} is a Static Class`;
}
/**
 * 
 */
KunFullNames.Initialize = function(){

    var parameters = this.parameters();

    this._debug = parameters.debug === 'true';
    this._inputNameLimit = parseInt(parameters.inputNameLimit);
    this._inputNameMod = parameters.inputNameMod === 'true';
};
/**
 * @returns String
 */
KunFullNames.inputNameMod =function (){
    return this._inputNameMod;
};
/**
 * @returns Number
 */
KunFullNames.inputNameLimit =function (){
    return this._inputNameLimit;
};
/**
 * @returns Boolean
 */
KunFullNames.debug = function(){
    return this._debug;
};
/**
 * @returns Object
 */
KunFullNames.parameters = function(){
    return  PluginManager.parameters('KunFullNames');
};
/**
 * @param {String} message 
 */
KunFullNames.DebugLog = function( message ){
    if( this.debug() ){
        console.log( '[ KunFullNames ] ' , message );
    }
};


/**
 * 
 */
function KunFullNames_GameActor(){
    /**
     * @param {Boolean} fullNameString
     * @returns String
     */
    Game_Actor.prototype.name = function( fullNameString ){
        return typeof fullNameString == 'boolean' && fullNameString ? this._name : this._name.split(' ')[0];
    };
    /**
     * @returns String
     */
    Game_Actor.prototype.fullName = function(){
        var name = this._name.split(' ');
        return name.length > 1 ? name[0] + ' ' + name[1] : name[0];
    };
    /**
     * @returns String
     */
    Game_Actor.prototype.shortName = function(){
        var name = this._name.split(' ');
        return name.length > 2 ? name[2] : name[0];
    };
    /**
     * @param {String} lastname 
     * @param {String} shortname 
     */
    Game_Actor.prototype.setLastName = function( lastname , shortname ){
        this._name = this.name() + ' ' + lastname;
        if( typeof shortname === 'string' && shortname.length ){
            this._name += ' ' + shortname;
        }
    };
}
/**
 * 
 */
function KunFullNames_PluginCommands(){
    var _KunFullNames_CommandInterpreter = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunFullNames_CommandInterpreter.call(this, command, args);
        if( command === 'KunFullNames' && args.length > 1 ){
            switch( args[0] ){
                case 'lastname':
                    var actor_id = parseInt( args[1] );
                    if( args.length > 2 && !Number.isNaN(actor_id) && actor_id > 0 ){
                        $gameActors.actor(actor_id).setLastName( args[2] , args.length > 3 && args[3].length ? args[3] : '' );
                    }
                    break;
            }
        }
    }
}
/**
 * 
 */
function KunFullNames_EscapeChars(){
    var _KunFullNames_EscapeCharacters = Window_Base.prototype.convertEscapeCharacters;

    Window_Base.prototype.convertEscapeCharacters = function (text) {
        var parsed = _KunFullNames_EscapeCharacters.call(this, text);

        parsed = parsed.replace(/\x1bFN\[(.+)\]/gi, function () {
            var actor_id = parseInt(arguments[1]);
            return this.actorFullName( actor_id );
        }.bind(this));

        parsed = parsed.replace(/\x1bSN\[(.+)\]/gi, function () {
            var actor_id = parseInt(arguments[1]);
            return this.actorShortName( actor_id );
        }.bind(this));

        return parsed;
    };

    Window_Base.prototype.actorShortName = function ( actor_id ) {
        return $gameActors.actor( actor_id ).shortName( );
    };

    Window_Base.prototype.actorFullName = function ( actor_id ) {
        return $gameActors.actor( actor_id ).fullName( );
    };

}

//-----------------------------------------------------------------------------
// Scene_LastName
//
// The scene class of the name input screen.
function KunFullNames_SceneFullName(){
    //override size limit
    Scene_Name.prototype.prepare = function(actorId, maxLength) {
        this._actorId = actorId;
        this._maxLength = KunFullNames.inputNameLimit() || maxLength;
    };

    //override window width if added more space for name
    Window_NameEdit.prototype.windowWidth = function() {
        return Graphics.boxWidth - 64;
        //return KunFullNames.inputNameLimit() > 16 ? Graphics.boxWidth - 64 : 480;
    };
    /**
     * @param {Game_Actor} actor 
     * @param {Number} maxLength 
     */
    Window_NameEdit.prototype.initialize = function(actor, maxLength) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        var x = (Graphics.boxWidth - width) / 2;
        var y = (Graphics.boxHeight - (height + this.fittingHeight(9) + 8)) / 2;
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._maxLength = maxLength;
        this._actor = actor;
        this._name = actor.name(true).slice(0, this._maxLength);
        this._index = this._name.length;
        this._defaultName = this._name;
        this.deactivate();
        this.refresh();
        ImageManager.reserveFace(actor.faceName());
    };    

    Window_NameEdit.prototype.drawFullNameTips = function(){
        this.changeTextColor(this.textColor(8));
        this.makeFontSmaller();
        this.drawText( 'FirstName LastName [ShortName]', 164 , 96 , this.windowWidth() - 144 );
        this.makeFontBigger();
        this.resetTextColor();
    };

    var _KunFullNames_WindowNameEdit_Refresh = Window_NameEdit.prototype.refresh;
    Window_NameEdit.prototype.refresh = function() {
        _KunFullNames_WindowNameEdit_Refresh.call(this);
        this.drawFullNameTips();
    };


    Window_Base.prototype.drawActorName = function(actor, x, y, width) {
        width = width || 168;
        this.changeTextColor(this.hpColor(actor));
        this.drawText(actor.fullName(), x, y, width);
    };    
};

/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function ( /* args */) {

    KunFullNames.Initialize();
    KunFullNames_GameActor();
    KunFullNames_PluginCommands();
    KunFullNames_EscapeChars();
    if(KunFullNames.inputNameMod()){
        KunFullNames_SceneFullName();
    }

})( /* initializer */);

