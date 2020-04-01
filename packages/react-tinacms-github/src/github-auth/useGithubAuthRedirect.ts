import { useEffect } from 'react'

export const GITHUB_AUTH_CODE_KEY = 'github_auth_code'

const useGithubAuthRedirect = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    localStorage[GITHUB_AUTH_CODE_KEY] = code
  }, [])
}

export default useGithubAuthRedirect
