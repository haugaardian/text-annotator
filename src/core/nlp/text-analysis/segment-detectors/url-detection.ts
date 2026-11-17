import {
  getNewTextSegment,
  TextSegment,
} from "@core/nlp/text-analysis/text-segment.ts";

const URL_PATTERN = /https?:\/\/[^\s]+/gi;

export const getDetectedUrls = (text: string): TextSegment[] => {
  const result: TextSegment[] = [];
  let match: RegExpExecArray | null;

  while ((match = URL_PATTERN.exec(text)) !== null) {
    result.push(
      getNewTextSegment({
        interval: { start: match.index, end: match.index + match[0].length },
        type: new Set(["url"]),
      }),
    );
  }

  URL_PATTERN.lastIndex = 0;
  return result;
};
