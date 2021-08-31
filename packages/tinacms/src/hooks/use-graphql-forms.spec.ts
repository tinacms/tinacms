const formData = {
  title: 'Just Another Blog Post',
  date: 'July 12 2021',
  author: {
    changeType: 'select',
    id: 'content/authors/pedro.md',
    data: {
      _collection: 'authors',
      _template: 'authors',
      name: 'Pedro',
      avatar:
        'https://images.unsplash.com/photo-1555959910-80920d0698a4?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1301&q=80',
    },
  },
  heroImg: null,
  _body: 'Lorem markdownum evinctus',
}

const mutationInfo = {
  string: '',
  includeCollection: false,
}

import { transformDocumentIntoMutationRequestPayload } from './use-graphql-forms'

describe('The thing', () => {
  it('transforms the thing', () => {
    expect(
      transformDocumentIntoMutationRequestPayload(formData, mutationInfo)
    ).toEqual({
      _body: `Lorem markdownum evinctus`,
      author: {
        select: 'content/authors/pedro.md',
      },
      heroImg: null,
      date: 'July 12 2021',
      title: 'Just Another Blog Post',
    })
  })
})
