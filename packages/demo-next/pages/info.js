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

import matter from 'gray-matter'
import { useLocalMarkdownForm } from 'next-tinacms-markdown'
import ReactMarkdown from 'react-markdown'
import { useCMS } from 'tinacms'
import {
  InlineForm,
  InlineText,
  InlineImage,
  InlineGroup,
  InlineGroupControls,
  InlineTextarea,
} from 'react-tinacms-inline'
import { InlineWysiwyg } from 'react-tinacms-editor'
import { EditToggle, DiscardChanges } from './blocks'

import Layout from '../components/Layout'

function Info(props) {
  const cms = useCMS()
  const [data, form] = useLocalMarkdownForm(props.markdownFile, formOptions)

  return (
    <InlineForm form={form}>
      <Layout siteTitle={props.title} siteDescription={props.description}>
        <section>
          <div>
            <button
              onClick={() => cms.alerts.info(`This is some info ${new Date()}`)}
            >
              Info
            </button>
            <button
              onClick={() => cms.alerts.success(`Hoorayyyy ${new Date()}`)}
            >
              Success
            </button>
            <button
              onClick={() =>
                cms.alerts.warn(
                  `You really shouldnt do that friend ${new Date()}`
                )
              }
            >
              Warn
            </button>
            <button
              onClick={() =>
                cms.alerts.error(`Everything went wrong ${new Date()}`)
              }
            >
              Error
            </button>
          </div>
          <EditToggle />
          <DiscardChanges />
          <div className="group">
            <InlineGroup
              name="frontmatter"
              fields={[
                { label: 'Name', name: 'name', component: 'text' },
                { label: 'Hometown', name: 'hometown', component: 'text' },
              ]}
            >
              <h1>
                <InlineText focusRing={false} name="name" />
              </h1>
              <p>
                <InlineText focusRing={false} name="hometown" />
              </p>
              <aside>Group with fields, name provided</aside>
            </InlineGroup>
          </div>
          <div className="group">
            <InlineGroup controls={false}>
              <InlineGroupControls offset={10} borderRadius={5}>
                <InlineImage
                  name="frontmatter.image"
                  previewSrc={formValues => {
                    return formValues.frontmatter.image
                  }}
                  uploadDir={() => '/public/images/'}
                  parse={filename => `/images/${filename}`}
                  focusRing={false}
                />
                <InlineWysiwyg name="markdownBody">
                  <ReactMarkdown>{data.markdownBody}</ReactMarkdown>
                </InlineWysiwyg>
                <aside>
                  Group sources from the root, no fields, controls = false
                </aside>
              </InlineGroupControls>
            </InlineGroup>
          </div>
          <div className="group">
            <InlineGroup controls={false}>
              <p>
                <InlineTextarea
                  focusRing={false}
                  name="frontmatter.description"
                />
              </p>
              <aside>
                Group without inline controls, to test style consistency
              </aside>
            </InlineGroup>
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
              text-align: center;
              padding: 3rem;
              margin-top: 4rem;
            }

            div.group {
              margin-top: 2rem;
              padding: 1rem;
            }
          `}
        </style>
      </Layout>
    </InlineForm>
  )
}

const formOptions = {
  label: 'Home Page',
  fields: [
    { label: 'Name', name: 'frontmatter.name', component: 'text' },
    {
      name: 'markdownBody',
      label: 'Home Page Content',
      component: 'markdown',
    },
  ],
}

export default Info
// const EditableInfo = markdownForm(Info, formOptions)
// export default EditableInfo

Info.getInitialProps = async function() {
  const configData = await import(`../data/config.json`)
  const infoData = await import(`../data/info.md`)
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
