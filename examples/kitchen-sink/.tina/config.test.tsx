import { SchemaField } from 'tinacms'
import React from 'react'

const field: SchemaField = {
  type: 'string',
  name: 'title',
}

const field2: SchemaField = {
  type: 'string',
  name: 'title',
}

const field3: SchemaField = {
  type: 'string',
  name: 'title',
  ui: {
    validate: (value) => {
      value as string
      return 'Not Valid!'
    },
    parse: (value) => '',
    component: (props) => {
      props.input.onChange('some-string')
      props.input.value as string
      return <div>Hello!</div>
    },
  },
}
const field4: SchemaField = {
  type: 'string',
  name: 'title',
  list: false,
  ui: {
    parse: (value) => '',
    component: (props) => {
      props.input.onChange('some-string')
      props.input.value as string
      return <div>Hello!</div>
    },
  },
}
const field5: SchemaField = {
  type: 'string',
  name: 'title',
  list: true,
  ui: {
    parse: (value) => [''],
    component: (props) => {
      props.input.onChange(['some-string'])
      props.input.value as string[]
      return <div>Hello!</div>
    },
  },
}

const invalidField: SchemaField = {
  type: 'string',
  name: 'title',
  ui: {
    // @ts-expect-error
    parse: (value) => [''],
  },
}

const invalidField2: SchemaField = {
  type: 'string',
  name: 'title',
  list: false,
  ui: {
    // @ts-expect-error
    parse: (value) => [''],
  },
}

const invalidField3: SchemaField = {
  type: 'string',
  name: 'title',
  list: true,
  ui: {
    // @ts-expect-error
    parse: (value) => '',
  },
}

const numberField: SchemaField = {
  name: 'count',
  type: 'number',
  ui: {
    parse: (value) => {
      value as number
      return value
    },
  },
}

const numberField2: SchemaField = {
  name: 'count',
  type: 'number',
  list: true,
  ui: {
    parse: (value) => {
      value as number[]
      return value
    },
  },
}

const booleanField: SchemaField = {
  name: 'published',
  type: 'boolean',
  ui: {
    parse: (value) => {
      value as boolean
      return value
    },
  },
}

const booleanField2: SchemaField = {
  name: 'published',
  type: 'boolean',
  list: true,
  ui: {
    parse: (value) => {
      value as boolean[]
      return value
    },
  },
}

const datetimeField: SchemaField = {
  name: 'published',
  type: 'datetime',
  ui: {
    parse: (value) => {
      value as string
      return value
    },
  },
}

const datetimeField2: SchemaField = {
  name: 'image',
  type: 'datetime',
  list: true,
  ui: {
    parse: (value) => {
      value as string[]
      return value
    },
  },
}

const imageField: SchemaField = {
  name: 'image',
  type: 'image',
  ui: {
    parse: (value) => {
      value as string
      return value
    },
  },
}

const imageField2: SchemaField = {
  name: 'image',
  type: 'image',
  list: true,
  ui: {
    parse: (value) => {
      value as string[]
      return value
    },
  },
}

const referenceField: SchemaField = {
  name: 'author',
  type: 'reference',
  collections: ['author'],
  ui: {
    parse: (value) => {
      value as string
      return value
    },
  },
}

// @ts-expect-error
const invalidReferenceField2: SchemaField = {
  name: 'authors',
  type: 'reference',
  collections: ['author'],
  list: true,
}

const referenceField2: SchemaField = {
  name: 'authors',
  type: 'reference',
  collections: ['author'],
  list: false,
}

const richTextField: SchemaField = {
  name: 'body',
  type: 'rich-text',
  ui: {
    parse: (value) => {
      value.type === 'root'
      return value
    },
  },
}

const richTextField2: SchemaField = {
  name: 'body',
  type: 'rich-text',
  templates: [
    {
      name: 'SomeComponent',
      fields: [
        {
          name: 'ok',
          type: 'boolean',
        },
      ],
    },
    {
      name: 'someImage',
      match: {
        start: '{{',
        end: '}}',
      },
      fields: [
        {
          name: 'text',
          type: 'boolean',
        },
      ],
    },
  ],
}

const templateField: SchemaField = {
  name: 'blocks',
  type: 'object',
  list: true,
  templates: [
    {
      label: 'Features',
      name: 'features',
      fields: [
        { type: 'string', name: 'title' },
        { type: 'string', name: 'items', list: true },
      ],
    },
  ],
}

const templateField2: SchemaField = {
  name: 'features',
  type: 'object',
  list: true,
  ui: {
    itemProps: (values) => ({
      label: values?.title || 'Feature Item',
    }),
  },
  fields: [
    { type: 'string', name: 'title' },
    { type: 'string', name: 'items', list: true },
  ],
}
