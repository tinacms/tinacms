import React from 'react'
import { AuthorProps } from '../tina/custom-component-reference-select/model'

const AuthorCollectionCustomReference: React.FC<AuthorProps> = ({
  name,
  description,
}: AuthorProps) => {
  return (
    <div className="flex items-center text-lg p-4 bg-gray-100 rounded-lg">
      <span className="mr-2">🚀</span>
      <div>
        <div className="font-semibold">{name}</div>
        <div>{description}</div>
      </div>
    </div>
  )
}

export default AuthorCollectionCustomReference
