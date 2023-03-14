import Progress from 'progress'
import {
  getIntrospectionQuery,
  buildClientSchema,
  print,
  buildSchema,
} from 'graphql'
import { diff } from '@graphql-inspector/core'

import type { Bridge } from '@tinacms/datalayer'
import type { Database } from '@tinacms/graphql'
import type { Schema } from '@tinacms/schema-tools'
import { parseURL } from '@tinacms/schema-tools'
import { ConfigBuilder } from '../../buildTina'

//  This was taken from packages/tinacms/src/unifiedClient/index.ts
// TODO: maybe move this to a shared util package?

async function request(args: {
  url: string
  token: string
}): Promise<{ status: string; timestamp: number }> {
  const headers = new Headers()
  if (args.token) {
    headers.append('X-API-KEY', args.token)
  }
  headers.append('Content-Type', 'application/json')

  const url = args?.url

  const res = await fetch(url, {
    method: 'GET',
    headers,
    redirect: 'follow',
  })
  const json = await res.json()
  if (!res.ok) {
    let additionalInfo = ''
    if (res.status === 401 || res.status === 403) {
      additionalInfo =
        'Please check that your client ID, URL and read only token are configured properly.'
    }
    if (json) {
      additionalInfo += `\n\nMessage from server: ${json.message}`
    }
    throw new Error(
      `Server responded with status code ${res.status}, ${res.statusText}. ${
        additionalInfo ? additionalInfo : ''
      } Please see our FAQ for more information: https://tina.io/docs/errors/faq/`
    )
  }
  if (json.errors) {
    throw new Error(
      `Unable to fetch, please see our FAQ for more information: https://tina.io/docs/errors/faq/

      Errors: \n\t${json.errors.map((error) => error.message).join('\n')}`
    )
  }
  return {
    status: json?.status,
    timestamp: json?.timestamp,
  }
}

export const checkClientInfo = async (
  ctx: {
    builder: ConfigBuilder
    rootPath: string
    database: Database
    bridge: Bridge
    usingTs: boolean
    schema?: Schema
    apiUrl: string
    isSelfHostedDatabase: boolean
  },
  next,
  _options: { verbose?: boolean }
) => {
  if (ctx.isSelfHostedDatabase) {
    return next()
  }

  const config = ctx.schema?.config
  const token = config.token
  const { clientId, branch, host } = parseURL(ctx.apiUrl)
  const url = `https://${host}/db/${clientId}/status/${branch}`
  const bar = new Progress('Checking clientId, token and branch. :prog', 1)

  try {
    await request({
      token,
      url,
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

export const fetchRemoteGraphqlSchema = async ({
  url,
  token,
}: {
  url: string
  token?: string
}) => {
  const headers = new Headers()
  if (token) {
    headers.append('X-API-KEY', token)
  }
  const body = JSON.stringify({ query: getIntrospectionQuery(), variables: {} })

  headers.append('Content-Type', 'application/json')

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body,
  })
  const data = await res.json()
  return data?.data
}

export const checkGraphqlSchema = async (
  ctx: {
    builder: ConfigBuilder
    rootPath: string
    database: Database
    bridge: Bridge
    usingTs: boolean
    schema?: Schema
    apiUrl: string
    isSelfHostedDatabase: boolean
  },
  next,
  _options: { verbose?: boolean }
) => {
  const bar = new Progress(
    'Checking local GraphQL Schema matches server. :prog',
    1
  )
  const config = ctx.schema?.config
  const token = config.token
  const url = ctx.apiUrl

  // Get the remote schema from the graphql endpoint
  const remoteSchema = await fetchRemoteGraphqlSchema({
    url,
    token,
  })

  const remoteGqlSchema = buildClientSchema(remoteSchema)

  // This will always be the filesystem bridge.
  const localSchemaDocument = await ctx.database.getGraphQLSchemaFromBridge()
  const localGraphqlSchema = buildSchema(print(localSchemaDocument))
  const diffResult = await diff(localGraphqlSchema, remoteGqlSchema)

  if (diffResult.length === 0) {
    bar.tick({
      prog: '✅',
    })
  } else {
    bar.tick({
      prog: '❌',
    })
    let errorMessage = `The local GraphQL schema doesn't match the remote GraphQL schema. Please push up your changes to Github to update your remote GraphQL schema.`
    if (config?.branch) {
      errorMessage += `\n\nAdditional info: Branch: ${config.branch}, Client ID: ${config.clientId} `
    }
    throw new Error(errorMessage)
  }

  next()
}
