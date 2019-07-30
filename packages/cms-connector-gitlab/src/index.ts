import { GitlabAuth } from './auth'

type GitlabConnectorConfig = {
  apiBaseURI?: string
  appID: string
  redirectURI: string
  repositoryID: string
}

export class GitlabConnector {
  apiBaseURI: string
  auth: GitlabAuth
  repositoryID: string

  constructor(config: GitlabConnectorConfig) {
    this.apiBaseURI = config.apiBaseURI
      ? config.apiBaseURI
      : 'https://gitlab.com/api/v4/'
    this.auth = new GitlabAuth({
      apiBaseURI: this.apiBaseURI,
      appID: config.appID,
      redirectURI: config.redirectURI,
    })
    this.repositoryID = encodeURIComponent(config.repositoryID)
  }

  bootstrap() {
    this.auth.listenForCallback()
  }

  login() {
    this.auth.login()
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
          headers: this.auth.authHeaders(),
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
    return new Promise((resolve, reject) => {
      fetch(
        `${this.apiBaseURI}api/v4/projects/${
          this.repositoryID
        }/repository/commits`,
        {
          redirect: 'follow',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.auth.authHeaders(),
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
      )
        .then((response: any) => {
          if (!response.ok) {
            reject(new Error('Api Error'))
          }
          let data = response.json()
          resolve(data.id)
        })
        .catch((err: any) => {
          reject(err)
        })
    })
  }
}
