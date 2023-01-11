/**

Copyright 2021 Forestry.io Holdings, Inc.

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
import { useForm, usePlugin, ActionButton } from '@einsteinindustries/tinacms'
import {
  InlineForm,
  InlineGroup,
  InlineText,
  InlineTextarea,
  InlineBlocks,
  BlocksControls,
} from '@einsteinindustries/react-tinacms-inline'
import { TinaIcon } from '@einsteinindustries/tinacms-icons'
import styled from 'styled-components'

import Layout from '../components/Layout'

const TestAction = () => {
  return (
    <ActionButton
      onClick={() => {
        alert('nailed it')
      }}
    >
      Test Action
    </ActionButton>
  )
}

const AnotherAction = () => {
  return (
    <ActionButton
      onClick={() => {
        alert('nailed it')
      }}
    >
      Another Action
    </ActionButton>
  )
}

export default function Nesting() {
  const [values, form] = useForm({
    id: 'nesting-example',
    initialValues: {
      hero: {
        title: 'Nesting Example',
        description:
          'This page has a bunch of examples of inline fields in various states of being nested.',
      },
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
    fields: [
      {
        name: 'toggle',
        component: 'toggle',
        toggleLabels: true,
      },
    ],
    actions: [TestAction, AnotherAction],
    onSubmit() {},
  })

  /**
   * To test data in the browser
   */
  console.log('NESTING', values)
  usePlugin(form)

  return (
    <Layout>
      <InlineForm form={form}>
        <section>
          {/* Grouped Top-Level Field */}
          <div className="group">
            <InlineGroup
              name="hero"
              fields={[
                { name: 'description', component: 'textarea' },
                { name: 'toggle', component: 'toggle' },
              ]}
            >
              <h1>
                <InlineTextarea name="title" focusRing={false} />
              </h1>
              <p>{values.hero.description}</p>
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
              focusRing={{
                offset: {
                  x: 18,
                  y: 32,
                },
                borderRadius: 10,
              }}
              insetControls={true}
            >
              <h2>Author</h2>
              <InlineText name="name" focusRing={false} />
              <p>{values.author.description}</p>
              <InlineBlocks name="colors" blocks={COLORS} />
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
        <BlocksControls index={index} focusRing={{ offset: 8 }}>
          <div className="post">
            <h3>
              <InlineTextarea name="title" />
            </h3>
            {data.summary && <p>{data.summary}</p>}
          </div>
          <style jsx>{`
            h3:last-child {
              margin-bottom: 0;
            }
            p {
              margin-bottom: 0;
            }
            div.post {
              padding: 0.5rem 0;
              width: 100%;
            }
          `}</style>
        </BlocksControls>
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
      fields: [
        { name: 'color', component: 'color' },
        { name: 'toggle', component: 'toggle' },
      ],
      defaultItem: {
        name: 'Red',
        color: 'fff',
      },
    },
    Component({ index, data }) {
      return (
        <BlocksControls
          index={index}
          customActions={[
            {
              icon: <TinaIcon />,
              onClick: () => alert('Hello from a custom Block Action!'),
            },
          ]}
        >
          <InlineTextarea name="name" />
          <p>{data.color}</p>
        </BlocksControls>
      )
    },
  },
}

/**
 * Outlined the columns pink and rows green for now
 * so we can get a better visual of the grid.
 */

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
      <BlocksControls index={index}>
        <BlockPadding>
          <InlineBlocksRow
            name="items"
            blocks={{ col: COL, heading: HEADING, paragraph: PARAGRAPH }}
            direction="horizontal"
          />
        </BlockPadding>
      </BlocksControls>
    )
  },
}

const BlockPadding = styled.div`
  padding: 0.5rem 0;
`

const InlineBlocksRow = styled(InlineBlocks)`
  background: lightpink;
  margin: 0;
  display: flex;
  flex-direction: row;
`

const InlineBlocksColumn = styled(InlineBlocks)`
  background: lightgreen;
  margin: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
`

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
      <>
        <BlocksControls
          index={index}
          focusRing={{ offset: { x: -8, y: 10 }, borderRadius: 0 }}
        >
          <div className="col">
            <InlineBlocks
              name="items"
              blocks={{ row: ROW, heading: HEADING, paragraph: PARAGRAPH }}
            />
          </div>
        </BlocksControls>
        <style jsx>
          {`
            div.col {
              background: lightgreen;
              margin: 0 1rem;
              display: flex;
              flex-direction: column;
              height: 100%;
            }
          `}
        </style>
      </>
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
      <>
        <BlocksControls index={index}>
          <h3 className="block-heading">
            <InlineTextarea name="text" focusRing={false} />
          </h3>
        </BlocksControls>
        <style jsx>
          {`
            h3.block-heading {
              color: ${data.color};
              padding: 0.5rem 0;
            }
          `}
        </style>
      </>
    )
  },
}

const PARAGRAPH = {
  template: {
    type: 'paragraph',
    label: 'Paragraph',
    defaultItem: {
      text: 'New Paragraph',
    },
    fields: [],
  },
  Component({ index, data }) {
    return (
      <>
        <BlocksControls index={index}>
          <p className="block-paragraph">
            <InlineTextarea name="text" focusRing={false} />
          </p>
        </BlocksControls>
        <style jsx>
          {`
            p {
              padding: 0.5rem 0;
            }
          `}
        </style>
      </>
    )
  },
}

const PAGE_BUILDER = {
  row: ROW,
}
