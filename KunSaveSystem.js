//=============================================================================
// KunSaveSystem.js
//=============================================================================
/*:
 * @plugindesc KunSaveSystem
 * @filename KunSaveSystem.js
 * @author KUN
 * @version 1.20
 * 
 * @help
 * 
 * Conditions (script)
 * kun_savesystem_local()
 *      Returns true when there's a local path ready to save
 * 
 * Escape Chars (Dialogs)
 * 
 * {APP_FOLDER}
 *  Base app save folder, under www/save
 * {CUSTOM_FOLDER}
 *  Custom folder if available and ready
 * {SAVE_FOLDER}
 *  Current save folder
 * 
 * 
 * @param debug
 * @text Debug
 * @desc Show debug data in console
 * @type boolean
 * @default false
 * 
 * @param paths
 * @type struct<SavePath>[]
 * @text Save Routes
 * @desc register all available path routes depending on the OS
 * 
 * @param saveFiles
 * @text Save File Rows
 * @desc How many save file rows available
 * @type number
 * @min 1
 * @max 10
 * @default 5
 * 
 */
/*~struct~SavePath:
 * @param os
 * @text Platform/OS
 * @type select
 * @option Windows 32bit
 * @value win32
 * @option Windows 64bit
 * @value win64
 * @option Linux
 * @value linux
 * @option Android
 * @value android
 * @option aix
 * @value aix
 * @option darwin
 * @value darwin
 * @option freebsd
 * @value freebsd
 * @option openbsd
 * @value openbsd
 * @option sunos
 * @value sunos
 * @option Disabled
 * @value disabled
 * @default win64
 * 
 * @param route
 * @text Path Route
 * @type text
 */
/**
 * @class {KunSaveSystem}
 */
class KunSaveSystem {
    /**
     * 
     */
    constructor() {
        if( KunSaveSystem.__instance ){
            return KunSaveSystem.__instance;
        }

        KunSaveSystem.__instance = this;
        
        this.initialize();
    }
    /**
     * @returns {KunSaveSystem}
     */
    initialize() {

        const parameters = this.pluginData();
        const os = this.platform();

        this._path = this.require('path');
        this._debug = parameters.debug || false;
        this._saveFileRows = parameters.saveFiles || 5;

        this._routes = (parameters.paths || []).filter(path => path.os === os).map(path => path.route);
        this._localData = this.routes().length && this.prepareRoute(this.routes()[0]) || '';

        return this;
    }


    /**
     * @returns {Boolean}
     */
    debug  () { return this._debug; };
    /**
     * @param {String} module 
     * @returns {Object}
     */
    require (module = '') { return module && require && require(module) || null; };
    /**
     * @returns {Number}
     */
    saveFiles () { return this._saveFileRows * 4; };
    /**
     * @returns {Boolean}
     */
    canLocalSave () { return this.dataRoute().length > 0; };
    /**
     * @returns {Object}
     */
    path () { return this._path || null; };
    /**
     * @returns {String}
     */
    routes () { return this._routes; };
    /**
     * @returns {String}
     */
    platform () { return nw.process.platform; };
    /**
     * @returns {String}
     */
    separator () {
        switch (this.platform()) {
            case 'win32':
            case 'win64':
                return "\\";
            default:
                return "/";
        }
    };
    /**
     * @param {Boolean} split
     * @returns {String[]|String}
     */
    appRoute (split = false) {
        const path = this.path()
            .dirname(process.mainModule.filename)   //app folder
            .replace(/[/\\]www$/, '');              //remove www from public builds
        return split ? path.split(this.separator()) : path;
    };
    /**
     * @returns {String}
     */
    appDataRoute () { return this.path().join(this.appRoute(), 'www', 'save/'); };
    /**
     * @returns {String}
     */
    appName () { return this.appRoute(true).slice(-1)[0] || ''; };
    /**
     * @returns {String}
     */
    localRoute () {
        //const nwgui = require('nw.gui');
        const nwgui = this.require('nw.gui');
        return nwgui && nwgui.App.dataPath || '';
    };
    /**
     * @returns {String}
     */
    dataRoute () { return this._localData || ''; };
    /**
     * @param {String} basePath
     * @returns {Boolean}
     */
    prepareRoute (basePath = '') {
        if (basePath) {
            const dataPath = this.path().join(
                basePath.replace(/%([^%]+)%/g, (_, name) => process.env[name] || `%${name}%`),
                this.appName(), 'save/');
            const fs = this.require('fs');
            if (fs) {
                if (!fs.existsSync(dataPath)) {
                    KunSaveSystem.DebugLog(`Preparing local data directory in ${dataPath} ...`);
                    fs.mkdirSync(dataPath, { 'recursive': true });
                }
                if (fs.existsSync(dataPath)) {
                    KunSaveSystem.DebugLog('Local directory data ready: ' + dataPath);
                    return dataPath;
                }
                else {
                    KunSaveSystem.DebugLog('Unable to create ' + dataPath);
                }
            }
        }
        return '';
    };
    /**
     * @returns {String}
     */
    saveDataPath() { return this.canLocalSave() ? this.dataRoute() : this.appDataRoute(); };

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

