import { GitMediaStore } from '@tinacms/git-client'

export class NextGitMediaStore extends GitMediaStore {
  previewSrc(src) {
    return /jpg|png$/.test(src) ? src.replace('/public', '') : null
  }
}
