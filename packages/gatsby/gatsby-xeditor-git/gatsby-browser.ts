import { GitClient } from '@tinacms/git-client'
import { cms } from '@tinacms/tinacms'

exports.onClientEntry = () => {
  let { protocol, hostname, port } = window.location
  let baseUrl = `${protocol}//${hostname}${
    port != '80' ? `:${port}` : ''
  }/___tina`
  cms.registerApi('git', new GitClient(baseUrl))
}
