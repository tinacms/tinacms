## DO NOT MODIFY

This directory is for unit tests used by the tinacms package, it's purpose is to
provide a real-world schema that we can use as "fixtures".

(you can modify this all you want while writing tests in the `tinacms` package)

### How to use

This is a basic Tina-enabled Next.js app with single page that just displays the raw data of a query.

Its purpose it to facilitate testing the `useGraphQLForms` hook to ensure that it properly updates
fields based on the query provided. To do that, it comes with a utility that allows for adding tests to
the `formify` module in `tinacms`.

### How to add a test

[View the video walkthrough](https://www.loom.com/share/86f4e6ff1e894351b3aad6c796817532)

1. Run the dev server for this app

```
yarn dev
```

2. Provide the query you'd like to test in `pages/index.js`

```
const query = `#graphql
query {
  getBlockPageDocument(relativePath: "blockPage1.mdx") {
    data {
      title
    }
  }
}
`
```

> Note: if you need to modify an existing data, that may break other tests. That's probably ok but just be
> sure to update and review the snapshots carefully. It's probably easiest to add new data rather
> than modify anything existing.

You can also modify the schema as needed to test things that aren't covered yet.

3. View the page in your browser and edit the form

You can make whatever changes you'd like to test in the form. Hitting "Save" will copy a test to your clipboard.

4. From within `tinacms` formify module (packages/tinacms/src/hooks/formify), create a new file, for now the convention is `test/#-some-test-description/index.spec.ts`. This isn't ideal but is great
   for moving quickly. Pase the event that was copied to your clipboard after saving the form.

5. In a separate terminal go to `packages/tinacms` and run the test with `yarn test --watch`. The test will fail.

6. Isolate the test by hitting `p` and specifying the path the matches your new test file. In `packages/tinacms/src/hooks/formify/test/runner.ts`, change the mock
   behavior so that it uses the local server to build its mock data

```js
const SET_MOCKS_FROM_LOCAL_SERVER = true
```

7. Re-run the test, this should generate mock data.

8. Set the mock behavior back to `false`:

```js
const SET_MOCKS_FROM_LOCAL_SERVER = false
```

9. You can kill the Next.js app and your test should still pass.
