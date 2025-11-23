//=============================================================================
// KunActionGauge.js
//=============================================================================
/*:
 * @filename KunActionGauge.js
 * @author KUN
 * @version 3.2
 * @plugindesc Show an Action Gauge using assigned variables.
 * 
 * @help
 * 
 *  COMMANDS:
 *  KunActionGauge show|display name [location|reset|fill] [amount]
 *      Show gauge by name
 *      Define an alternative location to render the gauge [top|bottom|left|right]
 *      Define reset to setup the game variables before display (value = 0)
 *      Define fill to setup the game variables before display (value = limit)
 *      Set the amount to reset the gauges
 *  KunActionGauge close [name]
 * 
 * 
 * @param debug
 * @text Debug
 * @type boolean
 * @default false
 * 
 * @param background
 * @text Gauge Background
 * @type select
 * @option None
 * @value 2
 * @option Dim
 * @value 1
 * @option Window
 * @value 0
 * @default 0
 * 
 * @param weight
 * @text Gauge Weight
 * @desc Setup the gauge thickness
 * @type number
 * @min 8
 * @max 48
 * @default 12
 * 
 * @param offsets
 * @text Gauge Offsets
 * @desc x, y, length , weight
 * @min -100
 * @max 100
 * @type number[]
 * @default []
 * 
 * @param profiles
 * @text Gauge Profiles
 * @desc Define here the list of all available gauges
 * @type struct<Gauge>[]
 *
 */
/*~struct~Gauge:
 *
 * @param name
 * @text Name
 * @type text
 * @default action-gauge
 * 
 * @param location
 * @text Location
 * @type select
 * @option Left
 * @value left
 * @option Right
 * @value right
 * @option Top
 * @value top
 * @option Bottom
 * @value bottom
 * @option Center
 * @value center
 * @default left
 * 
 * @param valueVar
 * @text Value Variable
 * @desc The gauge value and current state
 * @type variable
 * @min 0
 * @default 0
 *
 * @param targetVar
 * @text Target Variable
 * @desc The gauge's limit or maximum value
 * @type variable
 * @min 0
 * @default 0
 *
 * @param color1
 * @text Default Color 1
 * @desc Pick the base color
 * @type number
 * @min 0
 * @max 31
 * @default 1
 *
 * @param color2
 * @text Default Color 2
 * @desc Pick the overlay color
 * @type number
 * @min 0
 * @max 31
 * @default 4
 * 
 * @param rules
 * @type struct<Rule>[]
 * @text Rules
 * @desc Change gauge colors when meeting a certain condition
 * @default []
 *
 */
/*~struct~Rule:
 *
 * @param value
 * @text Value
 * @type number
 * @min 0
 * @max 100
 * @default 0
 *
 * @param operation
 * @text Operation
 * @desc Select the proper operation to compare value to the current attribute
 * @type select
 * @option Greater
 * @value greater
 * @option Greater or Equal
 * @value greater_equal
 * @option Equal
 * @value equal
 * @option Less or Equal
 * @value less_equal
 * @option Less
 * @value less
 * @default equal
 * 
 * @param color1
 * @text Change Color 1
 * @desc Set the new gauge color when aplying this rule.
 * @type number
 * @min 0
 * @max 31
 * @detault 0
 * 
 * @param color2
 * @text Change Color 2
 * @desc Set the new gauge color when aplying this rule.
 * @type number
 * @min 0
 * @max 31
 * @detault 0
 */


class KunActionGauge {

    constructor() {
        if (KunActionGauge.__instance) {
            return KunActionGauge.__instance;
        }

        KunActionGauge.__instance = this;

        this.initialize();
    }

    initialize() {

        const parameters = this.pluginData();
        this._debug = parameters.debug;
        this._background = parameters.background || 0;
        this._weight = parameters.weight || 12;
        this._offsets = parameters.offsets || [];
        this._gauges = this.import(Array.isArray(parameters.profiles) && parameters.profiles || []);
    }
    /**
     * @returns {Boolean}
     */
    debug() { return this._debug; };


