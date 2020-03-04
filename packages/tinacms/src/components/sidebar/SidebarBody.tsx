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

import { useState } from 'react'
import styled, { keyframes, css, StyledComponent } from 'styled-components'
import {
  Button,
  padding,
  color,
  font,
  timing,
  radius,
  shadow,
} from '@tinacms/styles'
import { FormList } from './FormList'
import { useCMS, useSubscribable } from '../../react-tinacms'
import { FormView, FormHeader } from '../form/FormView'

export const FormsView = () => {
  const [activeFormId, setActiveFormId] = useState<string>()
  const cms = useCMS()

  /**
   * If there's only one form, make it the active form.
   *
   * TODO: There's an issue where the forms register one
   * by one, so the 'active form' always gets set as if there
   * were only one form, even when there are multiple
   */

  function setSingleActiveForm() {
    if (cms.forms.all().length === 1) {
      setActiveFormId(cms.forms.all()[0].id)
    }
  }

  /*
   ** Subscribes the forms to the CMS,
   ** passing a callback to set active form
   */
  useSubscribable(cms.forms, () => {
    setSingleActiveForm()
  })

  /*
   ** Sets single active form on componentDidMount
   */
  React.useEffect(() => {
    setSingleActiveForm()
  }, [])

  const forms = cms.forms.all()
  const isMultiform = forms.length > 1
  const activeForm = activeFormId ? cms.forms.find(activeFormId) : null
  const isEditing = !!activeForm

  /**
   * No Forms
   */
  if (!forms.length) {
    return <NoFormsPlaceholder />
  }

  if (isMultiform && !activeForm) {
    return (
      <FormList
        isEditing={isEditing}
        forms={forms}
        setActiveFormId={setActiveFormId}
      />
    )
  }

  return (
    <>
      {activeForm && (
        <FormWrapper isEditing={isEditing} isMultiform={isMultiform}>
          <FormView
            activeForm={activeForm}
            setActiveFormId={setActiveFormId}
            isMultiform={isMultiform}
          />
        </FormWrapper>
      )}
    </>
  )
}

const Emoji = styled.span`
  font-size: 40px;
  line-height: 1;
  display: inline-block;
`

const EmptyStateAnimation = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`

const EmptyState = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${padding()} ${padding()} 64px ${padding()};
  width: 100%;
  height: 100%;
  overflow-y: auto;
  animation-name: ${EmptyStateAnimation};
  animation-delay: 300ms;
  animation-timing-function: ease-out;
  animation-iteration-count: 1;
  animation-fill-mode: both;
  animation-duration: 150ms;
  > *:first-child {
    margin: 0 0 ${padding()} 0;
  }
  > ${Emoji} {
    display: block;
  }
  h3 {
    font-size: ${font.size(5)};
    font-weight: normal;
    color: inherit;
    display: block;
    margin: 0 0 ${padding()} 0;
    ${Emoji} {
      font-size: 1em;
    }
  }
  p {
    display: block;
    margin: 0 0 ${padding()} 0;
  }
`

const LinkButton = styled.a`
  text-align: center;
  border: 0;
  border-radius: ${radius('big')};
  border: 1px solid ${color.grey(2)};
  box-shadow: ${shadow('small')};
  font-weight: 500;
  cursor: pointer;
  font-size: ${font.size(0)};
  transition: all ${timing('short')} ease-out;
  background-color: white;
  color: ${color.grey(8)};
  padding: ${padding('small')} ${padding('big')} ${padding('small')} 56px;
  position: relative;
  text-decoration: none;
  display: inline-block;
  ${Emoji} {
    font-size: 24px;
    position: absolute;
    left: ${padding('big')};
    top: 50%;
    transform-origin: 50% 50%;
    transform: translate3d(0, -50%, 0);
    transition: all ${timing('short')} ease-out;
  }
  &:hover {
    color: ${color.primary()};
    ${Emoji} {
      transform: translate3d(0, -50%, 0);
    }
  }
`

const NoFormsPlaceholder = () => (
  <EmptyState>
    <Emoji>👋</Emoji>
    <h3>
      Welcome to <b>Tina</b>!
    </h3>
    <p>
      Let's get a form set up
      <br />
      so you can start editing.
    </p>
    <p>
      <LinkButton
        href="https://tinacms.org/docs/getting-started/introduction/#get-started"
        target="_blank"
      >
        <Emoji>📖</Emoji> Form Setup Guide
      </LinkButton>
    </p>
  </EmptyState>
)

export const Wrapper = styled.div`
  display: block;
  margin: 0 auto;
  max-width: 500px;
  width: 100%;
`

export const FormBody: StyledComponent<'div', {}, {}> = styled.div`
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  scrollbar-width: none;
  width: 100%;
  overflow: hidden;
  border-top: 1px solid ${color.grey(2)};
  background-color: #f6f6f9;

  ${Wrapper} {
    height: 100%;
    scrollbar-width: none;
  }
`

const FormFooter = styled.div`
  position: relative;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  width: 100%;
  height: 64px;
  background-color: white;
  border-top: 1px solid ${color.grey(2)};

  ${Wrapper} {
    flex: 1 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
  }
`

const FormAnimationKeyframes = keyframes`
  0% {
    transform: translate3d( 100%, 0, 0 );
  }
  100% {
    transform: translate3d( 0, 0, 0 );
  }
`

interface FormWrapperProps {
  isEditing: Boolean
  isMultiform: Boolean
}

const FormWrapper = styled.div<FormWrapperProps>`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  overflow: hidden;
  height: 100%;
  width: 100%;
  position: relative;

  ${FormHeader}, ${FormBody}, ${FormFooter} {
    transform: translate3d(100%, 0, 0);
  }

  ${p =>
    p.isEditing &&
    css`
      ${FormHeader}, ${FormBody}, ${FormFooter} {
        transform: none;
        animation-name: ${FormAnimationKeyframes};
        animation-duration: 150ms;
        animation-delay: 0;
        animation-iteration-count: 1;
        animation-timing-function: ease-out;
      }
    `};
`

export const SaveButton: StyledComponent<typeof Button, {}, {}> = styled(
  Button
)`
  flex: 1.5 0 auto;
  padding: 12px 24px;
`
