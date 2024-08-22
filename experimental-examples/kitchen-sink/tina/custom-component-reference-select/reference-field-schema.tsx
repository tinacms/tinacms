import React from 'react'
import AuthorCollectionCustomReference from '../../component/custom-reference-select-author'
import PostCollectionCustomReference from '../../component/custom-reference-select-post'
import { CollectionProps, COLLECTIONS, InternalSys } from './model'

const referenceField = {
  label: 'Author',
  name: 'author',
  type: 'reference',
  ui: {
    optionComponent: (props: CollectionProps, _internalSys: InternalSys) => {
      switch (props._collection) {
        case COLLECTIONS.AUTHOR:
          return (
            <AuthorCollectionCustomReference
              name={props.name}
              description={props.description}
            />
          )

        case COLLECTIONS.POST:
          return <PostCollectionCustomReference title={props.title} />

        default:
          return _internalSys.path
      }
    },
  },
  collections: ['author', 'post'],
}

export default referenceField
