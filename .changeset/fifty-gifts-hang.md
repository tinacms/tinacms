---
'@tinacms/mdx': patch
---

Add support for experimental markdown parser. To enable:

```js
{
  name: "body",
  type: "rich-text",
  parser: {
    type: "markdown"
  }
}
```

For users who want to control the escape behavior, you can specify

```js
{
  name: "body",
  type: "rich-text",
  parser: {
    type: "markdown"
    skipEscaping: "all" // options are "all" | "html"
  }
}
```

This is helpful for sites rendered by other systems such as Hugo, where escape characters may interfere with
shortcodes that aren't registered with Tina.
