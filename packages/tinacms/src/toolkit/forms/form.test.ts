import { Form, FormOptions } from './form'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { waitFor } from '@testing-library/react'

describe('Form', () => {
  let DEFAULTS: FormOptions<any>

  beforeEach(() => {
    DEFAULTS = {
      id: 'example',
      label: 'Example',
      onSubmit: vi.fn(),
      fields: [],
    }
  })

  describe('new Form(...)', () => {
    describe('without initialValues', () => {
      it('is fine', () => {
        new Form(DEFAULTS)
      })
    })
    describe('without loadInitialValues', () => {
      it('is not loading', () => {
        const form = new Form(DEFAULTS)

        expect(form.loading).toBeFalsy()
      })
    })
    describe('with loadInitialValues', () => {
      describe('before promise resolves', () => {
        it('is is loading', () => {
          const form = new Form({
            ...DEFAULTS,
            loadInitialValues: () => new Promise(() => {}),
          })

          expect(form.loading).toBeTruthy()
        })
        it('has values === undefined', () => {
          const form = new Form({
            ...DEFAULTS,
            loadInitialValues: () => new Promise(() => {}),
          })

          expect(form.values).toBeUndefined()
        })
      })
      describe('after promise resolves', () => {
        it.skip('is not loading once resolved', async () => {
          let resolve: () => void | null

          const form = new Form({
            ...DEFAULTS,
            loadInitialValues: () =>
              new Promise((r) => {
                // @ts-ignore
                resolve = r
              }),
          })

          await waitFor(() => {
            resolve()
            expect(form.loading).toBeFalsy()
          })
        })
        it.skip('has values resolved values', async () => {
          let resolve: () => void | null
          const initialValues = { title: 'Big Banana' }
          const form = new Form({
            ...DEFAULTS,
            loadInitialValues: () =>
              new Promise((r) => {
                resolve = () => r(initialValues)
              }),
          })

          await waitFor(() => {
            resolve()
            expect(form.initialValues).toEqual(initialValues)
          })
        })
      })
    })
  })

  describe('#change', () => {
    it('changes the values', async () => {
      const form = new Form({
        ...DEFAULTS,
        fields: [{ name: 'title', component: 'text' }],
      })

      form.change('title', 'Hello World')

      expect(form.values.title).toBe('Hello World')
    })
  })
  describe('#submit', () => {
    const initialValues = { title: 'hello' }
    const reinitialValues = { title: 'world' }

    it('calls #onSubmit', async () => {
      const form = new Form(DEFAULTS)

      await form.submit()

      expect(DEFAULTS.onSubmit).toHaveBeenCalled()
    })

    describe('after changing the #onSubmit', () => {
      it('calls the second #onSubmit and not the first', async () => {
        const form = new Form(DEFAULTS)
        const newSubmit = vi.fn()
        form.onSubmit = newSubmit

        await form.submit()

        expect(DEFAULTS.onSubmit).not.toHaveBeenCalled()
        expect(newSubmit).toHaveBeenCalled()
      })
    })

    describe('after a successful submission', () => {
      it('reinitializes the form with the new values', async () => {
        const form = new Form({
          ...DEFAULTS,
          initialValues,
          fields: [{ name: 'title', component: 'text' }],
        })

        form.change('title', reinitialValues.title)
        await form.submit()

        expect(form.initialValues).toEqual(reinitialValues)
      })
    })

    describe('after a failed submission', () => {
      it('does not reinitialize the form', async () => {
        const form = new Form({
          ...DEFAULTS,
          initialValues,
          fields: [{ name: 'title', component: 'text' }],
          onSubmit: vi.fn(() => {
            throw new Error()
          }),
        })

        form.change('title', reinitialValues.title)

        try {
          await form.submit()
        } catch (e) {}

        expect(form.initialValues).toEqual(initialValues)
      })
    })
  })
  describe('#reset', () => {
    const initialValues = { title: 'hello' }
    describe('when form has been changed', () => {
      it('sets the form values to the initialValues', async () => {
        const reinitialValues = { title: 'world' }
        const form = new Form({
          ...DEFAULTS,
          initialValues,
          fields: [{ name: 'title', component: 'text' }],
        })
        form.change('title', reinitialValues.title)

        await form.reset()

        expect(form.initialValues).toEqual(initialValues)
      })
      describe('if given a `reset` option', () => {
        it('calls the user defined reset', async () => {
          const reset = vi.fn()
          const form = new Form({
            ...DEFAULTS,
            reset,
          })
          form.change('title', 'New Title')

          await form.reset()

          expect(reset).toHaveBeenCalled()
        })
        it('sets the form values to the initialValues', async () => {
          const form = new Form({
            ...DEFAULTS,
            reset: vi.fn(),
            initialValues,
          })

          form.change('title', 'A new title')

          await form.reset()

          expect(form.values).toEqual(initialValues)
        })
        it('sets does not the form values to the initialValues', async () => {
          const form = new Form({
            ...DEFAULTS,
            reset: vi.fn(() => {
              throw new Error()
            }),
          })
          form.change('title', 'Updated Value')

          try {
            await form.reset()
          } catch {}

          expect(form.values).not.toEqual(initialValues)
        })
      })
    })
  })
})
