import { PartialWithRequired } from "@core/utils/type-utils.ts";
import { TextSegmentation } from "../text-segmentation.ts";
import { getNewProcessedText, ProcessedText } from "./processed-text.ts";
import { getNewTextSegment, TextSegment } from "./text-segment.ts";
import { getNewInterval, substringInterval } from "@core/interval.ts";

export type AnnotatedText = ProcessedText;

type PartialAnnotatedText = PartialWithRequired<AnnotatedText, "srcText">;

export const getNewAnnotatedText = (partial: PartialAnnotatedText) => getNewProcessedText(partial);

export const createAnnotatedText = (
    text: string,
    segmenter: TextSegmentation,
    annotationFunctions: Array<(text: string) => TextSegment[]>
): AnnotatedText => {
    const defaultSegments = segmenter.splitIntoSegments(text);
    const annotations = annotationFunctions.flatMap(fn => fn(text));
    const allSegments = [...defaultSegments, ...annotations];
    const mergedMap = new Map<string, TextSegment>();
    for (const segment of allSegments) {
        const key = `${segment.interval.start}-${segment.interval.end}`;
        const existing = mergedMap.get(key);

        if (existing) {
            segment.type.forEach(t => existing.type.add(t));
            existing.references.push(...segment.references);
        } else {
            mergedMap.set(key, {
                ...segment,
                type: new Set(segment.type),
                references: [...segment.references]
            });
        }
    }
    return getNewProcessedText({
        srcText: text,
        segments: Array.from(mergedMap.values()).sort((a, b) => a.interval.start - b.interval.start)
    });
};

export const createNonAnnotatedText = (texts: string[]): AnnotatedText => {
    let offset = 0;

    const segments = texts.map((text, index) => {
        const segment = getNewTextSegment({
            interval: getNewInterval(offset, offset + text.length)
        });
        offset += text.length + (index < texts.length - 1 ? 1 : 0);
        return segment;
    });

    return getNewProcessedText({
        srcText: texts.join("\n"),
        segments
    });
};

export const printAnnotatedText = (annotatedText: AnnotatedText) => {
    const sortedSegments = [...annotatedText.segments].sort((a, b) => a.interval.start - b.interval.start);
    sortedSegments.forEach(segment => {
        console.log(
            "(" +
                segment.type +
                ") [" +
                segment.interval.start +
                ":" +
                segment.interval.end +
                "] " +
                substringInterval(annotatedText.srcText, segment.interval)
        );
    });
};
