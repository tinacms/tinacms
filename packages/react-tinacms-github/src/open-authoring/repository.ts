import Cookies from 'js-cookie'

export const FORK_COOKIE_KEY = 'fork_full_name'
export const HEAD_BRANCH_COOKIE_KEY = 'head_branch'

export const getForkName = () => {
  return getCookie(FORK_COOKIE_KEY)
}
export const setForkName = (val: string) => {
  setCookie(FORK_COOKIE_KEY, val)
}

export const getHeadBranch = () => {
  return getCookie(HEAD_BRANCH_COOKIE_KEY) || 'master'
}
export const setHeadBranch = (val: string) => {
  setCookie(HEAD_BRANCH_COOKIE_KEY, val)
}

const getCookie = (cookieName: string) => {
  return Cookies.get(cookieName)
}

const setCookie = (cookieName: string, val: string) => {
  Cookies.set(cookieName, val, { sameSite: 'strict' })
}
