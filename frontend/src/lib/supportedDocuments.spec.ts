import { describe, it, expect } from "vitest";
import { isPdf } from "./supportedDocuments";

describe("isSupportedDocument", () => {
  it("returns true for supported document types", () => {
    expect(isPdf("mydomain.com/file.pdf")).toBe(true);
  });

  it("returns false for unsupported document types", () => {
    expect(isPdf("mydomain.com/file.docx")).toBe(false);
    expect(isPdf("mydomain.com/file.txt")).toBe(false);
  });
});
