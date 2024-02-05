import { ReactiveEffect } from "../reactivity";
import { ComputedRef } from "../reactivity/computed";
import { Ref, isRef } from "../reactivity/ref";
import { hasChanged, isFunction } from "../shared/general";

export type WatchEffect = (onCleanup: OnCleanup) => void;

export type WatchSource<T = any> = (() => T) | Ref<T> | ComputedRef<T> | object;

export type WatchCallback<V = any, OV = any> = (value: V, oldValue: OV) => any;

export interface WatchOptions<Immediate = boolean> {
  immediate?: Immediate;
  deep?: boolean;
}

type OnCleanup = (cleanupFn: () => void) => void;

export function watch<T>(
  source: WatchSource<T> | Array<WatchSource<T>>,
  callback: WatchCallback,
  option: WatchOptions = { immediate: false, deep: false }
) {
  let getter: () => any;
  let isMultiSource = false;

  const { immediate } = option;

  // TODO isReactive(source)の判定
  if (isFunction(source)) {
    getter = () => source();
  } else if (isRef(source)) {
    getter = () => source.value;
  } else if (Array.isArray(source)) {
    isMultiSource = true;
    getter = () => source.map((s) => (isRef(s) ? s.value : s));
  } else {
    getter = () => source;
  }

  let oldValue: T;

  const jobFn = () => {
    const newValue = effect.run();
    if (
      isMultiSource
        ? (newValue as any[]).some((v, i) =>
            hasChanged(v, (oldValue as T[])?.[i])
          )
        : hasChanged(newValue, oldValue)
    ) {
      callback(newValue, oldValue);
      oldValue = newValue;
    }
  };

  const effect = new ReactiveEffect(getter, jobFn);

  if (immediate) {
    jobFn();
  } else {
    oldValue = effect.run();
  }
}
