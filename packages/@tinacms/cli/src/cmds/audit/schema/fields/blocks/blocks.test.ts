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

const base = {
  name: 'blocks',
  type: 'blocks',
  label: 'Blocks',
}

setupTests({
  'config with null properties': {
    initial: {
      ...base,
      template_types: ['sidecar'],
      config: {
        min: null,
      },
    },
    errors: [
      {
        dataPath: '.config.min',
        keyword: 'type',
      },
    ],
    fixed: {
      ...base,
      template_types: ['sidecar'],
    },
  },
  'config with an incorrect type': {
    initial: {
      ...base,
      template_types: ['sidecar'],
      config: {
        min: '2',
      },
    },
    errors: [
      {
        dataPath: '.config.min',
        keyword: 'type',
      },
    ],
    fixed: {
      ...base,
      template_types: ['sidecar'],
      config: {
        min: 2,
      },
    },
  },
  'missing template type': {
    initial: {
      ...base,
    },
    errors: [
      {
        dataPath: '',
        keyword: 'required',
      },
    ],
  },
  'empty template type': {
    initial: {
      ...base,
      template_types: [],
    },
    errors: [
      {
        dataPath: '.template_types',
        keyword: 'minItems',
      },
    ],
  },
})
