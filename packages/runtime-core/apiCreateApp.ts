import { Component } from "./component";
import { RootRenderFunction } from "./renderer";

// Appインスタンス
export interface App<HostElement> {
  mount(rootContainer: HostElement | string): void;
}

export type CreateAppFunction<HostElement> = (
  rootComponent: Component
) => App<HostElement>;

// Appインスタンスを生成する関数を返す
// 引数で受け取ったrender関数をAppインスタンスのmountメソッドで使用している
export function createAppAPI<HostElement>(
  render: RootRenderFunction<HostElement>
): CreateAppFunction<HostElement> {
  return (rootComponent: Component): App<HostElement> => {
    const app: App<HostElement> = {
      mount(rootContainer: HostElement) {
        render(rootComponent, rootContainer);
      },
    };

    return app;
  };
}
