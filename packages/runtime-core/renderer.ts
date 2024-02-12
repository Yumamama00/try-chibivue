import { ReactiveEffect } from "../reactivity";
import { ShapeFlags } from "../shared/shapeFlags";
import {
  Component,
  ComponentInternalInstance,
  createComponentInstance,
  setupComponent,
} from "./component";
import { updateProps } from "./componentProps";
import { setRef } from "./rendererTemplateRef";
import { SchedulerJob, queueJob } from "./scheduler";
import { Text, VNode, createVNode, normalizeVNode } from "./vnode";

// render関数の型
export type RootRenderFunction<HostElement = RendererElement> = (
  vnode: Component,
  container: HostElement
) => void;

// レンダリングの各操作を保持するクラスのインタフェース
// runtime-coreで実装するrendererがDOMを意識しないよう依存性の逆転を行っている
export interface RendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement,
> {
  // propsの操作
  patchProp(el: HostElement, key: string, value: any): void;

  // Elementを生成する
  createElement(type: string): HostElement;

  // Textを生成する
  createText(text: string): HostNode;

  // Textを設定する
  setText(node: HostNode, text: string): void;

  // ElementTextを設定する
  setElementText(node: HostNode, text: string): void;

  // ノードを挿入する
  insert(child: HostNode, parent: HostNode, anchor?: HostNode | null): void;

  // 親ノードを返す
  parentNode(node: HostNode): HostNode | null;
}

export interface RendererNode {
  [key: string]: any;
}

export interface RendererElement extends RendererNode {}

// Appインスタンスのmountで実行されるrender関数を生成して返す
export function createRenderer(options: RendererOptions) {
  const {
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    insert: hostInsert,
    parentNode: hostParentNode,
  } = options;

  const patch = (n1: VNode | null, n2: VNode, container: RendererElement) => {
    const { type, shapeFlag, ref } = n2;
    if (type === Text) {
      processText(n1, n2, container);
    } else if (shapeFlag & ShapeFlags.ELEMENT) {
      processElement(n1, n2, container);
    } else if (shapeFlag & ShapeFlags.COMPONENT) {
      processComponent(n1, n2, container);
    } else {
      // do nothing
    }

    if (ref) {
      setRef(ref, n2);
    }
  };

  const processText = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement
  ) => {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateText(n2.children as string)), container);
    } else {
      const el = (n2.el = n1.el!);
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children as string);
      }
    }
  };

  const processElement = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement
  ) => {
    if (n1 === null) {
      mountElement(n2, container);
    } else {
      patchElement(n1, n2);
    }
  };

  const mountElement = (vnode: VNode, container: RendererElement) => {
    const { type, props } = vnode;
    const el: RendererElement = (vnode.el = hostCreateElement(type as string));

    mountChildren(vnode.children as VNode[], el);

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, props[key]);
      }
    }

    hostInsert(el, container);
  };

  const mountChildren = (children: VNode[], container: RendererElement) => {
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]));
      patch(null, child, container);
    }
  };

  const patchElement = (n1: VNode, n2: VNode) => {
    const el = (n2.el = n1.el!);

    const props = n2.props;

    patchChildren(n1, n2, el);

    for (const key in props) {
      if (props[key] !== n1.props?.[key] ?? {}) {
        hostPatchProp(el, key, props[key]);
      }
    }
  };

  const patchChildren = (n1: VNode, n2: VNode, container: RendererElement) => {
    const c1 = n1.children as VNode[];
    const c2 = n2.children as VNode[];

    for (let i = 0; i < c2.length; i++) {
      const child = (c2[i] = normalizeVNode(c2[i]));
      patch(c1[i], child, container);
    }
  };

  const processComponent = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement
  ) => {
    if (n1 == null) {
      mountComponent(n2, container);
    } else {
      updateComponent(n1, n2);
    }
  };

  const mountComponent = (initialVNode: VNode, container: RendererElement) => {
    // コンポーネントのインスタンス生成
    const instance: ComponentInternalInstance = (initialVNode.instance =
      createComponentInstance(initialVNode));
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
  };

  const setupRenderEffect = (
    instance: ComponentInternalInstance,
    initialVNode: VNode,
    container: RendererElement
  ) => {
    // コンポーネント更新関数
    const componentUpdateFn = () => {
      // setup関数の実行結果であるrender関数
      const { render, setupState } = instance;

      if (!instance.isMounted) {
        // mount process
        const subTree = (instance.subTree = normalizeVNode(render(setupState)));
        patch(null, subTree, container);
        initialVNode.el = subTree.el;
        instance.isMounted = true;
      } else {
        // patch process
        // eslint-disable-next-line prefer-const
        let { next, vnode } = instance;

        // updateComponent
        // コンポーネント自身のステートの変化によって引き起こされる (next: null)
        // OR 親がprocessComponentを呼び出すことによって引き起こされる (next: VNode)
        if (next) {
          next.el = vnode.el;
          next.instance = instance;
          instance.vnode = next;
          instance.next = null;
          updateProps(instance, next.props);
        } else {
          next = vnode;
        }

        const prevTree = instance.subTree;
        const nextTree = normalizeVNode(render(setupState));
        instance.subTree = nextTree;

        patch(prevTree, nextTree, hostParentNode(prevTree.el!)!);
        next.el = nextTree.el;
      }
    };

    // コンポーネントを更新する関数をReactiveEffectとして定義して初回実行する
    // ReactiveEffectの第 1 引数が能動的な作用, 第 2 引数が受動的な作用
    const effect = (instance.effect = new ReactiveEffect(
      componentUpdateFn,
      () => queueJob(update) // コンポーネント更新updateロジックをqueueする関数
    ));
    const update: SchedulerJob = (instance.update = () => effect.run());
    update.id = instance.uid;
    update(); // 能動的に作用を実行
  };

  const updateComponent = (n1: VNode, n2: VNode) => {
    const instance = (n2.instance = n1.instance)!;
    instance.next = n2;
    instance.update();
  };

  // rootコンポーネントの仮想ノードを生成してpatchする
  const render: RootRenderFunction = (rootComponent, container) => {
    const vnode = createVNode(rootComponent, {}, []);
    // 初回はrootコンポーネントのマウント処理が実行される
    patch(null, vnode, container);
  };
  return { render };
}
