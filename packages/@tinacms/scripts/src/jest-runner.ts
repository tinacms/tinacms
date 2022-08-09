/**
Copyright 2021 Forestry.io Holdings, Inc.
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

import sucraseRunner from '@sucrase/jest-plugin'

const config = {
  verbose: true,
  transform: {
    '.(ts|tsx)': '@tinacms/scripts/dist/jest-runner.js',
    '.(js)': '@tinacms/scripts/dist/jest-runner.js',
  },
  // FIXME: unified is causing us to need to transform all of it's
  // deps. We can pass those in here, but it's sort of a waterfall
  // because nothing in the unified ecosystem is using CJS.
  transformIgnorePatterns: [],
  testRegex: '(\\.spec|.test)\\.(ts|tsx|js)$',
  modulePaths: ['<rootDir>/dir/', '<rootDir>/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testPathIgnorePatterns: ['/dist/'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/../../__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': '@tinacms/scripts/__mocks__/styleMock.js',
  },
}

module.exports = {
  process: sucraseRunner.process,
  config,
}
