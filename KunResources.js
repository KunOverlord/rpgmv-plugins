//=============================================================================
// KunResources.js
//=============================================================================
/*:
 * @plugindesc Add custom party resources, managed outside, of the game variables and switches to keep a clean setup for extra vars and assets.
 * @filename KunResources.js
 * @author Kun
 * @version 1.0
 * 
 * @help
 * 
 * COMMANDS
 * 
 * @param debug
 * @text Debug
 * @desc Which text to show when the character arouses up
 * @type Boolean
 * @default false
 * 
 * @param header
 * @type text
 * @desc Default header window title
 * @default Resources
 * 
 * @param lockedIcon
 * @text Locked Icon
 * @desc Show locked icons instead of the gameswith item icons
 * @type number
 * @default 0
 * 
 * @param pages
 * @type struct<Page>[]
 * @text Resource Pages
 * @desc Define here the list of special attributes for each char.
 *
 */
/*~struct~Page:
 * @param name
 * @text Resource Name
 * @type text
 * @default general
 * 
 * @param title
 * @text Display Title
 * @type text
 * @default General
 * 
 * @param icon
 * @text Display Icon
 * @type number
 * @default 0
 * 
 * @param hide
 * @text Hide empty items
 * @desc Show items when non empty (zero|false)
 * @type boolean
 * @defaulg false
 * 
 * @param display
 * @text Display Type
 * @desc Show items as gauges, counters and only names
 * @type select
 * @option None
 * @value none
 * @option Value
 * @value value
 * @option Gauge
 * @value gauge
 * @default value
 * 
 * @param items
 * @text Items
 * @desc Resource Items
 * @type struct<Item>[]
 */
/*~struct~Item:
 * @param name
 * @text Content Name
 * @type text
 * @default item
 * 
 * @param title
 * @text Content Title
 * @type text
 * @default Item
 * 
 * @param id
 * @text Resource Id
 * @desc Item Variable
 * @type number
 * @min 1
 * 
 * @param type
 * @text Resource Type
 * @type select
 * @option Game Variable
 * @value variable
 * @option Game Switch
 * @value switch
 * @default variable
 * 
 * @param range
 * @text Range/Maximum
 * @type number
 * @min 0
 * @default 0
 * 
 * @param icon
 * @text Content Icon
 * @type number
 * @default 0
 * 
 * @param color1
 * @text Color 1
 * @type number
 * @min 0
 * @max 31
 * @default 0
 * 
 * @param color2
 * @text Color 2
 * @type number
 * @min 0
 * @max 31
 * @default 0
 */

/**
 * @class {KunResources}
 */
class KunResourceManager {
    /**
     * 
     */
    constructor() {

        if (KunResourceManager.__instance) {
            return KunResourceManager.__instance;
        }

        KunResourceManager.__instance = this.initialize();
    }
    /**
     * @returns {KunResourceManager}
     */
    initialize() {

        const _parameters = KunResourceManager.PluginData();

        this._debug = _parameters.debug || false;
        this._header = _parameters.header || 'Resources';
        this._lockedIcon = _parameters.lockedIcon || 0;
        this._content = this.importCategories(_parameters.pages || []);

        return this;
    }
    /**
     * @param {Object[]} input 
     * @returns {Object}
     */
    importCategories(input = []) {

        const pages = {};

        input.forEach(content => {
            const page = new KunItemPage(
                content.name,
                content.title || content.name,
                content.icon || 0,
                content.hide || false,
                content.display || '',
            )
            //const flags = Array.isArray(content.switches) && content.switches || [];
            //const counters = Array.isArray(content.counters) && content.counters || [];
            const items = Array.isArray(content.items) && content.items || [];
            items.forEach(item => {
                page.add(new KunItem(
                    item.name || 'Item',
                    item.title || item.name,
                    item.id || 0,
                    item.type || KunItem.Type.GameVariable,
                    item.range || 0,
                    item.icon || 0,
                    item.color1 || 0,
                    item.color2 || 0,
                ));
            });
            if (!pages.hasOwnProperty(page.name())) {
                pages[page.name()] = page;
            }
        });

        return pages;
    }
    /**
     * @returns {Boolean}
     */
    debug() {
        return this._debug;
    }
    /**
     * @returns {Number}
     */
    locked() {
        return this._lockedIcon;
    }
    /**
     * @returns {String}
     */
    header() {
        return this._header;
    }
    /**
     * @returns {Object}
     */
    content() {
        return this._content;
    }
    /**
     * @returns {KunItemPage[]}
     */
    pages() {
        return Object.values(this.content());
    }
    /**
     * @param {String} name 
     * @returns {KunItemPage}
     */
    get(name = '') {
        return this.content()[name] || null;
    }
    /**
     * @returns {String[]}
     */
    list() {
        return this.pages().map(page => page.name());
    }
    /**
     * @returns {KunResourceManager}
     */
    reset() {
        this.pages().forEach(page => page.reset());
        return this;
    }


