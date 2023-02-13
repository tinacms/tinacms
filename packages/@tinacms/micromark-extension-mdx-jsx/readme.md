# micromark-extension-mdx-jsx

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[micromark][] extension to support MDX JSX (`<Component />`).

## Contents

*   [What is this?](#what-is-this)
*   [When to use this](#when-to-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`mdxJsx(options?)`](#mdxjsxoptions)
*   [Authoring](#authoring)
*   [Syntax](#syntax)
*   [Errors](#errors)
    *   [Unexpected end of file $at, expected $expect](#unexpected-end-of-file-at-expected-expect)
    *   [Unexpected character $at, expected $expect](#unexpected-character-at-expected-expect)
*   [Tokens](#tokens)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package contains extensions that add support for JSX enabled by MDX to
[`micromark`][micromark].
It mostly matches how JSX works in most places that support it (TypeScript,
Babel, esbuild, etc).

## When to use this

These tools are all low-level.
In many cases, you want to use [`remark-mdx`][remark-mdx] with remark instead.
When you are using [`mdx-js/mdx`][mdxjs], that is already included.

Even when you want to use `micromark`, you likely want to use
[`micromark-extension-mdxjs`][micromark-extension-mdxjs] to support all MDX
features.
That extension includes this extension.

When working with [`mdast-util-from-markdown`][mdast-util-from-markdown], you
must combine this package with [`mdast-util-mdx-jsx`][mdast-util-mdx-jsx].

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, or 18.0+), install with [npm][]:

```sh
npm install micromark-extension-mdx-jsx
```

In Deno with [`esm.sh`][esmsh]:

```js
import {mdxJsx} from 'https://esm.sh/micromark-extension-mdx-jsx@1'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {mdxJsx} from 'https://esm.sh/micromark-extension-mdx-jsx@1?bundle'
</script>
```

## Use

```js
import {micromark} from 'micromark'
import {mdxJsx} from 'micromark-extension-mdx-jsx'

const output = micromark('a <b c d="e" /> f', {extensions: [mdxJsx()]})

console.log(output)
```

Yields:

```html
<p>a  f</p>
```

…which is useless: go to a syntax tree with
[`mdast-util-from-markdown`][mdast-util-from-markdown] and
[`mdast-util-mdx-jsx`][mdast-util-mdx-jsx] instead.

## API

This package exports the identifier `mdxJsx`.
There is no default export.

The export map supports the endorsed [`development` condition][condition].
Run `node --conditions development module.js` to get instrumented dev code.
Without this condition, production code is loaded.

### `mdxJsx(options?)`

Add support for parsing JSX in markdown.

Function that can be called to get a syntax extension for micromark (passed
in `extensions`).

##### `options`

Configuration (optional).

###### `options.acorn`

Acorn parser to use ([`Acorn`][acorn], optional).

###### `options.acornOptions`

Options to pass to acorn (`Object`, default: `{ecmaVersion: 2020, sourceType:
'module'}`).
All fields can be set.
Positional info (`loc`, `range`) is set on ES nodes regardless of acorn options.

###### `options.addResult`

Whether to add an `estree` field to the `mdxTextJsx` and `mdxFlowJsx` tokens
with the results from acorn (`boolean`, default: `false`).

## Authoring

When authoring markdown with JSX, keep in mind that MDX is a whitespace
sensitive and line-based language, while JavaScript is insensitive to
whitespace.
This affects how markdown and JSX interleave with eachother in MDX.
For more info on how it works, see [§ Interleaving][interleaving] on the MDX
site.

Some features of JS(X) are not supported, notably:

###### Comments inside tags

JavaScript comments in JSX are not supported.

Incorrect:

```jsx
<hi/*comment!*//>
<hello// comment!
/>
```

Correct:

```jsx
<hi/>
<hello
/>
```

A PR that adds support for them would be accepted.

###### Element or fragment attribute values

JSX elements or JSX fragments as attribute values are not supported.
The reason for this change is that it would be confusing whether Markdown would
work.

Incorrect:

```jsx
<welcome name=<>Venus</> />
<welcome name=<span>Pluto</span> />
```

Correct:

```jsx
<welcome name='Mars' />
```

###### Greater than (`>`) and right curly brace (`}`)

JSX does not allow U+003E GREATER THAN (`>`) or U+007D RIGHT CURLY BRACE (`}`)
literally in text, they need to be encoded as character references (or
expressions).
There is no good reason for this (some JSX parsers agree with us and don’t
crash either).
Therefore, in MDX, U+003E GREATER THAN (`>`) and U+007D RIGHT CURLY BRACE
(`}`) are fine literally and don’t need to be encoded.

## Syntax

This extensions support MDX both agnostic and gnostic to JavaScript.
The first is agnostic to the programming language (it could contain attribute
expressions and attribute value expressions with Rust or so), the last is
specific to JavaScript (in which case attribute expressions must be spread
expressions).
To turn on gnostic mode, pass `acorn`.

The syntax of JSX supported here is described in [W3C Backus–Naur form][w3c-bnf]
with the following additions:

1.  **`A - B`** — matches any string that matches `A` but does not match `B`.
2.  **`'string'`** — same as **`"string"`** but with single quotes.
3.  **`BREAK`** — lookahead match for a block break opportunity (either
    EOF (end of file), U+000A LINE FEED (LF), U+000D CARRIAGE RETURN (CR), or
    another JSX tag)

The syntax is defined as follows, however, do note that interleaving (mixing)
of markdown and MDX is defined elsewhere, and that the constraints are imposed
in [`mdast-util-mdx-jsx`][mdast-util-mdx-jsx].

<!--grammar start-->

<pre><code>; Entries
<a id=x-mdx-flow href=#x-mdx-flow>mdxFlow</a> ::= *<a href=#x-space-or-tab>spaceOrTab</a> <a href=#x-element>element</a> *<a href=#x-space-or-tab>spaceOrTab</a> BREAK
<a id=x-mdx-text href=#x-mdx-text>mdxText</a> ::= <a href=#x-element>element</a>

<a id=x-element href=#x-element>element</a> ::= <a href=#x-self-closing>selfClosing</a> | <a href=#x-closed>closed</a>
<a id=x-self-closing href=#x-self-closing>selfClosing</a> ::=
  ; constraint: tag MUST be named, MUST NOT be closing, and MUST be self-closing
  <a href=#x-tag>tag</a>
<a id=x-closed href=#x-closed>closed</a> ::=
  ; constraint: tag MUST NOT be closing and MUST NOT be self-closing
  <a href=#x-tag>tag</a>
  *<a href=#x-data>data</a>
  ; constraint: tag MUST be closing, MUST NOT be self-closing, MUST NOT have
  ; attributes, and either both tags MUST have the same name or both tags MUST
  ; be nameless
  <a href=#x-tag>tag</a>

<a id=x-data href=#x-data>data</a> ::= <a href=#x-element>element</a> | <a href=#x-text>text</a>

; constraint: markdown whitespace (<a href=#x-space-or-tab>spaceOrTab</a> | '\r' | '\n') is NOT
; allowed directly after `&lt;` in order to allow `1 &lt; 3` in markdown.
<a id=x-tag href=#x-tag>tag</a> ::=
  '<' *1<a href=#x-closing>closing</a>
  *1(*<a href=#x-whitespace>whitespace</a> <a href=#x-name>name</a> *1<a href=#x-attributes-after-identifier>attributesAfterIdentifier</a> *1<a href=#x-closing>closing</a>)
  *<a href=#x-whitespace>whitespace</a> '>'

<a id=x-attributes-after-identifier href=#x-attributes-after-identifier>attributesAfterIdentifier</a> ::=
  1*<a href=#x-whitespace>whitespace</a> (<a href=#x-attributes-boolean>attributesBoolean</a> | <a href=#x-attributes-value>attributesValue</a>) |
  *<a href=#x-whitespace>whitespace</a> <a href=#x-attributes-expression>attributesExpression</a> |
<a id=x-attributes-after-value href=#x-attributes-after-value>attributesAfterValue</a> ::=
  *<a href=#x-whitespace>whitespace</a> (<a href=#x-attributes-boolean>attributesBoolean</a> | <a href=#x-attributes-expression>attributesExpression</a> | <a href=#x-attributes-value>attributesValue</a>)
<a name=attributes-boolean href=#x-attributes-boolean>attributesBoolean</a> ::= <a href=#x-key>key</a> *1<a href=#x-attributes-after-identifier>attributesAfterIdentifier</a>
; Note: in gnostic mode the value of the expression must instead be a single valid ES spread
; expression
<a name=attributes-expression href=#x-attributes-expression>attributesExpression</a> ::= <a href=#x-expression>expression</a> *1<a href=#x-attributes-after-value>attributesAfterValue</a>
<a name=attributes-value href=#x-attributes-value>attributesValue</a> ::= <a href=#x-key>key</a> <a href=#x-initializer>initializer</a> *1<a href=#x-attributes-after-value>attributesAfterValue</a>

<a id=x-closing href=#x-closing>closing</a> ::= *<a href=#x-whitespace>whitespace</a> '/'

<a id=x-name href=#x-name>name</a> ::= <a href=#x-identifier>identifier</a> *1(<a href=#x-local>local</a> | <a href=#x-members>members</a>)
<a id=x-key href=#x-key>key</a> ::= <a href=#x-identifier>identifier</a> *1<a href=#x-local>local</a>
<a id=x-local href=#x-local>local</a> ::= *<a href=#x-whitespace>whitespace</a> ':' *<a href=#x-whitespace>whitespace</a> <a href=#x-identifier>identifier</a>
<a id=x-members href=#x-members>members</a> ::= <a href=#x-member>member</a> *<a href=#x-member>member</a>
<a id=x-member href=#x-member>member</a> ::= *<a href=#x-whitespace>whitespace</a> '.' *<a href=#x-whitespace>whitespace</a> <a href=#x-identifier>identifier</a>

<a id=x-identifier href=#x-identifier>identifier</a> ::= <a href=#x-identifier-start>identifierStart</a> *<a href=#x-identifier-part>identifierPart</a>
<a id=x-initializer href=#x-initializer>initializer</a> ::= *<a href=#x-whitespace>whitespace</a> '=' *<a href=#x-whitespace>whitespace</a> <a href=#x-value>value</a>
<a id=x-value href=#x-value>value</a> ::= <a href=#x-double-quoted>doubleQuoted</a> | <a href=#x-single-quoted>singleQuoted</a> | <a href=#x-expression>expression</a>
; Note: in gnostic mode the value must instead be a single valid ES expression
<a id=x-expression href=#x-expression>expression</a> ::= '{' *(<a href=#x-expression-text>expressionText</a> | <a href=#x-expression>expression</a>) '}'

<a id=x-double-quoted href=#x-double-quoted>doubleQuoted</a> ::= '"' *<a href=#x-double-quoted-text>doubleQuotedText</a> '"'
<a id=x-single-quoted href=#x-single-quoted>singleQuoted</a> ::= "'" *<a href=#x-single-quoted-text>singleQuotedText</a> "'"

<a id=x-space-or-tab href=#x-space-or-tab>spaceOrTab</a> ::= ' ' | '\t'
<a id=x-text href=#x-text>text</a> ::= <a href=#x-character>character</a> - '<' - '{'
<a id=x-whitespace href=#x-whitespace>whitespace</a> ::= <a href=#x-es-whitespace>esWhitespace</a>
<a id=x-double-quoted-text href=#x-double-quoted-text>doubleQuotedText</a> ::= <a href=#x-character>character</a> - '"'
<a id=x-single-quoted-text href=#x-single-quoted-text>singleQuotedText</a> ::= <a href=#x-character>character</a> - "'"
<a id=x-expression-text href=#x-expression-text>expressionText</a> ::= <a href=#x-character>character</a> - '{' - '}'
<a id=x-identifier-start href=#x-identifier-start>identifierStart</a> ::= <a href=#x-es-identifier-start>esIdentifierStart</a>
<a id=x-identifier-part href=#x-identifier-part>identifierPart</a> ::= <a href=#x-es-identifier-part>esIdentifierPart</a> | '-'

; Unicode
; Any unicode code point
<a id=x-character href=#x-character>character</a> ::=

; ECMAScript
; See “IdentifierStart”: &lt;<a href=https://tc39.es/ecma262/#prod-IdentifierStart>https://tc39.es/ecma262/#prod-IdentifierStart</a>>
<a id=x-es-identifier-start href=#x-es-identifier-start>esIdentifierStart</a> ::=
; See “IdentifierPart”: &lt;<a href=https://tc39.es/ecma262/#prod-IdentifierPart>https://tc39.es/ecma262/#prod-IdentifierPart</a>>
<a id=x-es-identifier-part href=#x-es-identifier-part>esIdentifierPart</a> ::=
; See “Whitespace”: &lt;<a href=https://tc39.es/ecma262/#prod-WhiteSpace>https://tc39.es/ecma262/#prod-WhiteSpace</a>>
<a id=x-es-whitespace href=#x-es-whitespace>esWhitespace</a> ::=
</code></pre>

<!--grammar end-->

## Errors

In gnostic mode, expressions are parsed with
[`micromark-extension-mdx-expression`][micromark-extension-mdx-expression],
which throws some other errors.

### Unexpected end of file $at, expected $expect

This error occurs for many different reasons if something was opened but not
closed (source: `micromark-extension-mdx-jsx`, rule id: `unexpected-eof`).

Some examples are:

```markdown
<
</
<a
<a:
<a.
<a b
<a b:
<a b=
<a b="
<a b='
<a b={
<a/
```

### Unexpected character $at, expected $expect

This error occurs for many different reasons if an unexpected character is seen
(source: `micromark-extension-mdx-jsx`, rule id: `unexpected-character`).

Some examples are:

```markdown
<.>
</.>
<a?>
<a:+>
<a./>
<a b!>
<a b:1>
<a b=>
<a/->
```

## Tokens

Many tokens are used:

*   `mdxJsxFlowTag` for the whole JSX tag (`<a>`)
*   `mdxJsxTextTag` ^
*   `mdxJsxFlowTagMarker` for the tag markers (`<`, `>`)
*   `mdxJsxTextTagMarker` ^
*   `mdxJsxFlowTagClosingMarker` for the `/` marking a closing tag (`</a>`)
*   `mdxJsxTextTagClosingMarker` ^
*   `mdxJsxFlowTagSelfClosingMarker` for the `/` marking a self-closing tag
    (`<a/>`)
*   `mdxJsxTextTagSelfClosingMarker` ^
*   `mdxJsxFlowTagName` for the whole tag name (`a:b` in `<a:b>`)
*   `mdxJsxTextTagName` ^
*   `mdxJsxFlowTagNamePrimary` for the first name (`a` in `<a:b>`)
*   `mdxJsxTextTagNamePrimary` ^
*   `mdxJsxFlowTagNameMemberMarker` for the `.` marking in members (`<a.b>`)
*   `mdxJsxTextTagNameMemberMarker` ^
*   `mdxJsxFlowTagNameMember` for member names (`b` in `<a:b>`)
*   `mdxJsxTextTagNameMember` ^
*   `mdxJsxFlowTagNamePrefixMarker` for the `:` between primary and local
    (`<a:b>`)
*   `mdxJsxTextTagNamePrefixMarker` ^
*   `mdxJsxFlowTagNameLocal` for the local name (`b` in `<a:b>`)
*   `mdxJsxTextTagNameLocal` ^
*   `mdxJsxFlowTagExpressionAttribute` for whole expression attributes
    (`<a {...b}>`)
*   `mdxJsxTextTagExpressionAttribute` ^
*   `mdxJsxFlowTagExpressionAttributeMarker` for `{`, `}` in expression
    attributes
*   `mdxJsxTextTagExpressionAttributeMarker` ^
*   `mdxJsxFlowTagExpressionAttributeValue` for chunks of what’s inside
    expression attributes
*   `mdxJsxTextTagExpressionAttributeValue` ^
*   `mdxJsxFlowTagAttribute` for a whole normal attribute (`<a b>`)
*   `mdxJsxTextTagAttribute` ^
*   `mdxJsxFlowTagAttributeName` for the whole name of an attribute (`b:c` in
    `<a b:c>`)
*   `mdxJsxTextTagAttributeName` ^
*   `mdxJsxFlowTagAttributeNamePrimary` for the first name of an attribute (`b`
    in `<a b:c>`)
*   `mdxJsxTextTagAttributeNamePrimary` ^
*   `mdxJsxFlowTagAttributeNamePrefixMarker` for the `:` between primary and
    local (`<a b:c>`)
*   `mdxJsxTextTagAttributeNamePrefixMarker` ^
*   `mdxJsxFlowTagAttributeNameLocal` for the local name of an attribute (`c`
    in `<a b:c>`)
*   `mdxJsxTextTagAttributeNameLocal` ^
*   `mdxJsxFlowTagAttributeInitializerMarker` for the `=` between an attribute
    name and value
*   `mdxJsxTextTagAttributeInitializerMarker` ^
*   `mdxJsxFlowTagAttributeValueLiteral` for a string attribute value
    (`<a b="">`)
*   `mdxJsxTextTagAttributeValueLiteral` ^
*   `mdxJsxFlowTagAttributeValueLiteralMarker` for the quotes around a string
    attribute value (`"` or `'`)
*   `mdxJsxTextTagAttributeValueLiteralMarker` ^
*   `mdxJsxFlowTagAttributeValueLiteralValue` for chunks of what’s inside
    string attribute values
*   `mdxJsxTextTagAttributeValueLiteralValue` ^
*   `mdxJsxFlowTagAttributeValueExpression` for an expression attribute value
    (`<a b={1}>`)
*   `mdxJsxTextTagAttributeValueExpression` ^
*   `mdxJsxFlowTagAttributeValueExpressionMarker` for the `{` and `}` of
    expression attribute values
*   `mdxJsxTextTagAttributeValueExpressionMarker` ^
*   `mdxJsxFlowTagAttributeValueExpressionValue` for chunks of what’s inside
    expression attribute values
*   `mdxJsxTextTagAttributeValueExpressionValue` ^

## Types

This package is fully typed with [TypeScript][].
It exports the additional type `Options`.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
It also works in Deno and modern browsers.

## Security

This package deals with compiling JavaScript.
If you do not trust the JavaScript, this package does nothing to change that.

## Related

*   [`micromark/micromark-extension-mdxjs`][micromark-extension-mdxjs]
    — micromark extension to support MDX
*   [`syntax-tree/mdast-util-mdx-jsx`][mdast-util-mdx-jsx]
    — mdast utility to support MDX JSX
*   [`remark-mdx`][remark-mdx]
    — remark plugin to support MDX syntax

## Contribute

See [`contributing.md` in `micromark/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/micromark/micromark-extension-mdx-jsx/workflows/main/badge.svg

[build]: https://github.com/micromark/micromark-extension-mdx-jsx/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-mdx-jsx.svg

[coverage]: https://codecov.io/github/micromark/micromark-extension-mdx-jsx

[downloads-badge]: https://img.shields.io/npm/dm/micromark-extension-mdx-jsx.svg

[downloads]: https://www.npmjs.com/package/micromark-extension-mdx-jsx

[size-badge]: https://img.shields.io/bundlephobia/minzip/micromark-extension-mdx-jsx.svg

[size]: https://bundlephobia.com/result?p=micromark-extension-mdx-jsx

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/micromark/micromark/discussions

[npm]: https://docs.npmjs.com/cli/install

[esmsh]: https://esm.sh

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/micromark/.github/blob/HEAD/contributing.md

[support]: https://github.com/micromark/.github/blob/HEAD/support.md

[coc]: https://github.com/micromark/.github/blob/HEAD/code-of-conduct.md

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[condition]: https://nodejs.org/api/packages.html#packages_resolving_user_conditions

[micromark]: https://github.com/micromark/micromark

[micromark-extension-mdxjs]: https://github.com/micromark/micromark-extension-mdxjs

[micromark-extension-mdx-expression]: https://github.com/micromark/micromark-extension-mdx-expression

[mdast-util-mdx-jsx]: https://github.com/syntax-tree/mdast-util-mdx-jsx

[mdast-util-from-markdown]: https://github.com/syntax-tree/mdast-util-from-markdown

[remark-mdx]: https://mdxjs.com/packages/remark-mdx/

[mdxjs]: https://mdxjs.com

[interleaving]: https://mdxjs.com/docs/what-is-mdx/#interleaving

[w3c-bnf]: https://www.w3.org/Notation.html

[acorn]: https://github.com/acornjs/acorn
