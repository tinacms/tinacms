import { it, expect } from 'vitest'
import config from './tina/config'
import { setup, format } from '../util'

it('has the expected output and writes the expected string', async () => {
  const { get } = await setup(__dirname, config)
  const result = await get()
  expect(format(result)).toMatchFileSnapshot('node.json')
})
