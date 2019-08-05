export class PersistentSessionStorage {
  storageKey: string

  constructor(storageKey: string) {
    this.storageKey = storageKey

    addEventListener('storage', event => {
      if (event.key === this.storageKey && event.newValue) {
        sessionStorage.setItem(this.storageKey, event.newValue)
      }
    })
  }

  setValue(value: string) {
    // sends a storage event with the new value to be captured by sessionStorage
    localStorage.setItem(this.storageKey, value)
    localStorage.removeItem(this.storageKey)
  }

  getValue() {
    return sessionStorage.getItem(this.storageKey)
  }
}
