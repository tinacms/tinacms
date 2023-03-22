'use client'

import { Page } from './page'
import { useTina } from 'tinacms/dist/react'
import React from 'react'

export const ClientPage = ({ children, ...props }: any) => {
  const payload = useTina(props)

  if (payload.isClient) {
    return <Page {...payload.data} />
  }

  return children
}
