//=============================================================================
// KunSwitches.js
//=============================================================================
/*:
 * @plugindesc Define special dynamic switches
 * @filename KunSwitches.js
 * @author KUN
 * 
 * @param debug
 * @text Debug
 * @desc Show debug info
 * @type Boolean
 * @default false
 *
 * 
 * @help
 * 
 * FUNCTIONS:
 *
 *  kun_switch( name )
 *      return the switch value or false if not exists 
 * 
 * COMMANDS:
 * 
 *  KunSwitches has switch_name [exportSwitchId]
 *      Is this switch defined?
 *  KunSwitches enable switch_name [exportSwitchId]
 *      Activate this switch
 *  KunSwitches disable switch_name [exportSwitchId]
 *      Disable this switch
 *  KunSwitches toggle switch_name [exportSwitchId]
 *      Toggle this switch
 *
 */
/**
 * @description KUN Modules
 * @type KUN
 */
var KUN = KUN || {};

/**
 * Get this switch value
 * @param {String} name 
 * @returns Boolean
 */
function kun_switch( name ){
    return KunSwitches.get( name );
}
/**
 * Has this switch?
 * @param {String} name 
 * @returns Boolean
 */
function kun_switch_exists( name ){
    return KunSwitches.has( name );
}
/**
 * 
 */
function KunSwitches(){
    throw new Error('This is a static class');
}
/**
 * List all dynamic switches
 * @param {Boolean} list 
 * @returns Object | Array
 */
KunSwitches.switches = function( list ){
    return typeof list === 'boolean' && list ? Object.keys($gameParty.switches()) : $gameParty.switches();
};
/**
 * Sanitize  input
 * @param {String} name 
 * @returns String
 */
KunSwitches.sanitize = name => name.toLowerCase().replace(/[\s\-]/gi,'_');
/**
 * @param {String} name 
 * @returns Boolean
 */
KunSwitches.has = function( name ){
    return this.switches().hasOwnProperty( this.sanitize( name ) );
};
/**
 * @param {String} name 
 * @param {Boolean} enabled
 * @returns Boolean
 */
KunSwitches.set = function( name , enabled ){
    name = this.sanitize( name );
    this.switches()[ name ] = typeof enabled === 'boolean' && enabled;
    return this.get( name );
};
/**
 * @param {String} name 
 * @returns Boolean
 */
KunSwitches.get = function( name ){
    return this.has( name ) ? this.switches()[ this.sanitize(name) ] : false;
};
/**
 * @param {String} name 
 * @returns KunSwitches
 */
KunSwitches.toggle = function( name ){
    return this.set( name, !this.get( name ) );
};
/**
 * Export a switch value ito a game switch
 * @param {Number} gameSwitch 
 * @param {Boolean} value
 * @returns Boolean
 */
KunSwitches.export = function( gameSwitch , value ){
    if( typeof gameSwitch === 'number' && gameSwitch > 0 ){
        $gameSwitches.setValue( gameSwitch , typeof value === 'boolean' && value );
        return true;
    }
    return false;
};

/**
 * @description Independent notification system to show up some messages in the scene
 */
function KunSwitches_SetupGameParty() {
    /**
     * Retrieve the collection of dynamic switches
     * @returns Object
     */
    Game_Party.prototype.switches = function( list ){
        if( !this.hasOwnProperty( '_switches' ) ){
            this._switches = {};
        }
        return this._switches;
    };
}

function KunSwitches_SetupCommands(){
    //OVERRIDE COMMAND INTERPRETER
    var _KunSwitches_PluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunSwitches_PluginCommand.call(this, command, args);
        if (command === 'KunSwitches') {
            if (args && args.length > 1 ) {
                switch( args[0]){
                    case 'enable':
                        KunSwitches.set( args[1] , true );
                        if( args.length > 2 ) KunSwitches.export( parseInt( args[2] ) , kun_switch(args[1]) );
                        break;
                    case 'disable':
                        KunSwitches.set( args[1] , false );
                        if( args.length > 2 ) KunSwitches.export( parseInt( args[2] ) , kun_switch(args[1]) );
                        break;
                    case 'toggle':
                        KunSwitches.toggle( args[1] );
                        if( args.length > 2 ) KunSwitches.export( parseInt( args[2] ) , kun_switch(args[1]) );
                        break;
                    case 'has':
                        if( args.length > 2 ) KunSwitches.export( parseInt( args[2]) , kun_switch_exists( args[1] ) );
                        break;
                }
            }
        }
    };
}

/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function ( /* args */) {

    var parameters = PluginManager.parameters('KunSwitches');
    KUN.Switches = {
        'debug': parameters.debug === 'true',
    };

    KunSwitches_SetupGameParty();
    KunSwitches_SetupCommands();

})( /* initializer */);

