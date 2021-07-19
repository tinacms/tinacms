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

import { setupTests } from '../setupTests'

setupTests({
  'with an invalid default type': {
    initial: {
      type: 'image_gallery',
      name: 'images',
      label: 'Images',
      description: 'Used for SEO & Featured Images',
      default: 2,
    },
    errors: [
      {
        dataPath: '.default',
        keyword: 'type',
      },
    ],
    fixed: {
      type: 'image_gallery',
      name: 'images',
      label: 'Images',
      description: 'Used for SEO & Featured Images',
      default: ['2'],
    },
  },
  'with a default array with an empty string': {
    initial: {
      type: 'image_gallery',
      name: 'images',
      label: 'Images',
      description: 'Used for SEO & Featured Images',
      default: [''],
    },
    errors: [
      {
        dataPath: '.default[0]',
        keyword: 'minLength',
      },
    ],
  },
})
