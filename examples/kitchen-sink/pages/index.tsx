/**

*/

import { useCollections } from '../components/slideover'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const collections = useCollections()
  const collectionItems = [
    ...collections,
    {
      name: 'Admin',
      current: false,
      children: [{ name: 'Admin', href: '/admin/index.html' }],
    },
  ]
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg border bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0 max-w-5xl mx-auto">
      {collectionItems.map((collection, idx) => {
        if (collection.children?.length === 0) {
          return
        }
        return (
          <div
            key={collection.name}
            className={classNames(
              idx === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
              idx === 1 ? 'sm:rounded-tr-lg' : '',
              idx === collectionItems.length - 2 ? 'sm:rounded-bl-lg' : '',
              idx === collectionItems.length - 1
                ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none'
                : '',
              'relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500'
            )}
          >
            <div></div>
            <div className="mt-8">
              <h3 className="text-lg font-medium">
                <a
                  href={collection.children[0].href}
                  className="focus:outline-none capitalize"
                >
                  {/* Extend touch target to entire panel */}
                  <span className="absolute inset-0" aria-hidden="true" />
                  <span className="block text-gray-500 font-sm">
                    {collection.name}
                  </span>
                  {collection.children[0].name}
                </a>
              </h3>
            </div>
            <span
              className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              aria-hidden="true"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
              </svg>
            </span>
          </div>
        )
      })}
    </div>
  )
}
