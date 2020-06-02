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
import { useForm } from 'tinacms'
import {
  InlineForm,
  InlineGroup,
  InlineGroupControls,
  InlineText,
  InlineTextarea,
  InlineBlocks,
  BlocksControls,
} from 'react-tinacms-inline'

import Layout from '../components/Layout'

export default function Nesting() {
  const [values, form] = useForm({
    id: 'nesting-example',
    initialValues: {
      title: 'Nesting Example',
      description:
        'This page has a bunch of examples of inline fields in various states of being nested.',
      author: {
        name: 'Nolan',
        description: 'He likes coding in the sun',
        colors: [{ _template: 'color', name: 'Red', color: 'fff' }],
      },
      posts: [
        { _template: 'post', title: 'Post #1' },
        { _template: 'post', title: 'Post #2' },
      ],
      builder: [
        {
          _template: 'row',
          items: [
            {
              _template: 'col',
              items: [
                {
                  _template: 'heading',
                  text: 'A Page Builder',
                  color: 'green',
                },
              ],
            },
            {
              _template: 'col',
              items: [
                {
                  _template: 'paragraph',
                  text: 'This is a paragraph in my page builder',
                },
              ],
            },
          ],
        },
        { _template: 'row', items: [] },
      ],
    },
    label: 'Nesting',
    fields: [],
    onSubmit() {},
  })
  console.log('NESTING', values)
  return (
    <Layout>
      <InlineForm form={form} initialStatus="active">
        <section>
          {/* Grouped Top-Level Field */}
          <div className="group">
            <InlineGroup
              fields={[{ name: 'description', component: 'textarea' }]}
            >
              <InlineGroupControls>
                <h1>
                  <InlineTextarea name="title" focusRing={false} />
                </h1>
                <p>{values.description}</p>
              </InlineGroupControls>
            </InlineGroup>
          </div>

          {/* Grouped Fields */}
          <div className="group">
            <InlineGroup
              name="author"
              fields={[
                { name: 'description', component: 'textarea' },
                {
                  name: 'colors',
                  component: 'blocks',
                  // @ts-ignore
                  templates: { color: COLORS.color.template },
                },
              ]}
            >
              <InlineGroupControls>
                <h2>Author</h2>
                <InlineText name="name" focusRing={false} />
                <p>{values.author.description}</p>
                <InlineBlocks name="colors" blocks={COLORS} />
              </InlineGroupControls>
            </InlineGroup>
          </div>

          <div className="group">
            <h2>Posts</h2>
            <InlineBlocks name="posts" blocks={POSTS} />
          </div>

          <div className="group">
            <h2>Page Builder</h2>
            <InlineBlocks name="builder" blocks={PAGE_BUILDER} />
          </div>
        </section>
        <style jsx>
          {`
            section {
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              flex-direction: column;
              padding: 3rem;
            }

            div.group {
              margin-top: 2rem;
              padding: 1rem;
              width: 100%;
              border-bottom: 1px solid #ebebeb;
            }
          `}
        </style>
      </InlineForm>
    </Layout>
  )
}

const POSTS = {
  post: {
    template: {
      type: 'post',
      label: 'Post',
      fields: [{ name: 'summary', component: 'textarea' }],
      defaultItem: {
        title: 'Post #?',
        sumary: 'A new post summary.',
      },
    },
    Component({ index, data }) {
      return (
        <div className="post">
          <BlocksControls index={index}>
            <h3>
              <InlineTextarea name="title" />
            </h3>
            <p>{data.summary}</p>
          </BlocksControls>
          <style jsx>{`
            div.post {
              margin: 2rem 0;
              width: 100%;
            }
          `}</style>
        </div>
      )
    },
  },
}

const COLORS = {
  color: {
    template: {
      type: 'color',
      label: 'Color',
      itemProps: item => ({
        label: `${item.name} – ${item.color}`,
      }),
      fields: [{ name: 'color', component: 'color' }],
      defaultItem: {
        name: 'Red',
        color: 'fff',
      },
    },
    Component({ index, data }) {
      return (
        <BlocksControls index={index}>
          <InlineTextarea name="name" />
          <p>{data.color}</p>
        </BlocksControls>
      )
    },
  },
}

const ROW = {
  template: {
    type: 'row',
    label: 'Row',
    defaultItem: {
      items: [],
    },
    fields: [],
  },
  Component({ index, data }) {
    return (
      <div className="row">
        <BlocksControls index={index}>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <InlineBlocks
              name="items"
              blocks={{ col: COL, heading: HEADING, paragraph: PARAGRAPH }}
            />
          </div>
        </BlocksControls>
      </div>
    )
  },
}

const COL = {
  template: {
    type: 'col',
    label: 'Col',
    defaultItem: {
      items: [],
    },
    fields: [],
  },
  Component({ index, data }) {
    return (
      <BlocksControls index={index}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <InlineBlocks
            name="items"
            blocks={{ row: ROW, heading: HEADING, paragraph: PARAGRAPH }}
          />
        </div>
      </BlocksControls>
    )
  },
}

const HEADING = {
  template: {
    type: 'heading',
    label: 'Heading',
    defaultItem: {
      text: 'New Heading',
      color: 'black',
    },
    fields: [{ name: 'color', component: 'color' }],
  },
  Component({ index, data }) {
    return (
      <BlocksControls index={index}>
        <h3 style={{ color: data.color }}>
          <InlineTextarea name="text" />
        </h3>
      </BlocksControls>
    )
  },
}

const PARAGRAPH = {
  template: {
    type: 'heading',
    label: 'Heading',
    defaultItem: {
      text: 'New Paragraph',
      color: 'black',
    },
    fields: [],
  },
  Component({ index, data }) {
    return (
      <BlocksControls index={index}>
        <p>
          <InlineTextarea name="text" />
        </p>
      </BlocksControls>
    )
  },
}

const PAGE_BUILDER = {
  row: ROW,
}
