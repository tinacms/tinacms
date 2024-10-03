import React from 'react'
import AuthorCollectionCustomReference from '../../component/custom-reference-select-author'
import PostCollectionCustomReference from '../../component/custom-reference-select-post'
import { type CollectionProps, COLLECTIONS, type InternalSys } from './model'
import { LocationEnum } from '../model/location-enum'

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
    //Static example - user can define which field and value they want to filter
    // collectionFilter: {
    //   author: {
    //     location: 'melbourne',
    //   },
    //   post: {
    //     title: 'hello world',
    //   },
    // },
    //Dynamic example - user can define the function they want here but need to make sure the return type match the schema
    // collectionFilter: () => {
    //   const url = new URL('https://bob-northwind-sydney.com')
    //   const hostname = url.hostname
    //
    //   let location: LocationEnum
    //   switch (hostname) {
    //     case 'bob-northwind-melbourne.com':
    //       location = LocationEnum.Melbourne
    //       break
    //     case 'bob-northwind-sydney.com':
    //       location = LocationEnum.Sydney
    //       break
    //     default:
    //       location = LocationEnum.Default
    //       break
    //   }
    //
    //   return {
    //     author: {
    //       location,
    //     },
    //   }
    // },
  },
  collections: ['author', 'post'],
}

export default referenceField
