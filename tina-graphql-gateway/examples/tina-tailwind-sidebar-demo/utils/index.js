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

import { Client, LocalClient } from 'tina-graphql-gateway'

export const createClient = () => {
  return process.env.NEXT_PUBLIC_USE_LOCAL_CLIENT === '1'
    ? createLocalClient()
    : createCloudClient()
}

export const createCloudClient = () => {
  const organization = process.env.NEXT_PUBLIC_ORGANIZATION_NAME
  const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID

  const missingEnv = []
  if (!organization) {
    missingEnv.push('NEXT_PUBLIC_ORGANIZATION_NAME')
  }
  if (!clientId) {
    missingEnv.push('NEXT_PUBLIC_TINA_CLIENT_ID')
  }

  if (missingEnv.length) {
    throw new Error(`The following environment variables are required when using the Tina Cloud Client:
     ${missingEnv.join(', ')}`)
  }

  return new Client({
    organizationId: organization,
    clientId,
    branch: 'tina-cloud',
    tokenStorage: 'LOCAL_STORAGE',
  })
}

/**
 * This is a GraphQL client that only talks to your local filesystem server,
 * as a result it's a great tool for static page building or local development.
 *
 * In this starter app you'll see it being used as both, with the
 * option to "switch on" the non-local client via environment variables.
 */
export const createLocalClient = () => {
  return new LocalClient()
}

/**
 *
 * Takes a path (ex. /posts/my-page) and uses the first item
 * as the `collection` and the remaining peices for the relativePath
 * arguments
 *
 */
export const variablesFromPath = (path, fallback) => {
  const arr = path.split('/')
  const collection = arr[0]
  // FIXME: assumes `.md` as extension, should work with other extensions
  const relativePath = `${arr.slice(1).join('/')}.md`

  if (collection && relativePath) {
    return { collection, relativePath }
  } else {
    return fallback
  }
}

// FIXME: infer args from useForm
export const redirectToNewDocument = (args, prefix) => {
  const redirect = `${window.location.origin}${prefix}/${
    args.collection.slug
  }/${args.breadcrumbs.join('/')}`

  window.location.assign(redirect)
}
