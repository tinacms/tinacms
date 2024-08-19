import React from 'react'
import CustomDisplayAuthorComponent from '../../component/custom-reference-select-author'
import CustomDisplayPostComponent from '../../component/custom-reference-select-post'

const referenceField = {
  label: 'Author',
  name: 'author',
  type: 'reference',
  ui: {
    //TODO: Update the docs so remind or suggest the user to use type safe ? maybe we can link the rules there
    selectComponents: (props, filepath: string) => {
      const { _collection, title, something } = props

      if (_collection === 'author') {
        console.log('props author', props)
        console.log('props author filename', filepath)

        return <CustomDisplayAuthorComponent something={something} />
      } else if (_collection === 'post') {
        console.log('props post', props)
        console.log('props post filename', filepath)

        return <CustomDisplayPostComponent title={title} />
      } else {
        return null // TODO: Handle null case
      }
    },
  },
  collections: ['author', 'post'],
}

export default referenceField