    /**
     * @return {Object}
     */
    static PluginData() {
        function _kunPluginParser(key = '', value = '') {
            if (typeof value === 'string' && value.length) {
                try {
                    if (/^\{.*\}$|^\[.*\]$/.test(value)) {
                        return JSON.parse(value, _kunPluginParser);
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
                    return value.map(item => _kunPluginParser(key, item));
                }
                const content = {};
                Object.keys(value).forEach(key => content[key] = _kunPluginParser(key, value[key]));
                //console.log(key,content);
                return content;
            }
            return value;
        };

        return _kunPluginParser('KunResources', PluginManager.parameters('KunResources'));
    };

    /**
     * @param {String}
     * @returns {String[]}
     */
    static Command(command = '') {
        return ['kunresourcemanager', 'resourcemanager', 'kunresources'].includes(command.toLowerCase());
    }

    /**
     * @param {String} title
     * @param {String[]} categories
     */
    static Show(title = '', categories = []) {
        SceneManager.push(Scene_KunResources);
        if (SceneManager.isSceneChanging()) {
            SceneManager.prepareNextScene(title.replace(/_/ig, ' '), categories);
        }
    }

    /**
     * @returns {KunResourceManager}
     */
    static manager() {
        return KunResourceManager.__instance || new KunResourceManager();
    }
}


/**
 * @class {KunItemPage}
 */
class KunItemPage {
    /**
     * @param {String} name 
     * @param {String} title 
     * @param {Number[]} items 
     * @param {Number} icon 
     * @param {Boolean} hide
     * @param {String} display
     */
    constructor(name = '', title = '', icon = 0, hide = false, display = '') {
        this._name = name || 'Category';
        this._title = title || this.name();
        this._icon = icon || 0;
        this._hide = hide || false;
        this._items = {};
        this._display = display || KunItemPage.Display.Value;
    }
    /**
     * @returns {String}
     */
    name() {
        return this._name;
    }
    /**
     * @returns {String}
     */
    title() {
        return this._title;
    }
    /**
     * @returns {Boolean}
     */
    hide() {
        return this._hide;
    }
    /**
     * @returns {String}
     */
    display() {
        return this._display;
    }
    /**
     * @returns {Object}
     */
    content() {
        return this._items;
    }
    /**
     * @returns {Number}
     */
    icon() {
        return this._icon;
    }
    /**
     * @param {String} item 
     * @returns {Boolean}
     */
    has(item = '') {
        return item && this.content().hasOwnProperty(item);
    }
    /**
     * @param {Boolean}
     * @returns {KunItem[]}
     */
    items(unhide = false) {
        return Object.values(this.content()).filter(item => item.value() || !this.hide() || unhide);
    }
    /**
     * @param {KunItem} item 
     * @returns {KunItemPage}
     */
    add(item = null) {
        if (item instanceof KunItem && !this.has(item.name())) {
            this.content()[item.name()] = item;
        }
        return this;
    }
    /**
     * @param {String} name 
     * @returns {KunItem}
     */
    get(name = '') {
        return this.has(name) && this.content()[name] || null;
    }
    /**
     * @returns {KunItemPage}
     */
    reset() {
        this.items(true).forEach(item => item.reset());
        return this;
    }
}

/**
 * none|value|gauge
 * @type {KunItemPage.Display|String}
 */
KunItemPage.Display = {
    None: 'none',
    Value: 'value',
    Gauge: 'gauge',
};

/**
 * @class {KunItem}
 */
class KunItem {
    /**
     * @param {String} name 
     * @param {String} title 
     * @param {Number} id 
     * @param {String} type (variable|switch)
     * @param {Number} range
     * @param {Number} icon 
     * @param {Number} color1
     * @param {Number} color2
     */
    constructor(name = 'resource', title = '', id = 1, type = '' ,range = 0, icon = 0, color1 = 0, color2 = 0) {
        this._type = type || KunItem.Type.GameVariable;
        this._name = name;
        this._title = title || this.name();
        this._id = id || 1;
        this._icon = icon || 0;
        this._color1 = color1;
        this._color2 = color2;
        this._range = this.type() === KunItem.Type.GameSwitch && 1 || range || 0;
    }
    /**
     * @returns {String}
     */
    type() {
        return this._type;
    }
    /**
     * @returns {String}
     */
    name() {
        return this._name;
    }
    /**
     * @returns {String}
     */
    title() {
        return this._title;
    }
    /**
     * @returns {Number}
     */
    id() {
        return this._id;
    }
    /**
     * @returns {Number|Boolean}
     */
    value() {
        switch (this.type()) {
            case KunItem.Type.GameVariable:
                return $gameVariables.value(this._id);
            case KunItem.Type.GameSwitch:
                return $gameSwitches.value(this._id);
        }
        return 0;
    }
    /**
     * @returns {Boolean}
     */
    empty(){
        return !this.value();
    }
    /**
     * @returns {Number}
     */
    range() {
        return this._range;
    }
    /**
     * @returns {Number}
     */
    progress() {
        return this.range() && this.value() / this.range() || 0;
    }
    /**
     * @returns {KunItem}
     */
    reset() {
        switch(this.type()){
            case KunItem.Type.GameVariable:
                $gameVariables.setValue(this._id, 0);
                break;
            case KunItem.Type.GameVariable:
                $gameSwitches.setValue(this._id,false);
                break;
        }
        return this;
    }

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
}
/**
 * @type {KunItem.Type|String}
 */
KunItem.Type = {
    GameVariable: 'variable',
    GameSwitch: 'switch',
};


/**********************************************************************************************
 * SCENE AND WINDOW SETUP
 *********************************************************************************************/


/**
 * @class {Scene_KunResources}
 */
class Scene_KunResources extends Scene_ItemBase {
    constructor() {
        super();
        this._title = '';
        this._pages = [];
    }
    /**
     * @returns {String}
     */
    title() {
        return this._title;
    }
    /**
     * @returns {KunItemPage}
     */
    pages() {
        return this._pages;
    }
    /**
     * 
     */
    create() {
        super.create();
        this._headerWindow = new Window_KunCategoryHeader();
        this._listWindow = new Window_KunCategoryList();
        this._contentWindow = new Window_KunCategoryContent();
        this._headerWindow.setHeader(this.title());
        this._listWindow.setHelpWindow(this._contentWindow);
        this._listWindow.setContents(this.pages());

        this._listWindow.setHandler('cancel', this.onQuit.bind(this));
        this._listWindow.setHandler('ok', this.onSelect.bind(this));

        this.addWindow(this._headerWindow);
        this.addWindow(this._listWindow);
        this.addWindow(this._contentWindow);
        //console.log('CREATE',this.title(),this.pages());
    }
    onQuit() {
        this._listWindow.deselect();
        this.popScene();
    }
    onSelect() {
        this._listWindow.activate();
    }
    /**
     * @param {String} title 
     * @param {String[]} pages 
     */
    prepare(title = '', pages = []) {
        const _manager = KunResourceManager.manager();
        this._title = title || _manager.header();
        this._pages = pages.length ? pages
            .map(page => _manager.get(page))
            .filter(page => !!page) : _manager.pages();
        //console.log('PREPARE',this._title,this._pages);
    }
}
/**
 * @class {Window_KunCategoryHeader}
 */
class Window_KunCategoryHeader extends Window_Base {
    /**
     * 
     */
    constructor() {

        super(
            Window_KunCategoryHeader.X(),
            Window_KunCategoryHeader.Y(),
            Window_KunCategoryHeader.Width(),
            Window_KunCategoryHeader.Height(),
        );

        this.setHeader();
    }
    /**
     * @param {String} header 
     */
    setHeader(header = '') {
        this._title = header || KunResourceManager.manager().header();
        this.refresh();
    }
    /***
     * 
     */
    refresh() {
        if (this.contents) {
            this.contents.clear();
            this.drawText(this._title, this.textPadding(), 0, Graphics.boxWidth, 'center');
        }
    };
    standardFontSize() {
        return super.standardFontSize() * 1.8;
    }
    /**
     * @returns {Number}
     */
    static X() {
        return 0;
    }
    /**
     * @returns {Number}
     */
    static Y() {
        return 0;
    }
    /**
     * @returns {Number}
     */
    static Width() {
        return Graphics.boxWidth;
    }
    /**
     * @returns {Number}
     */
    static Height() {
        return 96;
    }
}
/**
 * @class {Window_KunCategoryList}
 */
class Window_KunCategoryList extends Window_Selectable {
    /**
     * 
     */
    constructor() {

        const x = Window_KunCategoryList.X();
        const y = Window_KunCategoryList.Y();
        const w = Window_KunCategoryList.Width();
        const h = Window_KunCategoryList.Height();
        super(x, y, w, h);
        this._items = [];
    }
    /**
     * @returns {KunResourceManager}
     */
    manager() {
        return KunResourceManager.manager();
    }
    /**
     * @returns {Boolean}
     */
    single() {
        return this.items().length < 2;
    }
    /**
     * @returns {KunItem}
     */
    first() {
        return this.items()[0] || null;
    }
    /**
     * @param {KunItemPage[]} pages 
     */
    setContents(pages = []) {
        this._items = Array.isArray(pages) && pages || [];
        if (this.single()) {
            this.hide();
            if (this._helpWindow) {
                this._helpWindow.setFullWidth();
            }
            this.setHelpWindowItem(this.first());
            //this.deactivate();
            this.deselect();
        }
        else {
            this.select(0)
        }
        this.activate();
        this.refresh();
        if (this._helpWindow) {
            this._helpWindow.refresh();
        }
    }
    /**
     * @returns {Number}
     */
    static X() {
        return 0;
    }
    /**
     * @returns {Number}
     */
    static Y() {
        return Window_KunCategoryHeader.Height();
    }
    /**
     * @returns {Number}
     */
    static Width() {
        return 256;
    }
    /**
     * @returns {Number}
     */
    static Height() {
        return Graphics.boxHeight - Window_KunCategoryList.Y();
    }
    /**
     * @returns {KunItemPage[]}
     */
    items() {
        return this._items || [];
    }
    /**
     * @returns {Number}
     */
    maxItems() {
        return this.items().length;
    }
    /**
     * @returns {Boolean}
     */
    empty() {
        return this.items().length === 0;
    }
    /**
     * @param {Number} index 
     * @returns {KunItemPage}
     */
    getItem(index = 0) {
        return !this.empty() ? this.items()[Math.max(index % this.items().length, 0)] : null;
    }
    /**
     * @param {Number} index 
     */
    select(index = 0) {
        super.select(index);
        super.setHelpWindowItem(this.getItem(index));
    }
    /**
     * @param {Number} index 
     */
    drawItem(index = 0) {
        const page = this.getItem(index);
        if (page) {
            //rebder all item contents
            const rect = this.itemRect(index);
            //const icon = page.icon();
            this.drawText(page.title(),
                rect.x,
                rect.y,
                rect.width,
                'left'
            );
            //this._helpWindow.setItem( page );
        }
    }
}
/**
 * @class {Window_KunCategoryContent}
 */
class Window_KunCategoryContent extends Window_Base {
    /**
     * 
     */
    constructor() {
        super(
            Window_KunCategoryContent.X(),
            Window_KunCategoryContent.Y(),
            Window_KunCategoryContent.Width(),
            Window_KunCategoryContent.Height()
        );

        this._page = null;
        this._showAll = KunResourceManager.manager().debug();
    }

