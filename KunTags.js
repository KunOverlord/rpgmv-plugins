//=============================================================================
// KunTags.js
//=============================================================================
/*:
 * @filename KunTags.js
 * @plugindesc Kun Event Tags
 * @version 1.22
 * @author KUN
 * 
 *
 * @help
 * 
 * KunTags wait [fps:fps:...];
 * 
 * KunTags jumpto [tag1:tag2:tag3:...] [drop|random]
 *      Jumps to the first label found, sorted by priority, looking into the aliases first
 *      Use it with a default fallback label at the end
 *      Drops the label alias if found
 *      Randoms among the list of labels providen
 * 
 * KunTags drop [alias]
 *      Remove a label alias
 * 
 * KunTags list [tag:tag:tag:...|clear]
 *      Creates a list of tags to use later
 * 
 * KunTags tagfrom [tag] [random]
 *      Gets a random item from the taglist into tag
 * 
 * KunTags tag [tag] [label:label:label:...] [random]
 *      Set or create a tag and import the list of values
 *      Tag a randomly selected label from the list if more than one label is provided
 * 
 * KunTags setup [header:value:value:...] [tag:value:value:...] [tag:value:value:...]
 *      Create a tag hierarchy from a main tag (header) and subtags (tag) and fill their values
 *      Subtags allow to use more complex state-machine entities to handle within the game events
 *      Use tag command to set internal sub-tags
 * 
 * KunTags setstate tag state value
 *      Sets a subtag/state within the given tag
 *      If no value is providen, subtag/state will be removed
 * 
 * KunTags create|taglist [tag] [value:value:value:...] [random]
 *      Creates a tag with a list of values
 * 
 * KunTags is|istag [tag:match:match:...] [label:label:label:...] [fallback:fallback:fallback:...]
 *      Jumps to any of the providen labels in the label list when tag matches any of the match in the list
 *      First is the tag to check, later items are the value or values to match
 *      If any of the values is matched, jump to the label or a random label in the list after
 *      If no values matched, but a fallback list is providen, will attempt to jump to a fallback label
 * 
 * KunTags chaintag [tag] [label1:label2:label3]
 *      Sets the label alias to the defined label list one after the other
 * 
 * KunTags has [tag:label:label:label:...] [fallback:fallback:...]
 *      Jumps to any label in the label list if tag is defined
 *      Jumps to fallback when no tag is defined
 * 
 * KunTags tagvar|vartag [tag:label] [exportVar] [fallback]
 *      Search a label alias in the label list and exports position into exportVar
 *      If none of the labels in the list is found, exportVar is set to zero
 *      Good to assign a label-alias into a variable by it's index, or to findout the value of a label alias
 *      Use fallback value to default if none found
 * 
 * KunTags isvar|valueof [gamevar:value:value:value:...] [label:label:label]
 *      Jumps randomly to any oth the providen labels when gamevar matches one of the values defined
 *      Use only gamevar to jump when gamevar's value is over zero
 * 
 * KunTags lesser [gamevar:value:value:value] [label:label:label]
 *      Jumps to random label when gamevar's value matches lesser than any of the values providen
 *      Also matches if gamevar's value is zero when no values are providen
 * 
 * KunTags greater [gamevar:value:value:value] [label:label:label]
 *      Jumps to random label when gamevar's value matches greater than any of the values providen
 *      Also matches if gamevar's value is greater than zero when no values are providen
 * 
 * 
 * @param debug
 * @text Debug
 * @type boolean
 * @default false
 * 
 * @param tags
 * @type struct<GameTag>[]
 * @text Game Tags
 * @desc Define a list of load-save gametags
 */
/*~struct~GameTag:
 * @param tag
 * @type text
 * @text Game Tag
 * @default TAG
 * 
 * @param content
 * @text Content
 * @type text[]
 * @desc Tag values
 * 
 * @param tags
 * @type struct<GameTag>[]
 * @text Child Tags
 * @desc Define a hierarchy of game tags
 * 
 * @param strings
 * @type text[]
 * @text Strings
 * @desc Describe the displayable tag strings, as TAG1|Nice Tag Title, TAG2|Awesome Tag Title ...
 */


/**
 * @class{KunTags}
 */
class KunTagManager {
    /**
     * 
     * @returns {KunTagManager}
     */
    constructor() {
        if (KunTagManager.__instance) {
            return KunTagManager.__instance;
        }

        KunTagManager.__instance = this.initialize();
    }
    /**
     * 
     * @returns {KunTagManager}
     */
    initialize() {

        const _parameters = KunTagManager.PluginData();

        this._collection = new KunTagCollection();
        this._debug = _parameters.debug;
        //this._savetags = _parameters.savetags || false;
        //load all gametags
        (_parameters.tags || []).forEach(content => this.loadTagData(content));

        return this;
    }
    /**
     * @param {Object} data 
     * @param {Boolean} childtag
     */
    loadTagData(data = null, childtag = false) {
        if (data instanceof Object) {
            const tag = new KunGameTag(
                data.tag || 'TAG',
                data.content || [],
                data.gamevar || 0
            );
            const strings = Array.isArray(data.strings) ? data.strings : [];
            const tags = Array.isArray(data.tags) ? data.tags : [];
            strings.map(str => str.split('|')).forEach(text => tag.addtext(text[0], text[1] || text[0]));
            tags.forEach(content => this.loadTagData(content, true));
            //GameTags are game static and won't be removed
            !childtag && this.collection().add(tag);
        }
    }

