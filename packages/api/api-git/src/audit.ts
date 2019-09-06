export function audit(cb: Function) {
  let running = false
  let count = 0
  let nextArgs: any[] | null = null

  async function audited(...args: any[]) {
    if (running) {
      count = count + 1
      nextArgs = args
      if (DEBUG) console.log('waiting...', count)
    } else {
      running = true
      if (DEBUG) if (DEBUG) console.log('running')
      await cb(...args)
      running = false
      if (DEBUG) console.log('done')
      if (nextArgs) {
        args = nextArgs
        nextArgs = null
        count = 0
        if (DEBUG) console.log('starting cached')
        await audited(...args)
      }
    }
  }

  return audited
}
