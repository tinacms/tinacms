import React from 'react'
import { Author } from './author'

export const Authors = ({ data }) => {
  return (
    <div className="flex flex-wrap -m-4">
      {data.map((authorData) => {
        const author = authorData.node
        return <Author key={author.id} data={author} listMode={true} />
      })}
    </div>
  )
}
