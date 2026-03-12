export type RangeItem = {
  start: number;
  end: number;
};

// ApplyMode indicates whether to apply or unapply a highlight
export enum ApplyMode {
  APPLY,
  UNAPPLY,
}

// Update represents a change to be made to a Range in the DOM
type Update = {
  range: Range;
  replacement?: Node;
};

// MarkNode represents a node and its start and end offsets
type MarkNode = {
  node: Node;
  start: number;
  end: number;
};

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

const parentNodeIfText = (node: MarkNode): MarkNode => {
  if (node.node.nodeType === Node.TEXT_NODE && node.node.parentNode) {
    const newNode = node.node.parentNode;
    const newStart = getTextOffset(node.node, node.start, newNode);
    const newEnd = getTextOffset(node.node, node.end, newNode);
    console.debug(
      "Wrapping text node, using parent and adjusted offset:",
      newNode,
      newNode.nodeType,
      newStart,
      newEnd,
    );
    return {
      node: newNode,
      start: newStart,
      end: newEnd,
    };
  }
  return node;
};

// Wrap text in container from rangeInfo.start to rangeInfo.end with <mark> elements
// Works in two passes: first, find the start and end nodes, then apply the wrapping
const wrapFromTextOffset = (rangeInfo: RangeItem, container: Node) => {
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
  );

  const updates: Array<Update> = [];
  let startNode: MarkNode | undefined = undefined;
  let endNode: MarkNode | undefined = undefined;
  let currentOffset = 0;

  let currentNode;
  while ((currentNode = walker.nextNode())) {
    console.debug("Visiting node:", currentNode.textContent);
    console.debug("Current offset:", currentOffset);
    const nodeLength = currentNode.textContent?.length || 0;

    console.debug("Node length:", nodeLength);
    console.debug("Range info:", rangeInfo);
    console.debug("CurrentOffset + nodeLength:", currentOffset + nodeLength);

    if (!startNode && currentOffset + nodeLength > rangeInfo.start) {
      console.debug(
        "Determined start node:",
        currentNode.textContent,
        currentNode.nodeType,
      );

      const startNodeOffset = rangeInfo.start - currentOffset;

      if (startNodeOffset === 0) {
        if (currentOffset + nodeLength == rangeInfo.end) {
          console.debug(
            "Range exactly matches node length:",
            currentNode.textContent,
          );

          startNode = parentNodeIfText({
            node: currentNode,
            start: 0,
            end: nodeLength,
          });
          endNode = startNode;
          break;
        }

        console.debug("Node wrapping from start");
        startNode = parentNodeIfText({
          node: currentNode,
          start: 0,
          end: nodeLength,
        });
      } else {
        console.debug(
          "partial start node wrapping",
          startNodeOffset,
          nodeLength,
        );

        startNode = parentNodeIfText({
          node: currentNode,
          start: startNodeOffset,
          end: nodeLength,
        });
      }
    }

    if (currentOffset + nodeLength >= rangeInfo.end) {
      console.debug("End of range found in node:", currentNode.textContent);
      const endNodeOffset = rangeInfo.end - currentOffset;

      endNode = parentNodeIfText({
        node: currentNode,
        start: 0,
        end: endNodeOffset,
      });
      break;
    }

    currentOffset += nodeLength;
    console.debug("Updated current offset:", currentOffset);
  }

  if (!startNode || !endNode) {
    console.debug(startNode, endNode);
    console.error("Could not determine start or end node, aborting.");
    return;
  }

  console.debug("Start node:", startNode);
  console.debug("End node:", endNode);

  if (endNode.node.contains(startNode.node)) {
    console.debug(
      "End node contains start node, adjusting start node to end node.",
    );

    const prev = startNode;
    startNode = endNode;
    startNode.start = prev.start;
  }

  if (startNode.node === endNode.node) {
    console.debug("Start and end node are the same:", startNode.node);

    const range = document.createRange();
    range.setStartBefore(startNode.node);
    range.setEndAfter(endNode.node);
    updates.push({
      range,
      replacement: wrap(
        startNode.node.cloneNode(true),
        startNode.start,
        endNode.end,
      ),
    });
  } else {
    console.debug("Start and end nodes are different.");
    const startRange = document.createRange();
    startRange.setStartBefore(startNode.node);
    startRange.setEndAfter(startNode.node);
    updates.push({
      range: startRange,
      replacement: wrap(
        startNode.node.cloneNode(true),
        startNode.start,
        startNode.end,
      ),
    });

    const endRange = document.createRange();
    endRange.setStartBefore(endNode.node);
    endRange.setEndAfter(endNode.node);
    updates.push({
      range: endRange,
      replacement: wrap(
        endNode.node.cloneNode(true),
        endNode.start,
        endNode.end,
      ),
    });
  }

  console.debug("Collected updates:", updates.length);

  updates.forEach(({ range }) => {
    console.debug(
      "Range to delete:",
      range.startContainer,
      range.startOffset,
      range.endContainer,
      range.endOffset,
    );
    range.deleteContents();
  });

  updates.reverse().forEach(({ range, replacement }) => {
    if (!replacement) return;

    console.debug(
      "Inserting node:",
      replacement.nodeName,
      replacement.nodeType,
      replacement.nodeType === Node.TEXT_NODE
        ? replacement.textContent
        : (replacement as HTMLElement).innerHTML,
    );

    range.insertNode(replacement);
  });
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

  try {
    switch (mode) {
      case ApplyMode.APPLY:
        wrapFromTextOffset(range, c);
        break;
      case ApplyMode.UNAPPLY:
        unwrap(c as DocumentFragment);
        break;
      default:
        throw new Error("Invalid ApplyMode");
    }
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
      console.debug("Skipping text node, before startOffset");
      return;
    }

    if (currentOffset > endOffset) {
      console.debug("No more wrapping needed");
      return;
    }

    console.debug("currentOffset:", currentOffset);
    const nodeStart = Math.max(0, startOffset - currentOffset);
    const nodeEnd = Math.min(
      textNode.textContent!.length,
      endOffset - currentOffset,
    );

    if (nodeStart === 0 && nodeEnd === textNode.textContent!.length) {
      console.debug("Highlighting entire text node", nodeStart, nodeEnd);
      const mark = document.createElement("mark");
      mark.textContent = textNode.textContent;
      textNode.parentNode?.replaceChild(mark, textNode);
      currentOffset += textNode.textContent!.length;
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
