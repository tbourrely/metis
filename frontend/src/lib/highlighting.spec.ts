import { describe, it, expect, beforeEach } from "vitest";
import {
  getTextOffset,
  createRangeFromTextOffset,
  applyRange,
  ApplyMode,
} from "./highlighting";

describe("highlighting utils", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  describe("createRangeFromTextOffset", () => {
    it("createRangeFromTextOffset selects text inside a single node", () => {
      container.innerHTML = "<p>one <strong>two</strong> three</p>";

      const range = createRangeFromTextOffset({ start: 4, end: 7 }, container);
      expect(range).toBeTruthy();
      expect(range?.toString()).toBe("two");
    });

    it("createRangeFromTextOffset selects across multiple elements", () => {
      container.innerHTML = "<div><p>start</p><p>end</p></div>";

      const range = createRangeFromTextOffset({ start: 0, end: 8 }, container);
      expect(range).toBeTruthy();
      expect(range?.toString()).toBe("startend");
    });
  });

  describe("applyRange", () => {
    it("applyRange wraps and unwraps text with <mark>", () => {
      container.innerHTML = "<p>one <strong>two</strong> three</p>";

      const applied = applyRange(
        { start: 4, end: 7 },
        container,
        ApplyMode.APPLY,
      );
      // ensure mark was inserted
      expect((applied as HTMLElement).querySelector("mark")?.textContent).toBe(
        "two",
      );

      const unapplied = applyRange(
        { start: 4, end: 7 },
        applied,
        ApplyMode.UNAPPLY,
      );
      // mark nodes may be removed or left empty depending on DOM normalization; ensure text restored
      const mark = (unapplied as HTMLElement).querySelector("mark");
      if (mark) {
        expect((mark.textContent || "").trim().length).toBe(0);
      }
      // text should be back
      expect(unapplied.textContent?.replace(/\s+/g, " ")).toContain(
        "one two three",
      );
    });
  });

  describe("getTextOffset", () => {
    it("getTextOffset accumulates offsets across text nodes", () => {
      container.innerHTML = "<p>one <strong>two</strong> three</p>";
      const p = container.querySelector("p")!;
      const first = p.firstChild as Text;
      const strong = p.querySelector("strong")!;
      const strongText = strong.firstChild as Text;
      const last = p.childNodes[2] as Text;

      expect(getTextOffset(first, 1, container)).toBe(1);
      expect(getTextOffset(strongText, 0, container)).toBe(4);
      expect(getTextOffset(strongText, 3, container)).toBe(7);
      expect(getTextOffset(last, last.textContent.length, container)).toBe(
        first.textContent.length +
          strongText.textContent.length +
          last.textContent.length,
      );
    });

    it("getTextOffset works across sibling elements", () => {
      container.innerHTML = "<div><p>start</p><p>end</p></div>";
      const ps = container.querySelectorAll("p")!;
      const startNode = ps[0].firstChild as Text;
      const endNode = ps[1].firstChild as Text;

      expect(getTextOffset(startNode, 0, container)).toBe(0);
      expect(getTextOffset(endNode, 2, container)).toBe(5 + 2);
    });
  });
});
