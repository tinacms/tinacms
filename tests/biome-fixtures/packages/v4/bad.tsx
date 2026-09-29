declare const err: unknown
declare const flag: boolean
declare const items: string[]

export const a = (err instanceof Error && err.message) || 'unknown'
export const b = err instanceof TypeError ? err.message : 'unknown'
export const c = () => (
  <div>
    {flag && <span>element</span>}
    {flag && (<span>parenthesized</span>)}
    {flag && <>fragment</>}
    {items.length > 0 && ((<b>nested</b>))}
    {items.length && (flag ? <i>ternary</i> : null)}
    {items.length && [<i key="a">array</i>]}
  </div>
)
