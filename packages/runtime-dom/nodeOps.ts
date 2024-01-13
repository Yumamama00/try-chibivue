import { DOMRendererOptions } from ".";

// DOMに依存したRendererOptionsの実装 (patchProp除く)
export const nodeOps: Omit<DOMRendererOptions, "patchProp"> = {
  // 指定されたタグの要素のインスタンスを作成する
  createElement: (tagName) => {
    return document.createElement(tagName);
  },

  // 指定された値からテキスト文字列を作成する
  createText: (text: string) => {
    return document.createTextNode(text);
  },

  // 参照先ノード(referenceNode)の前に親ノード(parent)の子として指定されたノード(child)を挿入する
  insert: (child, parent, referenceNode) => {
    parent.insertBefore(child, referenceNode || null);
  },

  // NodeのtextContentを設定する
  setElementText(node, text) {
    node.textContent = text;
  },

  // NodeのnodeValueを設定する
  setText: (node, text) => {
    node.nodeValue = text;
  },

  // Nodeの親ノードを返す
  parentNode: (node) => {
    return node.parentNode;
  },
};
