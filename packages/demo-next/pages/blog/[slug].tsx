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
  InlineText,
  InlineField,
  useInlineForm,
} from 'react-tinacms-inline'
import grayMatter from 'gray-matter'
import { useCMS } from 'tinacms'
import { Wysiwyg } from 'react-tinacms-editor'
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
  const cms = useCMS()

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
          <SaveButton />
          <ResetButton />
          <h1>
            <InlineText name="frontmatter.title" />
          </h1>
        </header>
        <InlineField name="markdownBody">
          {({ input }) => {
            if (cms.enabled) {
              return <Wysiwyg input={input} />
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

function SaveButton() {
  const cms = useCMS()
  const { form } = useInlineForm()
  if (cms.disabled) return null
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
  const { form } = useInlineForm()
  const cms = useCMS()
  if (cms.disabled) return null
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
