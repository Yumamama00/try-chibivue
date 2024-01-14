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
}

export type InternalRenderFunction = {
  (): VNodeChild;
};

export function createComponentInstance(
  vnode: VNode
): ComponentInternalInstance {
  const component = vnode.type as Component;

  const instance: ComponentInternalInstance = {
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
  };

  instance.emit = emit.bind(null, instance);
  return instance;
}

export const setupComponent = (instance: ComponentInternalInstance) => {
  const { props } = instance.vnode;
  initProps(instance, props);

  const component = instance.type as Component;
  if (component.setup) {
    instance.render = component.setup(instance.props, {
      emit: instance.emit,
    }) as InternalRenderFunction;
  }

  if (compile && !component.render) {
    const template = component.template ?? "";
    if (template) {
      instance.render = compile(template);
    }
  }
};
