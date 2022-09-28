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
import { useCMS, useSubscribable } from '../../react-core'
import { Plugin } from '../../core'
import { Form } from '../../forms'
import { FieldMeta } from '../../fields'
import { Button } from '../../styles'
import { ScreenPlugin, ScreenPluginModal } from '../../react-screens'
import { CreateContentMenu } from '../../react-forms'
import styled, { css } from 'styled-components'
import { ToolbarButton } from './ToolbarButton'
import { ResetIcon, HamburgerIcon, TinaIcon } from '../../icons'
import { DesktopLabel } from './DesktopLabel'
import { LoadingDots } from '../../form-builder'
import { FormActionMenu } from './FormActions'

const useFormState = (form: Form | null, subscription: any): any => {
  const [state, setState] = React.useState<any>()
  React.useEffect(() => {
    if (!form) return
    return form.subscribe(setState, subscription)
  }, [form])

  return state
}

export interface ToolbarWidgetPlugin<Props = any> extends Plugin {
  weight: number
  props?: Props
  component(): React.ReactElement
}

export const Toolbar = () => {
  const cms = useCMS()

  const widgets = cms.plugins.getType<ToolbarWidgetPlugin>('toolbar:widget')

  const forms = cms.plugins.getType<Form>('form')
  const form = forms.all().length ? forms.all()[0] : null

  const currentState = form?.finalForm.getState()

  const formState = useFormState(form, {
    pristine: true,
    submitting: true,
    invalid: true,
  })

  // this is used to refreshe the discard button to fix it not updating when pressed after the page loads
  const [, setState] = React.useState(0)

  // Global plugin hamburger menu
  const screens = cms.plugins.getType<ScreenPlugin>('screen')
  useSubscribable(screens)
  const allScreens = screens.all()
  const showMenu = allScreens.length > 0
  const [activeScreen, setActiveView] = React.useState<ScreenPlugin | null>(
    null
  )
  const [menuIsOpen, setMenuIsOpen] = React.useState(false)

  useSubscribable(forms)
  useSubscribable(widgets)

  // TODO: Find a more accurate solution then this.
  // const inEditMode = widgets.all().length

  // if (!inEditMode) {
  //   return null
  // }
  // TODO: Form#reset should always exist

  const reset = () => {
    if (form) {
      form.reset()
      setState((i) => i++)
    }
  }

  /**
   * TODO: decide best button defaults
   * Should match defaults in form.ts
   */
  // @ts-ignore
  const buttons = cms.toolbar?.buttons ||
    form?.buttons || {
      save: 'Save',
      reset: 'Reset',
      invalid: true,
    }

  //const reset = form && (form.reset || (() => form.finalForm.reset()))
  const submit = form && form.submit
  const disabled = !form

  // TODO: There's got to be a better way to get formState
  const pristine = disabled ? true : formState && currentState?.pristine
  const submitting = disabled
    ? false
    : !!(formState && currentState?.submitting)
  const invalid = formState && currentState?.invalid

  return (
    <>
      <ToolbarPlaceholder />
      <StyledToolbar menuIsOpen={menuIsOpen}>
        <AlignLeft>
          {showMenu && (
            <MenuToggle
              onClick={() => setMenuIsOpen(!menuIsOpen)}
              open={menuIsOpen}
            >
              <HamburgerIcon />
            </MenuToggle>
          )}
          <CreateContentMenu sidebar={false} />
        </AlignLeft>

        <AlignRight>
          {widgets.all().length >= 1 && (
            <WidgetsContainer>
              {widgets
                .all()
                .sort((a: any, b: any) => a.weight - b.weight)
                .map((widget: any) => (
                  <widget.component key={widget.name} {...widget.props} />
                ))}
            </WidgetsContainer>
          )}

          <Status>
            <FormStatus dirty={!pristine} />
          </Status>
          <Actions>
            <ToolbarButton disabled={disabled || pristine} onClick={reset}>
              <ResetIcon className="fill-current opacity-70 w-[2.5em] h-[2.5em] lg:mr-1" />
              <DesktopLabel>{buttons.reset}</DesktopLabel>
            </ToolbarButton>
            <SaveButton
              variant="primary"
              //@ts-ignore
              onClick={submit}
              busy={submitting}
              disabled={disabled || pristine || invalid}
            >
              {submitting && <LoadingDots />}
              {!submitting && (
                <>
                  <DesktopLabel>{buttons.save}</DesktopLabel>
                </>
              )}
            </SaveButton>
            <FormActionMenu form={form} />
          </Actions>
        </AlignRight>
      </StyledToolbar>
      {showMenu && (
        <MenuPanel visible={menuIsOpen}>
          <MenuWrapper>
            <MenuList>
              {allScreens.map((view) => {
                const Icon = view.Icon
                return (
                  <MenuLink
                    key={view.name}
                    value={view.name}
                    onClick={() => {
                      setActiveView(view)
                      setMenuIsOpen(false)
                    }}
                  >
                    <Icon /> {view.name}
                  </MenuLink>
                )
              })}
            </MenuList>
          </MenuWrapper>
          <Watermark />
        </MenuPanel>
      )}
      {activeScreen && (
        <ScreenPluginModal
          screen={activeScreen}
          close={() => setActiveView(null)}
        />
      )}
    </>
  )
}

