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
  },
};
