export type Interval = {
  start: number;
  end: number;
};

export const getNewInterval = (start: number, end: number) => ({
  start,
  end,
});

export const isSameInterval = (
  intervalA: Interval,
  intervalB: Interval,
): boolean =>
  intervalA.start === intervalB.start && intervalA.end === intervalB.end;

export const getIntervalSize = (i: Interval): number => i.end - i.start;

export const substringInterval = (text: string, interval: Interval): string =>
  text.substring(interval.start, interval.end);

export const isSubInterval = (
  intervalA: Interval,
  intervalB: Interval,
): boolean =>
  intervalA.start >= intervalB.start &&
  intervalA.end <= intervalB.end &&
  getIntervalSize(intervalA) > 0;

export const getFirstIntervalOf = (
  text: string,
  substring: string,
): Interval => {
  if (substring === "") return { start: 0, end: 0 };
  const index = text.indexOf(substring);
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
