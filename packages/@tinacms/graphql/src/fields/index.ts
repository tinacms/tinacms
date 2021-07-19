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

import * as yup from 'yup'

import type { TextField, TinaTextField } from './text'
import type { ListField, TinaListField } from './list'
import type { SelectField, TinaSelectField } from './select'
import type { BlocksField, TinaBlocksField } from './blocks'
import type { TextareaField, TinaTextareaField } from './textarea'
import type { FieldGroupField, TinaFieldGroupField } from './field-group'
import type { BooleanField, TinaBooleanField } from './boolean'
import type { DatetimeField, TinaDatetimeField } from './datetime'
import type { FileField, TinaFileField } from './file'
import type { ImageGalleryField, TinaImageGalleryField } from './image-gallery'
import type { NumberField, TinaNumberField } from './number'
import type { TagListField, TinaTagListField } from './tag-list'
import type {
  FieldGroupListField,
  TinaFieldGroupListField,
} from './field-group-list'

import type { Definitions } from '../builder'
import type { DataSource } from '../datasources/datasource'
import type { Cache } from '../cache'

export type Field =
  | TextField
  | TextareaField
  | SelectField
  | BlocksField
  | FieldGroupField
  | FieldGroupListField
  | ListField
  | DatetimeField
  | FileField
  | ImageGalleryField
  | NumberField
  | TagListField
  | BooleanField

export type TinaField =
  | TinaTextField
  | TinaTextareaField
  | TinaSelectField
  | TinaBlocksField
  | TinaFieldGroupField
  | TinaFieldGroupListField
  | TinaDatetimeField
  | TinaFileField
  | TinaImageGalleryField
  | TinaListField
  | TinaNumberField
  | TinaTagListField
  | TinaBooleanField

export type BuildArgs<T> = {
  cache: Cache
  field: T
  accumulator: Definitions[]
}

export type ResolveArgs<T> = {
  datasource: DataSource
  field: T
  value: unknown
}

export function assertIsString(
  value: unknown,
  options: { source: string }
): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`Unexpected value of type string for ${options.source}`)
  }
}

export function assertIsBoolean(
  value: unknown,
  options: { source: string }
): asserts value is boolean {
  if (typeof value !== 'boolean') {
    throw new Error(
      `Unexpected value of type ${typeof value} for ${options.source}`
    )
  }
}

export function assertIsNumber(
  value: unknown,
  options: { source: string }
): asserts value is number {
  if (typeof value !== 'number') {
    throw new Error(
      `Unexpected value of type ${typeof value} for ${options.source}`
    )
  }
}

export function assertIsStringArray(
  value: unknown,
  options: { source: string }
): asserts value is string[] {
  const schema = yup.array().of(yup.string())

  try {
    schema.validateSync(value)
  } catch (e) {
    console.log(value)
    throw new Error(
      `Unexpected array of strings for ${options.source} - ${e.message}`
    )
  }
}

export function assertShape<T>(
  value: unknown,
  schema: yup.AnyObjectSchema
): asserts value is T {
  try {
    schema.validateSync(value)
  } catch (e) {
    console.log(value)
    throw new Error(`Failed to assertIsBlockValueArray - ${e.message}`)
  }
}

export function assertIsArray(value: unknown): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected an array for block input value')
  }
}

export function assertIsBlockInput(
  value: unknown
): asserts value is { data: { template: string } & object } {
  assertIsObject(value)
  const data = Object.values(value)[0]
  const schema = yup
    .object({
      template: yup.string().required(),
    })
    .required()
  try {
    schema.validateSync(data)
  } catch (e) {
    console.log(value)
    throw new Error(`Failed to assertIsBlockInput - ${e.message}`)
  }
}

export function assertIsObject(value: unknown): asserts value is object {
  const schema = yup.object().required()
  schema.validateSync(value)
}

export function assertIsBlockInitialValue(
  value: unknown
): asserts value is BlockInitialValue {
  const schema = yup.object({
    _template: yup.string().required(),
  })
  try {
    schema.validateSync(value)
  } catch (e) {
    console.log(value)
    throw new Error(`Failed to assertIsBlockInitialValue - ${e.message}`)
  }
}
export function assertIsBlockValue(
  value: unknown
): asserts value is BlockValue {
  const schema = yup.object({
    template: yup.string().required(),
  })
  try {
    schema.validateSync(value)
  } catch (e) {
    console.log(value)
    throw new Error(`Failed to assertIsBlockValue - ${e.message}`)
  }
}
export function assertIsBlockValueArray(
  value: unknown
): asserts value is BlockValue[] {
  const schema = yup.array().of(
    yup.object({
      template: yup.string().required(),
    })
  )
  try {
    schema.validateSync(value)
  } catch (e) {
    console.log(value)
    throw new Error(`Failed to assertIsBlockValueArray - ${e.message}`)
  }
}

type BlockValue = {
  template: string
  [key: string]: unknown
}

type BlockInitialValue = {
  _template: string
  [key: string]: unknown
}
