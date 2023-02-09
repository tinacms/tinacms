import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './code inside list item.md?raw'
undefined

const out = output({
  type: 'root',
  children: [
    {
      type: 'invalid_markdown',
      value:
        '1.  Create a backup of your .htaccess file, located in the root of your Web server.\n2.  Edit the .htaccess file and add the following code. Don’t forget to modify the feed’s URL with your own feed’s URL.\n\n        # temp redirect wordpress content feeds to feedburner\n        <IfModule mod_rewrite.c>\n         RewriteEngine on\n         RewriteCond %{HTTP_USER_AGENT} !FeedBurner    [NC]\n         RewriteCond %{HTTP_USER_AGENT} !FeedValidator [NC]\n         RewriteRule ^feed/?([_0-9a-z-]+)?/?$ https://feeds.feedburner.com/wprecipes [R=302,NC,L]\n        </IfModule>\n\n3.  Save the file. You’re done!\n',
      message: 'code inside list item is not supported',
      children: [{ type: 'text', text: '' }],
      position: {
        start: { line: 4, column: 5, offset: 209 },
        end: { line: 10, column: 20, offset: 563 },
      },
    },
  ],
})

describe('./code inside list item.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
