import { useMemo } from 'react'
import { useCMS } from '@tinacms/react-core'

type parseFn = (content: string) => any
type serializeFn = (data: any) => string

export class GithubFile {
  private sha: string | null = null

  constructor(
    private cms: any,
    private path: string,
    private parse?: parseFn,
    private serialize?: serializeFn
  ) {}

  fetchFile = async () => {
    const res = await this.cms.api.github.fetchFile(this.path)
    this.sha = res.sha
    return this.parse ? this.parse(res.content) : res.content
  }

  commit = async (
    data: any,
    message: string = 'Update from TinaCMS',
    retryOnConflict = true
  ) => {
    const serializedContent = this.serialize ? this.serialize(data) : data
    try {
      const response = await this.cms.api.github.commit(
        this.path,
        this.sha,
        serializedContent,
        message
      )
      this.sha = response.content.sha
      this.cms.alerts.success(
        `Saved Successfully: Changes committed to ${this.cms.api.github.workingRepoFullName}`
      )
      return response
    } catch (error) {
      if (error.status == 409 && retryOnConflict) {
        await this.fetchFile() // update sha
        await this.commit(data, message, false) // try one more time
      } else {
        throw error
      }
    }
  }
}

export const useGithubFile = ({
  path,
  parse,
  serialize,
}: {
  path: string
  parse?: parseFn
  serialize?: serializeFn
}) => {
  const cms = useCMS()
  return useMemo(() => {
    return new GithubFile(cms, path, parse, serialize)
  }, [path, parse, serialize, cms])
}
