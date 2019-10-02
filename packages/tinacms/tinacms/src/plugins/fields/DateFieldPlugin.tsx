import * as React from 'react'
import { InputProps } from '@tinacms/fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import * as ReactDatetime from 'react-datetime'
import { ReactDateTimeContainer } from './reactDatetimeStyles'
import { DatetimepickerProps } from 'react-datetime'
import { useEffect, useState, useRef } from 'react'
import { useFrameContext } from '../../components/SyledFrame'
import styled from 'styled-components'
import { color } from '@tinacms/styles'

export const DateField = wrapFieldsWithMeta<InputProps, DatetimepickerProps>(
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
    position: relative;
    background-color: white;
    border-radius: 0.3rem;
    font-size: ${p => p.theme.input.fontSize};
    line-height: ${p => p.theme.input.lineHeight};
    transition: all 85ms ease-out;
    padding: ${p => p.theme.input.padding};
    border: 1px solid #edecf3;
    width: 100%;
    margin: 0;
    outline: none;
    box-shadow: 0 0 0 2px transparent;

    &:hover {
      box-shadow: 0 0 0 2px #e1ddec;
    }

    &:focus {
      box-shadow: 0 0 0 2px ${color('primary')};
    }

    &::placeholder {
      font-size: 0.9rem;
      color: #cfd3d7;
    }
  }
`

export default {
  name: 'date',
  Component: DateField,
  parse(date: any) {
    if (typeof date === 'string') return date
    return date.toDate()
  },
}
