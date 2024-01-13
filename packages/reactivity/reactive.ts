import { mutableHandlers } from "./baseHandler";

// 引数で指定されたオブジェクトをリアクティブにする関数
export function reactive<T extends object>(target: T): T {
  // Proxyでラップして、GetterとSetterにフックしてリアクティブ処理を差し込む
  const proxy = new Proxy(target, mutableHandlers);
  return proxy as T;
}
