import { createWinkNLPSentenceSegmentation } from "./wink-nlp-sentence-segmentation.ts";
import { isSameInterval, substringInterval } from "@core/interval.ts";

describe("sentence segmentation acceptance criteria", () => {
  const sentenceSegmentation = createWinkNLPSentenceSegmentation();

  it("splits simple sentences by period", () => {
    const sentences = ["I went home.", "Then I ate dinner."];
    const text = sentences.join(" ");
    const result = sentenceSegmentation.splitIntoSegments(text);
    expect(substringInterval(text, result[0].interval)).toBe(sentences[0]);
    expect(substringInterval(text, result[1].interval)).toBe(sentences[1]);
  });

  it("handles abbreviations correctly", () => {
    const sentences = ["Dr. Smith went to Washington.", "He met Sen. Brown."];
    const text = sentences.join(" ");
    const result = sentenceSegmentation.splitIntoSegments(text);
    expect(substringInterval(text, result[0].interval)).toBe(sentences[0]);
    expect(substringInterval(text, result[1].interval)).toBe(sentences[1]);
  });

  it("handles ellipsis properly", () => {
    const sentences = ["I was thinking... maybe we should go."];
    const text = sentences.join(" ");
    const result = sentenceSegmentation.splitIntoSegments(text);
    expect(substringInterval(text, result[0].interval)).toBe(sentences[0]);
  });

  it.each([`'`, `"`, `'`])(
    "does not split when period is inside a quatation inside a sentence",
    (quotation) => {
      const sentence = `And then he said ${quotation}Etc. I ship 37000 lines of AI code per day${quotation}, wtf Garry Tan.`;
      const result = sentenceSegmentation.splitIntoSegments(sentence);
      expect(result.length).toBe(1);
      expect(substringInterval(sentence, result[0].interval)).toBe(sentence);
    },
  );

  it("does not split when period is inside a special quatation with different start and ending inside a sentence", () => {
    const sentence = `Look at the "Nuv. mdl." column`;
    const result = sentenceSegmentation.splitIntoSegments(sentence);
    expect(result.length).toBe(1);
    expect(substringInterval(sentence, result[0].interval)).toBe(sentence);
  });

  it.each([
    "\u200B", // Zero-Width Space (ZWSP)
    "\u200C", // Zero-Width Non-Joiner (ZWNJ)
    "\u200D", // Zero-Width Joiner (ZWJ)
    "\u200E", // Left-to-Right Mark (LRM)
    "\u200F", // Right-to-Left Mark (RLM)
    "\uFEFF", // Zero-Width No-Break Space (BOM/ZWNBSP)
    "\u202A", // Left-to-Right Embedding (LRE)
    "\u202B", // Right-to-Left Embedding (RLE)
    "\u202C", // Pop Directional Formatting (PDF)
    "\u202D", // Left-to-Right Override (LRO)
    "\u202E", // Right-to-Left Override (RLO)
    "\u061C", // Arabic Letter Mark
    "\u034F", // Combining Grapheme Joiner
    "\u202F", // Narrow No-Break Space (NNBSP)
  ])(
    "does not break sentences with non-printable unicode characters",
    (character) => {
      const sentence = `something is hidden ${character}between the lines`;
      const result = sentenceSegmentation.splitIntoSegments(sentence);
      expect(result.length).toBe(1);
      expect(substringInterval(sentence, result[0].interval)).toBe(sentence);
    },
  );

  it("does not break sentences non-printable unicode characters beginning of sentence", () => {
    const sentence = "\u202Fnotice I am not alone...";
    const result = sentenceSegmentation.splitIntoSegments(sentence);
    expect(result.length).toBe(1);
    expect(substringInterval(sentence, result[0].interval)).toBe(
      sentence.trim(),
    );
  });

  it("does not break sentences with two non-printable unicode characters in a row", () => {
    const sentence = "\u202F\u202Fnotice I am not alone...";
    const result = sentenceSegmentation.splitIntoSegments(sentence);
    expect(result.length).toBe(1);
    expect(substringInterval(sentence, result[0].interval)).toBe(
      sentence.trim(),
    );
  });

  it("does not break sentences with multiple non-printable unicode characters accross sentences", () => {
    const sentence = "\u202FWhen I first saw\u202F. I was\u202Fso annoyed.";
    const result = sentenceSegmentation.splitIntoSegments(sentence);
    expect(result.length).toBe(2);
    expect(substringInterval(sentence, result[0].interval)).toBe(
      "When I first saw\u202F.",
    );
    expect(substringInterval(sentence, result[1].interval)).toBe(
      "I was\u202Fso annoyed.",
    );
  });

  it.each(["png", "jpg", "jpeg", "pdf", "txt", "java"])(
    "does not split into seperate sentences on known file extensions",
    (extension) => {
      const text = "file." + extension;
      const result = sentenceSegmentation.splitIntoSegments(text);
      expect(result.length).toBe(1);
      expect(substringInterval(text, result[0].interval)).toBe(text);
    },
  );

  it.each(["png", "jpg", "jpeg", "pdf", "txt", "java"])(
    "does not split into seperate sentences on known file extensions with spaces between file and extention",
    (extension) => {
      const text = "file" + "   .   " + extension;
      const result = sentenceSegmentation.splitIntoSegments(text);
      expect(result.length).toBe(1);
      expect(substringInterval(text, result[0].interval)).toBe(text);
    },
  );

  it("infers sentence boundaries without punctuation on a new line with uppercase", () => {
    const sentences = [
      "Acceptance criteria",
      "The following validations are blocking for approval:",
    ];
    const text = sentences.join("\n");
    const result = sentenceSegmentation.splitIntoSegments(text);
    expect(substringInterval(text, result[0].interval)).toBe(sentences[0]);
    expect(substringInterval(text, result[1].interval)).toBe(sentences[1]);
  });

  it("infers sentence boundaries without punctuation on a new line with a number list marker", () => {
    const sentences = ["Next line is a", "1. number list"];
    const text = sentences.join("\n");
    const result = sentenceSegmentation.splitIntoSegments(text);
    expect(substringInterval(text, result[0].interval)).toBe(sentences[0]);
    expect(substringInterval(text, result[1].interval)).toBe(sentences[1]);
  });

  it("infers sentence boundaries without punctuation on a new line with a bullet list marker", () => {
    const sentences = ["Next line is a", "• bullet list"];
    const text = sentences.join("\n");
    const result = sentenceSegmentation.splitIntoSegments(text);
    expect(substringInterval(text, result[0].interval)).toBe(sentences[0]);
    expect(substringInterval(text, result[1].interval)).toBe(sentences[1]);
  });

  it("does not infer sentence boundaries without punctuation on a new line with first work not uppercase", () => {
    const sentences = ["I like to add", "newlines random places"];
    const text = sentences.join("\n");
    const result = sentenceSegmentation.splitIntoSegments(text);
    expect(result.length).toBe(1);
    expect(substringInterval(text, result[0].interval)).toBe(text);
  });

  it.each(["in", "on", "at", "by", "with", "for", "from", "of", "to"])(
    "joins lines when previous line ends with mid-thought preposition '%s' even though next is uppercase",
    (preposition) => {
      const sentences = [
        `Check why it is not being mapped ${preposition}`,
        "Mapper.",
      ];
      const text = sentences.join("\n");
      const result = sentenceSegmentation.splitIntoSegments(text);
      expect(result.length).toBe(1);
      expect(substringInterval(text, result[0].interval)).toBe(text);
    },
  );

  it.each(["the", "a", "an"])(
    "joins lines when previous line ends with article '%s' even though next is uppercase",
    (article) => {
      const sentences = [
        `Please refer to ${article}`,
        "MySuperDocu for details.",
      ];
      const text = sentences.join("\n");
      const result = sentenceSegmentation.splitIntoSegments(text);
      expect(result.length).toBe(1);
      expect(substringInterval(text, result[0].interval)).toBe(text);
    },
  );

  it.each(["and", "but", "or", "so", "yet"])(
    "joins lines when previous line ends with conjunction '%s' even though next is uppercase",
    (conjunction) => {
      const sentences = [
        `The value was missing ${conjunction}`,
        "TheAmazingJohn can fix it.",
      ];
      const text = sentences.join("\n");
      const result = sentenceSegmentation.splitIntoSegments(text);
      expect(result.length).toBe(1);
      expect(substringInterval(text, result[0].interval)).toBe(text);
    },
  );

  it("infers sentence boundaries without punctuation on a double new line", () => {
    const sentences = [
      "Acceptance criteria",
      "The following validations are blocking for approval:",
    ];
    const text = sentences.join("\n\n");
    const result = sentenceSegmentation.splitIntoSegments(text);
    expect(substringInterval(text, result[0].interval)).toBe(sentences[0]);
    expect(substringInterval(text, result[1].interval)).toBe(sentences[1]);
  });

  it("includes number list format to the segmented sentence", () => {
    const sentences = [
      "The following validations are blocking for approval:",
      "1. An added validation doing something",
      "2.An added validation doing something else",
      "3.  An added validation doing something else",
    ];
    const text = sentences.join("\n");
    const result = sentenceSegmentation.splitIntoSegments(text);
    expect(result.length).toBe(4);
    expect(substringInterval(text, result[0].interval)).toBe(
      "The following validations are blocking for approval:",
    );
    expect(substringInterval(text, result[1].interval)).toBe(
      "1. An added validation doing something",
    );
    expect(substringInterval(text, result[2].interval)).toBe(
      "2.An added validation doing something else",
    );
    expect(substringInterval(text, result[3].interval)).toBe(
      "3.  An added validation doing something else",
    );
  });

  it("splits on known list item markers even though it is on the same line", () => {
    const sentences = ["1. do some", "• Do the thing"];
    const text = sentences.join(" ");
    const result = sentenceSegmentation.splitIntoSegments(text);
    expect(result.length).toBe(2);
    expect(substringInterval(text, result[0].interval)).toBe("1. do some");
    expect(substringInterval(text, result[1].interval)).toBe("• Do the thing");
  });

  it("removes empty sentences deriving from new lines", () => {
    const text = `
              I start on a new line
          `;
    const result = sentenceSegmentation.splitIntoSegments(text);
    expect(result.length).toBe(1);
    expect(substringInterval(text, result[0].interval)).toEqual(
      "I start on a new line",
    );
  });

  it("identifies identical sentences as unique intervals", () => {
    const text = "I am identical with. I am identical with.";
    const result = sentenceSegmentation.splitIntoSegments(text);
    expect(result.length).toBe(2);
    expect(substringInterval(text, result[0].interval)).toEqual(
      "I am identical with.",
    );
    expect(substringInterval(text, result[1].interval)).toEqual(
      "I am identical with.",
    );
    expect(isSameInterval(result[0].interval, result[1].interval)).toBeFalse();
  });

  it("intervals are always returned in ascending order from start", () => {
    const identicalText = "I am a twin.";
    const middleText = "I am a middleman.";
    const text = [identicalText, middleText, identicalText].join("\n");

    const result = sentenceSegmentation.splitIntoSegments(text);

    expect(result.length).toBe(3);
    expect(result[0].interval.start < result[1].interval.start).toBeTrue();
    expect(result[1].interval.start < result[2].interval.start).toBeTrue();
  });

  it.each<string>(["-", "=", ":"])(
    "sees only one sentence when a question mark is followed by explanatory seperator",
    (seperator) => {
      const start = "You are learning this today.";
      const weirdSentence = `? ${seperator} is a quationmark.`;
      const text = [start, weirdSentence].join("\n");

      const result = sentenceSegmentation.splitIntoSegments(text);

      expect(result.length).toBe(2);
      expect(substringInterval(text, result[0].interval)).toEqual(start);
      expect(substringInterval(text, result[1].interval)).toEqual(
        weirdSentence,
      );
    },
  );

  it("seperates by question marks", () => {
    const sentence = [
      "Are you okay ? The entire production database?",
      "What?",
      "Claude ?",
    ];
    const text = sentence.join("\n");

    const result = sentenceSegmentation.splitIntoSegments(text);

    expect(result.length).toBe(4);
    expect(substringInterval(text, result[0].interval)).toEqual(
      "Are you okay ?",
    );
    expect(substringInterval(text, result[1].interval)).toEqual(
      "The entire production database?",
    );
    expect(substringInterval(text, result[2].interval)).toEqual("What?");
    expect(substringInterval(text, result[3].interval)).toEqual("Claude ?");
  });

  it.each<string>(["in", "of", "for", "with", "to", "on", "at", "by"])(
    "does not seperate sentences with abbreviation of minimum and maximum followed by a preposition",
    (preposition) => {
      const minSentence = `The min. ${preposition} something`;
      const maxSentence = `The max. ${preposition} something`;

      const minResult = sentenceSegmentation.splitIntoSegments(minSentence);
      const maxResult = sentenceSegmentation.splitIntoSegments(maxSentence);

      expect(minResult.length).toBe(1);
      expect(substringInterval(minSentence, minResult[0].interval)).toEqual(
        minSentence,
      );

      expect(maxResult.length).toBe(1);
      expect(substringInterval(maxSentence, maxResult[0].interval)).toEqual(
        maxSentence,
      );
    },
  );
});
