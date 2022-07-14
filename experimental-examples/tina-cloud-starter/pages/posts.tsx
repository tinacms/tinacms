import { Container } from "../components/container";
import { Section } from "../components/section";
import { Posts } from "../components/posts";
import { client } from "../.tina/__generated__/client";
import { Layout } from "../components/layout";

export default function HomePage(
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  const posts = props.data.postsConnection.edges;

  return (
    <Layout>
      <Section className="flex-1">
        <Container size="large">
          <Posts data={posts} />
        </Container>
      </Section>
    </Layout>
  );
}

export const getStaticProps = async () => {
  const tinaProps = await client.queries.PageQuery();
  return {
    props: {
      ...tinaProps,
    },
  };
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
