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

import * as React from 'react'
import { useCMS, useSubscribable } from '@tinacms/react-core'
import { Plugin } from '@tinacms/core'
import { Form } from '@tinacms/forms'
import { FieldMeta } from '@tinacms/fields'
import { Button, TinaReset } from '@tinacms/styles'
import { CreateContentMenu } from './CreateContentMenu'
import styled, { css } from 'styled-components'
import { ToolbarButton } from './ToolbarButton'
import { UndoIcon } from '@tinacms/icons'
import { DesktopLabel } from './DesktopLabel'
import { LoadingDots } from '@tinacms/react-forms'

const SaveButton = styled(ToolbarButton)`
  padding: 0 2rem;
`

const useFormState = (form: Form | null, subscription: any): any => {
  const [state, setState] = React.useState<any>()
  React.useEffect(() => {
    if (!form) return
    return form.subscribe(setState, subscription)
  }, [form])

  return state
}

interface ToolbarWidgetPlugin<Props = any> extends Plugin {
  weight: number
  props?: Props
  component(): React.ReactElement
}

export const Toolbar = styled(({ ...styleProps }) => {
  const cms = useCMS()
  const widgets = cms.plugins.getType<ToolbarWidgetPlugin>('toolbar:widget')

  const forms = cms.plugins.getType<Form>('form')
  const form = forms.all().length ? forms.all()[0] : null
  // TODO: This doesn't return the correct value initially
  const formState = useFormState(form, {
    pristine: true,
    submitting: true,
  })

  useSubscribable(forms)
  useSubscribable(widgets)

  // TODO: Find a more accurate solution then this.
  const inEditMode = widgets.all().length

  if (!inEditMode) {
    return null
  }
  // TODO: Form#reset should always exist
  const reset = form && (form.reset || (() => form.finalForm.reset()))
  const submit = form && form.submit
  const disabled = !form

  // TODO: There's got to be a better way to get formState
  const pristine = disabled ? true : formState && formState.pristine
  const submitting = disabled ? false : !!(formState && formState.submitting)

  return (
    <TinaReset>
      <ToolbarPlaceholder />
      <div {...styleProps}>
        <Create>
          <CreateContentMenu />
        </Create>
        <WidgetsContainer>
          {widgets
            .all()
            .sort((a: any, b: any) => a.weight - b.weight)
            .map((widget: any) => (
              <widget.component key={widget.name} {...widget.props} />
            ))}
        </WidgetsContainer>
        <Status>
          <FormStatus dirty={!pristine} />
        </Status>
        <Actions>
          <ToolbarButton
            disabled={disabled || pristine}
            //@ts-ignore
            onClick={reset}
          >
            <UndoIcon />
            <DesktopLabel> Discard</DesktopLabel>
          </ToolbarButton>
          <SaveButton
            primary
            //@ts-ignore
            onClick={submit}
            busy={submitting}
            disabled={disabled || pristine}
          >
            {submitting && <LoadingDots />}
            {!submitting && (
              <>
                Save <DesktopLabel>&nbsp;Page</DesktopLabel>
              </>
            )}
          </SaveButton>
        </Actions>
      </div>
    </TinaReset>
  )
})`
  position: fixed;
  top: 0;
  left: 0;
  padding: 0 0.75rem;
  width: 100%;
  height: 62px;
  background-color: #f6f6f9;
  z-index: 10000;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid #edecf3;
  display: grid;
  grid-template-areas: 'create github status actions';
  grid-template-columns: auto 1fr auto auto;
  align-items: stretch;

  @media (max-width: 1029px) {
    label {
      display: none;
    }
  }
`

const WidgetsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-self: end;
  padding-right: 0.75rem;
  border-right: 1px solid white;
  box-shadow: inset -1px 0 0 #e1ddec;
  background-image: linear-gradient(
    to left,
    rgba(0, 0, 0, 0.01),
    transparent 3rem
  );

  > * {
    margin-bottom: 0;
    margin-left: 1rem;
  }

  > div {
    display: none;
  }

  label {
    margin-bottom: 0;
    white-space: nowrap;
  }

  @media (min-width: 1030px) {
    > div {
      display: block;
    }
  }
`

const Create = styled.div`
  grid-area: create;
  justify-self: start;
  display: flex;
  align-items: center;
`

const Status = styled.div`
  grid-area: status;
  justify-self: end;
  display: flex;
  align-items: center;

  > * {
    margin-bottom: 0;
    margin-left: 1rem;
  }

  label {
    margin-bottom: 0;
  }
`

const Actions = styled.div`
  grid-area: actions;
  justify-self: end;
  display: flex;
  align-items: center;

  ${Button} {
    margin-left: 0.75rem;
  }
`

const ToolbarPlaceholder = styled.div`
  position: relative;
  opacity: 0;
  display: block;
  width: 100%;
  height: 62px;
`

interface FormStatusProps {
  dirty: boolean
}

const FormStatus = ({ dirty }: FormStatusProps) => {
  return (
    <FieldMeta name={'Form Status'}>
      {dirty ? (
        <StatusMessage>
          <StatusLight warning /> <DesktopLabel>Unsaved changes</DesktopLabel>
        </StatusMessage>
      ) : (
        <StatusMessage>
          <StatusLight /> <DesktopLabel>No changes</DesktopLabel>
        </StatusMessage>
      )}
    </FieldMeta>
  )
}

interface StatusLightProps {
  warning?: boolean
}

const StatusLight = styled.span<StatusLightProps>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 8px;
  margin-top: -1px;
  background-color: #3cad3a;
  border: 1px solid #249a21;
  margin-right: 5px;
  opacity: 0.5;

  ${p =>
    p.warning &&
    css`
      background-color: #e9d050;
      border: 1px solid #d3ba38;
      opacity: 1;
    `};
`

const StatusMessage = styled.p`
  font-size: 16px;
  display: flex;
  align-items: center;
  color: var(--tina-color-grey-6);
  padding-right: 4px;
`
