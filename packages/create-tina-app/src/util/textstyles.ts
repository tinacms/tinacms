import chalk from 'chalk';

export const TextStyles = {
  tinaOrange: chalk.hex('#EC4816'),
  link: (url: string) =>
    `\u001b]8;;${url}\u0007${TextStyles.tinaOrange.underline(url)}\u001b]8;;\u0007`,
  cmd: chalk.bgBlackBright.bold.white,
  info: chalk.blue,
  success: chalk.green,
  warn: chalk.yellow,
  err: chalk.red,
  bold: chalk.bold,
};
