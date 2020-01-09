/**

Copyright 2019 Forestry.io Inc

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

import { Form } from './form'

describe('Form', () => {
  describe('creating forms', () => {
    describe('without initialValues', () => {
      it('is fine', () => {
        new Form({
          id: 'example',
          label: 'Example',
          onSubmit: jest.fn(),
          fields: [],
        })
      })
    })
  })
  describe('#onSubmit', () => {
    describe('after a successful submission', () => {
      it('reinitializes the form with the new values', async () => {
        const initialValues = { title: 'hello' }
        const reinitialValues = { title: 'world' }
        const form = new Form({
          id: 'example',
          label: 'Example',
          fields: [{ name: 'title', component: 'text' }],
          onSubmit: jest.fn(),
          initialValues,
        })

        form.finalForm.change('title', reinitialValues.title)
        await form.submit()

        expect(form.finalForm.getState().initialValues).toEqual(reinitialValues)
      })
    })
  })
})
