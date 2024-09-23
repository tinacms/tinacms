import React from 'react'
import AuthorCollectionCustomReference from '../../component/custom-reference-select-author'
import PostCollectionCustomReference from '../../component/custom-reference-select-post'
import { type CollectionProps, COLLECTIONS, type InternalSys } from './model'
import { customFilterAuthorReference as DynamicFilterAuthorFuction } from '../utils/author-location'

const referenceField = {
  label: 'Author',
  name: 'author',
  type: 'reference',
  ui: {
    optionComponent: (values: CollectionProps, s: InternalSys) => {
      switch (values._collection) {
        case COLLECTIONS.AUTHOR:
          return (
            <AuthorCollectionCustomReference
              name={values.name}
              description={values.description}
            />
          )

        case COLLECTIONS.POST:
          return <PostCollectionCustomReference title={values.title} />

        default:
          return s.path
      }
    },
    // collectionFilter: {
    //   author: {
    //     location: 'melbourne',
    //   },
    //   post: {
    //     title: 'hello world',
    //   },
    // },
    //TODO : Example of using dynamic function
    collectionFilter: DynamicFilterAuthorFuction,
  },
  collections: ['author', 'post'],
}

export default referenceField