    /**
     * @returns {Number}
     */
    static X() {
        return Window_KunCategoryList.Width();
    }
    /**
     * @returns {Number}
     */
    static Y() {
        return Window_KunCategoryHeader.Height();
    }
    /**
     * @returns {Number}
     */
    static Width() {
        return Graphics.boxWidth - Window_KunCategoryContent.X();
    }
    /**
     * @returns {Number}
     */
    static Height() {
        return Graphics.boxHeight - Window_KunCategoryContent.Y();
    }
    /**
     * 
     */
    setFullWidth() {
        this.move(0,
            Window_KunCategoryContent.Y(),
            Graphics.boxWidth,
            Window_KunCategoryContent.Height()
        );
        //this.refresh();
    }
    /**
     * @param {KunItemPage} item 
     */
    setItem(item = null) {
        if (item instanceof KunItemPage) {
            this._page = item || null;
            this.refresh();
        }
    }
    /**
     * @returns {KunItemPage}
     */
    page() {
        return this._page;
    }
    /**
     * @param {Boolean}
     * @returns {KunItem[]}
     */
    items(unhide = false) {
        return this.page() && this.page().items(unhide) || [];
    }
    /**
     * @returns {Boolean}
     */
    hideEmpty(){
        return this.page() && this.page().hide() || false;
    }
    /**
     * @returns {Boolean}
     */
    isDebug(){
        return KunResourceManager.manager().debug();
    }
    /**
     * @returns {Boolean}
     */
    showDebug(){
        return this.isDebug() && this.hideEmpty();
    }
    /**
     * 
     */
    clear() {
        //this._item = null;
        this.refresh();
    }
    /**
     * 
     */
    refresh() {
        if (this.contents) {
            this.contents.clear();
            this.drawAllItems();
        }
    }
    /**
     * 
     */
    drawAllItems() {
        this.items(this._showAll).forEach((item, index) => {
            this.drawItem(item, index);
        });
    }
    /**
     * @param {KunItem} item 
     * @param {Number} index 
     */
    drawItem(item = null, index = 0) {
        if (item instanceof KunItem) {
            const width = this.contentsWidth();
            const middle = width / 3;
            const x = 0;
            const y = this.lineHeight() * 1.2 * index;
            const icon = this.itemIcon(item);
            const display = item.type() !== KunItem.Type.GameSwitch && this.page().display() || KunItemPage.Display.None;
            const color1 = this.textColor(item.color1());
            const color2 = this.textColor(item.color2());
            if (icon) {
                this.drawIcon(icon, x + 2, y + 2);
            }
            this.changeTextColor( item.empty() ? this.textColor(7) : color1 );
            this.drawText(item.title(), x + 40, y, this.textWidth(item.title()), 'left');
            this.changeTextColor( item.empty() ? this.textColor(7) : color2 );
            switch (display) {
                case KunItemPage.Display.Gauge:
                    //Window_Base.prototype.drawGauge = function(x, y, width, rate, color1, color2) {
                    this.drawGauge(x + middle * 2, y - 8, middle, item.progress(), color1, color2 );
                    break;
                case KunItemPage.Display.Value:
                    this.drawText(item.value(), x + middle * 2, y, middle, 'right');
                    break;
                default:
                    break;
            }
            this.resetTextColor();
        }
    }
    /**
     * @param {KunItem} item 
     * @returns {Number}
     */
    itemIcon(item = null) {
        if (item instanceof KunItem) {
            if (item.type() === KunItem.Type.GameSwitch) {
                return KunResourceManager.manager().locked();
            }
            return item.icon();
        }
        return 0;
    }
    /**
     * @param {KunItem} item 
     * @returns {String}
     */
    itemValue(item = null) {
        if (item instanceof KunItem) {
            return item.type() === KunItem.Type.GameSwitch ? '' : item.value().toString();
        }
        return '';
    }
    drawItemGauge(item = null) {
        if (item instanceof KunItem) {
        }
    }
}





/**
 * 
 */
function KunResources_SetupCommands() {
    const _KunResources_GameInterpreter_PluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _KunResources_GameInterpreter_PluginCommand.call(this, command, args);
        if (KunResourceManager.Command(command)) {
            const _manager = KunResourceManager.manager();
            if (args && args.length) {
                switch (args[0]) {
                    case 'show':
                        KunResourceManager.Show(
                            args[1] || '',
                            args[2] && args[2].split(':') || []
                        );
                        break;
                    case 'reset':
                        _manager.reset();
                        break;
                }
            }
        }
    };
};


(function () {

    KunResourceManager.manager();

    KunResources_SetupCommands();
})();




