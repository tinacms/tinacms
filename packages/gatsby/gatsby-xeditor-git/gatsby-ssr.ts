import { GitClient } from '@tinacms/git-client'
import { cms } from '@tinacms/tinacms'

exports.onPreRenderHTML = () => {
  cms.registerApi('git', new GitClient('localhost'))
}
