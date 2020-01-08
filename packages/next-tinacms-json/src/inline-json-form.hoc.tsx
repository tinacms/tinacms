import React from 'react'
import { FC } from 'react'
import { NextPage } from 'next'
import { JsonFile } from './use-json-form'
import {
  InlineJsonFormRenderProps,
  InlineJsonForm,
} from './inline-json-form.rc'

/**
 * inlineJsonForm
 */
export function inlineJsonForm(
  Component: FC<InlineJsonFormRenderProps>
): NextPage<{ jsonFile: JsonFile }> {
  return props => {
    return (
      <InlineJsonForm jsonFile={props.jsonFile}>
        {inlineProps => {
          return <Component {...inlineProps} />
        }}
      </InlineJsonForm>
    )
  }
}
