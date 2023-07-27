import * as React from 'react'
import { MutationSignalContext } from '@toolkit/components/mutation-signal'

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
    if (!fieldEle) {
      // fall back to searching for elements with `data-tinafield` with
      // no form id attached. This isn't ideal as 2 forms on the same page
      // with fields of the same name would conflict, but was previously
      // how the API worked
      if (fieldName?.includes('#')) {
        const fieldNameWithoutFormId = fieldName.split('#')[1]
        const fieldEle = doc.querySelector<HTMLElement>(
          `[data-tinafield="${fieldNameWithoutFormId}"]`
        )
        setEle(fieldEle)
      }
    } else {
      setEle(fieldEle)
    }
  }, [signal, fieldName])
  return ele
}
