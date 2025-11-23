//=============================================================================
// KunTraits.js
//=============================================================================
/*:
 * @plugindesc Kun Traits and Special Attributes
 * @filename KunTraits.js
 * @author Kun
 * @version 2.19
 * 
 * @help
 * 
 * COMMANDS
 * 
 *      KunTraits reset [actor_id] [attribute_name]
 *          Resets acgor's gauge to the original value
 * 
 *      KunTraits set [actor_id] [attribute_name] [amount] [import]
 *          Sets actor's gauge_name the provided amount. Use import to use a gameVariable value
 * 
 *      KunTraits add [actor_id] [attribute_name] [amount] [import]
 *          Adds actor's gauge_name the provided amount. Use import to use a gameVariable value
 * 
 *      KunTraits sub [actor_id] [attribute_name] [amount] [import]
 *          Substract actor's gauge_name the provided amount. Use import to use a gameVariable value
 * 
 *      KunTraits transfer [actor_id1] [actor_id2] [attribute_name] [amount] [import]
 *          Transfers attribute_name's amount points from actor1 to actor2
 *          Use import to import amount points from a game Variable
 * 
 *      KunTraits bind [actor_id] [attribute_name] [valueVar] [rangeVar] [import]
 *          Bind an attribute value and range to game variables to export immediate updates
 *      
 *      KunTraits unbind [actor_id] [attribute_name] [import]
 *          Clear all bindings to an attribute
 * 
 *      KunTraits maximum [actor_id] [attribute_name] [maximum] [import]
 *          Sets the maximum range of the selected attribute and updates the current value if required to fit the new range.
 * 
 *      KunTraits progress [actor_id] [attribute_name] [exportVar]
 *          Exports the selected attribute's percentage value into a Game Variable [exportVar]
 * 
 *      KunTraits rules [actor_id] [attribute_name] [import]
 *          Runs the rules of this actor's attribute current value
 * 
 *      KunTraits export [actor_id] [attribute_name] [value_var] [maximum_var] [import]
 *          Export actor_id attribute current value into value_var
 *          Export actor_id max attribute value using maximum_var
 *          Import actor_id from a game variable
 * 
 *      KunTraits migrate [old_trait] [new_trait]
 *          
 *      KunTraits setup [all|actor_id]
 *      KunTraits check [all|actor_id]
 *          Prepare all actor gauges. Required even if they have no special trait
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
 * @param value
 * @text Default Value
 * @type number
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
 * @text Rules
 * @desc Define a list of rules to perform special actions when an actor meets a condition
 * @default []
 * 
 */
/*~struct~Event:
 * @param value
 * @type number
 * @text Value
 * @desc check the target value for this condition
 * @min -100
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
 * @default 0
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

function KunTraits() {
    throw `${this.constructor.name} is a Static Class`;
};
/**
 * 
 * @returns {KunTraits}
 */
KunTraits.Initialize = function () {

    var _parameters = KunTraits.PluginData();

    this._debug = _parameters.debug;

    this._traits = {
        //list attribute definition here
    };

    return this.Import(Array.isArray(_parameters.attributes) ? _parameters.attributes : []);
}
/**
 * @returns Object
 */
KunTraits.PluginData = function () {
    function _parsePluginData(key, value) {
        if (typeof value === 'string' && value.length) {
            try {
                if (/^\{.*\}$|^\[.*\]$/.test(value)) {
                    return JSON.parse(value, _parsePluginData);
                }
            } catch (e) {
                // If parsing fails or it's not an object/array, return the original value
            }
            if (value === 'true' || value === 'false') {
                return value === 'true';
            }
            if (!isNaN(value)) {
                return parseInt(value);
            }
        }
        else if (typeof value === 'object' && !Array.isArray(value)) {
            var _output = {};
            Object.keys(value).forEach(function (key) {
                _output[key] = _parsePluginData(key, value[key]);
            });
            return _output;
        }
        return value;
    };

    return _parsePluginData('KunTraits', PluginManager.parameters('KunTraits'));
};

/**
 * @returns {Boolean}
 */
KunTraits.debug = function () {
    return this._debug;
}

/**
 * @returns {KunTrait[]}
 */
KunTraits.traits = function () {
    return Object.values(this._traits) || [];
    //return list && Object.values(this._traits) || this._traits;
};
/**
 * @param {String} attribute 
 * @returns {Boolean}
 */
KunTraits.has = function (attribute = '') {
    return attribute && this.traits().filter(trait => trait.name() === attribute).length > 0 || false;
    //return typeof attribute === 'string' && attribute.length > 0 && this.traits().hasOwnProperty(attribute);
};
/**
 * @param {KunTrait} trait
 * @returns {KunTraits}
 */
KunTraits.add = function (trait) {

    if (trait instanceof KunTrait && !this.has(trait.name())) {
        this._traits[trait.name()] = trait;
    }

    return this;
};
/**
 * List all attributes by actor
 * @param {Number} actor_id 
 * @param {Boolean} showAll 
 * @returns {KunTrait[]}
 */
