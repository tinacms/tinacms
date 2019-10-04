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

  describe('hiddenFields', () => {
    describe('when no fields are listed', () => {
      it('is empty if the initialValues are empty', () => {
        const initialValues = {}
        const form = new Form({
          id: 'example',
          label: 'Example',
          fields: [],
          onSubmit: jest.fn(),
          initialValues,
        })

        expect(Object.keys(form.hiddenFields)).toEqual([])
      })
      it('has "name" if initialValues has a "name"', () => {
        const initialValues = {
          name: 'test',
        }
        const form = new Form({
          id: 'example',
          label: 'Example',
          fields: [],
          onSubmit: jest.fn(),
          initialValues,
        })

        expect(Object.keys(form.hiddenFields)).toEqual(['name'])
      })
      it('has "name" and "age" if initialValues does too', () => {
        const initialValues = {
          name: 'test',
          age: 1,
        }
        const form = new Form({
          id: 'example',
          label: 'Example',
          fields: [],
          onSubmit: jest.fn(),
          initialValues,
        })

        expect(Object.keys(form.hiddenFields)).toEqual(['name', 'age'])
      })
      describe('when it has a sub-objects', () => {
        it('has "rawFrontmatter.name"', () => {
          const initialValues = {
            rawFrontmatter: {
              name: 'test',
            },
          }
          const form = new Form({
            id: 'example',
            label: 'Example',
            fields: [],
            onSubmit: jest.fn(),
            initialValues,
          })

          expect(Object.keys(form.hiddenFields)).toContain(
            'rawFrontmatter.name'
          )
        })
        it('does not have "rawFrontmatter"', () => {
          const initialValues = {
            rawFrontmatter: {
              name: 'test',
            },
          }
          const form = new Form({
            id: 'example',
            label: 'Example',
            fields: [],
            onSubmit: jest.fn(),
            initialValues,
          })

          expect(Object.keys(form.hiddenFields)).not.toContain('rawFrontmatter')
        })
        describe('and sub-sub-objects objects', () => {
          it('has "rawFrontmatter.author.name"', () => {
            const initialValues = {
              rawFrontmatter: {
                author: {
                  name: 'test',
                },
              },
            }
            const form = new Form({
              id: 'example',
              label: 'Example',
              fields: [],
              onSubmit: jest.fn(),
              initialValues,
            })

            expect(Object.keys(form.hiddenFields)).toContain(
              'rawFrontmatter.author.name'
            )
          })
        })
      })

      describe('when it has lists', () => {
        it('has a path for empty lists', () => {
          const initialValues = {
            colors: [],
          }
          const form = new Form({
            id: 'example',
            label: 'Example',
            fields: [],
            onSubmit: jest.fn(),
            initialValues,
          })

          expect(Object.keys(form.hiddenFields)).toEqual(['colors'])
        })
        it('has a direct path for lists of non-objects', () => {
          const initialValues = {
            colors: [1, 1.0, 'test', null, undefined],
          }
          const form = new Form({
            id: 'example',
            label: 'Example',
            fields: [],
            onSubmit: jest.fn(),
            initialValues,
          })

          expect(Object.keys(form.hiddenFields)).toEqual(['colors'])
        })
        describe('lists of objects', () => {
          it('has INDEX routes for lists of objects', () => {
            const initialValues = {
              colors: [{ name: 'test' }],
            }

            const form = new Form({
              id: 'example',
              label: 'Example',
              fields: [],
              onSubmit: jest.fn(),
              initialValues,
            })

            expect(Object.keys(form.hiddenFields)).toEqual([
              'colors.INDEX.name',
            ])
          })
        })
      })
    })
    describe('when fields are present', () => {
      it('removes matches', () => {
        const initialValues = {
          name: 'test',
        }
        const form = new Form({
          id: 'example',
          label: 'Example',
          fields: [{ name: 'name', component: null }],
          onSubmit: jest.fn(),
          initialValues,
        })

        expect(Object.keys(form.hiddenFields)).toEqual([])
      })
    })
  })
})
