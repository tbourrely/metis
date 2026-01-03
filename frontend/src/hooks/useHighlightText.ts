import { useCallback, useEffect, useRef, useState } from "react";

// RangeInfo repsents the start and end offsets of a text highlight within a container
type RangeInfo = {
  start: number;
  end: number;
};

// ApplyMode indicates whether to apply or unapply a highlight
enum ApplyMode {
  APPLY,
  UNAPPLY,
}

// Get absolute text offset in container
const getTextOffset = (node: Node, offset: number, container: Node): number => {
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
  );

  let totalOffset = 0;
  let currentNode;

  while ((currentNode = walker.nextNode())) {
    if (currentNode === node) {
      return totalOffset + offset;
    }
    totalOffset += currentNode.textContent?.length || 0;
  }

  return totalOffset;
};

// Create range from text offset
const createRangeFromTextOffset = (
  rangeInfo: RangeInfo,
  container: Node,
): Range | null => {
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
  );

  let currentOffset = 0;
  let startNode: Node | null = null;
  let startNodeOffset = 0;
  let endNode: Node | null = null;
  let endNodeOffset = 0;

  let currentNode;
  while ((currentNode = walker.nextNode())) {
    const nodeLength = currentNode.textContent?.length || 0;

    if (!startNode && currentOffset + nodeLength >= rangeInfo.start) {
      startNode = currentNode;
      startNodeOffset = rangeInfo.start - currentOffset;
    }

    if (currentOffset + nodeLength >= rangeInfo.end) {
      endNode = currentNode;
      endNodeOffset = rangeInfo.end - currentOffset;
      break;
    }

    currentOffset += nodeLength;
  }

  if (startNode && endNode) {
    const range = document.createRange();
    range.setStart(startNode, startNodeOffset);
    range.setEnd(endNode, endNodeOffset);
    return range;
  }

  return null;
};

// Apply or unapply highlight for a given range
const applyRange = (range: RangeInfo, container: Node, mode: ApplyMode) => {
  console.log("Applying range:", range, "Mode:", ApplyMode[mode]);
  const domRange = createRangeFromTextOffset(range, container);
  if (!domRange) return false;

  try {
    const fragment = domRange.extractContents();
    let appliedFragment: DocumentFragment;

    switch (mode) {
      case ApplyMode.APPLY:
        appliedFragment = wrap(fragment);
        break;
      case ApplyMode.UNAPPLY:
        appliedFragment = unwrap(fragment);
        break;
      default:
        throw new Error("Invalid ApplyMode");
    }

    domRange.insertNode(appliedFragment);
    return true;
  } catch (error) {
    console.error("Error applying range:", error);
    return false;
  }
};

// Wrap text nodes in a fragment with <mark> elements
const wrap = (fragment: DocumentFragment): DocumentFragment => {
  const walker = document.createTreeWalker(
    fragment,
    NodeFilter.SHOW_TEXT,
    null,
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((textNode) => {
    if (textNode.textContent?.trim().length === 0) return; // Skip empty text nodes
    console.log("Wrapping text node:", textNode.textContent);
    const span = document.createElement("mark");
    span.textContent = textNode.textContent;
    textNode.parentNode?.replaceChild(span, textNode);
  });

  return fragment;
};

// Unwrap <mark> elements in a fragment
const unwrap = (fragment: DocumentFragment): DocumentFragment => {
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) =>
      node.nodeName.toLowerCase() === "mark"
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP,
  });

  const markNodes = [];
  while (walker.nextNode()) {
    markNodes.push(walker.currentNode);
  }

  markNodes.forEach((markNode) => {
    const parent = markNode.parentNode;
    while (markNode.firstChild) {
      parent?.insertBefore(markNode.firstChild, markNode);
    }
    parent?.removeChild(markNode);
  });

  return fragment;
};

export default function useHighlightText(
  callback: (r: RangeInfo) => unknown = () => {},
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ranges, setRanges] = useState<RangeInfo[]>([]);

  // Convert current selection to RangeInfo
  const selectionToRange = (): RangeInfo | undefined => {
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
    rangeInfo: RangeInfo,
  ): ((prev: RangeInfo[]) => RangeInfo[]) => {
    // TODO: handle overlapping
    return (prev: RangeInfo[]) => {
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
