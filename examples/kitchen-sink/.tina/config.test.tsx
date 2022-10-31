import { SchemaField } from 'tinacms'
import React from 'react'

const field: SchemaField = {
  type: 'string',
  name: 'title',
}

const field2: SchemaField = {
  type: 'string',
  name: 'title',
  // ui: {
  //   parse: (value) => '',
  // },
}

const field3: SchemaField = {
  type: 'string',
  name: 'title',
  ui: {
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
