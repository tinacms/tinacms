import jestRunnerConfig from '@tinacms/scripts/dist/jest-runner.js';

export default {
  ...jestRunnerConfig,
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};
