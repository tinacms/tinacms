# @tinacms/mdx

## 1.3.20

### Patch Changes

- b6fbab887: Add support for basic markdown tables.

  ### Usage

  ```ts
  // tina/config.ts
  import `tinaTableTemplate` from `tinacms`

  // add it to the rich-text template
    {
      type: 'rich-text',
      label: 'Body',
      name: '_body',
      templates: [
        tinaTableTemplate
      ///
  ```

  Customize the `th` and `td` fields in the `<TinaMarkdown>` component:

  ```tsx
  <TinaMarkdown
    content={props.body}
    components={{
      th: (props) => <th className="bg-gray-100 font-bold" {...props} />,
      td: (props) => <td className="bg-gray-100" {...props} />,
    }}
  />
  ```

  To control the rendering for `

- Updated dependencies [6861b5e01]
- Updated dependencies [aec44a7dc]
  - @tinacms/schema-tools@1.4.13

## 1.3.19

### Patch Changes

- 5040fc7cb: Add xref support to markdown links

  ```md
  Click [here](xref:some-link 'Tester') to join now
  ```

## 1.3.18

### Patch Changes

- Updated dependencies [7e4de0b2a]
- Updated dependencies [099bf5646]
- Updated dependencies [c92de7b1d]
  - @tinacms/schema-tools@1.4.12

## 1.3.17

### Patch Changes

- 0e94b2725: Fix issue where empty nested rich-text fields would throw an error if they'd been marked as dirty during editing
- Updated dependencies [1563ce5b2]
  - @tinacms/schema-tools@1.4.11

## 1.3.16

### Patch Changes

- 8aae69436: Ensure urls are sanitized in a tags for rich-text
- a78c81f14: Fix issue where non-object lists weren't handled properly for rich-text embeds
- Updated dependencies [133e97d5b]
- Updated dependencies [f02b4368b]
- Updated dependencies [7991e097e]
  - @tinacms/schema-tools@1.4.10

## 1.3.15

### Patch Changes

- bc812441b: Use .mjs extension for ES modules
- Updated dependencies [bc812441b]
  - @tinacms/schema-tools@1.4.9

## 1.3.14

### Patch Changes

- Updated dependencies [019920a35]
  - @tinacms/schema-tools@1.4.8

## 1.3.13

### Patch Changes

- Updated dependencies [fe13b4ed9]
  - @tinacms/schema-tools@1.4.7

## 1.3.12

### Patch Changes

- Updated dependencies [a94e123b6]
  - @tinacms/schema-tools@1.4.6

## 1.3.11

### Patch Changes

- Updated dependencies [c385b5615]
  - @tinacms/schema-tools@1.4.5

## 1.3.10

### Patch Changes

- Updated dependencies [beb179279]
  - @tinacms/schema-tools@1.4.4

## 1.3.9

### Patch Changes

- Updated dependencies [f14f59a96]
- Updated dependencies [eeedcfd30]
  - @tinacms/schema-tools@1.4.3

## 1.3.8

### Patch Changes

- 75d5ed359: Add html tag back into rich-text response

## 1.3.7

### Patch Changes

- Updated dependencies [a70204500]
  - @tinacms/schema-tools@1.4.2

## 1.3.6

### Patch Changes

- 5fcef561d: - Pin vite version
  - Adds react plugin so that we no longer get a 404 on react /@react-refresh
  - Adds transform ts and tsx files in build as well as dev
- Updated dependencies [9a8074889]
- Updated dependencies [c48326846]
  - @tinacms/schema-tools@1.4.1

## 1.3.5

### Patch Changes

- 9e86312d6: Skip html tokenization when skipEscaping is enabled.
- 5d1e0e406: Support mdx block elements when children are on the same line. Eg.

  ```
  <Cta>Hello, world</Cta>
  ```

- cbc1fb919: Provide browser-specific version of @tinacms/mdx
- Updated dependencies [76c984bcc]
- Updated dependencies [5809796cf]
- Updated dependencies [54aac9017]
  - @tinacms/schema-tools@1.4.0

## 1.3.4

### Patch Changes

- 973e83f1f: Some fixes around image handling in the rich-text editor

  - Stop treating images as block-level
  - Fix issue where images inside links were being stripped out
  - Fix display of .avif images in the media manager

- Updated dependencies [d1cf65999]
  - @tinacms/schema-tools@1.3.4

## 1.3.3

### Patch Changes

- 290520682: Update handling of top-level images during stringify
  - @tinacms/schema-tools@1.3.3

## 1.3.2

### Patch Changes

- 3e97d978c: Add support for experimental markdown parser. To enable:

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

- f831dcf4f: security: update some deps
- Updated dependencies [0a5297800]
- Updated dependencies [7a3e86ba1]
- Updated dependencies [353899de1]
- Updated dependencies [01b858e41]
  - @tinacms/schema-tools@1.3.3

## 1.3.1

### Patch Changes

- aa0250979: Fix issue where shortcode closing tags were backwards
- Updated dependencies [892b4e39e]
- Updated dependencies [c97ffc20d]
  - @tinacms/schema-tools@1.3.2

## 1.3.0

### Minor Changes

- 169147490: When markdown files fail to parse, fallback to the non-MDX parser

### Patch Changes

- Updated dependencies [e732906b6]
  - @tinacms/schema-tools@1.3.1

## 1.2.0

### Minor Changes

- efd56e769: Replace Store with AbstractLevel in Database. Update CLI to allow user to configure Database.

### Patch Changes

- efd56e769: Remove license headers
- Updated dependencies [efd56e769]
- Updated dependencies [efd56e769]
  - @tinacms/schema-tools@1.3.0

## 1.1.1

### Patch Changes

- Updated dependencies [84fe97ca7]
- Updated dependencies [e7c404bcf]
  - @tinacms/schema-tools@1.2.1

## 1.1.0

### Minor Changes

- 3165f397d: fix: Shortcodes need to be specified by name to match with match-start / match-end
- a68f1ac27: fix: Shortcodes need to be specified by name to match with match-start / match-end

### Patch Changes

- 7ff63fdd9: Modify shortcode behavior to treat \_value as a special field name which shows up as an unkeyed string in the shortcode output
- Updated dependencies [7d41435df]
- Updated dependencies [3165f397d]
- Updated dependencies [b2952a298]
  - @tinacms/schema-tools@1.2.0

## 1.0.4

### Patch Changes

- Updated dependencies [7554ea362]
- Updated dependencies [4ebc44068]
  - @tinacms/schema-tools@1.1.0

## 1.0.3

### Patch Changes

- Updated dependencies [7495f032b]
- Updated dependencies [de37c9eff]
  - @tinacms/schema-tools@1.0.3

## 1.0.2

### Patch Changes

- Updated dependencies [c91bc0fc9]
- Updated dependencies [c1ac4bf10]
  - @tinacms/schema-tools@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [08e02ec21]
  - @tinacms/schema-tools@1.0.1

## 1.0.0

### Major Changes

- 958d10c82: Tina 1.0 Release

  Make sure you have updated to th "iframe" path: https://tina.io/blog/upgrading-to-iframe/

### Patch Changes

- Updated dependencies [958d10c82]
  - @tinacms/schema-tools@1.0.0

## 0.61.17

### Patch Changes

- 14c5cdffe: Fixes an issue where deeply nested rich-text wasn't being parsed properly
- Updated dependencies [a5d6722c7]
  - @tinacms/schema-tools@0.2.2

## 0.61.16

### Patch Changes

- 4b174e14b: Treat images as block-level when they're isolated in a paragraph.

  Previously all images were nested inside `<p>` elements when coming from the server, but treated as block level by the rich-text editor. This resulted in a scenario where new paragraphs adjacent to images were nested
  in parent `<p>` tags, which caused an error.

- Updated dependencies [6c93834a2]
  - @tinacms/schema-tools@0.2.1

## 0.61.15

### Patch Changes

- Updated dependencies [774abcf9c]
- Updated dependencies [245a65dfe]
  - @tinacms/schema-tools@0.2.0

## 0.61.14

### Patch Changes

- 97f0b6472: Add raw editor support for static mode. Use `~` for preview path.

## 0.61.13

### Patch Changes

- Updated dependencies [c4f9607ce]
  - @tinacms/schema-tools@0.1.9

## 0.61.12

### Patch Changes

- Updated dependencies [005e1d699]
  - @tinacms/schema-tools@0.1.8

## 0.61.11

### Patch Changes

- Updated dependencies [b1a357f60]
  - @tinacms/schema-tools@0.1.7

## 0.61.10

### Patch Changes

- Updated dependencies [c6e3bd321]
  - @tinacms/schema-tools@0.1.6

## 0.61.9

### Patch Changes

- Updated dependencies [183249b11]
- Updated dependencies [8060d0949]
  - @tinacms/schema-tools@0.1.5

## 0.61.8

### Patch Changes

- 112b7271d: fix vulnerabilities
- Updated dependencies [f581f263d]
- Updated dependencies [7ae1b0697]
- Updated dependencies [f3439ea35]
- Updated dependencies [48032e2ba]
  - @tinacms/schema-tools@0.1.4

## 0.61.7

### Patch Changes

- Updated dependencies [9183157c4]
- Updated dependencies [4adf12619]
- Updated dependencies [f8b89379c]
  - @tinacms/schema-tools@0.1.3

## 0.61.6

### Patch Changes

- Updated dependencies [777b1e08a]
  - @tinacms/schema-tools@0.1.2

## 0.61.5

### Patch Changes

- Updated dependencies [59ff1bb10]
- Updated dependencies [232ae6d52]
- Updated dependencies [fd4d8c8ff]
- Updated dependencies [9e5da3103]
  - @tinacms/schema-tools@0.1.1

## 0.61.4

### Patch Changes

- 2b60a7bd8: Improve audit so that it doesn't throw errors during the file list process. Also adds support for `--verbose` argument during `audit`.

## 0.61.3

### Patch Changes

- 7506a46b9: Fix issue where marks within links would throw an error
- 5fbdd05be: Fix stringification of code element nested in link

## 0.61.2

### Patch Changes

- c6726c65b: Fix regression in handling images in rich-text

## 0.61.1

### Patch Changes

- 3d36a0e42: Add null check in markdownToAst to fix error during new doc creation

## 0.61.0

### Minor Changes

- 7b0dda55e: Updates to the `rich-text` component as well the shape of the `rich-text` field response from the API

  - Adds support for isTitle on MDX elements
  - Fixes issues related to nested marks
  - Uses monaco editor for code blocks
  - Improves styling of nested list items
  - Improves handling of rich-text during reset
  - No longer errors on unrecognized JSX/html, instead falls back to print `No component provided for <compnonent name>`
  - No longer errors on markdown parsing errors, instead falls back to rendering markdown as a string, customizable via the TinaMarkdown component (invalid_markdown prop)
  - Prepares rich-text component for raw mode - where you can edit the raw markdown directly in the Tina form. This will be available in future release.

### Patch Changes

- Updated dependencies [7b0dda55e]
- Updated dependencies [8183b638c]
  - @tinacms/schema-tools@0.1.0
