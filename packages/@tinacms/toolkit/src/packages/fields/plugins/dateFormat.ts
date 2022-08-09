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

import moment from 'moment'
import type { DatetimepickerProps } from 'react-datetime'

export const DEFAULT_DATE_DISPLAY_FORMAT = 'MMM DD, YYYY'
export const DEFAULT_TIME_DISPLAY_FORMAT = 'h:mm A'

// formats a function from default datetime format to given format
export const format = (
  val: string,
  _name: string,
  field: DatetimepickerProps
): string => {
  const dateFormat = parseDateFormat(field.dateFormat)
  const timeFormat = parseTimeFormat(field.timeFormat)

  const combinedFormat =
    typeof timeFormat === 'string' ? `${dateFormat} ${timeFormat}` : dateFormat

  if (typeof val === 'string') {
    const date = moment(val)
    return date.isValid() ? date.format(combinedFormat) : val
  }

  return moment(val).format(combinedFormat)
}

// parses a function from the given format to default datetime format
export const parse = (val: string) => {
  const date = new Date(val)
  if (!isNaN(date.getTime())) {
    return new Date(val).toISOString()
  }
  return val
}

function parseDateFormat(format: string | boolean | undefined): string {
  if (typeof format === 'string') {
    return format
  }
  return DEFAULT_DATE_DISPLAY_FORMAT
}

function parseTimeFormat(
  format: string | boolean | undefined
): string | undefined {
  if (typeof format === 'string') {
    return format
  } else if (format) {
    return DEFAULT_TIME_DISPLAY_FORMAT
  }
}
