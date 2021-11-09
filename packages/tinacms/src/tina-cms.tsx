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
import { useDocumentCreatorPlugin } from './hooks/use-content-creator'
import { TinaCloudProvider, TinaCloudMediaStoreClass } from './auth'
import { LocalClient } from './client/index'
import type { TinaIOConfig } from './client/index'
import { useCMS } from '@tinacms/toolkit'

import type { TinaCMS } from '@tinacms/toolkit'
import type { formifyCallback } from './hooks/use-graphql-forms'

const SetupHooks = (props: {
  query: string
  variables?: object
  formifyCallback?: formifyCallback
  documentCreatorCallback?: Parameters<typeof useDocumentCreatorPlugin>[0]
  children: (args) => React.ReactNode
}) => {
  const cms = useCMS()
  const [payload, isLoading] = useGraphqlForms({
    query: (gql) => gql(props.query),
    variables: props.variables || {},
    formify: (args) => {
      if (props.formifyCallback) {
        return props.formifyCallback(args, cms)
      } else {
        return args.createForm(args.formConfig)
      }
    },
  })

  useDocumentCreatorPlugin(props.documentCreatorCallback)

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

    this.state = {
      hasError: props.hasError,
      message: '',
      pageRefresh: false,
    }
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
    if (this.state.hasError && !this.state.pageRefresh) {
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
            <br />
            <p>
              If you've just updated the form, undo your most recent changes and
              click "refresh". If after a few refreshes, you're still
              encountering this error. There is a bigger issue with the site.
              Please reach out to your site admin.
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
                onClick={() => {
                  /* @ts-ignore */
                  this.setState({ pageRefresh: true })
                  setTimeout(
                    () =>
                      this.setState({ hasError: false, pageRefresh: false }),
                    3000
                  )
                }}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )
    }
    /* @ts-ignore */
    if (this.state.pageRefresh) {
      return <Loader>Let's try that again.</Loader>
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
  tinaioConfig,
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
  documentCreatorCallback?: Parameters<typeof useDocumentCreatorPlugin>[0]
  /** TinaCMS media store instance */
  mediaStore?:
    | TinaCloudMediaStoreClass
    | (() => Promise<TinaCloudMediaStoreClass>)
  tinaioConfig?: TinaIOConfig
}) => {
  if (typeof props.query === 'string') {
    props.query
  }
  return (
    <TinaCloudProvider
      branch={branch}
      clientId={clientId}
      tinaioConfig={tinaioConfig}
      isLocalClient={isLocalClient}
      cmsCallback={cmsCallback}
      mediaStore={mediaStore}
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
          background: 'rgba(0, 0, 0, 0.5)',
          inset: 0,
          zIndex: 200,
          opacity: '0.8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div
          style={{
            background: '#f6f6f9',
            boxShadow:
              '0px 2px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '5px',
            padding: '40px 32px',
            width: '460px',
            maxWidth: '90%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <svg
            style={{
              width: '64px',
              color: '#2296fe',
              marginTop: '-8px',
              marginBottom: '16px',
            }}
            version="1.1"
            id="L5"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 100 64"
            enableBackground="new 0 0 0 0"
            xmlSpace="preserve"
          >
            <circle fill="currentColor" stroke="none" cx={6} cy={32} r={6}>
              <animateTransform
                attributeName="transform"
                dur="1s"
                type="translate"
                values="0 15 ; 0 -15; 0 15"
                calcMode="spline"
                keySplines="0.8 0 0.4 1; 0.4 0 0.2 1"
                repeatCount="indefinite"
                begin="0.1"
              />
            </circle>
            <circle fill="currentColor" stroke="none" cx={30} cy={32} r={6}>
              <animateTransform
                attributeName="transform"
                dur="1s"
                type="translate"
                values="0 15 ; 0 -10; 0 15"
                calcMode="spline"
                keySplines="0.8 0 0.4 1; 0.4 0 0.2 1"
                repeatCount="indefinite"
                begin="0.2"
              />
            </circle>
            <circle fill="currentColor" stroke="none" cx={54} cy={32} r={6}>
              <animateTransform
                attributeName="transform"
                dur="1s"
                type="translate"
                values="0 15 ; 0 -5; 0 15"
                calcMode="spline"
                keySplines="0.8 0 0.4 1; 0.4 0 0.2 1"
                repeatCount="indefinite"
                begin="0.3"
              />
            </circle>
          </svg>
          <p
            style={{
              fontSize: '18px',
              color: '#252336',
              textAlign: 'center',
              lineHeight: '1.3',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 'normal',
            }}
          >
            Please wait, Tina is loading data...
          </p>
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
  try {
    const data = await staticRequest({ query, variables })
    return JSON.parse(
      JSON.stringify({
        data,
        query,
        variables,
      })
    )
  } catch (e) {
    // FIXME: no need to catch all errors, just the ones that are related to
    // a new document being created, if there's a way to surface those only
    // we can still throw when real errors occur
    return JSON.parse(
      JSON.stringify({
        data: {},
        query,
        variables,
      })
    )
  }
}

function is_server() {
  return !(typeof window != 'undefined' && window.document)
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
  if (!is_server()) {
    // If we are running this in the browser (for example a useEffect) we should display a warning
    console.warn(`Whoops! Looks like you are using \`staticRequest\` in the browser to fetch data.

The local server is not available outside of \`getStaticProps\` or \`getStaticPaths\` functions. 
This function should only be called on the server at build time.

This will work when developing locally but NOT when deployed to production. 
`)
  }

  return client.request(query, { variables })
}
/**
 * A passthru function which allows editors
 * to know the temlpate string is a GraphQL
 * query or muation
 */
export function gql(strings: TemplateStringsArray, ...args: string[]): string {
  let str = ''
  strings.forEach((string, i) => {
    str += string + (args[i] || '')
  })
  return str
}
