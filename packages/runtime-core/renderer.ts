import { VNode } from "./vnode";

export interface RendererNode {
  [key: string]: any;
}

export interface RendererElement extends RendererNode {}

export interface RendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement,
> {
  createElement(type: string): HostNode;
  createText(text: string): HostNode;
  setElementText(node: HostNode, text: string): void;
  insert(child: HostNode, parent: HostNode, anchor?: HostNode | null): void;
  patchProp(el: HostElement, key: string, value: any): void;
}

export type RootRenderFunction<HostElement = RendererElement> = (
  vnode: VNode,
  container: HostElement
) => void;

export function createRenderer(options: RendererOptions) {
  const {
    createElement: hostCreateElement,
    createText: hostCreateText,
    insert: hostInsert,
    patchProp: hostPatchProp,
  } = options;

  function renderVNode(vnode: VNode | string) {
    if (typeof vnode === "string") {
      return hostCreateText(vnode);
    }

    const el = hostCreateElement(vnode.type);

    Object.entries(vnode.props).forEach(([key, value]) => {
      hostPatchProp(el, key, value);
    });

    for (const child of vnode.children) {
      const childEl = renderVNode(child);
      hostInsert(childEl, el);
    }

    return el;
  }

  const render: RootRenderFunction = (root, container) => {
    const el = renderVNode(root);
    hostInsert(el, container);
  };

  return { render };
}
