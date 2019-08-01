import { GitlabAuth } from './auth'
import { GitlabAPI } from './api'
import { API } from '@forestryio/cms'

type GitlabConnectorConfig = {
  apiBaseURI?: string
  appID: string
  redirectURI: string
  repositoryID: string
}

export class GitlabConnector implements API {
  apiBaseURI: string
  auth: GitlabAuth
  api: GitlabAPI

  constructor(config: GitlabConnectorConfig) {
    this.apiBaseURI = config.apiBaseURI
      ? config.apiBaseURI
      : 'https://gitlab.com/api/v4/'
    this.auth = new GitlabAuth({
      apiBaseURI: this.apiBaseURI,
      appID: config.appID,
      redirectURI: config.redirectURI,
    })
    this.api = new GitlabAPI({
      apiBaseURI: this.apiBaseURI,
      repositoryID: encodeURIComponent(config.repositoryID),
      auth: this.auth,
    })
  }

  bootstrap() {
    this.auth.listenForCallback()
  }

  isAuthorized() {
    return this.auth.isLoggedIn()
  }

  authorize() {
    return this.auth.login()
  }

  removeAuthorization() {
    this.auth.logout()
  }

  onSubmit(data: { path: string; contents: string }) {
    return this.api.save(data.path, data.contents)
  }
}
