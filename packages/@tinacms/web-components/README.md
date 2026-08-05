# @tinacms/web-components

All things web components with Tina.

This package is used to add visual editing support and markdown rendering to
plain JS sites.

> [!IMPORTANT]
> MDX and custom markdown components are not supported.


## Install

```bash
pnpm add @tinacms/web-components tinacms
pnpm add -D @tinacms/cli
```


## Making Tina requests

Both `tinacms dev` / `tinacms build` will generate a JS client to
`./tina/__generated__/client.js`. This is used to fetch your markdown content.

For example, given a collection `post`, the generated Tina client will provide
a `postConnection` method which can be used to fetch "post" content.

```javascript
import {client} from "./tina/__generated__/client.js";

const postsResponse = await client.queries.postConnection();
const posts = postsResponse.data.postConnection.edges.map((post) => {
    return {
        title: post.node.title,
        body: post.node.body,
    };
});
```

If your build does not bundle JS, an
[importmap](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap)
will need to be setup. This is because the generated Tina client imports a bare
specifier that the browser can't resolve.

```html
<head>
    <script type="importmap">
        {
            "imports": {
                "tinacms/dist/client": "./node_modules/tinacms/dist/client.js"
            }
        }
    </script>
</head>
```

For more details on querying content, please visit the ["Querying Content"
section of the Tina docs](https://tina.io/docs/features/data-fetching).


## Rendering Markdown

The `tina-markdown` web component is used to render markdown from a [Tina
`rich-text` field](https://tina.io/docs/reference/types/rich-text).

It receives the stringified AST provided by the `rich-text` field via the
`content` attribute.

```html
<body>
  <ul id="posts"></ul>

  <script type="module">
    import {client} from "./tina/__generated__/client.js";

    // Register the `tina-markdown` component.
    import "./node_modules/@tinacms/web-components/dist/tina-markdown.js";

    const postsResponse = await client.queries.postConnection();
    const posts = postsResponse.data.postConnection.edges.map((post) => {
        return {
            body: post.node.body,
        };
    });

    const postsContainer = document.getElementById("posts");
    for (const post of posts) {
        const tinaMarkdown = document.createElement("tina-markdown");
        const markdownAst = JSON.stringify(post.body);
        tinaMarkdown.setAttribute("content", markdownAst)

        const li = document.createElement("li");
        li.appendChild(tinaMarkdown);

        postsContainer.appendChild(li);
    }
  </script>
</body>
```


## Visual Editing

Visual editing can be setup to allow live editing of a collection on a page.

Before the following works, [setup a visual editing
router](https://tina.io/docs/contextual-editing/router) for the desired
collection.

Building off the previous example, the following shows the inclusion of visual
editing.

```html
<body>
  <ul id="posts"></ul>

  <script type="module">
    import {client} from "./tina/__generated__/client.js";
    import "./node_modules/@tinacms/web-components/dist/tina-markdown.js";

    // Imports required for visual editing.
    //   - `createTina` fetches a provided connection and renders the content
    //     when changes are detected.
    //   - `tinaField` generates unique IDs used by Tina internally for
    //     click-to-edit functionality.
    import {createTina, tinaField} from "./node_modules/@tinacms/web-components/dist/visual-editing.js";

    const postsContainer = document.getElementById("posts");

    // Move rendering logic to a function provided to `createTina`.
    // `data` holds extra metadata which `tinaField` uses.
    function renderPosts(data) {
      const posts = data.postConnection.edges.map((edge) => edge.node);

      // Reset the container before re-adding the newly changed content.
      postsContainer.replaceChildren();
      for (const post of posts) {
          const tinaMarkdown = document.createElement("tina-markdown");
          const markdownAst = JSON.stringify(post.body);
          tinaMarkdown.setAttribute("content", markdownAst)

          // Generate a unique id and set it to the elements `data-tina-field`.
          // This enables click-to-edit in the admin.
          const bodyField = tinaField(post, "body");
          if (bodyField) tinaMarkdown.setAttribute("data-tina-field", bodyField);

          const li = document.createElement("li");
          li.appendChild(tinaMarkdown);

          postsContainer.appendChild(li);
      }
    };

    createTina({
        query: () => client.queries.postConnection(),
        render: renderPosts,
    }).init();
  </script>
</body>
```

A more detailed example can be found in the [kitchen-sink
example](https://github.com/tinacms/tinacms/tree/main/examples/web-components/kitchen-sink)


## License

Apache 2.0
