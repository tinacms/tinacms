export const GitApi = {
  onSubmit(data: any) {
    return commit(data)
  },
  onChange(data: any) {
    writeToDisk(data)
  },
  onUploadMedia(data: any) {
    writeMediaToDisk(data)
  },
  onDelete(data: any) {
    deleteFromDisk(data)
  },
  isAuthenticated() {
    return true
  },
}

export const GitSsrApi = {
  onSubmit(data: any) {},
  onChange(data: any) {},
  onUploadMedia(data: any) {},
  onDelete(data: any) {},
  isAuthenticated() {},
}

let base = () => {
  let { protocol, hostname, port } = window.location
  return `${protocol}//${hostname}${port != '80' ? `:${port}` : ''}`
}

function commit(data: any) {
  // @ts-ignore
  return fetch(`${base()}/___tina/commit`, {
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

function writeMediaToDisk(data: any) {
  let formData = new FormData()
  formData.append('file', data.content)
  formData.append('directory', data.directory)

  // @ts-ignore
  return fetch(`${base()}/___tina/upload`, {
    method: 'POST',
    body: formData,
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
    `${base()}/___tina/${encodeURIComponent(data.fileRelativePath)}`,
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
  return fetch(`${base()}/___tina/${encodeURIComponent(data.relPath)}`, {
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
