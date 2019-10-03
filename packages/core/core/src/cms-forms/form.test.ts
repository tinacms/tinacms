import { Form } from './form'

describe('Form', () => {
  describe('#onSubmit', () => {
    describe('after a successful submission', () => {
      it('reinitializes the form with the new values', async () => {
        let initialValues = { title: 'hello' }
        let reinitialValues = { title: 'world' }
        let form = new Form({
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
