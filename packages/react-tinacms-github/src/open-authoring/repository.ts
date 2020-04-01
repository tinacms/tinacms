/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

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
