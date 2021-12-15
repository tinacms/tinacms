## How to read these tests

These tests are a bit different because they're kind of like integration tests. Each folder acts as its own Tina-enabled
content repo. You'll notice there's a `.tina` folder with the schema config as well as a `content` folder for the content.
From there, there are `requests` and a `mutations` folders, this is essentially where the tests are. It's important to
note that these are "snapshot" tests, with the important distinction that instead of "snapshot" files we're just
using real `json` and `md` files. Snapshot tests can be somewhat tedious to maintain, we'll want to keep an eye on
how often tests change in meaningless was and remedy that if it becomes a problem. You can learn more about snapshot
testing [here](https://jestjs.io/docs/snapshot-testing).

## Request tests

These tests are a combination of the query and its respective response. For each folder
there will at least be one `_query` and one `_response` file. The way it reads is _this_ query results in _that_
response.

### Additional mutations

In some cases, there are mutations requests as well (`#-mutation.gql`) coupled with a response (`#-response.json`).
These read as: "Run this mutation, then run the _original_ query again, it should have _this_ response now". These
run sequentially and are a good way to test that mutations are actually doing what they say they're doing and see how
the data changes over each snapshot.

## Mutation tests

You can test mutation logic in the "request" test, but that doesn't tell the full story for mutations.
The mutation tests follow w similar pattern but are good for 2 things:

### Testing the output of a mutation

For some tests there will be a `_reponse.md`, this is what the content file _should_ look like after the mutation is
complete.


### Testing the response of a mutation in error cases

For testing that a mutation "fails correctly", it's useful to use a `_response.json` for the expectation

