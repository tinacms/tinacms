import { GitClient } from './git-api'
import { cms } from '@tinacms/tinacms'

exports.onClientEntry = () => {
  let { protocol, hostname, port } = window.location
  let baseUrl = `${protocol}//${hostname}${port != '80' ? `:${port}` : ''}`
  cms.registerApi('git', new GitClient(baseUrl))
}
