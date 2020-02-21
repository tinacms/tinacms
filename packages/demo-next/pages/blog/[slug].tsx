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
import ReactMarkdown from 'react-markdown'
import { NextPage } from 'next'
import { MarkdownFile, useLocalMarkdownForm } from 'next-tinacms-markdown'
import {
  InlineForm,
  InlineTextField,
  InlineField,
  useInlineForm,
} from 'react-tinacms-inline'
import grayMatter from 'gray-matter'
import { Wysiwyg } from 'tinacms'
import Link from 'next/link'

const Post: NextPage<{ post: MarkdownFile }> = props => {
  console.log(props)
  const [post, form] = useLocalMarkdownForm(props.post, {
    fields: [
      { name: 'frontmatter.title', component: 'text' },
      { name: 'markdownBody', component: 'markdown' },
    ],
  })

  if (!form) return null

  return (
    <InlineForm form={form}>
      <nav>
        <Link as="/blog/apple" href="/blog/[slug]">
          <a>Apple</a>
        </Link>
        <Link as="/blog/banana" href="/blog/[slug]">
          <a>Banana</a>
        </Link>
        <Link as="/blog/cake" href="/blog/[slug]">
          <a>Cake</a>
        </Link>
      </nav>
      <article>
        <header>
          <EditToggle />
          <SaveButton />
          <ResetButton />
          <h1>
            <InlineTextField name="frontmatter.title" />
          </h1>
        </header>
        <InlineField name="markdownBody">
          {({ input, meta, status }) => {
            if (status === 'active') {
              return <Wysiwyg input={input} meta={meta} />
            }

            return <ReactMarkdown>{input.value}</ReactMarkdown>
          }}
        </InlineField>
      </article>
    </InlineForm>
  )
}

Post.getInitialProps = async function(ctx) {
  const { slug } = ctx.query
  const rawContent = await import(`../../data/blog/${slug}.md`)
  const { data: frontmatter = {}, content: markdownBody } = grayMatter(
    rawContent.default
  )

  return {
    post: {
      fileRelativePath: `data/blog/${slug}.md`,
      frontmatter,
      markdownBody,
    },
  }
}

export default Post

function EditToggle() {
  const { status, activate, deactivate } = useInlineForm()
  const editing = status === 'active'
  return (
    <button
      onClick={() => {
        if (editing) deactivate()
        else activate()
      }}
    >
      {editing ? 'Preview' : 'Edit'}
    </button>
  )
}

function SaveButton() {
  const { status, form } = useInlineForm()
  const editing = status === 'active'
  if (!editing) return null
  return (
    <button
      onClick={() => {
        form.finalForm.submit()
      }}
    >
      Save
    </button>
  )
}

function ResetButton() {
  const { status, form } = useInlineForm()
  const editing = status === 'active'
  if (!editing) return null
  return (
    <button
      onClick={() => {
        form.reset()
      }}
    >
      Reset
    </button>
  )
}
