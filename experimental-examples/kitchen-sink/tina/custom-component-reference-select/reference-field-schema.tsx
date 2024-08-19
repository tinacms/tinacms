import React from 'react'
import CustomDisplayAuthorComponent from '../../component/custom-reference-select-author'
import CustomDisplayPostComponent from '../../component/custom-reference-select-post'
import { CollectionProps, COLLECTIONS } from './model'

const referenceField = {
  label: 'Author',
  name: 'author',
  type: 'reference',
  ui: {
    selectComponents: (props: CollectionProps, filepath: string) => {
      switch (props._collection) {
        case COLLECTIONS.AUTHOR:
          return (
            <CustomDisplayAuthorComponent
              name={props.name}
              description={props.description}
            />
          )

        case COLLECTIONS.POST:
          return <CustomDisplayPostComponent title={props.title} />

        default:
          return filepath
      }
    },
  },
  collections: ['author', 'post'],
}

export default referenceField
