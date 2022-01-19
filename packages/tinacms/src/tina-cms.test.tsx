import { render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import React from 'react'
import { TinaCMSProvider2 } from './tina-cms'

jest.mock('./auth', () => {
  return { TinaCloudProvider: ({ children }: any) => <>{children}</> }
})
jest.mock('./hooks/use-content-creator', () => {
  return { useDocumentCreatorPlugin: () => {} }
})
jest.mock('@tinacms/toolkit', () => {
  return { useCMS: () => {} }
})
jest.mock('./hooks/use-graphql-forms', () => {
  return { useGraphqlForms: () => [{}, false] }
})

describe('TinaCMSProvider', () => {
  describe('with render props children', () => {
    it('passes along all props', () => {
      const { queryByText, debug } = render(
        <TinaCMSProvider2
          query="my-query"
          variables={{ foo: 'my-variable-val' }}
          data={{ foo: 'my-data' }}
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
  })

  describe('with ReactNode children', () => {
    it('render children', () => {
      const { queryByText, debug } = render(
        <TinaCMSProvider2 apiURL={'http://localhost:3000'}>
          <DummyChild />
        </TinaCMSProvider2>
      )

      const fakePropText = queryByText(/My Dummy Header/)
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
