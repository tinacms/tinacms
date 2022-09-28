/* eslint-disable @typescript-eslint/ban-ts-ignore */
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
import { InputProps, textFieldClasses } from '../components'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
// we might be able to go back to react-datetime when https://github.com/arqex/react-datetime/pull/813 is merged
import ReactDatetime from '../../react-datetime/DateTime'
import type { DatetimepickerProps } from 'react-datetime'
import { format, parse, DEFAULT_DATE_DISPLAY_FORMAT } from './dateFormat'
// @ts-ignore importing css is not recognized
import DateFieldPluginCSS from './DateFieldPlugin.css'

export const DateField = wrapFieldsWithMeta<InputProps, DatetimepickerProps>(
  ({ input, field: { dateFormat, timeFormat, ...rest } }) => {
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
      <>
        <style>{DateFieldPluginCSS}</style>
        <div className="tina-date-field" ref={area}>
          <ReactDatetime
            value={input.value}
            onFocus={input.onFocus}
            onChange={input.onChange}
            open={isOpen}
            dateFormat={dateFormat || DEFAULT_DATE_DISPLAY_FORMAT}
            timeFormat={timeFormat || false}
            inputProps={{ className: textFieldClasses }}
            {...rest}
          />
        </div>
      </>
    )
  }
)

export const DateFieldPlugin = {
  __type: 'field',
  name: 'date',
  Component: DateField,
  format,
  parse,
}
