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
  type: 'number',
  name: 'weight',
  label: 'Weight',
  description: 'Used to handle sorting order, menu order, etc.',
}

setupTests({
  'with an invalid default type': {
    initial: {
      ...base,
      default: '2',
    },
    errors: [
      {
        dataPath: '.default',
        keyword: 'type',
      },
    ],
    fixed: {
      ...base,
      default: 2,
    },
  },
  'with 0 as the default': {
    initial: {
      ...base,
      default: 0,
    },
    errors: [],
    fixed: {
      ...base,
      default: 0,
    },
  },
  "with a misplaced 'required' key": {
    initial: {
      ...base,
      required: true,
    },
    errors: [
      {
        dataPath: '',
        keyword: 'additionalProperties',
      },
    ],
    fixed: {
      ...base,
      config: {
        required: true,
      },
    },
  },
  'when the default is not a multiple of the step config': {
    initial: {
      ...base,
      default: 3,
      config: {
        step: 2,
      },
    },
    errors: [{ dataPath: '.default', keyword: 'multipleOf' }],
  },
  'when the default is greather than the max': {
    initial: {
      ...base,
      default: 4,
      config: {
        max: 2,
      },
    },
    errors: [{ dataPath: '.default', keyword: 'maximum' }],
  },
  'when the default is less than the min': {
    initial: {
      ...base,
      default: 4,
      config: {
        min: 6,
      },
    },
    errors: [{ dataPath: '.default', keyword: 'minimum' }],
  },
})
