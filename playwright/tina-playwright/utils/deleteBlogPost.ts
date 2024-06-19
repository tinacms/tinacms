// deleteBlogPost.ts
import axios from "axios";

interface DeleteBlogPostResponse {
  data: {
    deleteDocument: {
      __typename: string;
    };
  };
}

const deleteBlogPost = async (
  collection: string,
  relativePath: string
): Promise<DeleteBlogPostResponse> => {
  const DELETE_DOCUMENT = `
    mutation DeleteDocument($collection: String!, $relativePath: String!) {
      deleteDocument(collection: $collection, relativePath: $relativePath) {
        __typename
      }
    }
  `;

  const response = await axios.post<DeleteBlogPostResponse>(
    "http://localhost:4001/graphql", // Replace with your GraphQL endpoint
    {
      query: DELETE_DOCUMENT,
      variables: { collection, relativePath },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export default deleteBlogPost;
