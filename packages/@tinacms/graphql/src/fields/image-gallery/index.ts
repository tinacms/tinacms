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

import { BuildArgs, ResolveArgs, assertIsStringArray } from '../'
import { list, TinaListField } from '../list'

export const imageGallery = {
  build: {
    field: async ({
      cache,
      field,
      accumulator,
    }: BuildArgs<ImageGalleryField>) => {
      return list.build.field({
        cache,
        field: list.imageGalleryField(field),
        accumulator,
      })
    },
    initialValue: ({ field }: BuildArgs<ImageGalleryField>) => {
      return gql.FieldDefinition({
        name: field.name,
        type: gql.TYPES.String,
        list: true,
      })
    },
    value: ({ field }: BuildArgs<ImageGalleryField>) => {
      return gql.FieldDefinition({
        name: field.name,
        type: gql.TYPES.String,
        list: true,
      })
    },
    input: ({ field }: BuildArgs<ImageGalleryField>) => {
      return gql.InputValueDefinition({
        name: field.name,
        type: gql.TYPES.String,
        list: true,
      })
    },
  },
  resolve: {
    field: async ({
      datasource,
      field,
    }: Omit<
      ResolveArgs<ImageGalleryField>,
      'value'
    >): Promise<TinaImageGalleryField> => {
      return await list.resolve.field({
        datasource,
        field: list.imageGalleryField(field),
      })
    },
    initialValue: async ({
      value,
    }: ResolveArgs<ImageGalleryField>): Promise<string[]> => {
      assertIsStringArray(value, { source: 'image gallery initial value' })
      return value
    },
    value: async ({
      value,
    }: ResolveArgs<ImageGalleryField>): Promise<string[]> => {
      assertIsStringArray(value, { source: 'image gallery value' })
      return value
    },
    input: async ({
      field,
      value,
    }: ResolveArgs<ImageGalleryField>): Promise<
      { [key: string]: string[] } | false
    > => {
      try {
        assertIsStringArray(value, { source: 'image gallery input' })

        return { [field.name]: value }
      } catch (e) {
        return false
      }
    },
  },
}

export type ImageGalleryField = {
  label: string
  name: string
  type: 'image_gallery'
  default?: string
  config?: {
    required?: boolean
  }
  __namespace: string
}

export type TinaImageGalleryField = TinaListField
