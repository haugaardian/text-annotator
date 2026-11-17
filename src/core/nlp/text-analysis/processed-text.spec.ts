import { getNewInterval } from "@core/interval.ts";
import { extractSegments, getNewProcessedText } from "./processed-text.ts";
import { getNewTextSegment } from "./text-segment.ts";

describe("a processed text", () => {
  describe("extracting segments from a processed text", () => {
    it("extracts the entire text for a segment spanning the entire text", () => {
      const text = "I am a text.";
      const entireInterval = getNewInterval(0, text.length);
      const processedText = getNewProcessedText({
        srcText: text,
        segments: [getNewTextSegment({ interval: entireInterval })],
      });

      const result = extractSegments(processedText);

      expect(result.length).toBe(1);
      expect(result[0]).toBe(text);
    });

    it("fully excluded text does not result in an empty string but no segment at all", () => {
      const text = "I am a text.";
      const entireInterval = getNewInterval(0, text.length);
      const processedText = getNewProcessedText({
        srcText: text,
        segments: [getNewTextSegment({ interval: entireInterval })],
        excludedSegments: [getNewTextSegment({ interval: entireInterval })],
      });

      const result = extractSegments(processedText);

      expect(result.length).toBe(0);
    });

    it("extracts segments for multiple non-overlapping segments", () => {
      const text = "Hello world! How are you?";
      const segments = [
        getNewTextSegment({ interval: getNewInterval(0, 5) }),
        getNewTextSegment({ interval: getNewInterval(6, 12) }),
        getNewTextSegment({ interval: getNewInterval(13, 16) }),
        getNewTextSegment({ interval: getNewInterval(17, 20) }),
        getNewTextSegment({ interval: getNewInterval(21, 24) }),
      ];
      const processedText = getNewProcessedText({
        srcText: text,
        segments: segments,
      });

      const result = extractSegments(processedText);

      expect(result.length).toBe(5);
      expect(result).toEqual(["Hello", "world!", "How", "are", "you"]);
    });

    it("extracts segments for overlapping segments", () => {
      const text = "I am actually part of both segments!";
      const segments = [
        getNewTextSegment({ interval: getNewInterval(0, 13) }),
        getNewTextSegment({ interval: getNewInterval(5, text.length) }),
      ];
      const processedText = getNewProcessedText({
        srcText: text,
        segments: segments,
      });

      const result = extractSegments(processedText);

      expect(result.length).toBe(2);
      expect(result).toEqual([
        "I am actually",
        "actually part of both segments!",
      ]);
    });

    it("extracts segments for segments with hidden text applied", () => {
      const text = "Hello secret world!";
      const segments = [
        getNewTextSegment({ interval: getNewInterval(0, 5) }),
        getNewTextSegment({ interval: getNewInterval(6, 18) }),
      ];
      const excluded = [getNewTextSegment({ interval: getNewInterval(6, 12) })];
      const processedText = getNewProcessedText({
        srcText: text,
        segments: segments,
        excludedSegments: excluded,
      });

      const result = extractSegments(processedText);

      expect(result.length).toBe(2);
      expect(result).toEqual(["Hello", " world"]);
    });

    it("extracts segments for segments with hidden text only partially part of the segment", () => {
      const text = "Hello secret world!";
      const segments = [
        getNewTextSegment({ interval: getNewInterval(12, 18) }),
      ];
      const excluded = [getNewTextSegment({ interval: getNewInterval(0, 16) })];
      const processedText = getNewProcessedText({
        srcText: text,
        segments: segments,
        excludedSegments: excluded,
      });

      const result = extractSegments(processedText);

      expect(result.length).toBe(1);
      expect(result).toEqual(["ld"]);
    });

    it("merges overlapping hidden intervals and removes text correctly", () => {
      const text = "please do not remove me! Oh no! WHY!?";
      const segments = [
        getNewTextSegment({ interval: getNewInterval(0, text.length) }),
      ];
      const excluded = [
        getNewTextSegment({ interval: getNewInterval(20, 23) }),
        getNewTextSegment({ interval: getNewInterval(21, 24) }),
      ];

      const processedText = getNewProcessedText({
        srcText: text,
        segments: segments,
        excludedSegments: excluded,
      });
      const result = extractSegments(processedText);

      expect(result.length).toBe(1);
      expect(result[0]).toBe("please do not remove Oh no! WHY!?");
    });
  });
});
