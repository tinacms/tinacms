import { RichTextParseError } from '../../../utils/errors'
import { HandlerFunction } from '../types'

export const defaultHandler: HandlerFunction = (content) => {
  throw new RichTextParseError(
    `Content: ${content.type} is not yet supported`,
    content?.position
  )
}