    /**
     * @returns {Number}
     */
    offsetX = function () {
        return this._offsets.length ? this._offsets[0] : 0;
    };
    /**
     * @returns {Number}
     */
    offsetY = function () {
        return this._offsets.length > 1 ? this._offsets[1] : 0;
    };
    /**
     * @returns {Number}
     */
    offsetLength = function () {
        return this._offsets.length > 2 ? this._offsets[2] : 0;
    };
    /**
     * @returns {Number}
     */
    offsetWeight = function () {
        return this._offsets.length > 3 ? this._offsets[3] : 0;
    };
    /**
     * @param {Boolean} mapNames 
     * @returns {KunGauge[]|String[]}
     */
    gauges (mapNames = false) {
        return mapNames ? this._gauges.map(gauge => gauge.name()) : this._gauges;
    };
    /**
     * @param {String} gauge 
     * @returns {KunGauge}
     */
    gauge (gauge = '') {
        return gauge && this.gauges().find(g => g.name() === gauge) || null;
    };
    /**
     * @param {String} gauge 
     * @returns {Boolean}
     */
    has (gauge = '') {
        return gauge && this.gauges().some(g => g.name() === gauge);
    };

    /**
     * @returns {Number}
     */
    weight () { return this._weight; };

    /**
     * @param {String} gauge 
     * @returns {Boolean}
     */
    isActive (gauge = '') {
        const _gauge = this.gauge(gauge);
        return _gauge && _gauge.visible() || false;
        //return this.has(gauge) && this.gauges()[gauge].visible();
    };
    /**
     * @param {String} gauge 
     * @param {Boolean} active 
     * @param {Number} amount
     * @param {Boolean} reset
     * @param {Boolean} fill
     * @returns {KunActionGauge}
     */
    display (name = '', active = true,  amount = 0  , reset = false , fill = false) {
        if (this.has(name)) {
            const gauge = this.gauge(name);
            if (active) {
                if (amount || reset ) {
                    gauge.reset( amount || gauge.target() , fill );
                }
                if (!gauge.visible()) {
                    const index = this.countByLocation(gauge.location());
                    gauge.display(index, gauge.location());
                }
            }
            else {
                gauge.close();
            }
        }
        return this;
    };
    /**
     * @returns {KunActionGauge}
     */
    closeAll () {
        this.active().forEach(function (gauge) {
            gauge.close();
        });
        return this;
    };
    /**
     * @returns {KunGauge[]}
     */
    active(){ return this.gauges().filter(gauge => gauge.visible()); };
    /**
     * @param {Number} gameVar 
     * @returns {KunActionGauge}
     */
    updateGauges (gameVar = 0) {
        this.active().filter(gauge => gauge.has(gameVar)).forEach(gauge => gauge.refresh());
        return this;
    };
    /**
     * @param {String} location 
     * @returns {Number}
     */
    countByLocation (location = '') {
        return this.active().filter(gauge => gauge.location() === location).length;
    };
    /**
     * @returns {Number}
     */
    background () { return this._background; };
    /**
     * @param {String} location 
     * @returns {Boolean}
     */
    isLocation (location = '') {
        return location && Object.values(KunGauge.Location).includes(location);
    };








