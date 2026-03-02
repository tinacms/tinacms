'use client'

import { useTina } from 'tinacms/dist/react'
import { Blocks } from '@/components/blocks'

interface ClientPageProps {
  data: any
  variables: any
  query: string
}

export default function ClientPage(props: ClientPageProps) {
  const { data } = useTina({ ...props })
  const page = data?.page

  if (!page) {
    return <div className="p-6 text-red-600">Error: No page data found</div>
  }

  return (
    <>
      {page.blocks && page.blocks.length > 0 ? (
        <Blocks blocks={page.blocks} />
      ) : (
        <div className="p-6 text-gray-600 dark:text-gray-400">No blocks to display</div>
      )}
    </>
  )
}
