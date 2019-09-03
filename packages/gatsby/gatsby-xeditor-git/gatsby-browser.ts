import { cms } from '@tinacms/gatsby-plugin-tinacms'

cms.registerApi('git', {
  onSubmit(data: any) {
    return commit(data)
  },
  onChange(data: any) {
    writeToDisk(data)
  },
  onDelete(data: any) {
    deleteFromDisk(data)
  },
  isAuthenticated() {
    return true
  },
})

let { protocol, hostname, port } = window.location
let base = `${protocol}//${hostname}${port != '80' ? `:${port}` : ''}`

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
  return fetch(
    `${base}/x-server/${encodeURIComponent(data.fileRelativePath)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(data),
    }
  )
    .then(response => {
      console.log(response.json())
    })
    .catch(e => {
      console.error(e)
    })
}

function deleteFromDisk(data: any) {
  return fetch(`${base}/x-server/${encodeURIComponent(data.relPath)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
    .then(response => {
      window.history.back()
    })
    .catch(e => {
      console.error(e)
    })
}
