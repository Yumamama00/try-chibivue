import { compile } from ".";
import { ReactiveEffect } from "../reactivity";
import { emit } from "./componentEmits";
import { ComponentOptions } from "./componentOptions";
import { Props, initProps } from "./componentProps";
import { VNode, VNodeChild } from "./vnode";

export type Component = ComponentOptions;

export type Data = Record<string, unknown>;

export interface ComponentInternalInstance {
  type: Component;
  vnode: VNode; // コンポーネントのVNode自体
  subTree: VNode; // コンポーネントのレンダリング結果であるVNode
  next: VNode | null; // コンポーネントのレンダリング結果であるVNode
  effect: ReactiveEffect;
  render: InternalRenderFunction;
  update: () => void;
  isMounted: boolean;
  propsOptions: Props;
  props: Data;
  emit: (event: string, ...args: any[]) => void;
  setupState: Data;
  uid: number;
}

// コンポーネントのUID。インクリメントしていく
let uid = 0;

export type InternalRenderFunction = {
  (ctx: Data): VNodeChild;
};

export function createComponentInstance(
  vnode: VNode
): ComponentInternalInstance {
  const component = vnode.type as Component;

  const instance: ComponentInternalInstance = {
    uid: uid++,
    type: component,
    vnode,
    next: null,
    effect: null!,
    subTree: null!,
    update: null!,
    render: null!,
    isMounted: false,
    propsOptions: component.props || {},
    props: {},
    emit: null!,
    setupState: null!,
  };

  instance.emit = emit.bind(null, instance);
  return instance;
}

export const setupComponent = (instance: ComponentInternalInstance) => {
  const { props } = instance.vnode;
  initProps(instance, props);

  const component = instance.type as Component;
  if (component.setup) {
    const setupResult = component.setup(instance.props, {
      emit: instance.emit,
    }) as InternalRenderFunction;

    // setupResultの型によって分岐をする
    if (typeof setupResult === "function") {
      instance.render = setupResult;
    } else if (typeof setupResult === "object" && setupResult !== null) {
      instance.setupState = setupResult;
    } else {
      // do nothing
    }

    if (compile && !component.render) {
      const template = component.template ?? "";
      if (template) {
        instance.render = compile(template);
      }
    }

    const { render } = component;
    if (render) {
      instance.render = render as InternalRenderFunction;
    }
  }
};
