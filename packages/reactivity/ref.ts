import { hasChanged, isObject } from "../shared/general";
import { Dep, createDep } from "./dep";
import { getDepFromReactive, trackEffect, triggerEffects } from "./effect";

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

export function triggerRef(ref: RefBase<any>) {
  triggerRefValue(ref);
}

export function toRef(
  source: Record<string, any>,
  key?: string,
  defaultValue?: unknown
): Ref | RefImpl<any> {
  if (isRef(source)) {
    return source;
  } else if (isObject(source) && arguments.length > 1) {
    return propertyToRef(source, key!, defaultValue);
  } else {
    return ref(source);
  }
}

export function toRefs<T extends object>(object: T) {
  const ret: any = Array.isArray(object) ? new Array(object.length) : {};
  for (const key in object) {
    ret[key] = propertyToRef(object, key);
  }
  return ret;
}

function propertyToRef(
  source: Record<string, any>,
  key: string,
  defaultValue?: unknown
) {
  return new ObjectRefImpl(source, key, defaultValue) as any;
}

class ObjectRefImpl<T extends object, K extends keyof T> {
  public readonly __v_isRef = true;

  constructor(
    private readonly _object: T,
    private readonly _key: K,
    private readonly _defaultValue?: T[K]
  ) {}

  get value() {
    const val = this._object[this._key];
    return val === undefined ? (this._defaultValue as T[K]) : val;
  }

  set value(newVal) {
    this._object[this._key] = newVal;
  }

  get dep(): Dep | undefined {
    return getDepFromReactive(this._object, this._key);
  }
}

const toReactive = <T>(value: T): T =>
  isObject(value) ? reactive(value) : value;
