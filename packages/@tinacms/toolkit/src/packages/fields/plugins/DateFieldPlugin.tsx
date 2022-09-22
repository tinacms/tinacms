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
import { InputProps, textFieldClasses } from '../components'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
// we might be able to go back to react-datetime when https://github.com/arqex/react-datetime/pull/813 is merged
import ReactDatetime from '../../react-datetime/DateTime'
import type { DatetimepickerProps } from 'react-datetime'
import { format, parse, DEFAULT_DATE_DISPLAY_FORMAT } from './dateFormat'

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
      <ReactDateTimeContainer ref={area}>
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
      </ReactDateTimeContainer>
    )
  }
)

const ReactDateTimeContainer = styled.div`
  .rdt {
    position: relative;
  }
  .rdtPicker {
    display: none;
    position: absolute;
    width: 100%;
    max-width: 350px;
    padding: 4px;
    margin-top: 4px;
    z-index: 99999 !important;
    background: var(--tina-color-grey-0);
    border-radius: var(--tina-radius-small);
    box-shadow: var(--tina-shadow-big);
    border: 1px solid var(--tina-color-grey-2);
  }
  .rdtOpen .rdtPicker {
    display: block;
  }
  .rdtStatic .rdtPicker {
    box-shadow: none;
    position: static;
  }
  .rdtPicker .rdtTimeToggle {
    text-align: center;
  }
  .rdtPicker table {
    width: 100%;
    margin: 0;
  }
  .rdtPicker td,
  .rdtPicker th {
    text-align: center;
    height: 28px;
  }
  .rdtPicker td {
    cursor: pointer;
  }
  .rdtPicker td.rdtDay:hover,
  .rdtPicker td.rdtHour:hover,
  .rdtPicker td.rdtMinute:hover,
  .rdtPicker td.rdtSecond:hover,
  .rdtPicker .rdtTimeToggle:hover {
    background: var(--tina-color-grey-2);
    color: var(--tina-color-primary);
    border-radius: var(--tina-radius-small);
    cursor: pointer;

    &:active {
      background: var(--tina-color-primary);
      color: var(--tina-color-grey-0);
      border-radius: var(--tina-radius-small);
    }
  }
  .rdtPicker td.rdtOld,
  .rdtPicker td.rdtNew {
    color: var(--tina-color-grey-6);
  }
  .rdtPicker td.rdtToday {
    position: relative;
  }
  .rdtPicker td.rdtToday:before {
    content: '';
    display: inline-block;
    border-left: 7px solid transparent;
    border-bottom: 7px solid var(--tina-color-primary);
    border-radius: 20px;
    border-top-color: rgba(0, 0, 0, 0.2);
    position: absolute;
    bottom: 4px;
    right: 4px;
  }
  .rdtPicker td.rdtActive,
  .rdtPicker td.rdtActive:hover {
    background-color: var(--tina-color-primary);
    color: var(--tina-color-grey-0);
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  }
  .rdtPicker td.rdtActive.rdtToday:before {
    border-bottom-color: var(--tina-color-grey-0);
  }
  .rdtPicker td.rdtDisabled,
  .rdtPicker td.rdtDisabled:hover {
    background: none;
    color: var(--tina-color-grey-6);
    cursor: not-allowed;
  }
  .rdtPicker td span.rdtOld {
    color: var(--tina-color-grey-6);
  }
  .rdtPicker td span.rdtDisabled,
  .rdtPicker td span.rdtDisabled:hover {
    background: none;
    color: var(--tina-color-grey-6);
    cursor: not-allowed;
  }
  .rdtPicker th {
    border-bottom: 1px solid var(--tina-color-grey-1);
  }
  .rdtPicker .dow {
    width: 14.2857%;
    border-bottom: none;
    cursor: default;
  }
  .rdtPicker th.rdtSwitch {
    width: 100px;
  }
  .rdtPicker th.rdtNext,
  .rdtPicker th.rdtPrev {
    font-size: 21px;
    vertical-align: top;
  }
  .rdtPrev span,
  .rdtNext span {
    display: block;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Chrome/Safari/Opera */
    -khtml-user-select: none; /* Konqueror */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none;
  }
  .rdtPicker th.rdtDisabled,
  .rdtPicker th.rdtDisabled:hover {
    background: none;
    color: var(--tina-color-grey-6);
    cursor: not-allowed;
  }
  .rdtPicker thead tr:first-child th {
    cursor: pointer;
  }
  .rdtPicker thead tr:first-child th:hover {
    background: var(--tina-color-grey-2);
    color: var(--tina-color-primary);
    border-radius: var(--tina-radius-small);
  }
  .rdtPicker tfoot {
    border-top: 1px solid var(--tina-color-grey-1);
  }
  .rdtPicker button {
    border: none;
    background: none;
    cursor: pointer;
  }
  .rdtPicker button:hover {
    background: var(--tina-color-grey-2);
    color: var(--tina-color-primary);
    border-radius: var(--tina-radius-small);
  }
  .rdtPicker thead button {
    width: 100%;
    height: 100%;
  }
  td.rdtMonth,
  td.rdtYear {
    height: 50px;
    width: 25%;
    cursor: pointer;
  }
  td.rdtMonth:hover,
  td.rdtYear:hover {
    background: var(--tina-color-grey-2);
    color: var(--tina-color-primary);
    border-radius: var(--tina-radius-small);
  }
  .rdtCounters {
    display: inline-block;
  }
  .rdtCounters > div {
    float: left;
  }
  .rdtCounter {
    height: 100px;
  }
  .rdtCounter {
    width: 40px;
  }
  .rdtCounterSeparator {
    line-height: 100px;
  }
  .rdtCounter .rdtBtn {
    height: 40%;
    line-height: 40px;
    cursor: pointer;
    display: block;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Chrome/Safari/Opera */
    -khtml-user-select: none; /* Konqueror */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none;
  }
  .rdtCounter .rdtBtn:hover {
    background: var(--tina-color-grey-2);
    color: var(--tina-color-primary);
    border-radius: var(--tina-radius-small);
  }
  .rdtCounter .rdtCount {
    height: 20%;
    font-size: 1.2em;
  }
  .rdtMilli {
    vertical-align: middle;
    padding-left: 8px;
    width: 48px;
  }
  .rdtMilli input {
    width: 100%;
    font-size: 1.2em;
    margin-top: 37px;
  }
  .rdtTime td {
    cursor: default;
  }
`

export const DateFieldPlugin = {
  __type: 'field',
  name: 'date',
  Component: DateField,
  format,
  parse,
}
