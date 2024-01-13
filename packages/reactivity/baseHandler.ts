import { track, trigger } from "./effect";
import { reactive } from "./reactive";

export const mutableHandlers: ProxyHandler<object> = {
  get(target: object, key: string | symbol, receiver: object) {
    // 自身を参照している関数を登録する
    track(target, key);

    const res = Reflect.get(target, key, receiver);
    // objectの場合はreactiveにしてあげる (これにより、ネストしたオブジェクトもリアクティブにできる)
    if (res !== null && typeof res === "object") {
      return reactive(res);
    }

    return res;
  },

  set(target: object, key: string | symbol, value: unknown, receiver: object) {
    const oldValue = (target as any)[key];
    Reflect.set(target, key, value, receiver);
    // 値が変わったかどうかをチェックしてあげておく
    if (hasChanged(value, oldValue)) {
      // 自身を参照している関数リストを実行する
      trigger(target, key);
    }
    return true;
  },
};

const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue);
