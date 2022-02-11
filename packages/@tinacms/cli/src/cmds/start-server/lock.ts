export class AsyncLock {
  public disable
  public promise
  constructor() {
    this.disable = () => {}
    this.promise = Promise.resolve()
  }

  enable() {
    this.promise = new Promise((resolve) => (this.disable = resolve))
  }
}
