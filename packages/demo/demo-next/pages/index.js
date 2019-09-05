import * as React from 'react'
import Link from 'next/link'
import { loadMarkdown, useMarkdownForm } from '@tinacms/next-tinacms-markdown'

export default function PostIndex() {
  let posts = loadMarkdown(loadPosts())

  return (
    <>
      <h1>Posts</h1>
      {posts.map(props => (
        <PostLink {...props} />
      ))}
    </>
  )
}

function PostLink({ document, slug, filename }) {
  let [post] = useMarkdownForm(
    { ...document, path: filename },
    {
      fields: [
        { name: 'frontmatter.title', component: 'text', label: 'Title' },
      ],
    }
  )

  return (
    <Link href={{ pathname: '/post', query: { id: slug } }} key={slug}>
      <h2>{post.frontmatter.title}</h2>
    </Link>
  )
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
