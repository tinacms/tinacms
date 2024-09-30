import chalk from 'chalk'

export const TextStyles = {
  link: chalk.bold.cyan,
  cmd: chalk.inverse,
  info: chalk.blue,
  success: chalk.green,
  warn: chalk.yellow,
  err: chalk.red,
  bold: chalk.bold,
}

export class Logger {
  log(message: string) {
    console.info(message)
  }

  debug(message: string) {
    console.debug(TextStyles.info(`[DEBUG] ${message}`))
  }

  info(message: string) {
    console.info(TextStyles.info(`[INFO] ${message}`))
  }

  success(message: string) {
    console.log(TextStyles.success(`[SUCCESS] ${message}`))
  }

  cmd(message: string) {
    console.log(TextStyles.cmd(message))
  }

  warn(message: string) {
    console.warn(TextStyles.warn(`[WARNING] ${message}`))
  }

  err(message: string) {
    console.error(TextStyles.err(`[ERROR] ${message}`))
  }
}

export const log = new Logger()
