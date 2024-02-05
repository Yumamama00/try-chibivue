import { hasChanged } from "../shared/general";
import { Dep } from "./dep";
import { ReactiveEffect } from "./effect";
import { trackRefValue, triggerRefValue } from "./ref";

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
      }
    });
  }

  get value() {
    if (
      this._dirty &&
      hasChanged(this._value, (this._value = this.effect.run()))
    ) {
      triggerRefValue(this);
    }

    trackRefValue(this);

    if (this._dirty) {
      this._dirty = false;
    }

    return this._value;
  }
}

export function computed<T = any>(getter: ComputedGetter<T>) {
  return new ComputedRefImpl(getter);
}
