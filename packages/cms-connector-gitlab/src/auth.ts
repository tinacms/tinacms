import { PersistentSessionStorage } from '@forestryio/persistent-session-storage'

export type GitlabAuthConfig = {
  apiBaseURI: string
  appID: string
  redirectURI: string
}

export class GitlabAuth {
  apiBaseURI: string
  appID: string
  redirectURI: string
  tokenStore: PersistentSessionStorage

  constructor(config: GitlabAuthConfig) {
    this.apiBaseURI = config.apiBaseURI
    this.appID = config.appID
    this.redirectURI = config.redirectURI
    this.tokenStore = new PersistentSessionStorage('gitlab-token')
  }

  listenForCallback() {
    let params = new URLSearchParams(window.location.search)
    if (params.has('auth-gitlab')) {
      let token = readToken()
      if (token) {
        this.tokenStore.setValue(token)
      }
      window.close()
    }
  }

  isLoggedIn() {
    let token = this.tokenStore.getValue()
    return !!token && token.length > 0
  }

  login() {
    const authUrl = `${this.apiBaseURI}/oauth/authorize?client_id=${
      this.appID
    }&redirect_uri=${encodeURIComponent(this.redirectURI)}&response_type=token`

    window.open(authUrl, '_blank')
  }

  logout() {
    this.tokenStore.setValue('')
  }

  headers() {
    return {
      Authorization: `Bearer ${this.tokenStore.getValue()}`,
    }
  }
}

function readToken() {
  let matches = window.location.hash.match('access_token=([^&]*)&')
  if (matches && matches[1]) {
    return matches[1]
  }
  return null
}
