import { Component } from "./component";
import { RootRenderFunction } from "./renderer";

export interface App<HostElement> {
  mount(rootContainer: HostElement | string): void;
}

export type CreateAppFunction<HostElement> = (
  rootComponent: Component
) => App<HostElement>;

export function createAppAPI<HostElement>(
  render: RootRenderFunction<HostElement>
): CreateAppFunction<HostElement> {
  return function createApp(rootComponent: Component): App<HostElement> {
    const app: App<HostElement> = {
      mount(rootContainer: HostElement) {
        render(rootComponent, rootContainer);
      },
    };

    return app;
  };
}
