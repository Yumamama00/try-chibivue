import { InternalRenderFunction } from "./component";
export type { InternalRenderFunction } from "./component";

export type { App, CreateAppFunction } from "./apiCreateApp";
export { createAppAPI } from "./apiCreateApp";

export type { RendererOptions } from "./renderer";
export { createRenderer } from "./renderer";

export { h } from "./h";

export type { Component } from "./component";

type CompileFunction = (template: string) => InternalRenderFunction;
export let compile: CompileFunction | undefined;

export function registerRuntimeCompiler(_compile: any) {
  compile = _compile;
}
