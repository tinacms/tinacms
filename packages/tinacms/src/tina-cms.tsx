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

import React from 'react'
import { useGraphqlForms } from './hooks/use-graphql-forms'
import { useDocumentCreatorPlugin } from './hooks/use-graphql-forms'
import { TinaCloudProvider } from './auth'
import { LocalClient } from './client/index'
import { useCMS } from '@tinacms/toolkit'

import type { TinaCMS, MediaStore } from '@tinacms/toolkit'
import type { formifyCallback } from './hooks/use-graphql-forms'

const SetupHooks = (props: {
  query: string
  variables?: object
  formify?: formifyCallback
  children: (args) => React.ReactNode
}) => {
  const cms = useCMS()
  const [payload, isLoading] = useGraphqlForms({
    query: (gql) => gql(props.query),
    variables: props.variables || {},
    formify: (args) => {
      if (props.formify) {
        return props.formify(args, cms)
      } else {
        return args.createForm(args.formConfig)
      }
    },
  })
  useDocumentCreatorPlugin()

  return (
    <ErrorBoundary>
      {isLoading ? (
        <Loader>{props.children(props)}</Loader>
      ) : (
        // pass the new edit state data to the child
        props.children({ ...props, data: payload })
      )}
    </ErrorBoundary>
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)

    this.state = { hasError: props.hasError, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message }
  }

  /**
   * Ideally we can track the last valid state and provide a button to go back, which
   * would just reset the form to that state. This isn't ideal for many cases though,
   * in general you'd probably want to push through the invalid state until you arrive at
   * a new state which you are happy with. So we should offer the opportunity to try rendering
   * again in the new, hopefully valid, state.
   */
  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: '#efefef',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <style>
            {
              '\
            body {\
              margin: 0;\
            }\
          '
            }
          </style>
          <div
            style={{
              background: '#fff',
              maxWidth: '400px',
              padding: '20px',
              fontFamily: "'Inter', sans-serif",
              borderRadius: '5px',
              boxShadow:
                '0 6px 24px rgb(0 37 91 / 5%), 0 2px 4px rgb(0 37 91 / 3%)',
            }}
          >
            <h3 style={{ color: '#eb6337' }}>TinaCMS Render Error</h3>
            <p>Tina caught an error while updating the page:</p>
            {/* @ts-ignore */}
            <pre>{this.state.message}</pre>
            <p>
              If you've just updated the form, undo your most recent changes and
              click "refresh"
            </p>
            <div style={{ padding: '10px 0' }}>
              <button
                style={{
                  background: '#eb6337',
                  padding: '12px 18px',
                  cursor: 'pointer',
                  borderRadius: '50px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontWeight: 'bold',
                  border: 'none',
                  color: 'white',
                }}
                onClick={() => this.setState({ hasError: false })}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export const TinaCMSProvider2 = ({
  children,
  branch,
  clientId,
  isLocalClient,
  cmsCallback,
  mediaStore,
  ...props
}: {
  /** The query from getStaticProps */
  query?: string
  /** Any variables from getStaticProps */
  variables?: object
  /** The `data` from getStaticProps */
  data: object
  /** Your React page component */
  children: () => React.ReactNode
  /** Point to the local version of GraphQL instead of tina.io */
  isLocalClient?: boolean
  /** The base branch to pull content from. Note that this is ignored for local development */
  branch?: string
  /** Your clientID from tina.aio */
  clientId?: string
  /** Callback if you need access to the TinaCMS instance */
  cmsCallback?: (cms: TinaCMS) => TinaCMS
  /** Callback if you need access to the "formify" API */
  formifyCallback?: formifyCallback
  /** Callback if you need access to the "document creator" API */
  documentCreatorCallback?: (args) => void
  /** TinaCMS media store instance */
  mediaStore?: MediaStore
}) => {
  if (typeof props.query === 'string') {
    props.query
  }
  return (
    <TinaCloudProvider
      branch={branch}
      clientId={clientId}
      isLocalClient={isLocalClient}
      cmsCallback={cmsCallback}
      // mediaStore={mediaStore}
    >
      {props.query ? (
        <SetupHooks key={props.query} {...props} query={props.query || ''}>
          {children}
        </SetupHooks>
      ) : (
        // @ts-ignore
        children(props)
      )}
    </TinaCloudProvider>
  )
}

const Loader = (props: { children: React.ReactNode }) => {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          background: 'white',
          inset: 0,
          zIndex: 200,
          opacity: '0.8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <svg
            style={{ width: '100px' }}
            version="1.1"
            id="L5"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 100 100"
            enableBackground="new 0 0 0 0"
            xmlSpace="preserve"
          >
            <circle fill="currentColor" stroke="none" cx={6} cy={50} r={6}>
              <animateTransform
                attributeName="transform"
                dur="1s"
                type="translate"
                values="0 15 ; 0 -15; 0 15"
                repeatCount="indefinite"
                begin="0.1"
              />
            </circle>
            <circle fill="currentColor" stroke="none" cx={30} cy={50} r={6}>
              <animateTransform
                attributeName="transform"
                dur="1s"
                type="translate"
                values="0 10 ; 0 -10; 0 10"
                repeatCount="indefinite"
                begin="0.2"
              />
            </circle>
            <circle fill="currentColor" stroke="none" cx={54} cy={50} r={6}>
              <animateTransform
                attributeName="transform"
                dur="1s"
                type="translate"
                values="0 5 ; 0 -5; 0 5"
                repeatCount="indefinite"
                begin="0.3"
              />
            </circle>
          </svg>
          <p>Wait a bit, Tina is loading data...</p>
        </div>
      </div>
      {props.children}
    </>
  )
}

/**
 * A convenience function which makes a GraphQL request
 * to a local GraphQL server and ensures the response fits
 * the shape expected by Tina context in your application
 */
export const getStaticPropsForTina = async ({
  query,
  variables,
}: {
  query: string
  variables?: object
}) => {
  const data = await staticRequest({ query, variables })
  return {
    data,
    query,
    variables,
  }
}

/**
 * A convenience function which makes a GraphQL request
 * to a local GraphQL server. Only recommended for functions
 * which run at build-time like `getStaticProps` or `getStaticPaths`
 */
export const staticRequest = async ({
  query,
  variables,
}: {
  /** A GraphQL request string */
  query: string
  /** GraphQL variables */
  variables?: object
}) => {
  const client = new LocalClient()
  return client.request(query, { variables })
}

/**
 * A passthru function which allows editors
 * to know the temlpate string is a GraphQL
 * query or muation
 */
export function gql(strings: TemplateStringsArray) {
  return strings[0]
}
