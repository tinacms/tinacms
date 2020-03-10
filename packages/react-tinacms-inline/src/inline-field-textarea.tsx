import React from 'react'
import { InlineField } from './inline-field'
import styled from 'styled-components'
import TextareaAutosize from 'react-textarea-autosize'
import { radius, color } from '@tinacms/styles'

interface InlineTextFieldProps {
  name: string
}

export function InlineTextareaField({ name }: InlineTextFieldProps) {
  return (
    <InlineField name={name}>
      {({ input, status }) => {
        if (status === 'active') {
          return (
            <InputFocusWrapper>
              <InlineTextarea {...input} rows={1} />
            </InputFocusWrapper>
          )
        }
        return <>{input.value}</>
      }}
    </InlineField>
  )
}

const InputFocusWrapper = styled.div`
  position: relative;

  &:focus-within {
    &:after {
      opacity: 1;
    }
  }

  &:hover:not(:focus-within) {
    &:after {
      opacity: 0.3;
    }
  }

  &:after {
    content: '';
    display: block;
    position: absolute;
    left: -16px;
    top: -16px;
    width: calc(100% + 2rem);
    height: calc(100% + 2rem);
    border: 3px solid ${color.primary()};
    border-radius: ${radius()};
    opacity: 0;
    pointer-events: none;
    z-index: 1000;
    transition: all 150ms ease-out;
  }
`

export const InlineTextarea = styled(({ ...styleProps }) => {
  return <TextareaAutosize {...styleProps} />
})`
  width: 100%;
  word-wrap: break-word;
  display: block;
  font-size: inherit;
  box-sizing: border-box;
  color: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  margin: 0 auto;
  max-width: inherit;
  background-color: inherit;
  text-align: inherit;
  outline: none;
  resize: none;
  border: none;
  overflow: visible;
  position: relative;
  -ms-overflow-style: none;

  ::-webkit-scrollbar {
    display: none;
  }
`
