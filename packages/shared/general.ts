const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key);

const camelizeRE = /-(\w)/g;
export const camelize = (str: string): string => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ""));
};

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const toHandlerKey = (str: string) =>
  str ? `on${capitalize(str)}` : ``;

export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === "object";

export const isFunction = (val: unknown): val is Function =>
  typeof val === "function";

export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue);
