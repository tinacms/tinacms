require('dotenv').config('./.env')

module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./jest.setup.ts'],
}
