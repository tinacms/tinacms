import fs from 'fs'
import path from 'path'
import Link from 'next/link'

type CollectionItem = {
  name: string
  items: { name: string; href: string }[]
}

function readCollection(dirName: string, routeName: string, label: string) {
  const dirPath = path.join(process.cwd(), 'content', dirName)
  if (!fs.existsSync(dirPath)) return null
  try {
    const files = fs.readdirSync(dirPath)
      .filter((f) => /\.mdx?$/.test(f) || /\.json$/.test(f))
      .map((f) => ({ name: path.parse(f).name, href: `/${routeName}/${path.parse(f).name}` }))
    return files.length > 0 ? { name: label, items: files } : null
  } catch (err) {
    return null
  }
}

export default function Page() {
  const collections: Array<CollectionItem | null> = [
    readCollection('pages', 'page', 'Pages'),
    readCollection('post', 'post', 'Posts'),
    readCollection('ssg-posts', 'ssg-posts', 'SSG Posts'),
    readCollection('documentation', 'documentation', 'Documentation'),
    readCollection('authors', 'authors', 'Authors'),
  ]

  const validCollections = collections.filter(Boolean) as CollectionItem[]

  return (
    <main className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Tina Kitchen Sink</h1>
          <p className="text-xl text-gray-600">
            Comprehensive showcase of Tina CMS field types and content formats
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {validCollections.map((collection) => (
            <div key={collection.name} className="border border-gray-200 rounded-lg p-6 bg-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{collection.name}</h2>
              <ul className="space-y-2">
                {collection.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin CMS</h2>
            <p className="text-gray-600 mb-4">
              Edit content using the Tina visual CMS
            </p>
            <a
              href="/admin/index.html"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Admin CMS
            </a>
          </div>
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Formats</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>MDX - Rich text with components</li>
            <li>Markdown - Simple markdown content</li>
            <li>JSON - Structured data</li>
          </ul>
        </div>

        <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Field Types Showcase</h3>
          <p className="text-gray-700 mb-4">
            This app demonstrates all major Tina field types:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>String, Text, Number fields</li>
            <li>Boolean with custom labels</li>
            <li>Checkbox, Radio, Button Toggle groups</li>
            <li>Select, Tags, and custom options</li>
            <li>Image uploads</li>
            <li>Rich text with custom templates</li>
            <li>Object and reference fields</li>
            <li>Custom UI components</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
