import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { PageContent, PageOverview } from '@/tina/__generated__/types'
import { Layout } from '@/components/layout'
import { findPageOrOverview, findSidebarAncestry } from '@/lib'

export default async function Page({ params }: { params: { slug: string[] } }) {
  const page = await findPageOrOverview(params.slug || [])
  const sidebars = await findSidebarAncestry(params.slug || [])
  console.log(params)
  console.log(sidebars)

  switch (page.data.page.__typename) {
    case 'PageContent': {
      return (
        <Layout sidebars={sidebars} page={page.data.page}>
          <ContentPage {...page.data.page} />
        </Layout>
      )
    }
    case 'PageOverview': {
      return (
        <Layout sidebars={sidebars} page={page.data.page}>
          <OverviewPage {...page.data.page} />
        </Layout>
      )
    }
  }
}

const OverviewPage = (props: Omit<PageOverview, '_values' | '_sys'>) => {
  return (
    <article className="prose lg:prose-sm max-w-none m-auto">
      <TinaMarkdown components={{}} content={props.body} />
    </article>
  )
}

const ContentPage = (props: Omit<PageContent, '_values' | '_sys'>) => {
  return (
    <article className="prose lg:prose-sm max-w-none m-auto">
      <TinaMarkdown components={{}} content={props.body} />
    </article>
  )
}