KunTraits.actorTraits = function (actor_id, showAll) {
    showAll = typeof showAll === 'boolean' && showAll;
    return this.traits().filter(item => item.has(actor_id) && (showAll || item.display() !== KunTraits.DisplayType.NONE));
};
/**
 * @param {String} trait 
 * @returns KunTrait
 */
KunTraits.trait = function (trait) {
    return this.has(trait) ? this._traits[trait] : null;
};
/**
 * @param {Object} data 
 * @returns {KunAttribute}
 */
KunTraits.loadAttribute = function (data) {
    if (data instanceof Object && data._name && this.has(data._name)) {
        const trait = this.trait(data._name);
        if (trait) {
            const att = trait.createAttribute().override(
                data._name || '',
                data._value || 0,
                data._range || 0,
            );
            this.DebugLog(att);
            return att;
        }
    }
};
/**
 * @param {Number} actor_id 
 * @returns {Object}
 */
KunTraits.createAttributes = function (actor_id) {
    var attributes = {};
    this.actorTraits(actor_id, true).map(trait => trait.createAttribute()).forEach(function (attribute) {
        attributes[attribute.name()] = attribute;
    });
    return attributes;
};
/**
 * 
 */
KunTraits.prepareActorAttributes = function () {
    const attributes = [];
    if ($dataActors !== null) {
        $dataActors.forEach(actor => {
            attributes.push(this.createAttributes(actor !== null ? actor.id : 0));
        });
    }
    return attributes;
};
/**
 * 
 * @param {Number} actor_id 
 * @param {String} oldAtt 
 * @param {String} newAtt 
 * @returns 
 */
KunTraits.importAmirian = function (actor_id, oldAtt, newAtt) {
    var actor = $gameActors.actor(actor_id);
    if (actor.hasOwnProperty(oldAtt) && actor._traits.hasOwnProperty(newAtt)) {
        actor._traits[newAtt].value = actor[oldAtt];
        actor._traits[newAtt].max = 100;
        return true;
    }
    return false;
};
/**
 * 
 * @param {Object} input 
 * @returns {KunTraits}
 */
KunTraits.Import = function (input) {
    input.forEach(function (att) {
        if (att !== null) {
            //console.log( trait );
            var trait = new KunTrait(
                att.name, att.title,
                att.display, att.maximum, att.value,
                att.icon, att.color1, att.color2,
                att.reverse, att.actors);
            if (Array.isArray(att.events)) {
                att.events.forEach(function (e) {
                    var rule = new KunTraitRule(
                        e.value, e.operation,
                        e.title || '',
                        e.icon,
                        e.colors.length > 0 ? e.colors[0] : -1,
                        e.colors.length > 1 ? e.colors[1] : -1,
                        e.media, e.message);
                    trait.addRule(rule.addStates(e.addState).dropStates(e.remState));
                });
            }
            KunTraits.add(trait);
        }
    });
    this.DebugLog(input.length > 0 ? `${input.length} traits imported` : 'No traits imported');

    return this;
};
/**
 * @param {String} message 
 */
KunTraits.DebugLog = function (message) {
    if (KunTraits.debug()) {
        console.log('[ KunTraits ] ', message);
    }
};

KunTraits.DisplayType = {
    'NONE': 'none',
    'COUNTER': 'counter',
    'GAUGE': 'gauge',
    'FULL': 'full'
};


/**
 * Each actor id handles a lis of attributes
 * [[KunAttribute,KunAttribute,KunAttribute,...],...]
 * @type {Object[]}
 */
var $actorTraits = [];

/**
 * DataManager to handle actor's attributes
 */
function KunTraits_SetupDataManager() {
    //CREATE NEW
    const _KunTraits_DataManager_Create = DataManager.createGameObjects;
    DataManager.createGameObjects = function () {
        _KunTraits_DataManager_Create.call(this);

        if ($dataActors && $dataActors.length && $actorTraits.length === 0) {
            //preload when ready
            $actorTraits = KunTraits.prepareActorAttributes();
        }
    };
    const _KunTraits_DataManager_Save = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function () {
        const contents = _KunTraits_DataManager_Save.call(this);
        contents.actorTraits = $actorTraits;
        return contents;
    };
    //LOAD
    const _KunTraits_DataManager_Load = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function (contents) {
        //import all save data blocks
        _KunTraits_DataManager_Load.call(this, contents);

        //actor attribute data are saved as object and must be extracted and parsed into KunAttributes again        
        const traits = Array.isArray(contents.actorTraits) ? contents.actorTraits.map( attributes => {
            //loop through actors
            Object.keys(attributes).forEach( trait => {
                attributes[trait] = KunTraits.loadAttribute(attributes[trait]);
            });
            return attributes;
        }) : [];
        //assign to game Manager
        $actorTraits = traits.length ? traits : KunTraits.prepareActorAttributes();
    };
}

/**
 * Game_Actors hacks and shortcuts
 */
