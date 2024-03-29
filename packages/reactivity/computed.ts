import { Dep } from "./dep";
import { ReactiveEffect } from "./effect";
import { trackRefValue, triggerRefValue } from "./ref";

declare const ComputedRefSymbol: unique symbol;
export declare const RawSymbol: unique symbol;

export interface ComputedRef<T = any> {
  readonly value: T;
  [ComputedRefSymbol]: true;
}

export type ComputedGetter<T> = (oldValue?: T) => T;

export class ComputedRefImpl<T> {
  public dep?: Dep = undefined;
  private _value!: T;
  public readonly effect: ReactiveEffect<T>;

  public _dirty = true;
  public readonly __v_isRef = true;

  constructor(getter: ComputedGetter<T>) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerRefValue(this);
      }
    });
  }

  get value() {
    trackRefValue(this);
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }
    return this._value;
  }
}

export function computed<T = any>(getter: ComputedGetter<T>) {
  return new ComputedRefImpl(getter);
}
