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

import { useJsonForm } from 'next-tinacms-json'
import { useScreenPlugin, usePlugin } from 'tinacms'

import Layout from '../components/Layout'
import BlogList from '../components/BlogList'

function Component({ title }) {
  return <h1>{title}</h1>
}

function useGasPlugin(props, deps) {
  useScreenPlugin(
    {
      name: 'Some Heading',
      Icon: () => '',
      Component,
      props,
    },
    deps
  )
}

function Index(props) {
  const title = 'Example Screen'

  useGasPlugin({ title }, [title])
  const [data, form] = useJsonForm(props.jsonFile, formOptions)
  usePlugin(form)

  return (
    <Layout
      pathname="/"
      siteTitle={props.title}
      siteDescription={props.description}
    >
      <section>
        <BlogList data={data} />
      </section>
    </Layout>
  )
}

const formOptions = {
  label: 'Home Page',
  fields: [
    {
      label: 'Tags',
      name: 'tags',
      component: 'tags',
    },
    { label: 'Name', name: 'name', component: 'text' },
    {
      name: 'body',
      label: 'Home Page Content',
      component: 'markdown',
    },
  ],
  buttons: {
    save: 'capture',
    reset: 'discard',
  },
}

export default Index

Index.getInitialProps = async function() {
  const configData = await import(`../data/config.json`)
  const indexData = await import(`../data/index.json`)
  return {
    title: configData.title,
    description: configData.description,
    jsonFile: {
      fileRelativePath: `data/index.json`,
      data: indexData.default,
    },
  }
}
