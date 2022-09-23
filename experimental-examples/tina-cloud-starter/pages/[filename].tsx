import { Blocks } from "../components/blocks";
import { client } from "../.tina/__generated__/client";
import { useTina } from "tinacms/dist/react";
import { Layout } from "../components/layout";
import type { InferGetStaticPropsType } from "next";

export default function HomePage(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });
  return (
    <Layout rawData={data} data={data.global}>
      <Blocks {...data.pages} />
    </Layout>
  );
}

export const getStaticProps = async ({ params }) => {
  const tinaProps = await client.queries.ContentQuery({
    relativePath: `${params.filename}.md`,
  });
  return {
    props: tinaProps,
  };
};

export const getStaticPaths = async () => {
  const pagesListData = await client.queries.pagesConnection();
  return {
    paths: pagesListData.data.pagesConnection.edges.map((page) => ({
      params: { filename: page.node._sys.filename },
    })),
    fallback: false,
  };
};
