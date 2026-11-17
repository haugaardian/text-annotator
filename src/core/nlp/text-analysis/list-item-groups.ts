import { Interval, isSubInterval, substringInterval } from "@core/interval.ts";
import { getListMarkers, ListMarker } from "./list-markers.ts";
import { getNewTextSegment, TextSegment } from "./text-segment.ts";

type ListItemGroup = { items: TextSegment[]; leadIn: TextSegment | undefined };

type ListGroupMarker =
    | ListMarker
    | {
          interval: Interval;
          listMarkerType: "key-value-colon";
      }
    | {
          interval: Interval;
          listMarkerType: "key-value-dash";
      };

export const getDetectedListItemGroups = (input: string, sentences: TextSegment[]): ListItemGroup[] => {
    const markers = getListMarkers(input);
    const markerSentences = markers
        .map(marker => {
            const sentenceIndex = sentences.findIndex(s => isSubInterval(marker.interval, s.interval));
            return sentenceIndex === -1 ? undefined : { marker, sentenceIndex };
        })
        .filter(Boolean) as {
        marker: ListMarker;
        sentenceIndex: number;
    }[];

    const keyValueMarkers: { marker: ListGroupMarker; sentenceIndex: number }[] = [];
    for (let i = 0; i < sentences.length; i++) {
        const kvMarker = detectKeyValuePattern(input, sentences[i]);
        if (kvMarker) {
            keyValueMarkers.push({ marker: kvMarker, sentenceIndex: i });
        }
    }

    const validKeyValueMarkers = filterKeyValueGroups(keyValueMarkers);

    const allMarkers = [...markerSentences, ...validKeyValueMarkers].sort((a, b) => a.sentenceIndex - b.sentenceIndex);

    const groups: ListItemGroup[] = [];
    let currentGroup: TextSegment[] = [];
    let lastMarker: ListGroupMarker | undefined;
    let groupLeadIn: TextSegment | undefined;

    for (let i = 0; i < allMarkers.length; i++) {
        const { marker, sentenceIndex } = allMarkers[i];
        const nextMarkerSentenceIndex = allMarkers[i + 1]?.sentenceIndex;
        const endSentenceIndex = getItemEndSentenceIndex(input, sentenceIndex, nextMarkerSentenceIndex, sentences);
        const itemInterval: Interval = {
            start: sentences[sentenceIndex].interval.start,
            end: sentences[endSentenceIndex].interval.end
        };

        if (shouldBreakGroup(lastMarker, marker) && currentGroup.length > 0) {
            groups.push({ items: currentGroup, leadIn: groupLeadIn });
            currentGroup = [];
            groupLeadIn = undefined;
        }

        if (currentGroup.length === 0) {
            const prevMarkerIndex = i > 0 ? allMarkers[i - 1].sentenceIndex : undefined;
            groupLeadIn = detectLeadIn(input, sentences, sentenceIndex, prevMarkerIndex);
        }

        currentGroup.push(
            getNewTextSegment({
                interval: itemInterval,
                references: groupLeadIn === undefined ? [] : [groupLeadIn],
                type: new Set(["listItem"])
            })
        );
        lastMarker = marker;
    }
    if (currentGroup.length > 0) {
        groups.push({ items: currentGroup, leadIn: groupLeadIn });
    }

    return groups;
};

const detectLeadIn = (
    input: string,
    sentences: TextSegment[],
    firstItemIndex: number,
    prevListItemIndex: number | undefined
): TextSegment | undefined => {
    if (firstItemIndex === 0) return undefined;
    const prevSentenceIndex = firstItemIndex - 1;
    if (prevListItemIndex !== undefined && prevSentenceIndex <= prevListItemIndex) return undefined;
    const prevSentence = sentences[prevSentenceIndex];
    const text = substringInterval(input, prevSentence.interval);
    if (text.trimEnd().endsWith(":"))
        return getNewTextSegment({ interval: prevSentence.interval, type: new Set(["listLeadIn"]) });
    return undefined;
};

const detectKeyValuePattern = (input: string, sentence: TextSegment): ListGroupMarker | undefined => {
    const text = substringInterval(input, sentence.interval);

    const colonMatch = text.match(/^[A-Za-z?]{1,3}\s*:\s+\S/);
    if (colonMatch) {
        return {
            interval: sentence.interval,
            listMarkerType: "key-value-colon"
        };
    }

    const dashMatch = text.match(/^[A-Za-z?]{1,3}\s+-\s+\S/);
    if (dashMatch) {
        return {
            interval: sentence.interval,
            listMarkerType: "key-value-dash"
        };
    }

    return undefined;
};

const filterKeyValueGroups = (
    markers: { marker: ListGroupMarker; sentenceIndex: number }[]
): { marker: ListGroupMarker; sentenceIndex: number }[] => {
    if (markers.length < 2) return [];

    const groups: { marker: ListGroupMarker; sentenceIndex: number }[][] = [];
    let currentGroup: { marker: ListGroupMarker; sentenceIndex: number }[] = [];

    for (let i = 0; i < markers.length; i++) {
        const current = markers[i];
        const prev = markers[i - 1];

        if (currentGroup.length === 0) {
            currentGroup.push(current);
        } else if (
            prev &&
            current.marker.listMarkerType === prev.marker.listMarkerType &&
            current.sentenceIndex === prev.sentenceIndex + 1
        ) {
            currentGroup.push(current);
        } else {
            if (currentGroup.length >= 2) {
                groups.push(currentGroup);
            }
            currentGroup = [current];
        }
    }

    if (currentGroup.length >= 2) {
        groups.push(currentGroup);
    }

    return groups.flat();
};

const shouldBreakGroup = (last: ListGroupMarker | undefined, current: ListGroupMarker): boolean =>
    !last || current.listMarkerType !== last.listMarkerType || isNumberingReset(last, current);

const getItemEndSentenceIndex = (
    input: string,
    sentenceIndex: number,
    nextMarkerIndex: number | undefined,
    sentences: TextSegment[]
): number => {
    const maxEndIndex = nextMarkerIndex !== undefined ? nextMarkerIndex - 1 : sentences.length - 1;

    let endIndex = sentenceIndex;
    for (let i = sentenceIndex + 1; i <= maxEndIndex; i++) {
        if (hasParagraphBreakBetween(input, sentences[i - 1].interval, sentences[i].interval)) {
            break;
        }
        endIndex = i;
    }
    return endIndex;
};

const hasParagraphBreakBetween = (input: string, a: Interval, b: Interval): boolean => {
    const between = input.slice(a.end, b.start);
    return /\n\s*\n/.test(between);
};

const isNumberingReset = (prev: ListGroupMarker, next: ListGroupMarker): boolean => {
    if (prev.listMarkerType !== "numbered") return false;
    if (next.listMarkerType !== "numbered") return false;
    if (prev.number === undefined || next.number === undefined) return false;
    return next.number !== prev.number + 1;
};
