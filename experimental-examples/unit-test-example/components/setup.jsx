import { getStaticPropsForTina } from 'tinacms'

export function Page(props) {
  return <pre>{JSON.stringify(props.data, null, 2)}</pre>
}

export const getStatic = async ({query, variables}) => {
  const tinaProps = await getStaticPropsForTina({
    query,
    variables,
  })

  return {
    props: {
      ...tinaProps,
    },
  }
}

