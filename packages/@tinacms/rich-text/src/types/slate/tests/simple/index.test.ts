import { it } from 'vitest'
import { SlateRoot } from '../../../slate'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown } from 'mdast-util-gfm'

const ast = fromMarkdown(
  `Testing __things__ are working? *[Here's *the forecast*](http://example.com)*
for tomorrow's weather

- List item. With _empahsis_

  # Heading!

## Testing again!

\`\`\`javascript
const hello = "world"
\`\`\`

123 Street\\
Abc, London

| foo | bar |
| :-- | :-: |
| baz | qux _with some emphasis_ and [link][bravo] |

some \`inline code\` goes here. _bold \`marks are ignored\`_ for inline code.

You can ~~delete this code~~. And __emphasize the ~~deletion~~__ if you'd like

Here's a <a href="some-link" data-link="true" disabled>Link to the docs</a>

I'm making a reference to the [^some definition] footnote

[alpha][bravo]

---

![alpha][bravo]

[^some definition]: ## This is a footnote definition

  I am part of the footnote still!

[bravo]: http://exapmle.com/referenceimage.jpg

Here's an ![image you'll __love__](http://example.com/my-img.jpg)
  `,
  {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  }
)

console.dir(ast, { depth: null })

it('does it', () => {
  const result = SlateRoot.safeParse(ast)
  if (!result.success) {
    console.dir(result.error.format().children, { depth: 8 })
    // // console.dir(result.error.format(), { depth: null })
    // result.error.issues.map((issue) => {
    //   console.log(issue)
    //   console.log(`${issue.code} at ${issue.path.join('.')}`)
    // })
  } else {
    console.dir(result, { depth: null })
  }
})
