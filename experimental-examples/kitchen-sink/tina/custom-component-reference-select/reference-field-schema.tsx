import React from 'react'

const referenceField = {
  label: 'Author',
  name: 'author',
  type: 'reference',
  ui: {
    selectComponents: (props) => (
      console.log('props', props),
      (
        <>
          <div>🚀🚀</div>
        </>
      )
    ),
  },
  collections: ['author', 'post'],
}

export default referenceField
