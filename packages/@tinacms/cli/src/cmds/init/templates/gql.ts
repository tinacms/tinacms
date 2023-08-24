export type Variables = {
  isLocalEnvVarName: string
  typescript?: boolean
}
export type GQLEndpointTypes = 'custom' | 'tinacms-next-auth' | 'tina-cloud'

export const templates: {
  [key in GQLEndpointTypes]: (vars: Variables) => string
} = {
  ['custom']: (
    vars: Variables
  ) => `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
${
  vars.typescript ? `import { NextApiHandler } from 'next'\n` : ''
}import databaseClient from '../../tina/__generated__/databaseClient'

const nextApiHandler${
    vars.typescript ? `: NextApiHandler` : ''
  } = async (req, res) => {
  const isAuthorized =
    process.env.${vars.isLocalEnvVarName} === 'true' ||
    // add your own authorization logic here
    false

  if (isAuthorized) {
    const { query, variables } = req.body
    const result = await databaseClient.request({ query, variables })
    return res.json(result)
  } else {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

export default nextApiHandler;
`,
  ['tinacms-next-auth']: (
    vars: Variables
  ) => `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
${
  vars.typescript ? `import { NextApiHandler } from 'next'\n` : ''
}import databaseClient from '../../tina/__generated__/databaseClient'
import { withNextAuthApiRoute } from 'tinacms-next-auth/dist/index'
import { authOptions } from '../../tina/auth'

const nextApiHandler${
    vars.typescript ? `: NextApiHandler` : ''
  } = async (req, res) => {
  const { query, variables } = req.body
  const result = await databaseClient.request({ query, variables })
  return res.json(result)
}

export default withNextAuthApiRoute(
  nextApiHandler, { authOptions, isLocalDevelopment: process.env.${
    vars.isLocalEnvVarName
  } === 'true' }
)
`,
  ['tina-cloud']: (
    vars: Variables
  ) => `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
import { isUserAuthorized } from '@tinacms/auth'
import databaseClient from '../../tina/__generated__/databaseClient'

const nextApiHandler = async (req, res) => {
   const isAuthorized = process.env.${vars.isLocalEnvVarName} === 'true' || await isUserAuthorized({
       token: req.headers.authorization,
       clientID: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  })

  if (isAuthorized) {
    const { query, variables } = req.body
    const result = await databaseClient.request({ query, variables })
    return res.json(result)
  } else {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

export default nextApiHandler
`,
}
