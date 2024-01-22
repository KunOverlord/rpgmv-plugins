//=============================================================================
// KunQuestLocale.js
//=============================================================================
/*:
 * @plugindesc Kun's Quest Manager Translation Plugin
 * @filename KunQuestLocale.js
 * @version 0.2
 * @author KUN
 * 
 * @help
 * 
 * Use this for KunQuestMan translations
 * 
 * @param debug
 * @type boolean
 * @text Debug Mode
 * @desc use to trace the string loading
 * 
 * @param locale
 * @text Localized Translations
 * @desc Define here the list of available translations for the plugin
 * @type struct<Locale>[]
 */
/*~struct~Locale:
 * @param language
 * @text Language
 * @desc Select the translation language
 * @default en
 * @type select
 * @option English
 * @value en
 * @option Japanese
 * @value jp
 * @option Russian
 * @value ru
 * @option French
 * @value fr
 * @option German
 * @value ge
 * @option Spanish
 * @value es
 * 
 * @param quests
 * @text Quest Translations
 * @desc Type in here all translation strings for the quests
 * @type struct<Quests>[]
 * 
 * @param categories
 * @text Category Translations
 * @desc Define here all translated categories
 * @type struct<Category>[]
 * 
 * @param reward_text
 * @text Reward Text
 * @desc A text header for the quest reward content
 * @type text
 */
/*~struct~Quests:
 * @param name
 * @type text
 * @desc always in lowercase ;)
 * @text Quest ID
 * 
 * @param title
 * @type text
 * @text Quest Title
 * 
 * @param details
 * @type text
 * @text Quest Details
 * 
 * @param reward
 * @type text
 * @text Quest Reward
 * 
 * @param stages
 * @text Quest Stages
 * @type struct<Stage>[]
 */
/*~struct~Stage:
 * @param name
 * @type text
 * @desc always in lowercase ;)
 * @text Stage ID
 * 
 * @param title
 * @type text
 * @text Quest Title
 * 
 * @param details
 * @type text
 * @text Quest Details
 */
/*~struct~Category:
 * @param original
 * @type text
 * @text Original category title
 * 
 * @param translation
 * @type text
 * @text Translated category title
 */

/**
 * Translation Engine
 */
function KunQuestLocale() { throw new Error('This is a static class'); };
/**
 * @param {String} language 
 * @param {String} rewardText
 */
KunQuestLocale.Initialize = function( language , rewardText ){
    this._locale = language || 'en';
    this._rewardText = rewardText || '';
    this._quests = {

    };
    this._categories = {

    };
};
/**
 * @returns Object
 */
KunQuestLocale.Dump = function(){
    return {
        'language': this._locale,
        'quests': this._quests,
        'categories': this._categories,
    };
};
/**
 * @param {String} quest_id 
 * @returns Boolean
 */
KunQuestLocale.hasCategory = function( category ){
    return this._categories.hasOwnProperty( category );
};
/**
 * @param {String} quest_id 
 * @returns Boolean
 */
KunQuestLocale.hasQuest = function( quest_id ){
    return this._quests.hasOwnProperty( quest_id );
};
/**
 * @param {String} quest_id 
 * @param {String} stage_id 
 * @returns Boolean
 */
KunQuestLocale.hasQuestStage = function( quest_id , stage_id ){
    return this.hasQuest( quest_id ) && this._quests[quest_id].stages.hasOwnProperty( stage_id );
};
/**
 * @param {String} quest_id 
 * @param {String} title 
 * @param {String} details 
 * @param {String} reward 
 */
KunQuestLocale.registerQuest = function( quest_id , title, details , reward ){
    if( !this.hasQuest(quest_id)){
        this._quests[quest_id] = {
            'title': title,
            'details': details,
            'reward': reward,
            'stages':{},
        };
    }
    return this;
};
/**
 * @param {String} quest_id 
 * @param {String} stage_id 
 * @param {String} title 
 * @param {String} details 
 */
KunQuestLocale.registerStage = function( quest_id , stage_id, title, details ){
    if( this.hasQuest(quest_id) && !this.hasQuestStage( quest_id , stage_id) ){
        //console.log(`${quest_id}.${stage_id} : ${title} - ${details}`);
        this._quests[quest_id].stages[stage_id] = {
            'title': title,
            'details': details,
        };
    }
    return this;
};
/**
 * @param {String} quest_id 
 * @param {String} title 
 * @param {String} details 
 * @param {String} reward 
 */
KunQuestLocale.registerCategory = function( category , translation ){
    if( !this.hasCategory(category) ){
        this._categories[category] = translation;
    }
    return this;
};
/**
 * @param {Object} input 
 * @returns KunQuestLocale
 */
KunQuestLocale.Import = function( input ){

    //console.log(input);
    var quests = input.hasOwnProperty('quests') && input.quests.length ? JSON.parse(input.quests).map( quest => JSON.parse(quest)) : [];
    var categories = input.hasOwnProperty('categories') && input.categories.length ? JSON.parse(input.categories).map( category => JSON.parse(category)) : [];

    quests.forEach( function( quest ){
        KunQuestLocale.registerQuest( quest.name , quest.title , quest.details , quest.reward );
        ( quest.stages.length ? JSON.parse(quest.stages) : [] ).map( stage => JSON.parse(stage) ).forEach(function( stage ){
            KunQuestLocale.registerStage( quest.name , stage.name , stage.title,  stage.details );
        });
    });

    categories.forEach( function( category){
        KunQuestLocale.registerCategory( category.original , category.translation );
    });

    return this;
};
/**
 * Translate a text content from the quest manager.
 * @param {String} text_id 
 * @param {String} content 
 * @returns String
 */
KunQuestLocale.Translate = function( text_id , content ){

    if( text_id === 'category' ){
        //import category strings
        return this.hasCategory( content ) ? this._categories[content] : content;
    }
    else{
        //import quest strings
        var node = text_id.toLowerCase().split('.');
        if( node.length === 2 ){
            //quest strings
            return this.hasQuest( node[0] ) && this._quests[node[0]].hasOwnProperty(node[1]) ?
                this._quests[node[0]][node[1]] :
                content;
        }
        else if( node.length === 3){
            //stage strings
            return this.hasQuestStage( node[0] , node[1] ) && this._quests[node[0]].stages[node[1]].hasOwnProperty(node[2]) ?
                this._quests[node[0]].stages[node[1]][node[2]] :
                content;
        }
    }

    return content;
};



( function(){

    var params = PluginManager.parameters('KunQuestLocale');
    var language = 'es';

    KunQuestLocale.Initialize( language , params.reward_text );

    var translation = params.locale.length ? JSON.parse(params.locale)
        .map( locale => JSON.parse(locale))
        .filter( locale => locale.language === language ) : [];
    //console.log( translation );
    if( translation.length ){
        KunQuestLocale.Import( translation[0] );
    }
})();


