// deleteBlogPost.ts
import { APIRequestContext } from "@playwright/test";

const DELETE_BLOGPOST = `
  mutation DeleteDocument($collection: String!, $relativePath: String!) {
    deleteDocument(collection: $collection, relativePath: $relativePath) {
      __typename
    }
  }
`;

const deleteBlogPost = async (
  apiContext: APIRequestContext,
  collection: string,
  relativePath: string
): Promise<void> => {
  await apiContext.post("/graphql", {
    data: {
      query: DELETE_BLOGPOST,
      variables: { collection, relativePath },
    },
  });
};

export default deleteBlogPost;
