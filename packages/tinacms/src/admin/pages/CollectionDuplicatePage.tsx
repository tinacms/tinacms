import { useParams } from 'react-router-dom'
import React from 'react'

import GetCMS from '../components/GetCMS'
import GetCollection from '../components/GetCollection'
import type { TinaCMS } from '@tinacms/toolkit'
import { RenderForm } from './CollectionCreatePage'
import GetDocument from '../components/GetDocument'

const CollectionDuplicatePage = () => {
  const { collectionName, ...rest } = useParams()
  const { '*': filename } = rest

  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <GetCollection
          cms={cms}
          collectionName={collectionName}
          includeDocuments={false}
        >
          {(collection) => {
            const relativePath = `${filename}.${collection.format}`

            const mutationInfo = {
              includeCollection: true,
              includeTemplate: !!collection.templates,
            }

            return (
              <GetDocument
                cms={cms}
                collectionName={collection.name}
                relativePath={relativePath}
              >
                {(document) => (
                  <RenderForm
                    cms={cms}
                    collection={collection}
                    templateName={document._template}
                    mutationInfo={mutationInfo}
                    customDefaults={document._values}
                  />
                )}
              </GetDocument>
            )
          }}
        </GetCollection>
      )}
    </GetCMS>
  )
}

export default CollectionDuplicatePage