function KunTraits_Setup_GameActors() {
    /**
     * @returns {Game_Actor[]}
     */
    Game_Actors.prototype.list = function () {
        return this._data.filter(actor => actor !== null);
    };
    /**
     * @param {Number} actor_id 
     * @returns {Boolean}
     */
    Game_Actors.prototype.has = function (actor_id) {
        return actor_id > 0 && actor_id < this._data.length;
    };
}
/**
 * New Version
 */
function KunTraits_SetupActorAttributes() {
    /**
     * @param {String} name
     * @returns {Boolean}
     */
    Game_Actor.prototype.hasAttributes = function (name = '') {
        return name.length ? this.attribute(name) !== null : this.attributes().length > 0;
        //return name.length ? this.attributes().filter(att => att.name() === name).length > 0 : this.attributes().length > 0;
        //return $actorTraits.length > this.actorId() && (name.length === 0 || $actorTraits[this.actorId()].hasOwnProperty(name));
    };
    /**
     * @param {String} name 
     * @returns {KunAttribute}
     */
    Game_Actor.prototype.attribute = function (name) {
        return $actorTraits[this.actorId()] && $actorTraits[this.actorId()][name] || null;
        //return this.hasAttributes(name) ? $actorTraits[this.actorId()][name] : null;
    };
    /**
     * @returns {KunAttribute[]}
     */
    Game_Actor.prototype.attributes = function () {
        return $actorTraits[this.actorId()] && Object.values($actorTraits[this.actorId()]) || [];
        //return this.hasAttributes() ? Object.values($actorTraits[this.actorId()]) : [];
    };
}
/**
 * 
 */
