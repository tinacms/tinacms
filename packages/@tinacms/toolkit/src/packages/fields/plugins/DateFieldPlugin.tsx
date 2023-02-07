/* eslint-disable @typescript-eslint/ban-ts-ignore */
/**



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
    return (
      <>
        <ReactDateTimeWithStyles
          value={input.value}
          onFocus={input.onFocus}
          onChange={input.onChange}
          dateFormat={dateFormat || DEFAULT_DATE_DISPLAY_FORMAT}
          timeFormat={timeFormat || false}
          inputProps={{ className: textFieldClasses }}
          {...rest}
        />
      </>
    )
  }
)

export const ReactDateTimeWithStyles = (props: DatetimepickerProps) => {
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
        <ReactDatetime {...props} isOpen={isOpen} />
      </div>
    </>
  )
}

export const DateFieldPlugin = {
  __type: 'field',
  name: 'date',
  Component: DateField,
  format,
  parse,
}
