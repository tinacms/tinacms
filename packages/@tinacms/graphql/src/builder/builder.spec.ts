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

import fs from 'fs-extra'
import path from 'path'
import { cacheInit } from '../cache'
import { schemaBuilder } from '.'
import { createDatasource } from '../datasources/data-manager'
import { parse } from 'graphql'
import { FileSystemManager } from '../datasources/filesystem-manager'

const PATH_TO_TEST_APP = path.join(
  path.resolve(__dirname, '../../../../'),
  'apps/test'
)
const PATH_TO_TEST_SCHEMA = path.join(
  PATH_TO_TEST_APP,
  '.tina/__generated__/schema.gql'
)

describe('Schema builder', () => {
  // This is kind of a bad test, just rewrite it when primitives re-work starts
  test.skip('matches schema snapshot', async () => {
    const datasource = createDatasource(
      new FileSystemManager({ rootPath: PATH_TO_TEST_APP })
    )
    const cache = cacheInit(datasource)
    const { schema } = await schemaBuilder({ cache })

    const schemaFile = await fs.readFileSync(PATH_TO_TEST_SCHEMA).toString()

    expect(parse(schemaFile)).toMatchObject(schema)
  })
})
