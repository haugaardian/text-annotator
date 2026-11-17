export type PosTag =
    | "adjective"
    | "adposition"
    | "adverb"
    | "auxiliary"
    | "coordinating conjuction"
    | "determiner"
    | "interjection"
    | "noun"
    | "numeral"
    | "particle"
    | "pronoun"
    | "proper noun"
    | "punctuation marks"
    | "subordinating conjuction"
    | "symbol"
    | "verb"
    | "space"
    | "other";

export type PosTagResult = {
    value: string;
    lemma: string;
    posTag: PosTag;
};

export const getNewPosTagResult = (partial: Partial<PosTagResult>): PosTagResult => {
    return {
        value: "",
        lemma: "",
        posTag: "other",
        ...partial
    };
};

export type PartOfSpeechTagging = {
    tagSentence: (sentence: string) => PosTagResult[];
};
