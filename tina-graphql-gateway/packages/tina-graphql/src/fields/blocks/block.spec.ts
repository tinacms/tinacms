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
import type { BlocksField } from '.'

const field: BlocksField = {
  label: 'My Blocks',
  name: 'my_blocks',
  type: 'blocks' as const,
  template_types: ['post'],
  __namespace: '',
}

const run = setupRunner(field)

describe(`Type ${field.type} builds`, () => {
  test('a union type of type SelectField', async () => {
    expect(await run('form')).toEqual(gql`
      type TextField implements FormField {
        name: String
        label: String
        component: String
        description: String
      }
      type TextField implements FormField {
        name: String
        label: String
        component: String
        description: String
      }
      union Post_Details_FormFieldsUnion = TextField
      type Post_Details_GroupField implements FormField {
        name: String
        label: String
        component: String
        description: String
        fields: [Post_Details_FormFieldsUnion]
      }
      type SelectField implements FormField {
        name: String
        label: String
        component: String
        description: String
        options: [SelectOption]
      }
      union Post_FormFieldsUnion =
          TextField
        | Post_Details_GroupField
        | SelectField
      type Post_Form {
        label: String
        name: String
        fields: [Post_FormFieldsUnion]
      }
      type MyBlocks_BlocksFieldTemplates {
        post: Post_Form
      }
      type MyBlocks_BlocksField implements FormField {
        name: String
        label: String
        component: String
        description: String
        templates: MyBlocks_BlocksFieldTemplates
      }
      union Sample_FormFieldsUnion = MyBlocks_BlocksField
      type Sample_Form {
        label: String
        name: String
        fields: [Sample_FormFieldsUnion]
      }
    `)
  })
  // FIXME: this shouldn't be reference for a simple options field
  test('a value of type Reference', async () => {
    expect(await run('values')).toEqual(gql`
      type Post_Details_Values {
        reading_time: String
      }
      type Post_Values {
        title: String
        details: Post_Details_Values
        author: Reference
        _template: String
      }
      union MyBlocks_Values = Post_Values
      type Sample_Values {
        my_blocks: [MyBlocks_Values]
        _template: String
      }
    `)
  })
  test('a field of type String', async () => {
    expect(await run('data')).toEqual(gql`
      type Post_Details_Data {
        reading_time: String
      }
      type Post_Data {
        title: String
        details: Post_Details_Data
        author: Authors_Document
      }
      union MyBlocks_Data = Post_Data
      type Sample_Data {
        my_blocks: [MyBlocks_Data]
      }
    `)
  })
  // FIXME: this should probably not have the "Title_" prefix on it
  // though it might be becauase we have different validation rules
  // depending on which field it belongs to?
  test('an input of type SomeGroup_Input', async () => {
    expect(await run('input')).toEqual(gql`
      input Post_Details_Input {
        reading_time: String
      }
      input Post_Input {
        title: String
        details: Post_Details_Input
        author: String
      }
      input MyBlocks_Input {
        post: Post_Input
      }
      input Sample_Input {
        my_blocks: [MyBlocks_Input]
      }
    `)
  })
})
