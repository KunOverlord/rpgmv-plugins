//=============================================================================
// KunTestParams.js
//=============================================================================
/*:
 * @filename KunTestParams.js
 * @plugindesc KunTest Params
 * @author Kun
 * 
 * @param equipEventId
 * @desc Run this event every time any gear is equipped
 * @type common_event
 * @default 0
 * 
 * @param unEquipEventId
 * @text Unequip Event ID
 * @desc Run this event every time any gear is un-equipped
 * @type common_event
 * @default 0
 * 
 * @param dropEventId
 * @desc Run this event every time any gear is dropped or stolen
 * @type common_event
 * @default 0
 * 
 * @param equipVarId
 * @desc Global Variable used to export the Item which is being attacked, or removed from the gear
 * @type Variable
 * @default 0
 *
 * @param slotVarId
 * @desc Global Variable used to export the Equip Slot which where an armor is attached
 * @type Variable
 * @default 0
 *
 * @param actorVarId
 * @desc Global Variable used to export the actor whose equipment is affected
 * @type Variable
 * @default 0
 * 
 * @param enemyVarId
 * @desc Global Variable used to export the target enemy casted or caster in battle
 * @type Variable
 * @default 0
 *
 * @param windowStatusType
 * @text Window Status Type
 * @type Select
 * @option Default
 * @value default
 * @option Variant
 * @value variant
 * @default default
 * 
 * @param iconSwitchOn
 * @text Icon Switch On
 * @type Number
 * @min 0
 * @default 0
 * 
 * @param iconSwitchOff
 * @text Icon Switch Off
 * @type Number
 * @min 0
 * @default 0
 *
 * @help
 * just for param import testing purposes
 */

var KUN = KUN || {};
/**
 * 
 */
function KunTestParams() {

    var _params = {
        'equipEventId': 0,
        'unEquipEventId': 0,
        'dropEventId': 0,
        'equipVarId': 0,
        'slotVarId': 0,
        'actorVarId': 0,
        'enemyVarId': 0,
        'windowStatusType': 0,
        'iconSwitchOn': 0,
        'iconSwitchOff': 0,
    };

    this.Set = {
        'EquipEventId': (eventId) => _params.equipEventId = parseInt(eventId),
        'UnEquipEventId': (eventId) => _params.unEquipEventId = parseInt(eventId),
        'DropEventId': (eventId) => _params.dropEventId = parseInt(eventId),
        'EquipVarId': (varId) => _params.equipVarId = parseInt(varId),
        'SlotVarId': (varId) => _params.slotVarId = parseInt(varId),
        'ActorVarId': (varId) => _params.actorVarId = parseInt(varId),
        'EnemyVarId': (varId) => _params.enemyVarId = parseInt(varId),
        'WindowStatusType': (type) => _params.windowStatusType = type || 'default',
        'IconSwitchOn': (icon) => _params.iconSwitchOn = parseInt(icon),
        'IconSwitchOff': (icon) => _params.iconSwitchOff = parseInt(icon),
    };
    /**
     * @returns Object
     */
    this.export = () => _params;
};

/**
 * @param {Object} input 
 * @returns JayaKunMods
 */
KunTestParams.prototype.setup = function (input) {
    if (typeof input === 'object') {
        var _setters = Object.keys( input ).map( (prop) => prop[0].toUpperCase() + prop.slice(1,prop.length));
        Object.keys(input).forEach(function (param) {
            var prop = param[0].toUpperCase() + param.slice(1,param.length);
            if (_setters.hasOwnProperty(prop)) {
                _setters[prop](input[param]);
            }
        });
    }
    return this;
}
/**
 * @returns JayaKunMods
 */
KunTestParams.prototype.init = function () {

    console.log('loading functions');

    return this;
}

function kun_test_params() {
    console.log(KUN.TestParams.export());
}

/**
 * PLUGIN STARTER
 */
(function () {

    KUN.TestParams = new KunTestParams();
    KUN.TestParams.setup(PluginManager.parameters('KunTestParams')).init();

    kun_test_params();

})( /* parameters */);


