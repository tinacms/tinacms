// Copyright (c) 2015, npm, Inc
// Modified by Tina Enterprise
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
// SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
// OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
// CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

'use strict'
const { builtinModules: builtins } = require('module')

/**
 * @typedef {Object} ValidationResult
 * @property {string | null} message
 * @property {boolean} isError
 */

/**
 * Validates whether the provided name is valid on NPM.
 *
 * @param {string} name
 * @returns {ValidationResult}
 */
export default function validate(name) {
  if (name === null) {
    return {
      message: "name cannot be null",
      isError: true,
    };
  }

  if (name === undefined) {
    return {
      message: "name cannot be undefined",
      isError: true,
    };
  }

  if (typeof name !== 'string') {
    return {
      message: "name must be a string",
      isError: true,
    };
  }

  if (!name.length) {
    return {
      message: "name length must be greater than zero",
      isError: true,
    };
  }

  if (name.startsWith('.')) {
    return {
      message: "name cannot start with a period",
      isError: true,
    };
  }

  if (name.match(/^_/)) {
    return {
      message: "name cannot start with an underscore",
      isError: true,
    };
  }

  if (name.trim() !== name) {
    return {
      message: "name cannot contain leading or trailing spaces",
      isError: true,
    };
  }

  // No funny business
  const exclusionList = [
    'node_modules',
    'favicon.ico',
  ];

  exclusionList.forEach(function(excludedName) {
    if (name.toLowerCase() === excludedName) {
      return {
        message: excludedName + ' is not a valid package name',
        isError: true,
      };
    }
  })

  // Generate warnings for stuff that used to be allowed

  // core module names like http, events, util, etc
  if (builtins.includes(name.toLowerCase())) {
    return {
      message: name + ' is a core module name',
      isError: true,
    };
  }

  if (name.length > 214) {
    return {
      message: "name can no longer contain more than 214 characters",
      isError: true,
    };
  }

  // mIxeD CaSe nAMEs
  if (name.toLowerCase() !== name) {
    return {
      message: "name can no longer contain capital letters",
      isError: true,
    };
  }

  if (/[~'!()*]/.test(name.split('/').slice(-1)[0])) {
    return {
      message: 'name can no longer contain special characters ("~\'!()*")',
      isError: true,
    };
  }

  if (encodeURIComponent(name) !== name) {
    const scopedPackagePattern = new RegExp('^(?:@([^/]+?)[/])?([^/]+?)$')
    // Maybe it's a scoped package name, like @user/package
    const nameMatch = name.match(scopedPackagePattern)
    if (nameMatch) {
      const user = nameMatch[1]
      const pkg = nameMatch[2]

      if (pkg.startsWith('.')) {
        return {
          message: "name cannot start with a period",
          isError: true,
        };
      }

      if (encodeURIComponent(user) === user && encodeURIComponent(pkg) === pkg) {
        return { message: null, isError: false };
      }
    }

    return {
      message: "name can only contain URL-friendly characters",
      isError: true,
    };
  }

  return { message: null, isError: false };
}