function KunTraits_SetupCommands() {
    //override vanilla interpreter.
    var _KunSpecialAtts_GameInterPreter_Command = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunSpecialAtts_GameInterPreter_Command.call(this, command, args);
        if (command === 'KunTraits') {
            //capture special flags here
            const importVar = args.filter(tag => tag === 'import').length;
            const skipRules = args.includes('skiprules');

            //override with plugin command manager
            switch (args[0]) {
                case 'transfer':
                    if (args.length > 4) {
                        var amount = parseInt(args[4]);
                        if (importVar) {
                            amount = $gameVariables.value(amount);
                        }
                        var actor_id1 = parseInt(args[1]);
                        var actor_id2 = parseInt(args[2]);
                        kun_trait_transfer(actor_id1, actor_id2, args[3], amount);
                    }
                    break;
                case 'rules':
                    if (args.length > 2) {
                        var actor_id = importVar ? $gameVariables.value(parseInt(args[1])) : parseInt(args[1]);
                        kun_trait_apply_rules(actor_id, args[2]);
                    }
                    break;
                case 'reset':
                    if (args.length > 2) {
                        var actor_id = importVar ? $gameVariables.value(parseInt(args[1])) : parseInt(args[1]);
                        kun_trait_reset(actor_id, args[2], !skipRules);
                    }
                    break;
                case 'bind':
                    if (args.length > 4) {
                        //import actor from game variable?
                        var actor_id = importVar ? $gameVariables.value(parseInt(args[1])) : parseInt(args[1]);
                        if (actor_id > 0) {
                            if (kun_trait_bind(actor_id, args[2], parseInt(args[3]), parseInt(args[4]))) {
                                KunTraits.DebugLog(`Binding Actor ID ${actor_id} ${args[2]} to variables`);
                            }
                        }
                    }
                    break;
                case 'unbind':
                    if (args.length > 2) {
                        //import actor from game variable?
                        var actor_id = importVar ? $gameVariables.value(parseInt(args[1])) : parseInt(args[1]);
                        if (actor_id > 0) {
                            kun_trait_unbind(actor_id, args[2]);
                        }
                    }
                    break;
                case 'maximum':
                    if (args.length > 2) {
                        kun_trait_range(
                            importVar > 1 ? $gameVariables.value(parseInt(args[1])) : parseInt(args[1]),
                            args[2],
                            importVar ? $gameVariables.value(parseInt(args[3])) : parseInt(args[3]));
                    }
                    break;
                case 'set':
                    if (args.length > 3) {
                        kun_trait_set(
                            importVar > 1 ? $gameVariables.value(parseInt(args[1])) : parseInt(args[1]),
                            args[2],
                            importVar ? $gameVariables.value(parseInt(args[3])) : parseInt(args[3]),
                            !skipRules);
                    }
                    break;
                case 'push':
                case 'add':
                    if (args.length > 3) {
                        var actor_id = importVar > 1 ? $gameVariables.value(parseInt(args[1])) : parseInt(args[1]);
                        var values = args[3].split(':').map(v => parseInt(v));
                        var amount = importVar ? $gameVariables.value(values[0]) : values[0];
                        var update = values.length > 1 && amount > values[1] ? values[1] : amount;
                        kun_trait_add(actor_id, args[2], update, !skipRules);
                        if (importVar) {
                            $gameVariables.setValue(values[0], amount > update ? amount - update : 0);
                        }
                    }
                    break;
                case 'drop':
                case 'sub':
                    if (args.length > 3) {
                        var actor_id = importVar > 1 ? $gameVariables.value(parseInt(args[1])) : parseInt(args[1]);
                        var values = args[3].split(':').map(v => parseInt(v));
                        var amount = importVar ? $gameVariables.value(values[0]) : values[0];
                        var update = values.length > 1 && amount > values[1] ? values[1] : amount;
                        var current = kun_trait_get(actor_id, args[2]);
                        kun_trait_sub(actor_id, args[2], current > update ? update : 0, !skipRules);
                        if (importVar) {
                            $gameVariables.setValue(values[0], update && current > update ? amount - update : 0);
                        }
                    }
                    break;
                case 'fill':
                    if (args.length > 3) {
                        var actor_id = importVar ? $gameVariables.value(parseInt(args[1])) : parseInt(args[1]);
                        var values = args[3].split(':').map(v => parseInt(v));
                        var attVar = values.shift();
                        var amount = values.length ? values[Math.floor(Math.random() * values.length)] : 0;
                        if( amount ){
                            //import current value from variable to transfer amounts
                            var current = $gameVariables.value(attVar);
                            //if amount is larger than current, keep current instead
                            if( current < amount ){
                                amount = current;
                            }
                            //add amount, args[2] is trait name
                            kun_trait_add(actor_id, args[2], amount, !skipRules);
                            //drop from attribute value var
                            $gameVariables.setValue(attVar, current - amount );
                        }
                    }
                    break;
                case 'drain':
                    if (args.length > 3) {
                        var actor_id = importVar ? $gameVariables.value(parseInt(args[1])) : parseInt(args[1]);
                        var values = args[3].split(':').map(v => parseInt(v));
                        var attVar = values.shift();
                        var amount = values.length ? values[Math.floor(Math.random() * values.length)] : 0;
                        if( amount ){
                            //import current value from variable to transfer amounts
                            var current = $gameVariables.value(attVar);
                            //if amount is larger than current, keep current instead
                            if( current < amount ){
                                amount = current;
                            }
                            //add amount, args[2] is trait name
                            kun_trait_sub(actor_id, args[2], amount, !skipRules);
                            //drop from attribute value var
                            $gameVariables.setValue(attVar, current - amount );
                        }
                    }
                    break;
                case 'progress':
                    if (args.length > 3) {
                        var actor = $gameActors.actor(parseInt(args[1]));
                        var progressVar = parseInt(args[3]);
                        if (actor && actor.hasAttributes(args[2]) && progressVar) {
                            $gameVariables.setValue(progressVar, Math.floor(actor.attribute(args[2]).value(true) * 100));
                        }
                    }
                    break;
                case 'export':
                    if (args.length > 3) {
                        var actor = $gameActors.actor(importVar ? $gameVariables.value(parseInt(args[1])) : parseInt(args[1]));
                        var valueVar = parseInt(args[3]);
                        if (actor && actor.hasAttributes(args[2]) && valueVar) {
                            $gameVariables.setValue(valueVar, actor.attribute(args[2]).value());
                            var maxVar = args.length > 4 ? parseInt(args[4]) : 0;
                            if (maxVar > 0) {
                                $gameVariables.setValue(maxVar, actor.attribute(args[2]).range());
                            }
                        }
                    }
                    break;
                case 'migrate':
                    //obsolete
                    break;
                case 'upgrade':
                    //migrate all traits into $actorTraits                    
                    kun_trait_migrate2(args.includes('remove'));
                    break;
                case 'upgrade3':
                    //migrate all traits into $actorTraits                    
                    kun_trait_migrate3();
                    break;

            }
        }
    };
}
/**
 * 
 */
