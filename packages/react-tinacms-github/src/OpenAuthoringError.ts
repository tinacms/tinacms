export default class OpenAuthoringError extends Error {
  code: number
  constructor(message, code) {
    super(message)
    this.message = message
    this.code = code
  }
}
