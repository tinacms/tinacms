/**

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
export const indentText = (str: any) => {
  return `   ` + str
}
export const logText = chalk.italic.gray
export const warnText = chalk.yellowBright.bgBlack
export const titleText = chalk.bgHex('d2f1f8').hex('ec4816')

export const CONFIRMATION_TEXT = chalk.dim('enter to confirm')
