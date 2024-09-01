import { it, expect } from 'vitest'
import config from './tina/config'
import { setup, format, assertDoc } from '../util'
import input from './in.md?raw'

it('has the expected output and writes the expected string', async () => {
  const { get, put } = await setup(__dirname, config)
  const result = await get()
  expect(format(result)).toMatchFileSnapshot('node.json')
  await put(assertDoc(result).data.document._values)
  expect(input).toMatchFileSnapshot('out.md')
})
