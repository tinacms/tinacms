/**

Copyright 2021 Forestry.io Holdings, Inc.

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

import * as React from 'react'
import { MutationSignalContext } from '../components/MutationSignal'

/**
 * If the DOM wrapped by Tina contains an element with a
 * `data-tinafield` attribute matching `fieldName`,
 * `useFieldReference` will find it by querying the dom and return
 * the matched DOM element.
 *
 * `useFieldReference` is connected to a MutationObserver higher in the DOM,
 * and will cause components that use it to rerender any time content in the DOM
 * changes. This ensures reliable tracking of the referenced DOM element, but
 * may cause problems if `useFieldReference` is called in expensive renders.
 */
export const useFieldReference = (fieldName: string | null) => {
  const signal = React.useContext(MutationSignalContext)
  const [ele, setEle] = React.useState<HTMLElement | null>(null)
  React.useEffect(() => {
    let doc: Document
    const iframe = document.getElementById('tina-iframe') as HTMLIFrameElement
    if (iframe) {
      doc = iframe.contentDocument
    } else {
      doc = document
    }
    const fieldEle = doc.querySelector<HTMLElement>(
      `[data-tinafield="${fieldName}"]`
    )
    setEle(fieldEle)
  }, [signal, fieldName])
  return ele
}
