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

let base = window.location.origin
function commit(data: any) {
  // @ts-ignore
  return fetch(`${base}:4567/x-editor/commit`, {
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
  return fetch(`${base}:4567/x-editor/markdownRemark`, {
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
