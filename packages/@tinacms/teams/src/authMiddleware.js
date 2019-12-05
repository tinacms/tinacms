'use strict'
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    return __assign.apply(this, arguments)
  }
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
var __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null)
      for (var k in mod)
        if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k]
    result['default'] = mod
    return result
  }
Object.defineProperty(exports, '__esModule', { value: true })
/**

Copyright 2019 Forestry.io Inc

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
var jwks_rsa_1 = __importDefault(require('jwks-rsa'))
var jwt = __importStar(require('jsonwebtoken'))
var fetch = require('node-fetch')
require('dotenv').config({
  path: '.env.' + process.env.NODE_ENV,
})
var VIRTUAL_SERVICE_DOMAIN = process.env.VIRTUAL_SERVICE_DOMAIN || 'tina.io'
var JWKS_URI = process.env.JWKS_URI || 'https://api.tina.io/dex/keys'
var CONNECTOR_ID =
  process.env.CONNECTOR_ID || '1714dd58-a2a5-4bee-99d4-07b0b3fcb2a7'
var TINA_TEAMS_API_URL =
  process.env.TINA_TEAMS_API_URL || 'https://api.tina.io/v1'
var AUTH_COOKIE_KEY = 'tina-auth'
function authenticate(req, res, next) {
  var token = req.cookies[AUTH_COOKIE_KEY]
  var decoded = jwt.decode(token, {
    complete: true,
  })
  if (!decoded) return next()
  var client = jwks_rsa_1.default({
    strictSsl: true,
    jwksUri: JWKS_URI,
  })
  client.getSigningKey(decoded.header.kid, function(err, key) {
    if (err) {
      return next()
    }
    var signingKey = key.publicKey || key.rsaPublicKey
    jwt.verify(
      token,
      signingKey,
      // { audience: 'urn:foo' },
      function(err, decoded) {
        var user
        if (!err && typeof decoded === 'object') {
          user = __assign({}, decoded)
        }
        req.user = user
        next()
      }
    )
  })
}
exports.authenticate = authenticate
function redirectNonAuthenticated(req, res, next) {
  if (req.user) {
    next()
  } else {
    var token = req.query.token
    //redirect if no token supplied
    if (token) {
      res.cookie(AUTH_COOKIE_KEY, token)
      res.redirect(req.originalUrl.split('?').shift())
    } else {
      var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
      console.log(
        'fullUrl https://api.' +
          VIRTUAL_SERVICE_DOMAIN +
          '/auth-proxy/redirect?connector=' +
          CONNECTOR_ID +
          '&origin=' +
          encodeURIComponent(removeTrailingSlash(fullUrl))
      )
      res.redirect(
        'https://api.' +
          VIRTUAL_SERVICE_DOMAIN +
          '/auth-proxy/redirect?connector=' +
          CONNECTOR_ID +
          '&origin=' +
          encodeURIComponent(removeTrailingSlash(fullUrl))
      )
    }
  }
}
exports.redirectNonAuthenticated = redirectNonAuthenticated
function authorize(req, res, next) {
  console.log(
    'dns ' +
      TINA_TEAMS_API_URL +
      '/sites/' +
      encodeURIComponent(req.get('host')) +
      '/access ' +
      JSON.stringify(req.user) +
      ' ' +
      req.cookies[AUTH_COOKIE_KEY]
  )
  fetch(
    TINA_TEAMS_API_URL +
      '/sites/' +
      encodeURIComponent(req.get('host')) +
      '/access',
    {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + req.cookies[AUTH_COOKIE_KEY] },
    }
  )
    .then(function(result) {
      if (result.ok) {
        next()
      } else {
        res.status(401)
        res.send('Unauthorized')
      }
    })
    .catch(function() {
      res.status(401)
      res.send('Unauthorized')
    })
}
exports.authorize = authorize
function removeTrailingSlash(url) {
  return url.replace(/\/$/, '')
}
