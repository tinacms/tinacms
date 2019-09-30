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
  it('name', () => {
    let form = makeForm({ name: 'test' }, [{ name: 'name', component: 'text' }])

    expect(findInactiveFieldsInPath(form, 'name')).toEqual(['name'])
  })

  it('authors.INDEX.name | 2 authors', () => {
    let data = { authors: [{ name: 'bob' }, { name: 'doug' }] }

    let form = makeForm(data, [
      {
        name: 'authors',
        component: 'group-list',
        fields: [{ name: 'name', component: null }],
      },
    ])

    let inactiveFields = ['authors.0.name', 'authors.1.name']

    expect(findInactiveFieldsInPath(form, 'authors.INDEX.name')).toEqual(
      inactiveFields
    )
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
