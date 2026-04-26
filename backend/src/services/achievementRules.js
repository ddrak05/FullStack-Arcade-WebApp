import {globalRules} from './rules/globalRules.js';
import {reactionRules} from "./rules/reactionRules.js";
import {sequenceRules} from "./rules/sequenceRules.js";
import {numberRules} from "./rules/numberRules.js";
import {verbalRules} from "./rules/verbalRules.js";
import {visualRules} from "./rules/visualRules.js";
import {typingRules} from "./rules/typingRules.js";
import {rpsRules} from "./rules/rpsRules.js";
import {tttRules} from "./rules/tttRules.js";
import {wordleRules} from "./rules/wordleRules.js";
import {mathsRules} from "./rules/mathsRules.js";

export const allRules = {
    ...globalRules,
    ...reactionRules,
    ...sequenceRules,
    ...numberRules,
    ...verbalRules,
    ...visualRules,
    ...typingRules,
    ...rpsRules,
    ...tttRules,
    ...wordleRules,
    ...mathsRules
}