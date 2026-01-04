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
    console.debug("Visiting node:", currentNode.textContent);
    const nodeLength = currentNode.textContent?.length || 0;

    if (!startNode && currentOffset + nodeLength >= rangeInfo.start) {
      startNode = currentNode;
      startNodeOffset = rangeInfo.start - currentOffset;

      if (startNodeOffset === 0) {
        if (currentOffset + nodeLength == rangeInfo.end) {
          console.debug(
            "Range exactly matches node length:",
            currentNode.textContent,
          );
          if (startNode.parentNode) {
            console.debug("Using parent node as range:", startNode.parentNode);
            startNode = startNode.parentNode;
            startNodeOffset = 0;
            endNode = startNode;
            endNodeOffset = 1;
            break;
          }
        } else if (currentOffset + nodeLength < rangeInfo.end) {
          console.debug(
            "Range extends beyond current node, but covers it fully.",
          );
          startNode = currentNode.parentNode || currentNode;
          startNodeOffset = 0;
        }
      }
    }

    if (currentOffset + nodeLength >= rangeInfo.end) {
      console.debug("End of range found in node:", currentNode.textContent);
      endNode = currentNode;
      endNodeOffset = rangeInfo.end - currentOffset;
      break;
    }

    currentOffset += nodeLength;
  }

  if (startNode && endNode) {
    const range = document.createRange();
    if (startNode.nodeType === Node.ELEMENT_NODE) {
      range.setStartBefore(startNode);
    } else {
      range.setStart(startNode, startNodeOffset);
    }
    range.setEnd(endNode, endNodeOffset);
    console.debug(startNode.nodeType);
    console.debug(endNode.nodeType);
    return range;
  }

  return null;
};

// FIXME: This function is incomplete and may not handle all cases correctly
// - bug with wrapping when range starts at 0 of a text node
// TODO: Rewrite this function to be more robust + update tests
export const wrapFromTextOffset = (rangeInfo: RangeItem, container: Node) => {
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

  const updates: Array<{ range: Range; node: Node }> = [];

  let currentNode;
  while ((currentNode = walker.nextNode())) {
    console.debug("Visiting node:", currentNode.textContent);
    console.debug("Current offset:", currentOffset);
    const nodeLength = currentNode.textContent?.length || 0;

    if (!startNode && currentOffset + nodeLength >= rangeInfo.start) {
      startNode = currentNode;
      startNodeOffset = rangeInfo.start - currentOffset;

      if (startNodeOffset === 0) {
        if (currentOffset + nodeLength == rangeInfo.end) {
          console.debug(
            "Range exactly matches node length:",
            currentNode.textContent,
          );
          if (startNode.parentNode) {
            console.debug("Using parent node as range:", startNode.parentNode);
            startNode = startNode.parentNode;
            startNodeOffset = 0;
            endNode = startNode;
            endNodeOffset = 1;
            console.debug("wrapping range", startNodeOffset, nodeLength);
            wrap(startNode, startNodeOffset, nodeLength);
            break;
          }
        } else if (currentOffset + nodeLength < rangeInfo.end) {
          console.debug(
            "Range extends beyond current node, but covers it fully.",
          );
          startNode = currentNode.parentNode || currentNode;
          startNodeOffset = rangeInfo.start - currentOffset;

          console.debug("wrapping range", startNodeOffset, nodeLength);
          const wrapped = wrap(
            startNode.cloneNode(true),
            startNodeOffset,
            nodeLength,
          );
          const range = new Range();
          range.setStartBefore(startNode);
          range.setEndAfter(startNode);
          updates.push({ range: range, node: wrapped });
        }
      }
    }

    if (currentOffset + nodeLength >= rangeInfo.end) {
      console.debug("End of range found in node:", currentNode.textContent);
      endNode = currentNode;
      endNodeOffset = rangeInfo.end - currentOffset;
      console.debug("wrapping range", 0, endNodeOffset);
      const wrapped = wrap(
        endNode.parentNode!.cloneNode(true),
        0,
        endNodeOffset,
      );
      const range = new Range();
      range.setStartBefore(endNode.parentNode!);
      range.setEndAfter(endNode.parentNode!);
      updates.push({ range: range, node: wrapped });
      break;
    }

    currentOffset += nodeLength;
    console.debug("Updated current offset:", currentOffset);
  }

  updates.forEach(({ range, node }) => {
    console.debug(
      node.nodeName,
      node.textContent,
      (node as HTMLElement).innerHTML,
    );
    range.deleteContents();
  });

  updates.reverse().forEach(({ range, node }) => {
    console.debug(
      "Inserting node:",
      node.nodeName,
      node.textContent,
      (node as HTMLElement).innerHTML,
    );
    range.insertNode(node);
  });

  // if (startNode && endNode) {
  // const range = document.createRange();
  // if (startNode.nodeType === Node.ELEMENT_NODE) {
  //   range.setStartBefore(startNode);
  // } else {
  //   range.setStart(startNode, startNodeOffset);
  // }
  // range.setEnd(endNode, endNodeOffset);
  // console.debug(startNode.nodeType);
  // console.debug(endNode.nodeType);
  // return range;
  // }

  // return null;
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
  // const domRange = createRangeFromTextOffset(range, c);
  // if (!domRange) return c;
  //
  // console.debug(
  //   "Created DOM Range:",
  //   domRange.startContainer,
  //   domRange.startContainer.textContent,
  //   domRange.startOffset,
  //   domRange.endContainer,
  //   domRange.endContainer.textContent,
  //   domRange.endOffset,
  // );

  try {
    wrapFromTextOffset(range, c);
    // const fragment = domRange.cloneContents();
    // const treeWalker = document.createTreeWalker(c, NodeFilter.SHOW_ALL, null);
    // const nodesToProcess: Node[] = [];
    // let currentNode: Node | null = treeWalker.nextNode();
    // while (currentNode) {
    //   nodesToProcess.push(currentNode);
    //   currentNode = treeWalker.nextNode();
    // }
    //
    // nodesToProcess.forEach((node) => {
    //   if (node.nodeType === Node.TEXT_NODE) {
    //     if (node === domRange.startContainer) {
    //       console.debug("Processing start container:", node.textContent);
    //
    //       let current = node;
    //       while (
    //         current.parentNode &&
    //         !current.parentNode.contains(domRange.endContainer)
    //       ) {
    //         current = current.parentNode;
    //       }
    //
    //       console.debug(
    //         "Wrapping from start container up to:",
    //         current.nodeName,
    //       );
    //
    //       current.parentNode?.removeChild(current);
    //     }
    //
    //     if (node === domRange.endContainer) {
    //       console.debug("Processing end container:", node.textContent);
    //       // node.parentNode?.parentNode?.removeChild(node.parentNode);
    //     }
    //   }
    // });

    // const fragment = domRange.deleteContents();
    // const fragment = domRange.extractContents();
    //
    // for (const child of Array.from(fragment.childNodes)) {
    //   console.debug("Extracted node:", child.nodeName, child.textContent);
    //   console.debug(
    //     child.childNodes[0].nodeName,
    //     child.childNodes[0].textContent,
    //   );
    // }
    //
    // let appliedFragment: Node;
    // switch (mode) {
    //   case ApplyMode.APPLY:
    //     appliedFragment = wrap(fragment);
    //     break;
    //   case ApplyMode.UNAPPLY:
    //     appliedFragment = unwrap(fragment);
    //     break;
    //   default:
    //     throw new Error("Invalid ApplyMode");
    // }
    // domRange.insertNode(appliedFragment);
  } catch (error) {
    console.error("Error applying range:", error);
  }

  return c;
};

