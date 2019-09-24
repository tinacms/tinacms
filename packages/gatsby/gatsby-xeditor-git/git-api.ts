export interface TinaGitApi {
  commitAndPush(data: any): Promise<any>
  writeToDisk(data: any): Promise<any>
  writeMediaToDisk(data: any): Promise<any>
  deleteFromDisk(data: any): Promise<any>

  /**
   * An alias to `commitAndPush`
   *
   * @deprecated
   */
  onSubmit(data: any): Promise<any>
  /**
   * An alias to `writeToDisk`
   *
   * @deprecated
   */
  onChange(data: any): Promise<any>
  /**
   * An alias to `writeMediaToDisk`
   *
   * @deprecated
   */
  onUploadMedia(data: any): Promise<any>
  /**
   * An alias to `deleteFromDisk`
   *
   * @deprecated
   */
  onDelete(data: any): Promise<any>
  /**
   * @deprecated
   */
  isAuthenticated(): boolean
}

export const GitApi: TinaGitApi = {
  commitAndPush(data: any) {
    return commit(data)
  },
  writeToDisk(data: any) {
    return writeToDisk(data)
  },
  writeMediaToDisk(data: any) {
    return writeMediaToDisk(data)
  },
  deleteFromDisk(data: any) {
    return deleteFromDisk(data)
  },
  onSubmit(data: any) {
    return GitApi.commitAndPush(data)
  },
  onChange(data: any) {
    return GitApi.writeToDisk(data)
  },
  onUploadMedia(data: any) {
    return GitApi.writeMediaToDisk(data)
  },
  onDelete(data: any) {
    return GitApi.deleteFromDisk(data)
  },
  isAuthenticated() {
    return true
  },
}

export const GitSsrApi: TinaGitApi = {
  async onSubmit() {},
  async onChange() {},
  async onUploadMedia() {},
  async onDelete() {},
  isAuthenticated() {
    return false
  },
  async commitAndPush() {},
  async writeToDisk() {},
  async writeMediaToDisk() {},
  async deleteFromDisk() {},
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
  }).catch(e => {
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
  }).catch(e => {
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
  ).catch(e => {
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
    .then(() => {
      window.history.back()
    })
    .catch(e => {
      console.error(e)
    })
}
