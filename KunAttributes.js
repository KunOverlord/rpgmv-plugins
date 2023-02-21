//=============================================================================
// KunAttributes.js
//=============================================================================
/*:
 * @plugindesc Kun Special Attributes
 * @filename KunAttributes.js
 * @author Kun
 * @version 1.5
 * 
 * @help
 * 
 * COMMANDS
 * 
 *      KunAttributes reset [actor_id] [gauge_name]
 *          Resets acgor's gauge to the original value
 * 
 *      KunAttributes set [actor_id] [gauge_name] [amount] [import]
 *          Sets actor's gauge_name the provided amount. Use import to use a gameVariable value
 * 
 *      KunAttributes add [actor_id] [gauge_name] [amount] [import]
 *          Adds actor's gauge_name the provided amount. Use import to use a gameVariable value
 * 
 *      KunAttributes sub [actor_id] [gauge_name] [amount] [import]
 *          Substract actor's gauge_name the provided amount. Use import to use a gameVariable value
 * 
 *      KunAttributes export [actor_id] [gauge_name] [export_var] [export_max_var]
 *          Export actor_id attribute current value into export_var
 *          Export actor_id max attribute value using export_max_var
 * 
 *
 * @param debug
 * @text Debug
 * @desc Which text to show when the character arouses up
 * @type Boolean
 * @default false
 * 
 * @param attributes
 * @text Special Attributes
 * @desc Define here the list of special attributes for each char.
 * @type struct<Attribute>[]
 *
 */
/*~struct~Attribute:
 * @param name
 * @text Name
 * @type text
 * @desc Attribute Name
 * 
 * @param title
 * @text Display Name
 * @type text
 * @desc The display name for this attribute
 * 
 * @param icon
 * @text Icon
 * @type Number
 * @min 0
 * @default 0
 *
 * @param display
 * @name Display
 * @desc Attribute display type
 * @type select
 * @option None
 * @value none
 * @option Counter
 * @value counter
 * @option Gauge
 * @value gauge
 * @option Full
 * @value full
 * @default full
 * 
 * @param maximum
 * @text Maximum
 * @type Number
 * @min 1
 * @default 100
 * 
 * @param value
 * @text Default Value
 * @type Number
 * @min 0
 * @default 0
 * 
 * @param color1
 * @text Base Color
 * @type Number
 * @min 0
 * @max 32
 * @default 2
 * 
 * @param color2
 * @text Overlay Color
 * @type Number
 * @min 0
 * @max 32
 * @default 5
 * 
 * @param actors
 * @text Actors
 * @desc List all exclusive actors who wanna use this attribute ;)
 * @type Actor[]
 * 
 */

/**
 * @description JayaK Modules
 * @type JayaK
 */
var KUN = KUN || {};

