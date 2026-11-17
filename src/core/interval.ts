import { removeDuplicates } from "./utils/string-utils.ts";

export type Interval = {
    start: number;
    end: number;
};

export const getNewInterval = (start: number, end: number) => ({
    start,
    end
});

export const isSameInterval = (intervalA: Interval, intervalB: Interval): boolean =>
    intervalA.start === intervalB.start && intervalA.end === intervalB.end;

export const getIntervalSize = (i: Interval): number => i.end - i.start;

export const substringInterval = (text: string, interval: Interval): string =>
    text.substring(interval.start, interval.end);

export const isSubInterval = (intervalA: Interval, intervalB: Interval): boolean =>
    intervalA.start >= intervalB.start && intervalA.end <= intervalB.end && getIntervalSize(intervalA) > 0;

export const removeSubIntervals = <T>(objects: T[], getInterval: (object: T) => Interval): T[] => {
    const result = [...objects];
    result.sort((a, b) => getInterval(a).start - getInterval(b).start);
    for (let i = 0; i + 1 < result.length; ++i) {
        while (i + 1 < result.length && isSubInterval(getInterval(result[i + 1]), getInterval(result[i])))
            result.splice(i + 1, 1);
    }
    return result;
};

export const removeIntervals = (text: string, intervals: Interval[]): string => {
    if (!intervals || intervals.length === 0) return text;

    const sorted = intervals.slice().sort((a, b) => a.start - b.start);
    let result = "";
    let lastIndex = 0;

    for (const interval of sorted) {
        result += text.slice(lastIndex, interval.start);
        lastIndex = interval.end;
    }

    result += text.slice(lastIndex);
    return result;
};

export const replaceIntervals = (text: string, intervals: Interval[], replacement: string): string => {
    if (intervals.length === 0) return text;

    const sorted = [...intervals].sort((a, b) => a.start - b.start);
    let result = "";
    let cursor = 0;
    for (const { start, end } of sorted) {
        if (start >= cursor) {
            result += text.slice(cursor, start) + replacement;
            cursor = end;
        }
    }
    return result + text.slice(cursor);
};

export const extractIntervals = (text: string, intervals: Interval[]): string[] => {
    const result: string[] = [];

    for (const { start, end } of intervals) {
        if (start < 0 || end > text.length || start > end) {
            throw new Error(`Invalid interval: [${start}, ${end}]`);
        }

        result.push(text.slice(start, end));
    }

    return result;
};

export const getInverseIntervals = (intervals: Interval[], superInterval: Interval): Interval[] => {
    const sorted: Interval[] = [
        { start: superInterval.start, end: superInterval.start },
        ...intervals,
        { start: superInterval.end, end: superInterval.end }
    ];
    sorted.sort((a, b) => a.start - b.start);
    const result: Interval[] = [];
    for (let i = 0; i + 1 < sorted.length; ++i) {
        result.push({ start: sorted[i].end, end: sorted[i + 1].start });
    }
    return result;
};

export const getFirstIntervalOf = (text: string, substring: string): Interval => {
    if (substring === "") return { start: 0, end: 0 };
    const index = text.indexOf(substring);
    if (index !== -1) {
        return { start: index, end: index + substring.length };
    }
    return { start: 0, end: 0 };
};

export const getLastIntervalOf = (text: string, substring: string): Interval => {
    if (substring === "") return { start: 0, end: 0 };
    const index = text.lastIndexOf(substring);
    if (index !== -1) {
        return { start: index, end: index + substring.length };
    }
    return { start: 0, end: 0 };
};

export const getIntervalsOf = (text: string, substring: string): Interval[] => {
    if (substring === "") return [];
    const intervals: Interval[] = [];
    let index = text.indexOf(substring);
    while (index !== -1) {
        intervals.push({ start: index, end: index + substring.length });
        index = text.indexOf(substring, index + 1);
    }
    return intervals;
};

export const getIntervals = (text: string, substrings: string[]): Interval[] => {
    return removeDuplicates(substrings)
        .map(subString => getIntervalsOf(text, subString))
        .flat();
};

export const listContainsInterval = (intervalList: Interval[], interval: Interval): boolean => {
    return intervalList.filter(listInterval => isSameInterval(listInterval, interval)).length > 0;
};

export const getOrderedFullCoverageIntervals = (text: string, intervals: Interval[]): Interval[] => {
    const textLength = text.length;

    if (intervals.length === 0) {
        return [{ start: 0, end: textLength }];
    }

    const sorted = [...intervals]
        .map(({ start, end }) => {
            if (start < 0 || end < 0) throw new Error("Negative interval");
            if (start > end) throw new Error("Start greater than end");
            if (end > textLength) throw new Error("End exceeds text length");
            return { start, end };
        })
        .sort((a, b) => a.start - b.start);

    const result: Interval[] = [];
    let cursor = 0;

    for (const { start, end } of sorted) {
        if (start > cursor) result.push({ start: cursor, end: start });
        result.push({ start, end });
        cursor = end;
    }

    if (cursor < textLength) result.push({ start: cursor, end: textLength });

    return result;
};

export const intervalToString = (interval: Interval): string => interval.start + " - " + interval.end;
