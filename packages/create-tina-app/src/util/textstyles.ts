import chalk from 'chalk';

// Visible width of a string, ignoring SGR colour codes and OSC 8 hyperlink
// wrappers (the visible URL text between the wrappers is kept).
const stripAnsi = (str: string) =>
  str
    // OSC 8 hyperlink wrappers: ESC ] 8 ; ; <params> BEL
    .replace(/\]8;;[^]*/g, '')
    // SGR colour codes: ESC [ <params> m
    .replace(/\[[0-9;]*m/g, '');

/**
 * Draw a bordered box around one or more lines so a message stands out from the
 * surrounding log output.
 */
export const box = (
  lines: string[],
  color: (s: string) => string = chalk.hex('#EC4816')
) => {
  const pad = 1;
  const width = Math.max(...lines.map((l) => stripAnsi(l).length));
  const rule = color('─'.repeat(width + pad * 2));
  const top = `${color('┌')}${rule}${color('┐')}`;
  const bottom = `${color('└')}${rule}${color('┘')}`;
  const body = lines.map((line) => {
    const trailing = ' '.repeat(width - stripAnsi(line).length);
    return `${color('│')}${' '.repeat(pad)}${line}${trailing}${' '.repeat(pad)}${color('│')}`;
  });
  return [top, ...body, bottom].join('\n');
};

export const TextStyles = {
  tinaOrange: chalk.hex('#EC4816'),
  link: (url: string) =>
    `\u001b]8;;${url}\u0007${chalk.cyan.underline(url)}\u001b]8;;\u0007`,
  cmd: chalk.bgBlackBright.bold.white,
  info: chalk.blue,
  success: chalk.green,
  warn: chalk.yellow,
  err: chalk.red,
  bold: chalk.bold,
};

export const TextStylesBold = {
  tinaOrange: chalk.hex('#EC4816').bold,
  link: (url: string) =>
    `\u001b]8;;${url}\u0007${chalk.cyan.underline(url)}\u001b]8;;\u0007`,
  cmd: chalk.bgBlackBright.bold.white,
  info: chalk.blue,
  success: chalk.green,
  warn: chalk.yellow,
  err: chalk.red,
  bold: chalk.bold,
};
