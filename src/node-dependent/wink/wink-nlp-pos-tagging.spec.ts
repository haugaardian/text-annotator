import { createWinkNLPPosTagger } from "./wink-nlp-pos-tagging.ts";

describe("Part of Speech acceptance criteria", () => {
  const posTagging = createWinkNLPPosTagger();

  it("can detect adjectives", () => {
    const examples = ["red", "unique", "rare", "happy"];
    for (const example of examples) {
      const posTag = posTagging.tagSentence(example)[0].posTag;
      expect(posTag === "adjective").toBeTrue();
    }
  });

  it("can detect adposition", () => {
    const examples = ["in", "of"];
    for (const example of examples) {
      expect(
        posTagging.tagSentence(example)[0].posTag === "adposition",
      ).toBeTrue();
    }
  });

  it("can detect adverb", () => {
    const examples = ["Very", "briefly", "soon"];
    for (const example of examples) {
      expect(posTagging.tagSentence(example)[0].posTag === "adverb").toBeTrue();
    }
  });

  it("can detect auxiliary", () => {
    const examples = ["do", "did", "is", "am", "are", "should", "must", "will"];
    for (const example of examples) {
      expect(
        posTagging.tagSentence(example)[0].posTag === "auxiliary",
      ).toBeTrue();
    }
  });

  it("can detect coordinating conjuction", () => {
    const examples = ["and", "or", "but"];
    for (const example of examples) {
      expect(
        posTagging.tagSentence(example)[0].posTag === "coordinating conjuction",
      ).toBeTrue();
    }
  });

  it("can detect determiner", () => {
    const examples = ["this"];
    for (const example of examples) {
      expect(
        posTagging.tagSentence(example)[0].posTag === "determiner",
      ).toBeTrue();
    }
  });

  it("can detect interjection", () => {
    const examples = ["Alas", "oh", "wow"];
    for (const example of examples) {
      expect(
        posTagging.tagSentence(example)[0].posTag === "interjection",
      ).toBeTrue();
    }
  });

  it("can detect noun", () => {
    const examples = ["dog", "table", "chair"];
    for (const example of examples) {
      expect(posTagging.tagSentence(example)[0].posTag === "noun").toBeTrue();
    }
  });

  it("can detect numeral", () => {
    const examples = ["one", "five", "3.14", "100"];
    for (const example of examples) {
      expect(
        posTagging.tagSentence(example)[0].posTag === "numeral",
      ).toBeTrue();
    }
  });

  it("can detect particle", () => {
    const examples = ["'s", "not", "n't"];
    for (const example of examples) {
      expect(
        posTagging.tagSentence(example)[0].posTag === "particle",
      ).toBeTrue();
    }
  });

  it("can detect pronoun", () => {
    const examples = [
      "you",
      "I",
      "he",
      "she",
      "myself",
      "what",
      "who",
      "something",
      "nobody",
    ];
    for (const example of examples) {
      expect(
        posTagging.tagSentence(example)[0].posTag === "pronoun",
      ).toBeTrue();
    }
  });

  it("can detect proper noun", () => {
    const examples = ["John Smith", "London", "UN"];
    for (const example of examples) {
      expect(
        posTagging.tagSentence(example)[0].posTag === "proper noun",
      ).toBeTrue();
    }
  });

  it("can detect punctuation marks", () => {
    const examples = [".", ",", "()"];
    for (const example of examples) {
      expect(
        posTagging.tagSentence(example)[0].posTag === "punctuation marks",
      ).toBeTrue();
    }
  });

  it("can detect subordinating conjuction", () => {
    const examples = ["that", "if", "while"];
    for (const example of examples) {
      expect(
        posTagging.tagSentence(example)[0].posTag ===
          "subordinating conjuction",
      ).toBeTrue();
    }
  });

  it("can detect symbol", () => {
    const examples = ["$", "😝", "+", "="];
    for (const example of examples) {
      expect(posTagging.tagSentence(example)[0].posTag === "symbol").toBeTrue();
    }
  });

  it("can detect verb", () => {
    const examples = ["run", "sing", "develop"];
    for (const example of examples) {
      expect(posTagging.tagSentence(example)[0].posTag === "verb").toBeTrue();
    }
  });

  it("non detectable words are detected as other", () => {
    const examples = ["形"];
    for (const example of examples) {
      expect(posTagging.tagSentence(example)[0].posTag === "other").toBeTrue();
    }
  });

  it("can detect spaces", () => {
    const examples = ["\n", "\t"];
    for (const example of examples) {
      expect(posTagging.tagSentence(example)[0].posTag === "space").toBeTrue();
    }
  });

  it("can lemmatize verbs to their base form (imperative)", () => {
    const examples = [
      { original: "made", expected: "make" },
      { original: "running", expected: "run" },
      { original: "checked", expected: "check" },
      { original: "applied", expected: "apply" },
      { original: "is", expected: "be" },
    ];

    for (const { original, expected } of examples) {
      const result = posTagging.tagSentence(original)[0];
      expect(result.lemma).toBe(expected);
    }
  });

  it("can lemmatize plural nouns to singular", () => {
    const examples = [
      { original: "scores", expected: "score" },
      { original: "houses", expected: "house" },
      { original: "indices", expected: "index" },
      { original: "criteria", expected: "criterion" },
    ];

    for (const { original, expected } of examples) {
      const result = posTagging.tagSentence(original)[0];
      expect(result.lemma).toBe(expected);
    }
  });
});