function KunTraits_SetupWindows() {
    /**
     * @returns {Game_Actor}
     */
    Window_Status.prototype.actor = function () {
        return this._actor;
    };
    Window_Status.prototype.drawBlock3 = function (y) {
        this.drawParameters(0, y);
        this.drawEquipments(240, y);
        this.drawKunTraits(456, this.lineHeight() * 7);
    };
    /**
     * Render Kun Attributes
     * @param {Number} x 
     * @param {Number} y 
     */
    Window_Status.prototype.drawKunTraits = function (x, y) {
        const attributes = this.actor() ? this.actor().attributes() : [];
        if (attributes.length) {
            var lineHeight = this.lineHeight();
            //renedr gauges here.
            const split = attributes.length > 6; //define split display in 2 columns, or fullwidth
            for (var i = 0; i < attributes.length; i++) {
                this.drawKunTrait(
                    split && i % 2 > 0 ? x + 140 : x,
                    y + lineHeight * (split ? Math.floor(i / 2) : i),
                    attributes[i], !split);
            }
        }
    };
    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {KunAttribute} attribute 
     * @param {Boolean} fullWidth
     * @returns 
     */
    Window_Status.prototype.drawKunTrait = function (x, y, attribute, fullWidth) {

        fullWidth = typeof fullWidth === 'boolean' && fullWidth;

        if (attribute instanceof KunAttribute && attribute.visible()) {
            var width = fullWidth ? 270 : 135;

            var icon = attribute.icon();
            if (icon > 0) {
                this.drawIcon(icon, x, y + 10);
            }
            this.changeTextColor(this.systemColor());

            this.drawText(attribute.title(), icon > 0 ? x + Window_Base._iconWidth + 4 : x, y, 270);
            this.resetTextColor();

            if (attribute.showValue()) {
                this.drawText(Math.abs(attribute.value()), x, y, 270, 'right');
            }

            if (attribute.showGauge()) {
                var progress = attribute.value(true);
                var colors = attribute.color();
                var color1 = this.textColor(colors[0]); //get attribute color1
                var color2 = this.textColor(colors[1]); //get attribute color2
                //var progress = range > 0 ? Math.abs(value) / parseFloat(range) : 0;
                //console.log(color1,color2,progress,value,range);
                this.drawGauge(
                    icon > 0 ? x + Window_Base._iconWidth + 4 : x,
                    y + 4,
                    icon > 0 ? width - Window_Base._iconWidth - 4 : width,
                    progress,
                    color1, color2);
            }
        }
    };
    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {String|KunTrait} attribute 
     * @param {Boolean} fullWidth
     * @returns 
     */
    Window_Status.prototype.drawKunTrait_OLD = function (x, y, attribute, fullWidth) {

        fullWidth = typeof fullWidth === 'boolean' && fullWidth;

        if (attribute instanceof KunTrait && attribute.display() !== KunTraits.DisplayType.NONE) {
            var display = attribute.display();
            var width = fullWidth ? 270 : 135;
            var showValue = display === KunTraits.DisplayType.COUNTER || display === KunTraits.DisplayType.FULL;
            var showGauge = display === KunTraits.DisplayType.GAUGE || display === KunTraits.DisplayType.FULL;
            //var icon = attribute.icon();
            //var title = attribute.title();
            var value = attribute.value();
            var range = attribute.range();
            var layout = attribute.export(value);
            //console.log( layout );

            if (layout.icon > 0) {
                this.drawIcon(layout.icon, x, y + 10);
            }
            this.changeTextColor(this.systemColor());
            this.drawText(layout.title, layout.icon > 0 ? x + Window_Base._iconWidth + 4 : x, y, 270);
            this.resetTextColor();
            if (showValue) {
                this.drawText(value, x, y, 270, 'right');
            }
            if (showGauge) {
                var color1 = this.textColor(layout.color1); //get attribute color1
                var color2 = this.textColor(layout.color2); //get attribute color2
                var progress = range > 0 ? Math.abs(value) / parseFloat(range) : 0;
                //console.log(color1,color2,progress,value,range);
                this.drawGauge(
                    layout.icon > 0 ? x + Window_Base._iconWidth + 4 : x,
                    y + 4,
                    layout.icon > 0 ? width - Window_Base._iconWidth - 4 : width,
                    progress,
                    color1, color2);
            }
        }
    };
}

/**
 * 
 */
class KunTrait {
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
    constructor(name, title, display, max, value, icon, color1, color2, reverse, actors) {

        this._name = name;
        this._title = title;
        this._display = display || KunTraits.DisplayType.NONE;
        this._max = max || 100;
        this._value = value || 0;
        this._icon = icon || 0;
        this._color1 = color1 || 2;
        this._color2 = color2 || 5;
        this._reverse = typeof reverse === 'boolean' && reverse;
        this._rules = [
            //add attribute events here
        ];
        this._actors = Array.isArray(actors) ? actors.map(function (actor) {
            return { 'actor_id': parseInt(actor), 'valueVar': 0, 'maxVar': 0 };
        }) : [];

        return this;
    }
    /**
     * 
     * @param {Number} actor_id 
     * @returns KunTrait
     */
    addActor(actor_id) {
        this._actors.push({
            'actor_id': actor_id,
            'valueVar': 0,
            'maxVar': 0,
        });
        return this;
    };
    /**
     * @returns {Number}[]
     */
    actors() {
        return this._actors.map(actor => actor.actor_id);
    };
    /**
     * @returns {String}
     */
    name() {
        return this._name;
    };
    /**
     * @returns {Boolean}
     */
    reverse() {
        return this._reverse;
    };
    /**
     * @returns {String}
     */
    title() {

        return this._title;
    };
    /**
     * @returns {String}
     */
    display() {
        return this._display;
    };
    /**
     * @returns {Number}
     */
    value() {
        return this._value;
    };
    /**
     * @returns {Number}
     */
    max() {
        return this._max;
    };
    /**
     * @returns {Number}
     */
    icon() {
        return this._icon;
    };
    /**
     * @returns {Number}
     */
    color1() {
        return this._color1;
    };
    /**
     * @returns {Number}
     */
    color2() {
        return this._color2;
    };
    /**
     * @param {Number} actor_id 
     * @returns {Boolean}
     */
    has(actor_id) {
        return this.actors().length === 0 || (actor_id > 0 && this.actors().includes(actor_id));
    };
    /**
     * @returns KunAttribute
     */
    createAttribute() {
        return new KunAttribute(this);
    };
    /**
     * @param {KunTraitRule} event 
     * @returns KunTrait
     */
    addRule(event) {
        if (event instanceof KunTraitRule) {
            this._rules.push(event);
        }
        return this;
    };
    /**
     * @returns {KunTraitRule}[]
     */
    rules() {
        return this._rules;
    };
    /**
     * @param {String} text 
     * @returns {String}
     */
    static ParseName(text) { return text.toLowerCase().replace(/[\s\_]/, '-') };
    /** 
     * @returns KunTrait
     */
    static Invalid() {
        return new KunTrait('__INVALID__');
    };
};

