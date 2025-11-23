//=============================================================================
// KunTextExporter.js
//=============================================================================
/*:
 * @plugindesc KunTextExporter
 * @filename KunTextExporter.js
 * @author KUN
 * 
 * @param debug
 * @text Debug
 * @desc Show debug info
 * @type Boolean
 * @default false
 * 
 * @param export
 * @text Export
 * @desc Export all text and dialog contents
 * @type Boolean
 * @default false
 * 
 * @param filterMaps
 * @text Filter Maps
 * @type Number[]
 * @min 1
 * 
 * @param fitlerEvents
 * @text Filter Custom Events
 * @type Number[]
 * @min 1
 * 
 */

/**
 * @param {Boolean} debug 
 */
function KunContentExporter( debug ) {

    var _exporter = {
        'debug': debug || false,
        'mapFilter':[],
        'eventFilter':[],
        'events': [
            //CommonEvents and Map Events
        ],
        'maps': [
            //Map Headers
        ],
        'items':[
            //Items, Armors, Spells, Weapons ...
        ],
        'counter': 0,
    };

    /**
     * 
     * MapInfos = [
     * 
     *      {"id":1,"name":ValyndraCity}
     *      ...
     * 
     * ]
     * 
     * MapFile = {
     * 
     *      "data":[ tileset ],
     *      "events":[
     * 
     *          "id":1,"name":"Event Name","pages":[
     *              {"conditions":"...","list":[
     *                  //Display Text
     *                  {"code":401,"ident":0,"parameters":["Show Text Event"]}
     *                  //Scrolling Text
     *                  {"code":405,"ident":0,"parameters":["Scrolling Text Event"]}
     *                  //Selection Choices
     *                  {"code":102,"ident":0,"parameters":["Choice 1","Choice 2","Choice 3","Choice 4","Choice 5","Choice 6"]}
     *                  //Selection choice Index and Text
     *                  {"code":402,"ident":0,"parameters":[1,"Choice 1"]}
     *              ]}
     *          ]
     *      ]
     * 
     * }
     * 
     * 
     * 
     */
    /**
     * @param {Number} eventId 
     * @returns Object
     */
    this.getEvent = function( eventId){
        return eventId < _exporter.events.length ? _exporter.events[eventId] : {};
    };
    /**
     * @returns Number
     */
    this.countMaps = function(){
        return _exporter.maps.length;
    };
    /**
     * @returns Number
     */
    this.countEvents = function(){
        return _exporter.events.length;
    };

    this.addMapFilter = function( mapId){
        
        _exporter.mapFilter.push( parseInt( mapId) );
    };
    this.addEventFilter = function( eventId ){
        _exporter.eventFilter.push( parseInt( eventId ) );
    };
    /**
     * 
     * @param {Number} map 
     * @param {String} mapName 
     * @param {Number} event_id 
     * @param {String} event_name
     * @param {Number} page 
     * @param {Number} command_id 
     * @param {Number} code 
     * @param {String} text 
     * return KunContentExporter
     */
    this.register = function (map, map_name, event_id, event_name, page, command_id, code, text) {
        _exporter.events.push({
            'map': map,
            'map_name': map_name,
            'event': event_id,
            'event_name': event_name,
            'page': page,
            'command': command_id,
            'code': code,
            'text': text.length ? text.replace(/\t/,', ') : '',
        });
        return this;
    };

    /**
     * @param {Object} mapData 
     * @param {String} mapName
     * @returns KunContentExporter
     */
    this.readMap = function (mapData, mapName, mapId) {

        var _self = this;

        if (mapData.hasOwnProperty('events')) {
            mapData.events.filter(event => event !== null).forEach(function (event) {
                var _eventId = event.id;
                //event.pages.filter(page => page !== null).forEach(function (page) {
                    for (var _pageId = 0; _pageId < event.pages.length; _pageId++) {
                        for (var _commandId = 0; _commandId < event.pages[_pageId].list.length; _commandId++) {
                            var _command = event.pages[_pageId].list[_commandId];
                            switch (_command.code) {
                                case 401: //display text
                                case 405: //scroll text
                                    if( _command.parameters.length ){
                                        _self.register(mapId, mapName, _eventId, event.name, _pageId + 1, _commandId, _command.code, _command.parameters[0]);
                                    }
                                    break;
                                case 102: //options
                                    _command.parameters[0].forEach(function (option) {
                                        _self.register(mapId, mapName, _eventId, event.name, _pageId + 1, _commandId, _command.code, option);
                                    });
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                //});
            });
        }

        //console.log( _exporter.events );

        return this;
    };
    /**
     * @param {Object} eventData 
     * @returns 
     */
    this.readCommonEvents = function( eventData ){
        _exporter.events = [];
        var _filters = _exporter.eventFilter.slice();
        if( Array.isArray(eventData ) ){
            var _self = this;
            eventData.filter( e => e !== null ).forEach( function( event ){
                var _eventId = event.id;
                if( _filters.length === 0 || _filters.contains( _eventId ) ){
                    for( var i = 0 ; i < event.list.length ; i++ ){
                        var _command = event.list[i];
                        switch( _command.code ){
                            case 401:
                            case 405:
                                if( _command.parameters.length ){
                                    _self.register(0, 'CommonEvents', _eventId, event.name, 1, _command.id, _command.code, _command.parameters[0]);
                                }
                                break;
                            case 102:
                                _command.parameters[0].forEach(function (option) {
                                    _self.register(0, 'CommonEvents', _eventId, event.name, 1, _command.id, _command.code, option);
                                });
                                break;
                        }
                    }    
                }
            });

        }

        return this;
    }
    /**
     * 
     * @returns KunContentExporter
     */
    this.importCommonEvents = function(){
        var _self = this;
        return this.load( 'CommonEvents' , function( eventData ){
            //console.log('Reading CommonEvents ...');
            _self.readCommonEvents( eventData );
        });
        return this;
    };
    /**
     * 
     * @param {String} map_id 
     * @returns KunContentExporter
     */
    this.importMap = function (mapId) {
        if (_exporter.maps.length > mapId && mapId > 0) {
            var _self = this;
            var mapName = 'Map%1'.format(mapId.padZero(3));
            return this.load(mapName, function (mapData) {
                _self.readMap(mapData, _exporter.maps[mapId].name, mapName);
            });
        }
        return this;
    };
    this.importMapInfos = function () {
        _exporter.maps = [];
        var _filters = _exporter.mapFilter.slice();
        //console.log(_filters);
        this.load('MapInfos', function (mapData) {
            if (Array.isArray(mapData)) {
                mapData.filter( map => map !== null ).forEach(function (map) {
                    if( _filters.length === 0 || _filters.contains( map.id ) ){
                        _exporter.maps.push(map);
                        //console.log( `Map${map.id} ...`);
                    }
                });
            }
        });

        return this;
    };
    /**
     * @param {Number} mapId 
     * @returns String
     */
    this.mapName = function( mapId ){
        if( mapId > 0 && mapId < _exporter.maps.length ){
            return _exporter.maps[mapId].name;
        }
        return 'Map%1'.format(mapId.padZero(3));
    };
    /**
     * 
     * @returns KunContentExporter
     */
    this.runMapLoader = function () {
        if( _exporter.counter < _exporter.maps.length ){
            var _self = this;
            _exporter.counter++;
            if (_exporter.counter < _exporter.maps.length ) {
                var mapName = 'Map%1'.format(_exporter.counter.padZero(3));
                if( _exporter.debug ){
                    console.log( `[${_exporter.counter}] Reading ${mapName}...`);
                }
                this.load( mapName , function( mapData ){
                    _self.readMap( mapData , _self.mapName(_exporter.counter ), mapName );
                    if( _exporter.counter < _exporter.maps.length ){
                        _self.runMapLoader();
                    }
                });
            }
        }
        return this;
    };
    /**
     * 
     * @returns KunContentExporter
     */
    this.exportCSV = function () {
        var _output = [];
        _exporter.events.forEach(function (event) {
            if (_output.length === 0) {
                _output.push(Object.keys(event).join("\t"));
            }
            _output.push(Object.values(event).join("\t"));
        });
        _exporter.events = [];
        return this.write(_output.join("\n"), 'csv').clear();
    };
    /**
     * 
     * @returns KunContentExporter
     */
    this.exportJSON = function(){
        var _output = _exporter.events;
        return this.write(_output, 'json').clear();
    };
    /**
     * @param {Boolean} dropMapInfos
     * @returns KunContentExporter
     */
    this.clear = function( dropMapInfos ){
        _exporter.counter = 0;
        _exporter.events = [];
        if( typeof dropMapInfos === 'boolean' && dropMapInfos ){
            _exporter.maps = [];
        }
        return this;
    };

    /**
     * 
     * @param {String} fileName 
     * @param {Function} callback 
     * @returns KunContentExporter
     */
    this.load = function (fileName, callback) {

        var xhr = new XMLHttpRequest();
        var url = `data/${fileName}.json`;
        if( _exporter.debug ){
            console.log(`Opening ${url}`);
        }
        xhr.open('GET', url);
        xhr.overrideMimeType('application/json');
        xhr.onload = function () {
            if (xhr.status < 400) {
                if (typeof callback === 'function') {
                    callback(JSON.parse(xhr.responseText));
                    //_self.readMap( JSON.parse(xhr.responseText) );
                }
            }
        };
        xhr.onerror = function () {
            console.log('error loading ' + fileName);
        };
        xhr.send();

        return this;
    };
    /**
     * @param {Object} data 
     * @param {String} extension
     * @return KunContentExporter
     */
    this.write = function (data, extension) {
        if (typeof extension === 'undefined') {
            extension = 'txt';
        }
        var _fileName = (new Date()).getTime().toString() + '.' + extension;
        var fs = require('fs');
        var _path = this.path();
        if (!fs.existsSync(_path)) {
            fs.mkdirSync(_path);
        }
        fs.writeFileSync(this.path(_fileName), typeof data !== 'string' ? JSON.stringify(data) : data);

        return this;
    };

};
/**
 * @param {String} file 
 * @returns String|Path
 */
KunContentExporter.prototype.path = function (file) {
    var path = require('path');
    var _filePath = typeof file === 'string' && file.length ? `export/${file}` : 'export/';
    var base = path.dirname(process.mainModule.filename);
    return path.join(base, _filePath);
};
/**
 * 
 * @returns KunContentExporter
 */
KunContentExporter.Create = function () {
    
    var parameters = KunContentExporter.Parameters();

    var exporter = new KunContentExporter( parameters.debug === 'true' );

    (parameters.filterMaps.length > 0 ? JSON.parse(parameters.filterMaps) : [] ).forEach(function( mapId){
        exporter.addMapFilter( mapId );
    });
    
    (parameters.fitlerEvents.length > 0 ? JSON.parse(parameters.fitlerEvents) : [] ).forEach(function( evendId){
        exporter.addEventFilter( evendId );
    });
    

    return exporter;
};
/**
 * @returns Object
 */
KunContentExporter.Parameters = function(){
    return PluginManager.parameters('KunTextExporter');
};
/**
 * @returns KunContentExporter
 */
KunContentExporter.Run = function( ){

    return KunContentExporter.Create().importMapInfos().importCommonEvents();
};

(function () {

    /*var parameters = PluginManager.parameters('KunTextExporter');
    var exportDialogs = parameters.export === 'true';
    var debug = parameters.debug === 'true';
    if (debug) {
        console.log(exportDialogs);
    }*/

})(/* init */);