function KunAttributes(){

    var _controller = {
        'debug': false,
        'attributes': {/* list attributes here */}
    };
    /**
     * @returns Boolean
     */
    this.debug = () => _controller.debug;
    /**
     * @param {String} title 
     * @param {String} display 
     * @param {Number} max 
     * @param {Number} value 
     * @param {Number} icon 
     * @param {Number} color1 
     * @param {Number} color2 
     * @param {Number[]} actors
     * @returns 
     */
    this.add = function( title, display, max , value , icon , color1 , color2 , actors ){
        //var name = title.toLowerCase().replace(' ','_');
        var name = KunAttribute.ParseName( title );

        _controller.attributes[ name ] = new KunAttribute( name , title , display , max , value , icon , color1 , color2, actors );

        return this;
    };

    this.Set = {
        'Debug': ( debug ) => _controller.debug = typeof debug === 'boolean' && debug,
    };
    /**
     * @param {Number} actor_id (optional) Fitler by Actor ID
     * @param {Boolean} showAll show all hidden attributes
     * @returns Array|Object
     */
    /*this.attributes = function( actor_id , showAll ){
        showAll = typeof showAll === 'boolean' && showAll;
        var list = Object.values( _controller.attributes );
        return ( typeof actor_id ==='number' ) ?
            list.filter( item => item.available( actor_id ) && ( item.display !== KunAttributes.DisplayType.NONE || showAll ) ) :
            list.filter( item => item.display !== KunAttributes.DisplayType.NONE || showAll );
    };*/
    /**
     * List all attributes by actor
     * @param {Number} actor_id 
     * @param {Boolean} showAll 
     * @returns Array
     */
    this.actorAttributes = function( actor_id , showAll ){
        showAll = typeof showAll === 'boolean' && showAll;
        return this.attributes( true ).filter( item => item.available(actor_id) && ( showAll || item.display !== KunAttributes.DisplayType.NONE ) );
    };
    /**
     * @param {Boolean} list 
     * @returns Object|Array
     */
    this.attributes = function( list ){
        return typeof list === 'boolean' && list ? Object.values(_controller.attributes ) : _controller.attributes;
    };
    /**
     * @param {String} attribute 
     * @returns KunAttribute
     */
    this.getAttribute = function( attribute ){
        return this.hasAttribute( attribute ) ? _controller.attributes[ attribute ] : false;
    };
    /**
     * Attribute exists?
     * @param {String} attribute 
     * @returns Boolean
     */
    this.hasAttribute = ( attribute ) => _controller.attributes.hasOwnProperty( attribute );
    /**
     * @param {Number} actor_id 
     * @returns Object
     */
    this.importDefaultValues = function( actor_id ){
        
        var attributes = {};

        this.actorAttributes( actor_id ).forEach( function( def ){
            attributes[def.name] = def.value;
        });

        return attributes;
    };
    /**
     * @param {Number} actor_id 
     * @returns Object
     */
    this.importDefaults = function( actor_id ){
        return this.actorAttributes(actor_id).map( attribute => attribute.export() );
    };
}

/**
 * 
 */
KunAttributes.SetupActorAttributes = function(){
    //OVERRIDE CHARACTER STATS
    var _KunAttributes_InitMembers = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function() {
        //vanilla
        //this._KunSpecialAttsInitCharacter();
        _KunAttributes_InitMembers.call( this );

        this.setupAttributes();
    };
    Game_Actor.prototype.setupAttributes = function( ){
        //this._kunAtts = KUN.Attributes.importDefaultValues( this._actorId );
        this._kunAtts = this.attributes();
        var _self = this;
        this.defaultAttributes().forEach( function( att ){
            _self.importAttribute( att.name , att.max , att.value );
        });
        console.log( this.attributes());
    };
    /**
     * @returns Array
     */
    Game_Actor.prototype.defaultAttributes = function(){
        return KUN.Attributes.importDefaults( this._actorId );
    };
    /**
     * @param {String} attribute 
     * @returns Number
     */
    Game_Actor.prototype.kunAttribute = function( attribute ){
        return this.hasOwnProperty('_kunAtts') && this._kunAtts.hasOwnProperty(attribute) ? this._kunAtts[ attribute ] : 0;
    };
    /**
     * @param Boolean list
     * @returns {Object|Array}
     */
    Game_Actor.prototype.attributes = function( list ){
        if( !this.hasOwnProperty( '_kunAtts' ) ){
            this._kunAtts = {};
        }
        return typeof list === 'boolean' && list ? Object.values( this._kunAtts ) : this._kunAtts;
    };
    /**
     * @param {String} attribute 
     * @returns Boolean
     */
    Game_Actor.prototype.hasAttribute = function( attribute ){
        return this.attributes().hasOwnProperty(attribute);
    };
    /**
     * @param {String} attribute 
     * @param {Boolean} maxValue
     * @returns Number
     */
    Game_Actor.prototype.getAttribute = function( attribute , maxValue ){
        if( this.hasAttribute( attribute ) ){
            return typeof maxValue === 'boolean' && maxValue ?
                this.attributes()[attribute].max :
                this.attributes()[ attribute ].value;
        }
        return 0;
    };
    /**
     * @param {String} attribute 
     * @param {Number} value 
     * @param {Boolean} maxValue
     * @returns Number
     */
    Game_Actor.prototype.setAttribute = function( attribute , value , maxValue ){
        value = typeof value === 'number' && value > 0 ? value : 0;
        if( this.hasAttribute( attribute ) ){
            if( typeof maxValue === 'boolean' && maxValue && value > 0 ){
                this.attributes()[attribute].max = value;
            }
            else{
                this.attributes()[attribute].value = value;
                //this._kunAtts[attribute].value = value;
            }        
        }
        return this.getAttribute( attribute );
    };
    /**
     * @param {String} attribute 
     * @returns Number
     */
    Game_Actor.prototype.resetAttribute = function( attribute , fullReset ){
        if( typeof fullReset === 'boolean' && fullReset && this.hasAttribute( attribute ) ){
                var att = KUN.Attributes.getAttribute(attribute).export();
                this.importAttribute( attribute , att.max , att.value );    
                return this.getAttribute(attribute);
        }
        return this.setAttribute( attribute );
    };
    /**
     * @param {String} attribute 
     * @param {Number} max 
     * @param {Number} initial 
     * @returns 
     */
    Game_Actor.prototype.importAttribute = function( attribute , max , initial ){
        this._kunAtts[attribute] = {
            'value': initial || 0,
            'max': max || 100,
        };
        return this;
    };
    /**
     * @param {String} attribute 
     * @param {Number} value 
     * @returns Number
     */
    Game_Actor.prototype.updateAttribute = function( attribute , value ){
        value = typeof value === 'number' ? value : 0;
        if( value !== 0 && this.hasAttribute( attribute ) ){
            var max = this.getAttribute( attribute , true );
            var current = this.getAttribute( attribute );
            if( current + value < 0 ){
                value = 0;
            }
            else if( max < current + value ){
                value = max;
            }
            else{
                value += current;
            }
            return this.setAttribute( attribute , value );
        }
        return 0;
    };
};
/**
 * 
 */
