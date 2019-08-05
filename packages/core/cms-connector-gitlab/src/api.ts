import { GitlabAuth } from './auth'

type GitlabAPIConfig = {
  apiBaseURI: string
  repositoryID: string
  auth: GitlabAuth
}

export class GitlabAPI {
  apiBaseURI: string
  repositoryID: string
  auth: GitlabAuth

  constructor(config: GitlabAPIConfig) {
    this.apiBaseURI = config.apiBaseURI
    this.repositoryID = config.repositoryID
    this.auth = config.auth
  }

  getContents(file: string) {
    return new Promise((resolve, reject) => {
      fetch(
        `${this.apiBaseURI}api/v4/projects/${
          this.repositoryID
        }/repository/files/${encodeURIComponent(file)}`,
        {
          redirect: 'follow',
          method: 'GET',
          headers: this.auth.headers(),
        }
      )
        .then((response: any) => {
          if (!response.ok) {
            reject(new Error('API Error'))
          }
          let data = response.json()
          resolve(data.content)
        })
        .catch((err: any) => {
          reject(err)
        })
    })
  }

  save(filePath: string, contents: string) {
    return fetch(
      `${this.apiBaseURI}api/v4/projects/${
        this.repositoryID
      }/repository/commits`,
      {
        redirect: 'follow',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.auth.headers(),
        },
        body: JSON.stringify({
          branch: 'master',
          commit_message: 'Update from xeditor',
          actions: [
            {
              action: 'update',
              file_path: filePath,
              content: contents,
            },
          ],
        }),
      }
    ).then((response: any) => {
      if (!response.ok) {
        throw new Error(response.message ? response.message : 'API Error')
      }
      let data = response.json()
      return data.id
    })
  }
}
