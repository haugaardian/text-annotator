import { getFirstIntervalOf, getIntervalsOf, isSameInterval } from "@core/interval.ts";
import { getDetectedPaths } from "./path-detection.ts";

describe("a heuristic for detecting paths in a text", () => {
    it("finds a unix-style api path that is standalone", () => {
        const path = "/rest/api/3/attachment/content/1234";
        const result = getDetectedPaths(path);
        expect(result.length).toBe(1);
        expect(result[0].type.has("path")).toBeTrue();
        expect(isSameInterval(result[0].interval, getFirstIntervalOf(path, path))).toBeTrue();
    });

    it("finds a unix file path that is standalone", () => {
        const path = "/usr/local/bin/node";
        const result = getDetectedPaths(path);
        expect(result.length).toBe(1);
        expect(result[0].type.has("path")).toBeTrue();
        expect(isSameInterval(result[0].interval, getFirstIntervalOf(path, path))).toBeTrue();
    });

    it("finds a path surrounded by text", () => {
        const before = "You can find the file here ";
        const path = "/home/user/documents/theanswertoeverything.pdf";
        const after = " but do not open without caution.";
        const text = [before, path, after].join("");
        const result = getDetectedPaths(text);
        expect(result.length).toBe(1);
        expect(result[0].type.has("path")).toBeTrue();
        expect(isSameInterval(result[0].interval, getFirstIntervalOf(text, path))).toBeTrue();
    });

    it("finds a path surrounded by brackets", () => {
        const before = "[";
        const path = "/some/content";
        const after = "]";
        const text = [before, path, after].join("");
        const result = getDetectedPaths(text);
        expect(result.length).toBe(1);
        expect(result[0].type.has("path")).toBeTrue();
        expect(isSameInterval(result[0].interval, getFirstIntervalOf(text, path))).toBeTrue();
    });

    it("finds two paths in a text seperated by space", () => {
        const path = "/api/v2/users/profile/settings";
        const text = [path, path].join(" ");
        const result = getDetectedPaths(text);
        expect(result.length).toBe(2);
        expect(result[0].type.has("path")).toBeTrue();
        expect(result[1].type.has("path")).toBeTrue();
        const intervals = getIntervalsOf(text, path);
        expect(isSameInterval(result[0].interval, intervals[0])).toBeTrue();
        expect(isSameInterval(result[1].interval, intervals[1])).toBeTrue();
    });

    it("does not detect a plain sentence as a path", () => {
        const text = "The quick brown fox jumps over the lazy dog.";
        const result = getDetectedPaths(text);
        expect(result.length).toBe(0);
    });

    it("does not detect a website url as a path", () => {
        const text = "https://www.netflix.com/watch/70136120";
        const result = getDetectedPaths(text);
        expect(result.length).toBe(0);
    });
});
