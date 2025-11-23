//=============================================================================
// KunAttributes.js
//=============================================================================
/*:
 * @plugindesc Kun Special Attributes
 * @filename KunAttributes.js
 * @author Kun
 * @version 1.62
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
 * @param reverse
 * @type boolean
 * @text Reverse
 * @desc define a negative progress bar below 0 to -max
 * @default false
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
 * @param events
 * @type struct<Event>[]
 * @text Events
 * @desc Define a list of events to perform special actions when an actor meets a condition
 * 
 */
/*~struct~Event:
 * @param value
 * @type number
 * @text Value
 * @desc check the target value for this condition
 * @min 0
 * @default 0
 * 
 * @param operation
 * @text Operation
 * @desc Select the proper operation to compare value to the current attribute
 * @type select
 * @option Greater
 * @value greater
 * @option Greater or Equal
 * @value greater-equal
 * @option Equal
 * @value equal
 * @option Less or Equal
 * @value less-equal
 * @option Less
 * @value less
 * @default equal
 * 
 * @param actions
 * @type struct<Action>[]
 * @text Actions
 * @desc Run these actions when the required condition is met
 */
/*~struct~Action:
 * @param addState
 * @text Add State
 * @type state[]
 * @desc Add these states
 * 
 * @param remState
 * @text Remove State
 * @type state[]
 * @desc Remove these states
 * 
 * @param title
 * @text Set Attribute Title
 * @type text
 * 
 * @param icon
 * @text Set Attribute Icon
 * @type number
 * 
 * @param colors
 * @text Set Bar Color
 * @desc Define one or two color values to set the attribute bar layout
 * @type number[]
 * 
 * @param message
 * @type text
 * @text Message
 * @desc Define here a message to display when this action is fired. Requires KunNotifier.
 * 
 * @param media
 * @text Play Media
 * @desc Play a Sound Effect when running this action
 * @type file
 * @dir audio/se/
 */
/**
 * @description JayaK Modules
 * @type JayaK
 */
var KUN = KUN || {};

function KunAttributes() {
    throw `${this.constructor.name} is a Static Class`;
};
/**
 * 
 * @returns KunAttributes
 */
KunAttributes.Initialize = function () {

    var _parameters = PluginManager.parameters('KunAttributes');

    this._debug = _parameters.debug === 'true';

    this._attributes = {
        //list attribute definition here
    };

    return this.Import(_parameters.attributes.length > 0 ? JSON.parse(_parameters.attributes) : []);
}

/**
 * @returns Boolean
 */
KunAttributes.debug = function () {
    return this._debug;
}
/**
 * @param {String} attribute 
 * @returns Boolean
 */
