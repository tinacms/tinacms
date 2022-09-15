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

import Progress from 'progress'
import type { Bridge, Database } from '@tinacms/graphql'
import type { TinaCloudSchema } from '@tinacms/schema-tools'
import { ConfigBuilder } from '../../buildTina'

export const checkClientInfo = async (
  ctx: {
    builder: ConfigBuilder
    rootPath: string
    database: Database
    bridge: Bridge
    usingTs: boolean
    schema?: TinaCloudSchema<false>
    client: any
  },
  next,
  _options: { verbose?: boolean }
) => {
  const client = ctx.client
  const config = ctx.schema?.config

  const bar = new Progress('Checking clientId, token and branch. :prog', 1)

  try {
    await client.request({
      query: `query {
        collections {
          name
        }
      }`,
    })
    bar.tick({
      prog: '✅',
    })
  } catch (e) {
    bar.tick({
      prog: '❌',
    })
    console.warn(
      `Error when checking client information. You provided \n\n ${JSON.stringify(
        {
          branch: config?.branch,
          clientId: config?.clientId,
          token: config?.token,
        },
        null,
        2
      )}\n\n Please check you have the correct "clientId", "branch" and "token" configured. For more information see https://tina.io/docs/tina-cloud/connecting-site/`
    )
    throw e
  }

  next()
}
