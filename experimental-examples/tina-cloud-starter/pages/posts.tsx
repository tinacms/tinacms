import { Container } from "../components/container";
import { Section } from "../components/section";
import { Posts } from "../components/posts";
import { client } from "../.tina/__generated__/client";
import { Layout } from "../components/layout";
import { InferGetStaticPropsType } from "next";

export default function HomePage(
  props: InferGetStaticPropsType<typeof getStaticProps>
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
    props: tinaProps,
  };
};
