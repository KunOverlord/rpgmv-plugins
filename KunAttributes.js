//=============================================================================
// KunAttributes.js
//=============================================================================
/*:
 * @plugindesc Kun Special Attributes
 * @filename KunAttributes.js
 * @author Kun
 * @version 1.54
 * 
 * @help
 * 
 * COMMANDS
 * 
 *      KunAttributes reset [actor_id] [attribute_name]
 *          Resets acgor's gauge to the original value
 * 
 *      KunAttributes set [actor_id] [attribute_name] [amount] [import]
 *          Sets actor's gauge_name the provided amount. Use import to use a gameVariable value
 * 
 *      KunAttributes add [actor_id] [attribute_name] [amount] [import]
 *          Adds actor's gauge_name the provided amount. Use import to use a gameVariable value
 * 
 *      KunAttributes sub [actor_id] [attribute_name] [amount] [import]
 *          Substract actor's gauge_name the provided amount. Use import to use a gameVariable value
 * 
 *      KunAttributes maximum [actor_id] [attribute_name] [maximum] [import]
 *          Sets the maximum range of the selected attribute and updates the current value if required to fit the new range.
 * 
 *      KunAttributes progress [actor_id] [attribute_name] [exportVar]
 *          Exports the selected attribute's percentage value into a Game Variable [exportVar]
 * 
 *      KunAttributes export [actor_id] [attribute_name] [value_var] [maximum_var]
 *          Export actor_id attribute current value into value_var
 *          Export actor_id max attribute value using maximum_var
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
 * @type number
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
 * @type number
 * @min 1
 * @default 100
 * 
 * @param maxVar
 * @text Maximum Variable ID
 * @parent maximum
 * @type variable
 * @min 0
 * @default 0
 * 
 * @param value
 * @text Default Value
 * @type number
 * @min 0
 * @default 0
 * 
 * @param valueVar
 * @parent value
 * @text Value Variable ID
 * @type variable
 * @min 0
 * @default 0
 * 
 * @param color1
 * @text Base Color
 * @type number
 * @min 0
 * @max 32
 * @default 2
 * 
 * @param color2
 * @text Overlay Color
 * @type number
 * @min 0
 * @max 32
 * @default 5
 * 
 * @param actors
 * @text Actors
 * @desc List all exclusive actors who wanna use this attribute ;)
 * @type actor[]
 * 
 */

/**
 * @description JayaK Modules
 * @type JayaK
 */
var KUN = KUN || {};

function KunAttributes(){
    throw `${this.constructor.name} is a Static Class`;
};
/**
 * 
 * @returns KunAttributes
 */
