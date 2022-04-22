import { Blocks } from "../components/blocks";
import { ExperimentalGetTinaClient } from "../.tina/__generated__/types";
import { useTina } from "tinacms/dist/edit-state";
import { Layout } from "../components/layout";
import { query, AsyncReturnType } from "../.tina/sdk";
import React from "react";

export default function HomePage(
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  const { data } = useTina(props);

  React.useEffect(() => {
    const run = async () => {
      const res = await query(({ posts, authorsConnection, global }) => ({
        p: posts({
          relativePath: "anotherPost.mdx",
          fields: {
            date: true,
          },
        }),
        a: authorsConnection({
          first: "",
          include: {
            favoritePost: {
              posts: {
                fields: {
                  date: true,
                },
              },
            },
          },
        }),
        g: global({
          relativePath: "index.json",
          // FIXME: this doesn't work, footer is an object and the addFields function doesn't
          // know what to do with that
          // fields: {
          //   footer: true,
          // },
        }),
        // a: c.authors({ relativePath: "pedro.md" }),
      }));
      console.log(res.query);
      console.log(res.data.a);
    };
    run();
  });
  // data.post.author;

  return (
    <Layout rawData={data} data={data.global}>
      <Blocks {...data.pages} />
    </Layout>
  );
}

export const getStaticProps = async ({ params }) => {
  return {
    props: await query((c) => ({
      global: c.global({ relativePath: "index.json" }),
      pages: c.pages({ relativePath: `${params.filename}.md` }),
      post: c.posts({ relativePath: "anotherPost.mdx" }),
    })),
  };
};

export const getStaticPaths = async () => {
  const client = ExperimentalGetTinaClient();
  const pagesListData = await client.pagesConnection();
  return {
    paths: pagesListData.data.pagesConnection.edges.map((page) => ({
      params: { filename: page.node._sys.filename },
    })),
    fallback: false,
  };
};
