import chalk from 'chalk'
import isUnicodeSupported from './is-unicode-supported'
import log4js from 'log4js'
export const logger = log4js.getLogger()

// https://log4js-node.github.io/log4js-node/layouts.html
// This disables the logger prefix
log4js.configure({
  appenders: {
    out: { type: 'stdout', layout: { type: 'messagePassThrough' } },
  },
  categories: { default: { appenders: ['out'], level: 'info' } },
})
// set initial level to info
logger.level = 'info'

// Used from https://github.com/natemoo-re/clack/blob/main/packages/prompts/src/index.ts
function ansiRegex() {
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
  ].join('|')

  return new RegExp(pattern, 'g')
}
const bar = '│'
const strip = (str: string) => str.replace(ansiRegex(), '')
export const note = (message = '', title = '') => {
  const lines = `\n${message}\n`.split('\n')
  const len =
    lines.reduce((sum, ln) => {
      ln = strip(ln)
      return ln.length > sum ? ln.length : sum
    }, 0) + 2
  const msg = lines
    .map(
      (ln) =>
        `${chalk.gray(bar)}  ${chalk.white(ln)}${' '.repeat(
          len - strip(ln).length
        )}${chalk.gray(bar)}`
    )
    .join('\n')
  const underscoreLen = len - title.length - 1 > 0 ? len - title.length - 1 : 0
  process.stdout.write(
    `${chalk.gray(bar)}\n${chalk.green('○')}  ${chalk.reset(
      title
    )} ${chalk.gray('─'.repeat(underscoreLen) + '╮')}\n${msg}\n${chalk.gray(
      '├' + '─'.repeat(len + 2) + '╯'
    )}\n`
  )
}

export const log = (message = '') => {
  process.stdout.write(
    `${chalk.gray(S_BAR)}\n${chalk.green(S_STEP_SUBMIT)}  ${chalk.reset(
      message
    )}\n`
  )
}
export const warn = (message = '', path = '') => {
  process.stdout.write(
    `${chalk.gray(S_BAR)}\n${chalk.yellow(S_STEP_ERROR)}  ${chalk.reset(
      message
    )}\n${path && '       ' + chalk.cyan('path: ') + chalk.red(path)}`
  )
}
export const err = (message = '', path = '') => {
  process.stdout.write(
    `${chalk.gray(S_BAR)}\n${chalk.red(S_STEP_ERROR)}  ${chalk.reset(
      message
    )}\n${path && '       ' + chalk.cyan('path: ') + chalk.red(path)}`
  )
}

export const tnote = (message = '', title = '') => {
  const lines = `\n${message}\n`.split('\n')
  const len =
    Math.max(
      lines.reduce((sum, ln) => {
        ln = strip(ln)
        return ln.length > sum ? ln.length : sum
      }, 0),
      strip(title).length
    ) + 2
  const msg = lines
    .map(
      (ln) =>
        `${chalk.gray(S_BAR)}  ${chalk.dim(ln)}${' '.repeat(
          len - strip(ln).length
        )}${chalk.gray(S_BAR)}`
    )
    .join('\n')
  process.stdout.write(
    `${chalk.gray(S_BAR)}\n${chalk.green(S_STEP_SUBMIT)}  ${chalk.reset(
      title
    )} ${chalk.gray(
      S_BAR_H.repeat(Math.max(len - title.length - 1, 1)) + S_CORNER_TOP_RIGHT
    )}\n${msg}\n${chalk.gray(
      S_CONNECT_LEFT + S_BAR_H.repeat(len + 2) + S_CORNER_BOTTOM_RIGHT
    )}\n`
  )
  // process.stdout.write(
  //   `${chalk.gray(S_BAR)}\n${chalk.green(S_STEP_SUBMIT)}  ${chalk.reset(
  //     title
  //   )} ${chalk.gray(
  //     S_BAR_H.repeat(Math.max(len - title.length - 1, 1)) + S_CORNER_TOP_RIGHT
  //   )}\n${msg}\n${chalk.gray(
  //     S_CONNECT_LEFT + S_BAR_H.repeat(len + 2) + S_CORNER_BOTTOM_RIGHT
  //   )}\n`
  // )
}

export const summary = (content: {
  heading: string
  items: {
    heading: string
    emoji: string
    subItems: { key: string; value: string }[]
  }[]
}) => {
  const outString = []

  let longestKey = 0
  content.items.forEach((item) => {
    item.subItems.forEach((subItem) => {
      if (subItem.key.length > longestKey) {
        longestKey = subItem.key.length
      }
    })
  })

  content.items.forEach((item) => {
    outString.push(`${item.emoji} ${chalk.cyan(item.heading)}`)
    item.subItems.forEach((subItem) => {
      const spaces = longestKey - subItem.key.length + 4
      outString.push(
        `   ${subItem.key}:${[...Array(spaces)].join(' ')}${chalk.cyan(
          subItem.value
        )}`
      )
    })
    outString.push(``)
  })

  if (process.env.CI) {
    logger.info(JSON.stringify(content, null, 2))
  } else {
    note(outString.join('\n'), content.heading)
  }
}

const unicode = isUnicodeSupported()

const s = (c: string, fallback: string) => (unicode ? c : fallback)
const S_STEP_ACTIVE = s('◆', '*')
const S_STEP_CANCEL = s('■', 'x')
const S_STEP_ERROR = s('▲', 'x')
const S_STEP_SUBMIT = s('◇', 'o')

const S_BAR_START = s('┌', 'T')
const S_BAR = s('│', '|')
const S_BAR_END = s('└', '—')

const S_RADIO_ACTIVE = s('●', '>')
const S_RADIO_INACTIVE = s('○', ' ')
const S_CHECKBOX_ACTIVE = s('◻', '[•]')
const S_CHECKBOX_SELECTED = s('◼', '[+]')
const S_CHECKBOX_INACTIVE = s('◻', '[ ]')
const S_PASSWORD_MASK = s('▪', '•')

const S_BAR_H = s('─', '-')
const S_CORNER_TOP_RIGHT = s('╮', '+')
const S_CONNECT_LEFT = s('├', '+')
const S_CORNER_BOTTOM_RIGHT = s('╯', '+')

const S_INFO = s('●', '•')
const S_SUCCESS = s('◆', '*')
const S_WARN = s('▲', '!')
const S_ERROR = s('■', 'x')