    /**
     * @param {Object[]} gauges
     * @returns {KunGauge[]}
     */
    import(gauges = []) {
        return gauges.map(content => {
            const gauge = new KunGauge(
                content.name,
                content.location,
                content.valueVar,
                content.targetVar,
                content.color1,
                content.color2
            );
            if (content.rules && content.rules.length) {
                content.rules.forEach(rule => gauge.addRule(new KunGaugeRule(rule.value, rule.operation, rule.color1, rule.color2)));
            }
            return gauge;
        });
    };
    /**
     * @returns {Object}
     */
    pluginData() {
        /**
         * @param {String} key 
         * @param {*} value 
         * @returns {Object}
         */
        function _kunPluginReaderV2(key = '', value = '') {
            if (typeof value === 'string' && value.length) {
                try {
                    if (/^\{.*\}$|^\[.*\]$/.test(value)) {
                        return JSON.parse(value, _kunPluginReaderV2);
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
            else if (typeof value === 'object') {
                if (Array.isArray(value)) {
                    return value.map(item => _kunPluginReaderV2(key, item));
                }
                const content = {};
                Object.keys(value).forEach(key => content[key] = _kunPluginReaderV2(key, value[key]));
                return content;
            }
            return value;
        };
        return _kunPluginReaderV2('KunActionGauge', PluginManager.parameters('KunActionGauge'));
    };




    /**
     * @param {String|Object} message 
     */
    static DebugLog() {
        if (KunActionGauge.instance().debug()) {
            console.log('[ KunActiojnGauge ] ', ...arguments);
        }
    };
    /**
     * @param {String} command 
     * @returns {Boolean}
     */
    static command( command = '' ){
        return ['kunactiongauge','kungauge'].includes(command.toLowerCase());
    }
    /**
     * @returns {KunActionGauge}
     */
    static instance() {
        return KunActionGauge.__instance || new KunActionGauge();
    }
}





/**
 * @param {String} name 
 * @param {String} location 
 * @param {Number} valueVar 
 * @param {Number} targetVar 
 * @param {Number} color1 
 * @param {Number} color2 
 */
class KunGauge {
    /**
     * @param {String} name 
     * @param {String} location 
     * @param {Number} valueVar 
     * @param {Number} targetVar 
     * @param {Number} color1 
     * @param {Number} color2 
     */
    constructor(name = 'gauge', location = '', valueVar = 0, targetVar = 0, color1 = 1, color2 = 4) {
        this._name = name.toLowerCase().replace(/\-\s/, '_');
        this._location = location || KunGauge.Location.TOP;
        this._valueVar = valueVar || 0;
        this._targetVar = targetVar || 0;
        this._color1 = color1 || 1;
        this._color2 = color2 || 4;
        this._rules = [
            //add rules here
        ];
        this._window = null;
    }
    /**
     * @param {Number} amount
     * @param {Boolean} fill
     * @returns {KunGauge}
     */
    reset(amount = 10, fill = false) {

        if (amount) {
            $gameVariables.setValue(this.target(true), amount);
            $gameVariables.setValue(this.value(true), fill ? amount : 0);
        }

        return this;
    }
    /**
     * @param {Number} index
     * @param {String} location
     * @returns {KunGauge}
     */
    display(index = 0, location = '') {

        this._window = new Window_ActionGauge(
            this.name(),
            location || this.location(),
            index,
            this.value(true),
            this.target(true),
            this.color1(),
            this.color2()
        );
        //register the gauge in the scene
        SceneManager._scene.addChild(this._window);
        return this;
    }
    /**
     * @returns {KunGauge}
     */
    close() {
        if (this.visible()) {
            this._window.close();
            this._window = null;
        }
        return this;
    }
    /**
     * @returns {KunGauge}
     */
    refresh() {
        if (this.visible()) {
            this._window.renderGauge();
        }
        return this;
    }
    /**
     * @returns {Boolean}
     */
    visible() {
        return this._window !== null;
    }
    /**
     * @param {Boolean} validate
     * @returns {KunGauge}Rule[]
     */
    rules(validate) {
        if (typeof validate === 'boolean' && validate) {
            var progress = this.progress();
            return this.rules().filter(rule => rule.match(progress));
        }
        return this._rules;
    }
    /**
     * @returns {KunGauge}
     */
    addRule(rule = null) {
        if (rule instanceof KunGaugeRule) {
            this._rules.push(rule);
        }
        return this;
    }
    /**
     * @returns {String}
     */
    toString() {
        return this.name();
    }
    /**
     * @returns {String}
     */
    name() {
        return this._name;
    }
    /**
     * Returns the current display location, which can be the original gauge's location or a user custom location
     * @returns {String}
     */
    location() {
        return this.visible() && this._window.location() || this._location;
    }
    /**
     * @param {Boolean} getVar Get the game variable instead the value
     * @returns {Number}
     */
    value(getVar = false) {
        return getVar ? this._valueVar : $gameVariables.value(this._valueVar);
    }
    /**
     * @param {Boolean} getVar Get the game variable instead the value
     * @returns {Number}
     */
    target(getVar = false) {
        return getVar ? this._targetVar : $gameVariables.value(this._targetVar);
    }
    /**
     * @param {Number} gameVariable
     * @returns {Boolean}
     */
    has(gameVariable) {
        return this.value(true) === gameVariable || this.target(true) === gameVariable;
    }
    /**
     * @returns {Number|Float|Int}
     */
    progress() {
        return this.target() > 0 ? Math.floor(this.value() / parseFloat(this.target()) * 100) : 0;
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
    /**
     * @returns {Number}[]
     */
    colors() {
        var rules = this.rules(true);
        return rules.length ? rules[0].colors() : [this.color1(), this.color2()];
    }
    /**
     * @returns {Boolean}
     */
    isValid() {
        return this.value(true) > 0 && this.target(true) > 0;
    }
};

/**
 * @type {KunGauge.Location|String}
 */
KunGauge.Location = {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right',
    CENTER: 'center',
};
/**
 * @type {KunGauge.Color|Number}
 */
KunGauge.Color = {
    Base: 1,
    Overlay: 4
};

/**
 * @param {Number} progress % 
 * @param {String} operation 
 * @param {Number} color1 
 * @param {Number} color2 
 */
class KunGaugeRule {
    /**
     * @param {Number} progress 
     * @param {String} operation 
     * @param {Number} color1 
     * @param {Number} color2 
     */
    constructor(progress, operation, color1, color2) {
        this._progress = progress || 0;
        this._operation = operation || KunGaugeRule.Operation.Equal;
        this._color1 = color1 || 0;
        this._color2 = color2 || 4;
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
    /**
     * @returns {Number}[]
     */
    colors() {
        return [this.color1(), this.color2()];
    }
    /**
     * @returns {String}
     */
    operation() {
        return this._operation;
    }
    /**
     * @returns {Number}
     */
    progress() {
        return this._progress;
    }
    /**
     * @param {Number} value
     * @returns {Boolean}
     */
    match(value = 0) {
        switch (this.operation()) {
            case KunGaugeRule.Operation.Greater:
                return value > this.progress();
            case KunGaugeRule.Operation.GreaterEqual:
                return value >= this.progress();
            case KunGaugeRule.Operation.Equal:
                return value === this.progress();
            case KunGaugeRule.Operation.LowerEqual:
                return value <= this.progress();
            case KunGaugeRule.Operation.Lower:
                return value < this.progress();
        }
        return false;
    }
};
/**
 * @type {KunGaugeRule.Operation ||String}
 */
KunGaugeRule.Operation = {
    Greater: 'greater',
    GreaterEqual: 'greater_equal',
    Equal: 'equal',
    LowerEqual: 'less_equal',
    Lower: 'less',
};

/********************************************************************************************************************
 * 
 * INTERFACE MODS
 * 
 *******************************************************************************************************************/

/**
 * @class {Window_ActionGauge}
 */
class Window_ActionGauge extends Window_Base {
    /**
    * @param {KunGauge} gauge 
     * @param {Number} index 
     * @param {String} location 
     */
    constructor() {
        super(...arguments);
    }
    /**
     * @param {String} name 
     * @param {String} location 
     * @param {Number} index 
     * @param {Number} value 
     * @param {Number} target 
     * @param {Number} color1 
     * @param {Number} color2 
     */
    initialize(name = '', location = '', index = 0, value = 0, target = 0, color1 = 0, color2 = 0) {

        this._index = index || 0;
        this._name = name || 'gauge';
        this._location = location || KunGauge.Location.BOTTOM;
        this._valueVar = value || 0;
        this._targetVar = target || 0;
        this._baseColor = color1 || KunGauge.Color.Base;
        this._overlayColor = color2 || KunGauge.Color.Overlay;

        super.initialize(
            this.getLocationX(this.location(), this._index),
            this.getLocationY(this.location(), this._index),
            this.getLocationWidth(this.location()),
            this.getLocationHeight(this.location()),
        );

        this.initMembers();
        this.setBackgroundType(this._background);
        this.renderGauge();
    }
    /**
     * @returns {String}
     */
    name() {
        return this._name;
    }
    /**
     * @returns {KunGauge}
     */
    gauge() {
        return KunActionGauge.instance().gauge(this.name());
    }
    /**
     * @returns {Number[]}
     */
    colors() { return [this._baseColor, this._overlayColor]; }
    /**
     * @returns {String}
     */
    location() {
        return this._location;
    }
    /**
     * 
     */
    initMembers() {
        this._imageReservationId = Utils.generateRuntimeId();
        this._background = KunActionGauge.instance().background();
        this._positionType = 2;
        this._waitCount = 0;
        this._faceBitmap = null;
        this._textState = null;

        //this.clearFlags();
    }
    /**
     * @returns {Number}
     */
    progress() {
        const value = Math.abs(this.value());
        const target = this.target();
        return target && Math.min(value / parseFloat(target), 1) || 0;
    }
    /**
     * @returns {Number}
     */
    value() { return this._valueVar && $gameVariables.value(this._valueVar) || 0; }
    /**
     * @returns {Number}
     */
    target() { return this._targetVar && $gameVariables.value(this._targetVar) || 1; }
    /**
     *
     */
    renderGauge() {
        const colors = this.colors().map(color => this.textColor(color));
        const x = 0;
        const y = 0;
        const progress = this.progress();

        switch (this.location()) {
            case KunGauge.Location.TOP:
            case KunGauge.Location.BOTTOM:
            case KunGauge.Location.CENTER:
                this.drawHorizontalGauge(x, y, this.getGaugeWidth(), progress, colors[0], colors[1]);
                break;
            case KunGauge.Location.LEFT:
            case KunGauge.Location.RIGHT:
                this.drawVerticalGauge(x, y, this.getGaugeHeight(), progress, colors[0], colors[1]);
                break;
        }
    }
    /**
     * @returns {Number}
     */
    getGridWidth() { return Graphics.boxWidth / 12; }
    /**
     * @returns {Number}
     */
    getGridHeight() { return Graphics.boxHeight / 12; }
    /**
     * @returns {Number}
     */
    getGaugeWeight() { return KunActionGauge.instance().weight(); }
    /**
     * @returns {Number}
     */
    getGaugeWidth() { return this.getGridWidth() * 6 + KunActionGauge.instance().offsetLength(); }
    /**
     * @returns {Number}
     */
    getGaugeHeight() {
        return this.getGridHeight() * 6 + KunActionGauge.instance().offsetLength();
    }
    /**
     * 
     * @param {String} location 
     * @returns {Number}
     */
    getLocationWidth(location = '') {
        switch (location) {
            case KunGauge.Location.TOP:
            case KunGauge.Location.BOTTOM:
            case KunGauge.Location.CENTER:
                return this.getGaugeWidth();
            case KunGauge.Location.RIGHT:
            case KunGauge.Location.LEFT:
                return this.getGaugeWeight() * 2;
        }
        return this.getGaugeWidth();
    }
    /**
     * @param {String} location 
     * @returns {Number}
     */
    getLocationHeight(location = '') {
        switch (location) {
            case KunGauge.Location.TOP:
            case KunGauge.Location.BOTTOM:
            case KunGauge.Location.CENTER:
                return this.getGaugeWeight() * 2;
            case KunGauge.Location.RIGHT:
            case KunGauge.Location.LEFT:
                return this.getGaugeHeight();
        }
        return 0;
    }
    /**
     * @param {String} location 
     * @param {Number} index 
     * @returns {Number}
     */
    getLocationX(location = '', index = 0) {
        index = index && index * 2 || 0;
        const offset = KunActionGauge.instance().offsetX();
        switch (location) {
            case KunGauge.Location.TOP:
            case KunGauge.Location.BOTTOM:
            case KunGauge.Location.CENTER:
                return this.getGridWidth() * 3;
            case KunGauge.Location.RIGHT:
                return Graphics.boxWidth - (this.getGaugeWeight() * (index + 3)) - offset;
            case KunGauge.Location.LEFT:
                return this.getGaugeWeight() * (index + 1) + offset;
        }
        return 0;
    }
    /**
     * @param {String} location 
     * @param {Number} index 
     * @returns {Number}
     */
    getLocationY(location = '', index = 0) {
        index = index && index * 2 || 0;
        const offset = KunActionGauge.instance().offsetY();
        switch (location) {
            case KunGauge.Location.TOP:
                return this.getGridHeight() + (this.getGaugeWeight() * index) + offset;
            case KunGauge.Location.BOTTOM:
                return this.getGridHeight() * 10 - (this.getGaugeWeight() * index) - offset;
            case KunGauge.Location.CENTER:
                return this.getGridHeight() * 5 + (this.getGaugeWeight() * index);
            //return this.getGridHeight() + (5 + Window_ActionGauge.getGaugeWeight() * index);
            case KunGauge.Location.RIGHT:
            case KunGauge.Location.LEFT:
                return this.getGridHeight() * 2 + offset;
        }
        return 0;
    }
    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} progress 
     * @param {Number} color1 
     * @param {Number} color2 
     */
    drawHorizontalGauge(x, y, width, progress, color1, color2) {
        const progressBar = Math.floor(width * progress);
        const weight = this.getGaugeWeight();
        this.contents.fillRect(x, y, width, weight, this.gaugeBackColor());
        this.contents.gradientFillRect(x, y, progressBar, weight, color1, color2);
    }
    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} progress 
     * @param {Number} color1 
     * @param {Number} color2 
     */
    drawVerticalGauge(x, y, height, progress, color1, color2) {
        const progressBar = Math.floor(height * progress);
        const weight = this.getGaugeWeight();
        this.contents.fillRect(x, y, weight, height, this.gaugeBackColor());
        this.contents.gradientFillRect(x, y + height - progressBar, weight, progressBar, color1, color2);
    }
    /**
     * @returns {Number}
     */
    standardFontSize() {
        return this.getGaugeWeight();
    }
    /**
     * @returns {Number}
     */
    standardPadding() {
        return this.getGaugeWeight() / 2;
    }
    /**
     * @returns {Number}
     */
    textPadding() {
        return this.getGaugeWeight() / 2;
    }
}


/********************************************************************************************************************
 * 
 * FUNCTIONS
 * 
 *******************************************************************************************************************/

/**
 * 
 */
function KunActionGauge_HookVariables() {
    //override game variables
    var _KunActionGauge_GameVariables_SetValue = Game_Variables.prototype.setValue;
    Game_Variables.prototype.setValue = function (variableId, value) {
        _KunActionGauge_GameVariables_SetValue.call(this, variableId, value);
        KunActionGauge.instance().updateGauges(variableId);
    };
}
/**
 * 
 */
function KunActionGauge_SetupCommands() {
    var KunGaugePluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        KunGaugePluginCommand.call(this, command, args);
        if (KunActionGauge.command(command)) {
            if (args && args.length) {
                const manager = KunActionGauge.instance();
                const gauges = args[1] && args[1].split(':') || [];
                switch (args[0]) {
                    case 'show':
                    case 'display':
                        if( gauges.length ){
                            const flag = args[2] || '';
                            const values = args[3] && args[3].split(':').map(v => parseInt(v)) || [0];
                            const amount = values[Math.floor(Math.random() * values.length)];
                            gauges.forEach(function (gauge) {
                                manager.display( gauge, true, amount, flag === 'reset', flag === 'fill' );
                            });                            
                        }
                        break;
                    case 'close':
                        if (gauges.length ) {
                            gauges.forEach(function (gauge) {
                                manager.display(gauge, false);
                            });
                        }
                        else {
                            manager.closeAll();
                        }
                        break;
                }
            }
        }
    };
};


/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function ( /* args */) {

    KunActionGauge.instance();
    //KunActionGauge.DebugLog( 'ready!' );
    KunActionGauge_HookVariables();
    //OVERRIDE COMMAND INTERPRETER
    KunActionGauge_SetupCommands();

})( /* initializer */);


