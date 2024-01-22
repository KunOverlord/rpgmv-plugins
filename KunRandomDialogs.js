//=============================================================================
// KunRandomDialogs.js
//=============================================================================
/*:
 * @plugindesc Kun Random Dialogs
 * @filename KunRandomDialogs.js
 * @author KUN
 * @version 0.1
 * 
 * @param debug
 * @text Debug
 * @desc Show debug info
 * @type Boolean
 * @default false
 *
 * @param commands
 * @type struct<DialogCommand>[]
 * @text Dialog Command
 * @desc 
 * 
 * 
 * @help
 * 
 *
 */
/*~struct~DialogCommand:
 *
 * @param command
 * @type string
 * @text Command
 * 
 * @param content
 * @type struct<CommandContent>[]
 * @text Command Content
 */
/*~struct~CommandContent:
 * @param actor
 * @type actor
 * @text Actor
 * @desc Filter by actor, leave to 0 to use in all actors
 * @default 0
 * 
 * @param dialogs
 * @type string[]
 * @text Dialogs
 * @desc Dialog collection to select from per character tag
 * 
 * @param bank
 * @text Sound Bank
 * @desc Play this sound bank when this dialog is selected. Require KunSoundBanks to work
 * @type string
 */

/*******************************************************************************************************************/

function KunDialogs() { throw new Error('This is a static class'); };

KunDialogs.initialize = function(){

    var parameters = this.importParameters();

    this._debug = parameters.debug === 'true';
    this._data = {};

    return this.importCommands( parameters.commands.length > 0 ? JSON.parse( parameters.commands ) : [] );
};
/**
 * @returns Object
 */
KunDialogs.importParameters = function () {
    return PluginManager.parameters('KunRandomDialogs');
};
/**
 * @param {Boolean} list 
 * @returns Array | Object
 */
KunDialogs.data = function( list ){
    return typeof list === 'boolean' && list ? Object.keys( this._data ) : this._data;
};
/**
 * @param {Object} data 
 * @returns KunDialogs
 */
KunDialogs.importCommands = function( data ){
    data.map( cmdContent => JSON.parse( cmdContent ) ).forEach( function( cmdContent ){
        var cmdName = cmdContent.command;
        (cmdContent.content.length > 0 ? JSON.parse(cmdContent.content): []).map( content => JSON.parse(content)).forEach(function( content ){
            var actor_id = parseInt( content.actor || 0 );
            var bank = content.bank || '';
            (content.dialogs.length > 0 ? JSON.parse(content.dialogs) : []).forEach( function( message ){
                KunDialogs.add( cmdName , message , actor_id , bank );
            });
        });
    });
    return this;
};
/**
 * @param {String} command 
 * @returns Boolean
 */
KunDialogs.has = function( command){
    return this._data.hasOwnProperty( command.toUpperCase() );
};
/**
 * 
 * @param {String} command 
 * @param {String} message 
 * @param {Number} actor_id 
 * @param {String} se 
 * @returns KunDialogs
 */
KunDialogs.add = function( command, message , actor_id , se ){
    
    command = command.toUpperCase();
    
    if( !this.has( command ) ){
        this._data[ command ] = new KunDialogCommand(command);
    }

    this._data[command].add(message, actor_id || 0, se || '');

    return this;
};
/**
 * 
 * @param {String} command 
 * @param {Number} actor_id 
 * @param {Boolean} playSe 
 * @returns String
 */
KunDialogs.command = function( command , actor_id , playSe ){
    command = command.toUpperCase();
    return this.has( command ) ? this._data[command].select( actor_id , playSe ) : '';
};


function KunDialogCommand( command ){
    this._command = command;
    this._contents = [];
}
/**
 * 
 * @param {String} message 
 * @param {Number} actor_id 
 * @param {String} bank 
 * @returns KunDialogCommand
 */
KunDialogCommand.prototype.add = function( message , actor_id , bank ){
    if( message.length ){
        this._contents.push({
            'message': message,
            'actor_id': actor_id || 0,
            'bank': bank || '',
        });    
    }
    return this;
};
/**
 * @param {Number} actor_id 
 * @returns String
 */
KunDialogCommand.prototype.list = function( actor_id ){
    actor_id = typeof actor_id === 'number' && actor_id > 0 ? actor_id : 0;
    return actor_id > 0 ? this._contents.filter( content => content.actor_id === actor_id ) : this._contents ;
};
/**
 * @param {Number} actor_id 
 * @param {Boolean} playSe 
 * @returns String
 */
KunDialogCommand.prototype.select = function( actor_id , playSe ){
    var banks = this.list( actor_id );
    var selection = banks.length > 1 ? banks[ Math.floor( Math.random() * banks.length ) ]: ( banks.length > 0 ? banks[0] : null );
    if( selection !== null ){
        if( typeof playSe === 'boolean' && playSe && selection.bank.length > 0 ){
            this.playBank( selection.bank );
        }
        return selection.message;            
    }
    return '';
    switch( selection.length ){
        case 0: return '';
        case 1: return selection[0];
        default: return selection[Math.floor(Math.random() * selection.length)];
    }
};
/**
 * @returns Boolean
 */
KunDialogCommand.prototype.hasKunBanksInstalled = function(){
    return typeof KunSEBanks === 'function' && KunSEBanks.play;
};
/**
 * @param {String} bank 
 * @returns KunDialogCommand
 */
KunDialogCommand.prototype.playBank = function( bank ){
    if( this.hasKunBanksInstalled() ){
        KunSEBanks.play( bank );
    }
    return this;
};

/**
 * Setup text dialogs
 */
function KunRandomDialog_RegisterEscapeChars() {
    var _KunRandomDiag_convertEscapeChars = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        var parsed = _KunRandomDiag_convertEscapeChars.call(this, text);
        var _commands = KunDialogs.data( true );
        for( var i = 0 ; i < _commands.length ; i++ ){
            var command = _commands[i].toUpperCase();
            var matchCall = `/\x1b${command}\[(\s+)\]/gi`;
            console.log( matchCall);
            parsed.replace( matchCall, function () {
                console.log( command  + arguments[1] );
                return KunDialogs.command( command , parseInt(arguments[1]) , true );
            }.bind(this))
        }

        return parsed;
    };
};

/*******************************************************************************************************************/

(function ( /* args */) {

    KunDialogs.initialize();

    KunRandomDialog_RegisterEscapeChars();

})( /* initializer */);