// Wrap text nodes in a fragment with <mark> elements
const wrap = (fragment: Node, startOffset: number, endOffset: number): Node => {
  console.debug("Wrapping fragment from", startOffset, "to", endOffset);
  const walker = document.createTreeWalker(
    fragment,
    NodeFilter.SHOW_TEXT,
    null,
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  let currentOffset = 0;

  textNodes.forEach((textNode) => {
    console.debug("Wrapping text node:", textNode.textContent);

    if (currentOffset + textNode.textContent!.length < startOffset) {
      currentOffset += textNode.textContent!.length;
      return;
    }

    if (currentOffset > endOffset) {
      return;
    }

    const nodeStart = Math.max(0, startOffset - currentOffset);
    const nodeEnd = Math.min(
      textNode.textContent!.length,
      endOffset - currentOffset,
    );

    if (nodeStart === 0 && nodeEnd === textNode.textContent!.length) {
      console.debug("Highlighting entire text node");
      const mark = document.createElement("mark");
      mark.textContent = textNode.textContent;
      textNode.parentNode?.replaceChild(mark, textNode);
    } else {
      console.debug("Highlighting partial text node:", nodeStart, nodeEnd);
      const beforeText = textNode.textContent!.slice(0, nodeStart);
      const highlightText = textNode.textContent!.slice(nodeStart, nodeEnd);
      const afterText = textNode.textContent!.slice(nodeEnd);

      const fragment = document.createDocumentFragment();
      if (beforeText) {
        fragment.appendChild(document.createTextNode(beforeText));
      }
      if (highlightText) {
        const mark = document.createElement("mark");
        mark.textContent = highlightText;
        fragment.appendChild(mark);
      }
      if (afterText) {
        fragment.appendChild(document.createTextNode(afterText));
      }

      textNode.parentNode?.replaceChild(fragment, textNode);

      currentOffset += textNode.textContent!.length;
    }

    // const span = document.createElement("mark");
    // span.textContent = textNode.textContent;
    // textNode.parentNode?.replaceChild(span, textNode);
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
