import { substringInterval } from "@core/interval.ts";
import { getListMarkers } from "./list-markers.ts";

describe("identifying list markers in a text", () => {
    describe("identifying numbered list markers", () => {
        it("identifies a list marker in a single standalone sentence", () => {
            const text = "1. First";
            const listMarkers = getListMarkers(text);
            expect(listMarkers.length).toBe(1);
            const marker = listMarkers[0];
            if (marker.listMarkerType !== "numbered") throw new Error("fail");
            expect(substringInterval(text, marker.interval)).toBe("1.");
            expect(marker.number).toBe(1);
        });

        it("identifies a numbered marker without space after the dot", () => {
            const text = "2.Second item";
            const listMarkers = getListMarkers(text);
            expect(listMarkers.length).toBe(1);
            const marker = listMarkers[0];
            if (marker.listMarkerType !== "numbered") throw new Error("fail");
            expect(substringInterval(text, marker.interval)).toBe("2.");
            expect(marker.number).toBe(2);
        });

        it("does not falsely identify numbered text inside an address", () => {
            const text = "Address 2.th street";
            const listMarkers = getListMarkers(text);
            expect(listMarkers.length).toBe(0);
        });
    });

    describe("identifying parenthesis list markers", () => {
        it("identifies a parenthesis marker at the start of a sentence", () => {
            const text = "(1) First paragraph";
            const listMarkers = getListMarkers(text);
            expect(listMarkers.length).toBe(1);
            expect(substringInterval(text, listMarkers[0].interval)).toBe("(1)");
            expect(listMarkers[0].listMarkerType).toBe("paren");
        });

        it("does not identify a parenthesis marker in the middle of a sentence", () => {
            const text = "Coordinates (2) in text";
            const listMarkers = getListMarkers(text);
            expect(listMarkers.length).toBe(0);
        });
    });

    describe("identifying bullet markers", () => {
        it("identifies • as a bullet marker", () => {
            const text = "• Bullet point";
            const listMarkers = getListMarkers(text);
            expect(listMarkers.length).toBe(1);
            expect(substringInterval(text, listMarkers[0].interval)).toBe("•");
            expect(listMarkers[0].listMarkerType).toBe("bullet");
        });
    });

    describe("identifying lettered list markers", () => {
        it("identifies a lettered marker at the start of a sentence", () => {
            const text = "a. First lettered item";
            const listMarkers = getListMarkers(text);
            expect(listMarkers.length).toBe(1);
            expect(substringInterval(text, listMarkers[0].interval)).toBe("a.");
            expect(listMarkers[0].listMarkerType).toBe("lettered");
        });

        it("does not identify a lettered marker inside a sentence", () => {
            const text = "Some b. value";
            const listMarkers = getListMarkers(text);
            expect(listMarkers.length).toBe(0);
        });
    });
});
