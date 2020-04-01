import popupWindow from '../misc/popupWindow'
import { GITHUB_AUTH_CODE_KEY } from './useGithubAuthRedirect'
export const authenticate = (codeExchangeRoute: string): Promise<void> => {
  const authState = Math.random()
    .toString(36)
    .substring(7)

  const url = `https://github.com/login/oauth/authorize?scope=public_repo&client_id=${process.env.GITHUB_CLIENT_ID}&state=${authState}`

  return new Promise(resolve => {
    let authTab
    window.addEventListener('storage', function(e) {
      if (e.key == GITHUB_AUTH_CODE_KEY) {
        fetch(
          `${codeExchangeRoute}?code=${e.newValue}&state=${authState}`
        ).then(() => {
          if (authTab) {
            authTab.close()
          }
          resolve()
        })
      }
    })

    authTab = popupWindow(url, '_blank', window, 1000, 700)
  })
}
