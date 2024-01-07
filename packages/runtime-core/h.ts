import { VNode, VNodeProps } from "./vnode";

export function h(
  type: string,
  props: VNodeProps,
  children: (VNode | string)[]
): VNode {
  return { type, props, children };
}
