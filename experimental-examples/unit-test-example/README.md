## DO NOT MODIFY

This directory is for unit tests used by the tinacms package, it's purpose is to
provide a real-world schema that we can use as "fixtures".

(you can modify this all you want while writing tests in the `tinacms` package)

### How to use

This is a basic Tina-enabled Next.js app with single page that just displays the raw data of a query.

It's purpose it to facilitate testing the `useGraphQLForms` hook to ensure that it properly updates
fields based on the query provided. To do that, it comes with a utility that allows for adding tests to
the `formify` module in `tinacms`.

### How to add a test
