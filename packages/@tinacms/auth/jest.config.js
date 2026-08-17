import jestRunnerConfig from '@tinacms/scripts/dist/jest-runner.js';

export default {
  ...jestRunnerConfig,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
};