KunAttributes.SetupCommands = function(){
    //override vanilla interpreter
    var _KunSpecialAtts_GameInterPreter_Command = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _KunSpecialAtts_GameInterPreter_Command.call(this, command, args);
        if( command === 'KunAttributes'  && args.length >= 4 ){
            var importVar = args.length > 4 && args[4] === 'import';
            //override with plugin command manager
            switch (args[0]) {
                case 'reset':
                    if( args.length > 2 ){
                        kun_attribute_reset( parseInt(args[1]) , args[2] );
                    }
                    break;
                case 'set':
                    if( args.length > 3 ){
                        kun_attribute_set( parseInt(args[1]) , args[2] , parseInt(args[3]) , importVar );
                    }
                    break;
                case 'add':
                    if( args.length > 3 ){
                        kun_attribute_add( parseInt(args[1]) , args[2] , parseInt(args[3]) , importVar );
                    }
                    break;
                case 'sub':
                    if( args.length > 3 ){
                        kun_attribute_sub( parseInt(args[1]) , args[2] , parseInt(args[3]) , importVar );
                    }
                    break;
                case 'export':
                    var exportVar = args.length > 3 ? parseInt( args[3]) : 0;
                    var exportMaxVar = args.length > 4 ? parseInt( args[4]) : 0;
                    var actor = args.length > 1 ? $gameActors.actor(parseInt(args[1])) : null;
                    if( actor !== null && exportVar > 0 ){
                        $gameVariables.setValue( exportVar , actor.getAttribute(args[2]) ) ;
                        if( exportMaxVar > 0 ){
                            $gameVariables.setValue( exportMaxVar , actor.getAttribute(args[2],true) ) ;
                        }
                    }
                    break;
            }
        }
    };
}
/**
 * 
 */
