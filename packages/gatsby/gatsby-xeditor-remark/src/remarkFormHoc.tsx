import * as React from 'react'
import { FormOptions } from '@forestryio/cms'
import { useRemarkForm } from './useRemarkForm'

export function remarkForm(
  Component: any,
  options: Partial<FormOptions<any>> = {}
) {
  return function RemarkForm(props: any) {
    let [markdownRemark] = useRemarkForm(props.data.markdownRemark, options)

    return <Component {...props} data={{ ...props.data, markdownRemark }} />
  }
}
