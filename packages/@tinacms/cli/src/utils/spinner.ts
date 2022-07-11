import { Spinner } from 'cli-spinner'

export async function spin<T>({ waitFor }: { waitFor: () => Promise<T> }) {
  const spinner = new Spinner({
    text: 'Indexing... %s',
    stream: process.stderr,
    onTick: function (msg) {
      this.clearLine(this.stream)
      this.stream.write(msg)
    },
  })
  spinner.setSpinnerString('⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏')

  // spinner start
  spinner.start()
  const res = await waitFor()
  // spinner stop
  spinner.stop()
  return res
}
