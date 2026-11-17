import {
  getNewTextSegment,
  TextSegment,
} from "@core/nlp/text-analysis/text-segment.ts";
import { getDetectedPaths } from "./path-detection.ts";
import { getDetectedUrls } from "./url-detection.ts";

export const getAttachmentReferences = (text: string): TextSegment[] => {
  const stripped = getDetectedUrls(text).reduce(
    (acc, { interval: { start, end } }) =>
      acc.slice(0, start) + " ".repeat(end - start) + acc.slice(end),
    text,
  );

  return getDetectedPaths(stripped).flatMap(({ interval: { start, end } }) => {
    if (text[start - 1] !== "[" || text[end] !== "]") return [];

    let i = start - 2;
    while (i >= 0 && text[i] === " ") i--;

    const endName = i + 1;
    while (i >= 0 && !/\s/.test(text[i])) i--;

    const startName = i + 1;
    const filename = text.slice(startName, endName);

    return filename.includes(".")
      ? [
          getNewTextSegment({
            interval: { start: startName, end: end + 1 },
            type: new Set(["attachmentReference"]),
          }),
        ]
      : [];
  });
};
