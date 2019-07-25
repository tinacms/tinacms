import * as React from 'react'
import Frame from 'react-frame-component'
import { FormBuilder, FieldsBuilder } from '@forestryio/cms-final-form-builder'
import { useCMS } from '@forestryio/cms-react'

export const Sidebar = () => {
  const cms = useCMS()

  useSubscribeable(cms.forms)

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
      {form && (
        <FormBuilder form={form}>
          {() => {
            return <FieldsBuilder cms={cms} form={form} />
          }}
        </FormBuilder>
      )}
    </Frame>
  )
}

/**
 * TODO: Is there a better approach?
 * TODO: move to cms-react
 */
function useSubscribeable(thing: any) {
  let [_, s] = React.useState(0)
  React.useEffect(() => {
    let forceUpdate = () => s(x => x + 1)
    thing.subscribe(forceUpdate)
    return () => thing.unsubscribe(forceUpdate)
  })
}
