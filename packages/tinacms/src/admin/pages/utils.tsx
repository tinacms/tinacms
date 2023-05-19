import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const folderRegex = /^.*\/~\/*(.*)$/
export type CollectionFolder = {
  loading: boolean
  name: string
  fullyQualifiedName: string
  parentName: string
}

export const parentFolder = (folder: CollectionFolder) => {
  return {
    ...folder,
    name: folder.name.split('/').slice(0, -1).join('/'),
    fullyQualifiedName: folder.fullyQualifiedName
      .split('/')
      .slice(0, -1)
      .join('/'),
    parentName: folder.parentName.split('/').slice(0, -1).join('/'),
  }
}
export const useCollectionFolder = () => {
  const [folder, setFolder] = useState<CollectionFolder>({
    loading: true,
    name: '',
    fullyQualifiedName: '',
    parentName: '',
  })

  const loc = useLocation()
  useEffect(() => {
    // set folder using the pathname
    const match = loc.pathname.match(folderRegex)
    const folderName = match ? decodeURIComponent(match[1]) : ''
    const update = {
      name: folderName,
      fullyQualifiedName: match ? (folderName ? `~/${folderName}` : '~') : '',
      loading: false,
      parentName: '',
    }

    if (update.fullyQualifiedName) {
      const pathParts = update.fullyQualifiedName.split('/')
      update.parentName = `/${pathParts
        .slice(0, pathParts.length - 1)
        .join('/')}`
    }

    setFolder({
      ...folder,
      ...update,
    })
  }, [loc])

  return folder
}
