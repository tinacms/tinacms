import { cms } from '@forestryio/gatsby-plugin-xeditor'

cms.registerApi('git', {
  onSubmit(data: any) {
    return commit(data)
  },
  onChange(data: any) {
    writeToDisk(data)
  },
  isAuthenticated() {
    return true
  },
})

let { protocol, hostname } = window.location
let port = hostname.endsWith('instant.dev.forestry.io') ? '' : ':4567'
let base = `${protocol}//${hostname}${port}`

function commit(data: any) {
  // @ts-ignore
  return fetch(`${base}/x-server/commit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(data),
  })
    .then(response => {
      console.log(response.json())
    })
    .catch(e => {
      console.error(e)
    })
}

function writeToDisk(data: any) {
  // @ts-ignore
  return fetch(`${base}/x-server/markdownRemark`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(data),
  })
    .then(response => {
      console.log(response.json())
    })
    .catch(e => {
      console.error(e)
    })
}
