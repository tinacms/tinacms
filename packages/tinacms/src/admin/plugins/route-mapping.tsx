/**

*/

import { Plugin } from '@tinacms/toolkit'
import type { Collection, DocumentSys } from '../types'
export class RouteMappingPlugin implements Plugin {
  __type: string = 'tina-admin'
  name: string = 'route-mapping'
  mapper: (collection: Collection, document: DocumentSys) => string | undefined

  constructor(
    mapper: (
      collection: Collection,
      document: DocumentSys
    ) => string | undefined
  ) {
    this.mapper = mapper
  }
}
