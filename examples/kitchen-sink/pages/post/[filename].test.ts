import { test, expect } from 'vitest'
import { getStaticProps } from './[...filename]'
import { printState, printBlueprints } from '@tinacms/app/dist/test-utils'
import schema from '../../tina/__generated__/_graphql.json'
import client from '../../tina/__generated__/client'
import { DocumentNode, print } from 'graphql'
import { toMatchFile } from 'jest-file-snapshot'
expect.extend({ toMatchFile })
import path from 'path'

test('the query is formified for a documentation document', async () => {
  const result = await getStaticProps({
    params: { filename: ['tinacms-v0.69.7'] },
  })
  const res = await printBlueprints({
    schema: schema as DocumentNode,
    client,
    query: result.props.query,
  })
  expect(print(res.formifiedQuery)).toMatchFile(
    path.join(__dirname, './formified-query.gql')
  )
  expect(JSON.stringify(printState(res.blueprints), null, 2)).toMatchFile(
    path.join(__dirname, './blueprints.json')
  )
})
