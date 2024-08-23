// CustomDisplayPostComponent.tsx
import React from 'react'
import { PostProps } from '../tina/custom-component-reference-select/model'

const PostCollectionCustomReference: React.FC<PostProps> = ({ title }) => {
  return (
    <div className="flex items-center text-lg p-2 bg-teal-100 rounded-lg">
      <span className="mr-2">📝</span>
      <span>{title}</span>
    </div>
  )
}

export default PostCollectionCustomReference
