/**

*/
import React from 'react'
import { defineConfig } from 'tinacms'
import { useGraphQLReducer } from './lib/graphql-reducer'

type Config = Parameters<typeof defineConfig>[0]

export const Preview = (
  props: Config & {
    url: string
    iframeRef: React.MutableRefObject<HTMLIFrameElement>
  }
) => {
  useGraphQLReducer(props.iframeRef, props.url)

  return (
    <iframe
      data-test="tina-iframe"
      id="tina-iframe"
      ref={props.iframeRef}
      className="h-screen w-full bg-white"
      src={props.url}
    />
  )
}
