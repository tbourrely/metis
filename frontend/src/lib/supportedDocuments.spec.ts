import { describe, it, expect } from "vitest";
import { isPdf } from "./supportedDocuments";

describe("isPdf", () => {
  it("returns true for URLs ending with .pdf extension", () => {
    expect(isPdf("https://mydomain.com/file.pdf")).toBe(true);
    expect(isPdf("https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_1.pdf")).toBe(true);
  });

  it("returns true for arXiv-style PDF URLs without .pdf extension", () => {
    expect(isPdf("https://arxiv.org/pdf/2505.18397")).toBe(true);
    expect(isPdf("https://arxiv.org/pdf/1234.56789v2")).toBe(true);
  });

  it("returns false for non-PDF URLs", () => {
    expect(isPdf("https://mydomain.com/file.docx")).toBe(false);
    expect(isPdf("https://mydomain.com/file.txt")).toBe(false);
    expect(isPdf("https://mydomain.com/article")).toBe(false);
  });

  it("returns false for invalid URLs", () => {
    expect(isPdf("not-a-url")).toBe(false);
  });
});
