import Tina from '../.tina/components/TinaProvider'
import { useTina } from 'tinacms/dist/edit-state'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { Prism } from 'tinacms/dist/rich-text/prism'

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
      {/* <pre>{JSON.stringify(data.posts.body, null, 2)}</pre> */}
      <TinaMarkdown
        content={data.posts.body}
        components={{ code_block: (props) => <Prism {...props} /> }}
      />
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