        return _kunPluginReaderV2('KunSaveSystem', PluginManager.parameters('KunSaveSystem'));
    };


    /**
     * @param {String|Object} message
     */
    static DebugLog() {
        if (KunSaveSystem.manager().debug()) {
            console.log('[ KunSaveSystem ]', ...arguments);
        }
    };
    /**
     * @returns {KunSaveSystem}
     */
    static manager() { return KunSaveSystem.__instance || new KunSaveSystem(); }
}





/**
 * 
 */
function KunSaveSystem_SetupSaveData() {
    //Override the local save directory
    if (KunSaveSystem.manager().canLocalSave()) {
        StorageManager.localFileDirectoryPath = function () {
            return KunSaveSystem.manager().saveDataPath();
        };
    }
    DataManager.maxSavefiles = function () {
        return KunSaveSystem.manager().saveFiles();
    };
};
/**
 * @returns {Boolean}
 */
function kun_savesystem_local() {
    return KunSaveSystem.manager().canLocalSave();
}

function KunSaveSystem_SceneSave_Header() {
    Scene_Save.prototype.helpWindowText = function () {
        //return TextManager.saveMessage;
        const savePath = KunSaveSystem.manager().canLocalSave() && KunSaveSystem.manager().dataRoute().replace(/\\/ig, '/') || '';
        console.log(savePath);
        return savePath.length ? `${TextManager.saveMessage} \\C[8]\\}${savePath}\\{\\C[0]` : TextManager.saveMessage;
    };
    Scene_Load.prototype.helpWindowText = function () {
        //return TextManager.loadMessage;
        const savePath = KunSaveSystem.manager().canLocalSave() && KunSaveSystem.manager().dataRoute().replace(/\\/ig, '/') || '';
        console.log(savePath);
        return savePath.length ? `${TextManager.saveMessage} \\C[8]\\}${savePath}\\{\\C[0]` : TextManager.saveMessage;
    };
}

/**
 * 
 */
function KunSaveSystem_SetupEscapeChars() {
    _KunSaveSystem_WindowBase_ConvertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {

        const parsed = _KunSaveSystem_WindowBase_ConvertEscapeCharacters.call(this, text);

        return parsed.replace(/\{APP_FOLDER\}/g, function () {
            return KunSaveSystem.manager().appDataRoute();
        }.bind(this)).replace(/\{CUSTOM_FOLDER\}/g, function () {
            return KunSaveSystem.manager().canLocalSave() ? KunSaveSystem.manager().dataRoute() : 'NO_CUSTOM_SAVE_FOLDER';
        }.bind(this)).replace(/\{SAVE_FOLDER\}/g, function () {
            return KunSaveSystem.manager().saveDataPath();
        }.bind(this));
    };
}

/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

(function ( /* args */) {

    KunSaveSystem.manager();

    KunSaveSystem_SetupSaveData();
    //KunSaveSystem_SceneSave_Header();
    //just for testing
    KunSaveSystem_SetupEscapeChars();
})( /* initializer */);

