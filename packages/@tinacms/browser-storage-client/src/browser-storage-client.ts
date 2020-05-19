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

export class BrowserStorageClient {
  data: any = {}
  timeout: number | null = null
  namespace: string
  storage: Storage // should work with window.localStorage or window.sessionStorage

  constructor(storage: Storage, namespace: string | null = null) {
    if (!namespace) {
      this.namespace = `tina-local-storage:${window.location.hostname}`
    } else {
      this.namespace = namespace
    }
    this.storage = storage
    const persistedData = this.storage.getItem(this.namespace)
    if (persistedData) {
      this.data = JSON.parse(persistedData)
    }
  }

  save(id: string, content: any) {
    this.data[id] = content
    this.debouncePersist()
  }

  load(id: string) {
    return this.data[id]
  }

  clear(id: string) {
    delete this.data[id]
    this.debouncePersist()
  }

  private debouncePersist() {
    this.timeout && clearTimeout(this.timeout)
    //@ts-ignore
    this.timeout = setTimeout(this.persist.bind(this), 1000)
  }

  private persist() {
    this.storage.setItem(this.namespace, JSON.stringify(this.data))
  }
}
