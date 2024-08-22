import React from 'react'
import AuthorCollectionCustomReference from '../../component/custom-reference-select-author'
import PostCollectionCustomReference from '../../component/custom-reference-select-post'
import { CollectionProps, COLLECTIONS } from './model'

const referenceField = {
  label: 'Author',
  name: 'author',
  type: 'reference',
  ui: {
    optionComponents: (props: CollectionProps, filepath: string) => {
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
          return filepath
      }
    },
  },
  collections: ['author', 'post'],
}

export default referenceField
