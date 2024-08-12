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
  const { data } = useTina({ ...props })
  const { heading, subtitle, body } = data.page

  return (
    <div data-tina-field={tinaField(data.page, 'body')}>
      <h1 data-test="heading">{heading}</h1>
      <div data-test="subtitle">{subtitle}</div>
      <hr />
      <div data-test="rich-text-body">
        <TinaMarkdown
          content={body}
          components={{
            component1: (props) => <div>{JSON.stringify(props)}</div>,
            component2: (props) => <div>{JSON.stringify(props)}</div>,
          }}
        />
      </div>
    </div>
  )
}