    /**
     * @returns {Boolean}
     */
    debug() { return this._debug; };
    /**
     * @returns {Boolean}
     */
    savetags() { return !!this.collection().tags(true).length; };

    /**
     * @returns {KunTagCollection}
     */
    collection() { return this._collection; }

    /**
     * @return {Object}
     */
    static PluginData() {
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
                //console.log(value);
                if (Array.isArray(value)) {
                    return value.map(item => _kunPluginReaderV2(key, item));
                }
                const content = {};
                Object.keys(value).forEach(key => content[key] = _kunPluginReaderV2(key, value[key]));
                //console.log(key,content);
                return content;
            }
            return value;
        };

        return _kunPluginReaderV2('KunTags', PluginManager.parameters('KunTags'));

        //var _data = PluginManager.parameters('KunTags');
        //var _output = {};
        //Object.keys(_data).forEach(function (key) {
        //    _output[key] = _kunPluginParser(key, _data[key]);
        //});
        //return _output;
    };

    /**
     * @param {String|Object} message 
     */
    static DebugLog() {
        if (KunTagManager.manager().debug()) {
            console.log('[ KunTags ]', ...arguments);
        }
    };

    /**
     * @returns {KunTagManager}
     */
    static manager() {
        return KunTagManager.__instance || new KunTagManager();
    };
}

/**
 * @class {KunTagCollection}
 */
class KunTagCollection {
    /**
     * 
     */
    constructor() {
        this._tags = [];
    }
    /**
     * @param {Object} content 
     * @returns {Boolean}
     */
    load(content = null) {
        if (content instanceof Object) {
            Object.keys(content).forEach(tag => {
                const _tag = this.get(tag);
                if (_tag instanceof KunGameTag) {
                    _tag._name = tag;
                    _tag._content = Array.isArray(content[tag]) && content[tag] || [];
                }
                //this._data[tag] = Array.isArray(content[tag]) && content[tag] || [];
            });
            return true;
        }
        return false;
    }
    /**
     * @returns {Object}
     */
    tagdata() {
        const data = {};
        this.tags(true).forEach(tag => data[tag.name()] = tag.content());
        return data;
        //return this._data;
    }


    /**
     * @returns {KunTag[]}
     */
    //tags() { return Object.keys(this.tagdata()).map(tag => new KunTag(tag, this.tagdata()[tag])); }
    /**
     * @param {Boolean} gametags List Gametags only
     * @returns {KunTag[]}
     */
    tags(gametags = false) { return gametags && this.tags().filter(tag => tag instanceof KunGameTag) || this._tags; }
    /**
     * @param {String} tag 
     * @returns {KunTag}
     */
    get(tag = '') { return tag && this.tags().find(t => t.isme(tag)) || null; }
    /**
     * @param {String} tag 
     * @returns {String}
     */
    value(tag = '') {
        const _tag = this.get(tag);
        return _tag && _tag.value() || '';
    }
    /**
     * @param {String} tag 
     * @param {String[]} values 
     * @param {Boolean} random
     * @returns {KunTag}
     */
    new(tag = '', values = [], random = false) {
        if (tag) {
            const _tag = new KunTag(tag, values);
            this.add(random && _tag.unsort() || _tag);
            return _tag;
        }
        return null;
    }
    /**
     * @param {String} tag 
     * @returns {KunTag}
     */
    getnew(tag = '') { return this.get(tag) || this.new(tag); }
    /**
     * @param {String[]} tags 
     * @param {String} join 
     * @returns {String}
     */
    combine(tags = [], join = '_') {
        return this.tags()
            .filter(tag => tags.includes(tag.name()))  //get from selection
            .map(tag => tag.value() || tag.name())    //map to values
            .join(join);  //join values
    }
    /**
     * @param {String} tag 
     * @returns {Boolean}
     */
    has(tag = '') { return !!this.get(tag); }
    /**
     * @param {KunTag} tag 
     * @returns {KunTagCollection}
     */
    add(tag = null) {
        if (tag instanceof KunTag) {
            this.tags().push(tag);
            return true;
        }
        return false;
    }
    /**
     * @param {String} tag 
     * @param {String} value 
     * @returns {Boolean}
     */
    is(tag = '', value = '') {
        const _tag = this.get(tag);
        return _tag && (!value || _tag.is(value)) || false;
    }
    /**
     * @param {String} tag 
     * @param {String} value 
     * @returns {Boolean}
     */
    can(tag = '', value = '') {
        const _tag = this.get(tag);
        return _tag && _tag.has(value) || false;
    }
    /**
     * @param {String} tag 
     * @param {String} value 
     * @returns {Boolean}
     */
    drop(tag = '', value = '') {
        const _tag = this.get(tag);
        return _tag && value && _tag.drop(value) || false;
    }
    /**
     * @param {String} tag 
     * @returns {Number}
     */
    position(tag = '') {
        const _tag = this.get(tag);
        return _tag && _tag.position(tag) || 0;
    }
    /**
     * @param {String} tag 
     * @returns {String}
     */
    random(tag = '') {
        const _tag = this.get(tag);
        if (_tag) {
            KunTagManager.DebugLog(_tag);
            _tag.set(_tag.random(true));
            KunTagManager.DebugLog(_tag);
            return _tag.value();
        }
        return '';
    };
    /**
     * @param {String} tag 
     * @returns {String}
     */
    next(tag = '') {
        const _tag = this.get(tag);
        return _tag.next() || '';
    }
    /**
     * @param {String} tag
     * @param {Boolean} drop
     * @returns {String}
     */
    tag(tag = '') {
        const _tag = this.get(tag);
        return _tag && _tag.value() || '';
    };
    /**
     * @param {String} tag 
     */
    untag(tag = '') {
        const _tag = this.get(tag);
        if (_tag) {
            if (_tag instanceof KunGameTag) {
                _tag.clear();
                KunTagManager.DebugLog(`TAG ${tag} CLEAR!`);
            }
            else {
                this._tags = this.tags().splice(this.tags().indexOf(_tag), 1);
                //delete this.tagdata()[tag.toUpperCase()];
                KunTagManager.DebugLog(`TAG ${tag} REMOVED!`);
            }
            return true;
        }
        return false;
    }
    /**
     * @returns {KunTagCollection}
     */
    clear() {
        this._tags = this.tags().filter(tag => tag instanceof KunGameTag);
        return this;
    }
}

