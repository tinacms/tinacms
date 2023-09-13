import React from 'react'
import { TinaCloudProvider } from './auth'

import { LocalClient } from './internalClient/index'
import { useDocumentCreatorPlugin } from './hooks/use-content-creator'
import { parseURL } from '@tinacms/schema-tools'
import { TinaCMSProviderDefaultProps } from './types/cms'

const errorButtonStyles = {
  background: '#eb6337',
  padding: '12px 18px',
  cursor: 'pointer',
  borderRadius: '50px',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  fontWeight: 'bold',
  border: 'none',
  color: 'white',
  margin: '1rem 0',
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
            <pre style={{ marginTop: '1rem', overflowX: 'auto' }}>
              {/* @ts-ignore */}
              {this.state.message}
            </pre>
            <br />
            <p>
              If you've just updated the form, undo your most recent changes and
              click "refresh". If after a few refreshes, you're still
              encountering this error. There is a bigger issue with the site.
              Please reach out to your site admin.
            </p>
            <p>
              See our{' '}
              <a
                className="text-gray-600"
                style={{ textDecoration: 'underline' }}
                href="https://tina.io/docs/errors/faq/"
                target="_blank"
              >
                {' '}
                Error FAQ{' '}
              </a>{' '}
              for more information.
            </p>
            <button
              style={errorButtonStyles as any}
              onClick={() => {
                /* @ts-ignore */
                this.setState({ pageRefresh: true })
                setTimeout(
                  () => this.setState({ hasError: false, pageRefresh: false }),
                  3000
                )
              }}
            >
              Refresh
            </button>
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

/**
 * @deprecated since version 1.0.
 * Tina no longer requires wrapping your site in the TinaProvider
 * See https://tina.io/blog/upgrading-to-iframe/ for full migration details
 */
export const TinaCMSProvider2 = ({
  query,
  documentCreatorCallback,
  formifyCallback,
  schema,
  ...props
}: TinaCMSProviderDefaultProps) => {
  if (props?.apiURL) {
    console.warn(
      'The apiURL prop is deprecated. Please see https://tina.io/blog/tina-v-0.68.14 for information on how to upgrade to the new API'
    )
  }
  const apiURL = props?.client?.apiUrl || props?.apiURL
  const isLocalOverride = schema?.config?.admin?.auth?.useLocalAuth
  const { branch, clientId, isLocalClient } = apiURL
    ? parseURL(apiURL)
    : {
        branch: props.branch,
        clientId: props.clientId,
        // @ts-expect-error this is for backwards compatibility
        isLocalClient: props?.isLocalClient,
      }
  if (
    // Check if local client is defined
    typeof isLocalClient === 'undefined' ||
    // If in not in localMode check if clientId and branch are defined
    (!isLocalClient &&
      (!branch || !clientId) &&
      // if they pass a custom apiURL, we don't need to throw an error
      !schema.config.contentApiUrlOverride)
  ) {
    throw new Error(
      'Invalid setup. See https://tina.io/docs/tina-cloud/connecting-site/ for more information.'
    )
  }

  // schema is now required as the Global Nav and CMS utilize it
  if (!schema) {
    throw new Error(
      '`schema` is required to be passed as a property to `TinaProvider`.  You can learn more about this change here: https://github.com/tinacms/tinacms/pull/2823'
    )
  }

  return (
    <>
      <TinaCloudProvider
        branch={branch}
        clientId={clientId || schema?.config?.clientId}
        tinaioConfig={props.tinaioConfig}
        isLocalClient={isLocalOverride || isLocalClient}
        isSelfHosted={!!schema?.config?.contentApiUrlOverride}
        cmsCallback={props.cmsCallback}
        mediaStore={props.mediaStore}
        apiUrl={apiURL}
        staticMedia={props.staticMedia}
        // Not ideal but we need this for backwards compatibility for now. We can clean this up when we require a config.{js,ts} file
        // @ts-ignore
        schema={{ ...schema, config: { ...schema.config, ...props } }}
        tinaGraphQLVersion={props.tinaGraphQLVersion}
      >
        {/* <style>{styles}</style> */}
        <ErrorBoundary>{props.children}</ErrorBoundary>
      </TinaCloudProvider>
    </>
  )
}

export type DocumentCreatorCallback = Parameters<
  typeof useDocumentCreatorPlugin
>[0]
const DocumentCreator = ({
  documentCreatorCallback,
}: {
  /** Callback if you need access to the "document creator" API */
  documentCreatorCallback?: DocumentCreatorCallback
}) => {
  useDocumentCreatorPlugin(documentCreatorCallback)

  return null
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
 * @deprecated v0.62.0: Use `staticRequest` and a "try catch" block instead. see https://tina.io/docs/features/data-fetching/#querying-tina-content-in-nextjs for more details
 *
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
