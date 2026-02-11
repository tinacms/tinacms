import fs from 'fs'
import path from 'path'
import Slideover from '../components/slideover'

type CollectionItem = {
  name: string
  current?: boolean
  children: { name: string; href: string }[]
}

function readCollection(dirName: string, routeName: string, label: string) {
  const exampleSubPath = path.join('examples', 'next', 'kitchen-sink')
  const base = process.cwd().includes(exampleSubPath) ? process.cwd() : path.join(process.cwd(), exampleSubPath)
  const dirPath = path.join(base, 'content', dirName)
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
    readCollection('pages', 'page', 'Home'),
    readCollection('post', 'post', 'Large-File'),
    readCollection('ssg-posts', 'ssg-posts', 'SSG-Posts'),
    readCollection('documentation', 'documentation', 'Intro to Tina'),
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