KunAttributes.SetupWindows = function(){
    /**
     * @returns Number
     */
    Window_Status.prototype.getActorID = function(){
        return this._actor !== null ? this._actor._actorId : 0;
    };
    /**
     * @returns Game_Actor
     */
    Window_Status.prototype.hasActor = function(){
        return this._actor !== null;
    }
    Window_Status.prototype.drawBlock3 = function(y) {
        this.drawParameters(0, y);
        this.drawEquipments(240, y);
        this.drawKunAttributes( 456 , this.lineHeight() * 7 );
    };
    /**
     * Render Kun Attributes
     * @param {Number} x 
     * @param {Number} y 
     */
    Window_Status.prototype.drawKunAttributes = function( x , y ){
        var lineHeight = this.lineHeight();
        //renedr gauges here.
        var attributes = KUN.Attributes.actorAttributes( this.getActorID() );
        for( var i = 0 ; i < attributes.length ; i++ ){
            this.drawKunAttribute( x , y + (lineHeight * i) , attributes[ i ] );
        }
    };
    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {String|KunAttribute} attribute 
     * @returns 
     */
    Window_Status.prototype.drawKunAttribute = function( x , y , attribute ){
        
        //this._actor.getLust( true )
        //var attData = typeof attribute === 'object' && attribute instanceof KunAttribute ?
        //    attribute : //
        //    typeof attribute === 'string' ? KUN.Attributes.getAttribute( attribute ) : false;
        var attData = attribute || false;

        if( attData === false ) return;

        var display = attData.display;

        if( display === KunAttributes.DisplayType.NONE ){
            return ;
        }

        var width = 270;
        var showValue = display === KunAttributes.DisplayType.COUNTER || display === KunAttributes.DisplayType.FULL;
        var showGauge = display === KunAttributes.DisplayType.GAUGE || display === KunAttributes.DisplayType.FULL;
        var icon = attData.icon;
        var title = attData.title;
        var value = this._actor.getAttribute( attData.name );
        var range = this._actor.getAttribute( attData.name , true );

        if( icon > 0 ){
            //this.drawIcon(icon, x - Window_Base._iconWidth - 4 , y + 6 );
            this.drawIcon(icon, x , y + 10 );
        }
        this.changeTextColor(this.systemColor());
        this.drawText( title , icon > 0 ? x + Window_Base._iconWidth + 4 : x, y, 270);
        this.resetTextColor();
        if( showValue ){
            this.drawText( value, x, y, 270, 'right');
        }
        if( showGauge ){
            var color1 = this.textColor(attData.color1); //get attribute color1
            var color2 = this.textColor(attData.color2); //get attribute color2

            this.drawGauge(
                icon > 0 ? x + Window_Base._iconWidth + 4 : x,
                y + 4,
                icon > 0 ? width - Window_Base._iconWidth - 4 : width,
                value / parseFloat(range),
                color1, color2 );
        }
    };
}


KunAttributes.Import = function( input ){

    var output = [];

    ( input.length > 0 ? JSON.parse( input ) : [] ).map( gauge => gauge.length ? JSON.parse(gauge) : null ).forEach( function( gauge ){
        if( gauge !== null ){
            output.push({
                'name': gauge.name,
                'display': gauge.display,
                'icon': parseInt(gauge.icon),
                'color1': parseInt(gauge.color1),
                'color2': parseInt(gauge.color2),
                'maximum': parseInt(gauge.maximum),
                'value': parseInt(gauge.value),
                'actors': gauge.actors.length > 0 ? JSON.parse( gauge.actors ).map( actor_id => parseInt(actor_id ) ) : [],
            });
        }
    });

    return output;
};
/**
 * return Boolean
 */
KunAttributes.CheckSetupUI = () =>{ return KUN.hasOwnProperty('SetupUI') && KUN.SetupUI.hasOwnProperty('actorStatus') && KUN.SetupUI.actorStatus; }
/**
 * @param {String} message 
 */
