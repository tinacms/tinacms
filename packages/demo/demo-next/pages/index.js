import * as React from 'react'
import Link from 'next/link'
import { useCMSForm, useCMS } from '@tinacms/react-tinacms'
import { loadMarkdown } from '@tinacms/next-tinacms-markdown'
import * as yaml from 'js-yaml'

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
      label: 'Form',
      fields: [
        { name: 'frontmatter.title', component: 'text', label: 'Title' },
      ],
      onSubmit() {
        console.log('Hi')
      },
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

function useMarkdownForm(markdownRemark, formOverrrides) {
  let cms = useCMS()

  // let throttledOnChange = React.useMemo(() => {
  // return throttle(cms.api.git.onChange, 300)
  // }, [])

  let [values, form] = useCMSForm({
    name: markdownRemark.path,
    initialValues: markdownRemark,
    onSubmit(data) {
      // return cms.api.git.onSubmit({
      //   files: [data.path],
      //   message: data.__commit_message || 'xeditor commit',
      //   name: data.__commit_name,
      //   email: data.__commit_email,
      // })
    },
    ...formOverrrides,
  })

  React.useEffect(() => {
    if (!form) return
    return form.subscribe(
      formState => {
        cms.api.git.onChange({
          fileRelativePath: formState.values.path,
          content: toMarkdownString(formState.values),
        })
      },
      { values: true }
    )
  }, [form])

  return [markdownRemark, form]
}

function toMarkdownString(remark) {
  return (
    '---\n' + yaml.dump(remark.frontmatter) + '---\n' + (remark.content || '')
  )
}
