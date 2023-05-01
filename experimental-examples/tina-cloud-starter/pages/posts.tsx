import { Container } from "../components/util/container";
import { Section } from "../components/util/section";
import { Posts } from "../components/posts";
import { client } from "../tina/__generated__/client";
import { Layout } from "../components/layout";
import { InferGetStaticPropsType } from "next";
import { useTina } from "tinacms/dist/react";

export default function HomePage(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  // const { data } = useTina(props);
  const { data } = props;
  const posts = data.postConnection.edges;

  return (
    <Layout rawData={data} data={data.global as any}>
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

export type PostsType = InferGetStaticPropsType<
  typeof getStaticProps
>["data"]["postConnection"]["edges"][number];
