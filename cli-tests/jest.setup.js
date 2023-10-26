'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var console_1 = require('@jest/console')
// beautify the jest console output
function simpleFormatter(type, message) {
  var TITLE_INDENT = '>'
  var CONSOLE_INDENT = TITLE_INDENT + '  '
  return message
    .split(/\n/)
    .map(function (line) {
      return CONSOLE_INDENT + ('[ ' + line + ' ]')
    })
    .join('\n')
}
global.console = new console_1.CustomConsole(
  process.stdout,
  process.stderr,
  simpleFormatter
)
