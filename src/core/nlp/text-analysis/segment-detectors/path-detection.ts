import { getNewTextSegment, TextSegment } from "@core/nlp/text-analysis/text-segment.ts";
import { getDetectedUrls } from "./url-detection.ts";

const PATH_PATTERN = /(?<!https?:)\/[a-z0-9.]+(?:\/[a-z0-9.]+)+/gi;

export const getDetectedPaths = (text: string): TextSegment[] => {
    const detectedUrls = getDetectedUrls(text);
    const stripped = detectedUrls.reduce((acc, segment) => {
        const { start, end } = segment.interval;
        return acc.slice(0, start) + " ".repeat(end - start) + acc.slice(end);
    }, text);

    const result: TextSegment[] = [];
    let match: RegExpExecArray | null;

    while ((match = PATH_PATTERN.exec(stripped)) !== null) {
        result.push(
            getNewTextSegment({
                interval: { start: match.index, end: match.index + match[0].length },
                type: new Set(["path"])
            })
        );
    }

    PATH_PATTERN.lastIndex = 0;
    return result;
};
