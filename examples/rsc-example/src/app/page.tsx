import { ClientPage } from '@/components/app/client-page'
import { Page } from '@/components/app/page'
import { client } from '../../.tina/__generated__/client'

async function getData() {
  const res = await client.queries.page({ relativePath: 'home.md' })
  if (!res.data) {
    throw new Error('Failed to fetch data')
  }

  return res
}

export default async function Home() {
  const res = await getData()

  return (
    <ClientPage {...res}>
      <Page {...res.data} />
    </ClientPage>
  )
}
