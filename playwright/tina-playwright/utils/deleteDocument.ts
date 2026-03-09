// deleteDocument.ts
import { APIRequestContext } from "@playwright/test";

const DELETE_DOCUMENT = `
  mutation DeleteDocument($collection: String!, $relativePath: String!) {
    deleteDocument(collection: $collection, relativePath: $relativePath) {
      __typename
    }
  }
`;

const deleteDocument = async (
  apiContext: APIRequestContext,
  collection: string,
  relativePath: string
): Promise<void> => {
  await apiContext.post("/graphql", {
    data: {
      query: DELETE_DOCUMENT,
      variables: { collection, relativePath },
    },
  });
};

export default deleteDocument;
