import { describe, it, expect, beforeEach } from "vitest";
import { getTextOffset, applyRange, ApplyMode } from "./highlighting";

const minifyHtml = (html: string) => html.replace(/\s+/g, " ").trim();

describe("highlighting utils", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  describe("applyRange", () => {
    describe("applyRange with list items", () => {
      it("applyRange handles partial list items selection from begining to end with offset", () => {
        container.innerHTML =
          "<ul><li>first item</li><li>second item</li></ul>";

        const applied = applyRange(
          { start: 0, end: 11 },
          container,
          ApplyMode.APPLY,
        );

        const appliedText = (applied as HTMLElement).innerHTML;

        const expected =
          "<ul><li><mark>first item</mark></li><li><mark>s</mark>econd item</li></ul>";
        expect(appliedText).toBe(expected);
      });

      it("applyRange handles partial list item selection with start end offset", () => {
        container.innerHTML =
          "<ul><li>first item</li><li>second item</li></ul>";

        const applied = applyRange(
          { start: 2, end: 15 },
          container,
          ApplyMode.APPLY,
        );

        const appliedText = (applied as HTMLElement).innerHTML;

        const expected =
          "<ul><li>fi<mark>rst item</mark></li><li><mark>secon</mark>d item</li></ul>";
        expect(appliedText).toBe(expected);
      });

      it("applyRange handles partial list item selection with start offset to end", () => {
        container.innerHTML =
          "<ul><li>first item</li><li>second item</li></ul>";

        const applied = applyRange(
          { start: 10, end: 21 },
          container,
          ApplyMode.APPLY,
        );

        const appliedText = (applied as HTMLElement).innerHTML;

        const expected =
          "<ul><li>first item</li><li><mark>second item</mark></li></ul>";
        expect(appliedText).toBe(expected);
      });

      it("applyRange handles full list item selection", () => {
        container.innerHTML =
          "<ul><li>first item</li><li>second item</li></ul>";

        const applied = applyRange(
          { start: 0, end: 21 },
          container,
          ApplyMode.APPLY,
        );

        const appliedText = (applied as HTMLElement).innerHTML;

        const expected =
          "<ul><li><mark>first item</mark></li><li><mark>second item</mark></li></ul>";
        expect(appliedText).toBe(expected);
      });
    });

    describe("applyRange paragraphs", () => {
      it("should highlight strong text in paragraph", () => {
        container.innerHTML = "<p>one <strong>two</strong> three</p>";

        const applied = applyRange(
          { start: 4, end: 7 },
          container,
          ApplyMode.APPLY,
        );
        // ensure mark was inserted
        expect((applied as HTMLElement).innerHTML).toBe(
          "<p>one <strong><mark>two</mark></strong> three</p>",
        );
      });

      it("should highglight the whole paragraph", () => {
        container.innerHTML = "<p>hello world</p>";

        const applied = applyRange(
          { start: 0, end: 11 },
          container,
          ApplyMode.APPLY,
        );

        const appliedText = (applied as HTMLElement).innerHTML;

        const expected = "<p><mark>hello world</mark></p>";
        expect(appliedText).toBe(expected);
      });

      it("should handle long paragraphs", () => {
        const html = `<p>Large language models (LLMs) are an indisputable breakthrough of the last five
years, potentially profoundly changing the way that we work.  As with any
extraordinarily powerful tool, LLM use has both promise and peril — and that
they are so general-purpose leaves real questions about how and when they
should be used.  The landscape is shifting so rapidly that static prescription
is unlikely - but that LLMs are evolving so quickly also gives urgency to the
question: <strong>how should LLMs be used at Oxide</strong>?</p>`;
        const expected = `<p>Large<mark> language</mark> models (LLMs) are an indisputable breakthrough of the last five
years, potentially profoundly changing the way that we work.  As with any
extraordinarily powerful tool, LLM use has both promise and peril — and that
they are so general-purpose leaves real questions about how and when they
should be used.  The landscape is shifting so rapidly that static prescription
is unlikely - but that LLMs are evolving so quickly also gives urgency to the
question: <strong>how should LLMs be used at Oxide</strong>?</p>`;

        container.innerHTML = minifyHtml(html);
        console.debug("Container HTML:", container.innerHTML);

        const applied = applyRange(
          { start: 5, end: 14 },
          container,
          ApplyMode.APPLY,
        );

        expect((applied as HTMLElement).innerHTML).toBe(minifyHtml(expected));
      });

      it("should highlight text withing paragraph in list items", () => {
        const html = `
<ul><li><p><strong>Responsibility</strong>:  In terms of LLM use at Oxide, our lodestar is our sense of
responsibility.  However powerful they may be, LLMs are but a tool, ultimately
acting at the behest of a human. Oxide employees bear responsibility for the
artifacts we create, whatever automation we might employ to create them.  That
is, human judgement remains firmly in the loop: even if or as an LLM is
generating an artifact that we will use (writing, test cases, documentation,
code, etc.), their output is the responsibility of the human using them.</p></li><li><p><strong>Rigor</strong>: LLMs are double-edged with respect to rigor.  On the one hand,
wielded carefully, they can help us sharpen our own thinking by pointing out
holes in our own reasoning or otherwise providing thought-provoking
suggestions.  On the other, if used recklessly or thoughtlessly, they can have
the opposite effect, replacing crisp thinking with generated flotsam.  LLMs are
useful in as much as they promote and reinforce our rigor.</p></li><li><p><strong>Empathy</strong>: Be we readers or writers, there are humans on the other end of our
language use.  As we use LLMs, we must keep in mind our empathy for that human,
be they the one who is consuming our writing, or the one who has written what
we are reading.</p></li><li><p><strong>Teamwork</strong>: We are working together on a shared endeavor, and we must be sure
that our LLM use does not undermine our sense of teamwork.  Specifically, we
must be careful to not use LLMs in such a way as to undermine the trust that we
have in one another.  In some cases, LLM usage is going to be warranted (or
otherwise expected), and in others it won’t be.  Note this isn’t as simple as
disclosure of usage:  in some contexts, volunteering that an LLM has been used
to generate work product may implicitly distance oneself from the
responsibility for the content - and erode the trust that is essential for
teamwork.</p></li><li><p><strong>Urgency</strong>: Urgency seems natural with a tool that can seemingly do so much
knowledge work so quickly, but with respect to LLM use, too many organizations
have seemingly enshrined urgency over all else. These organizations treat LLMs
as an opportunity to increase pace over all else, seemingly without regard for
setting direction.  Urgency is certainly important, and LLMs absolutely afford
an opportunity to do work more quickly - but that pace must not come at the
expense of our responsibility, rigor, empathy and teamwork.</p></li></ul>
        `;

        const expected = `
<ul><li><p><strong>Responsibility</strong>:  <mark>In</mark> terms of LLM use at Oxide, our lodestar is our sense of
responsibility.  However powerful they may be, LLMs are but a tool, ultimately
acting at the behest of a human. Oxide employees bear responsibility for the
artifacts we create, whatever automation we might employ to create them.  That
is, human judgement remains firmly in the loop: even if or as an LLM is
generating an artifact that we will use (writing, test cases, documentation,
code, etc.), their output is the responsibility of the human using them.</p></li><li><p><strong>Rigor</strong>: LLMs are double-edged with respect to rigor.  On the one hand,
wielded carefully, they can help us sharpen our own thinking by pointing out
holes in our own reasoning or otherwise providing thought-provoking
suggestions.  On the other, if used recklessly or thoughtlessly, they can have
the opposite effect, replacing crisp thinking with generated flotsam.  LLMs are
useful in as much as they promote and reinforce our rigor.</p></li><li><p><strong>Empathy</strong>: Be we readers or writers, there are humans on the other end of our
language use.  As we use LLMs, we must keep in mind our empathy for that human,
be they the one who is consuming our writing, or the one who has written what
we are reading.</p></li><li><p><strong>Teamwork</strong>: We are working together on a shared endeavor, and we must be sure
that our LLM use does not undermine our sense of teamwork.  Specifically, we
must be careful to not use LLMs in such a way as to undermine the trust that we
have in one another.  In some cases, LLM usage is going to be warranted (or
otherwise expected), and in others it won’t be.  Note this isn’t as simple as
disclosure of usage:  in some contexts, volunteering that an LLM has been used
to generate work product may implicitly distance oneself from the
responsibility for the content - and erode the trust that is essential for
teamwork.</p></li><li><p><strong>Urgency</strong>: Urgency seems natural with a tool that can seemingly do so much
knowledge work so quickly, but with respect to LLM use, too many organizations
have seemingly enshrined urgency over all else. These organizations treat LLMs
as an opportunity to increase pace over all else, seemingly without regard for
setting direction.  Urgency is certainly important, and LLMs absolutely afford
an opportunity to do work more quickly - but that pace must not come at the
expense of our responsibility, rigor, empathy and teamwork.</p></li></ul>
        `;

        container.innerHTML = minifyHtml(html);
        const applied = applyRange(
          { start: 16, end: 18 },
          container,
          ApplyMode.APPLY,
        );

        expect((applied as HTMLElement).innerHTML).toBe(minifyHtml(expected));
      });
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