KunAttributes.has = function (attribute) {
    return typeof attribute === 'string' && attribute.length > 0 && this.attributes().hasOwnProperty(attribute);
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
KunAttributes.addAttribute = function ( attribute ) {

    if ( attribute instanceof KunAttribute && !this.has(attribute.name())) {
        this._attributes[attribute.name()] = attribute;
    }

    return this;
};

/**
 * List all attributes by actor
 * @param {Number} actor_id 
 * @param {Boolean} showAll 
 * @returns KunAttribute[]
 */
KunAttributes.actorAttributes = function (actor_id, showAll) {
    showAll = typeof showAll === 'boolean' && showAll;
    return this.attributes(true).filter(item => item.available(actor_id) && (showAll || item.display !== KunAttributes.DisplayType.NONE));
};
/**
 * @param {Number} actor_id 
 * @param {Boolean} countAll 
 * @returns Number
 */
KunAttributes.countAttributes = function (actor_id, countAll) {
    return this.actorAttributes(actor_id, countAll).length;
};
/**
 * @param {Boolean} list 
 * @returns Object|KunAttribute[]
 */
KunAttributes.attributes = function (list) {
    return typeof list === 'boolean' && list ? Object.values(this._attributes) : this._attributes;
};
/**
 * @param {String} attribute 
 * @returns KunAttribute
 */
KunAttributes.getAttribute = function (attribute) {
    return this.has(attribute) ? this._attributes[attribute] : null;
};
/**
 * Attribute exists?
 * @param {String} attribute 
 * @returns Boolean
 */
KunAttributes.hasAttribute = function (attribute) {
    return this.has(attribute);
};
/**
 * @param {Number} actor_id 
 * @returns Object
 */
KunAttributes.importDefaultValues = function (actor_id) {

    var attributes = {};

    this.actorAttributes(actor_id).forEach(function (def) {
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
KunAttributes.importDefaults = function (actor_id) {
    return this.actorAttributes(actor_id).map(attribute => attribute.export());
};



/**
 * 
 * @param {Object} input 
 * @returns KunAttributes
 */
KunAttributes.Import = function (input) {

    input.map(att => att.length ? JSON.parse(att) : null).forEach(function (att) {
        if (att !== null) {
            //console.log( attribute );
            var attribute = new KunAttribute(
                att.name,
                att.title,
                att.display,
                parseInt(att.maximum),
                parseInt(att.value),
                parseInt(att.icon),
                parseInt(att.color1),
                parseInt(att.color2),
                att.reverse === 'true',
                att.actors.length > 0 ? JSON.parse(att.actors).map(actor_id => parseInt(actor_id)) : []);

            (att.events.length > 0 ? JSON.parse(att.events ) : []).map( e => JSON.parse(e)).forEach( function( e ){
                var event = new KunAttributeEvent( parseInt(e.value) , e.operation );
                (e.actions.length > 0 ? JSON.parse( e.actions ) : []).map( action => JSON.parse(action)).forEach( function( action ){
                    var color = (action.colors.length > 0 ? JSON.parse(action.colors) : []).map( c => parseInt(c));
                    event.addAction( new KunAttributeAction(
                        (action.addState.length > 0 ? JSON.parse(action.addState) : []).map( state => parseInt(state)),
                        (action.remState.length > 0 ? JSON.parse(action.remState) : []).map( state => parseInt(state)),
                        action.title || '',
                        parseInt(action.icon),
                        color.length ? color[0] : 0,
                        color.length > 1 ? color[1] : ( color.length ? color[0] : 0),
                        action.message,
                        action.media
                    ));
                });
                attribute.addEvent( event );
            });

            KunAttributes.addAttribute( attribute );
        }

    });

    return this;
};


/**
 * 
 */
function KunAttributes_SetupActorAttributes() {
    /**
     * @returns Game_Actor[]
     */
    Game_Actors.prototype.list = function() {
        return this._data;
    };
    //OVERRIDE CHARACTER STATS
    var _KunAttributes_InitMembers = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function () {
        //vanilla
        //this._KunSpecialAttsInitCharacter();
        _KunAttributes_InitMembers.call(this);

        this.setupAttributes();
    };
    Game_Actor.prototype.setupAttributes = function () {
        this._kunAtts = {};
        var _attributes = this._kunAtts;
        KunAttributes.importDefaults(this._actorId).forEach( function( attribute ){
            //console.log(attribute);
            _attributes[attribute.name] = {
                'max': attribute.max,
                'value': attribute.value,
            };
        });
        //console.log( this.attributes());
    };
    /**
     * @param Boolean list
     * @returns {Object|Array}
     */
    Game_Actor.prototype.attributes = function (list) {
        if (!this.hasOwnProperty('_kunAtts')) {
            this._kunAtts = {};
        }
        return typeof list === 'boolean' && list ? Object.values(this._kunAtts) : this._kunAtts;
    };
    /**
     * @param {String} attribute 
     * @returns Boolean
     */
    Game_Actor.prototype.hasAttribute = function (attribute) {
        return this.attributes().hasOwnProperty(attribute) && KunAttributes.has(attribute);
    };
    /**
     * @param {String} attribute 
     * @returns Number
     */
    Game_Actor.prototype.getAttribute = function (attribute) {
        return this.hasAttribute(attribute) ? this.attributes()[attribute].value : 0;
    };
    /**
     * @param {String} attribute 
     * @returns Number
     */
    Game_Actor.prototype.getAttributeMax = function (attribute) {
        return this.hasAttribute(attribute) ? this.attributes()[attribute].max : 0;
    };
    /**
     * @param {String} attribute 
     * @returns Number
     */
    Game_Actor.prototype.getAttributeMin = function (attribute) {
        return this.hasAttribute(attribute) && KunAttributes.getAttribute(attribute).reverse() ? -this.attributes()[attribute].max : 0;
    };
    /**
     * Export the % value of the selected attribute
     * @param {String} attribute 
     * @returns Number
     */
    Game_Actor.prototype.getAttributeProgress = function (attribute) {
        if (this.hasAttribute(attribute)) {
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
    Game_Actor.prototype.setAttribute = function (attribute, value, setMaximum) {
        if (this.hasAttribute(attribute)) {
            if (typeof setMaximum === 'boolean' && setMaximum) {
                value = typeof value === 'number' && value > 0 ? value : 0;
                if( value > 0){
                    this.attributes()[attribute].max = value;
                    if (this.attributes()[attribute].value > value) {
                        //trim value if max reduced size
                        this.attributes()[attribute].value = value;
                    }    
                }
            }
            else {
                var attDef = KunAttributes.getAttribute(attribute);
                var max = attDef.max();
                var min = attDef.reverse() ? -max : 0;
                value = typeof value === 'number' && value > min ? (value < max ? value : max) : min;
                this.attributes()[attribute].value = value;
                attDef.update( value , this.actorId() );
            }
        }
        return this.getAttribute(attribute);
    };
    /**
     * @param {String} attribute 
     * @returns Number
     */
    Game_Actor.prototype.resetAttribute = function ( attribute , fullReset ) {
        if ( typeof fullReset === 'boolean' && fullReset && this.hasAttribute( attribute ) ) {
            return this.importAttribute( KunAttributes.getAttribute(attribute) ).getAttribute(attribute);
        }
        return this.setAttribute(attribute);
    };
    /**
     * @param {KunAttribute} attribute 
     * @returns Game_Actor
     */
    Game_Actor.prototype.importAttribute = function ( attribute ) {
        if( attribute instanceof KunAttribute ){
            this._kunAtts[attribute.name()] = {
                'value': attribute.value(),
                'max': attribute.max(),
            };    
        }
        return this;
    };
    /**
     * @param {String} attribute 
     * @param {Number} value 
     * @returns Number
     */
    Game_Actor.prototype.updateAttribute = function (attribute, value) {
        value = typeof value === 'number' ? value : 0;
        if (value !== 0 && this.hasAttribute(attribute)) {
            var max = this.getAttributeMax(attribute);
            var min = this.getAttributeMin( attribute);
            var current = this.getAttribute(attribute);
            switch (true) {
                case current + value < min:
                    value = min
                    break;
                case max < current + value:
                    value = max;
                    break;
                default:
                    value += current;
            }
            return this.setAttribute(attribute, value);
        }
        return 0;
    };
};
/**
 * 
 */
function KunAttributes_SetupCommands() {
    //override vanilla interpreter
    var _KunSpecialAtts_GameInterPreter_Command = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunSpecialAtts_GameInterPreter_Command.call(this, command, args);
        if (command === 'KunAttributes' && args.length >= 4) {
            var _import = args.length > 4 && args[4] === 'import';
            //override with plugin command manager
            switch (args[0]) {
                case 'reset':
                    if (args.length > 2) {
                        kun_attribute_reset(parseInt(args[1]), args[2]);
                    }
                    break;
                case 'maximum':
                    if (args.length > 2) {
                        kun_attribute_maximum(
                            _import ? $gameVariables.value(parseInt(args[1])) : parseInt(args[1]),
                            args[2],
                            _import ? $gameVariables.value(parseInt(args[3])) : parseInt(args[3]));
                    }
                    break;
                case 'set':
                    if (args.length > 3) {
                        kun_attribute_set(
                            _import ? $gameVariables.value(parseInt(args[1])) : parseInt(args[1]),
                            args[2],
                            _import ? $gameVariables.value(parseInt(args[3])) : parseInt(args[3]));
                    }
                    break;
                case 'add':
                    if (args.length > 3) {
                        kun_attribute_add(
                            _import ? $gameVariables.value(parseInt(args[1])) : parseInt(args[1]),
                            args[2],
                            _import ? $gameVariables.value(parseInt(args[3])) : parseInt(args[3]));
                    }
                    break;
                case 'sub':
                    if (args.length > 3) {
                        kun_attribute_sub(
                            _import ? $gameVariables.value(parseInt(args[1])) : parseInt(args[1]),
                            args[2],
                            _import ? $gameVariables.value(parseInt(args[3])) : parseInt(args[3]));
                    }
                    break;
                case 'progress':
                    var _exportVar = args.length > 3 ? parseInt(args[3]) : 0;
                    var _actor = args.length > 1 ? $gameActors.actor(parseInt(args[1])) : null;
                    if (_actor !== null && _exportVar > 0) {
                        $gameVariables.setValue(_exportVar, _actor.getAttributeProgress(args[2]));
                    }
                    break;
                case 'export':
                    var _valueVar = args.length > 3 ? parseInt(args[3]) : 0;
                    var _maxVar = args.length > 4 ? parseInt(args[4]) : 0;
                    var actor = args.length > 1 ? $gameActors.actor(parseInt(args[1])) : null;
                    if (actor !== null && _valueVar > 0) {
                        $gameVariables.setValue(_valueVar, actor.getAttribute(args[2]));
                        if (_maxVar > 0) {
                            $gameVariables.setValue(_maxVar, actor.getAttributeMax(args[2]));
                        }
                    }
                    break;
                case 'migrate':
                    //migrate from amirian
                    if( args.length > 2){
                        $gameActors.list().filter( actor => actor.hasOwnProperty('_lust')).forEach( function( actor ){
                            actor.setAttribute( args[2] , parseInt( actor._lust ) );
                            delete actor._lust;
                        });
                    }
                    break;
            }
        }
    };
}
/**
 * 
 */
function KunAttributes_SetupWindows() {
    /**
     * @returns Number
     */
    Window_Status.prototype.getActorID = function () {
        return this._actor !== null ? this._actor._actorId : 0;
    };
    /**
     * @returns Game_Actor
     */
    Window_Status.prototype.hasActor = function () {
        return this._actor !== null;
    }
    Window_Status.prototype.drawBlock3 = function (y) {
        this.drawParameters(0, y);
        this.drawEquipments(240, y);
        this.drawKunAttributes(456, this.lineHeight() * 7);
    };
    /**
     * Render Kun Attributes
     * @param {Number} x 
     * @param {Number} y 
     */
    Window_Status.prototype.drawKunAttributes = function (x, y) {
        var lineHeight = this.lineHeight();
        //renedr gauges here.
        var attributes = KunAttributes.actorAttributes(this.getActorID());
        var count = attributes.length;
        for (var i = 0; i < attributes.length; i++) {
            if (count > 6) {
                this.drawKunAttribute(
                    i % 2 > 0 ? x + 140 : x,
                    y + lineHeight * Math.floor(i / 2), attributes[i]);
            }
            else {
                //full width
                this.drawKunAttribute(x, y + (lineHeight * i), attributes[i], true);
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
    Window_Status.prototype.drawKunAttribute = function (x, y, attribute, fullWidth) {

        fullWidth = typeof fullWidth === 'boolean' && fullWidth;

        if( attribute instanceof KunAttribute && attribute.display() !== KunAttributes.DisplayType.NONE){
            var display = attribute.display();
            var width = fullWidth ? 270 : 135;
            var showValue = display === KunAttributes.DisplayType.COUNTER || display === KunAttributes.DisplayType.FULL;
            var showGauge = display === KunAttributes.DisplayType.GAUGE || display === KunAttributes.DisplayType.FULL;
            //var icon = attribute.icon();
            //var title = attribute.title();
            var value = this._actor.getAttribute(attribute.name());
            var range = this._actor.getAttributeMax(attribute.name());
            var layout = attribute.export( value );
            console.log( layout );
    
            if (layout.icon > 0) {
                this.drawIcon(layout.icon, x, y + 10);
            }
            this.changeTextColor(this.systemColor());
            this.drawText( layout.title, layout.icon > 0 ? x + Window_Base._iconWidth + 4 : x, y, 270);
            this.resetTextColor();
            if (showValue) {
                this.drawText(value, x, y, 270, 'right');
            }
            if (showGauge) {
                var color1 = this.textColor(layout.color1); //get attribute color1
                var color2 = this.textColor(layout.color2); //get attribute color2
    
                this.drawGauge(
                    layout.icon > 0 ? x + Window_Base._iconWidth + 4 : x,
                    y + 4,
                    layout.icon > 0 ? width - Window_Base._iconWidth - 4 : width,
                    Math.abs(value) / parseFloat(range),
                    color1, color2);
            }    
        }
    };
}

/**
 * return Boolean
 */
KunAttributes.CheckSetupUI = () => { return KUN.hasOwnProperty('SetupUI') && KUN.SetupUI.hasOwnProperty('actorStatus') && KUN.SetupUI.actorStatus; }
/**
 * @param {String} message 
 */
KunAttributes.DebugLog = function (message) {
    if (KunAttributes.debug()) {
        if (typeof message === 'object') {
            console.log('[ KunAttributes ] - ' + message.constructor.name);
            console.log(message);
        }
        else {
            console.log('[KunAttributes]' + message);
        }
    }
};

KunAttributes.DisplayType = {
    'NONE': 'none',
    'COUNTER': 'counter',
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
 * @param {Boolean} reverse
 * @param {Number[]} actors
 * @returns 
 */
function KunAttribute(name, title, display, max, value, icon, color1, color2, reverse, actors) {

    this._name = name;
    this._title = title;
    this._display = display || KunAttributes.DisplayType.NONE;
    this._max = max || 100;
    this._value = value || 0;
    this._icon = icon || 0;
    this._color1 = color1 || 2;
    this._color2 = color2 || 5;
    this._reverse = typeof reverse === 'boolean' && reverse;
    this._actors = Array.isArray( actors ) ? actors.map( actor => parseInt( actor ) ) : [];
    this._events = [
        //add attribute events here
    ];

    return this;
}
/**
 * @returns String
 */
KunAttribute.prototype.name = function(){
    return this._name;
};
/**
 * @returns Boolean
 */
KunAttribute.prototype.reverse = function(){
    return this._reverse;
};
/**
 * @returns String
 */
KunAttribute.prototype.title = function(){

    return this._title;
};
/**
 * @returns String
 */
KunAttribute.prototype.display = function(){
    return this._display;
};
/**
 * @returns Number
 */
KunAttribute.prototype.value = function(){
    return this._value;
};
/**
 * @returns Number
 */
KunAttribute.prototype.max = function(){
    return this._max;
};
/**
 * @returns Number
 */
KunAttribute.prototype.icon = function(){
    return this._icon;
};
/**
 * @returns Number
 */
KunAttribute.prototype.color1 = function(){
    return this._color1;
};
/**
 * @returns Number
 */
KunAttribute.prototype.color2 = function(){
    return this._color2;
};
/**
 * @param {String} title 
 * @returns KunAttribute
 */
KunAttribute.prototype.setTitle = function( title ){
    if( typeof title === 'string' && title.length ){
        this._title = title;
    }
    return this;
};
/**
 * @param {Number} icon 
 * @returns KunAttribute
 */
KunAttribute.prototype.setIcon = function( icon ){
    if( typeof icon === 'number' && icon > 0 ){
        this._icon = icon;
    }
    return this;
};
/**
 * @param {Number} color1 
 * @param {Number} color2 
 * @returns KunAttribute
 */
KunAttribute.prototype.setColors = function( color1 , color2 ){
    if( typeof color1 === 'number' && color1 > 0 ){
        this._color1 = color1;
        if( typeof color2 === 'number' && color2 ){
            this._color2 = color2;
        }
    }
    return this;
};
/**
 * @param {Number} actor_id 
 * @returns Boolean
 */
KunAttribute.prototype.available = function (actor_id) {
    return actor_id === 0 || this._actors.length === 0 || this._actors.includes(actor_id);
};
/**
 * @param {Number} value
 * @returns Object
 */
KunAttribute.prototype.export = function ( value ) {
    var content = {
        'name': this.name(),
        'max': this.max(),
        'value': this.value(),
    };

    if( typeof value === 'number' ){
        content.title = this.title();
        content.icon = this.icon();
        content.color1 = this.color1();
        content.color2 = this.color2();
        this.events().filter( event => event.match( value ) ).forEach( function( event ){
            event.actions().forEach( function(action ){
                if( action.color1() ){
                    content.color1 = action.color1();
                }
                if( action.color2() ){
                    content.color2 = action.color2();
                }
                if( action.icon() ){
                    content.icon = action.icon();
                }
                if( action.title().length ){
                    content.title = action.title();
                }    
            });
        });
    }

    return content;
};
/**
 * @param {Number} max 
 * @returns KunAttribute
 */
KunAttribute.prototype.updateMax = function (max) {
    if (typeof max === 'number' && max > 0) {
        this._max = max;
        if (this._value > this._max) {
            this._value = this._max;
        }
    }
    return this;
};
/**
 * @param {KunAttributeEvent} event 
 * @returns KunAttribute
 */
KunAttribute.prototype.addEvent = function( event ){
    if( event instanceof KunAttributeEvent ){
        this._events.push( event );
    }
    return this;
};
/**
 * @returns KunAttributeEvent[]
 */
KunAttribute.prototype.events = function( ){
    return this._events;
};
/**
 * @param {Number} value 
 * @param {Number} actor_id
 */
KunAttribute.prototype.update = function( value , actor_id ){
    this.events().forEach( event => event.check(value,actor_id));
};
/**
 * @param {String} text 
 * @returns String
 */
KunAttribute.ParseName = (text) => typeof text === 'string' ? text.toLowerCase().replace(/[\s\_]/, '-') : text;
/** 
 * @returns KunAttribute
 */
KunAttribute.Invalid = function () {
    return new KunAttribute('__INVALID__');
};



/**
 * @param {Number} value 
 * @param {String} operation 
 */
function KunAttributeEvent(value, operation) {
    this._value = value || 0;
    this._operation = operation || KunAttributeEvent.Operations.Equal;
    this._actions = [];
    this._active = false;
}
/**
 * @returns String
 */
KunAttributeEvent.prototype.toString = function(){
    return `${this._operation}(${this._value})`;
};
/**
 * @param KunAttributeAction action
 * @returns KunAttributeEvent
 */
KunAttributeEvent.prototype.addAction = function( action ){
    if( action instanceof KunAttributeAction ){
        this._actions.push( action );
    }
    return this;
};
/**
 * @returns KunAttributeAction[]
 */
KunAttributeEvent.prototype.actions = function(){
    return this._actions;
};
/**
 * @returns Number
 */
KunAttributeEvent.prototype.value = function () {
    return this._value;
};
/**
 * @returns Boolean
 */
KunAttributeEvent.prototype.active = function () {
    return this._active;
};
/**
 * @returns KunAttributeEvent
 */
KunAttributeEvent.prototype.reset = function () {
    this._active = false;
    return this;
};
/**
 * @param {Number} value 
 * @returns Boolean
 */
KunAttributeEvent.prototype.match = function (value) {
    switch (this._operation) {
        case KunAttributeEvent.Operations.GreaterThan:
            return value > this.value();
        case KunAttributeEvent.Operations.GreaterEqual:
            return value >= this.value();
        case KunAttributeEvent.Operations.Equal:
            return value === this.value();
        case KunAttributeEvent.Operations.LessEqual:
            return value <= this.value();
        case KunAttributeEvent.Operations.LessThan:
            return value < this.value();
        default:
            return false;
    }
};
/**
 * @param {Number} value 
 * @param {Number} actor_id
 * @returns Boolean
 */
KunAttributeEvent.prototype.check = function (value , actor_id) {
    var before = this.active();
    this._active = this.match( value );
    if( this.active() && this.active() !== before ){
        this.run(actor_id);
    }
    return this.active();
};
/**
 * @returns KunAttributeEvent
 */
KunAttributeEvent.prototype.run = function( actor_id){
    this.actions().forEach( action => action.run( actor_id) );
    return this;
};
/**
 * 
 */
KunAttributeEvent.Operations = {
    'GreaterThan': 'greater',
    'GreaterEqual': 'greater-equal',
    'Equal': 'equal',
    'LessEqual': 'less-equal',
    'LessThan': 'less',
};

/**
 * @param {Number} addState 
 * @param {Number} remState 
 * @param {String} title
 * @param {Number} icon 
 * @param {Number} color1 
 * @param {Number} color2 
 * @param {String} message
 * @param {String} media
 */
function KunAttributeAction( addState , remState , title , icon , color1 , color2 , message , media ) {
    this._addState = Array.isArray(addState) ? addState.map( state => parseInt(state)) : [];
    this._remState = Array.isArray(remState) ? remState.map( state => parseInt(state)) : [];
    this._icon = typeof icon === 'number' && icon > 0 ? icon : 0;
    this._title = typeof title === 'string' && title.length > 0 ? title : '';
    this._color1 = typeof color1 === 'number' && color1 > 0 ? color1 : 0;
    this._color2 = typeof color2 === 'number' && color2 > 0 ? color2 : 0;
    this._message = message || '';
    this._media = media || '';
};
/**
 * @returns String
 */
KunAttributeAction.prototype.toString = function(){
    return this.title().length > 0 ? this.title() : 'Action';
};
/**
 * @returns string
 */
KunAttributeAction.prototype.media = function(){
    return this._media;
};
/**
 * @returns string
 */
KunAttributeAction.prototype.message = function(){
    return this._message;
};
/**
 * @returns KunAttributeAction
 */
KunAttributeAction.prototype.playMedia = function(){
    if( this.media().length ){
        var pitch = Math.floor(Math.random() * 10) + 95;
        AudioManager.playSe({ 'name': this.media(), 'pan': 0, 'pitch': pitch, 'volume': 80 });    
    }
    return this;
};
/**
 * @returns KunAttributeAction
 */
KunAttributeAction.prototype.showMessage = function(){
    if( this.message().length && typeof kun_notify === 'function' ){
        kun_notify( this.message( ) );
    }
    return this;
};
/**
 * @param {Number} actor_id 
 * @returns KunAttributeAction
 */
KunAttributeAction.prototype.run = function( actor_id ){
    return this.applyStates(actor_id).playMedia().showMessage();
};
/**
 * @returns KunAttributeAction
 */
KunAttributeAction.prototype.applyStates = function( actorId ){
    if( typeof actorId === 'number' && actorId > 0 ){
        this._addState.forEach( function( state ){
            $gameActors.actor(actorId).addState( state);
        });
        this._remState.forEach( function( state ){
            $gameActors.actor(actorId).removeState( state );
        });
    }
    return this;
};
/**
 * @returns String
 */
KunAttributeAction.prototype.title = function(){
    return this._title;
};
/**
 * @returns KunAttributeAction
 */
KunAttributeAction.prototype.icon = function(){
    return this._icon;
}
/**
 * @returns KunAttributeAction
 */
KunAttributeAction.prototype.color1 = function(){
    return this._color1;
}
/**
 * @returns KunAttributeAction
 */
KunAttributeAction.prototype.color2 = function(){
    return this._color2;
}


/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Number} maximum 
 * @returns 
 */
function kun_attribute_maximum(actor_id, attribute, maximum) {
    return actor_id > 0 ? $gameActors.actor(actor_id).setAttribute(attribute, maximum, true) : 0;
};
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Number} value 
 * @returns Number
 */
function kun_attribute_sub(actor_id, attribute, value) {
    return kun_attribute_add(actor_id, attribute, -value, false);
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Number} value 
 * @returns Number
 */
function kun_attribute_add(actor_id, attribute, value) {
    if (actor_id) {
        var actor = $gameActors.actor(actor_id);
        if (actor !== null) {
            return $gameActors.actor(actor_id).updateAttribute(attribute, value);
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
function kun_attribute_set(actor_id, attribute, value) {
    return actor_id > 0 ? $gameActors.actor(actor_id).setAttribute(attribute, value) : 0;
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Boolean} fullReset
 * @returns 
 */
function kun_attribute_reset(actor_id, attribute, fullReset) {
    return actor_id > 0 ? $gameActors.actor(actor_id).resetAttribute(attribute, fullReset) : 0;
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @returns 
 */
function kun_attribute(actor_id, attribute) {
    return actor_id > 0 ? $gameActors.actor(actor_id).getAttribute(attribute) : 0;
}


(function () {

    KunAttributes.Initialize();


    //console.log( KunAttributes.attributes(true).map( att => att.export()) );

    KunAttributes_SetupActorAttributes();
    KunAttributes_SetupWindows();
    KunAttributes_SetupCommands();
})();




