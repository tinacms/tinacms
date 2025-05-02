import type * as Md from 'mdast'
import type * as Plate from './plate-types'
import type { RichTextField } from '@tinacms/schema-tools'
import type { Position } from './plate-types'

export type HandlerFunction = (
    content: Md.Content,
    field: RichTextField,
    context?: Record<string, unknown>
) => Plate.BlockElement

export type { Md, Plate, RichTextField }

export type Context = {
    field: RichTextField
    raw?: string
    context?: Record<string, unknown>
    skipMDXProcess: boolean
}
