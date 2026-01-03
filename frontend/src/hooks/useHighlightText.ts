import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApplyMode,
  applyRange,
  getTextOffset,
  type RangeItem,
} from "../lib/highlighting";

// FIXME:
// - issue when highlighing a list item
// - performance when many highlights
// - overlapping highlights
//
// Try to not modify the DOM directly but edit the content and re-render once instead
export default function useHighlightText(
  callback: (r: RangeItem) => unknown = () => {},
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ranges, setRanges] = useState<RangeItem[]>([]);

  // Convert current selection to RangeItem
  const selectionToRange = (): RangeItem | undefined => {
    if (!containerRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.toString().length <= 0) return;
    const range = selection.getRangeAt(0);

    const result = {
      start: getTextOffset(
        range.startContainer,
        range.startOffset,
        containerRef.current,
      ),
      end: getTextOffset(
        range.endContainer,
        range.endOffset,
        containerRef.current,
      ),
    };

    return result;
  };

  // Handle adding or removing a range in state
  const handleRange = (
    rangeInfo: RangeItem,
  ): ((prev: RangeItem[]) => RangeItem[]) => {
    // TODO: handle overlapping
    return (prev: RangeItem[]) => {
      const existingIndex = prev.findIndex(
        (r) => r.start === rangeInfo.start && r.end === rangeInfo.end,
      );
      if (existingIndex !== -1) {
        if (containerRef.current)
          applyRange(rangeInfo, containerRef.current, ApplyMode.UNAPPLY); // Unhighlight (update dom + state)
        return prev.filter((_, i) => i !== existingIndex);
      }

      return [...prev, rangeInfo];
    };
  };

  const pointerUpHandler = useCallback(() => {
    const rangeInfo = selectionToRange();

    if (rangeInfo) {
      setRanges(handleRange(rangeInfo));
      callback(rangeInfo);
    }
  }, [callback]);

  useEffect(() => {
    console.log("Applying existing ranges:", ranges);
    ranges.forEach((rangeInfo) => {
      if (!containerRef.current) {
        console.error("Container ref is null");
        return;
      }
      applyRange(rangeInfo, containerRef.current, ApplyMode.APPLY);
    });
  }, [ranges]);

  // Attach pointerup listener to container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    console.log("Attaching pointerup listener");

    container.addEventListener("pointerup", pointerUpHandler);
    return () => {
      console.log("Cleaning up pointerup listener");
      container.removeEventListener("pointerup", pointerUpHandler);
    };
  }, [containerRef, pointerUpHandler]);

  return [containerRef, ranges, setRanges] as const;
}
