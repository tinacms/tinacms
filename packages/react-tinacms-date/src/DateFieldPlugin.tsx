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
import { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import {
  InputProps,
  wrapFieldsWithMeta,
  InputCss,
} from '@einsteinindustries/tinacms-fields'
import ReactDatetime from 'react-datetime'
import { DatetimepickerProps } from 'react-datetime'

import { ReactDateTimeContainer } from './reactDatetimeStyles'
import { format, parse } from './dateFormat'

export const DateField = wrapFieldsWithMeta<InputProps, DatetimepickerProps>(
  ({ input, field }) => {
    const [isOpen, setIsOpen] = useState(false)
    const area = useRef<HTMLDivElement>(null!)

    useEffect(() => {
      const handleClick = (event: MouseEvent) => {
        if (!area.current) return
        if (!event.target) return

        if (!area.current.contains(event.target as HTMLElement)) {
          setIsOpen(false)
        } else {
          setIsOpen(true)
        }
      }
      document.addEventListener('mouseup', handleClick, false)
      return () => {
        document.removeEventListener('mouseup', handleClick, false)
      }
    }, [document])

    return (
      <DatetimeContainer>
        <ReactDateTimeContainer ref={area}>
          <ReactDatetime
            value={input.value}
            onFocus={input.onFocus}
            onChange={input.onChange}
            open={isOpen}
            dateFormat="MMM DD, YYYY"
            timeFormat={false}
            utc // https://github.com/tinacms/tinacms/pull/326#issuecomment-543836469
            {...field}
          />
        </ReactDateTimeContainer>
      </DatetimeContainer>
    )
  }
)

const DatetimeContainer = styled.div`
  input {
    ${InputCss};
  }
`

export const DateFieldPlugin = {
  __type: 'field',
  name: 'date',
  Component: DateField,
  format,
  parse,
}
