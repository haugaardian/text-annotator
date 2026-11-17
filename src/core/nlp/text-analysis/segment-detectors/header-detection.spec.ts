import {
  getFirstIntervalOf,
  getIntervalsOf,
  isSameInterval,
} from "@core/interval.ts";
import { getDetectedHeaders } from "./header-detection.ts";
import { createPredefinedSpaceSplitPosTagger } from "@core/nlp/pos-taggers/predefined-pos-tagger.ts";
import { getNewPosTagResult } from "../../part-of-speech-tagging.ts";

describe("a heuristic for detecting headers in a text", () => {
  it("finds a header in a text that only contains one word without punctuation following by a new line", () => {
    const header = "Summary";
    const sentence = "I am a simple sentence.";
    const text = [header, sentence].join("\n");
    const posTagging = createPredefinedSpaceSplitPosTagger({});
    const result = getDetectedHeaders(text, posTagging);
    expect(result.length).toBe(1);
    expect(result[0].type.has("header")).toBeTrue();
    expect(
      isSameInterval(result[0].interval, getFirstIntervalOf(text, header)),
    ).toBeTrue();
  });

  it("finds a header in a text that only contains one word without punctuation following by a two new lines", () => {
    const header = "Summary";
    const sentence = "I am a simple sentence.";
    const text = [header, sentence].join("\n\n");
    const posTagging = createPredefinedSpaceSplitPosTagger({});
    const result = getDetectedHeaders(text, posTagging);
    expect(result.length).toBe(1);
    expect(result[0].type.has("header")).toBeTrue();
    expect(
      isSameInterval(result[0].interval, getFirstIntervalOf(text, header)),
    ).toBeTrue();
  });

  it("finds two headers of same name in a text that only contains one word without punctuation following by a two new lines", () => {
    const header = "Summary";
    const sentence = "I am a simple sentence.";
    const text = [header, sentence, header, sentence].join("\n");
    const posTagging = createPredefinedSpaceSplitPosTagger({});
    const result = getDetectedHeaders(text, posTagging);
    expect(result.length).toBe(2);
    const intervals = getIntervalsOf(text, header);
    expect(result[0].type.has("header")).toBeTrue();
    expect(result[1].type.has("header")).toBeTrue();
    expect(isSameInterval(result[0].interval, intervals[0])).toBeTrue();
    expect(isSameInterval(result[1].interval, intervals[1])).toBeTrue();
  });

  it("finds a header in a text that only contains one word without punctuation", () => {
    const header = "Summary";
    const posTagging = createPredefinedSpaceSplitPosTagger({});
    const result = getDetectedHeaders(header, posTagging);
    expect(result.length).toBe(1);
    expect(result[0].type.has("header")).toBeTrue();
    expect(
      isSameInterval(result[0].interval, getFirstIntervalOf(header, header)),
    ).toBeTrue();
  });

  it("finds a header that contains a higher ratio of nouns", () => {
    const header = "Acceptance criteria";
    const posTagging = createPredefinedSpaceSplitPosTagger({
      Acceptance: getNewPosTagResult({ posTag: "proper noun" }),
      criteria: getNewPosTagResult({ posTag: "noun" }),
    });
    const result = getDetectedHeaders(header, posTagging);
    expect(result.length).toBe(1);
    expect(result[0].type.has("header")).toBeTrue();
    expect(
      isSameInterval(result[0].interval, getFirstIntervalOf(header, header)),
    ).toBeTrue();
  });

  it("finds a header with medium length with medium noun count and capitalized start", () => {
    const header = "Start ABC from Program in Buy House";
    const posTagging = createPredefinedSpaceSplitPosTagger({
      Start: getNewPosTagResult({ posTag: "verb" }),
      ABC: getNewPosTagResult({ posTag: "proper noun" }),
      from: getNewPosTagResult({ posTag: "adposition" }),
      Program: getNewPosTagResult({ posTag: "proper noun" }),
      in: getNewPosTagResult({ posTag: "adposition" }),
      Buy: getNewPosTagResult({ posTag: "verb" }),
      House: getNewPosTagResult({ posTag: "proper noun" }),
    });
    const result = getDetectedHeaders(header, posTagging);
    expect(result.length).toBe(1);
    expect(result[0].type.has("header")).toBeTrue();
    expect(
      isSameInterval(result[0].interval, getFirstIntervalOf(header, header)),
    ).toBeTrue();
  });

  it("can not be a header for empty text", () => {
    const header = "";
    const posTagging = createPredefinedSpaceSplitPosTagger({});
    const result = getDetectedHeaders(header, posTagging);
    expect(result.length).toBe(0);
  });

  it("can not be a header for single space", () => {
    const header = " ";
    const posTagging = createPredefinedSpaceSplitPosTagger({});
    const result = getDetectedHeaders(header, posTagging);
    expect(result.length).toBe(0);
  });

  it("can not be a header for single new line", () => {
    const header = "\n";
    const posTagging = createPredefinedSpaceSplitPosTagger({});
    const result = getDetectedHeaders(header, posTagging);
    expect(result.length).toBe(0);
  });

  it("can not be a header for single new line and space", () => {
    const header = " \n ";
    const posTagging = createPredefinedSpaceSplitPosTagger({});
    const result = getDetectedHeaders(header, posTagging);
    expect(result.length).toBe(0);
  });

  it("does not include trailing whitespace in header detection interval", () => {
    const header = "S ";
    const posTagging = createPredefinedSpaceSplitPosTagger({});
    const result = getDetectedHeaders(header, posTagging);
    expect(result.length).toBe(1);
    expect(result[0].interval.start).toBe(0);
    expect(result[0].interval.end).toBe(1);
  });
});
