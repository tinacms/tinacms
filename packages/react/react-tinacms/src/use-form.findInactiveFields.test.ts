import { Form, Field } from '@tinacms/core'
import { findInactiveFieldsInPath } from './use-form'

function makeForm(initialValues: any, fields: Field[]) {
  return new Form({
    id: 'test',
    label: 'Test',
    initialValues,
    fields,
    onSubmit() {},
  })
}
describe('findInactiveFields', () => {
  describe('a form with a "name" text field', () => {
    let form = makeForm({ name: 'test' }, [{ name: 'name', component: 'text' }])

    describe('given the "name" path', () => {
      it('returns only that field', () => {
        expect(findInactiveFieldsInPath(form, 'name')).toEqual(['name'])
      })
    })
  })

  describe('given the path to some authors name', () => {
    let path = 'authors.INDEX.name'
    let fields = [
      {
        name: 'authors',
        component: 'group-list',
        fields: [{ name: 'name', component: null }],
      },
    ]

    describe('a form with no authors', () => {
      it('returns an empty array', () => {
        let data = { authors: [] }

        let form = makeForm(data, fields)

        expect(findInactiveFieldsInPath(form, path)).toEqual([])
      })
    })
    describe('a form with one author', () => {
      it('returns the path to that authors name', () => {
        let data = { authors: [{ name: 'bill' }] }

        let form = makeForm(data, fields)

        expect(findInactiveFieldsInPath(form, path)).toEqual(['authors.0.name'])
      })
    })
    describe('a form with two authors', () => {
      it('returns the path to both authors name', () => {
        let data = { authors: [{ name: 'bob' }, { name: 'doug' }] }

        let form = makeForm(data, fields)

        let inactiveFields = ['authors.0.name', 'authors.1.name']

        expect(findInactiveFieldsInPath(form, path)).toEqual(inactiveFields)
      })
    })
    describe('a form with 5 authors', () => {
      it('returns the path to all authors name', () => {
        let data = {
          authors: [
            { name: 'bob' },
            { name: 'rob' },
            { name: 'tod' },
            { name: 'rod' },
            { name: 'doug' },
          ],
        }

        let form = makeForm(data, fields)

        let inactiveFields = [
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
    let data = { authors: [{ books: [{ title: 'what' }, { title: 'what' }] }] }

    let form = makeForm(data, [
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

    let inactiveFields = ['authors.0.books.0.title', 'authors.0.books.1.title']

    expect(
      findInactiveFieldsInPath(form, 'authors.INDEX.books.INDEX.title')
    ).toEqual(inactiveFields)
  })
})
