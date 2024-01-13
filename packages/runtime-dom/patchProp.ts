import { patchEvent } from "./modules/events";
import { patchAttr } from "./modules/attrs";
import { DOMRendererOptions } from ".";

const onRE = /^on[^a-z]/;
export const isOn = (key: string) => onRE.test(key);

// DOMに依存したRendererOptions中のpatchProp実装
export const patchProp: DOMRendererOptions["patchProp"] = (el, key, value) => {
  if (isOn(key)) {
    patchEvent(el, key, value);
  } else {
    patchAttr(el, key, value);
  }
};
