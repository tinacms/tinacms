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

import { gql } from 'tina-graphql-helpers/dist/test-util'
import { setupRunner } from '../test-util'
import { FieldGroupField } from '.'

const field: FieldGroupField = {
  label: 'My Group',
  name: 'some_group',
  type: 'field_group' as const,
  fields: [
    {
      label: 'Title',
      name: 'title',
      type: 'text' as const,
      __namespace: '',
    },
  ],
  __namespace: '',
}

const run = setupRunner(field)

describe(`Field of type ${field.type} builds`, () => {
  test('a union type of type SomeGroup_GroupField', async () => {
    expect(await run('form')).toEqual(gql`
      type TextField implements FormField {
        name: String
        label: String
        component: String
        description: String
      }
      union SomeGroup_FormFieldsUnion = TextField
      type SomeGroup_GroupField implements FormField {
        name: String
        label: String
        component: String
        description: String
        fields: [SomeGroup_FormFieldsUnion]
      }
      union Sample_FormFieldsUnion = SomeGroup_GroupField
      type Sample_Form {
        label: String
        name: String
        fields: [Sample_FormFieldsUnion]
      }
    `)
  })
  test('a value of type SomeGroup_Values', async () => {
    expect(await run('values')).toEqual(gql`
      type SomeGroup_Values {
        title: String
      }
      type Sample_Values {
        some_group: SomeGroup_Values
        _template: String
      }
    `)
  })
  test('a field of type SomeGroup_Data', async () => {
    expect(await run('data')).toEqual(gql`
      type SomeGroup_Data {
        title: String
      }
      type Sample_Data {
        some_group: SomeGroup_Data
      }
    `)
  })
  // FIXME: this should probably not have the "Title_" prefix on it
  // though it might be becauase we have different validation rules
  // depending on which field it belongs to?
  test('an input of type SomeGroup_Input', async () => {
    expect(await run('input')).toEqual(gql`
      input SomeGroup_Input {
        title: String
      }
      input Sample_Input {
        some_group: SomeGroup_Input
      }
    `)
  })
})