/**
 * 
 */
class KunAttribute {
    /**
     * @param {KunTrait} trait 
     */
    constructor(trait) {
        if (trait instanceof KunTrait) {
            this._name = trait.name();
            this._value = trait.value();
            this._range = trait.max();

            this.unbind();
        }
    };
    /**
     * @param {KunAttribute} attribute 
     * @returns {KunAttribute}
     */
    copy(attribute) {
        if (attribute instanceof KunAttribute) {
            this._name = attribute.name();
            this._value = attribute.value();
            this._range = attribute.range();
        }
        return this;
    };
    /**
     * 
     * @param {String} name 
     * @param {Number} value 
     * @param {Number} range 
     * @returns {KunAttribute}
     */
    override(name = '', value = 0 , range = 0){
        if( name ){
            this._name = name;
        }
        if( value ){
            this._value = value;
        }
        if( range ){
            this._range = range;
        }
        return this;
    }
    /**
     * @returns {KunTrait}
     */
    template() {
        return KunTraits.trait(this.name());
    };
    /**
     * @returns {String}
     */
    name() {
        return this._name;
    };
    /**
     * @param {Boolean} getDefault
     * @returns {Number}
     */
    range(getDefault = false) {
        return getDefault ? this.template().max() : this._range;
    };
    /**
     * @returns {Number}
     */
    min() {
        return this.template().reverse() ? -this._range : 0;
    };
    /**
     * @param {Boolean} progress
     * @returns {Number}
     */
    value(progress = false) {
        return progress && this.range() > 0 ? Math.abs(this.value()) / this.range() : this._value;
    };
    /**
     * @param {Number} value 
     * @returns {Number}
     */
    clamp(value) {
        return Math.max(Math.min(value, this.range()), this.min())
    };
    /**
     * @param {Number} maximum Zero for default
     * @returns {Number}
     */
    setRange(maximum = 0) {
        this._range = maximum > 0 ? maximum : this.range(true);
        this.set(this.value()); //refresh the current value if range has been reduced then fire all bound events
        return this.range();
    };
    /**
     * @param {Number} value 
     * @returns {Number}
     */
    set(value = 0) {
        value = this.clamp(value);
        if (this._value !== value) {
            this._value = value;
            this.update();
        }
        return this.value();
    };
    /**
     * @param {Number} actor_id
     * @returns {KunAttribute}
     */
    applyRules(actor_id) {
        const rules = this.rules(true);
        if (rules.length) {
            rules[rules.length - 1].run(actor_id);
        }
        return this;
    };
    /**
     * @returns {KunAttribute}
     */
    unbind() {
        this._binding = [];
        return this;
    };
    /**
     * 
     * @param {Number} value 
     * @param {Number} range 
     * @returns {KunAttribute}
     */
    bind(value = 0, range = 0) {
        this.unbind();
        if (value) {
            this._binding.push(value);
            if (range) {
                this._binding.push(range);
            }
            return this.update(true);
        }
        return this;
    };
    /**
     * @param {Boolean} fullExport
     * @returns {KunAttribute}
     */
    update(fullExport = false) {
        return this.export(this.valueVar(), fullExport ? this.rangeVar() : 0);
    };
    /**
     * @returns {Number}
     */
    valueVar() {
        return this._binding.length > 0 && this._binding[0] > 0 ? this._binding[0] : 0;
    };
    /**
     * @returns {Number}
     */
    rangeVar() {
        return this._binding.length > 1 && this._binding[1] > 0 ? this._binding[1] : 0;
    };
    /**
     * @param {Number} valueVar
     * @param {Number} rangeVar
     * @returns KunAttribute
     */
    export(valueVar = 0, rangeVar = 0) {
        if (valueVar) {
            $gameVariables.setValue(valueVar, this.value());
            if (rangeVar) {
                $gameVariables.setValue(rangeVar, this.range());
            }
        }
        return this;
    };
    /**
     * @returns {Boolean}
     */
    showValue() {
        return this.template().display() === KunTraits.DisplayType.COUNTER || this.template().display() === KunTraits.DisplayType.FULL;
    };
    /**
     * @returns {Boolean}
     */
    showGauge() {
        return this.template().display() === KunTraits.DisplayType.GAUGE || this.template().display() === KunTraits.DisplayType.FULL;
    };
    /**
     * @returns {Boolean}
     */
    visible() {
        return this.template().display() !== KunTraits.DisplayType.NONE;
    };
    /**
     * @returns {Number}
     */
    icon() {
        var rule = this.matchRule();
        return rule && rule.icon() || this.template().icon();
    };
    /**
     * @returns {String}
     */
    title() {
        var rule = this.matchRule();
        return rule && rule.title() || this.template().title();
    };
    /**
     * @returns {Number[]}
     */
    color() {
        var rule = this.matchRule();
        return [
            rule && rule.color1() >= 0 ? rule.color1() : this.template().color1(),
            rule && rule.color2() >= 0 ? rule.color2() : this.template().color2()
        ];
    };
    /**
     * @returns {KunTraitRule}
     */
    matchRule() {
        var rules = this.rules(true);
        return rules.length ? rules[rules.length - 1] : null;
    };
    /**
     * @param {Boolean} matching 
     * @returns {KunTraitRule[]}
     */
    rules(matching = false) {
        return matching ? this.template().rules().filter(rule => rule.match(this.value())) : this.template().rules();
    };
};


