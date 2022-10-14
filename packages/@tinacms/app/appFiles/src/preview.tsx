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
import React, { useState } from 'react'
import { useMachine } from '@xstate/react'
import { queryMachine, initialContext } from './lib/machines/query-machine'
import { useNavigate, useParams } from 'react-router-dom'
import { useCMS, defineStaticConfig } from 'tinacms'

type Config = Parameters<typeof defineStaticConfig>[0]

export const Preview = (props: Config) => {
  const cms = useCMS()
  const params = useParams()
  const navigate = useNavigate()
  const [url, setURL] = React.useState(`/${params['*']}`)
  const [reportedURL, setReportedURL] = useState<string | null>(null)
  const paramURL = `/${params['*']}`

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
  const ref = React.useRef<HTMLIFrameElement>(null)

  React.useEffect(() => {
    if (reportedURL !== paramURL && paramURL) {
      console.log('manual URL change')
      send({ type: 'NAVIGATE' })
      setURL(paramURL)
    }
  }, [paramURL])
  React.useEffect(() => {
    if ((reportedURL !== url || reportedURL !== paramURL) && reportedURL) {
      navigate(`/preview${reportedURL}`)
    }
  }, [reportedURL])

  React.useEffect(() => {
    if (ref.current) {
      send({ type: 'IFRAME_MOUNTED', value: ref.current })
      window.addEventListener('message', (event) => {
        if (event.data.type === 'open') {
          send({ type: 'ADD_QUERY', value: event.data })
        }
        if (event.data.type === 'close') {
          send({ type: 'REMOVE_QUERY', value: event.data.id })
        }
      })
    }
  }, [ref.current])
  React.useEffect(() => {
    setInterval(() => {
      if (ref.current) {
        const url = new URL(ref.current.contentWindow?.location.href || '')
        if (url.origin === 'null') {
          return
        }
        const href = url.href.replace(url.origin, '')
        setReportedURL(href)
      }
    }, 100)
  }, [ref.current])

  return (
    <div className="h-full overflow-scroll">
      <div className="">
        <div className="col-span-5 ">
          <div className="h-screen flex flex-col">
            <div className="relative flex-1 bg-gray-300 col-span-2 overflow-scroll flex items-center justify-center">
              <iframe ref={ref} className="h-full w-full bg-white" src={url} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
