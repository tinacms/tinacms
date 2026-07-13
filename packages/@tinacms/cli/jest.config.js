import jestRunnerConfig from '@tinacms/scripts/dist/jest-runner.js';

export default {
  ...jestRunnerConfig,
  transform: {
    '^.+.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
    '^.+\\.m?jsx?$': [
      'babel-jest',
      {
        presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
      },
    ],
  },
  // graphql-codegen reaches auto-bind@5, which is ESM-only. Node can require()
  // that; jest's module registry cannot, so babel has to down-level it.
  transformIgnorePatterns: ['node_modules/(?!.*auto-bind)'],
};
