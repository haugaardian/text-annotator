import { createAnnotatedText } from "@core/nlp/text-analysis/annotated-text.ts";
import { createWinkNLPSentenceSegmentation } from "./node-dependent/wink/wink-nlp-sentence-segmentation.ts";
import { getDetectedHeaders } from "@core/nlp/text-analysis/segment-detectors/header-detection.ts";
import { getDetectedPaths } from "@core/nlp/text-analysis/segment-detectors/path-detection.ts";
import { getDetectedUrls } from "@core/nlp/text-analysis/segment-detectors/url-detection.ts";
import { getAttachmentReferences } from "@core/nlp/text-analysis/segment-detectors/attachment-reference.ts";
import { getDetectedListItemGroups } from "@core/nlp/text-analysis/list-item-groups.ts";
import { createWinkNLPPosTagger } from "./node-dependent/wink/wink-nlp-pos-tagging.ts";

const segmenter = createWinkNLPSentenceSegmentation();
const posTagger = createWinkNLPPosTagger();

export const getAnnotatedText = (text: string) =>
  createAnnotatedText(text, segmenter, [
    (t: string) => getDetectedHeaders(t, posTagger),
    getDetectedPaths,
    getDetectedUrls,
    getAttachmentReferences,
    (t: string) =>
      getDetectedListItemGroups(t, segmenter.splitIntoSegments(text)).flatMap(
        (g) => (g.leadIn ? [g.leadIn, ...g.items] : g.items),
      ),
  ]);
