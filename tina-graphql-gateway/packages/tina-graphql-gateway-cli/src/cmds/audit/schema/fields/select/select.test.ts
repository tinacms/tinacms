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
  type: 'select',
  label: 'Engine Name',
  name: 'engine_name',
}

setupTests({
  'with a missing options array for simple selects': {
    initial: {
      ...base,
      config: {
        source: {
          type: 'simple',
        },
        required: true,
      },
    },
    errors: [{ dataPath: '.config', keyword: 'required' }],
  },
  'with an extra options array for page selects': {
    initial: {
      ...base,
      config: {
        options: ['some-random-option'],
        source: {
          type: 'pages',
          section: 'posts',
        },
      },
    },
    errors: [{ dataPath: '.config', keyword: 'additionalProperties' }],
    fixed: {
      ...base,
      config: {
        source: {
          type: 'pages',
          section: 'posts',
        },
      },
    },
  },
  'with an extra path key for page selects': {
    initial: {
      ...base,
      config: {
        source: {
          type: 'pages',
          section: 'posts',
          path: 'some-path',
        },
      },
    },
    errors: [{ dataPath: '.config.source', keyword: 'additionalProperties' }],
    fixed: {
      ...base,
      config: {
        source: {
          type: 'pages',
          section: 'posts',
        },
      },
    },
  },
  'with a missing path for document selects': {
    initial: {
      ...base,
      config: {
        source: {
          type: 'documents',
          section: 'posts',
          file: 'my-file',
        },
      },
    },
    errors: [{ dataPath: '.config.source', keyword: 'required' }],
  },
  'with a missing file for document selects': {
    initial: {
      ...base,
      config: {
        source: {
          type: 'documents',
          section: 'posts',
          path: 'my-file',
        },
      },
    },
    errors: [{ dataPath: '.config.source', keyword: 'required' }],
  },
  'with an empty array as a default value': {
    initial: {
      ...base,
      default: [],
      config: {
        options: ['some-option'],
        source: {
          type: 'simple',
        },
      },
    },
    errors: [
      {
        dataPath: '.default',
        keyword: 'type',
      },
    ],
    fixed: {
      ...base,
      config: {
        options: ['some-option'],
        source: {
          type: 'simple',
        },
      },
    },
  },
  'with an single-item array as a default value': {
    initial: {
      ...base,
      default: ['some-option'],
      config: {
        options: ['some-option'],
        source: {
          type: 'simple',
        },
      },
    },
    errors: [
      {
        dataPath: '.default',
        keyword: 'type',
      },
    ],
    fixed: {
      ...base,
      default: 'some-option',
      config: {
        options: ['some-option'],
        source: {
          type: 'simple',
        },
      },
    },
  },
  'with a multi-item array as a default value': {
    initial: {
      ...base,
      default: ['some-option', 'what-even-is-this'],
      config: {
        options: ['some-option'],
        source: {
          type: 'simple',
        },
      },
    },
    errors: [
      {
        dataPath: '.default',
        keyword: 'type',
      },
    ],
    fixed: {
      ...base,
      config: {
        options: ['some-option'],
        source: {
          type: 'simple',
        },
      },
    },
  },
  // "with a default value which isn't an option": {
  //   initial: {
  //     ...base,
  //     default: "a",
  //     config: {
  //       options: ["b", "c"],
  //       source: {
  //         type: "simple",
  //       },
  //     },
  //   },
  //   errors: [
  //     {
  //       dataPath: ".default",
  //       keyword: "type",
  //     },
  //   ],
  //   fixed: {
  //     ...base,
  //     config: {
  //       options: ["b", "c"],
  //       source: {
  //         type: "simple",
  //       },
  //     },
  //   },
  // },
})
