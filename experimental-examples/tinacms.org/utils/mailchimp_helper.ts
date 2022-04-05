/*
 ** Adapted from @benjaminhoffman's gatsby-plugin-mailchimp
 */

import jsonp from 'jsonp'
import { validate } from 'email-validator'

/**
 * Make a jsonp request to user's mailchimp list
 *  `param` object avoids CORS issues
 *  timeout to 3.5s so user isn't waiting forever
 *  usually occurs w/ privacy plugins enabled
 *  3.5s is a bit longer than the time it would take on a Slow 3G connection
 *
 * @param {String} url - concatenated string of user's gatsby-config.js
 *  options, along with any MC list fields as query params.
 *
 * @return {Promise} - a promise that resolves a data object
 *  or rejects an error object
 */

const subscribeEmailToMailchimp = (url) =>
  new Promise((resolve, reject) =>
    jsonp(url, { param: 'c', timeout: 3500 }, (err, data) => {
      if (err) reject(err)
      if (data) resolve(data)
    })
  )

/**
 * Subscribe an email address to a Mailchimp email list.
 * We use ES5 function syntax (instead of arrow) because we need `arguments.length`
 *
 * @param {String} email - required; the email address you want to subscribe
 * NOTE: For the EmailForm, I removed fields and endpointOverride since we
 * weren't using them. check the original source code if they are needed
 * https://github.com/benjaminhoffman/gatsby-plugin-mailchimp/blob/master/src/index.js
 * @return {Object} -
 *  {
 *    result: <String>(`success` || `error`)
 *    msg: <String>(`Thank you for subscribing!` || `The email you entered is not valid.`),
 *  }
 */

export const addToMailchimp = function addToMailchimp(email) {
  const isEmailValid = validate(email)
  const emailEncoded = encodeURIComponent(email)
  if (!isEmailValid) {
    return Promise.resolve({
      result: 'error',
      msg: 'The email you entered is not valid.',
    })
  }

  // eslint-disable-next-line no-undef
  let endpoint = process.env.MAILCHIMP_ADDRESS

  // Generates MC endpoint for our jsonp request. We have to
  // change `/post` to `/post-json` otherwise, MC returns an error
  endpoint = endpoint.replace(/\/post/g, '/post-json')
  const queryParams = `&EMAIL=${emailEncoded}`
  const url = `${endpoint}${queryParams}`

  return subscribeEmailToMailchimp(url)
}
