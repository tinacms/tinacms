import React from 'react'

const base = '../../../packages/@tinacms/mdx/src/tests/autotest/'
const markdownFiles = import.meta.glob(
  '../../../packages/@tinacms/mdx/src/tests/autotest/*.md',
  {
    as: 'raw',
  }
)

export const Sidebar = ({ setText }: { setText: (value: string) => void }) => {
  const [items, setItems] = React.useState<
    {
      name: string
      value: any
    }[]
  >([])

  React.useEffect(() => {
    const run = async () => {
      const items = await Promise.all(
        Object.entries(markdownFiles).map(async ([key, value]) => {
          return { name: key, value: await value() }
        })
      )
      setItems(items)
    }
    run()
  }, [])
  return (
    <div className="h-screen overflow-scroll">
      <ul>
        {items.map((item) => (
          <li key={item.name}>
            <button
              style={{ direction: 'rtl' }}
              className=" max-w-full text-left p-2 truncate"
              onClick={() => setText(item.value)}
            >
              {item.name.replace(base, '')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
