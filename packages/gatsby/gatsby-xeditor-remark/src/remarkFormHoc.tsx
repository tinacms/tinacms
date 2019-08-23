import * as React from 'react'
import { FormOptions } from '@forestryio/cms'
import { useRemarkForm } from './useRemarkForm'

export function remarkForm(options: Partial<FormOptions<any>> = {}) {
  return (Component: any) =>
    function RemarkForm(props: any) {
      let [markdownRemark] = useRemarkForm(props.data.markdownRemark, options)

      return <Component {...props} data={{ ...props.data, markdownRemark }} />
    }
}
