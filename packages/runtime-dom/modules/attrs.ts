export function patchAttr(
  el: Element,
  qualifiedName: string,
  value: string
) {
  el.setAttribute(qualifiedName, value)
}
