import { DOMRendererOptions } from ".";

export const nodeOps: Omit<DOMRendererOptions, "patchProp"> = {
  createElement: (tagName) => {
    return document.createElement(tagName);
  },

  createText: (text: string) => {
    return document.createTextNode(text);
  },

  setElementText(node, text) {
    node.textContent = text;
  },

  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },

  setText: (node, text) => {
    node.nodeValue = text;
  },

  parentNode: (node) => {
    return node.parentNode;
  },
};
