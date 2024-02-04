import { hasChanged, isObject } from "../shared/general";
import { Dep, createDep } from "./dep";
import { trackEffect, triggerEffects } from "./effect";

import { reactive } from "./reactive";

declare const RefSymbol: unique symbol;
export declare const RawSymbol: unique symbol;

export interface Ref<T = any> {
  value: T;
  [RefSymbol]: true;
}

type RefBase<T> = {
  dep?: Dep;
  value: T;
};

export function shallowRef<T = any>(value?: T) {
  return createRef(value, true);
}

export function ref<T = any>(value?: T) {
  return createRef(value, false);
}

export function triggerRef(ref: RefBase<any>) {
  triggerRefValue(ref);
}

function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}

export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true);
}

class RefImpl<T> {
  private _value: T;
  private _rawValue: T;

  public dep?: Dep = undefined;
  public readonly __v_isRef = true;
  public readonly __v_isShallow;

  constructor(value: T, shallow: boolean) {
    this._rawValue = value;
    this._value = shallow ? value : toReactive(value);
    this.__v_isShallow = shallow;
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newVal) {
    // 値が変わったかどうかをチェックしてあげておく
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = this.__v_isShallow ? newVal : toReactive(newVal);
      triggerRefValue(this);
    }
  }
}

function trackRefValue(ref: RefBase<any>) {
  trackEffect(ref.dep || (ref.dep = createDep()));
}

function triggerRefValue(ref: RefBase<any>) {
  const dep = ref.dep;
  if (dep) {
    triggerEffects(dep);
  }
}

const toReactive = <T>(value: T): T =>
  isObject(value) ? reactive(value) : value;
