import fs from 'fs'
import path from 'path'
import Slideover from '../components/slideover'

type CollectionItem = {
  name: string
  current?: boolean
  children: { name: string; href: string }[]
}

function readCollection(dirName: string, routeName: string, label: string) {
  const dirPath = path.join(process.cwd(), 'examples', 'next', 'kitchen-sink', 'content', dirName)
  if (!fs.existsSync(dirPath)) return null
  try {
    const files = fs.readdirSync(dirPath)
      .filter((f) => /\.mdx?$/.test(f))
      .map((f) => ({ name: path.parse(f).name, href: `/${routeName}/${path.parse(f).name}` }))
    return { name: label, children: files }
  } catch (err) {
    return null
  }
}

export default function Page() {
  const rawCollections: Array<CollectionItem | null> = [
    readCollection('pages', 'page', 'Page'),
    readCollection('post', 'post', 'Post'),
    readCollection('documentation', 'documentation', 'Documentation'),
    readCollection('ssg-posts', 'ssg-posts', 'SSG Post'),
  ]

  const collections = rawCollections.filter(Boolean) as CollectionItem[]

  const collectionItems = [
    ...collections,
    { name: 'Admin', current: false, children: [{ name: 'Admin', href: '/admin/index.html' }] },
  ]

  return (
    <main className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <Slideover collections={collectionItems} />
      </div>
    </main>
  )
}
