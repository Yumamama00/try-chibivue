import {
  CreateAppFunction,
  RendererOptions,
  createAppAPI,
  createRenderer,
} from "../runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

export type DOMRendererOptions = RendererOptions<Node, Element>;

// DOMに依存したRendererOptionsを注入してrendererを生成
const { render } = createRenderer({ ...nodeOps, patchProp });

const _createApp = createAppAPI(render);

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
