/**

*/

import { Plugin } from '@tinacms/toolkit'
import type { CollectionResponse, DocumentSys } from '../types'
export class RouteMappingPlugin implements Plugin {
  __type: string = 'tina-admin'
  name: string = 'route-mapping'
  mapper: (
    collection: CollectionResponse,
    document: DocumentSys
  ) => string | undefined

  constructor(
    mapper: (
      collection: CollectionResponse,
      document: DocumentSys
    ) => string | undefined
  ) {
    this.mapper = mapper
  }
}