class KunTraitRule {
    /**
     * @param {Number} value 
     * @param {String} operation 
     * @param {String} newTitle
     * @param {Number} icon
     * @param {Number} color1
     * @param {Number} color2
     * @param {String} media
     * @param {String} message
     */
    constructor(value = 0, operation = '', newTitle = '', icon = 0, color1 = 0, color2 = 0, media = '', message = '') {
        this._value = value || 0;
        this._operation = operation || KunTraitRule.Operations.Equal;

        this._action = null;

        this._icon = icon || 0;
        this._title = newTitle || '';
        this._color1 = color1 >= 0 ? color1 : -1;
        this._color2 = color2 >= 0 ? color2 : -1;
        this._message = message || '';
        this._media = media || '';

        this._addStates = []; //Array.isArray(addState) ? addState.map( state => parseInt(state)) : [];
        this._remStates = []; //Array.isArray(remState) ? remState.map( state => parseInt(state)) : [];
    }
    /**
     * @param {Number[]} states 
     * @return {KunTraitRule}
     */
    addStates(states) {
        this._addStates = Array.isArray(states) ? states.map(state => parseInt(state)) : [];
        return this;
    };
    /**
     * @param {Number[]} states 
     * @return {KunTraitRule}
     */
    dropStates(states) {
        this._remStates = Array.isArray(states) ? states.map(state => parseInt(state)) : [];
        return this;
    };
    /**
     * @returns {String}
     */
    toString() {
        return `${this._operation}(${this._value})`;
    };
    /**
     * @returns {Number}
     */
    value() {
        return this._value;
    };
    /**
     * @param {Number} value 
     * @returns {Boolean}
     */
    match(value) {
        switch (this._operation) {
            case KunTraitRule.Operations.GreaterThan:
                return value > this.value();
            case KunTraitRule.Operations.GreaterEqual:
                return value >= this.value();
            case KunTraitRule.Operations.Equal:
                return value === this.value();
            case KunTraitRule.Operations.LessEqual:
                return value <= this.value();
            case KunTraitRule.Operations.LessThan:
                return value < this.value();
            default:
                return false;
        }
    };
    /**
     * @param {Number} actor_id 
     * @returns {KunTraitRule}
     */
    run(actor_id) {
        return this.applyStates(actor_id).showMessage(actor_id).playMedia();
    };
    /**
     * @returns {String}
     */
    media() {
        return this._media;
    };
    /**
     * @returns {String}
     */
    message() {
        return this._message;
    };
    /**
     * @returns {KunTraitRule}
     */
    playMedia() {
        if (this.media().length) {
            var pitch = Math.floor(Math.random() * 10) + 95;
            AudioManager.playSe({ 'name': this.media(), 'pan': 0, 'pitch': pitch, 'volume': 80 });
        }
        return this;
    };
    /**
     * @param {Number} actor_id
     * @returns {KunTraitRule}
     */
    showMessage(actor_id) {
        if (this.message().length && typeof kun_notify === 'function') {
            kun_notify(typeof actor_id === 'number' && actor_id > 0 ? `\\N[${actor_id}] ` + this.message() : this.message());
        }
        return this;
    };
    /**
     * @returns {KunTraitRule}
     */
    applyStates(actorId) {
        if (typeof actorId === 'number' && actorId > 0) {
            this._addStates.forEach(function (state) {
                $gameActors.actor(actorId).addState(state);
            });
            this._remStates.forEach(function (state) {
                $gameActors.actor(actorId).removeState(state);
            });
        }
        return this;
    };
    /**
     * @returns {String}
     */
    title() {
        return this._title;
    };
    /**
     * @returns {Number}
     */
    icon() {
        return this._icon;
    }
    /**
     * @returns {Number}
     */
    color1() {
        return this._color1;
    }
    /**
     * @returns {Number}
     */
    color2() {
        return this._color2;
    }
};
/**
 * @type {KunTraitRule.Operations | String}
 */
