/**

Copyright 2021 Forestry.io Holdings, Inc.

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

import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import React, { ReactNode } from 'react'
import { TinaCMSProvider2 } from './tina-cms'

import { useTina } from './edit-state'
import { useDocumentCreatorPlugin } from './hooks/use-content-creator'

const mockApiURl = 'http://localhost:4001/graphql'
jest.mock('./auth', () => {
  return {
    TinaCloudProvider: ({ children }: any) => (<>{children}</>) as ReactNode,
  }
})
jest.mock('./hooks/use-content-creator', () => {
  return { useDocumentCreatorPlugin: jest.fn(() => {}) }
})
jest.mock('@tinacms/toolkit', () => {
  return { useCMS: () => {} }
})
jest.mock('./hooks/use-graphql-forms', () => {
  return { useGraphqlForms: jest.fn(() => [{}, false]) }
})
jest.mock('./edit-state', () => {
  return {
    useTina: jest.fn(() => {
      return { data: {}, isLoading: true }
    }),
  }
})

describe('TinaCMSProvider', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  describe('with render props children', () => {
    it('passes along all props', () => {
      const { queryByText } = render(
        <TinaCMSProvider2
          apiURL={mockApiURl}
          query="my-query"
          variables={{ foo: 'my-variable-val' }}
          data={{ foo: 'my-data' }}
          schema={{
            collections: [],
          }}
          fakeProp={'blahbalh'}
        >
          {(liveProps) => <DummyChild {...liveProps} />}
        </TinaCMSProvider2>
      )

      const fakePropText = queryByText(/blahbalh/)
      const queryPropText = queryByText(/my-query/)
      const variablesPropText = queryByText(/my-variable-val/)
      const dataPropText = queryByText(/my-data/)

      expect(fakePropText).toBeInTheDocument()
      expect(queryPropText).toBeInTheDocument()
      expect(variablesPropText).toBeInTheDocument()
      expect(dataPropText).toBeInTheDocument()
    })

    it('registers form', () => {
      const request = {
        query: 'my-query',
        variables: { foo: 'my-variable-val' },
        data: { foo: 'my-data' },
      }
      render(
        <TinaCMSProvider2
          apiURL={mockApiURl}
          {...request}
          schema={{
            collections: [],
          }}
        >
          {(liveProps) => <DummyChild {...liveProps} />}
        </TinaCMSProvider2>
      )

      expect(useTina).toHaveBeenCalledWith(request)
    })

    it('returns new props', () => {
      useTina.mockImplementationOnce(() => {
        return { data: { liveDataProp: 'foobar' }, isLoading: false }
      })
      const request = {
        query: 'my-query',
        variables: { foo: 'my-variable-val' },
        data: { foo: 'my-data' },
      }
      const { queryByText } = render(
        <TinaCMSProvider2
          {...request}
          apiURL={mockApiURl}
          schema={{
            collections: [],
          }}
        >
          {(liveProps) => <DummyChild {...liveProps} />}
        </TinaCMSProvider2>
      )

      const text = queryByText(/liveDataProp/)

      expect(text).toBeInTheDocument()
    })

    it('registers document creator callback', () => {
      let mockDocumentCreatorCallback = jest.fn()
      const request = {
        query: 'my-query',
        variables: { foo: 'my-variable-val' },
        data: { foo: 'my-data' },
        documentCreatorCallback: mockDocumentCreatorCallback,
      }
      render(
        <TinaCMSProvider2
          {...request}
          apiURL={mockApiURl}
          schema={{
            collections: [],
          }}
        >
          {(liveProps) => <DummyChild {...liveProps} />}
        </TinaCMSProvider2>
      )

      expect(useDocumentCreatorPlugin).toHaveBeenCalledTimes(1)
      expect(useDocumentCreatorPlugin).toHaveBeenCalledWith(
        mockDocumentCreatorCallback
      )
    })

    describe('with no query', () => {
      it('doesnt overwrite data property', () => {
        useTina.mockImplementationOnce(() => {
          return { data: null, isLoading: false }
        })
        const request = {
          query: undefined,
          variables: undefined,
          data: { foo: 'my-data' },
        }
        const { queryByText } = render(
          <TinaCMSProvider2
            {...request}
            schema={{
              collections: [],
            }}
            apiURL={mockApiURl}
          >
            {(liveProps) => <DummyChild {...liveProps} />}
          </TinaCMSProvider2>
        )

        const text = queryByText(/my-data/)

        expect(text).toBeInTheDocument()
      })
    })
  })

  describe('with ReactNode children', () => {
    it('render children', () => {
      const { queryByText } = render(
        <TinaCMSProvider2
          apiURL={mockApiURl}
          schema={{
            collections: [],
          }}
        >
          <DummyChild />
        </TinaCMSProvider2>
      )

      const header = queryByText(/My Dummy Header/)

      expect(header).toBeInTheDocument()
    })

    it('doesnt register form', () => {
      render(
        <TinaCMSProvider2
          apiURL={mockApiURl}
          schema={{
            collections: [],
          }}
        >
          <DummyChild />
        </TinaCMSProvider2>
      )

      expect(useTina).not.toHaveBeenCalled()
    })
  })
})

const DummyChild = (props: any) => (
  <>
    <p>
      <h1>My Dummy Header</h1>
      {JSON.stringify(props)}
    </p>
  </>
)
