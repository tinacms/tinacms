import Tina from '../.tina/components/TinaProvider'
import { useTina } from 'tinacms/dist/edit-state'
import { TinaMarkdown } from 'tinacms/dist/rich-text'

function Page() {
  const { isLoading, data } = useTina({
    query: `{
    posts(relativePath: "anotherPost.mdx") {
      body
    }
  }`,
    variables: {},
    data: { posts: { body: [] } },
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="prose m-12">
      <TinaMarkdown content={data.posts.body} />
    </div>
  )
}

function App() {
  return (
    <Tina>
      <Page />
    </Tina>
  )
}

export default App
