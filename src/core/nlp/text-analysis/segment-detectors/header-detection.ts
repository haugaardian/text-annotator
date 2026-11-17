import { getIntervalsOf } from "@core/interval.ts";
import { PartOfSpeechTagging } from "@core/nlp/part-of-speech-tagging.ts";
import { getNewTextSegment, TextSegment } from "@core/nlp/text-analysis/text-segment.ts";
import { removeDuplicates, splitOnNewlines } from "@core/utils/string-utils.ts";
import { containWords } from "../../words.ts";

export const getDetectedHeaders = (text: string, posTagging: PartOfSpeechTagging): TextSegment[] => {
    const paragraphs = splitOnNewlines(text).map(p => p.trim());
    const singleWordWithNoPunctuation = removeDuplicates(
        paragraphs.filter(p => containWords(p) && headerScore(p, posTagging) >= 1)
    )
        .map(p => getIntervalsOf(text, p))
        .flat();
    return singleWordWithNoPunctuation.map(interval => getNewTextSegment({ interval, type: new Set(["header"]) }));
};

const headerScore = (text: string, posTagging: PartOfSpeechTagging): number => {
    if (hasPunctuation(text)) return -1;
    if (isSingleWord(text)) return 1;
    let score = 0;
    score += wordCountScore(text);
    if (isCapitalizedLine(text)) score += 0.25;
    score += nounRatio(text, posTagging);
    return score;
};

const nounRatio = (text: string, posTagging: PartOfSpeechTagging): number => {
    const posTags = posTagging.tagSentence(text);
    if (posTags.length === 0) return 0;
    const nouns = posTags.filter(p => p.posTag === "noun" || p.posTag === "proper noun").length;
    return nouns / posTags.length;
};

const isSingleWord = (text: string): boolean => {
    return /^\S+$/.test(text.trim());
};

const hasPunctuation = (text: string): boolean => {
    return /[!"#$%&'()*+,./;<=>@[\\\]^_`{|}~]/.test(text);
};

const wordCountScore = (text: string) => Math.max(0, 1 - (words(text) - 1) / 9);

const words = (text: string): number => text.trim().split(/\s+/).length;

const isCapitalizedLine = (text: string) => /^[A-ZÅÄÖ]/.test(text.trim());
