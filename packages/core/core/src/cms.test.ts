import { CMS } from './cms'

let cms: CMS

beforeEach(() => {
  cms = new CMS()
})

describe('fields', () => {
  describe('#add', () => {
    it('does not explode', () => {
      cms.fields.add({
        name: 'example-field',
        Component: () => null,
        type: 'input',
        validate: () => undefined,
        parse: val => val,
      })
    })
  })
})
