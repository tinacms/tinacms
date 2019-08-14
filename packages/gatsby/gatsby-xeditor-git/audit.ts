export function audit(cb: Function) {
  let running = false
  let count = 0
  let nextArgs: any[] | null = null

  async function audited(...args: any[]) {
    if (running) {
      count = count + 1
      nextArgs = args
      console.log('waiting...', count)
    } else {
      running = true
      console.log('running')
      await cb(...args)
      running = false
      console.log('done')
      if (nextArgs) {
        args = nextArgs
        nextArgs = null
        count = 0
        console.log('starting cached')
        await audited(...args)
      }
    }
  }

  return audited
}
