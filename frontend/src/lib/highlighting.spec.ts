import { describe, it, expect, beforeEach } from "vitest";
import {
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

  it("applyRange wraps and unwraps text with <mark>", () => {
    container.innerHTML = "<p>one <strong>two</strong> three</p>";

    const applied = applyRange(
      { start: 4, end: 7 },
      container,
      ApplyMode.APPLY,
    );
    expect(applied).toBe(true);
    // ensure mark was inserted
    expect(container.querySelector("mark")?.textContent).toBe("two");

    const unapplied = applyRange(
      { start: 4, end: 7 },
      container,
      ApplyMode.UNAPPLY,
    );
    expect(unapplied).toBe(true);
    // mark nodes may be removed or left empty depending on DOM normalization; ensure text restored
    const mark = container.querySelector("mark");
    if (mark) {
      expect((mark.textContent || "").trim().length).toBe(0);
    }
    // text should be back
    expect(container.textContent?.replace(/\s+/g, " ")).toContain(
      "one two three",
    );
  });
});

