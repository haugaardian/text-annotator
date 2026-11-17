import { getFirstIntervalOf } from "@core/interval.ts";
import { splitOnNewlines } from "@core/utils/string-utils.ts";
import { getNewTextSegment, TextSegment } from "./text-analysis/text-segment.ts";

export type TextSegmentation = {
    splitIntoSegments: (text: string) => TextSegment[];
};

export const createSplitOnNewLinesSentenceSegmentation = (): TextSegmentation => {
    return {
        splitIntoSegments: (text: string) =>
            splitOnNewlines(text)
                .map(s => s.trim())
                .filter(s => s !== "")
                .map(sentence => getFirstIntervalOf(text, sentence))
                .map(interval => getNewTextSegment({ interval }))
    };
};
