//=============================================================================
// KunMainThemes.js
//=============================================================================
/*:
 * @filename KunMainThemes.js
 * @plugindesc Random Main Menu Backgrounds
 * @version 1.01
 * @author KUN
 * @target MC | MZ
 * 
 * @help
 * 
 * @param debug
 * @text Debug Data
 * @type boolean
 * @desc Show debug Data and console output
 * @default false
 * 
 * @param themes
 * @text Menu Themes
 * @type struct<Theme>[]
 * @desc Define here all menu layouts to display
 * 
 * @param titleLayout
 * @text Title Layout
 * @type select
 * @option Default
 * @value default
 * @option Top
 * @value top
 * @option Top Left
 * @value topleft
 * @option Top Right
 * @value topright
 * @option Centered
 * @value center
 * @option Center Left
 * @value centerleft
 * @option Center Right
 * @value centerright
 * @option Bottom Left
 * @value bottomleft
 * @option Bottom Right
 * @value bottomright
 * @option Bottom
 * @value bottom
 * @default default
 * 
 * @param titleSize
 * @text Size
 * @parent titleLayout
 * @type number
 * @min 0
 * @default 48
 * 
 * @param titleOverlay
 * @text Overlay
 * @desc Render Game Title over main menu layout
 * @parent titleLayout
 * @type boolean
 * @default false
 * 
 * @param titleFont
 * @text Font
 * @parent titleLayout
 * @type text
 * 
 * @param titleColor
 * @parent titleLayout
 * @text Color
 * @type number
 * @min 0
 * @max 31
 * @default 0
 * 
 * @param titleX
 * @text Horizontal Offset
 * @parent titleLayout
 * @type number
 * @min 0
 * @default 0
 * 
 * @param titleY
 * @text Vertical Offset
 * @parent titleLayout
 * @type number
 * @min 0
 * @default 0
 * 
 * @param titleOutline
 * @text Outline Size
 * @parent titleLayout
 * @type number
 * @min 0
 * @default 0
 * 
 * @param outlineColor
 * @parent titleLayout
 * @text Outline Color
 * @type number
 * @min 0
 * @max 31
 * @default 0
 * 
 * @param multiLineFormat
 * @parent titleLayout
 * @text Multiline Format
 * @type select
 * @option Default
 * @value 0
 * @option Large to Small
 * @value 1
 * @option Small to Large
 * @value 2
 * @default 0
 * 
 * 
 * @param menuLayout
 * @text Menu Layout
 * @type select
 * @option Default
 * @value default
 * @option Top
 * @value top
 * @option Top Left
 * @value topleft
 * @option Top Right
 * @value topright
 * @option Centered
 * @value center
 * @option Center Left
 * @value centerleft
 * @option Center Right
 * @value centerright
 * @option Bottom Left
 * @value bottomleft
 * @option Bottom Right
 * @value bottomright
 * @option Bottom
 * @value bottom
 * @default default
 * 
 * @param optionsLayout
 * @text Options Layout
 * @parent menuLayout
 * @type select
 * @option Left
 * @value left
 * @option Center
 * @value center
 * @option Right
 * @value right
 * @default center
 * 
 * @param boxLayout
 * @parent menuLayout
 * @text Box Layout
 * @type select
 * @option Default (Boxed)
 * @value default
 * @option Horizontal
 * @value horizontal
 * @option Vertical
 * @value vertical
 * @default default
 * 
 * @param grid
 * @parent menuLayout
 * @text Grid
 * @type number
 * @min 2
 * @max 8
 * @default 4
 * 
 * @param menuX
 * @text Horizontal Offset
 * @parent menuLayout
 * @type number
 * @min 0
 * @default 0
 * 
 * @param menuY
 * @text Vertical Offset
 * @parent menuLayout
 * @type number
 * @min 0
 * @default 0
 *
 * @param menuWidth
 * @text Width
 * @parent menuLayout
 * @type number
 * @min 0
 * @default 240
 * 
 * @param menuBackground
 * @text Background
 * @parent menuLayout
 * @type select
 * @option Window
 * @value 0
 * @option Dim
 * @value 1
 * @option None
 * @value 2
 * @default 0
 * 
 * 
 */
