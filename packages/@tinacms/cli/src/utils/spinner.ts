/**

*/

import { Spinner } from 'cli-spinner'

async function localSpin<T>({
  waitFor,
  text,
}: {
  waitFor: () => Promise<T>
  text: string
}) {
  const spinner = new Spinner({
    text: `${text} %s`,
    stream: process.stderr,
    onTick: function (msg) {
      this.clearLine(this.stream)
      this.stream.write(msg)
    },
  })
  // List of spinners of we want a different one: https://github.com/helloIAmPau/node-spinner/blob/master/spinners.json
  spinner.setSpinnerString('⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏')

  // spinner start
  spinner.start()

  const res = await waitFor()

  // spinner stop
  spinner.stop()
  console.log('')
  return res
}

export function spin<T>({
  waitFor,
  text,
}: {
  waitFor: () => Promise<T>
  text: string
}): Promise<any> {
  if (process.env.CI) {
    console.log(text)
    return waitFor()
  } else {
    return localSpin({
      text,
      waitFor,
    })
  }
}
