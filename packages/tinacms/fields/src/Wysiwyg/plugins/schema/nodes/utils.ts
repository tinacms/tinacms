export function domAttrs(attrs: any) {
  let domAttrs: any = {}
  for (let key in attrs) {
    if (attrs[key]) {
      domAttrs[`forestry-${key}`] = attrs[key]
    }
  }
  return domAttrs
}

export function docAttrs(attrs: any) {
  let domAttrs: any = {}
  for (let key in attrs) {
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
  let attrs: any = {}
  let attributes = dom.attributes
  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i]
    if (attribute.value) {
      let name = attribute.name.startsWith('forestry-')
        ? attribute.name.slice(9)
        : attribute.name

      attrs[name] = attribute.value
    }
  }
  return attrs
}