/*~struct~Theme:
 * @param tag 
 * @text Tag
 * @type text
 * @desc Won't display, just use it to arrange themes
 * @default theme
 * 
 * @param title
 * @text Layout Title
 * @type text
 * 
 * @param showTitle
 * @text Show Title
 * @desc Show this title in the main menu
 * @type boolean
 * @default false
 * 
 * @param backgrounds
 * @text Backgrounds
 * @desc Select the backgrounds to cycle
 * @type file[]
 * @require 1
 * @dir img/titles1/
 * 
 * @param foregrounds
 * @text Foregrounds
 * @desc Select the foregrounds to cycle
 * @type file[]
 * @require 1
 * @dir img/titles2/
 * 
 * @param bgm
 * @text Music
 * @desc Select the custom music to play
 * @type file[]
 * @require 1
 * @dir audio/bgm/
 * 
 * @param datefrom
 * @type struct<Date>
 * @text Date From
 * 
 * @param dateto
 * @type struct<Date>
 * @text Date To
 */
/*~struct~Date:
 * @param day
 * @text Day
 * @type number
 * @min 1
 * @max 30
 * @default 1
 * 
 * @param month
 * @text Month
 * @type select
 * @option January
 * @value 1
 * @option February
 * @value 2
 * @option March
 * @value 3
 * @option April
 * @value 4
 * @option May
 * @value 5
 * @option June
 * @value 6
 * @option July
 * @value 7
 * @option August
 * @value 8
 * @option September
 * @value 9
 * @option October
 * @value 10
 * @option November
 * @value 11
 * @option December
 * @value 12
 * @default 1
 */


/**
 * @class {KunMainThemes}
 */
class KunMainThemes {

    constructor() {
        if (KunMainThemes.__instance) {
            return KunMainThemes.__instance;
        }

        KunMainThemes.__instance = this.initialize();
    }
    /**
     * @returns {KunMainThemes}
     */
    initialize() {
        const parameters = this.pluginData('KunMainThemes');

        this._debug = parameters.debug;

        this._menuLayout = parameters.menuLayout || 'center';
        this._optionsLayout = parameters.optionsLayout || 'center';
        this._grid = parameters.grid || 4;
        this._menuX = parameters.menuX || 0;
        this._menuY = parameters.menuY || 0;
        this._menuWidth = parameters.menuWidth || 240;
        this._menuBackground = parameters.menuBackground || 0;
        this._boxLayout = parameters.boxLayout || 'default';

        this._titleLayout = parameters.titleLayout || 'center';
        this._titleOverlay = parameters.titleOverlay;
        this._titleWidth = parameters.titleWidth;
        this._titleSize = parameters.titleSize || 48;
        this._titleFont = parameters.titleFont || '';
        this._titleX = parameters.titleX || 0;
        this._titleY = parameters.titleY || 0;
        this._titleOutline = parameters.titleOutline || 0;
        this._outlineColor = parameters.outlineColor || 0;
        this._titleColor = parameters.titleColor || 0;
        this._multiLine = parameters.multiLineFormat || 0;
        //import themes
        this._themes = this.import(parameters.themes);


        return this;
    }

    /**
     * @returns {Object}
     */
    pluginData(plugin = '') {
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

        return _kunPluginReaderV2(plugin, PluginManager.parameters(plugin));
    };


    /**
     * @returns {Boolean}
     */
    titleOverlay() {
        return this._titleOverlay;
    };
    /**
     * @returns {String}
     */
    titleFont() {
        return this._titleFont;
    };
    /**
     * @returns {String}
     */
    titleLayout() {
        return this._titleLayout;
    };
    /**
     * @returns {Number}
     */
    titleWidth() {
        return this._titleWidth;
    };
    /**
     * @returns {Number}
     */
    titleSize() {
        return this._titleSize;
    };
    /**
     * @returns {Number}
     */
    titleX() {
        return this._titleX;
    };
    /**
     * @returns {Number}
     */
    titleY() {
        return this._titleY;
    };
    /**
     * @returns {Number}
     */
    outlineSize() {
        return this._titleOutline;
    };
    /**
     * @returns {Number}
     */
    outlineColor() {
        return this._outlineColor;
    };
    /**
     * @returns {Number}
     */
    titleColor() {
        return this._titleColor;
    };
    /**
     * @returns {Number}
     */
    multiLineFormat() {
        return this._multiLine;
    };