interface FormStatusProps {
  dirty: boolean
}

const FormStatus = ({ dirty }: FormStatusProps) => {
  return (
    <FieldMeta name={'Form Status'} margin={false}>
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

const StyledToolbar = styled.div<{ menuIsOpen: boolean }>`
  font-family: 'Inter', sans-serif;
  position: fixed;
  top: 0;
  left: ${(p) => (p.menuIsOpen ? 'var(--tina-sidebar-width)' : '0')};
  right: 0;
  padding: 0 12px;
  height: 62px;
  z-index: var(--tina-z-index-4);
  box-sizing: border-box;
  display: grid;
  grid-template-areas: 'left right';
  grid-template-columns: auto 1fr;
  align-items: stretch;
  background-color: var(--tina-color-grey-1);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid var(--tina-color-grey-2);
  transition: left var(--tina-timing-long) ease-out;

  @media (max-width: 1029px) {
    label {
      display: none;
    }
  }
`

// Type of property 'defaultProps' circularly references itself in mapped type
// @ts-ignore
const SaveButton = styled(ToolbarButton)`
  padding: 0 32px;
`

const WidgetsContainer = styled.div`
  grid-area: widgets;
  display: flex;
  align-self: stretch;
  align-items: center;
  justify-self: end;
  padding-right: 12px;
  border-right: 1px solid white;
  box-shadow: inset -1px 0 0 #e1ddec;
  background-image: linear-gradient(
    to left,
    rgba(0, 0, 0, 0.01),
    transparent 48px
  );

  > * {
    margin-bottom: 0;
    margin-left: 16px;
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

const AlignLeft = styled.div`
  grid-area: left;
  justify-self: start;
  display: flex;
  align-items: center;
`

const AlignRight = styled.div`
  grid-area: right;
  justify-self: end;
  display: flex;
  align-items: center;
`

const Status = styled.div`
  display: flex;
  align-items: center;

  > * {
    margin-bottom: 0;
    margin-left: 16px;
  }

  label {
    margin-bottom: 0;
  }
`

const Actions = styled.div`
  display: flex;
  align-items: center;

  button {
    margin-left: 12px;
  }
`

const ToolbarPlaceholder = styled.div`
  position: relative;
  opacity: 0;
  display: block;
  width: 100%;
  height: var(--tina-toolbar-height);
`

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

  ${(p) =>
    p.warning &&
    css`
      background-color: #e9d050;
      border: 1px solid #d3ba38;
      opacity: 1;
    `};
`

const StatusMessage = styled.p`
  font-size: var(--tina-font-size-3);
  display: flex;
  align-items: center;
  color: var(--tina-color-grey-6);
  padding-right: 4px;
  line-height: 1.35;
  margin: 0;
`

const MenuToggle = styled(Button)<{ open: boolean }>`
  position: relative;
  margin-left: -12px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-right: 8px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  outline: none;

  svg {
    position: relative;
    transition: fill 85ms ease-out;
    fill: var(--tina-color-grey-6);
    margin-left: -4px;
    width: 28px;
    height: auto;
    path {
      position: relative;
      transition: transform var(--tina-timing-long) ease-out,
        opacity var(--tina-timing-long) ease-out,
        fill var(--tina-timing-short) ease-out;
      transform-origin: 50% 50%;
    }
  }
  &:hover {
    svg {
      fill: var(--tina-color-grey-7);
    }
  }
  ${(props) =>
    props.open &&
    css<any>`
      svg {
        path:first-child {
          /* Top bar */
          transform: rotate(45deg) translate3d(0, 0.45rem, 0);
        }
        path:nth-child(2) {
          /* Middle bar */
          transform: translate3d(-100%, 0, 0);
          opacity: 0;
        }
        path:last-child {
          /* Bottom Bar */
          transform: rotate(-45deg) translate3d(0, -0.45rem, 0);
        }
      }
    `};
`

const MenuList = styled.div`
  margin: 0 calc(var(--tina-padding-big) * -1) 32px
    calc(var(--tina-padding-big) * -1);
  display: block;
`

const MenuLink = styled.div<{ value: string }>`
  color: var(--tina-color-grey-1);
  font-size: var(--tina-font-size-4);
  font-weight: var(--tina-font-weight-regular);
  padding: var(--tina-padding-big) var(--tina-padding-big)
    var(--tina-padding-big) 64px;
  position: relative;
  cursor: pointer;
  transition: all var(--tina-timing-short) ease-out;
  overflow: hidden;
  &:after {
    content: '';
    position: absolute;
    top: 8px;
    bottom: 8px;
    left: 8px;
    right: 8px;
    border-radius: var(--tina-radius-big);
    background-color: var(--tina-color-grey-9);
    z-index: -1;
    transition: all 150ms ease;
    transform: translate3d(0, 100%, 0);
    opacity: 0;
  }
  &:hover {
    color: var(--tina-color-primary-light);
    &:after {
      transform: translate3d(0, 0, 0);
      transition: transform var(--tina-timing-short) ease-out, opacity 0ms;
      opacity: 1;
    }
    svg {
      fill: var(--tina-color-primary);
    }
    & ~ * {
      &:after {
        transform: translate3d(0, -100%, 0);
      }
    }
  }
  svg {
    position: absolute;
    left: var(--tina-padding-big);
    top: 50%;
    transform: translate3d(0, -50%, 0);
    width: 36px;
    height: auto;
    fill: var(--tina-color-grey-4);
    transition: all var(--tina-timing-short) ease-out;
  }
`

const MenuWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding: var(--tina-padding-big);
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`

const MenuPanel = styled.div<{ visible: boolean }>`
  all: unset;
  box-sizing: border-box;
  background: var(--tina-color-grey-8);
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--tina-sidebar-width);
  transform: translate3d(${(p) => (p.visible ? '0' : '-100%')}, 0, 0);
  overflow: hidden;
  padding: var(--tina-padding-big);
  transition: all var(--tina-timing-long) ease-out;
  z-index: var(--tina-z-index-2);

  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`

const Watermark = styled(({ ...styleProps }: any) => {
  return (
    <div {...styleProps}>
      <TinaIcon />
    </div>
  )
})`
  position: absolute;
  z-index: -1;
  bottom: var(--tina-padding-big);
  left: var(--tina-padding-big);
  svg {
    width: 128px;
    height: 128px;
    margin: -4px -20px;
    fill: var(--tina-color-grey-9);
  }
`
