import { Dep, createDep } from "./dep";

type KeyToDepMap = Map<any, Dep>;
const targetMap = new WeakMap<any, KeyToDepMap>();

export let activeEffect: ReactiveEffect | undefined;

export type EffectScheduler = (...args: any[]) => any;

export function getDepFromReactive(object: any, key: string | number | symbol) {
  return targetMap.get(object)?.get(key);
}

export class ReactiveEffect<T = any> {
  constructor(
    public fn: () => T, // 能動的な作用
    public scheduler: EffectScheduler | null = null // 受動的な作用 (スケジュール管理)
  ) {}

  run() {
    // ※ fnを実行する前のactiveEffectを保持しておいて、実行が終わった後は元に戻す
    const parent: ReactiveEffect | undefined = activeEffect;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    activeEffect = this;
    const res = this.fn();
    activeEffect = parent;
    return res;
  }
}

// 自身を参照している関数を登録する
export function track(target: object, key: unknown) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = createDep()));
  }

  trackEffect(dep);
}

export function trackEffect(dep: Dep) {
  if (activeEffect) {
    dep.add(activeEffect);
  }
}

// 自身を参照している関数リストを実行する
export function trigger(target: object, key?: unknown) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);

  if (dep) {
    const effects = [...dep];
    triggerEffects(effects);
  }
}

export function triggerEffects(dep: Dep | ReactiveEffect[]) {
  const effects = Array.isArray(dep) ? dep : [...dep];
  for (const effect of effects) {
    triggerEffect(effect);
  }
}

export function triggerEffect(effect: ReactiveEffect) {
  if (effect.scheduler) {
    effect.scheduler(); // スケジュール管理された受動的な作用があれば、そちらを実行する
  } else {
    effect.run(); // なければ通常の作用を実行する
  }
}
