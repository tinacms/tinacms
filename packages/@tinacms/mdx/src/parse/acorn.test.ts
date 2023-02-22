/**



*/
import { it, expect, describe } from 'vitest'
import { trimFragments } from './acorn'

describe('trimFragments', () => {
  it('initial fragment on a new line', () => {
    expect(
      trimFragments(`
  <>
    foo bar baz left
  </>
    `)
    ).toMatchInlineSnapshot('"    foo bar baz left"')
  })
  it('fragment with no newlines', () => {
    expect(
      trimFragments(`<>
    foo bar baz left
  </>`)
    ).toMatchInlineSnapshot('"    foo bar baz left"')
  })
  it('fragment with extra fragments inside', () => {
    expect(
      trimFragments(`<>
      Ok
      <>
    foo bar baz left
    </>
  </>`)
    ).toMatchInlineSnapshot(`
      "      Ok
            <>
          foo bar baz left
          </>"
    `)
  })
  it('preserves newlines', () => {
    expect(
      trimFragments(`<>
      Ok

    foo bar baz left
  </>`)
    ).toMatchInlineSnapshot(`
      "      Ok

          foo bar baz left"
    `)
  })
})
