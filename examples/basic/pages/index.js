import {
  staticRequest,
  sequential,
  resolveForm,
  useForm,
  useCMS,
  Form,
} from 'tinacms'
import { useState, useEffect } from 'react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { Layout } from '../components/Layout'
import { useTina, useEditState } from 'tinacms/dist/edit-state'

import schema, { enrichedSchema } from '../.tina/schema.ts'

const query = `{
  getPageDocument(relativePath: "home.mdx"){
    data{
      body
    }
  }
}`
const EditOnly = () => {
  const cms = useCMS()
  useEffect(() => {
    const run = async () => {
      const forms = []
      await sequential(schema.collections, async (col) => {
        const collection = enrichedSchema.getCollection(col.name)
        const templateInfo =
          enrichedSchema.getTemplatesForCollectable(collection)

        console.log({ collection: JSON.stringify(collection, null, 2) })
        // const asdf = enrichedSchema.getCollectionAndTemplateByFullPath(col.path)
        // console.log({ asdf })
        const form = await resolveForm({
          collection,
          basename: collection.name,
          schema: enrichedSchema,
          template: templateInfo.template,
        })
        const formReal = new Form(form)
        console.log({ formReal })
        forms.push(formReal)
      })
      forms.forEach((x) => {
        cms.forms.add(x)
      })
    }
    run()
  }, [])
  return <></>
}
export default function Home(props) {
  const { edit } = useEditState()
  // const { data } = useTina({
  //   query,
  //   variables: {},
  //   data: props.data,
  // })
  const data = props.data

  const content = data.getPageDocument.data.body
  return (
    <Layout>
      {edit && <EditOnly />}
      <TinaMarkdown content={content} />
    </Layout>
  )
}

export const getStaticProps = async () => {
  const variables = {}
  let data = {}
  try {
    data = await staticRequest({
      query,
      variables,
    })
  } catch {
    // swallow errors related to document creation
  }

  return {
    props: {
      query,
      variables,
      data,
      //myOtherProp: 'some-other-data',
    },
  }
}
