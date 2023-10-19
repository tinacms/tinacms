import { InitEnvironment } from '..'
import { Config, makeImportString } from '../prompts'

export const nextApiRouteTemplate = ({
  config,
  env,
}: {
  config: Config
  env: InitEnvironment
}) => {
  const extraPath = env.usingSrc ? '../' : ''
  return `import { TinaNodeBackend, LocalBackendAuthentication } from '@tinacms/datalayer'
  ${makeImportString(
    config.authenticationProvider?.backendAuthenticationImports
  )}
 

  
  import databaseClient from '${extraPath}../../../tina/__generated__/databaseClient'
  
  const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'
  
  const handler = TinaNodeBackend({
    authentication: isLocal
      ? LocalBackendAuthentication()
      : ${config.authenticationProvider?.backendAuthentication || ''},
    databaseClient,
  })
  
  export default (req, res) => {
    // Modify the request here if you need to
    return handler(req, res)
  }`
}
