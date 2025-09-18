import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  testPathIgnorePatterns: ['/dist/'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/../../__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': '@tinacms/scripts/__mocks__/styleMock.js',
  },
};

export default config;