    /**
     * @returns {String}
     */
    optionsLayout() {
        return this._optionsLayout;
    };
    /**
     * @returns {String}
     */
    menuLayout() {
        return this._menuLayout;
    };
    /**
     * @returns {String}
     */
    menuBoxLayout() {
        return this._boxLayout;
    };
    /**
     * @returns {Number}
     */
    menuBackground() {
        return this._menuBackground;
    };
    /**
     * @returns {Number}
     */
    grid(){
        return this._grid;
    }
    /**
     * @returns {Number}
     */
    menuX() {
        return this._menuX;
    };
    /**
     * @returns {Number}
     */
    menuY() {
        return this._menuY;
    };
    /**
     * @returns {Number}
     */
    menuWidth() {
        return this._menuWidth;
    };
    /**
     * @param {Object} input 
     * @returns {Date}
     */
    parseDate(input = null) {
        if (input instanceof Object) {
            const year = (new Date()).getFullYear();
            const month = input.month || 1;
            const day = Math.min(input.day, input.month === 2 && 28 || 30);
            return new Date(year, month - 1, day);
        }
    }
    /**
     * 
     * @param {Object} input 
     * @returns {KunMenuTheme[]}
     */
    import(input = []) {
        return input.map(content => {
            const theme = new KunMenuTheme(
                content.title || '',
                content.showTitle || false,
                this.parseDate(content.datefrom || null),
                this.parseDate(content.dateto || null)
            );
            (content.bgm || []).forEach(bgm => theme.addBgm(bgm));
            (content.backgrounds || []).forEach(picture => theme.addBackground(picture));
            (content.foregrounds || []).forEach(picture => theme.addForeground(picture));
            return theme;
        });
    };
    /**
     * @returns {Boolean}
     */
    debug() {
        return this._debug;
    };
    /**
     * @returns {Number}
     */
    footerSize() {
        return this._footerSize;
    };
    /**
     * @returns {String}
     */
    footerText() {
        return this._footerText;
    };
    /**
     * @returns {Boolean}
     */
    hasFooterText() {
        return this._footerText.length > 0;
    };

    /**
     * @param {KunMenuTheme} menuSet 
     * @returns KunMainThemes
     */
    addTheme(menuSet) {
        if (menuSet instanceof KunMenuTheme) {
            this._themes.push(menuSet);
        }
        return this;
    };
    /**
     * @returns {KunMenuTheme[]}
     */
    themes() { return this._themes; };
    /**
     * @returns {KunMenuTheme[]}
     */
    specialThemes() {
        return this.themes().filter(theme => theme.active());
    };
    /**
     * @returns {KunMenuTheme[]}
     */
    generalThemes() {
        return this.themes().filter(theme => theme.isDefault());
    };
    /**
     * @returns {KunMenuTheme}
     */
    theme() {
        let themes = this.specialThemes();

        if (themes.length === 0) {
            themes = this.generalThemes();
        }

        return themes.length ? themes[Math.floor(Math.random() * themes.length)] : KunMenuTheme.SystemDefault();
    };

    /**
     * @returns {String}
     */
    selectTitleBackground() {
        const images = this._backgrounds.length ? this._backgrounds.slice() : [$dataSystem.title1Name];
        return images.length > 1 ? images[Math.floor(Math.random() * images.length)] : images[0];
    };
    /**
     * @returns {String}
     */
    selectTitleForeground() {
        const images = this._foregrounds.length ? this._foregrounds.slice() : [$dataSystem.title2Name];
        return images.length > 1 ? images[Math.floor(Math.random() * images.length)] : images[0];
    };



    /**
     * @returns {KunMainThemes}
     */
    static manager() {
        return KunMainThemes.__instance || new KunMainThemes();
    }
}

/**
 * @type {KunMainThemes.Layout|String}
 */
