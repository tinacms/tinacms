import { Container } from "../components/util/container";
import { Section } from "../components/util/section";
import { Posts } from "../components/posts";
import { client } from "../.tina/__generated__/client";
import { Layout } from "../components/layout";
import { useTina } from "tinacms/dist/react";

export default function HomePage(
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  // Still allow global form to be edited from this page
  const { data } = useTina(props);
  // dont need to use the useTina hook here since we cant edit lists
  const posts = data.postsConnection.edges;

  return (
    <Layout>
      <Section className="flex-1">
        <Container size="large" width="small">
          <Posts data={posts} />
        </Container>
      </Section>
    </Layout>
  );
}

export const getStaticProps = async () => {
  const tinaProps = await client.queries.pageQuery();
  return {
    props: {
      ...tinaProps,
    },
  };
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
