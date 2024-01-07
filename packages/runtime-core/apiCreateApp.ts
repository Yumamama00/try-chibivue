import { Component } from "./component";
import { RootRenderFunction } from "./renderer";
import { VNode } from "./vnode";

export interface App<HostElement> {
  mount(rootContainer: HostElement | string): void;
}

export type CreateAppFunction<HostElement> = (
  rootComponent: Component
) => App<HostElement>;

export function createAppAPI<HostElement>(
  render: RootRenderFunction<HostElement>
): CreateAppFunction<HostElement> {
  return function createApp(rootComponent) {
    const app: App<HostElement> = {
      mount(rootContainer: HostElement) {
        const root: VNode = rootComponent.render!();
        render(root, rootContainer);
      },
    };

    return app;
  };
}