KunMainThemes.Layout = {
    Default: 'default',
    Horizontal: 'horizontal',
    Vertical: 'vertical',
};
/**
 * @type {KunMainThemes.Position|String}
 */
KunMainThemes.Position = {
    Default: 'default',
    Top: 'top',
    TopRight: 'topright',
    TopLeft: 'topleft',
    Bottom: 'bottom',
    BottomLeft: 'bottomleft',
    BottomRight: 'bottomright',
    Center: 'center',
    CenterLeft: 'centerleft',
    CenterRight: 'centerright',
};
/**
 * @type {KunMainThemes.Background|Number}
 */
KunMainThemes.Background = {
    Window: 0,
    Dim: 1,
    Transparent: 2,
};
/**
 * @type {String[]} 
 */
KunMainThemes.Colors = [
    'ffffff',
    '20a0d6',
    'ff784c',
    '66cc40',
    '99ccff',
    'ccc0ff',
    'ffffa0',
    '808080',
    'c0c0c0',
    '2080cc',
    'ff3810',
    '00a010',
    '3e9ade',
    'a098ff',
    'ffcc20',
    '000000',
    '84aaff',
    'ffff40',
    'ff2020',
    '202040',
    'e08040',
    'f0c040',
    '4080c0',
    '40c0f0',
    '80ff80',
    'c08080',
    '8080ff',
    'ff80ff',
    '00a040',
    '00e060',
    'a060e0',
    'c080ff',
];


/**
 * @param {String} title 
 * @param {String} bgm 
 * @param {Boolean} showtitle 
 * @param {Date} datefrom
 * @param {Date} dateto
 */
class KunMenuTheme {
    constructor(title = '', showtitle = false, datefrom = null, dateto = null) {
        this._title = title || '';
        this._showTitle = showtitle;
        this._backgrounds = [];
        this._foregrounds = [];
        this._bgm = [];

        this._dates = [
            datefrom instanceof Date && datefrom.getTime() || 0,
            dateto instanceof Date && dateto.getTime() || 0
        ].filter(time => !!time).sort((a, b) => a - b);
    }
    /**
     * @returns {KunMenuTheme} Default System theme setup
     */
    static SystemDefault() {
        return new KunMenuTheme($dataSystem.gameTitle)
            .addBackground($dataSystem.title1Name)
            .addForeground($dataSystem.title2Name)
            .addBgm($dataSystem.titleBgm);
    }
    /**
     * @returns {String}
     */
    title() {
        return this._title.length ?
            this._title.replace('[YEAR]', (new Date().getFullYear())) :
            $dataSystem.gameTitle;
    }
    /**
     * @returns {Number[]}
     */
    timerange() { return this._dates; }
    /**
     * @returns {Date}
     */
    static today() {
        const today = new Date();
        return new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
        );
    }
    /**
     * @returns {Boolean}
     */
    active() {
        const today = KunMenuTheme.today();
        const ranges = this.timerange();
        if (ranges.length > 1) {
            return ranges[0] <= today && today <= ranges[1];
        }
        return ranges[0] && ranges[0] === today || false;
    }
    /**
     * @returns {Boolean}
     */
    show() {
        return this._showTitle;
    }
    /**
     * @returns {String[]}
     */
    bgm() {
        return this._bgm;
    }
    /**
     * @param {String} bgm
     * @returns {KunMenuTheme}
     */
    addBgm(bgm) {
        if (typeof bgm === 'string' && bgm.length) {
            this._bgm.push(bgm);
        }
        return this;
    }
    /**
     * @returns {String}
     */
    music() {
        const bgm = this.bgm().length > 0 ? this.bgm()[Math.floor(Math.random() * this.bgm().length)] : '';
        return this.createBgm(bgm);
    }
    /**
     * @param {String} bgm
     * @returns {Object}
     */
    createBgm(bgm) {
        return {
            "name": typeof bgm === 'string' && bgm.length ? bgm : $dataSystem.titleBgm.name,
            "pan": $dataSystem.titleBgm.pan,
            "pitch": $dataSystem.titleBgm.pitch,
            "volume": $dataSystem.titleBgm.volume
        };
    }
    /**
     * @returns {String[]}
     */
    backgrounds() {
        return this._backgrounds;
    }
    /**
     * @returns {String[]}
     */
    foregrounds() {
        return this._foregrounds;
    }
    /**
     * @param {String} background
     * @returns {KunMenuTheme}
     */
    addBackground(background) {
        if (!this.backgrounds().includes(background)) {
            this._backgrounds.push(background);
        }
        return this;
    }
    /**
     * @param {String} foreground
     * @returns {KunMenuTheme}
     */
    addForeground(foreground) {
        if (!this.foregrounds().includes(foreground)) {
            this._foregrounds.push(foreground);
        }
        return this;
    }
    /**
     * @returns {String}
     */
    background() {
        return this.backgrounds().length ? this.backgrounds()[Math.floor(Math.random() * this.backgrounds().length)] : '';
    }
    /**
     * @returns {String}
     */
    foreground() {
        return this.foregrounds().length ? this.foregrounds()[Math.floor(Math.random() * this.foregrounds().length)] : '';
    }
    /**
     * Is this theme a default theme? (not in a special date)
     * @returns {Boolean}
     */
    isDefault() { return this.timerange().length === 0; }
    /**
     * Is this theme a default theme? (not in a special date)
     * @returns {Boolean}
     */
    isSpecial() { return !!this.timerange().length; }
};

