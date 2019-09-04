import * as React from 'react'
import matter from 'gray-matter'
import Link from 'next/link'
import { useCMSForm } from '@tinacms/react-tinacms'

export default function PostIndex() {
  let posts = loadMarkdown(loadPosts())
  return (
    <>
      <h1>Posts</h1>
      <HookExample />
      {posts.map(props => (
        <PostLink {...props} />
      ))}
    </>
  )
}

const HookExample = () => {
  React.useEffect(() => console.log('test'))
  return null
}

function PostLink({ document, slug, filename }) {
  let [post] = useCMSForm({
    initialValues: document,
    label: 'Form',
    fields: [{ name: 'frontmatter.title', component: 'text', label: 'Title' }],
    onSubmit() {
      console.log('Hi')
    },
  })

  return (
    <Link href={{ pathname: '/post', query: { id: slug } }} key={slug}>
      <h2>
        {post.frontmatter.title}
        <small>{filename}</small>
      </h2>
    </Link>
  )
}
/**
 * Parses markdown files retrieved via webpack context.
 *
 * TODO: Some form of this could be generic.
 */
function loadMarkdown({ ctx, path }) {
  // Get posts from folder
  const filenames = ctx.keys()
  const files = filenames.map(ctx)

  return filenames.map((filename, index) => {
    const slug = slugify(filename)
    const document = matter(files[index])
    return {
      filename: `${path}/${filename.replace('./', '')}`,
      document: {
        content: document.content,
        frontmatter: document.data,
      },
      slug,
    }
  })
}

/**
 * Loads markdown files from the `posts` directory.
 *
 * This is an example of a user-defined function. It cannot be more generic
 * because the path _must_ be inlined in the `require.context`.
 *
 * The filenames are relative to `../posts`, so we have to include the root
 * information.
 */
function loadPosts() {
  return {
    path: 'posts',
    ctx: require.context('../posts', true, /\.md$/),
  }
}

/**
 * Generates a slug based on the filename
 */
function slugify(filename) {
  return filename
    .replace(/^.*[\\\/]/, '')
    .split('.')
    .slice(0, -1)
    .join('.')
}
