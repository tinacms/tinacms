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

import { Form, Field } from './form'

function makeForm(initialValues: any, fields: Field[]) {
  return new Form({
    id: 'test',
    label: 'Test',
    initialValues,
    fields,
    onSubmit() {},
  })
}

describe('Form#updateValues', () => {
  describe('for primitive fields', () => {
    const fields = [
      { name: 'name', component: 'text' },
      { name: 'name', component: 'toggle' },
    ]

    describe('changing explicit fields', () => {
      it('updates text', () => {
        const form = makeForm({ name: 'test' }, fields)
        const nextValues = { name: 'modified' }

        form.updateValues(nextValues)

        expect(form.values).toEqual(nextValues)
      })
      it('updates toggle', () => {
        const form = makeForm({ draft: true }, fields)
        const nextValues = { draft: 'draft' }

        form.updateValues(nextValues)

        expect(form.values).toEqual(nextValues)
      })
    })
    describe('changing implicit fields', () => {
      it('updates a text field', () => {
        const form = makeForm({ name: 'test', shy: '' }, fields)
        const nextValues = { name: 'test', shy: 'boi' }

        form.updateValues(nextValues)

        expect(form.values).toEqual(nextValues)
      })
    })
    describe('changing undeclared fields', () => {
      it('updates a text field', () => {
        const form = makeForm({ name: 'test' }, fields)
        const nextValues = { name: 'test', newKid: 'on the block' }

        form.updateValues(nextValues)

        expect(form.values).toEqual(nextValues)
      })
    })
    // TODO: This should probably change
    it('does not remove deleted fields', () => {
      const form = makeForm({ name: 'test' }, fields)
      const nextValues = {}

      form.updateValues(nextValues)

      expect(form.values).not.toEqual(nextValues)
    })
  })

  describe('for groups', () => {
    describe('with no active fields', () => {
      it('updates name', () => {
        const form = makeForm({ author: { name: 'Ella', age: 23 } }, [])
        const nextValues = { author: { name: 'Georgina', age: 23 } }

        form.updateValues(nextValues)

        expect(form.values).toEqual(nextValues)
      })
    })
    describe('with the name active', () => {
      it('only updates the age', () => {
        const form = makeForm({ author: { name: 'Ella', age: 23 } }, [])
        const nextValues = { author: { name: 'Georgina', age: 30 } }

        form.finalForm.registerField('author.name', () => {}, {})
        form.finalForm.focus('author.name')
        form.updateValues(nextValues)

        expect(form.values).toEqual({ author: { name: 'Ella', age: 30 } })
      })
    })
    it('asdfasdf', () => {
      const form = makeForm(
        {
          author: { name: 'Ella' },
          seo: { description: 'A description' },
        },
        []
      )
      const nextValues = {
        author: { name: 'Bella' },
        seo: { description: 'A new description' },
      }

      form.finalForm.registerField('author.name', () => {}, {})
      form.finalForm.focus('author.name')
      form.updateValues(nextValues)

      expect(form.values).toEqual({
        author: { name: 'Ella' },
        seo: { description: 'A new description' },
      })
    })
  })

  describe('for group-lists of "authors"', () => {
    describe('changing the "name"', () => {
      describe('when the name is inactive', () => {
        it('updates the name', () => {
          const initialValues = { authors: [{ name: 'bill' }] }
          const nextValues = { authors: [{ name: 'Bill' }] }

          const form = makeForm(initialValues, [])

          form.updateValues(nextValues)

          expect(form.values).toEqual(nextValues)
        })
      })
      describe('when the name is active', () => {
        it('does not update the name', () => {
          const initialValues = { authors: [{ name: 'bill' }] }
          const nextValues = { authors: [{ name: 'Bill' }] }

          const form = makeForm(initialValues, [])

          form.finalForm.registerField('authors.0.name', () => {}, {})
          form.finalForm.focus('authors.0.name')

          form.updateValues(nextValues)

          expect(form.values).toEqual(initialValues)
        })
        it('does update other values in that author', () => {
          const initialValues = { authors: [{ name: 'bill' }] }
          const nextValues = { authors: [{ name: 'Bill', age: 25 }] }

          const form = makeForm(initialValues, [])

          form.finalForm.registerField('authors.0.name', () => {}, {})
          form.finalForm.focus('authors.0.name')

          form.updateValues(nextValues)

          expect(form.values).toEqual({
            authors: [
              {
                name: 'bill',
                age: 25,
              },
            ],
          })
        })
        it('does update other authors names', () => {
          const initialValues = {
            authors: [{ name: 'bill' }, { name: 'Greg' }],
          }
          const nextValues = { authors: [{ name: 'George' }, { name: 'Dan' }] }

          const form = makeForm(initialValues, [])

          form.finalForm.registerField('authors.0.name', () => {}, {})
          form.finalForm.focus('authors.0.name')

          form.updateValues(nextValues)

          expect(form.values).toEqual({
            authors: [{ name: 'bill' }, { name: 'Dan' }],
          })
        })
      })
    })

    describe('adding an author', () => {
      describe('to an empty list', () => {
        it('adds the author', () => {
          const initialValues = { authors: [] }
          const nextValues = { authors: [{ name: 'Bill' }] }

          const form = makeForm(initialValues, [])

          form.updateValues(nextValues)

          expect(form.values).toEqual(nextValues)
        })
      })
    })
    describe('removing an author', () => {
      it('removes that author', () => {
        const initialValues = { authors: [{ name: 'Bill' }] }
        const nextValues = { authors: [] }

        const form = makeForm(initialValues, [])

        form.updateValues(nextValues)

        expect(form.values).toEqual(nextValues)
      })
      describe('when another author is focussed', () => {
        it('does not removes that author', () => {
          const initialValues = {
            authors: [{ name: 'Bill' }, { name: 'George' }],
          }
          const nextValues = { authors: [{ name: 'Bill' }] }

          const form = makeForm(initialValues, [])
          form.finalForm.registerField('authors.0.name', () => {}, {})
          form.finalForm.focus('authors.0.name')

          form.updateValues(nextValues)

          expect(form.values).toEqual(initialValues)
        })
      })
    })
  })
})
