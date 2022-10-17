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
import { useMachine } from '@xstate/react'
import { queryMachine, initialContext } from './lib/machines/query-machine'
import { useCMS, defineStaticConfig } from 'tinacms'

type Config = Parameters<typeof defineStaticConfig>[0]

export const Preview = (
  props: Config & {
    url: string
    iframeRef: React.MutableRefObject<HTMLIFrameElement>
  }
) => {
  const cms = useCMS()

  const machine = React.useMemo(
    () =>
      queryMachine.withContext({
        ...initialContext,
        cms,
        // @ts-ignore FIXME: add formifyCallback args to Config type
        formifyCallback: props.formifyCallback,
      }),
    []
  )

  const [, send] = useMachine(machine)

  React.useEffect(() => {
    if (props.iframeRef.current) {
      send({ type: 'IFRAME_MOUNTED', value: props.iframeRef.current })
      window.addEventListener('message', (event) => {
        if (event.data.type === 'open') {
          send({ type: 'ADD_QUERY', value: event.data })
        }
        if (event.data.type === 'close') {
          send({ type: 'REMOVE_QUERY', value: event.data.id })
        }
      })
    }
  }, [props.iframeRef.current])

  return (
    <div className="tina-tailwind">
      <div className="h-full overflow-scroll">
        <div className="">
          <div className="col-span-5 ">
            <div className="h-screen flex flex-col">
              <div className="relative flex-1 bg-gray-300 col-span-2 overflow-scroll flex items-center justify-center">
                <iframe
                  ref={props.iframeRef}
                  className="h-full w-full bg-white"
                  src={props.url}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
