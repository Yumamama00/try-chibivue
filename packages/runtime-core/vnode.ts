import { Ref } from "../reactivity/ref";
import { isObject, isString } from "../shared/general";
import { ShapeFlags } from "../shared/shapeFlags";
import { ComponentInternalInstance } from "./component";

export type VNodeTypes = string | typeof Text | object;

export const Text = Symbol();

// 仮想ノードの型
export interface VNode<HostNode = any> {
  type: VNodeTypes;
  props: VNodeProps | null;
  children: VNodeNormalizedChildren;
  shapeFlag: number;
  ref: Ref | null;
  el: HostNode | undefined;
  instance: ComponentInternalInstance | null;
}

export interface VNodeProps {
  [key: string]: any;
}

export type VNodeNormalizedChildren = string | VNodeArrayChildren;
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>;

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren;
type VNodeChildAtom = VNode | string;

// VNodeを生成する
export function createVNode(
  type: VNodeTypes,
  props: VNodeProps | null,
  children: VNodeNormalizedChildren
): VNode {
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
      ? ShapeFlags.COMPONENT
      : 0;

  const vnode: VNode = {
    type,
    props,
    children,
    shapeFlag,
    ref: props?.ref ?? null,
    el: undefined,
    instance: null,
  };

  return vnode;
}

// VNodeの正規化 (文字列もVNodeとして扱う)
export function normalizeVNode(child: VNodeChild): VNode {
  if (typeof child === "object") {
    return { ...child } as VNode;
  } else {
    return createVNode(Text, null, String(child));
  }
}