KunAttributes.Initialize = function( ){

    var _parameters = PluginManager.parameters('KunAttributes');

    this._debug = _parameters.debug === 'true';
    
    this._attributes = {
        //list attribute definition here
    };

    return this.Import( _parameters.attributes.length > 0 ? JSON.parse(_parameters.attributes ) : [] );
}

    /**
     * @returns Boolean
     */
    KunAttributes.debug = function(){
        return this._debug;
    }
    /**
     * @param {String} attribute 
     * @returns Boolean
     */
    KunAttributes.has = function( attribute ){
        return typeof attribute === 'string' && attribute.length > 0 && this._attributes.hasOwnProperty( attribute );
    };

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
    KunAttributes.add = function( name ,title, display, max , value , icon , color1 , color2 , actors ){
        //var name = title.toLowerCase().replace(' ','_');
        //var name = KunAttribute.ParseName( title );

        if( !this.has( name ) ){
            this._attributes[ name ] = new KunAttribute( name , title , display , max , value , icon , color1 , color2, actors );
        }
        
        return this;
    };

    /**
     * List all attributes by actor
     * @param {Number} actor_id 
     * @param {Boolean} showAll 
     * @returns Array
     */
    KunAttributes.actorAttributes = function( actor_id , showAll ){
        showAll = typeof showAll === 'boolean' && showAll;
        return this.attributes( true ).filter( item => item.available(actor_id) && ( showAll || item.display !== KunAttributes.DisplayType.NONE ) );
    };
    /**
     * @param {Number} actor_id 
     * @param {Boolean} countAll 
     * @returns Number
     */
    KunAttributes.countAttributes = function( actor_id , countAll ){
        return this.actorAttributes( actor_id , countAll ).length;
    };
    /**
     * @param {Boolean} list 
     * @returns Object|Array
     */
    KunAttributes.attributes = function( list ){
        return typeof list === 'boolean' && list ? Object.values(this._attributes ) : this._attributes;
    };
    /**
     * @param {String} attribute 
     * @returns KunAttribute
     */
    KunAttributes.getAttribute = function( attribute ){
        return this.has( attribute ) ? this._attributes[ attribute ] : false;
    };
    /**
     * Attribute exists?
     * @param {String} attribute 
     * @returns Boolean
     */
    KunAttributes.hasAttribute = function( attribute ){
        return this.has( attribute );
    };
    /**
     * @param {Number} actor_id 
     * @returns Object
     */
    KunAttributes.importDefaultValues = function( actor_id ){
        
        var attributes = {};

        this.actorAttributes( actor_id ).forEach( function( def ){
            attributes[def.name] = {
                'value': def.value,
                'max': def.max,
            };
        });

        return attributes;
    };
    /**
     * @param {Number} actor_id 
     * @returns Object
     */
    KunAttributes.importDefaults = function( actor_id ){
        return this.actorAttributes(actor_id).map( attribute => attribute.export() );
    };



/**
 * 
 * @param {Object} input 
 * @returns KunAttributes
 */
KunAttributes.Import = function( input ){

    var output = [];

    input.map( att => att.length ? JSON.parse(att) : null ).forEach( function( att ){
        if( att !== null ){
                //console.log( attribute );
                KunAttributes.add(
                    att.name,
                    att.title || att.name.toLowerCase().replace(/[\s\_]/,'-'),
                    att.display,
                    parseInt( att.maximum ),
                    parseInt( att.value ),
                    parseInt( att.icon ),
                    parseInt( att.color1 ),
                    parseInt( att.color2 ),
                    att.actors.length > 0 ? JSON.parse( att.actors ).map( actor_id => parseInt( actor_id ) ) : [],
                );
        }

    });

    return this;
};


/**
 * 
 */
