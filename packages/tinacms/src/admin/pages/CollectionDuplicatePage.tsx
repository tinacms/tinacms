import { useParams } from 'react-router-dom'
import React from 'react'

import GetCMS from '../components/GetCMS'
import GetCollection from '../components/GetCollection'
import type { TinaCMS } from '@tinacms/toolkit'
import { RenderForm } from './CollectionCreatePage'
import GetDocument from '../components/GetDocument'
import { parentFolder, useCollectionFolder } from './utils'

const CollectionDuplicatePage = () => {
  const folder = useCollectionFolder()
  const { collectionName, ...rest } = useParams()
  const { '*': filename } = rest

  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <GetCollection
          cms={cms}
          collectionName={collectionName}
          folder={folder}
          includeDocuments={false}
        >
          {(collection) => {
            const relativePath = `${
              filename.startsWith('~/') ? filename.substring(2) : filename
            }.${collection.format}`

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
                {(document) => {
                  return (
                    <RenderForm
                      cms={cms}
                      collection={collection}
                      templateName={document._values?._template}
                      folder={parentFolder(folder)}
                      mutationInfo={mutationInfo}
                      customDefaults={document._values}
                    />
                  )
                }}
              </GetDocument>
            )
          }}
        </GetCollection>
      )}
    </GetCMS>
  )
}

export default CollectionDuplicatePage