/**
 * 
 */
class KunTag {
    /**
     * @param {String} name 
     * @param {String[]} values 
     */
    constructor(name, values = []) {
        this._name = name && name.toUpperCase() || 'TAG';
        //this._content = values && values.map( content => content.toLowerCase()) || [];
        this._content = values || [];
        this._tags = [];
    }

    /**
     * @returns {String}
     */
    toString() { return `${this.name()} :: ${this.content().join(' , ')}`; }
    /**
     * @returns {String}
     */
    name() { return this._name; }
    /**
     * @param {String} tag 
     * @returns {Boolean}
     */
    isme(tag = '') { return tag && tag.toUpperCase() === this.name(); }
    /**
     * @returns {String[]}
     */
    content() { return this._content; }
    /**
     * @returns {KunTag[]}
     */
    states() { return this._tags; }
    /**
     * @param {String} state 
     * @returns {KunTag}
     */
    getstate(state = '') { return this.states().find(tag => tag.name() === state) || null; }
    /**
     * @param {String} state 
     * @param {String} value 
     * @returns {Boolean}
     */
    setstate(state = '', value = '') {
        if (state) {
            const tag = value && this.newstate(state) || null;
            if (tag) {
                tag.set(value);
            }
            else {
                this.dropstate(state);
            }
            return true;
        }
        return false;
    }
    /**
     * @param {String} state 
     * @returns {KunTag}
     */
    newstate(state = '') {
        const tag = this.getstate(state) || new KunTag(state);
        !this.hasstate(state) && this.add(tag);
        return tag;
    }
    /**
     * @param {String} state 
     * @returns {KunTag}
     */
    dropstate(state = '') {
        if (this.hasstate(state)) {
            this._tags = this.states().filter(tag => tag.name() !== state);
        }
        return this;
    }
    /**
     * @param {String} state 
     * @returns {Boolean}
     */
    hasstate(state = '') { return !!state && this.states().some(tag => tag.name() === state); }
    /**
     * @param {String} value 
     * @returns {Boolean}
     */
    has(value = '') { return value && (this.content().includes(value) || this.states().some(tag => tag.has(value))) }
    /**
     * @param {String} value lookout for current value in tag and subtags
     * @returns {Boolean}
     */
    is(value = '') { return value && this.value() === value || this.states().some(tag => tag.is(value)); }
    /**
     * @param {KunTag} tag
     * @returns {KunTag}
     */
    add(tag = null) {
        if (tag instanceof KunTag) {
            this.states().push(tag);
        }
        return this;
    }
    /**
     * @param {String} value 
     * @param {Boolean} unique
     * @returns {String}
     */
    set(value = '', unique = false) {
        unique && this.clear(value);
        value && this.content().unshift(value.toString());
        return this.value();
    }
    /**
     * @param {String} value 
     * @returns {Number}
     */
    position(value = '') { return value && this.content().indexOf(value) + 1 || 0; }
    /**
     * @param {String} value 
     * @returns {Boolean}
     */
    drop(value = '') {
        const position = this.position(value);
        return position && !!this.content().splice(position - 1, 1).length || false;
    }
    /**
     * @param {String} value 
     * @returns {Boolean}
     */
    count(value = '') { return value && this.content().filter(item => item === value).length || this.content().length; }
    /**
     * @param {Boolean} remove
     * @returns {String}
     */
    random(remove = false) {
        const item = this.content()[Math.floor(Math.random() * this.count())] || '';
        return !!item ? remove && this.content().splice(this.content().indexOf(item))[0] || item : '';
    }
    /**
     * @returns {String}
     */
    next() {
        this.count() > 1 && this.content().push(this.content().shift());
        return this.value();
    }
    /**
     * @param {String} state Subtag value
     * @returns {String}
     */
    value(state = '') {
        if (state) {
            const tag = this.getstate(state);
            return tag && tag.value() || '';
        }
        return this.content()[0] || '';
    }
    /**
     * @returns {String}
     */
    last() { return this.count() && this.content()[this.count() - 1] || '' }
    /**
     * Clear the tag content
     * @param {String} value (optional) remove only all values matching
     * @returns {KunTag}
     */
    clear(value = '') {
        if (value) {
            this._content = this.content().filter(v => v !== value);
        }
        else {
            this._content = [];
        }
        return this;
    }
    /**
     * @returns {KunTag}
     */
    unsort() {
        const items = this.content().slice();
        items.forEach((item, i) => {
            const r = Math.floor(Math.random() * (i + 1));
            [items[i], items[r]] = [items[r], items[i]];
        });
        this._content = items;
        return this;
    }
    /**
     * @returns {KunTag}
     */
    sort() {
        const items = this.content().slice();
        items.sort();
        this._content = items;
        return this;
    }
    /**
     * @returns {Boolean}
     */
    empty() { return !this.count(); }
}

