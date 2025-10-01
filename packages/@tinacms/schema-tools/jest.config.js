import jestRunnerConfig from '@tinacms/scripts/dist/jest-runner.js';

export default {
  ...jestRunnerConfig,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  transform: {
    '\\.[jt]s?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
    ...(jestRunnerConfig.transform || {}),
  },
};
