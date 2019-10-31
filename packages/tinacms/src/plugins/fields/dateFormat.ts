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

import moment from 'moment'
import { DatetimepickerProps } from 'react-datetime'

const DEFAULT_DATE_DISPLAY_FORMAT = 'MMM DD, YYYY'

// Format date for display
export const format = (
  val: moment.Moment | string,
  _name: string,
  field: DatetimepickerProps
): string => {
  const dateFormat =
    typeof field.dateFormat === 'string'
      ? field.dateFormat
      : DEFAULT_DATE_DISPLAY_FORMAT

  if (typeof val === 'string') {
    const date = moment(val) // TODO Take in export date here once it's configurable
    return date.isValid() ? date.format(dateFormat) : val
  }
  return moment(val).format(dateFormat)
}

// Format datepicker value for export
export const parse = (
  val: moment.Moment | string,
  _name: string,
  field: DatetimepickerProps
) => {
  const dateFormat =
    typeof field.dateFormat === 'string'
      ? field.dateFormat
      : DEFAULT_DATE_DISPLAY_FORMAT
  if (typeof val === 'string') {
    const date = moment(val, dateFormat)
    return date.isValid() ? date.toDate() : val
  }
  return val.toDate()
}
