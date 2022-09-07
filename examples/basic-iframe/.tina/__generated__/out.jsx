// .tina/schema.js
import { defineSchema, defineConfig } from "tinacms";
var schema = defineSchema({
  collections: [
    {
      name: "test",
      path: "content/test",
      label: "Test",
      templates: [
        {
          name: "tem1",
          label: "Template 1",
          fields: [{ type: "string", name: "foo" }]
        },
        {
          name: "tem2",
          label: "Template 2",
          fields: [{ type: "string", name: "bar" }]
        }
      ]
    },
    {
      name: "page",
      path: "content/page",
      label: "Page",
      format: "mdx",
      fields: [
        {
          label: "Title",
          name: "Title",
          type: "string",
          ui: {}
        },
        {
          name: "body",
          label: "Main Content",
          type: "rich-text",
          isBody: true
        }
      ]
    },
    {
      label: "Blog Posts",
      name: "post",
      path: "content/post",
      format: "md",
      fields: [
        {
          type: "string",
          label: "Title",
          name: "title"
        },
        {
          type: "object",
          label: "Related Posts",
          name: "posts",
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.label };
            }
          },
          fields: [
            {
              name: "post",
              type: "reference",
              collections: ["post", "page"]
            },
            {
              name: "label",
              type: "string"
            }
          ]
        },
        {
          type: "object",
          label: "Something",
          name: "foo",
          fields: [
            {
              name: "bar",
              label: "Bar",
              type: "string"
            }
          ]
        },
        {
          type: "string",
          label: "Topic",
          name: "topic",
          options: ["programming", "blacksmithing"],
          list: true
        },
        {
          type: "rich-text",
          label: "Blog Post Body",
          name: "body",
          isBody: true,
          templates: [
            {
              name: "Gallery",
              label: "Gallery",
              fields: [
                {
                  label: "Images",
                  name: "images",
                  type: "object",
                  list: true,
                  fields: [
                    {
                      type: "image",
                      name: "src",
                      label: "Source"
                    },
                    {
                      type: "string",
                      name: "width",
                      label: "Width"
                    },
                    {
                      type: "string",
                      name: "height",
                      label: "Height"
                    }
                  ]
                },
                {
                  type: "string",
                  name: "alignment",
                  label: "Alignment",
                  options: ["left", "center", "right"]
                },
                {
                  type: "string",
                  name: "gap",
                  label: "Gap"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});
var schema_default = schema;

// .tina/config.js
import { defineConfig as defineConfig2 } from "tinacms";

// .tina/__generated__/client.js
import { createClient as createClient2 } from "tinacms/dist/client";

// .tina/__generated__/types.js
import { createClient } from "tinacms/dist/client";
function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
var TestPartsFragmentDoc = gql`
    fragment TestParts on Test {
  ... on TestTem1 {
    foo
  }
  ... on TestTem2 {
    bar
  }
}
    `;
var PagePartsFragmentDoc = gql`
    fragment PageParts on Page {
  Title
  body
}
    `;
var PostPartsFragmentDoc = gql`
    fragment PostParts on Post {
  title
  posts {
    __typename
    post {
      ... on Post {
        title
        posts {
          __typename
          post {
            ... on Post {
              title
              posts {
                __typename
                label
              }
              foo {
                __typename
                bar
              }
              topic
              body
            }
            ... on Page {
              Title
              body
            }
            ... on Document {
              id
            }
          }
          label
        }
        foo {
          __typename
          bar
        }
        topic
        body
      }
      ... on Page {
        Title
        body
      }
      ... on Document {
        id
      }
    }
    label
  }
  foo {
    __typename
    bar
  }
  topic
  body
}
    `;
var TestDocument = gql`
    query test($relativePath: String!) {
  test(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...TestParts
  }
}
    ${TestPartsFragmentDoc}`;
var TestConnectionDocument = gql`
    query testConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: TestFilter) {
  testConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...TestParts
      }
    }
  }
}
    ${TestPartsFragmentDoc}`;
var PageDocument = gql`
    query page($relativePath: String!) {
  page(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PageParts
  }
}
    ${PagePartsFragmentDoc}`;
var PageConnectionDocument = gql`
    query pageConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PageFilter) {
  pageConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PageParts
      }
    }
  }
}
    ${PagePartsFragmentDoc}`;
var PostDocument = gql`
    query post($relativePath: String!) {
  post(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PostParts
  }
}
    ${PostPartsFragmentDoc}`;
var PostConnectionDocument = gql`
    query postConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PostFilter) {
  postConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PostParts
      }
    }
  }
}
    ${PostPartsFragmentDoc}`;
function getSdk(requester) {
  return {
    test(variables, options) {
      return requester(TestDocument, variables, options);
    },
    testConnection(variables, options) {
      return requester(TestConnectionDocument, variables, options);
    },
    page(variables, options) {
      return requester(PageDocument, variables, options);
    },
    pageConnection(variables, options) {
      return requester(PageConnectionDocument, variables, options);
    },
    post(variables, options) {
      return requester(PostDocument, variables, options);
    },
    postConnection(variables, options) {
      return requester(PostConnectionDocument, variables, options);
    }
  };
}
var generateRequester = (client2) => {
  const requester = async (doc, vars, _options) => {
    const data = await client2.request({
      query: doc,
      variables: vars
    });
    return { data: data?.data, query: doc, variables: vars || {} };
  };
  return requester;
};
var queries = (client2) => {
  const requester = generateRequester(client2);
  return getSdk(requester);
};

// .tina/__generated__/client.js
var client = createClient2({ url: "http://localhost:4001/graphql", token: "undefined", queries });
var client_default = client;

// .tina/config.js
var config_default = defineConfig2({
  client: client_default,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  schema: schema_default
});
export {
  config_default as default
};
