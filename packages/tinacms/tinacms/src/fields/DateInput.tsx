import * as React from 'react'
import { InputProps } from '@tinacms/fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import * as ReactDatetime from 'react-datetime'
import { ReactDateTimeContainer } from './reactDatetimeStyles'
import { DatetimepickerProps } from 'react-datetime'
import { useEffect, useState } from 'react'
import { useFrameContext } from '../styled-frame'
import styled from 'styled-components'
import { TextField } from '@tinacms/fields'

let area: any
export const DateInput = wrapFieldsWithMeta<InputProps, DatetimepickerProps>(
  ({ input, field }) => {
    let [isOpen, setIsOpen] = useState(false)
    const handleClick = (event: MouseEvent) => {
      if (!area.contains(event.target)) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    const documentContext = useFrameContext().document
    useEffect(() => {
      documentContext.addEventListener('mouseup', handleClick, false)
      return () => {
        documentContext.removeEventListener('mouseup', handleClick, false)
      }
    }, [])

    return (
      <DatetimeContainer>
        <ReactDateTimeContainer
          ref={ref => {
            area = ref
          }}
        >
          <ReactDatetime
            value={input.value}
            onFocus={input.onFocus}
            onChange={input.onChange}
            open={isOpen}
            {...field}
          />
        </ReactDateTimeContainer>
      </DatetimeContainer>
    )
  }
)

//TODO - this is basically a rip from our TextField styledComponents component. It would be be good
// if we could reuse those styles instead of having a duplicate.
const DatetimeContainer = styled.div`
  input {
    background-color: ${p => p.theme.color.light};
    border-radius: ${p => p.theme.input.radius};
    font-size: ${p => p.theme.input.fontSize};
    line-height: ${p => p.theme.input.lineHeight};
    transition: background-color ${p => p.theme.timing.short} ease-out,
      border-color ${p => p.theme.timing.short} ease-out,
      box-shadow ${p => p.theme.timing.medium} ease-out;
    padding: ${p => p.theme.input.padding};
    border-width: 1px;
    border-style: solid;
    border-color: #f2f2f2;
    width: 100%;
    margin: 0;
    outline: none;

    &:hover {
      background-color: #f0f0f0;
    }

    &:focus {
      border-color: ${p => p.theme.color.primary};
      box-shadow: 0 0 2px 0 ${p => p.theme.color.primary};
      background-color: #f8f8f8;
    }

    &::placeholder {
      font-size: 0.9rem;
      color: #cfd3d7;
    }
  }
`
