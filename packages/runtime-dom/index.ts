import {
  CreateAppFunction,
  RendererOptions,
  createAppAPI,
  createRenderer,
} from "../runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

export { h } from "../runtime-core";
export type DOMRendererOptions = RendererOptions<Node, Element>;

// DOMに依存したRendererOptionsの実装を注入してrendererを生成
const { render } = createRenderer({ ...nodeOps, patchProp });

// (private) Appインスタンスを生成する関数
const _createApp = createAppAPI(render);

// (public) Appインスタンスを生成する関数
export const createApp = ((...args) => {
  const app = _createApp(...args);
  const { mount } = app;

  app.mount = (selector: string) => {
    const container = document.querySelector(selector);
    if (!container) return;
    mount(container);
  };

  return app;
}) as CreateAppFunction<Element>;
