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
    width: 100%;
  }
`
