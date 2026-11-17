import { TextSegmentation } from "@core/nlp/text-segmentation.ts";
import winkNLP from "wink-nlp";
import model from "wink-eng-lite-model";
import { getIntervalsOf } from "@core/interval.ts";
import { removeDuplicates, splitOnNewlines } from "@core/utils/string-utils.ts";
import { getListMarkers } from "@core/nlp/text-analysis/list-markers.ts";
import { getNewTextSegment } from "@core/nlp/text-analysis/text-segment.ts";

export const createWinkNLPSentenceSegmentation = (): TextSegmentation => {
  const nlp = winkNLP(model);
  const listMarkerPlaceholder = "__LIST_MARKER__";
  const fileExtPlaceholder = "__FILE_EXT_DOT__";
  const quotedPeriodPlaceholder = "__QUOTED_PERIOD__";
  const protectedQuestionPlaceholder = "__QUESTION_LITERAL__";
  const minMaxPlaceholder = "__MINMAX_DOT__";

  const FILE_EXTENSION_RE =
    /(\b\w+\b)([ \t]*\.[ \t]*)(png|jpg|jpeg|pdf|txt|java)\b/gi;

  const QUOTE_PAIRS = [
    ['"', '"'],
    ["'", "'"],
    ['"', '"'],
    ["\u201C", "\u201D"],
    [`\u2018`, `\u2019`],
    ["«", "»"],
    ["‹", "›"],
  ];

  const protectQuotedPeriods = (text: string): string => {
    let result = text;

    for (const [open, close] of QUOTE_PAIRS) {
      const escapedOpen = open.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedClose = close.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const regex = new RegExp(
        `${escapedOpen}([^${escapedOpen}${escapedClose}]*?)${escapedClose}`,
        "g",
      );

      result = result.replace(regex, (_, content) => {
        const protectedContent = content.replace(
          /\./g,
          quotedPeriodPlaceholder,
        );
        return `${open}${protectedContent}${close}`;
      });
    }

    return result;
  };

  const protectLiteralQuestionMarks = (text: string): string => {
    return text.replace(
      /(^|\n|\s{2,})\?(?=\s*[-\u2013\u2014:=]\s*[a-z])/g,
      (_, prefix) => `${prefix}${protectedQuestionPlaceholder}`,
    );
  };

  return {
    splitIntoSegments: (t: string) => {
      const { cleaned, positionMap } = stripInvisible(t);

      const markers = getListMarkers(cleaned);

      let protectedText = "";
      let cursor = 0;

      markers.forEach((marker) => {
        protectedText += cleaned.slice(cursor, marker.interval.start);
        protectedText += "\n";
        let markerText = cleaned.slice(
          marker.interval.start,
          marker.interval.end,
        );
        markerText = markerText.replace(".", listMarkerPlaceholder);
        protectedText += markerText;
        cursor = marker.interval.end;
      });
      protectedText += cleaned.slice(cursor);

      protectedText = protectedText.replace(
        FILE_EXTENSION_RE,
        (_, name, dot, ext) =>
          `${name}${dot.replace(".", fileExtPlaceholder)}${ext}`,
      );

      protectedText = protectQuotedPeriods(protectedText);

      protectedText = protectLiteralQuestionMarks(protectedText);

      const MIN_MAX_ABBREV_RE = /\b(min|max)\.(?=\s+[a-z])/gi;
      protectedText = protectedText.replace(
        MIN_MAX_ABBREV_RE,
        `$1${minMaxPlaceholder}`,
      );

      const processedText = joinContinuations(
        splitOnNewlines(protectedText),
        listMarkerPlaceholder,
      );
      return removeDuplicates(
        processedText
          .flatMap((t) => {
            const doc = nlp.readDoc(t);
            return doc
              .sentences()
              .out()
              .filter((s) => s.length > 0);
          })
          .flat(),
      )
        .map((sentence) =>
          getIntervalsOf(
            cleaned,
            sentence
              .replace(new RegExp(listMarkerPlaceholder, "g"), ".")
              .replace(new RegExp(fileExtPlaceholder, "g"), ".")
              .replace(new RegExp(quotedPeriodPlaceholder, "g"), ".")
              .replace(new RegExp(protectedQuestionPlaceholder, "g"), "?")
              .replace(new RegExp(minMaxPlaceholder, "g"), "."),
          ),
        )
        .flat()
        .map((interval) => {
          return {
            start: positionMap[interval.start] ?? interval.start,
            end:
              positionMap[interval.end - 1] !== undefined
                ? positionMap[interval.end - 1] + 1
                : interval.end,
          };
        })
        .map((interval) => getNewTextSegment({ interval }))
        .sort((a, b) => a.interval.start - b.interval.start);
    },
  };
};

const INVISIBLE_REGEX = /\p{Cf}|\p{Mn}/gu;
const ASCII_SPACE_REGEX = /[\u202F]/g;

const stripInvisible = (
  input: string,
): {
  cleaned: string;
  positionMap: number[];
} => {
  let cleaned = "";
  const positionMap: number[] = [];

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (ASCII_SPACE_REGEX.test(char)) {
      cleaned += " ";
      positionMap.push(i);
    } else if (INVISIBLE_REGEX.test(char)) {
      INVISIBLE_REGEX.lastIndex = 0;
      ASCII_SPACE_REGEX.lastIndex = 0;
      continue;
    } else {
      cleaned += char;
      positionMap.push(i);
    }

    INVISIBLE_REGEX.lastIndex = 0;
    ASCII_SPACE_REGEX.lastIndex = 0;
  }

  return { cleaned, positionMap };
};
const joinContinuations = (
  arr: string[],
  listMarkerPlaceholder: string,
): string[] => {
  return arr.reduce((acc: string[], current: string) => {
    if (acc.length === 0) {
      acc.push(current);
      return acc;
    }
    const prev = acc[acc.length - 1];
    if (isContinuation(prev, current, listMarkerPlaceholder)) {
      acc[acc.length - 1] += "\n" + current;
    } else {
      acc.push(current);
    }
    return acc;
  }, []);
};

const HANGING_WORDS =
  /\b(in|on|at|by|with|for|from|of|to|the|a|an|and|but|or|so|yet)$/i;

const isContinuation = (
  prev: string,
  next: string,
  listMarkerPlaceholder: string,
): boolean => {
  const firstWord = next.split(" ")[0];
  if (firstWord.includes(listMarkerPlaceholder) || firstWord.includes("•"))
    return false;
  const startsWithLowercase = /^[a-z]/.test(next);
  const prevEndsWithHangingWord = HANGING_WORDS.test(prev);
  return startsWithLowercase || prevEndsWithHangingWord;
};
