import { GitSsrApi } from './git-api'
import { cms } from '@tinacms/tinacms'

exports.onPreRenderHTML = () => {
  cms.registerApi('git', GitSsrApi)
}
