import * as React from 'react'
import { FormOptions } from '@tinacms/core'
import { TinaForm } from '@tinacms/form-builder'
import { useRemarkForm } from './useRemarkForm'

export function remarkForm(
  Component: any,
  options: Partial<FormOptions<any>> = {}
) {
  return function RemarkForm(props: any) {
    const [markdownRemark] = useRemarkForm(props.data.markdownRemark, options)

    return <Component {...props} data={{ ...props.data, markdownRemark }} />
  }
}

export function liveRemarkForm(
  Component: any,
  options: Partial<FormOptions<any>> = {}
) {
  return function RemarkForm(props: any) {
    const [markdownRemark, form] = useRemarkForm(
      props.data.markdownRemark,
      options
    )

    return (
      <TinaForm form={form}>
        {editingProps => {
          return (
            <Component
              {...props}
              data={{ ...props.data, markdownRemark }}
              {...editingProps}
            />
          )
        }}
      </TinaForm>
    )
  }
}
