import React from 'react'
import matter from 'gray-matter'
import Link from 'next/link'

export default class PostIndex extends React.Component {
  static async getInitialProps() {
    return { posts: loadMarkdown(loadPosts()) }
  }
  render() {
    return (
      <>
        <h1>Posts</h1>
        {this.props.posts.map(({ document: { data }, slug, filename }) => (
          <Link href={{ pathname: '/post', query: { id: slug } }} key={slug}>
            <h2>
              {data.title}
              <small>{filename}</small>
            </h2>
          </Link>
        ))}
      </>
    )
  }
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
      document,
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
