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
  label: 'Authors',
  name: 'authors',
  type: 'list',
}

setupTests({
  'with an empty default': {
    initial: {
      ...base,
      default: [],
      config: {
        use_select: true,
        source: {
          type: 'pages',
          section: 'authors',
        },
      },
    },
    fixed: {
      ...base,
      default: [],
      config: {
        use_select: true,
        source: {
          type: 'pages',
          section: 'authors',
        },
      },
    },
  },
  'with null config items': {
    initial: {
      ...base,
      config: {
        use_select: true,
        min: null,
        max: null,
        source: {
          type: 'pages',
          section: 'authors',
        },
      },
    },
    errors: [
      {
        dataPath: '.config.min',
        keyword: 'type',
      },
      {
        dataPath: '.config.max',
        keyword: 'type',
      },
    ],
    fixed: {
      ...base,
      config: {
        use_select: true,
        source: {
          type: 'pages',
          section: 'authors',
        },
      },
    },
  },
  'with a missing path for documents': {
    initial: {
      ...base,
      config: {
        use_select: true,
        source: {
          type: 'documents',
          file: 'hugo/data/authors.yml',
          section: 'authors',
        },
      },
    },
    errors: [
      {
        dataPath: '.config.source',
        keyword: 'required',
      },
    ],
  },
  'with an options array for a documents list': {
    initial: {
      ...base,
      config: {
        use_select: true,
        options: ['my-options'],
        source: {
          type: 'documents',
          file: 'hugo/data/authors.yml',
          path: 'map',
          section: 'authors',
        },
      },
    },
    errors: [
      {
        dataPath: '.config',
        keyword: 'additionalProperties',
      },
    ],
    fixed: {
      ...base,
      config: {
        use_select: true,
        source: {
          type: 'documents',
          file: 'hugo/data/authors.yml',
          path: 'map',
          section: 'authors',
        },
      },
    },
  },
  'with a datafile source': {
    initial: {
      ...base,
      config: {
        use_select: true,
        source: {
          type: 'datafiles',
        },
      },
    },
    errors: [
      {
        dataPath: '.config.source.type',
        keyword: 'enum',
      },
    ],
  },
})
