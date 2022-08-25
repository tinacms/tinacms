# Tina.io website

Source code for the [tina.io](https://tina.io) website.

## Development

```
cp .env.example .env.local
yarn install
yarn develop
```

### Testing Local TinaCMS Changes

If you have the **tinacms** repository cloned locally you can use it when running **tina.io**:

```
TINA=../path/to/tinacms yarn develop
```

You can also specify which packages you want to watch:

```
TINA=../path/to/tinacms TINA_WATCH=@tinacms/forms,react-tinacms-inline
```

> ### Warning
>
> This will only work for packages loaded by webpack. That means that environments which don't use
> webpack (i.e. SSR builds) will not use this alias.

## Shortcodes

This site supports shortcodes in Markdown content via [remark-shortcodes](https://github.com/djm/remark-shortcodes).

Shortcodes must be written as React components. To add a shortcode, export it from `utils/shortcodes.tsx`.

```jsx
export function MyShortcode({ textContent }) {
  return <div>{textContent}</div>
}
```

Call the shortcode in your content by writing the name of the component encased in double curly braces. Key-value pairs included in the shortcode will be passed to your component as props.

```
{{ MyShortcode textContent="Example shortcode" }}
```

### Shortcode Limitations

Shortcodes must be standalone elements; "wrapping" shortcodes will not work.

## Copy-able Code Blocks

A "Copy" button can be added to Code Blocks by adding the `copy` tag to fenced code blocks.

Non-copyable JS

```js
const christmastPresent = new Banana()
```

Copyable JS

```js,copy
const christmastPresent = new Banana()
```

Copyable Text

    ```copy
    Hello World
    ```
