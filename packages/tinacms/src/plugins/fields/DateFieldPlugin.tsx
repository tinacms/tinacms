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
import { InputProps } from '@tinacms/fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import * as ReactDatetime from 'react-datetime'
import { ReactDateTimeContainer } from './reactDatetimeStyles'
import { DatetimepickerProps } from 'react-datetime'
import { useEffect, useState, useRef } from 'react'
import { useFrameContext } from '../../components/SyledFrame'
import styled from 'styled-components'
import { InputCss } from '@tinacms/fields'
import * as _moment from 'moment'
const moment = _moment //https://github.com/jvandemo/generator-angular2-library/issues/221#issuecomment-355945207

export const DateField = wrapFieldsWithMeta<InputProps, DatetimepickerProps>(
  ({ input, field }) => {
    const [isOpen, setIsOpen] = useState(false)
    const area = useRef(null)

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
    }, [documentContext])

    return (
      <DatetimeContainer>
        <ReactDateTimeContainer ref={area}>
          <ReactDatetime
            value={input.value}
            onFocus={input.onFocus}
            onChange={input.onChange}
            open={isOpen}
            timeFormat={false}
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

const DEFAULT_DATE_DISPLAY_FORMAT = 'MMM DD, YYYY'
export default {
  name: 'date',
  Component: DateField,
  format(
    val: _moment.Moment | string,
    _name: string,
    field: DatetimepickerProps
  ) {
    const dateFormat =
      typeof field.dateFormat === 'string'
        ? field.dateFormat
        : DEFAULT_DATE_DISPLAY_FORMAT

    if (typeof val === 'string') {
      var date = moment(val)
      return date.isValid() ? date.format(dateFormat) : val
    }
    return moment(val).format(dateFormat)
  },
  parse(val: _moment.Moment | string): any {
    if (typeof val === 'string') {
      var date = moment(val)
      return date.isValid() ? date.toDate() : val
    }
    return val.toDate()
  },
}
