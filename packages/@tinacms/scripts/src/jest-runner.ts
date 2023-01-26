/**

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
