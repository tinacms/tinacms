import { Container } from '../components/util/container'
import { Section } from '../components/util/section'
import { Authors } from '../components/authors'
import { Layout } from '../components/layout'
import databaseClient from '../tina/__generated__/databaseClient'

export default function AuthorsPage(
  props: AsyncReturnType<typeof getStaticProps>['props']
) {
  const authors = props.data.authorConnection.edges

  return (
    <Layout>
      <Section className="flex-1">
        <Container size="large" width="small">
          <Authors data={authors} />
        </Container>
      </Section>
    </Layout>
  )
}

export const getStaticProps = async () => {
  const tinaProps = await databaseClient.queries.authorConnection({
    first: 1000,
  })
  return {
    props: {
      ...tinaProps,
    },
  }
}

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any
