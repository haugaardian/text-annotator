import { getFirstIntervalOf } from "@core/interval.ts";
import { createSplitOnNewLinesSentenceSegmentation } from "../text-segmentation.ts";
import { createAnnotatedText } from "./annotated-text.ts";
import { getNewTextSegment } from "./text-segment.ts";

describe("annotates a text according to a set of annotation functions", () => {
    it("assigns no type to all segments from default segmenter", () => {
        const text = "I have no idea what I am?\nAm I a url?\nPath?\nHustler?";

        const result = createAnnotatedText(text, createSplitOnNewLinesSentenceSegmentation(), []);

        expect(result.segments.length).toBe(4);
        const undefinedTypeSegments = result.segments.filter(segment => segment.type.size === 0);
        expect(undefinedTypeSegments.length).toBe(4);
    });

    it("keeps the original src text intact", () => {
        const text = "An apple a day keeps the doctor away - if you throw hard enough";
        const result = createAnnotatedText(text, createSplitOnNewLinesSentenceSegmentation(), []);
        expect(result.srcText).toBe(text);
    });

    it("lets annotation segment win over default segment on the same interval", () => {
        const header = "Summary";
        const paragraph = "We are all doomed";
        const text = [header, paragraph].join("\n");

        const headers = (_: string) => [
            getNewTextSegment({ interval: getFirstIntervalOf(text, header), type: new Set(["header"]) })
        ];

        const result = createAnnotatedText(text, createSplitOnNewLinesSentenceSegmentation(), [headers]);

        expect(result.segments.length).toBe(2);
        expect(result.segments[0].type.has("header")).toBeTrue();
        expect(result.segments[1].type.size).toBe(0);
    });
});
