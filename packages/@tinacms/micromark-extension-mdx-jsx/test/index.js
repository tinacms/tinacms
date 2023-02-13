/**
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 * @typedef {import('micromark-util-types').Handle} Handle
 */

import test from 'tape'
import {Parser} from 'acorn'
import acornJsx from 'acorn-jsx'
import {micromark} from 'micromark'
import {mdxJsx as syntax} from '../dev/index.js'

const acorn = Parser.extend(acornJsx())

/** @type {HtmlExtension} */
const html = {
  enter: {mdxJsxTextTag: start, mdxJsxFlowTag: start},
  exit: {mdxJsxTextTag: end, mdxJsxFlowTag: end}
}

/** @type {Handle} */
function start() {
  this.buffer()
}

/** @type {Handle} */
function end() {
  this.resume()
  this.setData('slurpOneLineEnding', true)
}

test('micromark-extension-mdx-jsx', (t) => {
  t.test('core', (t) => {
    t.throws(
      () => {
        // @ts-expect-error: runtime.
        syntax({acorn: true})
      },
      /Expected a proper `acorn` instance passed in as `options\.acorn`/,
      'should crash on `acorn` w/o `parse`'
    )

    t.throws(
      () => {
        // @ts-expect-error: runtime.
        syntax({acornOptions: {}})
      },
      /Expected an `acorn` instance passed in as `options\.acorn`/,
      'should crash on `acornOptions` w/o `acorn`'
    )

    t.throws(
      () => {
        syntax({addResult: true})
      },
      /Expected an `acorn` instance passed in as `options\.acorn`/,
      'should crash on `addResult` w/o `acorn`'
    )

    t.equal(
      micromark('a <b/> c.', {extensions: [syntax()], htmlExtensions: [html]}),
      '<p>a  c.</p>',
      'should support a self-closing element'
    )

    t.equal(
      micromark('a <b></b> c.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a  c.</p>',
      'should support a closed element'
    )

    t.equal(
      micromark('a <></> c.', {extensions: [syntax()], htmlExtensions: [html]}),
      '<p>a  c.</p>',
      'should support fragments'
    )

    t.equal(
      micromark('a <b>*b*</b> c.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a <em>b</em> c.</p>',
      'should support markdown inside elements'
    )

    t.end()
  })

  t.test('text (agnostic)', (t) => {
    t.equal(
      micromark('a <b /> c', {extensions: [syntax()], htmlExtensions: [html]}),
      '<p>a  c</p>',
      'should support a self-closing element'
    )

    t.equal(
      micromark('a <b> c </b> d', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a  c  d</p>',
      'should support a closed element'
    )

    t.equal(
      micromark('a <b> c', {extensions: [syntax()], htmlExtensions: [html]}),
      '<p>a  c</p>',
      'should support an unclosed element'
    )

    t.equal(
      micromark('a <b {1 + 1} /> c', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a  c</p>',
      'should support an attribute expression'
    )

    t.equal(
      micromark('a <b c={1 + 1} /> d', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a  d</p>',
      'should support an attribute value expression'
    )

    t.end()
  })

  t.test('text (gnostic)', (t) => {
    t.equal(
      micromark('a <b /> c', {
        extensions: [syntax({acorn})],
        htmlExtensions: [html]
      }),
      '<p>a  c</p>',
      'should support a self-closing element'
    )

    t.equal(
      micromark('a <b> c </b> d', {
        extensions: [syntax({acorn})],
        htmlExtensions: [html]
      }),
      '<p>a  c  d</p>',
      'should support a closed element'
    )

    t.equal(
      micromark('a <b> c', {
        extensions: [syntax({acorn})],
        htmlExtensions: [html]
      }),
      '<p>a  c</p>',
      'should support an unclosed element'
    )

    t.equal(
      micromark('a <b {...c} /> d', {
        extensions: [syntax({acorn})],
        htmlExtensions: [html]
      }),
      '<p>a  d</p>',
      'should support an attribute expression'
    )

    t.equal(
      micromark('a <b {...{c: 1, d: Infinity, e: false}} /> f', {
        extensions: [syntax({acorn})],
        htmlExtensions: [html]
      }),
      '<p>a  f</p>',
      'should support more complex attribute expression (1)'
    )

    t.equal(
      micromark('a <b {...[1, Infinity, false]} /> d', {
        extensions: [syntax({acorn})],
        htmlExtensions: [html]
      }),
      '<p>a  d</p>',
      'should support more complex attribute expression (2)'
    )

    t.equal(
      micromark('a <b c={1 + 1} /> d', {
        extensions: [syntax({acorn})],
        htmlExtensions: [html]
      }),
      '<p>a  d</p>',
      'should support an attribute value expression'
    )

    t.throws(
      () => {
        micromark('a <b c={} /> d', {extensions: [syntax({acorn})]})
      },
      /Unexpected empty expression/,
      'should crash on an empty attribute value expression'
    )

    t.throws(
      () => {
        micromark('a <b {1 + 1} /> c', {extensions: [syntax({acorn})]})
      },
      /Could not parse expression with acorn: Unexpected token/,
      'should crash on a non-spread attribute expression'
    )

    t.throws(
      () => {
        micromark('a <b c={?} /> d', {extensions: [syntax({acorn})]})
      },
      /Could not parse expression with acorn: Unexpected token/,
      'should crash on invalid JS in an attribute value expression'
    )

    t.throws(
      () => {
        micromark('a <b {?} /> c', {extensions: [syntax({acorn})]})
      },
      /Could not parse expression with acorn: Unexpected token/,
      'should crash on invalid JS in an attribute expression'
    )

    t.throws(
      () => {
        micromark('a <b{c=d}={}/> f', {extensions: [syntax({acorn})]})
      },
      /Unexpected `ExpressionStatement` in code: expected an object spread/,
      'should crash on invalid JS in an attribute expression (2)'
    )

    t.equal(
      micromark('a <b c={(2)} d={<e />} /> f', {
        extensions: [syntax({acorn})],
        htmlExtensions: [html]
      }),
      '<p>a  f</p>',
      'should support parenthesized expressions'
    )

    t.end()
  })

  t.test('text (complete)', (t) => {
    t.equal(
      micromark('a <b> c', {extensions: [syntax()], htmlExtensions: [html]}),
      '<p>a  c</p>',
      'should support an unclosed element'
    )

    t.equal(
      micromark('a <> c', {extensions: [syntax()], htmlExtensions: [html]}),
      '<p>a  c</p>',
      'should support an unclosed fragment'
    )

    t.equal(
      micromark('a < \t>b</>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a &lt; \t&gt;b</p>',
      'should *not* support whitespace in the opening tag (fragment)'
    )

    t.equal(
      micromark('a < \nb\t>b</b>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a &lt;\nb\t&gt;b</p>',
      'should *not* support whitespace in the opening tag (named)'
    )

    t.throws(
      () => {
        micromark('a <!> b', {extensions: [syntax()]})
      },
      /Unexpected character `!` \(U\+0021\) before name, expected a character that can start a name, such as a letter, `\$`, or `_`/,
      'should crash on a nonconforming start identifier'
    )

    t.throws(
      () => {
        micromark('a <a></(> b.', {extensions: [syntax()]})
      },
      /Unexpected character `\(` \(U\+0028\) before name, expected a character that can start a name, such as a letter, `\$`, or `_`/,
      'should crash on a nonconforming start identifier in a closing tag'
    )

    t.equal(
      micromark('a <π /> b.', {extensions: [syntax()], htmlExtensions: [html]}),
      '<p>a  b.</p>',
      'should support non-ascii identifier start characters'
    )

    t.throws(
      () => {
        micromark('a <© /> b.', {extensions: [syntax()]})
      },
      /Unexpected character `©` \(U\+00A9\) before name, expected a character that can start a name, such as a letter, `\$`, or `_`/,
      'should crash on non-conforming non-ascii identifier start characters'
    )

    t.throws(
      () => {
        micromark('a <!--b-->', {extensions: [syntax()]})
      },
      /Unexpected character `!` \(U\+0021\) before name, expected a character that can start a name, such as a letter, `\$`, or `_` \(note: to create a comment in MDX, use `{\/\* text \*\/}`\)/,
      'should crash nicely on what might be a comment'
    )

    t.throws(
      () => {
        micromark('a <// b\nc/>', {extensions: [syntax()]})
      },
      /Unexpected character `\/` \(U\+002F\) before name, expected a character that can start a name, such as a letter, `\$`, or `_` \(note: JS comments in JSX tags are not supported in MDX\)/,
      'should crash nicely JS line comments inside tags (1)'
    )

    t.throws(
      () => {
        micromark('a <b// c\nd/>', {extensions: [syntax()]})
      },
      /Unexpected character `\/` \(U\+002F\) after self-closing slash, expected `>` to end the tag \(note: JS comments in JSX tags are not supported in MDX\)/,
      'should crash nicely JS line comments inside tags (2)'
    )

    t.throws(
      () => {
        micromark('a </*b*/c>', {extensions: [syntax()]})
      },
      /Unexpected character `\*` \(U\+002A\) before name, expected a character that can start a name, such as a letter, `\$`, or `_` \(note: JS comments in JSX tags are not supported in MDX\)/,
      'should crash nicely JS multiline comments inside tags (1)'
    )

    t.throws(
      () => {
        micromark('a <b/*c*/>', {extensions: [syntax()]})
      },
      /Unexpected character `\*` \(U\+002A\) after self-closing slash, expected `>` to end the tag \(note: JS comments in JSX tags are not supported in MDX\)/,
      'should crash nicely JS multiline comments inside tags (2)'
    )

    t.equal(
      micromark('a <a\u200Cb /> b.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a  b.</p>',
      'should support non-ascii identifier continuation characters'
    )

    t.throws(
      () => {
        micromark('a <a¬ /> b.', {extensions: [syntax()]})
      },
      /Unexpected character `¬` \(U\+00AC\) in name, expected a name character such as letters, digits, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on non-conforming non-ascii identifier continuation characters'
    )

    t.throws(
      () => {
        micromark('a <b@c.d>', {extensions: [syntax()]})
      },
      /Unexpected character `@` \(U\+0040\) in name, expected a name character such as letters, digits, `\$`, or `_`; whitespace before attributes; or the end of the tag \(note: to create a link in MDX, use `\[text]\(url\)`\)/,
      'should crash nicely on what might be an email link'
    )

    t.equal(
      micromark('a <a-->b</a-->.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a b.</p>',
      'should support dashes in names'
    )

    t.throws(
      () => {
        micromark('a <a?> c.', {extensions: [syntax()]})
      },
      /Unexpected character `\?` \(U\+003F\) in name, expected a name character such as letters, digits, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on nonconforming identifier continuation characters'
    )

    t.equal(
      micromark('a <abc . def.ghi>b</abc.def . ghi>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a b.</p>',
      'should support dots in names for method names'
    )

    t.throws(
      () => {
        micromark('a <b.c@d.e>', {extensions: [syntax()]})
      },
      /Unexpected character `@` \(U\+0040\) in member name, expected a name character such as letters, digits, `\$`, or `_`; whitespace before attributes; or the end of the tag \(note: to create a link in MDX, use `\[text]\(url\)`\)/,
      'should crash nicely on what might be an email link in member names'
    )

    t.equal(
      micromark('a <svg: rect>b</  svg :rect>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a b.</p>',
      'should support colons in names for local names'
    )

    t.throws(
      () => {
        micromark('a <a:+> c.', {extensions: [syntax()]})
      },
      /Unexpected character `\+` \(U\+002B\) before local name, expected a character that can start a name, such as a letter, `\$`, or `_` \(note: to create a link in MDX, use `\[text]\(url\)`\)/,
      'should crash on a nonconforming character to start a local name'
    )

    t.throws(
      () => {
        micromark('a <http://example.com>', {extensions: [syntax()]})
      },
      /Unexpected character `\/` \(U\+002F\) before local name, expected a character that can start a name, such as a letter, `\$`, or `_` \(note: to create a link in MDX, use `\[text]\(url\)`\)/,
      'should crash nicely on what might be a protocol in local names'
    )

    t.throws(
      () => {
        micromark('a <http: >', {extensions: [syntax()]})
      },
      /Unexpected character `>` \(U\+003E\) before local name, expected a character that can start a name, such as a letter, `\$`, or `_`/,
      'should crash nicely on what might be a protocol in local names'
    )

    t.throws(
      () => {
        micromark('a <a:b|> c.', {extensions: [syntax()]})
      },
      /Unexpected character `\|` \(U\+007C\) in local name, expected a name character such as letters, digits, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character in a local name'
    )

    t.throws(
      () => {
        micromark('a <a..> c.', {extensions: [syntax()]})
      },
      /Unexpected character `\.` \(U\+002E\) before member name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character to start a member name'
    )

    t.throws(
      () => {
        micromark('a <a.b,> c.', {extensions: [syntax()]})
      },
      /Unexpected character `,` \(U\+002C\) in member name, expected a name character such as letters, digits, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character in a member name'
    )

    t.throws(
      () => {
        micromark('a <a:b .> c.', {extensions: [syntax()]})
      },
      /Unexpected character `\.` \(U\+002E\) after local name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character after a local name'
    )

    t.throws(
      () => {
        micromark('a <a.b :> c.', {extensions: [syntax()]})
      },
      /Unexpected character `:` \(U\+003A\) after member name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character after a member name'
    )

    t.throws(
      () => {
        micromark('a <a => c.', {extensions: [syntax()]})
      },
      /Unexpected character `=` \(U\+003D\) after name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character after name'
    )

    t.equal(
      micromark('a <b {...props} {...rest}>c</b>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a c.</p>',
      'should support attribute expressions'
    )

    t.equal(
      micromark('a <b {...{"a": "b"}}>c</b>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a c.</p>',
      'should support nested balanced braces in attribute expressions'
    )

    t.equal(
      micromark('<a{...b}/>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>.</p>',
      'should support attribute expressions directly after a name'
    )

    t.equal(
      micromark('<a.b{...c}/>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>.</p>',
      'should support attribute expressions directly after a member name'
    )

    t.equal(
      micromark('<a:b{...c}/>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>.</p>',
      'should support attribute expressions directly after a local name'
    )

    t.equal(
      micromark('a <b c{...d}/>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a .</p>',
      'should support attribute expressions directly after boolean attributes'
    )

    t.equal(
      micromark('a <b c:d{...e}/>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a .</p>',
      'should support attribute expressions directly after boolean qualified attributes'
    )

    t.equal(
      micromark('a <b a {...props} b>c</b>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a c.</p>',
      'should support attribute expressions and normal attributes'
    )

    t.equal(
      micromark('a <b c     d="d"\t\tefg=\'e\'>c</b>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a c.</p>',
      'should support attributes'
    )

    t.throws(
      () => {
        micromark('a <b {...p}~>c</b>.', {extensions: [syntax()]})
      },
      /Unexpected character `~` \(U\+007E\) before attribute name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character before an attribute name'
    )

    t.throws(
      () => {
        micromark('a <b {...', {extensions: [syntax()]})
      },
      /Unexpected end of file in expression, expected a corresponding closing brace for `{`/,
      'should crash on a missing closing brace in attribute expression'
    )

    t.throws(
      () => {
        micromark('a <a b@> c.', {extensions: [syntax()]})
      },
      /Unexpected character `@` \(U\+0040\) in attribute name, expected an attribute name character such as letters, digits, `\$`, or `_`; `=` to initialize a value; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character in attribute name'
    )

    t.equal(
      micromark('a <b xml :\tlang\n= "de-CH" foo:bar>c</b>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a c.</p>',
      'should support prefixed attributes'
    )

    t.equal(
      micromark('a <b a b : c d : e = "f" g/>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a .</p>',
      'should support prefixed and normal attributes'
    )

    t.throws(
      () => {
        micromark('a <a b 1> c.', {extensions: [syntax()]})
      },
      /Unexpected character `1` \(U\+0031\) after attribute name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; `=` to initialize a value; or the end of the tag/,
      'should crash on a nonconforming character after an attribute name'
    )

    t.throws(
      () => {
        micromark('a <a b:#> c.', {extensions: [syntax()]})
      },
      /Unexpected character `#` \(U\+0023\) before local attribute name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`/,
      'should crash on a nonconforming character to start a local attribute name'
    )

    t.throws(
      () => {
        micromark('a <a b:c%> c.', {extensions: [syntax()]})
      },
      /Unexpected character `%` \(U\+0025\) in local attribute name, expected an attribute name character such as letters, digits, `\$`, or `_`; `=` to initialize a value; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character in a local attribute name'
    )

    t.throws(
      () => {
        micromark('a <a b:c ^> c.', {extensions: [syntax()]})
      },
      /Unexpected character `\^` \(U\+005E\) after local attribute name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; `=` to initialize a value; or the end of the tag/,
      'should crash on a nonconforming character after a local attribute name'
    )

    t.equal(
      micromark('a <b c={1 + 1}>c</b>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a c.</p>',
      'should support attribute value expressions'
    )

    t.equal(
      micromark('a <b c={1 + ({a: 1}).a}>c</b>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a c.</p>',
      'should support nested balanced braces in attribute value expressions'
    )

    t.throws(
      () => {
        micromark('a <a b=``> c.', {extensions: [syntax()]})
      },
      /Unexpected character `` ` `` \(U\+0060\) before attribute value, expected a character that can start an attribute value, such as `"`, `'`, or `{`/,
      'should crash on a nonconforming character before an attribute value'
    )

    t.throws(
      () => {
        micromark('a <a b=<c />> d.', {extensions: [syntax()]})
      },
      /Unexpected character `<` \(U\+003C\) before attribute value, expected a character that can start an attribute value, such as `"`, `'`, or `{` \(note: to use an element or fragment as a prop value in MDX, use `{<element \/>}`\)/,
      'should crash nicely on what might be a fragment, element as prop value'
    )

    t.throws(
      () => {
        micromark('a <a b="> c.', {extensions: [syntax()]})
      },
      /Unexpected end of file in attribute value, expected a corresponding closing quote `"`/,
      'should crash on a missing closing quote in double quoted attribute value'
    )

    t.throws(
      () => {
        micromark("a <a b='> c.", {extensions: [syntax()]})
      },
      /Unexpected end of file in attribute value, expected a corresponding closing quote `'`/,
      'should crash on a missing closing quote in single quoted attribute value'
    )

    t.throws(
      () => {
        micromark('a <a b={> c.', {extensions: [syntax()]})
      },
      /Unexpected end of file in expression, expected a corresponding closing brace for `{`/,
      'should crash on a missing closing brace in an attribute value expression'
    )

    t.throws(
      () => {
        micromark('a <a b=""*> c.', {extensions: [syntax()]})
      },
      /Unexpected character `\*` \(U\+002A\) before attribute name, expected a character that can start an attribute name, such as a letter, `\$`, or `_`; whitespace before attributes; or the end of the tag/,
      'should crash on a nonconforming character after an attribute value'
    )

    t.equal(
      micromark('<a b=""c/>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>.</p>',
      'should support an attribute directly after a value'
    )

    t.equal(
      micromark('<a{...b}c/>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>.</p>',
      'should support an attribute directly after an attribute expression'
    )

    t.throws(
      () => {
        micromark('a <a/b> c.', {extensions: [syntax()]})
      },
      /Unexpected character `b` \(U\+0062\) after self-closing slash, expected `>` to end the tag/,
      'should crash on a nonconforming character after a self-closing slash'
    )

    t.equal(
      micromark('<a/ \t>.', {extensions: [syntax()], htmlExtensions: [html]}),
      '<p>.</p>',
      'should support whitespace directly after closing slash'
    )

    t.doesNotThrow(() => {
      micromark('a > c.', {extensions: [syntax()], htmlExtensions: [html]})
    }, 'should *not* crash on closing angle in text')

    t.doesNotThrow(() => {
      micromark('a <>`<`</> c.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      })
    }, 'should *not* crash on opening angle in tick code in an element')

    t.doesNotThrow(() => {
      micromark('a <>`` ``` ``</>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      })
    }, 'should *not* crash on ticks in tick code in an element')

    t.equal(
      micromark('a </> c.', {extensions: [syntax()], htmlExtensions: [html]}),
      '<p>a  c.</p>',
      'should support a closing tag w/o open elements'
    )

    t.equal(
      micromark('a <></b>', {extensions: [syntax()], htmlExtensions: [html]}),
      '<p>a </p>',
      'should support mismatched tags (1)'
    )
    t.equal(
      micromark('a <b></>', {extensions: [syntax()], htmlExtensions: [html]}),
      '<p>a </p>',
      'should support mismatched tags (2)'
    )
    t.equal(
      micromark('a <a.b></a>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a </p>',
      'should support mismatched tags (3)'
    )
    t.equal(
      micromark('a <a></a.b>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a </p>',
      'should support mismatched tags (4)'
    )
    t.equal(
      micromark('a <a.b></a.c>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a </p>',
      'should support mismatched tags (5)'
    )
    t.equal(
      micromark('a <a:b></a>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a </p>',
      'should support mismatched tags (6)'
    )
    t.equal(
      micromark('a <a></a:b>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a </p>',
      'should support mismatched tags (7)'
    )
    t.equal(
      micromark('a <a:b></a:c>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a </p>',
      'should support mismatched tags (8)'
    )
    t.equal(
      micromark('a <a:b></a.b>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a </p>',
      'should support mismatched tags (9)'
    )

    t.equal(
      micromark('a <a>b</a/>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a b</p>',
      'should support a closing self-closing tag'
    )

    t.equal(
      micromark('a <a>b</a b>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a b</p>',
      'should support a closing tag w/ attributes'
    )

    t.equal(
      micromark('a <>b <>c</> d</>.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a b c d.</p>',
      'should support nested tags'
    )

    t.equal(
      micromark(
        '<x y="Character references can be used: &quot;, &apos;, &lt;, &gt;, &#x7B;, and &#x7D;, they can be named, decimal, or hexadecimal: &copy; &#8800; &#x1D306;" />.',
        {extensions: [syntax()], htmlExtensions: [html]}
      ),
      '<p>.</p>',
      'should support character references in attribute values'
    )

    t.equal(
      micromark(
        '<x>Character references can be used: &quot;, &apos;, &lt;, &gt;, &#x7B;, and &#x7D;, they can be named, decimal, or hexadecimal: &copy; &#8800; &#x1D306;</x>.',
        {extensions: [syntax()], htmlExtensions: [html]}
      ),
      "<p>Character references can be used: &quot;, ', &lt;, &gt;, {, and }, they can be named, decimal, or hexadecimal: © ≠ 팆.</p>",
      'should support character references in text'
    )

    t.equal(
      micromark('<x />.', {extensions: [syntax()], htmlExtensions: [html]}),
      '<p>.</p>',
      'should support as text if the closing tag is not the last thing'
    )

    t.equal(
      micromark('a <x />', {extensions: [syntax()], htmlExtensions: [html]}),
      '<p>a </p>',
      'should support as text if the opening is not the first thing'
    )

    t.equal(
      micromark('a *open <b> close* </b> c.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a <em>open  close</em>  c.</p>',
      'should not care about precedence between attention (emphasis)'
    )

    t.equal(
      micromark('a **open <b> close** </b> c.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a <strong>open  close</strong>  c.</p>',
      'should not care about precedence between attention (strong)'
    )

    t.equal(
      micromark('a [open <b> close](c) </b> d.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a <a href="c">open  close</a>  d.</p>',
      'should not care about precedence between label (link)'
    )

    t.equal(
      micromark('a ![open <b> close](c) </b> d.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>a <img src="c" alt="open  close" />  d.</p>',
      'should not care about precedence between label (image)'
    )

    t.equal(
      micromark('> a <b>\n> c </b> d.', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<blockquote>\n<p>a c  d.</p>\n</blockquote>',
      'should support line endings in elements'
    )

    t.equal(
      micromark('> a <b c="d\ne" /> f', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<blockquote>\n<p>a  f</p>\n</blockquote>',
      'should support line endings in attribute values'
    )

    t.equal(
      micromark('> a <b c={d\ne} /> f', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<blockquote>\n<p>a  f</p>\n</blockquote>',
      'should support line endings in attribute value expressions'
    )

    t.equal(
      micromark('> a <b {c\nd} /> e', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<blockquote>\n<p>a  e</p>\n</blockquote>',
      'should support line endings in attribute expressions'
    )

    t.equal(
      micromark('1 < 3', {extensions: [syntax()], htmlExtensions: [html]}),
      '<p>1 &lt; 3</p>',
      'should allow `<` followed by markdown whitespace as text in markdown'
    )

    t.end()
  })

  t.test('flow (agnostic)', (t) => {
    t.equal(
      micromark('<a />', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '',
      'should support a self-closing element'
    )

    t.equal(
      micromark('<a></a>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '',
      'should support a closed element'
    )

    t.equal(
      micromark('<a>\nb\n</a>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>b</p>\n',
      'should support an element w/ content'
    )

    t.equal(
      micromark('<a>\n- b\n</a>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<ul>\n<li>b</li>\n</ul>\n',
      'should support an element w/ containers as content'
    )

    t.equal(
      micromark('<a b c:d e="" f={/* g */} {...h} />', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '',
      'should support attributes'
    )

    t.end()
  })

  // Flow is mostly the same as `text`, so we only test the relevant
  // differences.
  t.test('flow (essence)', (t) => {
    t.equal(
      micromark('<a />', {extensions: [syntax()], htmlExtensions: [html]}),
      '',
      'should support an element'
    )

    t.equal(
      micromark('<a>\n- b\n</a>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<ul>\n<li>b</li>\n</ul>\n',
      'should support an element around a container'
    )

    t.equal(
      micromark('<x\n  y\n>  \nb\n  </x>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>b</p>\n',
      'should support a dangling `>` in a tag (not a block quote)'
    )

    t.equal(
      micromark('<a>  \nb\n  </a>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>b</p>\n',
      'should support trailing initial and final whitespace around tags'
    )

    t.equal(
      micromark('<a> <b>\t\nc\n  </b> </a>', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<p>c</p>\n',
      'should support tags after tags'
    )

    t.throws(
      () => {
        micromark('> <X\n/>', {extensions: [syntax()]})
      },
      /Unexpected lazy line in container/,
      'should not support lazy flow (1)'
    )

    t.throws(
      () => {
        micromark('> a\n> <X\n/>', {extensions: [syntax()]})
      },
      /Unexpected lazy line in container/,
      'should not support lazy flow (2)'
    )

    t.deepEqual(
      micromark('> a\n<X />', {
        extensions: [syntax()],
        htmlExtensions: [html]
      }),
      '<blockquote>\n<p>a</p>\n</blockquote>\n',
      'should not support lazy flow (3)'
    )

    t.end()
  })

  t.end()
})
