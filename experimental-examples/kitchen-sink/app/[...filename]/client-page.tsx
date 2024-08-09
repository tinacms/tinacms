'use client'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { tinaField, useTina } from 'tinacms/dist/react'
import { PageQuery } from '../../tina/__generated__/types'
import React from 'react'

interface ClientPageProps {
  query: string
  variables: {
    relativePath: string
  }
  data: { page: PageQuery['page'] }
}

export default function ClientPage(props: ClientPageProps) {
  //data passes though in production mode and data is updated to the sidebar data in edit-mode
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  const content = data.page.body
  return (
    <div data-tina-field={tinaField(data.page, 'body')}>
      <p>test</p>
      <TinaMarkdown content={content} />
    </div>
  )
}