KunTraitRule.Operations = {
    GreaterThan: 'greater',
    GreaterEqual: 'greater-equal',
    Equal: 'equal',
    LessEqual: 'less-equal',
    LessThan: 'less',
};


/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Number} valueVar 
 * @param {Number} rangeVar 
 * @returns {Boolean}
 */
function kun_trait_bind(actor_id, attribute, valueVar, rangeVar = 0) {
    const actor = $gameActors.actor(actor_id);
    if (actor && actor.hasAttributes(attribute)) {
        actor.attribute(attribute).bind(valueVar, rangeVar);
        return true;
    }
    return false
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @returns {Boolean}
 */
function kun_trait_unbind(actor_id, attribute) {
    const actor = $gameActors.actor(actor_id);
    if (actor && actor.hasAttributes(attribute)) {
        actor.attribute(attribute).unbind(attribute);
        return true;
    }
    return false;
}

/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 */
function kun_trait_apply_rules(actor_id, attribute) {
    const actor = $gameActors.actor(actor_id);
    if (actor && actor.hasAttributes(attribute)) {
        actor.attribute(attribute).applyRules(actor_id);
    }
};
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Number} maximum 
 * @returns {Number}
 */
function kun_trait_range(actor_id, attribute, maximum = 0) {
    const actor = $gameActors.actor(actor_id);
    return actor && actor.hasAttributes(attribute) ? actor.attribute(attribute).setRange(maximum) : 0;
};
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @returns {Number}
 */
function kun_trait_get(actor_id, attribute) {
    const actor = $gameActors.actor(actor_id)
    return actor && actor.hasAttributes(attribute) ? actor.attribute(attribute).value() : 0;
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Number} value 
 * @param {Boolean} applyRules
 * @returns {Number}
 */
function kun_trait_set(actor_id, attribute, value = 0, applyRules = false) {
    const actor = $gameActors.actor(actor_id);
    if (actor && actor.hasAttributes(attribute)) {
        var newValue = actor.attribute(attribute).set(value);
        KunTraits.DebugLog(`${actor.name()} ${attribute}: ${newValue}`);
        if (applyRules) {
            actor.attribute(attribute).applyRules(actor_id);
        }
        return newValue;
    }
    return 0;
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Number} value 
 * @param {Boolean} applyRules
 * @returns {Number}
 */
function kun_trait_sub(actor_id, attribute, value = 1, applyRules = false) {
    return kun_trait_add(actor_id, attribute, -value, applyRules);
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Number} value 
 * @param {Boolean} applyRules
 * @returns {Number}
 */
function kun_trait_add(actor_id, attribute, value = 1, applyRules = false) {
    var current = kun_trait_get(actor_id, attribute);
    return kun_trait_set(actor_id, attribute, current + value, applyRules);
}
/**
 * @param {Number} actor_id 
 * @param {String} attribute 
 * @param {Boolean} applyRules
 * @returns {Number}
 */
function kun_trait_reset(actor_id, attribute, applyRules = false) {
    return kun_trait_set(actor_id, attribute, 0, applyRules);
}
/**
 * @param {Number} actor_id1 
 * @param {Number} actor_id2 
 * @param {String} attribute 
 * @param {Number} amount
 * @returns {Boolean}
 */
function kun_trait_transfer(actor_id1, actor_id2, attribute, amount = 1) {
    kun_trait_sub(actor_id1, attribute, amount);
    kun_trait_add(actor_id2, attribute, amount);
};
/**
 * 
 * @param {Boolean} remove
 */
function kun_trait_migrate2(remove = false) {
    if ($gameActors) {
        if ($actorTraits.length === 0) {
            $actorTraits = KunTraits.prepareActorAttributes();
        }
        $gameActors._data.filter(actor => actor !== null).forEach(function (actor) {
            if (actor.hasOwnProperty('_customAttributes')) {
                const names = [];
                Object.values(actor._customAttributes).forEach(function (attribute) {
                    if ($actorTraits[actor.actorId()].hasOwnProperty(attribute.name())) {
                        $actorTraits[actor.actorId()][attribute.name()].copy(attribute);
                        names.push(attribute.name());
                    }
                });
                KunTraits.DebugLog(`KunTraits ${actor.name()} has upgraded attributes: ${names.join(', ')}`);
            }
            if (remove) {
                delete actor._customAttributes;
            }
        });
    }
}
/**
 * 
 */
function kun_trait_migrate3() {
    if ($gameActors) {
        $gameActors._data.filter(actor => actor !== null).forEach(function (actor) {
            if (actor.hasOwnProperty('_customAttributes')) {
                delete actor._customAttributes;
            };
        });
    }
}

(function () {
    KunTraits.Initialize();

    //KunTraits_Setup_GameActors();
    KunTraits_SetupDataManager();
    KunTraits_SetupActorAttributes();
    KunTraits_SetupWindows();
    KunTraits_SetupCommands();
})();




