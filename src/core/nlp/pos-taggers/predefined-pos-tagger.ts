import { getNewPosTagResult, PartOfSpeechTagging, PosTagResult } from "../part-of-speech-tagging.ts";

export const createPredefinedSpaceSplitPosTagger = (predefined: Record<string, PosTagResult>): PartOfSpeechTagging => {
    return {
        tagSentence: (sentence: string) => {
            const tokens = sentence
                .trim()
                .split(/\s+/)
                .flatMap(t => {
                    const parts: string[] = [];
                    let current = t;
                    while (current.length > 0) {
                        const leading = current.match(/^([^\w]+)/);
                        if (leading) {
                            parts.push(leading[1]);
                            current = current.slice(leading[1].length);
                            continue;
                        }
                        const word = current.match(/^([\w]+)/);
                        if (word) {
                            parts.push(word[1]);
                            current = current.slice(word[1].length);
                            continue;
                        }
                        break;
                    }
                    return parts;
                })
                .filter(t => t.length > 0);
            return tokens.map(value => {
                const isPunct = /^\p{P}+$/u.test(value);
                const tag = predefined[value];
                return isPunct
                    ? getNewPosTagResult({ value, lemma: value, posTag: "punctuation marks" })
                    : getNewPosTagResult({ ...tag, value });
            });
        }
    };
};
