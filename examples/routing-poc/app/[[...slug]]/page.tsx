import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { PageOverview } from '@/tina/__generated__/types'
import { Layout } from '@/components/layout'
import { findPageOrOverview, findSidebarAncestry } from '@/lib'

export default async function Page({ params }: { params: { slug: string[] } }) {
  const page = await findPageOrOverview(params.slug || [])
  const sidebars = await findSidebarAncestry(params.slug || [])
  sidebars.map((s) => {
    console.log(s.data.page.id)
  })

  switch (page.data.page.__typename) {
    case 'PageContent': {
      return (
        <Layout sidebars={sidebars}>
          <div>Page content</div>
        </Layout>
      )
    }
    case 'PageOverview': {
      return (
        <Layout sidebars={sidebars}>
          <OverviewPage {...page.data.page} />
        </Layout>
      )
    }
  }
}

const OverviewPage = (props: Omit<PageOverview, '_values' | '_sys'>) => {
  return (
    <article className="prose lg:prose-sm m-auto">
      <TinaMarkdown components={{}} content={props.body} />
    </article>
  )
}
