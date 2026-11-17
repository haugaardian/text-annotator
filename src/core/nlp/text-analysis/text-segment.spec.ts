import { getNewInterval } from "@core/interval.ts";
import {
  getNewTextSegment,
  mergeContinuations,
  TextSegment,
} from "./text-segment.ts";
import { createAnnotatedText } from "./annotated-text.ts";
import { createSplitOnNewLinesSentenceSegmentation } from "../text-segmentation.ts";

describe("text segments", () => {
  describe("handling multiple annotations", () => {
    it("merges types when segments have the exact same interval", () => {
      const text = "1. haugaardian.com";

      const urlAnnotationFunc = (_: string) => [
        getNewTextSegment({
          interval: { start: 0, end: text.length },
          type: new Set(["url"]),
        }),
      ];
      const listItemAnnotationFunc = (_: string) => [
        getNewTextSegment({
          interval: { start: 0, end: text.length },
          type: new Set(["listItem"]),
        }),
      ];

      const result = createAnnotatedText(
        text,
        createSplitOnNewLinesSentenceSegmentation(),
        [urlAnnotationFunc, listItemAnnotationFunc],
      );

      expect(result.segments.length).toBe(1);
      expect(result.segments[0].type.has("listItem")).toBe(true);
      expect(result.segments[0].type.has("url")).toBe(true);
    });

    it("maintains separate segments for overlapping but non-identical intervals", () => {
      const text = "1. haugaardian.com";

      const urlAnnotationFunc = (_: string) => [
        getNewTextSegment({
          interval: { start: 2, end: text.length },
          type: new Set(["url"]),
        }),
      ];
      const listItemAnnotationFunc = (_: string) => [
        getNewTextSegment({
          interval: { start: 0, end: text.length },
          type: new Set(["listItem"]),
        }),
      ];

      const result = createAnnotatedText(
        text,
        createSplitOnNewLinesSentenceSegmentation(),
        [urlAnnotationFunc, listItemAnnotationFunc],
      );

      expect(result.segments.length).toBe(2);
      expect(result.segments[0].type.has("listItem")).toBe(true);
      expect(result.segments[1].type.has("url")).toBe(true);
    });
  });

  describe("merging continuations of text segments", () => {
    it("merges multiple consecutive segments into one", () => {
      const segments: TextSegment[] = [
        getNewTextSegment({ interval: getNewInterval(0, 5) }),
        getNewTextSegment({ interval: getNewInterval(5, 10) }),
        getNewTextSegment({ interval: getNewInterval(10, 15) }),
      ];

      const result = mergeContinuations(segments, () => true);

      expect(result.length).toBe(1);
      expect(result[0].interval.start).toEqual(0);
      expect(result[0].interval.end).toEqual(15);
    });

    it("merges segments with gaps between them if no other segment intervenes", () => {
      const segments: TextSegment[] = [
        getNewTextSegment({ interval: getNewInterval(0, 5) }),
        getNewTextSegment({ interval: getNewInterval(10, 15) }),
      ];

      const result = mergeContinuations(segments, () => true);

      expect(result).toHaveLength(1);
      expect(result[0].interval.start).toBe(0);
      expect(result[0].interval.end).toBe(15);
    });

    it("does not merge across a gap if an incompatible segment exists in between", () => {
      const segments: TextSegment[] = [
        getNewTextSegment({ interval: getNewInterval(0, 5) }),
        getNewTextSegment({
          interval: getNewInterval(6, 9),
          type: new Set(["title"]),
        }),
        getNewTextSegment({ interval: getNewInterval(10, 15) }),
      ];

      const result = mergeContinuations(segments, () => true);

      expect(result).toHaveLength(3);
      expect(result[0].interval.end).toBe(5);
      expect(result[2].interval.start).toBe(10);
    });

    it("merges segments of the same type and preserves that type", () => {
      const segments: TextSegment[] = [
        getNewTextSegment({
          interval: getNewInterval(0, 5),
          type: new Set(["url"]),
        }),
        getNewTextSegment({
          interval: getNewInterval(5, 10),
          type: new Set(["url"]),
        }),
      ];

      const result = mergeContinuations(segments, () => true);

      expect(result).toHaveLength(1);
      expect(result[0].type.has("url")).toBeTrue();
      expect(result[0].interval).toEqual({ start: 0, end: 10 });
    });

    it("does not merge segments if they have different types", () => {
      const segments: TextSegment[] = [
        getNewTextSegment({
          interval: getNewInterval(0, 5),
          type: new Set(["url"]),
        }),
        getNewTextSegment({
          interval: getNewInterval(5, 10),
          type: new Set(["title"]),
        }),
      ];

      const result = mergeContinuations(segments, () => true);

      expect(result).toHaveLength(2);
      expect(result[0].type.has("url")).toBeTrue();
      expect(result[1].type.has("title")).toBeTrue();
    });
  });
});
