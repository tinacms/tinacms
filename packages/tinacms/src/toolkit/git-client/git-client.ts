export class GitClient {
  constructor(private baseUrl: string) {}

  /**
   * An alias to `commit`
   *
   * @deprecated
   */
  onSubmit(data: any): Promise<any> {
    return this.commit(data)
  }
  /**
   * An alias to `writeToDisk`
   *
   * @deprecated
   */
  onChange(data: any): Promise<any> {
    return this.writeToDisk(data)
  }
  /**
   * An alias to `writeMediaToDisk`
   *
   * @deprecated
   */
  onUploadMedia(data: any): Promise<any> {
    return this.writeMediaToDisk(data)
  }
  /**
   * An alias to `deleteFromDisk`
   *
   * @deprecated
   */
  onDelete(data: any): Promise<any> {
    return this.deleteFromDisk(data)
  }
  /**
   * @deprecated
   */
  isAuthenticated(): boolean {
    return true
  }

  commit(data: {
    files: string[]
    message?: string
    name?: string
    email?: string
  }): Promise<Response> {
    return fetch(`${this.baseUrl}/commit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(data),
    })
  }

  /**
   *
   * TODO: Add return type.
   * TODO: Remove `catch`
   */
  push(): Promise<any> {
    return fetch(`${this.baseUrl}/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }).catch((e) => {
      console.error(e)
    })
  }

  /**
   *
   * TODO: Add return type.
   * TODO: Remove `catch`
   */
  writeToDisk(data: {
    fileRelativePath: string
    content: string
  }): Promise<any> {
    return fetch(
      `${this.baseUrl}/${encodeURIComponent(data.fileRelativePath)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(data),
      }
    ).catch((e) => {
      console.error(e)
    })
  }

  /**
   * Uploads a File to disk
   * TODO: Remove `catch`
   */
  writeMediaToDisk(data: { directory: string; content: File }): Promise<any> {
    const formData = new FormData()
    formData.append('file', data.content)
    formData.append('directory', data.directory)
    return fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    }).catch((e) => {
      console.error(e)
    })
  }

  /**
   * TODO: rename `data.relPath` to `data.fileRelativePath`
   * TODO: Add return type.
   * TODO: Remove `catch`
   */
  deleteFromDisk(data: { relPath: string }): Promise<any> {
    return fetch(`${this.baseUrl}/${encodeURIComponent(data.relPath)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(data),
    }).catch((e) => {
      console.error(e)
    })
  }

  /**
   * Resets the given files.
   */
  reset(data: { files: string[] }) {
    return fetch(`${this.baseUrl}/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(data),
    })
  }

  /**
   * Get the contents of a file or directory on disk.
   */
  getFile(fileRelativePath: string) {
    return fetch(`${this.baseUrl}/${encodeURIComponent(fileRelativePath)}`, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }).then((response) => {
      return response.json()
    })
  }

  /**
   * Get the contents of a file for the most recent commit.
   */
  show(fileRelativePath: string) {
    return fetch(
      `${this.baseUrl}/show/${encodeURIComponent(fileRelativePath)}`,
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    ).then((response) => {
      return response.json()
    })
  }

  /**
   * Get information about a local branch by name, or the current branch if no
   * name is specified.
   */
  branch(name?: string) {
    return fetch(`${this.baseUrl}/${name ? `branches/${name}` : 'branch'}`, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }).then((response) => {
      return response.json()
    })
  }

  /**
   * Get a list of the names of all local branches.
   */
  branches() {
    return fetch(`${this.baseUrl}/branches`, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }).then((response) => {
      return response.json()
    })
  }
}
