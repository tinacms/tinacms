export function domAttrs(attrs: any) {
  const domAttrs: any = {}
  for (const key in attrs) {
    if (attrs[key]) {
      domAttrs[`forestry-${key}`] = attrs[key]
    }
  }
  return domAttrs
}

export function docAttrs(attrs: any) {
  const domAttrs: any = {}
  for (const key in attrs) {
    if (attrs[key]) {
      domAttrs[key] = attrs[key]
    }
  }
  return domAttrs
}

export function getAttrsWith(attrs: object) {
  return function(dom: HTMLElement) {
    return {
      ...attrs,
      ...getAttrs(dom),
    }
  }
}

export function getAttrs(dom: HTMLElement) {
  const attrs: any = {}
  const attributes = dom.attributes
  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i]
    if (attribute.value) {
      const name = attribute.name.startsWith('forestry-')
        ? attribute.name.slice(9)
        : attribute.name

      attrs[name] = attribute.value
    }
  }
  return attrs
}
