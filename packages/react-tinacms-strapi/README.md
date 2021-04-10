# react-tinacms-strapi

This package provides helpers for setting up TinaCMS with Strapi's GraphQL API.

## Requirements

This package assumes you have a Strapi server available with the GraphQL plugin installed. See [Strapi's Docs](https://strapi.io/documentation/v3.x/getting-started/quick-start.html) and the docs for the [GraphQL Plugin](https://strapi.io/documentation/developer-docs/latest/development/plugins/graphql.html#graphql)

## Installation

```bash
yarn add react-tinacms-strapi
```

## Getting Started

We'll use the `StrapiClient` and the `StrapiMediaStore` to fetch/save data and media through the Strapi API.

```js
import { StrapiClient, StrapiMediaStore } from 'react-tinacms-strapi'

export default function MyApp({ Component, pageProps }) {
  const cms = useMemo(
    () =>
      new TinaCMS({
        apis: {
          strapi: new StrapiClient("http://localhost:1337/"),
        },
        media: {
          store: new StrapiMediaStore("http://localhost:1337/"),
        },
      }),
    []
  );
  return (
    <TinaProvider cms={cms}>
      <StrapiProvider onLogin={enterEditMode} onLogout={exitEditMode}>
        <Component {...pageProps} />
      </StrapiProvider>
    </TinaProvider>
  );
}
```
