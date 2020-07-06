# react-tinacms-strapi

This package provides helpers for setting up TinaCMS with Strapi's GraphQL API.

## Requirements

This package assumes you have a Strapi server available with the GraphQL plugin installed. See [Strapi's Docs](https://strapi.io/documentation/v3.x/getting-started/quick-start.html) and the docs for the [GraphQL Plugin](https://strapi.io/documentation/v3.x/plugins/graphql.html#usage)

## Installation

```bash
yarn add react-tinacms-strapi
```

The package relies on having a `STRAPI_URL` environment variable that points to the root URI of your Strapi server.


## Getting Started
We'll use the `TinaStrapiClient` and the `StrapiMediaStore` to fetch/save data and media through the Strapi API.

```js
export default function MyApp({ Component, pageProps }) {
  const cms = useMemo(
    () =>
      new TinaCMS({
        apis: {
          strapi: new TinaStrapiClient(),
        },
        media: {
          store: new StrapiMediaStore(),
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
