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
import {
  findInactiveFieldsInPath,
  findInactiveFormFields,
} from './findInactiveFields'

function makeForm(initialValues: any, fields: Field[]) {
  return new Form({
    id: 'test',
    label: 'Test',
    initialValues,
    fields,
    onSubmit() {},
  })
}
describe('findInactiveFormFields', () => {
  it('handles this big complex example', () => {
    const form = makeForm(
      {
        // Hidden
        hidden: 'value',
        ghostWriter: { name },
        books: [{ title: 'one' }, { title: 'two' }],
        favouriteColors: ['red'],
        // Explicit
        name: 'test',
        // author: {name: "test"}, // Intentionally left out
        magazines: [],
        newsPapers: [{ title: 'nytimes' }],
        favouriteCocktail: ['martini'],
      },
      [
        { name: 'name', component: 'text' },
        {
          name: 'author',
          component: 'group',
          fields: [{ name: 'name', component: 'text' }],
        },
        {
          name: 'magazines',
          component: 'group-list',
          fields: [
            {
              name: 'title',
              component: null,
            },
          ],
        },
        {
          name: 'newsPapers',
          component: 'group-list',
          fields: [
            {
              name: 'title',
              component: null,
            },
          ],
        },
        {
          name: 'favouriteCocktails',
          component: null,
        },
      ]
    )

    const inactiveFields = findInactiveFormFields(form)

    // Hidden
    expect(inactiveFields).toContain('hidden')
    expect(inactiveFields).not.toContain('ghostWriter')
    expect(inactiveFields).toContain('ghostWriter.name')
    expect(inactiveFields).toContain('books.0.title')
    expect(inactiveFields).toContain('books.1.title')
    expect(inactiveFields).toContain('favouriteColors')

    // Explicitt
    expect(inactiveFields).toContain('name')
    expect(inactiveFields).not.toContain('author')
    expect(inactiveFields).toContain('author.name')
    expect(inactiveFields).toContain('magazines')
    expect(inactiveFields).toContain('newsPapers.0.title')
    expect(inactiveFields).toContain('newsPapers.0.title')
    expect(inactiveFields).toContain('favouriteCocktails')
  })
})
describe('findInactiveFieldsInPath', () => {
  describe('a form with a "name" text field', () => {
    const form = makeForm({ name: 'test' }, [
      { name: 'name', component: 'text' },
    ])

    describe('given the "name" path', () => {
      it('returns only that field', () => {
        expect(findInactiveFieldsInPath(form, 'name')).toEqual(['name'])
      })
    })
  })

  describe('given the path to some authors name', () => {
    const path = 'authors.INDEX.name'
    const fields = [
      {
        name: 'authors',
        component: 'group-list',
        fields: [{ name: 'name', component: null }],
      },
    ]

    describe('a form with no authors', () => {
      it('returns an empty array', () => {
        const data = { authors: [] }

        const form = makeForm(data, fields)

        expect(findInactiveFieldsInPath(form, path)).toEqual([])
      })
    })
    describe('a form with one author', () => {
      it('returns the path to that authors name', () => {
        const data = { authors: [{ name: 'bill' }] }

        const form = makeForm(data, fields)

        expect(findInactiveFieldsInPath(form, path)).toEqual(['authors.0.name'])
      })
    })
    describe('a form with two authors', () => {
      it('returns the path to both authors name', () => {
        const data = { authors: [{ name: 'bob' }, { name: 'doug' }] }

        const form = makeForm(data, fields)

        const inactiveFields = ['authors.0.name', 'authors.1.name']

        expect(findInactiveFieldsInPath(form, path)).toEqual(inactiveFields)
      })
    })
    describe('a form with 5 authors', () => {
      it('returns the path to all authors name', () => {
        const data = {
          authors: [
            { name: 'bob' },
            { name: 'rob' },
            { name: 'tod' },
            { name: 'rod' },
            { name: 'doug' },
          ],
        }

        const form = makeForm(data, fields)

        const inactiveFields = [
          'authors.0.name',
          'authors.1.name',
          'authors.2.name',
          'authors.3.name',
          'authors.4.name',
        ]

        expect(findInactiveFieldsInPath(form, path)).toEqual(inactiveFields)
      })
    })
  })

  it('authors.INDEX.books.INDEX.title | 1 author 2 books', () => {
    const data = {
      authors: [{ books: [{ title: 'what' }, { title: 'what' }] }],
    }

    const form = makeForm(data, [
      {
        name: 'authors',
        component: 'group-list',
        fields: [
          {
            name: 'books',
            component: 'group-list',
            fields: [{ name: 'title', component: 'test' }],
          },
        ],
      },
    ])

    const inactiveFields = [
      'authors.0.books.0.title',
      'authors.0.books.1.title',
    ]

    expect(
      findInactiveFieldsInPath(form, 'authors.INDEX.books.INDEX.title')
    ).toEqual(inactiveFields)
  })
})
