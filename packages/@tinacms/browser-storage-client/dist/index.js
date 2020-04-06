'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./browser-storage-client.cjs.production.min.js.js')
} else {
  module.exports = require('./browser-storage-client.cjs.development.js.js')
}