/**
 * Extends Tags implementing game variable binding, saving features and text/string setups
 */
class KunGameTag extends KunTag {
    /**
     * @param {String} name 
     * @param {String[]} values 
     */
    constructor(name = '', values = []) {
        super(name, values || []);
        this._strings = {};
    }
    /**
     * @returns {KunTagCollection}
     */
    manager() { return KunTagManager.manager().collection(); }

    /**
     * @returns {Object}
     */
    strings() { return this._strings; }
    /**
     * @param {String} string 
     * @param {String} text 
     * @returns {KunTag}
     */
    addtext(string = '', text = '') {
        if (string && text) {
            this._strings[string.toUpperCase()] = text;
        }
        return this;
    }
    /**
     * @param {String} value 
     * @returns {String}
     */
    text(value = '') { return this.strings()[value] || value; }
    /**
     * @param {Boolean} display
     * @returns {String}
     */
    name(display = false) { return display && this.text(super.name()) || super.name(); }
    /**
     * Overrides to provide string display 
     * @param {Boolean} display 
     * @returns {String[]}
     */
    content(display = false) { return display && super.content().map(item => this.text(item)) || super.content(); }
    /**
     * @param {Boolean} display 
     * @returns {String}
     */
    value(display = false) { return display && this.text(super.value()) || super.value(); }
    /**
     * Implements hierarchical count
     * @param {String} item 
     * @param {Boolean} all 
     * @returns {Number}
     */
    count(item = '', all = false) {
        return all && this.children().reduce((count, tag) => count + tag.count(item, true), super.count(item)) || super.count(item);
    }
}


/**
 * DataManager to handle actor's attributes
 */
function KunTags_SetupDataManager() {
    //CREATE NEW
    const _KunTags_DataManager_Create = DataManager.createGameObjects;
    DataManager.createGameObjects = function () {
        _KunTags_DataManager_Create.call(this);
        //new tags
    };
    const _KunTags_DataManager_Save = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function () {
        const contents = _KunTags_DataManager_Save.call(this);
        contents.tagData = KunTagManager.manager().collection().tagdata();
        return contents;
    };
    //LOAD
    const _KunTags_DataManager_Load = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function (contents) {
        _KunTags_DataManager_Load.call(this, contents);
        KunTagManager.manager().collection().load(contents.tagData);
    };
}


/**
 * @class {KunTagCommand}
 */
