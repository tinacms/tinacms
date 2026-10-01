declare const err: unknown
declare const flag: boolean
declare const items: string[]

export function message() {
  if (err instanceof Error) {
    return err.message
  } else {
    return 'unknown'
  }
}

export function drain() {
  while (err instanceof RangeError) {
    return 'range'
  }
  if (err instanceof TypeError && flag) {
    return 'type'
  }
  return items.length && flag && 'text'
}

export const view = () => (
  <div>
    {flag ? <span>element</span> : null}
    {flag ? <>fragment</> : null}
    {flag && items.join(',')}
    {flag && (items.length ? 1 : 2)}
    {flag && [1, 2]}
    {flag && items.length ? <i>ternary</i> : null}
  </div>
)