/**
 * 
 */
function KunMainThemes_Title() {
    if (KunMainThemes.manager().titleOverlay()) {
        Scene_Title.prototype.create = function () {
            Scene_Base.prototype.create.call(this);
            this.createBackground();
            this.createWindowLayer();
            this.createCommandWindow();
            this.createForeground();
        };
    }

    Scene_Title.prototype.createBackground = function () {
        const theme = KunMainThemes.manager().theme();
        this._backSprite1 = new Sprite(ImageManager.loadTitle1(theme.background()));
        this._backSprite2 = new Sprite(ImageManager.loadTitle2(theme.foreground()));
        this.addChild(this._backSprite1);
        this.addChild(this._backSprite2);
    };

    Scene_Title.prototype.playTitleMusic = function () {
        const theme = KunMainThemes.manager().theme();
        //AudioManager.playBgm($dataSystem.titleBgm)
        AudioManager.playBgm(theme.music());
        AudioManager.stopBgs();
        AudioManager.stopMe();
    };
    /**
     * 
     */
    Scene_Title.prototype.drawGameTitle = function () {

        const man = KunMainThemes.manager();
        const theme = man.theme();

        const x = this.offsetX();
        let y = this.offsetY();
        const maxWidth = this.titleWidth();

        let lineHeight = this.fontSize();
        const lineFormat = this.lineSize();
        const text = theme.title().split('|');
        const titleSize = this.fontSize();
        const fontFace = this.fontFamily();

        this._gameTitleSprite.bitmap.outlineWidth = this.outline();
        this._gameTitleSprite.bitmap.outlineColor = this.outlineColor();
        this._gameTitleSprite.bitmap.textColor = this.textColor();
        
        if(fontFace){
            this._gameTitleSprite.bitmap.fontFace = fontFace;
        }
        this._gameTitleSprite.bitmap.fontSize = lineHeight;

        for (var i = 0; i < text.length; i++) {
            if (lineFormat > 0) {
                switch (true) {
                    case lineFormat === 1 && i % 2:
                    case lineFormat === 2 && !(i % 2):
                        this._gameTitleSprite.bitmap.fontSize = titleSize / 2;
                        lineHeight = titleSize / 4;
                        break;
                    default:
                        this._gameTitleSprite.bitmap.fontSize = titleSize;
                        lineHeight = titleSize;
                        break;
                }
            }
            this._gameTitleSprite.bitmap.drawText(text[i], x, y, maxWidth, lineHeight, this.align());
            y += lineHeight;
        }
    };
    /**
     * @returns {Number}
     */
    Scene_Title.prototype.lineSize = function () {
        return KunMainThemes.manager().multiLineFormat();
    };
    /**
     * @returns {Number}
     */
    Scene_Title.prototype.align = function () {
        const man = KunMainThemes.manager();
        switch (man.titleLayout()) {
            case KunMainThemes.Position.TopLeft:
            case KunMainThemes.Position.BottomLeft:
            case KunMainThemes.Position.CenterLeft:
                return 'left';
            case KunMainThemes.Position.TopRight:
            case KunMainThemes.Position.BottomRight:
            case KunMainThemes.Position.CenterRight:
                return 'right';
            default:
                return 'center';
        };
    };
    /**
     * @returns {String}
     */
    Scene_Title.prototype.fontFamily = function () {
        return KunMainThemes.manager().titleFont();
    };
    /**
     * @returns {Number}
     */
    Scene_Title.prototype.fontSize = function () {
        return KunMainThemes.manager().titleSize();
    };
    /**
     * @returns {String}
     */
    Scene_Title.prototype.layout = function () {
        return KunMainThemes.manager().titleLayout();
    }
    /**
     * @returns {Number}
     */
    Scene_Title.prototype.outline = function () {
        return KunMainThemes.manager().outlineSize();
    }
    /**
     * @returns {String}
     */
    Scene_Title.prototype.outlineColor = function () {
        const color = KunMainThemes.manager().outlineColor().clamp(0, 31);
        return '#' + KunMainThemes.Colors[color];
    };
    /**
     * @returns {String}
     */
    Scene_Title.prototype.textColor = function () {
        const color = KunMainThemes.manager().titleColor().clamp(0, 31);
        return '#' + KunMainThemes.Colors[color];
    };
    /**
     * @returns {Number}
     */
    Scene_Title.prototype.offsetX = function () {
        return 20 + KunMainThemes.manager().titleX();
    }
    /**
     * @returns {Number}
     */
    Scene_Title.prototype.offsetY = function () {
        const y = KunMainThemes.manager().titleY();
        const grid = KunMainThemes.manager().grid();
        switch (this.layout()) {
            case KunMainThemes.Position.Top:
            case KunMainThemes.Position.TopLeft:
            case KunMainThemes.Position.TopRight:
                return Graphics.height / grid + y;
            case KunMainThemes.Position.Bottom:
            case KunMainThemes.Position.BottomLeft:
            case KunMainThemes.Position.BottomRight:
                return (Graphics.height / grid) * (grid - 1) - y;
            case KunMainThemes.Position.Center:
            case KunMainThemes.Position.CenterLeft:
            case KunMainThemes.Position.CenterRight:
                return (Graphics.height / grid) * (grid / 2) + y;
            default:
                //default original option
                return Graphics.height / 4;
        }
    }
    /**
     * @returns {Number}
     */
    Scene_Title.prototype.titleWidth = function () {
        return Graphics.width - this.offsetX() * 2;
    }
};

