import * as React from 'react'
import matter from 'gray-matter'
import { usePlugin } from 'tinacms'
import { useMarkdownForm } from 'next-tinacms-markdown'
import Layout from '../components/Layout'
import {
  InlineForm,
  InlineText,
  InlineTextarea,
  useFieldRef,
} from 'react-tinacms-inline'

const formOptions = {
  id: 'ref-demo',
  label: 'Ref Demo',
  fields: [
    {
      name: 'frontmatter.title',
      label: 'Title',
      component: 'text',
      inlineComponent: InlineText,
    },
    {
      name: 'frontmatter.subtitle',
      label: 'Subtitle',
      component: 'text',
      inlineComponent: ({ name }) => (
        <h2>
          <InlineText name={name} />
        </h2>
      ),
    },
    {
      name: 'frontmatter.description',
      label: 'Description',
      component: 'textarea',
      inlineComponent: InlineTextarea,
    },
  ],
}

function RefDemo(props) {
  const [data, form] = useMarkdownForm(props.markdownFile, formOptions)
  usePlugin(form)
  return (
    <InlineForm form={form}>
      {() => {
        const inlineTextRef = useFieldRef('frontmatter.title')
        const customInlineTextRef = useFieldRef('frontmatter.subtitle')
        const contentEditableRef = useFieldRef('frontmatter.description')
        return (
          <Layout>
            <section>
              <label>useFieldRef with a registered InlineText field</label>
              <hr />
              <h1 ref={inlineTextRef}>{data.frontmatter.title}</h1>
            </section>
            <hr />
            <hr />
            <section>
              <label>
                useFieldRef with a custom component that uses InlineText
              </label>
              <hr />
              <h2 ref={customInlineTextRef}>{data.frontmatter.subtitle}</h2>
            </section>
            <hr />
            <hr />
            <section>
              <label>useContentEditableRef</label>
              <hr />
              <div ref={contentEditableRef}>{data.frontmatter.description}</div>
            </section>
          </Layout>
        )
      }}
    </InlineForm>
  )
}

RefDemo.getInitialProps = async function() {
  const configData = await import(`../data/config.json`)
  const infoData = await import(`../data/ref-demo.md`)
  const data = matter(infoData.default)

  return {
    title: configData.title,
    description: configData.description,
    markdownFile: {
      fileRelativePath: `data/info.md`,
      frontmatter: data.data,
      markdownBody: data.content,
    },
  }
}

export default RefDemo
