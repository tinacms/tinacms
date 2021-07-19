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
import { useGraphqlForms, formifyCallback } from './hooks/use-graphql-forms'
import { useGraphqlForms as unstable_useGraphqlForms } from './hooks/unstable-use-graphql-forms'
import { useDocumentCreatorPlugin as unstable_useDocumentCreatorPlugin } from './hooks/unstable-use-graphql-forms'
import { TinaCloudProvider } from './auth'
import { TinaCMS, useCMS } from '@tinacms/toolkit'

const SetupHooksUnstable = (props) => {
  const cms = useCMS()
  const [payload, isLoading] = unstable_useGraphqlForms({
    query: (gql) => gql(props.query),
    variables: props.variables || {},
    formify: (args) => props.formify(args, cms),
  })
  unstable_useDocumentCreatorPlugin()

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

const SetupHooks = (props) => {
  const cms = useCMS()
  const [payload, isLoading] = useGraphqlForms({
    query: (gql) => gql(props.query),
    variables: props.variables || {},
    formify: (args) => props.formify(args, cms),
  })

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

    this.state = { hasError: props.hasError }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
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
        <>
          <p>
            The code is likely assuming the existence of data which is not
            guaranteed to be there
          </p>
          <p>
            Try to fix the form and when you're ready to see if it worked click{' '}
            <button onClick={() => this.setState({ hasError: false })}>
              here
            </button>
          </p>
          <p>
            If you'd like to go back to the last valid state, click
            <button onClick={() => alert('not yet implemented')}>here</button>
          </p>
        </>
      )
    }

    return this.props.children
  }
}

export const TinaCMSProvider2 = ({
  children,
  cms,
  config,
  useUnstable,
  ...props
}: {
  query?: string
  children: React.ReactNode
  /** perform additional logic to the CMS object if necessary */
  cms?: (cms: TinaCMS) => TinaCMS
  /** hook into the formify function custom form building logic */
  formify?: formifyCallback
  useUnstable?: boolean
  config: Parameters<typeof TinaCloudProvider>
}) => {
  return (
    <TinaCloudProvider {...config} cmsCallback={cms}>
      {props.query ? (
        // Just reset the state machine with a new key
        useUnstable ? (
          <SetupHooksUnstable key={props.query} {...props}>
            {children}
          </SetupHooksUnstable>
        ) : (
          <SetupHooks key={props.query} {...props}>
            {children}
          </SetupHooks>
        )
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
