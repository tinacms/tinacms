/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

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
