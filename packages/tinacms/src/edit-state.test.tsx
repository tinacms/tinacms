import { render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { describe, it, expect, vi } from 'vitest'

import React from 'react'
import { useTina } from './edit-state'
import { TinaDataContext } from '@tinacms/sharedctx'

const query = `{}`
const variables = { filename: 'neat.md' }

const CreateDummyEditProvider = (isLoading, payload) => {
  const setRequest = vi.fn()

  return {
    setRequest,
    component: ({ children }) => (
      <TinaDataContext.Provider
        value={{
          setRequest,
          isLoading: isLoading,
          state: { payload: payload },
        }}
      >
        {children}
      </TinaDataContext.Provider>
    ),
  }
}

describe('useTina', () => {
  describe('with prod context', () => {
    it('renders original text on first render', () => {
      const { queryByText } = render(<DummyComponent />)

      const text = queryByText(/original/)

      expect(text).toBeInTheDocument()
    })
  })
  describe('with edit context', () => {
    describe('when loading', () => {
      const Foo = CreateDummyEditProvider(true, { title: 'blah' })
      it('renders original text', () => {
        const { queryByText } = render(
          <Foo.component>
            <DummyComponent />
          </Foo.component>
        )

        const text = queryByText(/original/)

        expect(text).toBeInTheDocument()
      })
    })

    describe('when not loading', () => {
      const Foo = CreateDummyEditProvider(false, { title: 'blah' })
      it('renders original text for 1st frame', async () => {
        const { queryByText, rerender } = render(
          <Foo.component>
            <DummyComponent />
          </Foo.component>
        )

        const text = queryByText(/original/)

        expect(text).toBeInTheDocument()

        await waitFor(() => expect(queryByText(/blah/)).toBeInTheDocument(), {
          timeout: 1,
        })
      })
    })

    describe('on load', () => {
      it('sets query on providers', async () => {
        const Foo = CreateDummyEditProvider(false, { title: 'blah' })

        const { rerender } = render(
          <Foo.component>
            <DummyComponent />
          </Foo.component>
        )

        //sanity check that second render doesn't recall
        rerender(
          <Foo.component>
            <DummyComponent />
          </Foo.component>
        )

        expect(Foo.setRequest).toHaveBeenCalledTimes(1)
        expect(Foo.setRequest).toHaveBeenCalledWith({ query, variables })
      })
    })

    describe('on unmount', () => {
      it('clears query on providers', async () => {
        const Foo = CreateDummyEditProvider(false, { title: 'blah' })

        const { unmount } = render(
          <Foo.component>
            <DummyComponent />
          </Foo.component>
        )

        unmount()

        expect(Foo.setRequest).toHaveBeenCalledTimes(2)
        expect(Foo.setRequest).toHaveBeenCalledWith(undefined)
      })
    })
  })
})

const DummyComponent = () => {
  const { data } = useTina({
    query,
    variables,
    data: {
      title: 'original',
    },
  })

  return <div>{data.title}</div>
}
