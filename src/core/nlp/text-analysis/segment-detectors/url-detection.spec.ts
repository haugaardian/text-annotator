import {
  getFirstIntervalOf,
  getIntervalsOf,
  isSameInterval,
} from "@core/interval.ts";
import { getDetectedUrls } from "./url-detection.ts";

describe("a heuristic for detecting urls in a text", () => {
  it("finds a website url that is standalone", () => {
    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const result = getDetectedUrls(url);
    expect(result.length).toBe(1);
    expect(result[0].type.has("url")).toBeTrue();
    expect(
      isSameInterval(result[0].interval, getFirstIntervalOf(url, url)),
    ).toBeTrue();
  });

  it("finds a url surrounded by text", () => {
    const before = "I was reading this interesting article yesterday.";
    const url = "https://en.wikipedia.org/wiki/Banana";
    const after = "It was so interesting.";
    const text = [before, url, after].join("\n");
    const result = getDetectedUrls(text);
    expect(result.length).toBe(1);
    expect(result[0].type.has("url")).toBeTrue();
    expect(
      isSameInterval(result[0].interval, getFirstIntervalOf(text, url)),
    ).toBeTrue();
  });

  it("finds two urls in a text seperated with a space", () => {
    const url = "https://github.com/anthropics/anthropic-sdk-python";
    const text = [url, url].join(" ");
    const result = getDetectedUrls(text);
    expect(result.length).toBe(2);
    expect(result[0].type.has("url")).toBeTrue();
    expect(result[1].type.has("url")).toBeTrue();
    const intervals = getIntervalsOf(text, url);
    expect(isSameInterval(result[0].interval, intervals[0])).toBeTrue();
    expect(isSameInterval(result[1].interval, intervals[1])).toBeTrue();
  });

  it("does not detect a plain path as a url", () => {
    const text = "/rest/api/3/attachment/content";
    const result = getDetectedUrls(text);
    expect(result.length).toBe(0);
  });

  it("does not detect a plain sentence as a url", () => {
    const text = "The quick brown fox jumps over the lazy dog.";
    const result = getDetectedUrls(text);
    expect(result.length).toBe(0);
  });
});
