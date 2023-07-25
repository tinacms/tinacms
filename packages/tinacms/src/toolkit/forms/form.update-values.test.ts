import { Form } from './form'
import { Field } from './field'
import { describe, it, test, expect, beforeEach, vi } from 'vitest'

function makeForm(initialValues: any, fields: Field[] = []) {
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
    describe('changing explicit fields', () => {
      it('updates strings', () => {
        const form = makeForm({ name: 'test' }, [
          { name: 'name', component: 'text' },
        ])
        const nextValues = { name: 'modified' }

        form.updateValues(nextValues)

        expect(form.values).toEqual(nextValues)
      })
      it('updates booleans', () => {
        const form = makeForm({ draft: true }, [
          { name: 'name', component: 'toggle' },
        ])
        const nextValues = { draft: 'draft' }

        form.updateValues(nextValues)

        expect(form.values).toEqual(nextValues)
      })
    })

    describe('changing implicit fields', () => {
      it('updates strings', () => {
        const form = makeForm({ name: 'test', shy: '' })
        const nextValues = { name: 'test', shy: 'boi' }

        form.updateValues(nextValues)

        expect(form.values).toEqual(nextValues)
      })
      it('updates numbers', () => {
        const form = makeForm({ age: 20 })
        const nextValues = { age: 23 }

        form.updateValues(nextValues)

        expect(form.values).toEqual(nextValues)
      })
    })
    describe('when `nextValues` has a new field', () => {
      it('adds that field', () => {
        const form = makeForm({ name: 'test' })
        const nextValues = { name: 'test', newKid: 'on the block' }

        form.updateValues(nextValues)

        expect(form.values).toEqual(nextValues)
      })
    })
    describe('when `nextValues` is missing a field', () => {
      // TODO: This should probably change
      it('does not remove deleted fields', () => {
        const form = makeForm({ name: 'test' })
        const nextValues = {}

        form.updateValues(nextValues)

        expect(form.values).not.toEqual(nextValues)
      })
    })
  })

  describe('for a group of "author" fields. Form = { author: { name: string, age: number } }', () => {
    interface S {
      author: {
        name: string
        age: number
      }
    }
    describe('with no active field', () => {
      describe('when only the "name" is changed', () => {
        const initialValues = { author: { name: 'Ella', age: 23 } }
        const nextValues = { author: { name: 'Georgina', age: 23 } }

        let form: Form<S>

        beforeEach(() => {
          form = makeForm(initialValues)
          form.updateValues(nextValues)
        })

        it('changes the "name"', () => {
          expect(form.values!.author.name).toEqual(nextValues.author.name)
        })

        it('does not changes the "age"', () => {
          expect(form.values!.author.age).toEqual(initialValues.author.age)
        })
      })
      describe('when only the "age" is changed', () => {
        const initialValues = { author: { name: 'Ella', age: 23 } }
        const nextValues = { author: { name: 'Ella', age: 68 } }

        let form: Form<S>

        beforeEach(() => {
          form = makeForm(initialValues)
          form.updateValues(nextValues)
        })

        it('does not change the "name"', () => {
          expect(form.values!.author.name).toEqual(initialValues.author.name)
        })

        it('changes the "age"', () => {
          expect(form.values!.author.age).toEqual(nextValues.author.age)
        })
      })
      describe('when both the "name" and "age" are changed', () => {
        const initialValues = { author: { name: 'Ella', age: 23 } }
        const nextValues = { author: { name: 'Georgina', age: 52 } }

        let form: Form<S>

        beforeEach(() => {
          form = makeForm(initialValues)

          form.updateValues(nextValues)
        })

        it('changes the "name"', () => {
          expect(form.values!.author.name).toEqual(nextValues.author.name)
        })

        it('changes the "age"', () => {
          expect(form.values!.author.age).toEqual(nextValues.author.age)
        })
      })
    })

    describe('with the "name" active', () => {
      describe('when only the "name" is changed', () => {
        const initialValues = { author: { name: 'Ella', age: 23 } }
        const nextValues = { author: { name: 'Georgina', age: 23 } }

        let form: Form

        beforeEach(() => {
          form = makeForm(initialValues)
          form.finalForm.registerField('author.name', () => {}, {})
          form.finalForm.focus('author.name')
          form.updateValues(nextValues)
        })

        it('does not change the "name"', () => {
          expect(form.values!.author.name).toEqual(initialValues.author.name)
        })

        it('does not change the "age"', () => {
          expect(form.values!.author.age).toEqual(initialValues.author.age)
        })
      })
      describe('when only the "age" is changed', () => {
        const initialValues = { author: { name: 'Ella', age: 50 } }
        const nextValues = { author: { name: 'Ella', age: 5 } }

        let form: Form

        beforeEach(() => {
          form = makeForm(initialValues)
          form.finalForm.registerField('author.name', () => {}, {})
          form.finalForm.focus('author.name')
          form.updateValues(nextValues)
        })

        it('changes the "age"', () => {
          expect(form.values).toEqual(nextValues)
        })

        it('does not change the "name"', () => {
          expect(form.values!.author.name).toEqual(initialValues.author.name)
        })
      })
      describe('when both the "name" and "age" are changed', () => {
        let form: Form
        const initialValues = { author: { name: 'Steve', age: 50 } }
        const nextValues = { author: { name: 'Ellen', age: 42 } }

        beforeEach(() => {
          form = makeForm(initialValues)
          form.finalForm.registerField('author.name', () => {}, {})
          form.finalForm.focus('author.name')
          form.updateValues(nextValues)
        })

        it('changes the "age"', () => {
          expect(form.values!.author.age).toEqual(nextValues.author.age)
        })

        it('does not change the "name"', () => {
          expect(form.values!.author.name).toEqual(initialValues.author.name)
        })
      })
    })

    describe('when there is two groups: "author" and "seo"', () => {
      const initialValues = {
        author: { name: 'Ella' },
        seo: { description: 'A description' },
      }

      let form: Form

      // @ts-ignore
      beforeEach(() => (form = makeForm(initialValues)))

      describe('when "author.name" is active', () => {
        beforeEach(() => {
          form.finalForm.registerField('author.name', () => {}, {})
          form.finalForm.focus('author.name')
        })

        describe('and both "author.name" and "seo.description" are changed', () => {
          const nextValues = {
            author: { name: 'Bella' },
            seo: { description: 'A new description' },
          }

          beforeEach(() => {
            form.updateValues(nextValues)
          })

          it('does not update the author.name', () => {
            expect(form.values.author.name).toEqual('Ella')
          })

          it('does updates the seo.description', () => {
            expect(form.values.seo.description).toEqual(
              nextValues.seo.description
            )
          })
        })
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
