export type RangeItem = {
  start: number;
  end: number;
};

// ApplyMode indicates whether to apply or unapply a highlight
export enum ApplyMode {
  APPLY,
  UNAPPLY,
}

// Get absolute text offset in container
// Example: if container has "Hello <b>World</b>!", and node is the text node "World" with offset 2, this returns 8
// (5 for "Hello", 1 for space, 2 into "World")
export const getTextOffset = (
  node: Node,
  offset: number,
  container: Node,
): number => {
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
export const createRangeFromTextOffset = (
  rangeInfo: RangeItem,
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

/**
 * Apply or unapply a highlight range to a container node, without modifying the original node.
 * @param range The range to apply or unapply
 * @param container The container node
 * @param mode ApplyMode.APPLY to highlight, ApplyMode.UNAPPLY to remove highlight
 * @returns A new Node with the range applied or unapplied
 */
export const applyRange = (
  range: RangeItem,
  container: Node,
  mode: ApplyMode,
): Node => {
  const c = container.cloneNode(true);
  console.debug("Applying range:", range, "Mode:", ApplyMode[mode]);
  const domRange = createRangeFromTextOffset(range, c);
  if (!domRange) return c;

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
  } catch (error) {
    console.error("Error applying range:", error);
  }

  return c;
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
    console.debug("Wrapping text node:", textNode.textContent);
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
