import { useCallback, useEffect, useState, type RefObject } from "react";
import { getTextOffset, type RangeItem } from "../lib/highlighting";

/**
 * Custom hook to manage text highlighting within a container element.
 * It tracks highlighted ranges and updates them based on user selections.
 * @param initialRanges - Initial highlighted ranges.
 * @returns A tuple containing a ref to the container element and the current highlighted ranges.
 */
export default function useHighlightText(
  containerRef: RefObject<HTMLDivElement | null>,
  initialRanges: RangeItem[] = [],
) {
  // const containerRef = useRef<HTMLDivElement>(null); // The container to attach eventlisteners to
  const [ranges, setRanges] = useState<RangeItem[]>(initialRanges);

  // Handle adding or removing a range in state
  const pointerUpHandler = useCallback(() => {
    const selectionToRange = (): RangeItem | undefined => {
      console.debug("Converting selection to range");
      if (!containerRef?.current) return;
      console.debug("Container ref current:", containerRef.current);
      const selection = window.getSelection();
      console.debug("Current selection:", selection);
      if (!selection || selection.toString().length <= 0) return;
      console.debug("Selection string:", selection.toString());
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

      console.debug("Computed range offsets:", result);

      return result;
    };

    const handleRange = (
      rangeInfo: RangeItem,
    ): ((prev: RangeItem[]) => RangeItem[]) => {
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
    console.debug("Selected range info:", rangeInfo);

    if (rangeInfo) {
      setRanges(handleRange(rangeInfo));
    }
  }, [containerRef]);

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

  return [ranges] as const;
}
