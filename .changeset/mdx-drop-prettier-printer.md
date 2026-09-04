---
"@tinacms/mdx": minor
---

Replace `prettier` with a small printer built for the one job it did here: turning a JSON object into the `{…}` expression that `stringifyProps` writes into `.mdx` attributes.

`prettier` accounted for 755 KB of the browser bundle, and the only thing ever handed to it was `JSON.stringify(value)`. No JSX, no expressions, nothing that needed a general-purpose formatter.

That output lands verbatim in content files, so the replacement has to lay objects out exactly as prettier did, or the next save rewrites props across every affected file in a repository. The new printer reproduces prettier 2.8.8's estree printer over the subset JSON can reach: quote preference, `printNumber` normalisation, numeric-string key unquoting, the concise `fill` layout for all-numeric arrays, the three assignment layouts, break propagation, and printWidth 80 measured with the `const dummyFunc = ` prefix. The bytes written into a repository do not change.

A differential test checks 8,849 inputs against prettier on every run, and all 66 `src/next/tests` fixtures stay byte-identical.

`prettier` moves to `devDependencies`, where it now exists only as that test's oracle. `esutils` and `emoji-regex` are added, 50 KB combined, because prettier defines its identifier and string-width rules in terms of those two packages.

On top of the acorn de-duplication, the browser bundle drops from 1,578,764 to 869,572 bytes raw and from 356,471 to 170,980 gzipped.
