import {
  PartOfSpeechTagging,
  PosTag,
  PosTagResult,
} from "@core/nlp/part-of-speech-tagging.ts";
import winkNLP, { Document, TokenItsFunction } from "wink-nlp";
import model from "wink-eng-lite-model";
import { getNewIndex, Index } from "@core/utils/list-utils.ts";

export const createWinkNLPPosTagger = (): PartOfSpeechTagging => {
  const nlp = winkNLP(model);
  const its = nlp.its;

  const getCustomEntitiesIndices = (doc: Document): Set<Index> => {
    const indices: Set<Index> = new Set();
    const customEntities = doc.customEntities();
    for (let i = 0; i < customEntities.length(); i++) {
      const entity = customEntities.itemAt(i);
      const entityTokens = entity.tokens();
      const startIdx = entityTokens.itemAt(0).index();
      for (let j = startIdx; j < startIdx + entityTokens.length(); j++) {
        indices.add(getNewIndex(j));
      }
    }
    return indices;
  };

  return {
    tagSentence: (sentence: string) => {
      const doc = nlp.readDoc(sentence);
      const tokens = doc.tokens();

      const customIndices = getCustomEntitiesIndices(doc);

      const tagged: PosTagResult[] = [];
      for (let i = 0; i < tokens.length(); i++) {
        const t = tokens.itemAt(i);
        const isCustom = customIndices.has(getNewIndex(t.index()));

        tagged.push({
          value: t.out(),
          lemma: t.out(its.lemma as TokenItsFunction<string>),
          posTag: isCustom ? "noun" : winkNLPTagToOrigoTag(t.out(its.pos)),
        });
      }
      return tagged;
    },
  };
};

const winkNLPTagToOrigoTag = (winkNLPTag: string): PosTag => {
  if (winkNLPTag === "ADJ") return "adjective";
  if (winkNLPTag === "ADP") return "adposition";
  if (winkNLPTag === "ADV") return "adverb";
  if (winkNLPTag === "AUX") return "auxiliary";
  if (winkNLPTag === "CCONJ") return "coordinating conjuction";
  if (winkNLPTag === "DET") return "determiner";
  if (winkNLPTag === "INTJ") return "interjection";
  if (winkNLPTag === "NOUN") return "noun";
  if (winkNLPTag === "NUM") return "numeral";
  if (winkNLPTag === "PART") return "particle";
  if (winkNLPTag === "PRON") return "pronoun";
  if (winkNLPTag === "PROPN") return "proper noun";
  if (winkNLPTag === "PUNCT") return "punctuation marks";
  if (winkNLPTag === "SCONJ") return "subordinating conjuction";
  if (winkNLPTag === "SYM") return "symbol";
  if (winkNLPTag === "VERB") return "verb";
  if (winkNLPTag === "SPACE") return "space";
  return "other";
};