KunAttributes.DebugLog = function( message ){
    if( KUN.Attributes.debug( ) ){
        if( typeof message === 'object' ){
            console.log(  '[ KunAttributes ] - ' + message.constructor.name );
            console.log( message ) ;
        }
        else{
            console.log( '[KunAttributes]' + message );
        }    
    }
};

KunAttributes.DisplayType = {
    'NONE':'none',
    'COUNTER':'counter',
    'GAUGE': 'gauge',
    'FULL': 'full'
};
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Number} value 
 * @param {Boolean} useVars 
 * @returns Number
 */
function kun_attribute_sub( actor_id , attribute, value , useVars ){
    if( typeof useVars === 'boolean' && useVars ){
        actor_id = $gameVariables.value(actor_id);
        value = $gameVariables.value(value);
    }
    return actor_id > 0 ? $gameActors.actor(actor_id).updateAttribute( attribute , -value ) : 0;
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Number} value 
 * @param {Boolean} useVars 
 * @returns Number
 */
function kun_attribute_add( actor_id , attribute, value , useVars ){
    if( typeof useVars === 'boolean' && useVars ){
        actor_id = $gameVariables.value(actor_id);
        value = $gameVariables.value(value);
    }
    return actor_id > 0 ? $gameActors.actor(actor_id).updateAttribute( attribute , value ) : 0;
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Number} value (optional)
 * @param {Boolean} useVars 
 * @returns 
 */
function kun_attribute_set( actor_id , attribute, value , useVars ){
    if( typeof useVars === 'boolean' && useVars ){
        actor_id = $gameVariables.value(actor_id);
        value = $gameVariables.value(value);
    }
    return actor_id > 0 ? $gameActors.actor(actor_id).setAttribute( attribute , value ) : 0;
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @returns 
 */
function kun_attribute_reset( actor_id , attribute ){
    return actor_id > 0 ? $gameActors.actor(actor_id).resetAttribute( attribute ) : 0;
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @returns 
 */
function kun_attribute( actor_id , attribute ){
    return actor_id > 0 ? $gameActors.actor(actor_id).getAttribute( attribute ) : 0;
}
/**
 * @param {String} name 
 * @param {String} title
 * @param {String} display 
 * @param {Number} max 
 * @param {Number} value 
 * @param {Number} icon 
 * @param {Number} color1 
 * @param {Number} color2 
 * @param {Number[]} actors
 * @returns 
 */
function KunAttribute( name , title , display, max , value , icon , color1, color2 , actors ){

    this.name = name;
    this.title = title;
    this.display = display || KunAttributes.DisplayType.NONE;
    this.max = max || 1;
    this.value = value || 0;
    this.icon = icon || 0;
    this.color1 = color1 || 2;
    this.color2 = color2 || 5;
    this.actors = actors || [];

    /**
     * @param {Number} actor_id 
     * @returns boolean
     */
    this.available = ( actor_id ) => actor_id === 0 || this.actors.length === 0 || this.actors.includes( actor_id );
    /**
     * @returns Object
     */
    this.export = function(){
        return {
            'name':this.name,
            'max': this.max,
            'value': this.value,
        };
    };

    return this;
}
/**
 * @param {String} text 
 * @returns String
 */
KunAttribute.ParseName = ( text ) => typeof text === 'string' ? text.toLowerCase().replace(/[\s\_]/,'-') : text;



( function( ){

    var parameters = PluginManager.parameters('KunAttributes');
    KUN.Attributes = new KunAttributes();
    KUN.Attributes.Set.Debug( parameters.debug === 'true' );
    KunAttributes.Import( parameters.attributes ).forEach( function( attribute ){
        //console.log( attribute );
        KUN.Attributes.add(
            attribute.name,
            attribute.display,
            attribute.maximum,
            attribute.value,
            attribute.icon,
            attribute.color1,
            attribute.color2,
            attribute.actors
        );
    });

    //console.log( KUN.Attributes.attributes(true).map( att => att.export()) );

    KunAttributes.SetupActorAttributes();
    KunAttributes.SetupWindows();
    KunAttributes.SetupCommands();
} )( );




