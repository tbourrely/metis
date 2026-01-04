import { useEffect, useRef, useState } from "react";
import useHighlightText from "../../../../hooks/useHighlightText";
import { ApplyMode, applyRange, type RangeItem } from "../../../../lib/highlighting";

type ResourceContentHtmlProps = {
  html: string;
  read: boolean;
  ranges?: RangeItem[];
  onHighlight?: (ranges: RangeItem[]) => void;
};

export default function ResourceContentHtml({ html, read, ranges = [], onHighlight }: ResourceContentHtmlProps) {
  const [content, setContent] = useState<string>(html);
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalRanges] = useHighlightText(containerRef, ranges);
  const prevRangesRef = useRef<RangeItem[]>(ranges);

  const domParser = new DOMParser();
  const doc = domParser.parseFromString(html, "text/html");

  // Apply highlights to the content
  useEffect(() => {
    (async () => {
      const appliedContent = doc.body.cloneNode(true) as HTMLElement;
      internalRanges.forEach((range) => {
        const newContent = applyRange(range, appliedContent, ApplyMode.APPLY);
        appliedContent.innerHTML = (newContent as HTMLElement).innerHTML;
      });
      setContent(appliedContent.innerHTML);
    })();
  }, [internalRanges, doc.body]);

  // Notify parent of highlight changes
  useEffect(() => {
    if (prevRangesRef.current === internalRanges) return;
    prevRangesRef.current = internalRanges;
    // if (onHighlight)
    // onHighlight(internalRanges);
  }, [internalRanges, onHighlight]);

  return (
    <div
      ref={containerRef}
      className="mt-4 prose prose-xl max-w-none"
      style={{ opacity: read ? 0.8 : 1 }}
      dangerouslySetInnerHTML={{ __html: content }} />
  )
}
