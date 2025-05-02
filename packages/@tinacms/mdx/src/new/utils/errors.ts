import { Plate } from "../adapters/plate/types"

export class RichTextParseError extends Error {
  public position?: Plate.Position
  constructor(message: string, position?: Plate.Position) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RichTextParseError)
    }

    this.name = 'RichTextParseError'
    // Custom debugging information
    this.position = position
  }
}


