import { useCallback, useEffect, useRef, useState } from "react";
import { getTextOffset, type RangeItem } from "../lib/highlighting";

/**
 * Custom hook to manage text highlighting within a container element.
 * It tracks highlighted ranges and updates them based on user selections.
 * @param initialRanges - Initial highlighted ranges.
 * @returns A tuple containing a ref to the container element and the current highlighted ranges.
 */
export default function useHighlightText(initialRanges: RangeItem[] = []) {
  const containerRef = useRef<HTMLDivElement>(null); // The container to attach eventlisteners to
  const [ranges, setRanges] = useState<RangeItem[]>(initialRanges);

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
  const pointerUpHandler = useCallback(() => {
    const handleRange = (
      rangeInfo: RangeItem,
    ): ((prev: RangeItem[]) => RangeItem[]) => {
      // TODO: handle overlapping
      return (prev: RangeItem[]) => {
        const existingIndex = prev.findIndex(
          (r) => r.start === rangeInfo.start && r.end === rangeInfo.end,
        );
        if (existingIndex !== -1) {
          return prev.filter((_, i) => i !== existingIndex);
        }

        return [...prev, rangeInfo];
      };
    };

    console.debug("Pointer up detected");
    const rangeInfo = selectionToRange();

    if (rangeInfo) {
      setRanges(handleRange(rangeInfo));
    }
  }, []);

  // Attach pointerup listener to container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    console.debug("Attaching pointerup listener");

    container.addEventListener("pointerup", pointerUpHandler);
    return () => {
      console.debug("Cleaning up pointerup listener");
      container.removeEventListener("pointerup", pointerUpHandler);
    };
  }, [containerRef, pointerUpHandler]);

  return [containerRef, ranges] as const;
}
