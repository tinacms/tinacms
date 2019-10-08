export class GitClient {
  constructor(private baseUrl: string) {}

  /**
   * An alias to `commitAndPush`
   *
   * @deprecated
   */
  onSubmit(data: any): Promise<any> {
    return this.commitAndPush(data)
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

  /**
   *
   * TODO: Add return type.
   * TODO: Remove `catch`
   */
  commitAndPush(data: {
    files: string[]
    message?: string
    name?: string
    email?: string
  }): Promise<any> {
    return fetch(`${this.baseUrl}/commit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(data),
    }).catch(e => {
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
    ).catch(e => {
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
    }).catch(e => {
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
    }).catch(e => {
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
}