/**
 * 
 */
function KunMainThemes_MainMenu() {
    Window_TitleCommand.prototype.updatePlacement = function () {
        this.x = this.offsetX();
        this.y = this.offsetY();
    }
    /**
     * @returns {Number}
     */
    Window_TitleCommand.prototype.offsetX = function () {
        if (this.boxLayout() === KunMainThemes.Layout.Horizontal) {
            return 0;
        }
        const menux = KunMainThemes.manager().menuX();
        switch (this.layout()) {
            case KunMainThemes.Position.TopLeft:
            case KunMainThemes.Position.CenterLeft:
            case KunMainThemes.Position.BottomLeft:
                return menux;
            case KunMainThemes.Position.TopRight:
            case KunMainThemes.Position.CenterRight:
            case KunMainThemes.Position.BottomRight:
                return (Graphics.boxWidth - this.width) - menux;
            case KunMainThemes.Position.Top:
            case KunMainThemes.Position.Center:
            case KunMainThemes.Position.Bottom:
                return this.originalX() + menux;
            default:
                return this.originalX();
        }
    };
    /**
     * @returns {Number}
     */
    Window_TitleCommand.prototype.offsetY = function () {
        if (this.boxLayout() === KunMainThemes.Layout.Vertical) {
            return 0;
        }
        const grid = KunMainThemes.manager().grid();
        const menuy = KunMainThemes.manager().menuY();
        switch (this.layout()) {
            case KunMainThemes.Position.Top:
            case KunMainThemes.Position.TopLeft:
            case KunMainThemes.Position.TopRight:
                return (Graphics.height / grid)  + menuy;
            case KunMainThemes.Position.Bottom:
            case KunMainThemes.Position.BottomLeft:
            case KunMainThemes.Position.BottomRight:
                return (Graphics.height / grid) * (grid - 1) - menuy;
            case KunMainThemes.Position.Center:
            case KunMainThemes.Position.CenterLeft:
            case KunMainThemes.Position.CenterRight:
                return (Graphics.height / grid) * (grid / 2) + menuy;
            default:
                return this.originalY() + menuy;
        }
    };
    /**
     * @returns {Number}
     */
    Window_TitleCommand.prototype.originalX = function () {
        return (Graphics.boxWidth - this.width) / 2;
    };
    /**
     * @returns {Number}
     */
    Window_TitleCommand.prototype.originalY = function () {
        return Graphics.boxHeight - this.height - 96;
    };
    /**
     * @returns {String}
     */
    Window_TitleCommand.prototype.itemTextAlign = function () {
        return KunMainThemes.manager().optionsLayout();
    }
    /**
     * @returns {String}
     */
    Window_TitleCommand.prototype.layout = function () {
        return KunMainThemes.manager().menuLayout();
    }
    /**
     * @returns {String}
     */
    Window_TitleCommand.prototype.boxLayout = function () {
        return KunMainThemes.manager().menuBoxLayout();
    }
    /**
     * @returns {Number}
     */
    Window_TitleCommand.prototype.background = function () {
        return KunMainThemes.manager().menuBackground();
    };
    /**
     * @returns {Number}
     */
    Window_TitleCommand.prototype.windowWidth = function () {
        switch (this.boxLayout()) {
            case KunMainThemes.Layout.Horizontal:
                return Graphics.boxWidth;
            case KunMainThemes.Layout.Vertical:
                return KunMainThemes.manager().menuWidth();
            default:
                return 240;
        }
    };
    /**
     * @returns {Number}
     */
    Window_TitleCommand.prototype.windowHeight = function () {
        switch (this.boxLayout()) {
            case KunMainThemes.Layout.Vertical:
                return Graphics.boxHeight;
            default:
                return this.fittingHeight(this.numVisibleRows());
        };
    };
    /**
     * @returns {Number}
     */
    Window_TitleCommand.prototype.verticalLayout = function () {
        switch (this.layout()) {
            case KunMainThemes.Position.Top:
            case KunMainThemes.Position.TopLeft:
            case KunMainThemes.Position.TopRight:
                return 0;
            case KunMainThemes.Position.Center:
            case KunMainThemes.Position.CenterLeft:
            case KunMainThemes.Position.CenterRight:
                return (Graphics.boxHeight / 2) - this.fittingHeight(this.numVisibleRows()) / 2;
            case KunMainThemes.Position.Bottom:
            case KunMainThemes.Position.BottomLeft:
            case KunMainThemes.Position.BottomRight:
                return Graphics.boxHeight - this.fittingHeight(this.numVisibleRows());
        }
    };
    /**
     * @param {Number} index 
     * @returns Rectangle
     */
    Window_TitleCommand.prototype.itemRect = function (index) {
        const rect = new Rectangle();
        const maxCols = this.maxCols();
        rect.width = this.itemWidth();
        rect.height = this.itemHeight();
        rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX;
        //rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY;
        rect.y = (Math.floor(index / maxCols) * rect.height) + this.verticalLayout();
        return rect;
    };

    const _KunMainThemes_TitleCommand_Override = Window_TitleCommand.prototype.initialize;
    Window_TitleCommand.prototype.initialize = function () {
        _KunMainThemes_TitleCommand_Override.call(this);
        this.setBackgroundType(this.background());
    }
}


/* PLUGIN SETUP */
(function () {
    KunMainThemes.manager();
    KunMainThemes_Title();
    KunMainThemes_MainMenu();
})();



