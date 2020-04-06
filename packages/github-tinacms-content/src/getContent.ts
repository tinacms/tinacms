const axios = require('axios')

export const getContent = async (
  repoFullName: string,
  headBranch: string,
  path: string,
  accessToken: string
) => {
  return axios({
    method: 'GET',
    url: `https://api.github.com/repos/${repoFullName}/contents/${path}?ref=${headBranch}`,
    headers: {
      Authorization: 'token ' + accessToken,
    },
  })
}
