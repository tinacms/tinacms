/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Spinner } from 'cli-spinner'

export async function spin<T>({
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
  return res
}
