import { getStaticPropsForTina } from "tinacms";
import { Container } from "../components/container";
import { Section } from "../components/section";
import { Posts } from "../components/posts";
import { layoutQueryFragment } from "../components/layout";
import type { PostsConnection } from "../.tina/__generated__/types";
import { getSdk } from "../.tina/__generated__/types";

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
  const client = getSdk(async (doc, vars, options) => {
    // const res = await fetch("asdf");
    console.log({ doc, vars, options });
    return {} as any;
  });
  const bla = await client.Test();
  bla.getCollections.forEach((item) => {
    console.log(item.name);
  });
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
