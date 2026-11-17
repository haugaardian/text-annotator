import { getNewInterval, Interval, substringInterval } from "@core/interval.ts";
import { setsAreEqual } from "@core/utils/set-utils.ts";

export type TextSegment = {
  interval: Interval;
  references: TextSegment[];
  type: Set<
    | "title"
    | "header"
    | "url"
    | "path"
    | "attachmentReference"
    | "listItem"
    | "listLeadIn"
  >;
};

export const getNewTextSegment = (
  partial: Partial<TextSegment>,
): TextSegment => {
  return {
    interval: getNewInterval(0, 0),
    references: [],
    type: new Set([]),
    ...partial,
  };
};

export const getTextSegmentText = (srcText: string, segment: TextSegment) => {
  if (segment.type.has("listItem")) {
    const leadIn = segment.references.find((reference) =>
      reference.type.has("listLeadIn"),
    );
    if (leadIn !== undefined)
      return (
        substringInterval(srcText, leadIn.interval) +
        " " +
        substringInterval(srcText, segment.interval)
      );
  }
  return substringInterval(srcText, segment.interval);
};

export const mergeContinuations = (
  segments: TextSegment[],
  isContinuation: (s1: TextSegment, s2: TextSegment) => boolean,
): TextSegment[] => {
  const sorted = [...segments].sort(
    (a, b) => a.interval.start - b.interval.start,
  );
  const merged: TextSegment[] = [];
  for (let i = 0; i < sorted.length; i++) {
    let current = { ...sorted[i] };
    while (i + 1 < sorted.length) {
      const next = sorted[i + 1];
      const haveMatchingTypes = setsAreEqual(current.type, next.type);
      if (haveMatchingTypes && isContinuation(current, next)) {
        current = getNewTextSegment({
          ...current,
          interval: getNewInterval(current.interval.start, next.interval.end),
        });
        i++;
      } else {
        break;
      }
    }
    merged.push(current);
  }
  return merged;
};
