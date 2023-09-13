import client from '@/tina/__generated__/client'

export default async function Page(props) {
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
  console.dir(node, { depth: null })
  // const res = await client.queries.sidebarConnection({
  //   filter: {
  //     type: { eq: props.params.type },
  //     version: { eq: props.params.version },
  //     locale: { eq: props.params.locale },
  //   },
  //   first: 1,
  // })
  // const node = res.data?.sidebarConnection?.edges?.at(0)?.node

  // if (!node) {
  //   throw new Error(
  //     `Expected to find sidebar for ${JSON.stringify(props.params)}`
  //   )
  // }

  return (
    <div className="w-full h-full bg-yellow-100">
      <div className="h-12 bg-orange-100 w-full"></div>
    </div>
  )
}
