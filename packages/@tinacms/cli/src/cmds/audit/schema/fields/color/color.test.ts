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
  'with a missing label': {
    initial: {
      name: 'color',
      type: 'color',
      config: {
        color_format: 'Hex',
      },
    },
    errors: [{ dataPath: '', keyword: 'required' }],
  },
  'with a missing config': {
    initial: {
      name: 'color',
      label: 'My Color',
      type: 'color',
    },
    errors: [{ dataPath: '', keyword: 'required' }],
  },
  'without a color_format': {
    initial: {
      name: 'color',
      label: 'My Color',
      type: 'color',
      config: {
        required: true,
      },
    },
    errors: [
      {
        dataPath: '.config',
        keyword: 'required',
      },
    ],
  },
  'with an invalid color_format': {
    initial: {
      name: 'color',
      label: 'My Color',
      type: 'color',
      config: {
        color_format: 'Whoa!',
      },
    },
    errors: [
      {
        dataPath: '.config.color_format',
        keyword: 'enum',
      },
    ],
  },
})
