import { GitClient } from '@tinacms/git-client'
import { cms } from '@tinacms/tinacms'

exports.onClientEntry = () => {
  const { protocol, hostname, port } = window.location
  const baseUrl = `${protocol}//${hostname}${
    port != '80' ? `:${port}` : ''
  }/___tina`
  cms.registerApi('git', new GitClient(baseUrl))
}
