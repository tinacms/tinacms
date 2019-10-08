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

module.exports = function createJestConfig(pack) {
  return {
    verbose: true,
    transform: {
      '.(ts|tsx)': 'ts-jest',
    },
    testRegex: '(\\.test)\\.(ts|tsx|js)$',
    modulePaths: ['<rootDir>/src/', '<rootDir>/node_modules/'],
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    displayName: pack.name,
    name: pack.name,
    moduleNameMapper: {
      '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
        '<rootDir>/../../__mocks__/fileMock.js',
      '\\.(css|scss)$': 'identity-obj-proxy',
    },
  }
}
