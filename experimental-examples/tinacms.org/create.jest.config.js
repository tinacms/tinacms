module.exports = function createJestConfig(pack) {
  return {
    verbose: true,
    transform: {
      '.(ts|tsx)': 'ts-jest',
    },
    testRegex: '(\\.test)\\.(ts|tsx|js)$',
    modulePaths: ['<rootDir>/', '<rootDir>/node_modules/'],
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
