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
  return `import { TinaNodeBackend, LocalBackendAuthProvider } from '@tinacms/datalayer'
  ${makeImportString(config.authProvider?.backendAuthProviderImports)}
 

  
  import databaseClient from '${extraPath}../../../tina/__generated__/databaseClient'
  
  const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'
  
  const handler = TinaNodeBackend({
    authProvider: isLocal
      ? LocalBackendAuthProvider()
      : ${config.authProvider?.backendAuthProvider || ''},
    databaseClient,
  })
  
  export default (req, res) => {
    // Modify the request here if you need to
    return handler(req, res)
  }`
}
