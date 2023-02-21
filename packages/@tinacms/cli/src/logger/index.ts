/**

*/

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
