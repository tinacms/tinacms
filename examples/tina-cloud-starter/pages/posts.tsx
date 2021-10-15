import { getStaticPropsForTina, TinaGQLClient } from "tinacms";
import { Container } from "../components/container";
import { Section } from "../components/section";
import { Posts } from "../components/posts";
import { layoutQueryFragment } from "../components/layout";
import type { PostsConnection } from "../.tina/__generated__/types";
import { getTinaClient } from "../.tina/__generated__/types";

export default function HomePage(
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  const posts = props.data.getPostsList.edges;

  return (
    <Section className="flex-1">
      <Container size="large">
        <Posts data={posts} />
      </Container>
    </Section>
  );
}

export const getStaticProps = async () => {
  const test = new TinaGQLClient();

  test
    .getAuthorDocument({ relativePath: "Pedro.md" })
    .gePostsDocument({ relativePath: "VoteForPedro.md" });

  console.log(test.query);
  // const client = getTinaClient();

  // const data = await client.GetPost({path});

  // data.getGlobalDocument.data;

  // console.log({ data: data.getGlobalDocument.data });

  // const globalData = await client.userQueries.getPostsLogan

  const tinaProps = (await getStaticPropsForTina({
    query: `#graphql
      query PageQuery {
        ${layoutQueryFragment}
        getPostsList {
          edges {
            node {
              id
              values
              data {
                author {
                  ... on AuthorsDocument {
                    data {
                      name
                      avatar
                    }
                  }
                }
              }
              sys {
                filename
              }
            }
          }
        }
      }
    `,
    variables: {},
  })) as { data: { getPostsList: PostsConnection } };

  return {
    props: {
      ...tinaProps,
    },
  };
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
