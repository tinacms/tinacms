import { GitApi } from './git-api'
import { cms } from '@tinacms/tinacms'

exports.onClientEntry = () => {
  cms.registerApi('git', GitApi)
}
