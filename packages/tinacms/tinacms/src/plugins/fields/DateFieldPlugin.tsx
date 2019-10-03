import * as React from 'react'
import { InputProps } from '@tinacms/fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import * as ReactDatetime from 'react-datetime'
import { ReactDateTimeContainer } from './reactDatetimeStyles'
import { DatetimepickerProps } from 'react-datetime'
import { useEffect, useState, useRef } from 'react'
import { useFrameContext } from '../../components/SyledFrame'
import styled from 'styled-components'
import { TextFieldCss } from '@tinacms/fields'

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

const DatetimeContainer = styled.div`
  input {
    ${TextFieldCss}
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
