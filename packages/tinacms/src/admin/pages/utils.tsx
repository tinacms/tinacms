import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const folderRegex = /^.*\/~\/*(.*)$/
export type CollectionFolder = {
  loading: boolean
  name: string
  fullyQualifiedName: string
  parentName: string
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
    const update = {
      name: match ? match[1] : '',
      fullyQualifiedName: match ? (match[1] ? `~/${match[1]}` : '~') : '',
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
