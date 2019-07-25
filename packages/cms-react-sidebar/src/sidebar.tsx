import * as React from 'react'
import Frame from 'react-frame-component'
import { FormBuilder } from '@forestryio/cms-final-form-builder'
import { useCMS } from '@forestryio/cms-react'

export const Sidebar = () => {
  const cms = useCMS()
  const form = cms.forms.all()[0]
  return (
    <Frame
      style={{
        width: '100%',
        height: '100%',
        margin: '0 auto',
        cursor: 'pointer',
      }}
    >
      {form && <FormBuilder form={form} />}
    </Frame>
  )
}
