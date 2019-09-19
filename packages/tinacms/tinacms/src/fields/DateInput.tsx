import * as React from 'react'
import { InputProps } from '@tinacms/fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import * as ReactDatetime from 'react-datetime'
import { ReactDateTimeContainer } from './reactDatetimeStyles'
import { DatetimepickerProps } from 'react-datetime'
import { useEffect, useState, useRef } from 'react'
import { useFrameContext } from '../styled-frame'
import styled from 'styled-components'

export const DateInput = wrapFieldsWithMeta<InputProps, DatetimepickerProps>(
  ({ input, field }) => {
    let [isOpen, setIsOpen] = useState(false)
    let area = useRef(null)

    const documentContext = useFrameContext().document
    useEffect(() => {
      const handleClick = (event: MouseEvent) => {
        if (!area.current) return
        // @ts-ignore
        if (!area.current!.contains(event.target)) {
          setIsOpen(false)
        } else {
          setIsOpen(true)
        }
      }
      documentContext.addEventListener('mouseup', handleClick, false)
      return () => {
        documentContext.removeEventListener('mouseup', handleClick, false)
      }
    }, [])

    return (
      <DatetimeContainer>
        <ReactDateTimeContainer ref={area}>
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
      border-color: ${color('primary')};
      box-shadow: 0 0 2px 0 ${color('primary')};
      background-color: #f8f8f8;
    }

    &::placeholder {
      font-size: 0.9rem;
      color: #cfd3d7;
    }
  }
`
