## Testing formify

These tests are based on the workspace Next.js app called `experimental-examples/unit-test-example`. They basically
act as integration tests with no UI, and due to the nature of the form generating features, there are also backend
network mocks required for these tests to run in isolation. For that reason, it's best to build the test you
want to run by querying for it in the `experimental-examples/unit-test-example` app, hitting 'Save' on any form
will populate your clipboard with a test output, which you can put in a folder to run automatically.

### Mocking the data

Because this functionality requires getting data from the GraphQL API, there's a toggle to "unmock" the data.

When creating a test for the first time you'll want to ensure the mock data isn't being used (since it won't
exist yet). In the runner.ts, tell the test you'd like to use the real local server for network requests.

```ts
const SET_MOCKS_FROM_LOCAL_SERVER = true
```

Make sure you're running the GraphQL API from `experimental-examples/unit-test-example` so the tests pick up
on the data.

Once the test runs, you should see a `mocks.json` file in the respective test directory. From here, you can
turn off the local mock `const SET_MOCKS_FROM_LOCAL_SERVER = false` and run the test without a local
server.
