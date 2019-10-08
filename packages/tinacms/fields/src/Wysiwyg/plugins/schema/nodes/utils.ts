/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

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
