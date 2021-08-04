> Heads up - if you haven't already done so, read through the [CLI documentation](https://tina.io/docs/tina-cloud/cli/) to make sure you have a GraphQL server running locally.

For a real-world example of how this is being used checkout the [Tina Cloud Starter](https://github.com/tinacms/tina-cloud-starter).

## Getting started

Npm:

```bash
npm install --save-dev tinacms
```

Yarn:

```bash
yarn add --dev tinacms
```

## The TinaCMS API Client

This package exports a class which acts as [TinaCMS external API](https://tina.io/docs/apis/) for the Tina Content API. This is a headless GraphQL API that's serverd via Tina Cloud or locally from within the Tina CLI.

```ts
import { Client, LocalClient } from "tinacms";
const client = new Client({
  organizationId: "the ID you get from Tina Cloud",
  clientId: "the client ID you get from Tina Cloud",
  branch: "main",
  tokenStorage: "LOCAL_STORAGE" | "MEMORY" | "CUSTOM",
});

// For a simpler setup while working locally you can instantiate the LocalClient as a convenience
const client = new LocalClient();
```

The `Client` does a few things:

- Manages auth with Tina Cloud
- Provides a `request` function for working with the GraphQL API

Start by initializing the `LocalClient` - which automatically connects with your locally-running GraphQL server. From there, you can make GraphQL requests:

### `client.request`

```ts
const client = new LocalClient();

await client.request(
  (gql) => gql`#graphql
query BlogPostQuery($relativePath: String!) {
  {
    getPostsDocument(relativePath: "") {
      data {
        title
      }
    }
  }
}
`,
  { variables: { relativePath: "hello-world.md" } }
);
```

> This API currently doesn't support filtering and sorting "list" queries. We have plans to tackle that in upcoming cycles.

## `useGraphQLForms`

While GraphQL is a great tool, using it with Tina can be difficult. GraphQL can query across multiple nodes, but since each document would require its own Tina form it could be difficult to sync the data with your query with all of the forms you'd need to build. The Tina GraphQL server knows all about your content schema so we're actually able to build forms automatically by inspecting your query. To see this in action, pass your query into the `useGraphqlForms` hook:

```tsx
import { useGraphqlForms } from 'tinacms'

const query = gql => gql`#graphql
  query BlogPostQuery($relativePath: String!) {
    {
      getPostsDocument(relativePath: $relativePath) {
        data {
          title
        }
      }
    }
  }
`

const MyPage = (props) => {
  const [payload, isLoading] = useGraphqlForms<PostQueryResponseType>({
    query,
    variables: { relativePath: `${props.filename}.md` },
  });

  isLoading ? <div>Loading...</div> : <MyComponent {...payload}>
}
```

If Tina is enabled you can see a form for the `getPostsDocument` request. If you query for multiple documents, you should see multiple forms:

```tsx
const query = (gql) => gql`#graphql
  query BlogPostQuery($relativePath: String!) {
    {
      # this generates a Tina Form
      getSiteNavsDocument(relativePath: "site-nav.md") {
        data {
          items {
            title
            link
          }
        }
      }
      # this generates a separate Tina Form
      getPostsDocument(relativePath: $relativePath) {
        data {
          title
        }
      }
    }
  }
`;
```

### Formify

If you'd like to control the output of those forms, tap into the `formify` callback:

##### Form customization:

```tsx
import { useGraphqlForms } from "tinacms";
import { useCMS } from "tinacms";

const [payload, isLoading] = useGraphqlForms({
  query,
  formify: ({ formConfig, createForm, createGlobalForm, skip }) => {
    if (formConfig.id === "getSiteNavsDocument") {
      return createGlobalForm(formConfig);
    }

    return createForm(formConfig);
  },
  variables: { relativePath: `${props.filename}.md` },
});

// or to skip the nav from creating a form altogether:
const [payload, isLoading] = useGraphqlForms({
  query,
  formify: ({ formConfig, createForm, skip }) => {
    if (formConfig.id === "getSiteNavsDocument") {
      return skip();
    }

    return createForm(formConfig);
  },
  variables: { relativePath: `${props.filename}.md` },
});
```

##### Field customization:

Since your forms are built automatically, `formify` can also be used to customize fields:

```tsx
const [payload, isLoading] = useGraphqlForms({
  query,
  formify: ({ formConfig, createForm, skip }) => {
    return createForm({
      ...formConfig,
      fields: formConfig.fields.map((field) => {
        if (field.name === "title") {
          // replace `text` with `textarea`
          field.component = "textarea";
        }
        return field;
      }),
    });
  },
  variables: { relativePath: `${props.filename}.md` },
});
```

## `useDocumentCreatorPlugin`

This hook allows your editors to safely create new pages. Note that you'll be responsible for redirecting the user after a new document has been created. To use this:

```tsx
import { useDocumentCreatorPlugin } from "tinacms";

// args is of type:
// {
//   collection: {
//     slug: string;
//   };
//   relativePath: string;
//   breadcrumbs: string[];
//   path: string;
// }
useDocumentCreatorPlugin((args) => window.location.assign(buildMyRouter(args)));
```

### Customizing the content creator options

To prevent editors from creating documents from certain collections, provide a filter function:

```tsx
// options are of type:
// {
//   label: string;
//   value: string;
// }[]
useDocumentCreatorPlugin(null, (options) =>
  options.filter((option) => option.name !== "post")
);
```

## Authentication with Tina Cloud

While this package comes with low-level APIs for authentication with Tina Cloud, the easiest way to get started is to use the `TinaCloudAuthWall` component, which prevents children from rendering until a valid session has been established with Tina Cloud.

### `TinaCloudAuthWall`

```tsx
import { TinaCloudAuthWall, Client } from "tinacms";

const TinaWrapper = ({ children }) => {
  const cms = React.useMemo(() => {
    return new TinaCMS({
      apis: {
        tina: new Client({
          // config
        })
      },
      ...
    });
  }, []);

  return <TinaCloudAuthWall cms={cms}>{children}</TinaCloudAuthWall>;
};
```

Props for TinaCloudAuthWall

| Prop                         | Description                                                                                                                                                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cms`                        | An instance of a [CMS](http://localhost:3000/docs/cms/#cms-configuration)                                                                                                                                                                                                                              |
| `getModalActions` (optional) | A function that returns a list of actions / buttons that will be rendered to the model. Each button has name, action, and can be primary or not. The name is the text that will be displayed. The action is a function that will be run when the button is clicked. See example below for more details |

```tsx
return (
  <TinaCloudAuthWall
    cms={cms}
    getModalActions={({ closeModal }) => {
      return [
        {
          action: async () => {
            //  use your own state to get in and out of edit mode
            closeModal();
          },
          name: "close",
          primary: false,
        },
      ];
    }}
  >
    <Component {...pageProps} />
  </TinaCloudAuthWall>
);
```

> Note: when using the LocalClient, TinaCloudAuthWall won't display a login screen, there is no authentication for the local GraphQL server.

### Authenticating without TinaCloudAuthWall

You can also authenticate with the `Client` directly:

```ts
const client = new Client({
  // config
});

const EditSiteButton = () => {
  const cms = useCMS();
  const onClick = async () => {
    await client.authenticate().then((token) => {
      cms.enable();
    });
  };

  return <button onClick={onClick}>Edit This Site</button>;
};
```
