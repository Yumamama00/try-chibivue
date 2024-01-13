import { VNode, VNodeProps, createVNode } from "./vnode";

// 仮想ノードを生成する関数
export function h(
  type: string | object,
  props: VNodeProps,
  children: (VNode | string)[]
): VNode {
  return createVNode(type, props, children);
}
