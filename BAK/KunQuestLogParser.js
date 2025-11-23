//=============================================================================
// KunQuestLogParser.js
//=============================================================================
/*:
 * @plugindesc QuestMan to QuestLog Parser
 * @filename KunQuestLogParser.js
 * @version 0.1
 * @author KUN
 * 
 * @help
 * 
 * @param debug
 * @text Debug Mode
 * @desc Show debug info and hidden quests
 * @type boolean
 * @on Enable
 * @off Disable
 * @default false
 * 
 * @param categories
 * @type struct<Category>[]
 * @text Category Parsers
 * @desc copy here all categories to be restored to the new plugin
 */
/*~struct~Category:
 * @param category
 * @text Category
 * @desc Unique category name to organize the quests
 * @type text
 * @default Main
 * 
 * @param title
 * @text Category Title
 * @desc Category Text to show in the quest log header
 *
 * @param color
 * @text Color
 * @type Number
 * @min 0
 * @max 32
 * @default 0
 *
 * @param icon
 * @text Icon
 * @type Number
 * @min 0
 * @default 0
 * 
 * @param quests
 * @text Quests
 * @type struct<Quest>[]
 * 
 * @param dirtyQuests
 * @type struct<QuestParser>[]
 * @text Dirty Quests
 * @desc copy here all quests and make the edits before moving back to quests object
 */
/*~struct~Quest:
 * @param quest
 * @text Quest Name
 * @type text
 * @default newquest01
 * 
 * @param title
 * @type text
 * @default New Quest
 * 
 * @param details
 * @text Details
 * @type note
 *
 * @param type
 * @type select
 * @option Default
 * @value default
 * @option Linear
 * @value linear
 * @option Optional
 * @value optional
 * @default default
 *
 * @param icon
 * @type number
 * @default 0
 *
 * @param stages
 * @text Quest Stages
 * @type struct<Stage>[]
 */
/*~struct~Stage:
 * @param stage
 * @text Stage Name
 * @type text
 * 
 * @param title
 * @type text
 *
 * @param details
 * @type note
 *
 * @param objective
 * @type number
 * @min 1
 * @max 999
 * @default 1
 * 
 * @param location
 * @text Locations
 * @type text[]
 */
/*~struct~QuestParser:
 * @param Key
 * @param quest
 * 
 * @param Title
 * @text Old Title
 * @param title
 * 
 * @param Details
 * @text Old Details
 * @param details
 * 
 * @param Behavior
 * @text Old Type
 * @param type
 * 
 * @param Icon
 * @text Old Icon
 * @param icon
 * @default 0
 * 
 * @param Stages
 * @text Old Stages
 * @param stages
 * @text Stages
 * @type struct<StageParser>[]
 */
/*~struct~StageParser:
 * @param Key
 * @text Old Stage
 * @param stage
 * @param Title
 * @text Old Title
 * @param title
 * @param Details
 * @text Old Details
 * @param details
 * @param Objective
 * @text Old Objective
 * @param objective
 * @default 1
 * @param location
 * @type text[]
 */


