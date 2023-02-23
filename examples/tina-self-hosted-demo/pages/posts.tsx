import { Container } from '../components/util/container'
import { Section } from '../components/util/section'
import { Posts } from '../components/posts'
import { Layout } from '../components/layout'
import { dbConnection } from '../lib/databaseConnection'

export default function HomePage(
  props: AsyncReturnType<typeof getStaticProps>['props']
) {
  const posts = props.data.postConnection.edges

  return (
    <Layout>
      <Section className="flex-1">
        <Container size="large" width="small">
          <Posts data={posts} />
        </Container>
      </Section>
    </Layout>
  )
}

export const getStaticProps = async () => {
  const tinaProps = await dbConnection.queries.pageQuery()
  return {
    props: {
      ...tinaProps,
    },
  }
}

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any
