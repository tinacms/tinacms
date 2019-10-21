import * as _moment from 'moment'
import { DatetimepickerProps } from 'react-datetime'
const moment = _moment //https://github.com/jvandemo/generator-angular2-library/issues/221#issuecomment-355945207

const DEFAULT_DATE_DISPLAY_FORMAT = 'MMM DD, YYYY'

// Format date for display
export const format = (
  val: _moment.Moment | string,
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
  val: _moment.Moment | string,
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
