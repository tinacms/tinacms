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
  const resp = await apiContext.post("/graphql", {
    data: {
      query: DELETE_DOCUMENT,
      variables: { collection, relativePath },
    },
  });

  if (!resp.ok()) {
    throw new Error(
      `GraphQL delete failed: ${resp.status()} ${await resp.text()}`
    );
  }
};

export default deleteDocument;
