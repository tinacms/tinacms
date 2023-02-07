/**

*/

// Source: https://medium.com/@chris_marois/asynchronous-locks-in-modern-javascript-8142c877baf
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
