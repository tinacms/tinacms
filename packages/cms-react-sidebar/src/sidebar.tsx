import * as React from 'react'
import Frame from 'react-frame-component'
import { FormBuilder, FieldsBuilder } from '@forestryio/cms-final-form-builder'
import { useCMS, useSubscribable } from '@forestryio/cms-react'

export const Sidebar = () => {
  const cms = useCMS()

  useSubscribable(cms.forms)

  const form = cms.forms.all()[0]
  console.log('forms', cms.forms.all().length)
  return (
    <Frame
      style={{
        width: '100%',
        height: '100%',
        margin: '0 auto',
        cursor: 'pointer',
      }}
    >
      {form && (
        <FormBuilder form={form}>
          {() => {
            return <FieldsBuilder form={form} />
          }}
        </FormBuilder>
      )}
    </Frame>
  )
}
