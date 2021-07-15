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

import { base, baseRequired } from '../common'

export const GalleryField = {
  $id: '#galleryField',
  label: 'Gallery Field',
  description:
    'A list input that adds assets to the Media Library. Good for galleries and components that require multiple files. ',
  type: 'object',
  properties: {
    type: {
      const: 'image_gallery',
    },
    ...base,
    default: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'string',
        minLength: 1,
      },
    },
    config: {
      type: 'object',
      properties: {
        required: { type: 'boolean' },
        maxSize: { type: 'number' },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
  required: baseRequired,
}
