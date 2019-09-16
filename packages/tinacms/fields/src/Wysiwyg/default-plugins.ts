import code from './plugins/marks/code'
import em from './plugins/marks/em'
import link from './plugins/marks/link'
import strong from './plugins/marks/strong'
import { Plugin } from '@tinacms/core'
import { SchemaMarkPlugin } from './plugins'

export const MARK_PLUGINS: SchemaMarkPlugin[] = [code, em, link, strong]

export const ALL_PLUGINS: Plugin[] = [...MARK_PLUGINS]