function KunAttributes_SetupActorAttributes(){
    //OVERRIDE CHARACTER STATS
    var _KunAttributes_InitMembers = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function() {
        //vanilla
        //this._KunSpecialAttsInitCharacter();
        _KunAttributes_InitMembers.call( this );

        this.setupAttributes();
    };
    Game_Actor.prototype.setupAttributes = function( ){
        //this._kunAtts = KunAttributes.importDefaultValues( this._actorId );
        this._kunAtts = this.attributes();
        var _self = this;
        this.defaultAttributes().forEach( function( att ){
            _self.importAttribute( att.name , att.max , att.value );
        });
        //console.log( this.attributes());
    };
    /**
     * @returns Array
     */
    Game_Actor.prototype.defaultAttributes = function(){
        return KunAttributes.importDefaults( this._actorId );
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
     * Export the % value of the selected attribute
     * @param {String} attribute 
     * @returns Number
     */
    Game_Actor.prototype.getAttributeProgress = function( attribute ){
        if( this.hasAttribute( attribute ) ){
            var _attribute = this.attributes()[attribute];
            return _attribute.max > 0 ? parseInt(_attribute.value / _attribute.max * 100) : 0;
        }
        return 0;
    };
    /**
     * @param {String} attribute 
     * @param {Number} value 
     * @param {Boolean} setMaximum
     * @returns Number
     */
    Game_Actor.prototype.setAttribute = function( attribute , value , setMaximum ){
        value = typeof value === 'number' && value > 0 ? value : 0;
        if( this.hasAttribute( attribute ) ){
            if( typeof setMaximum === 'boolean' && setMaximum && value > 0 ){
                this.attributes()[attribute].max = value;
                if( this.attributes()[attribute].value > value ){
                    this.attributes()[attribute].value = value;
                }
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
                var att = KunAttributes.getAttribute(attribute).export();
                this.importAttribute( att.name , att.max , att.value );    
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
            switch( true ){
                case current + value < 0:
                    value = 0
                    break;
                case max < current + value:
                    value = max;
                    break;
                default:
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
function KunAttributes_SetupCommands(){
    //override vanilla interpreter
    var _KunSpecialAtts_GameInterPreter_Command = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _KunSpecialAtts_GameInterPreter_Command.call(this, command, args);
        if( command === 'KunAttributes'  && args.length >= 4 ){
            var _import = args.length > 4 && args[4] === 'import';
            //override with plugin command manager
            switch (args[0]) {
                case 'reset':
                    if( args.length > 2 ){
                        kun_attribute_reset( parseInt(args[1]) , args[2] );
                    }
                    break;
                case 'maximum':
                    if( args.length > 2 ){
                        kun_attribute_maximum(
                             _import ? $gameVariables.value( parseInt( args[ 1 ] ) ) : parseInt( args[ 1 ] ) ,
                             args[2] ,
                             _import ? $gameVariables.value( parseInt( args[ 3 ] ) ) : parseInt( args[ 3 ] ) );
                    }
                    break;
                case 'set':
                    if( args.length > 3 ){
                        kun_attribute_set(
                            _import ? $gameVariables.value( parseInt( args[ 1 ] ) ) : parseInt( args[ 1 ] ) ,
                            args[2] ,
                            _import ? $gameVariables.value( parseInt( args[ 3 ] ) ) : parseInt( args[ 3 ] ) );
                    }
                    break;
                case 'add':
                    if( args.length > 3 ){
                        kun_attribute_add( 
                            _import ? $gameVariables.value( parseInt( args[ 1 ] ) ) : parseInt( args[ 1 ] ) ,
                            args[2] ,
                            _import ? $gameVariables.value( parseInt( args[ 3 ] ) ) : parseInt( args[ 3 ] ) );
                    }
                    break;
                case 'sub':
                    if( args.length > 3 ){
                        kun_attribute_sub(
                            _import ? $gameVariables.value( parseInt( args[ 1 ] ) ) : parseInt( args[ 1 ] ) ,
                            args[2] ,
                            _import ? $gameVariables.value( parseInt( args[ 3 ] ) ) : parseInt( args[ 3 ] ) );
                    }
                    break;
                case 'progress':
                    var _exportVar = args.length > 3 ? parseInt(args[3]) : 0;
                    var _actor = args.length > 1 ? $gameActors.actor(parseInt(args[1])) : null;
                    if( _actor !== null && _exportVar > 0 ){
                        $gameVariables.setValue( _exportVar , _actor.getAttributeProgress( args[2]) );
                    }
                    break;
                case 'export':
                    var _valueVar = args.length > 3 ? parseInt( args[3]) : 0;
                    var _maxVar = args.length > 4 ? parseInt( args[4]) : 0;
                    var actor = args.length > 1 ? $gameActors.actor(parseInt(args[1])) : null;
                    if( actor !== null && _valueVar > 0 ){
                        $gameVariables.setValue( _valueVar , actor.getAttribute( args[2]) ) ;
                        if( _maxVar > 0 ){
                            $gameVariables.setValue( _maxVar , actor.getAttribute( args[2],true) ) ;
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
function KunAttributes_SetupWindows(){
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
        var attributes = KunAttributes.actorAttributes( this.getActorID() );
        var count = attributes.length;
        for( var i = 0 ; i < attributes.length ; i++ ){
            if( count > 6 ){
                this.drawKunAttribute(
                     i % 2 > 0 ? x + 140 : x,
                     y + lineHeight * Math.floor(i / 2) , attributes[ i ] );
            }
            else{
                //full width
                this.drawKunAttribute( x , y + (lineHeight * i) , attributes[ i ] , true );
            }
        }
    };
    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {String|KunAttribute} attribute 
     * @param {Boolean} fullWidth
     * @returns 
     */
    Window_Status.prototype.drawKunAttribute = function( x , y , attribute , fullWidth ){
        
        //this._actor.getLust( true )
        //var attData = typeof attribute === 'object' && attribute instanceof KunAttribute ?
        //    attribute : //
        //    typeof attribute === 'string' ? KunAttributes.getAttribute( attribute ) : false;
        var attData = attribute || false;

        fullWidth = typeof fullWidth === 'boolean' && fullWidth;

        if( attData === false ) return;

        var display = attData.display;

        if( display === KunAttributes.DisplayType.NONE ){
            return ;
        }

        var width = fullWidth ? 270 : 135;
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

/**
 * return Boolean
 */
KunAttributes.CheckSetupUI = () =>{ return KUN.hasOwnProperty('SetupUI') && KUN.SetupUI.hasOwnProperty('actorStatus') && KUN.SetupUI.actorStatus; }
/**
 * @param {String} message 
 */
KunAttributes.DebugLog = function( message ){
    if( KunAttributes.debug( ) ){
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

    return this;
}
/**
 * @param {Number} actor_id 
 * @returns Boolean
 */
KunAttribute.prototype.available = function( actor_id ){
    return actor_id === 0 || this.actors.length === 0 || this.actors.includes( actor_id ); 
};
/**
 * @returns Object
 */
KunAttribute.prototype.export = function(){
    return {
        'name': this.name,
        'max': this.max,
        'value': this.value,
    };
};
/**
 * @param {Number} max 
 * @returns KunAttribute
 */
KunAttribute.prototype.updateMax = function( max ){
    if ( typeof max === 'number' && max > 0 ){
        this.max = max;
        if( this.value > this.max ){
            this.vaue = this.max;
        }
    }
    return this;
};
/**
 * @param {String} text 
 * @returns String
 */
KunAttribute.ParseName = ( text ) => typeof text === 'string' ? text.toLowerCase().replace(/[\s\_]/,'-') : text;
/** 
 * @returns KunAttribute
 */
KunAttribute.Invalid = function(){
    return new KunAttribute('__INVALID__');
};



/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Number} maximum 
 * @returns 
 */
function kun_attribute_maximum( actor_id , attribute , maximum ){
    return actor_id > 0 ? $gameActors.actor(actor_id).setAttribute( attribute , maximum , true ) : 0;    
};
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Number} value 
 * @returns Number
 */
function kun_attribute_sub( actor_id , attribute, value  ){
    return kun_attribute_add( actor_id , attribute , -value , false );
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Number} value 
 * @returns Number
 */
function kun_attribute_add( actor_id , attribute, value ){
    if( actor_id ){
        var actor = $gameActors.actor(actor_id);
        if( actor !== null ){
            return $gameActors.actor(actor_id).updateAttribute( attribute , value );
        }
    }
    return 0;
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Number} value (optional)
 * @returns 
 */
function kun_attribute_set( actor_id , attribute, value ){
    return actor_id > 0 ? $gameActors.actor(actor_id).setAttribute( attribute , value ) : 0;
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Boolean} fullReset
 * @returns 
 */
function kun_attribute_reset( actor_id , attribute , fullReset ){
    return actor_id > 0 ? $gameActors.actor(actor_id).resetAttribute( attribute , fullReset ) : 0;
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @returns 
 */
function kun_attribute( actor_id , attribute ){
    return actor_id > 0 ? $gameActors.actor(actor_id).getAttribute( attribute ) : 0;
}


( function( ){

    KunAttributes.Initialize();


    //console.log( KunAttributes.attributes(true).map( att => att.export()) );

    KunAttributes_SetupActorAttributes();
    KunAttributes_SetupWindows();
    KunAttributes_SetupCommands();
} )( );




