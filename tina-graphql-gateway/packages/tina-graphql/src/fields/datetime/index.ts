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

import { gql } from '../../gql'
import isValid from 'date-fns/isValid'
import parseISO from 'date-fns/parseISO'
import format from 'date-fns/format'

import { BuildArgs, ResolveArgs, assertIsString } from '../'

const typename = 'DatetimeField'
const DEFAULT_DATE_FORMAT = 'MMM dd, yyyy'

export const datetime = {
  build: {
    field: async ({ field, accumulator }: BuildArgs<DatetimeField>) => {
      accumulator.push(
        gql.FormFieldBuilder({
          name: typename,
          additionalFields: [
            gql.FieldDefinition({
              name: 'dateFormat',
              type: gql.TYPES.String,
            }),
            gql.FieldDefinition({
              name: 'timeFormat',
              type: gql.TYPES.String,
            }),
          ],
        })
      )

      return gql.FieldDefinition({
        name: field.name,
        type: typename,
      })
    },
    initialValue: ({ field }: BuildArgs<DatetimeField>) => {
      return gql.FieldDefinition({ name: field.name, type: gql.TYPES.String })
    },
    value: ({ field }: BuildArgs<DatetimeField>) => {
      return gql.FieldDefinition({ name: field.name, type: gql.TYPES.String })
    },
    input: ({ field }: BuildArgs<DatetimeField>) => {
      return gql.InputValueDefinition({
        name: field.name,
        type: gql.TYPES.String,
      })
    },
  },
  resolve: {
    field: ({
      field,
    }: Omit<ResolveArgs<DatetimeField>, 'value'>): TinaDatetimeField => {
      const { type, ...rest } = field

      return {
        ...rest,
        component: 'date',
        __typename: typename,
        config: rest.config || {
          required: false,
        },
      }
    },
    initialValue: async ({
      value,
    }: ResolveArgs<DatetimeField>): Promise<string> => {
      assertIsString(value, { source: 'datetime' })
      return value
    },
    value: async ({ value }: ResolveArgs<DatetimeField>): Promise<string> => {
      assertIsString(value, { source: 'datetime' })
      return value
    },
    input: async ({
      field,
      value,
    }: ResolveArgs<DatetimeField>): Promise<
      { [key: string]: string } | false
    > => {
      try {
        assertIsString(value, { source: 'datetime' })

        /**
         * Convert string to `new Date()`
         */
        const date = parseISO(value)
        if (!isValid(date)) {
          throw 'Invalid Date'
        }

        /**
         * Remove any local timezone offset (putting the date back in UTC)
         * https://stackoverflow.com/questions/48172772/time-zone-issue-involving-date-fns-format
         */
        const dateUTC = new Date(
          date.valueOf() + date.getTimezoneOffset() * 60 * 1000
        )

        /**
         * Determine dateFormat
         * This involves fixing inconsistencies between `moment.js` (that Tina uses to format dates)
         * and `date-fns` (that Gateway uses to format dates).
         * They are explained here:
         * https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
         */
        const dateFormat = field.dateFormat || DEFAULT_DATE_FORMAT
        const fixedDateFormat = dateFormat.replace(/D/g, 'd').replace(/Y/g, 'y')

        /**
         * Determine timeFormat, if any
         */
        const timeFormat = field.timeFormat || false

        /**
         * Format `date` and `time` parts
         */
        const datePart = format(dateUTC, fixedDateFormat)
        const timePart = timeFormat ? ` ${format(dateUTC, timeFormat)}` : ''

        return { [field.name]: `${datePart}${timePart}` }
      } catch (e) {
        return false
      }
    },
  },
}

export type DatetimeField = {
  label: string
  name: string
  type: 'datetime'
  default?: string
  dateFormat?: string
  timeFormat?: string
  config?: {
    required?: boolean
  }
  __namespace: string
}

export type TinaDatetimeField = {
  label: string
  name: string
  component: 'date'
  default?: string
  dateFormat?: string
  timeFormat?: string
  config?: {
    required?: boolean
  }
  __typename: typeof typename
}
