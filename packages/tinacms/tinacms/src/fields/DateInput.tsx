import * as React from 'react'
import { InputProps } from '@tinacms/fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import * as ReactDatetime from 'react-datetime'
import { ReactDateTimeContainer } from './reactDatetimeStyles'
import { DatetimepickerProps } from 'react-datetime'
import { useEffect, useState } from 'react'
import { useFrameContext } from '../styled-frame'
import styled from 'styled-components'

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

const DatetimeContainer = styled.div`
  input {
    background-color: #f8f8f8;
    border-width: 1px;
    border-style: solid;
    border-color: #f2f2f2;
    border-radius: 0.25rem;
    width: 100%;
    font-size: 0.9rem;
    padding: 0.75rem;
    margin: 0;
    outline: none;
    transition: all 150ms ease-out;

    &:hover {
      background-color: #f2f2f2;
    }

    &:focus {
      border-color: #333333;
      background-color: #f8f8f8;
    }

    &::placeholder {
      font-size: 0.9rem;
      color: #cfd3d7;
    }
  }
`
