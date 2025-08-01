# Project structure

- @packages/@tinacms/graphql/README.md describes the package's purpose and how to use it.
- Integration tests are stored in @packages/@tinacms/graphql/src/spec.
- Unit tests are stored in @packages/@tinacms/graphql/tests.
- The intention is to move the integration tests to unit tests.

## Useful commands

To build:

```
pnpm build
pnpm types
```

To run unit and integration tests:
```
pnpm test
```

To update the snapshot for a test, use:

```
npx vitest run {{ TEST-NAME }} -u
```

## Philosophy

- Be succinct.
- Unit tests should be created one-by-one.
- Unit tests should be prioritized over integration tests, but not for performance reasons. There is no need to measure the performance of tests unless that is the express purpose of that test.
- Unit tests should use generic and consistent names for the examples. The first person should always be "Mr Bob Northwind" who runs the company "Northwind".