class KunTagCommand {
    /**
     * @param {String[]} input 
     * @param {Game_Interpreter} context
     */
    constructor(input = [], context = null) {
        this._context = context instanceof Game_Interpreter && context || null;
        this.initialize(input);
        KunTagManager.DebugLog(this);
    }
    /**
     * @param {String[]} input 
     * @returns {String[]}
     * @returns {KunTagCommand}
     */
    initialize(input = '') {
        this._flags = [];
        //prepare input string
        const content = input.join(' ');
        //extract flags
        const regex = /\[([^\]]+)\]/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            match[1].split("|").forEach(flag => this._flags.push(flag.toLowerCase()));
        }
        //return clean args array without flags
        const command = content.replace(regex, '').split(' ').filter(arg => arg.length);
        this._command = command.shift();
        this._args = command;
        return this;
    }
    /**
     * @returns {String}
     */
    toString() { return `${this.command()} ${this.arguments().join(' ')} (${this._flags.join('|')})`; }
    /**
     * @returns {KunTagManager}
     */
    manager() { return KunTagManager.manager(); }
    /**
     * @returns {KunTagCollection}
     */
    tags() { return this.manager().collection(); }
    /**
     * @returns {Game_Interpreter}
     */
    context() { return this._context; }
    /**
     * @returns {String[]}
     */
    arguments() { return this._args; }
    /**
     * @returns {String}
     */
    command() { return this._command; }
    /**
     * @returns {Game_Event}
     */
    event() { return this.context().character() || null; }
    /**
     * @param {String} flag 
     * @returns {Boolean}
     */
    has(flag = '') { return flag && this._flags.includes(flag) || false; }
    /**
     * @param {String[]} labels 
     * @param {Boolean} random 
     * @returns {Boolean}
     */
    jumpToLabels(labels = [], random = false) {
        KunTagManager.DebugLog(`Searching for Label in [${labels.join(',')}]... ${random && '(random)' || '(fallback)'}`);
        return random ?
            //jump to random labels in the list
            this.jumpToLabel(labels.length && labels[Math.floor(Math.random() * labels.length)] || '') :
            //jump to first available label in the list
            labels.find(lbl => this.jumpToLabel(lbl)) || false;
    }
    /**
     * @param {String} label
     * @returns {Boolean}
     */
    jumpToLabel(label = '') {
        const context = this.context();
        if (context && label) {
            const lbl = label.toUpperCase();
            KunTagManager.DebugLog(`Searching for Label [${lbl}]...`);
            for (var i = 0; i < context._list.length; i++) {
                var command = context._list[i];
                if (command.code === 118 && command.parameters[0] === lbl) {
                    context.jumpTo(i);
                    KunTagManager.DebugLog(`Jumping to Label [${lbl}]`);
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * @param {String} mode 
     * @returns {KunTagCommand}
     */
    setWaitMode(mode = '') {
        if (this.context()) {
            //set this to wait for a response
            //this.context()._index++;
            this.context().setWaitMode(mode);
        }
        //this._waitMode = mode;
        return this;
    }
    /**
     * 
     */
    waitMessage() { this.context().setWaitMode('message'); }
    /**
     * @param {Number} fps
     * @returns {Boolean}
     */
    wait(fps = 0) {
        if (this.context() && fps) {
            this.context().wait(fps);
            return true;
        }
        return false;
    }
    /**
     * @returns {Boolean}
     */
    run() {
        const command = `${this.command()}Command`;
        return typeof this[command] === 'function' ?
            this[command](this.arguments().slice()) || false :
            this.defaultCommand(this.arguments().slice());
    }
    /**
     * @param {String} args 
     * @returns {Boolean}
     */
    defaultCommand(args = []) {
        KunTagManager.DebugLog(`Invalid command ${this.toString()} [${args.join(' ')}]`);
        return true;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    tagCommand(args = []) {
        const tagman = this.tags();
        if (args.length > 1) {
            const values = args[1].split(':');
            const tags = args[0].split(':')
            const header = tagman.getnew(tags.shift());
            const value = this.has('random') && values[Math.floor(Math.random() * values.length)] || values[0];
            //toggle tag or subtag, if subtag is not defined, don't update, return false
            const tag = tags.length ? header.states().find(t => t.isme(tags[0])) || null : header;
            if (tag) {
                //then set value, remove duplicates if required
                tag.set(value, this.has('unique'));
                KunTagManager.DebugLog(tag.toString());
                return true;
            }
        }
        else if (args.length) {
            //clear aliases
            return this.clearCommand(args);
        }
        return false;
    }
    /**
     * setup tag:value:value:... [subtag:value:value] [subtag:value:value:...] [subtag:value:value:...]
     * @param {String[]} args 
     * @returns {Boolean}
     */
    setupCommand(args = []) {
        if (args.length) {

            const collection = args.map(data => data.split(':')).map(list => new KunTag(list.shift(), list));
            const header = collection.shift();
            collection.length && collection.forEach(tag => header.add(tag));
            this.tags().add(header);
        }
        return false;
    }
    /**
     * Set a tag state
     * setstate tag:state:[value]
     * @param {String[]} args 
     * @returns {Boolean}
     */
    setstateCommand(args = []) {
        if (args.length > 1) {
            const tag = this.tags().get(args[0]);
            if (tag) {
                tag.setstate(args[1], args[2] || '');
            }
            return true;
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    createCommand(args = []) {
        if (args.length) {
            const list = args[1] && args[1].split(':') || [];
            this.tags().new(args[0], list, this.has('random'));
            return true;
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    chainCommand(args = []) {
        if (args.length) {
            const tag = this.tags().getnew(args[0]);
            const jump = this.has('jump');
            if (tag) {
                const list = args[1] && args[1].split(':') || [];
                if (list.length) {
                    if (tag.value()) {
                        const position = list.indexOf(tag.value()) + 1;
                        const item = position && list[(position) % list.length] || list[0];
                        tag.set(item);
                        KunTagManager.DebugLog(list, position - 1, item, tag);
                    }
                    else {
                        tag.set(list[0]);
                        KunTagManager.DebugLog(list, tag.value());
                    }
                    jump && this.jumpToLabel(tag.value());
                }
                else if (jump) {
                    //will run in a loop after reaching the last value
                    const next = tag.next();
                    return this.jumpToLabel(next);
                }
                return true;
            }
        }
        return false;
    }
    /**
     * clear [tag:tag:tag:...]
     * 
     * remove a tag, list of tags or the whole tag data in runtime game
     * Only GameTags will be preserved
     * 
     * @param {String[]} args 
     * @returns {Boolean}
     */
    clearCommand(args = []) {
        const tagman = this.tags();
        args.length && args[0].split(':').forEach(tag => tagman.untag(tag)) || tagman.clear();
        return true;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    countCommand(args = []) {
        if (args.length > 1) {
            const tag = this.tags().get(args[0]);
            const mapvar = parseInt(args[1]) || 0;
            if (tag && mapvar) {
                $gameVariables.setValue(mapvar, tag.count(args[2] || '', true));
                return true;
            }
        }
        return false;
    }

    /**
     * switch tag:value:value:value:... switch:switch:switch:...
     * @param {String[]} args 
     * @returns {Boolean}
     */
    switchCommand(args = []) {
        if (args.length > 1) {
            const tagman = this.tags();
            const tags = args[0].split(':');
            const tag = tagman.get(tags.shift());
            const is = tags.includes(tag.value());
            const has = !tags.length && tagman.has(tag.name());
            //switches
            args[1].split(':').map(s => parseInt(s)).forEach(s => $gameSwitches.setValue(s, is || has));
            return true;
        }
        return false;
    }

    /**
     * isvar|valueof gamevar:value:value:value label:label
     * @param {String[]} args 
     * @returns {Boolean}
     */
    valueofCommand(args = []) {
        if (args.length) {
            const values = args[0].split(':').map(value => parseInt(value));
            const gamevar = values.shift();
            const value = gamevar && $gameVariables.value(gamevar) || 0;
            const labels = args[1] && args[1].split(':') || [];
            const match = values.length ? values.includes(value) : value > 0;
            if (labels.length) {
                //labels
                return match && this.jumpToLabels(labels, true);
            }
            else {
                //set zero gamevar when doesn't match the list of values
                gamevar && !match && $gameVariables.setValue(gamevar, 0);
                return true;
            }
        }
        return false;
    }
    /**
     * greater [gamevar:value:value:...] [label:label:...]
     * @param {String[]} args 
     * @returns {Boolean}
     */
    greaterCommand(args = []) {
        if (args.length > 1) {
            const values = args[0].split(':').map(value => parseInt(value));
            const gamevar = values.shift();
            if (gamevar) {
                const value = $gameVariables.value(gamevar);
                if (values.length ? values.some(val => value > val) : value > 0) {
                    return this.jumpToLabels(args[1].split(':'), true);
                }
            }
        }
        return false;
    }
    /**
     * lesser [gamevar:value:value:...] [label:label:...]
     * @param {String[]} args 
     * @returns {Boolean}
     */
    lesserCommand(args = []) {
        if (args.length > 1) {
            const values = args[0].split(':').map(value => parseInt(value));
            const gamevar = values.shift();
            if (gamevar) {
                const value = $gameVariables.value(gamevar);
                if (values.length ? values.some(val => value < val) : !value) {
                    return this.jumpToLabels(args[1].split(':'), true);
                }
            }
        }
        return false;
    }


    /**
     * vartag tag value:value:value gamevar
     * TAG:A:B:C:... gamevar [default]
     * SEt a gamevariable value to the position of a given tag by value in the list, or sets to  zero/default when not exists
     * If only one value is providen after the TAG, the gamevar will map the tag's internal value list.
     * @param {String[]} args 
     * @returns {Boolean}
     */
    varmapCommand(args = []) {
        if (args.length > 1) {
            const tagman = this.tags();
            const tags = args[0].split(':');
            const tag = tagman.get(tags.shift());
            const gamevar = parseInt(args[1]);
            const fallback = args[2] && parseInt(args[2]) || 0;
            if (tag) {
                const value = tags.indexOf(tag.value()) + 1;
                $gameVariables.setValue(gamevar, value || fallback );
                return true;
            }
        }
        return false;
    }
    /**
     * has TAG JUMPTO:JUMPTO:JUMPTO:... ELSE:ELSE:ELSE:...
     * @param {String[]} args 
     * @returns {Boolean}
     */
    hasCommand(args = []) {
        if (args.length > 1) {
            const jumpto = args[1].split(':');
            const fallback = args[2] && args[2].split(':') || [];
            const tags = this.tags();
            return tags.has(args[0]) && this.jumpToLabels(jumpto, true) || this.jumpToLabels(fallback, true);
        }
        return false;
    }
    /**
     * CAN TAG:TAG1:TAG2:TAG3:... JUMPTO:JUMPTO:... ELSE:ELSE:...
     * @param {String[]} args 
     */
    canCommand(args = []) {
        if (args.length > 1) {
            const tagman = this.tags();
            const tags = args[0].split(':');
            const jumpto = args[1].split(':');
            const fallback = args[2] && args[2].split(':') || [];
            //get the head tag to lookup for its value in the list...
            const tag = tags.shift();
            //then cast a find on the list of available tags, or false if none
            return !!tags.find(t => tagman.can(tag, t)) && this.jumpToLabels(jumpto, true) || this.jumpToLabels(fallback, true);
        }
        return false;
    }
    /**
     * is|istag tag:value:value:... label:label:... fallback:fallback:...
     * @param {String[]} args 
     * @returns {Boolean}
     */
    isCommand(args = []) {
        if (args.length) {
            const tagman = this.tags();
            const tags = args[0].split(':');
            const jumpto = args[1] && args[1].split(':') || [];
            const fallback = args[2] && args[2].split(':') || [];
            //catch the head tag
            const tag = tags.shift();
            if (!!tags.find(t => tagman.is(tag, t))) {
                //if no labels providen, attempt to jump to the same tag value (add as lone value in the list)
                !jumpto.length && jumpto.push(tag);
                //then match all the values following, to find the current value (jumpto), or false if none (fallback)
                return this.jumpToLabels(jumpto, true);
            }
            return this.jumpToLabels(fallback, true);
        }
        return false;
    }
    /**
     * state tag:state:value label:label:label:...
     * @param {String[]} args 
     * @returns {Boolean}
     */
    stateCommand(args = []) {
        if (args.length) {
            const state = args[0].split(':');
            if (state.length > 1) {
                const tag = this.tags().get(state[0]);
                const value = tag.value(state[1]);
                const match = state[2] ? state[2] === value : tag.hasstate(state[1]);
                if (match) {
                    return !!args[1] && this.jumpToLabels(args[1].split(':'));
                }
            }
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    oneofCommand(args = []) {
        if (args.length > 1) {
            const tags = this.tags();
            const values = args[0].split(':');
            const tag = tags.shift();
            const jumpto = args[1].split(':');
            const fallback = args[2] && args[2].split(':') || [];

            return !!values.find(value => tags.is(tag, value)) ?
                this.jumpToLabels(jumpto, true) :
                this.jumpToLabels(fallback, true);
        }
        return false;
    }
    /**
     * tag:tag:tag:... [intotagname]
     * Compose a tag/label from N tag values then jumps to such label: Tag1_tag2_tag3
     * if no new tag provided, will try to jump to the composed tag value
     * @param {String[]} args 
     * @returns {Boolean}
     */
    combineCommand(args = []) {
        if (args.length) {
            const tagman = this.tags();
            //combine tag values (defaults or not founds will return tag name)
            const label = tagman.combine(args[0].split(':'), args[1] || '_');
            //save into another tag, or jumptolabel if no tag defined
            if (args.length > 2) {
                //save combined tag if required into second parameter
                tagman.add(tagman.getnew(args[2]).set(label));
                return true;
            }
            return this.jumpToLabel(label);
        }
        return false;
    }


    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    chaintagCommand(args = []) { return this.chainCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    taglistCommand(args = []) { return this.createCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    isvarCommand(args = []) { return this.valueofCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    switchtagCommand(args = []) { return this.switchCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    isoneofCommand(args = []) { return this.oneofCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    hastagCommand(args = []) { return this.hasCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    cantagCommand(args = []) { return this.canCommand(args) }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    istagCommand(args = []) { return this.isCommand(args) }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    mapvarCommand(args = []) { return this.varmapCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    vartagCommand(args = []) { return this.varmapCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    dropCommand(args = []) { return this.clearCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    droplabelCommand(args = []) { return this.clearCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    droptagCommand(args = []) { return this.clearCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    islargerCommand(args = []) { return this.greaterCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    isgreaterCommand(args = []) { return this.greaterCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    largerCommand(args = []) { return this.greaterCommand(args); }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    islesserCommand(args = []) { return this.lesserCommand(args); }

    /**
     * @param {String[]} args 
     */
    jumptoCommand(args = []) {
        if (args.length) {
            const tags = this.tags();
            const labels = args[0].split(':').map(tag => tags.value(tag) || tag);
            this.jumpToLabels(labels, this.has('random'));
        }
    }
    /**
     * @param {String[]} args 
     */
    waitCommand(args = []) {
        const wait = args.length && args[0].split(':').map(v => parseInt(v)) || [60];
        switch (true) {
            case wait.length > 2:
                return this.wait(wait[Math.floor(Math.random() * wait.length)]);
            case wait.length > 1:
                return this.wait(wait[0] + wait[Math.floor(Math.random() * wait[1])]);
            default:
                return this.wait(wait[0] || 60);
        }
        return false;
    }
    /**
     * Create a tag menu
     * Can use label captions defined in the pluygin setup for formatting
     * @param {String[]} args 
     * @returns {Boolean}
     */
    tagmenuCommand(args = []) {
        if (args.length) {
            const tag = this.tags().get(args[0]);
            const options = tag.content();
            //im`port and map all labels defined
            const choices = tag.content(true);
            return this.createMenu(choices, args[1], args[2], args[3], function (selected) {
                tag.set(options[selected]);
                KunTagManager.DebugLog(`tagmenu ${tag.name()} set to ${tag.value()}`);
            });
        }
        return false;
    }
    /**
     * @param {String[]} args 
     * @returns {Boolean}
     */
    menuCommand(args = []) {
        if (args.length) {
            const tagman = this.tags();
            const list = args[0].split(':').map(tag => tagman.get(tag));
            //if is KunGameTag will display title instead of name
            const choices = list.map(tag => tag.name(true));
            const _command = this;
            const _invalid = args[4];
            return this.createMenu(choices, args[1], args[2], args[3], function (selected) {
                const tag = list[selected] || null;
                KunTagManager.DebugLog(tag && `Selected Tag Menu Option ${tag.name()}: ${tag.value()}` || `tag invalid ${list[selected] || ''}`);
                tag && _command.jumpToLabel(tag.value()) || _command.jumpToLabel(_invalid);
            });
        }
        return false;
    }


    /**
     * @param {String[]} options 
     * @param {String} cancel 
     * @param {String} background 
     * @param {String} position 
     * @param {Function} callback 
     * @returns {Boolean}
     */
    createMenu(options = [], cancel = '', background = '', position = '', callback = null) {
        const context = this.context();
        if (options.length && typeof callback === 'function' && context) {
            $gameMessage.setChoices(options, 0, this.menuCancelType(cancel || '', options.length));
            $gameMessage.setChoiceBackground(this.getMenuBackground(background || ''));
            $gameMessage.setChoicePositionType(this.getMenuPosition(position || ''));
            $gameMessage.setChoiceCallback(callback.bind(context));
            this.waitMessage();
            return true;
        }
        return false;
    }

    /**
     * @param {String} position 
     * @returns {Number}
     */
    getMenuPosition(position = '') {
        const positions = ['left', 'middle', 'right'];
        return position && positions.includes(position) ? positions.indexOf(position) : 2;
    }
    /**
     * @param {String} bg 
     * @returns {Number}
     */
    getMenuBackground(bg = '') {
        const backgrounds = ['window', 'dim', 'transparent'];
        return bg && backgrounds.includes(bg) ? backgrounds.indexOf(bg) : 2;
    }
    /**
     * @param {String} type 
     * @param {Number} amount 
     * @returns {Number}
     */
    menuCancelType(type = 'skip', amount = 2) {
        switch (type || '') {
            case 'random':
                return Math.floor(Math.random() * amount);
            case 'last':
                return amount - 1;
            case 'skip':
                return -2;
            case 'disable':
                return -1;
            case 'first':
            default:
                return 0;
        }
    };


    /**
     * @param {Game_Interpreter} interpreter 
     * @param {String[]} input 
     * @returns {KunTagCommand}
     */
    static create(interpreter = null, input = []) {
        return interpreter instanceof Game_Interpreter ? new KunTagCommand(input, interpreter) : null;
    }

    /**
     * @returns {Boolean}
     */
    static isCommand(command = '') {
        return ['kuntags', 'kuntag'].includes(command.toLowerCase());
    };
}


/**
 * 
 */
function KunTags_Setup_Command() {
    var _KunTags_PluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunTags_PluginCommand.call(this, command, args);
        if (KunTagCommand.isCommand(command)) {
            KunTagCommand.create(this, args).run();
        }
    }
};



/**
 * 
 */
function KunTags_Setup_EscapeChars() {
    const _KunTags_Escape_Characters = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        return _KunTags_Escape_Characters.call(this, text)
            .replace(/\{TAG:([A-Za-z0-9]+)\}/g, function () {
                return KunTagManager.manager().collection().value(arguments[1]) || '__';
            }.bind(this));
    };
}



(function ( /* autosetup */) {
    KunTagManager.manager();
    KunTags_Setup_EscapeChars();
    KunTags_Setup_Command();
    if (KunTagManager.manager().savetags()) {
        KunTags_SetupDataManager();
    }
})( /* */);

