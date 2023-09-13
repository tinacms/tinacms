import client from '@/tina/__generated__/client'

export default async function SidebarLayout(props) {
  const res = await client.queries.sidebarConnection({
    filter: {
      type: { eq: props.params.type },
      version: { eq: props.params.version },
      locale: { eq: props.params.locale },
    },
    first: 1,
  })
  const node = res.data?.sidebarConnection?.edges?.at(0)?.node

  if (!node) {
    throw new Error(
      `Expected to find sidebar for ${JSON.stringify(props.params)}`
    )
  }

  return (
    <>
      <div className="h-screen w-96 bg-blue-100">
        <ul>
          {node.links?.map((link) => {
            switch (link?.__typename) {
              case 'SidebarLinksLabel': {
                return <div>{link.title}</div>
              }
              case 'SidebarLinksPage': {
                return (
                  <>
                    <div>{link.reference?.title}</div>
                    {link.children?.map((child) => {
                      return <div>{child?.reference?.title}</div>
                    })}
                  </>
                )
              }
            }
          })}
        </ul>
      </div>
      {props.children}
    </>
  )
}
