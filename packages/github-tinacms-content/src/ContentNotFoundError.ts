export default class ContentNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContentNotFoundError'
  }
}
