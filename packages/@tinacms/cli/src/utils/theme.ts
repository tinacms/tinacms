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

import chalk from 'chalk'

export const successText = chalk.bold.green
export const focusText = chalk.bold
export const dangerText = chalk.bold.red
export const neutralText = chalk.bold.cyan
export const linkText = chalk.bold.cyan
export const labelText = chalk.bold
export const cmdText = chalk.inverse
export const indentedCmd = (str: any) => {
  return `  ┃ ` + str
}
export const logText = chalk.italic.gray
export const warnText = chalk.yellowBright.bgBlack
export const titleText = chalk.bgHex('d2f1f8').hex('ec4816')

export const CONFIRMATION_TEXT = chalk.dim('enter to confirm')
