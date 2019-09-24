import { GitClient } from './git-api'
import { cms } from '@tinacms/tinacms'

exports.onPreRenderHTML = () => {
  cms.registerApi('git', new GitClient('localhost'))
}
