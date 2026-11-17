import { getFirstIntervalOf, substringInterval } from "@core/interval.ts";
import { getDetectedListItemGroups } from "./list-item-groups.ts";
import { createSplitOnNewLinesSentenceSegmentation } from "../text-segmentation.ts";
import { getNewTextSegment } from "./text-segment.ts";

describe("identifying list item groups", () => {
  it("identifies a numbered list on a new line after a sentence with colon", () => {
    const sentences = [
      "I am a sentence right before this list:",
      "1. I am cool",
      "2. I am beautiful",
      "3. I am smart",
    ];
    const input = sentences.join("\n");

    const detectedGroups = getDetectedListItemGroups(
      input,
      createSplitOnNewLinesSentenceSegmentation().splitIntoSegments(input),
    );

    expect(detectedGroups.length).toBe(1);
    const group = detectedGroups[0].items;
    expect(group.length).toBe(3);
    expect(substringInterval(input, group[0].interval)).toBe(sentences[1]);
    expect(group[0].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[1].interval)).toBe(sentences[2]);
    expect(group[1].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[2].interval)).toBe(sentences[3]);
    expect(group[2].type.has("listItem")).toBeTrue();
  });

  it("identifies a bullet list on a new line after a sentence", () => {
    const sentences = [
      "Tasks:",
      "• Do the thing",
      "• Do the other thing",
      "• Do the final thing",
    ];
    const input = sentences.join("\n");

    const detectedGroups = getDetectedListItemGroups(
      input,
      createSplitOnNewLinesSentenceSegmentation().splitIntoSegments(input),
    );

    expect(detectedGroups.length).toBe(1);
    const group = detectedGroups[0].items;
    expect(group.length).toBe(3);
    expect(substringInterval(input, group[0].interval)).toBe(sentences[1]);
    expect(group[0].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[1].interval)).toBe(sentences[2]);
    expect(group[1].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[2].interval)).toBe(sentences[3]);
    expect(group[2].type.has("listItem")).toBeTrue();
  });

  it("identifies a list with parenthesized numbering on a new line after a sentence", () => {
    const sentences = ["Things to do:", "(1) First", "(2) Second", "(3) Third"];
    const input = sentences.join("\n");

    const detectedGroups = getDetectedListItemGroups(
      input,
      createSplitOnNewLinesSentenceSegmentation().splitIntoSegments(input),
    );

    expect(detectedGroups.length).toBe(1);
    const group = detectedGroups[0].items;
    expect(group.length).toBe(3);
    expect(substringInterval(input, group[0].interval)).toBe(sentences[1]);
    expect(group[0].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[1].interval)).toBe(sentences[2]);
    expect(group[1].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[2].interval)).toBe(sentences[3]);
    expect(group[2].type.has("listItem")).toBeTrue();
  });

  it("identifies a list without a preceding sentence", () => {
    const sentences = ["1. One", "2. Two", "3. Three"];
    const input = sentences.join("\n");

    const detectedGroups = getDetectedListItemGroups(
      input,
      createSplitOnNewLinesSentenceSegmentation().splitIntoSegments(input),
    );

    expect(detectedGroups.length).toBe(1);
    expect(detectedGroups[0].leadIn).toBeUndefined();
    const group = detectedGroups[0].items;
    expect(group.length).toBe(3);
    expect(substringInterval(input, group[0].interval)).toBe(sentences[0]);
    expect(group[0].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[1].interval)).toBe(sentences[1]);
    expect(group[1].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[2].interval)).toBe(sentences[2]);
    expect(group[2].type.has("listItem")).toBeTrue();
  });

  it("identifies it at two seperate list if the list format is not persistent", () => {
    const sentences = ["Tasks:", "• Do the thing", "1. Do the other thing"];
    const input = sentences.join("\n");

    const detectedGroups = getDetectedListItemGroups(
      input,
      createSplitOnNewLinesSentenceSegmentation().splitIntoSegments(input),
    );

    expect(detectedGroups.length).toBe(2);
    const group1 = detectedGroups[0].items;
    expect(group1.length).toBe(1);
    expect(substringInterval(input, group1[0].interval)).toBe(sentences[1]);
    expect(group1[0].type.has("listItem")).toBeTrue();
    const group2 = detectedGroups[1].items;
    expect(detectedGroups[1].leadIn).toBeUndefined();
    expect(group2.length).toBe(1);
    expect(substringInterval(input, group2[0].interval)).toBe(sentences[2]);
    expect(group2[0].type.has("listItem")).toBeTrue();
  });

  it("does not detect numbered sentences as lists", () => {
    const sentences = [
      "In 2023. Something happened.",
      "In 2024. Something else happened.",
    ];
    const input = sentences.join("\n");

    const detectedGroups = getDetectedListItemGroups(
      input,
      createSplitOnNewLinesSentenceSegmentation().splitIntoSegments(input),
    );

    expect(detectedGroups.length).toBe(0);
  });

  it("handles list items with punctuation and multiple sentences", () => {
    const sentences = [
      "Checklist:",
      "1. Remove/hide the config panel.",
      "Since config panel is not needed!",
      "2. Remove/hide the apps icon.",
    ];
    const input =
      sentences[0] + "\n" + sentences[1] + sentences[2] + "\n" + sentences[3];

    const detectedGroups = getDetectedListItemGroups(
      input,
      sentences.map((s) =>
        getNewTextSegment({ interval: getFirstIntervalOf(input, s) }),
      ),
    );

    expect(detectedGroups.length).toBe(1);
    const group = detectedGroups[0].items;
    expect(group.length).toBe(2);
    expect(substringInterval(input, group[0].interval)).toBe(
      sentences[1] + sentences[2],
    );
    expect(group[0].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[1].interval)).toBe(sentences[3]);
    expect(group[1].type.has("listItem")).toBeTrue();
  });

  it("keeps multi-line list items together", () => {
    const sentences = [
      "Tasks:",
      "1. This item spans",
      "multiple lines",
      "2. This one does not",
    ];
    const input = sentences.join("\n");

    const detectedGroups = getDetectedListItemGroups(
      input,
      createSplitOnNewLinesSentenceSegmentation().splitIntoSegments(input),
    );

    expect(detectedGroups.length).toBe(1);
    const group = detectedGroups[0].items;
    expect(group.length).toBe(2);
    expect(substringInterval(input, group[0].interval)).toBe(
      sentences[1] + "\n" + sentences[2],
    );
    expect(group[0].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[1].interval)).toBe(sentences[3]);
    expect(group[1].type.has("listItem")).toBeTrue();
  });

  it("breaks groups when numbering resets unexpectedly", () => {
    const sentences = [
      "List:",
      "1. First",
      "2. Second",
      "1. New list",
      "2. Another",
    ];
    const input = sentences.join("\n");

    const detectedGroups = getDetectedListItemGroups(
      input,
      createSplitOnNewLinesSentenceSegmentation().splitIntoSegments(input),
    );

    expect(detectedGroups.length).toBe(2);
    const group1 = detectedGroups[0].items;
    expect(group1.length).toBe(2);
    expect(substringInterval(input, group1[0].interval)).toBe(sentences[1]);
    expect(group1[0].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group1[1].interval)).toBe(sentences[2]);
    expect(group1[1].type.has("listItem")).toBeTrue();
    const group2 = detectedGroups[1].items;
    expect(detectedGroups[1].leadIn).toBeUndefined();
    expect(group2.length).toBe(2);
    expect(substringInterval(input, group2[0].interval)).toBe(sentences[3]);
    expect(group2[0].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group2[1].interval)).toBe(sentences[4]);
    expect(group2[1].type.has("listItem")).toBeTrue();
  });

  it("does not break list group on double line break when numbering continues", () => {
    const sentences = [
      "1. First item",
      "2. Second item",
      "3. Third item",
      "4. Fourth item",
    ];
    const input =
      sentences[0] +
      "\n" +
      sentences[1] +
      "\n\n" +
      sentences[2] +
      "\n" +
      sentences[3];

    const detectedGroups = getDetectedListItemGroups(
      input,
      createSplitOnNewLinesSentenceSegmentation().splitIntoSegments(input),
    );
    expect(detectedGroups.length).toBe(1);
    const group = detectedGroups[0].items;
    expect(group.length).toBe(4);
    expect(substringInterval(input, group[0].interval)).toBe(sentences[0]);
    expect(group[0].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[1].interval)).toBe(sentences[1]);
    expect(group[1].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[2].interval)).toBe(sentences[2]);
    expect(group[2].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[3].interval)).toBe(sentences[3]);
    expect(group[3].type.has("listItem")).toBeTrue();
  });

  it("breaks list group when normal text appears after a double line break", () => {
    const sentences = [
      "1. First item",
      "2. Second item",
      "I am some text in the end",
    ];
    const input = sentences[0] + "\n" + sentences[1] + "\n\n" + sentences[2];

    const detectedGroups = getDetectedListItemGroups(
      input,
      createSplitOnNewLinesSentenceSegmentation().splitIntoSegments(input),
    );
    expect(detectedGroups.length).toBe(1);
    const group = detectedGroups[0].items;
    expect(group.length).toBe(2);
    expect(substringInterval(input, group[0].interval)).toBe(sentences[0]);
    expect(group[0].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[1].interval)).toBe(sentences[1]);
    expect(group[1].type.has("listItem")).toBeTrue();
  });

  it("identifies language label-value colon pairs as a list when introduced by a sentence semantically introducing a collection", () => {
    const sentences = [
      "Following translation:",
      "DK: Nuværende budget",
      "EN: Current budget",
      "GE: Krankenvagen",
      "After that all the translations are done",
    ];
    const input = sentences.join("\n\n");

    const detectedGroups = getDetectedListItemGroups(
      input,
      sentences.map((s) =>
        getNewTextSegment({ interval: getFirstIntervalOf(input, s) }),
      ),
    );

    expect(detectedGroups.length).toBe(1);
    const group = detectedGroups[0].items;
    expect(group.length).toBe(3);
    expect(substringInterval(input, group[0].interval)).toBe(sentences[1]);
    expect(group[0].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[1].interval)).toBe(sentences[2]);
    expect(group[1].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[2].interval)).toBe(sentences[3]);
    expect(group[2].type.has("listItem")).toBeTrue();
  });

  it("identifies language label-value dash pairs as a list when introduced by a sentence semantically introducing a collection", () => {
    const sentences = [
      "Create the icons:",
      "? - Question mark",
      "M - modifying",
      "x - deleting",
    ];
    const input = sentences.join("\n");

    const detectedGroups = getDetectedListItemGroups(
      input,
      sentences.map((s) =>
        getNewTextSegment({ interval: getFirstIntervalOf(input, s) }),
      ),
    );

    expect(detectedGroups.length).toBe(1);
    const group = detectedGroups[0].items;
    expect(group.length).toBe(3);
    expect(substringInterval(input, group[0].interval)).toBe(sentences[1]);
    expect(group[0].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[1].interval)).toBe(sentences[2]);
    expect(group[1].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group[2].interval)).toBe(sentences[3]);
    expect(group[2].type.has("listItem")).toBeTrue();
  });

  it("does not classify single label-value line as a list", () => {
    const sentences = ["EN: Current budget"];
    const input = sentences.join("\n");

    const detectedGroups = getDetectedListItemGroups(
      input,
      createSplitOnNewLinesSentenceSegmentation().splitIntoSegments(input),
    );

    expect(detectedGroups.length).toBe(0);
  });

  it("identifies language two different label-value pair groups as seperate when a non label-value pair sentente seperates them", () => {
    const sentences = [
      "Following translation:",
      "DK: Nuværende budget",
      "EN: Current budget",
      "After that all the translations are done, and continue with icons:",
      "? - Question mark",
      "M - modifying",
    ];
    const input = sentences.join("\n\n");
    const detectedGroups = getDetectedListItemGroups(
      input,
      createSplitOnNewLinesSentenceSegmentation().splitIntoSegments(input),
    );

    expect(detectedGroups.length).toBe(2);
    const group1 = detectedGroups[0].items;
    expect(group1.length).toBe(2);
    expect(substringInterval(input, group1[0].interval)).toBe(sentences[1]);
    expect(group1[0].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group1[1].interval)).toBe(sentences[2]);
    expect(group1[1].type.has("listItem")).toBeTrue();
    const group2 = detectedGroups[1].items;
    expect(group2.length).toBe(2);
    expect(substringInterval(input, group2[0].interval)).toBe(sentences[4]);
    expect(group2[0].type.has("listItem")).toBeTrue();
    expect(substringInterval(input, group2[1].interval)).toBe(sentences[5]);
    expect(group2[1].type.has("listItem")).toBeTrue();
  });

  describe("identifying lead in sentences", () => {
    it("identifies a lead in sentences if it is right before a list group with colon", () => {
      const sentences = [
        "I am a sentence right before this list:",
        "1. I am cool",
        "2. I am beautiful",
        "3. I am smart",
      ];
      const input = sentences.join("\n");

      const detectedGroups = getDetectedListItemGroups(
        input,
        createSplitOnNewLinesSentenceSegmentation().splitIntoSegments(input),
      );

      const leadIn = detectedGroups[0].leadIn;
      if (leadIn === undefined)
        throw new Error("Expected lead in to be defined");
      expect(leadIn.type.has("listLeadIn")).toBeTrue();
      expect(substringInterval(input, leadIn.interval)).toBe(sentences[0]);
    });

    it("does not attribute a lead in to a group arriving from a reset with no lead in sentence", () => {
      const sentences = [
        "List:",
        "1. First",
        "2. Second",
        "1. New list",
        "2. Another",
      ];
      const input = sentences.join("\n");

      const detectedGroups = getDetectedListItemGroups(
        input,
        createSplitOnNewLinesSentenceSegmentation().splitIntoSegments(input),
      );

      expect(detectedGroups.length).toBe(2);
      const leadIn = detectedGroups[0].leadIn;
      if (leadIn === undefined)
        throw new Error("Expected lead in to be defined");
      expect(leadIn.type.has("listLeadIn")).toBeTrue();
      expect(substringInterval(input, leadIn.interval)).toBe(sentences[0]);
      expect(detectedGroups[1].leadIn).toBeUndefined();
    });

    it("adds a reference to lead in sentence segment in all list items", () => {
      const sentences = [
        "I am a sentence right before this list:",
        "1. I am cool",
        "2. I am beautiful",
        "3. I am smart",
      ];
      const input = sentences.join("\n");

      const detectedGroups = getDetectedListItemGroups(
        input,
        createSplitOnNewLinesSentenceSegmentation().splitIntoSegments(input),
      );

      expect(detectedGroups.length).toBe(1);
      expect(detectedGroups[0].items.length).toBe(3);
      for (const item of detectedGroups[0].items) {
        expect(item.references.length).toBe(1);
        expect(item.references[0].type.has("listLeadIn")).toBeTrue();
        expect(substringInterval(input, item.references[0].interval)).toBe(
          sentences[0],
        );
      }
    });
  });
});
