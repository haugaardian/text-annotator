import {
  getFirstIntervalOf,
  getIntervalsOf,
  isSameInterval,
} from "@core/interval.ts";
import { getAttachmentReferences } from "./attachment-reference.ts";

describe("a heuristic for detecting attachment references in a text", () => {
  it("finds a standalone attachment reference", () => {
    const ref =
      "image-20250626-080748.png [/rest/api/3/attachment/content/88457]";
    const result = getAttachmentReferences(ref);

    expect(result.length).toBe(1);
    expect(result[0].type.has("attachmentReference")).toBeTrue();
    expect(
      isSameInterval(result[0].interval, getFirstIntervalOf(ref, ref)),
    ).toBeTrue();
  });

  it("finds an attachment reference surrounded by text", () => {
    const before = "Here is the uploaded file:";
    const ref = "image.png [/rest/api/3/attachment/content/123]";
    const after = "I know... pretty weird.";
    const text = [before, ref, after].join("\n");

    const result = getAttachmentReferences(text);

    expect(result.length).toBe(1);
    expect(result[0].type.has("attachmentReference")).toBeTrue();
    expect(
      isSameInterval(result[0].interval, getFirstIntervalOf(text, ref)),
    ).toBeTrue();
  });

  it("finds two attachment references separated by space", () => {
    const ref = "file.png [/rest/api/3/attachment/content/1]";
    const text = [ref, ref].join(" ");

    const result = getAttachmentReferences(text);

    expect(result.length).toBe(2);
    const intervals = getIntervalsOf(text, ref);

    expect(result[0].type.has("attachmentReference")).toBeTrue();
    expect(result[1].type.has("attachmentReference")).toBeTrue();
    expect(isSameInterval(result[0].interval, intervals[0])).toBeTrue();
    expect(isSameInterval(result[1].interval, intervals[1])).toBeTrue();
  });

  it("does not detect a standalone path as an attachment reference", () => {
    const text = "/rest/api/3/attachment/content/88457";
    const result = getAttachmentReferences(text);

    expect(result.length).toBe(0);
  });

  it("does not detect a filename without bracketed path", () => {
    const text = "image.png /rest/api/3/attachment/content/88457";
    const result = getAttachmentReferences(text);

    expect(result.length).toBe(0);
  });

  it("does not detect malformed bracket structure", () => {
    const text = "image.png (/rest/api/3/attachment/content/88457)";
    const result = getAttachmentReferences(text);

    expect(result.length).toBe(0);
  });
});
