//=============================================================================
// KunLibrary.js
//=============================================================================
/*:
 * @plugindesc KunLibrary
 * @filename KunLibrary.js
 * @author KUN
 * 
 * @help
 * 
 * COMMANDS:
 * 
 *      KunTouch VarId X Y width height [decrease:false]
 *          Define a clickable area
 * 
 *      KunTouch rect VarId top-left-X top-left-Y bottom-right-X bottom-right-Y [decrease:false]
 *          Define a clickable area using the top-left and bottom-right corners (easy to use with capture key)
 * 
 *      KunTouch capture
 *          Notify the clicked coordinates into the console
 * 
 *      KunTouch offset X Y
 *          Set an offset to the exportable game variables for X and Y position
 * 
 *      KunTouch clear
 *          Clear all clickable areas
 *
 * 
 * @param debug
 * @text Debug
 * @desc Show debug info
 * @type Boolean
 * @default false
 * 
 * @param library
 * @type struct<Book>[]
 * 
 * @param sfx
 * @text Read SFX
 * @desc Play this sound when opening a book
 * @type file
 * @require 1
 * @dir audio/se/
 * 
 * @param background
 * @text Background
 * @desc Show this image background
 * @type file
 * @require 1
 * @dir img/pictures/
 * 
 */
/*~struct~Book:
 * @param book_id
 * @text Book ID
 * @type text
 * 
 * @param title
 * @text Title
 * @type text
 * 
 * @param chapters
 * @text Pages
 * @type Note[]
 * 
 * @param author
 * @text Author
 * @type Text
 * 
 * @param description
 * @text Description 
 * @type Note
 * 
 * @param switchVar
 * @text Unlock by Switch
 * @type Switch
 * @default 0
 *
 */

/**
 * @description KUN Modules
 * @type KUN
 */
var KUN = KUN || {};


function KunLibrary(){

    var _library = {
        'books': {},
        'background': '',
        'media': '',
        'debug': false,
    };
    this.Set = {
        'Media' : media => _library.media = media || '',
        'Background' : bg => _library.background = bg || '',
        'Debug': debug => _library.debug = typeof debug === 'boolean' && debug,
    };
    /**
     * @returns Object
     */
    this.dump = () => _library;
    /**
     * @param {Boolean} asList 
     * @returns Array | Object
     */
    this.list = asList => typeof asList === 'boolean' && asList ? Object.keys( _library.books ) : _library.books;
    /**
     * @returns KunLibrary
     */
     this.playMedia = function(){
        if(   _library.media.length ){
            AudioManager.playSe({name: _library.media, pan: 0, pitch: 100, volume: 100});
        }
        return this;
    }
    /**
     * @param {Boolean} show 
     * @returns KunLibrary
     */
    this.showBackground = function( show ){

        return this;
    };
    /**
     * @param {String} book_id 
     * @returns Boolean
     */
    this.has = book_id => _library.books.hasOwnProperty( book_id );
    /**
     * @param {String} book_id 
     * @param {String} title 
     * @param {String} contents 
     * @param {String} description 
     * @param {String} author 
     * @param {Number} switchVar
     * @returns KunLibrary
     */
    this.addBook = function( book_id , title , contents , description , author , switchVar ){

        if( !this.has( book_id ) ){
            _library.books[ book_id ] = {
                'id': book_id,
                'title': title,
                'pages': Array.isArray( contents ) ? contents : [ contents ],
                'description': description,
                'author': author,
                'switch': parseInt( switchVar ),
            };
        }

        return this;
    };
    /**
     * @param {String} bookd_id 
     * @returns Number
     */
    this.switchVar = function( bookd_id ){
        return this.has( bookd_id ) ? _library.books[bookd_id].switchVar : 0;
    };
    /**
     * @param {String} book_id 
     * @returns Boolean
     */
    this.unlocked = function( book_id ){
        return this.has( book_id ) && _library.books[book_id].switchVar > 0 ? $gameSwitches.value(_library.books[book_id].switchVar) : false;
    };
    /**
     * @param {String} book_id 
     * @param {Boolean} playMedia
     * @returns KunLibrary
     */
    this.unlock = function( book_id , playMedia ){
        if( this.has( book_id ) ){
            $gameSwitches.setValue(_library.books[book_id].switchVar , true );
            if( typeof playMedia === 'boolean' && playMedia ){
                this.playMedia();
            }
        } 
        return this;
    };
    /**
     * @returns KunLibrary
     */
    this.reset = function( ){
        this.list(true).forEach( function(book_id){
            $gameSwitches.setValue( _library.books[ book_id ].switchVar , false );
        });
        return this;
    };
    /**
     * @param {String} book_id 
     * @returns Object
     */
    this.get = function( book_id ){
        return this.has( book_id ) ? _library.books[ book_id ] : null;
    }

    return this;
}

/**
 * @param {String} book_id 
 * @param {Boolean} unlock 
 * @returns Boolean
 */
function kun_library_read( book_id , unlock ){
    unlock = typeof unlock === 'boolean' && unlock;
    var book = KUN.Library.get(book_id);
    if( book !== null ){
        if( Boolean.unlocked || unlock ){
            console.log(book);
            KUN.Library.playMedia();
            return true;    
        }
    }
    return false;
}
/**
 * @param {String} book_id 
 */
function kun_library_unlock( book_id  ){
    KUN.Library.unlock( book_id ).playMedia();
}


function KunLibrary_SetupInterpreter(){
    //override vanilla
    var _KunQuestMan_Interpreter_Command = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _KunQuestMan_Interpreter_Command.call(this, command, args);
        if( command === 'KunLibrary' ){
            //override with plugin command manager
            if( args.length ){
                switch( args[0] ){
                    case 'unlock':
                        if( args.length > 1 ){
                            kun_library_unlock( args[1]);
                        }
                        break;
                    case 'reset':
                        KUN.Library.reset();
                        break;
                    default:
                        kun_library_read( args[0] );
                        break;
                }    
            }
            else{
                //list
            }
        }
    };
}


/********************************************************************************************************************
 * 
 * INITIALIZER
 * 
 *******************************************************************************************************************/

 (function( /* args */ ){

    var parameters = PluginManager.parameters('KunLibrary');

    KUN.Library = new KunLibrary();
    KUN.Library.Set.Debug( parameters.debug === 'true' );
    KUN.Library.Set.Background( parameters.background === 'true' );
    KUN.Library.Set.Media( parameters.sfx );

    if( parameters.library.length ){
        JSON.parse( parameters.library ).forEach( function( item ){
            var book = JSON.parse(item);
            KUN.Library.addBook(
                 book.book_id,
                 book.title,
                 book.chapters.length > 0 ? JSON.parse(book.chapters).map( function( page ){ return page.replace("\"","") }) : [],
                 book.author,
                 book.description.replace("\"",'') ,
                 book.switchVar );
        });
    }

    console.log( KUN.Library.dump());

    KunLibrary_SetupInterpreter();

})( /* initializer */ );



