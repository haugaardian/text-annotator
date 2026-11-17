import { getNewInterval } from "@core/interval.ts";
import { PartialWithRequired } from "@core/utils/type-utils.ts";
import { getNewTextSegment, TextSegment } from "./text-segment.ts";

export type ProcessedText = {
  srcText: string;
  segments: TextSegment[];
  excludedSegments: TextSegment[];
};

type PartialProcessedText = PartialWithRequired<ProcessedText, "srcText">;

export const getNewProcessedText = (
  partial: PartialProcessedText,
): ProcessedText => {
  return {
    segments: [],
    excludedSegments: [],
    ...partial,
  };
};

export const getOneSegmentProcessedText = (text: string): ProcessedText => {
  return getNewProcessedText({
    srcText: text,
    segments: [getNewTextSegment({ interval: getNewInterval(0, text.length) })],
  });
};

export const extractSegments = (processedText: ProcessedText): string[] => {
  const {
    srcText: text,
    segments: segments = [],
    excludedSegments = [],
  } = processedText;
  if (!segments.length) return [];

  const mergedHidden = [...excludedSegments]
    .sort((a, b) => a.interval.start - b.interval.start)
    .reduce<TextSegment[]>((acc, segment) => {
      const last = acc[acc.length - 1];
      if (!last || segment.interval.start > last.interval.end)
        acc.push({ ...segment });
      else
        last.interval.end = Math.max(last.interval.end, segment.interval.end);
      return acc;
    }, []);

  return segments
    .map((segment) => {
      let cursor = segment.interval.start;
      const parts: string[] = [];

      for (const h of mergedHidden) {
        if (h.interval.end <= segment.interval.start) continue;
        if (h.interval.start >= segment.interval.end) break;

        const start = Math.max(cursor, segment.interval.start);
        const end = Math.min(h.interval.start, segment.interval.end);
        if (start < end) parts.push(text.slice(start, end));

        cursor = Math.max(cursor, h.interval.end);
      }

      if (cursor < segment.interval.end)
        parts.push(text.slice(cursor, segment.interval.end));
      return parts.join("");
    })
    .filter((segment) => segment.length !== 0);
};

export const extractProcessedText = (processedText: ProcessedText) =>
  extractSegments(processedText).join("");
