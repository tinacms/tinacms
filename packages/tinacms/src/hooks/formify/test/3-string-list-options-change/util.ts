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

import { renderHook, act } from '@testing-library/react-hooks'
import { useFormify } from '../..'
import * as util from '../util'
import fs from 'fs'
import path from 'path'

const requestList = []

/**
 * When setting up a test, you should run the local server
 * at experimental-examples/unit-test-example. Otherwise, the mocks.json
 * in the respective test folder should supply the network mocks
 */
const SET_MOCKS_FROM_LOCAL_SERVER = false

afterAll(() => {
  if (SET_MOCKS_FROM_LOCAL_SERVER) {
    fs.writeFileSync(
      path.join(__dirname, 'mocks.json'),
      JSON.stringify(requestList)
    )
  }
})

export const testit = async (query, events) => {
  if (SET_MOCKS_FROM_LOCAL_SERVER) {
    const { fetch: origFetch } = global
    global.fetch = async (...args) => {
      const response = await origFetch(...args)

      /* work with the cloned response in a separate promise
       chain -- could use the same chain with `await`. */
      const body = await response.json()
      if (args[0] === 'http://localhost:4001/graphql') {
        requestList.push({ queryString: args[1].body, response: body })
      }
      return {
        ok: response.ok,
        status: response.status,
        json: async () => body,
      }
    }
  } else {
    let mocks = []
    try {
      mocks = JSON.parse(
        await fs.readFileSync(path.join(__dirname, 'mocks.json')).toString()
      )
    } catch (e) {
      throw new Error(`Mocks fixture does not exist`)
    }
    global.fetch = async (...args) => {
      const body = mocks.find(
        (mock) => mock.queryString === args[1].body
      )?.response
      if (!body) {
        throw new Error('Unable to find mock')
      }
      return {
        ok: 'ok',
        status: 200,
        json: async () => body,
      }
    }
  }
  const { result, waitFor } = renderHook(() =>
    useFormify({
      query,
      cms: util.cms,
      formify: (args) => args.createForm(args.formConfig),
      onSubmit: () => {},
      variables: {},
    })
  )

  await waitFor(() => {
    return result.current.status === 'done'
  })

  //@ts-ignore FIXME: jest types
  expect(util.printState(result.current)).toMatchFile(
    util.buildFileOutput(__dirname)
  )

  await act(
    async () =>
      await util.sequential(events, async (event, i) => {
        const previous = { ...result.current.data }
        util.cms.events.dispatch(event)
        await waitFor(() => {
          return result.current.changeSets.length > 0
        })
        await waitFor(() => {
          return result.current.changeSets.length === 0
        })
        const after = { ...result.current.data }

        //@ts-ignore FIXME: jest types
        expect(util.printOutput(event, previous, after)).toMatchFile(
          util.buildMarkdownOutput(__dirname, i)
        )
        return true
      })
  )
}
