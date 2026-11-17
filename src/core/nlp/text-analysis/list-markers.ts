import { Interval, substringInterval } from "@core/interval.ts";

type ListMarkerType = "numbered" | "paren" | "bullet" | "lettered";

type NumberedListMarker = {
  interval: Interval;
  listMarkerType: "numbered";
  number: number;
};

type OtherListMarker = {
  interval: Interval;
  listMarkerType: Exclude<ListMarkerType, "numbered">;
};

export type ListMarker = NumberedListMarker | OtherListMarker;

export const getListMarkers = (text: string): ListMarker[] => {
  const markers: ListMarker[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Numbered: digits followed by a dot
    if (isDigit(char) && isStartOfLine(text, i)) {
      let j = i;
      while (j < text.length && isDigit(text[j])) j++;
      if (text[j] === ".") {
        markers.push({
          interval: { start: i, end: j + 1 },
          listMarkerType: "numbered",
          number: Number(substringInterval(text, { start: i, end: j })),
        });
        i = j;
        continue;
      }
    }

    // Parentheses: (digits)
    if (char === "(" && isStartOfLine(text, i)) {
      let j = i + 1;
      while (j < text.length && isDigit(text[j])) j++;
      if (text[j] === ")") {
        markers.push({
          interval: { start: i, end: j + 1 },
          listMarkerType: "paren",
        });
        i = j;
        continue;
      }
    }

    // Bullet: •
    if (char === "•") {
      markers.push({
        interval: { start: i, end: i + 1 },
        listMarkerType: "bullet",
      });
      continue;
    }

    // Lettered: a-z or A-Z followed by .
    if (isLetter(char) && text[i + 1] === "." && isStartOfLine(text, i)) {
      markers.push({
        interval: { start: i, end: i + 2 },
        listMarkerType: "lettered",
      });
      i += 1;
      continue;
    }
  }

  return markers;
};

const isDigit = (c: string) => {
  return c >= "0" && c <= "9";
};

const isLetter = (c: string) => {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
};

const isStartOfLine = (text: string, index: number) => {
  if (index === 0) return true;
  for (let j = index - 1; j >= 0; j--) {
    if (text[j] === "\n") return true;
    if (!/\s/.test(text[j])) return false;
  }
  return true;
};
