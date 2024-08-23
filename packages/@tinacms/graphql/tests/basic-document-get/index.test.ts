import { it, expect } from 'vitest'
import config from './tina/config'
import { setup, format } from '../util'
import input from './in.md?raw'

it('get-basic', async () => {
  const { get, put } = await setup(__dirname, config)
  const data = await get()
  expect(format(data)).toMatchFileSnapshot('node.json')
  const data2 = await put(data)
  expect(data2).toEqual(data)
  expect(input).toMatchFileSnapshot('out.md')
})
