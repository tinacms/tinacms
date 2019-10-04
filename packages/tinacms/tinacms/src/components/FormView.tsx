import * as React from 'react'
import { FormBuilder, FieldsBuilder } from '@tinacms/form-builder'
import { useCMS, useSubscribable } from '@tinacms/react-tinacms'
import { useState } from 'react'
import { Form } from '@tinacms/core'
import styled, { keyframes, css } from 'styled-components'
import { padding, color } from '@tinacms/styles'
import { Button } from './Button'
import { ActionsMenu } from './ActionsMenu'
import FormsList from './FormsList'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { LeftArrowIcon } from '@tinacms/icons'
import {
  SIDEBAR_HEADER_HEIGHT,
  FORM_HEADER_HEIGHT,
  FORM_FOOTER_HEIGHT,
  SIDEBAR_WIDTH,
} from '../Globals'

export const FormsView = () => {
  const cms = useCMS()
  const forms = cms.forms.all()
  const [editingForm, setEditingForm] = useState<Form | null>(() => {
    return cms.forms.all()[0] as Form | null
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isMultiform, setIsMultiform] = useState(false)

  useSubscribable(cms.forms, () => {
    const forms = cms.forms.all()
    if (forms.length == 1) {
      setIsMultiform(false)
      setEditingForm(forms[0])
      return
    }

    //if multiforms, set default view to formslist
    if (forms.length > 1) {
      setIsMultiform(true)
      //if they navigate to another page w/ no active form, reset
      !editingForm && setEditingForm(null)
    }

    if (editingForm && forms.findIndex(f => f.id == editingForm.id) < 0) {
      setEditingForm(null)
    }
  })

  //Toggles editing prop for component animations
  React.useEffect(() => {
    editingForm ? setIsEditing(true) : setIsEditing(false)
  })

  let moveArrayItem = React.useCallback(
    (result: DropResult) => {
      let form = editingForm!.finalForm
      if (!result.destination) return
      let name = result.type
      form.mutators.move(name, result.source.index, result.destination.index)
    },
    [editingForm]
  )

  /**
   * No Forms
   */
  if (!forms.length) return <NoFormsPlaceholder />

  if (!editingForm)
    return (
      <FormsList
        isEditing={isEditing}
        forms={forms}
        activeForm={editingForm}
        setActiveForm={setEditingForm}
      />
    )

  return (
    <FormBuilder form={editingForm as any}>
      {({ handleSubmit, pristine, form }) => {
        return (
          <DragDropContext onDragEnd={moveArrayItem}>
            <FormWrapper isEditing={isEditing}>
              <FormHeader
                isMultiform={isMultiform}
                form={editingForm as any}
                setEditingForm={setEditingForm as any}
              />
              <FormBody>
                {editingForm &&
                  (editingForm.fields.length ? (
                    <FieldsBuilder
                      form={editingForm}
                      fields={editingForm.fields}
                    />
                  ) : (
                    <NoFieldsPlaceholder />
                  ))}
              </FormBody>
              <FormFooter>
                {editingForm.actions.length > 0 && (
                  <ActionsMenu actions={editingForm.actions} />
                )}

                <SaveButton onClick={() => handleSubmit()} disabled={pristine}>
                  Save
                </SaveButton>
              </FormFooter>
            </FormWrapper>
          </DragDropContext>
        )
      }}
    </FormBuilder>
  )
}

const Emoji = styled.span`
  font-size: 2.5rem;
  line-height: 1;
  display: inline-block;
`

const EmptyState = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${padding()}rem ${padding()}rem 4rem ${padding()}rem;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  > *:first-child {
    margin: 0 0 ${padding()}rem 0;
  }
  > ${Emoji} {
    display: block;
  }
  h3 {
    font-size: 1.2rem;
    font-weight: normal;
    color: inherit;
    display: block;
    margin: 0 0 ${padding()}rem 0;
    ${Emoji} {
      font-size: 1em;
    }
  }
  p {
    display: block;
    margin: 0 0 ${padding()}rem 0;
  }
`

const LinkButton = styled.a`
  text-align: center;
  border: 0;
  border-radius: ${p => p.theme.radius.big};
  border: 1px solid #edecf3;
  box-shadow: ${p => p.theme.shadow.small};
  font-weight: 500;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all ${p => p.theme.timing.short} ease-out;
  background-color: white;
  color: ${color('dark')};
  padding: ${padding('small')}rem ${padding('big')}rem ${padding('small')}rem
    3.5rem;
  position: relative;
  text-decoration: none;
  display: inline-block;
  ${Emoji} {
    font-size: 1.5rem;
    position: absolute;
    left: ${padding('big')}rem;
    top: 50%;
    transform-origin: 50% 50%;
    transform: translate3d(0, -50%, 0);
    transition: all ${p => p.theme.timing.short} ease-out;
  }
  &:hover {
    color: ${color('primary')};
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
        href="https://github.com/tinacms/tinacms-site/blob/master/content/docs/gatsby/content-editing.md"
        target="_blank"
      >
        <Emoji>📖</Emoji> Form Setup Guide
      </LinkButton>
    </p>
  </EmptyState>
)

const NoFieldsPlaceholder = () => (
  <EmptyState>
    <Emoji>🤔</Emoji>
    <h3>Hey, you don't have any fields added to this form.</h3>
    <p>
      <LinkButton
        href="https://github.com/tinacms/tinacms-site/blob/master/docs/gatsby/content-editing.md"
        target="_blank"
      >
        <Emoji>📖</Emoji> Field Setup Guide
      </LinkButton>
    </p>
  </EmptyState>
)

const CreateButton = styled(Button)`
  width: 100%;
`

const FormHeader = styled(
  ({ form, setEditingForm, isMultiform, ...styleProps }: any) => {
    return (
      <div {...styleProps} onClick={() => isMultiform && setEditingForm(null)}>
        {isMultiform && <LeftArrowIcon />}
        <span>{form.label}</span>
      </div>
    )
  }
)`
  position: relative;
  width: 100%;
  height: ${FORM_HEADER_HEIGHT}rem;
  flex: 0 0 ${FORM_HEADER_HEIGHT}rem;
  cursor: ${p => p.isMultiform && 'pointer'};
  background-color: white;
  border-bottom: 1px solid #edecf3;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  padding: 0 ${padding()}rem ${padding('small')}rem ${padding()}rem;
  color: inherit;
  font-size: 1.2rem;
  transition: color 250ms ease-out;
  user-select: none;
  span {
    flex: 1 1 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  svg {
    flex: 0 0 auto;
    width: 1.5rem;
    fill: #e1ddec;
    height: auto;
    transform: translate3d(-4px, 0, 0);
    transition: transform 150ms ease-out;
  }
  :hover {
    color: ${p => p.isMultiform && `${p.theme.color.primary}`};
    svg {
      fill: #433e52;
      transform: translate3d(-7px, 0, 0);
      transition: transform 250ms ease;
    }
  }
`

export const FormBody = styled.div`
  position: relative;
  flex: 1 1 auto;
  scrollbar-width: none;
  width: 100%;
  overflow: hidden;
  background-color: #f6f6f9;
`

const FormFooter = styled.div`
  position: relative;
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 4rem;
  background-color: white;
  border-top: 1px solid #edecf3;
  padding: 0 1.25rem;
`

const FormAnimationKeyframes = keyframes`
  0% {
    transform: translate3d( 100%, 0, 0 );
  }
  100% {
    transform: translate3d( 0, 0, 0 );
  }
`

const FormWrapper = styled.div<{ isEditing: Boolean }>`
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

export const SaveButton = styled(Button)`
  flex: 1.5 0 auto;
  padding: 0.75rem 1.5rem;
`

export const CancelButton = styled(SaveButton)`
  background-color: white;
  border: 1px solid #edecf3;
  color: #0084ff;
  &:hover {
    background-color: #f6f6f9;
    opacity: 1;
  }
`
