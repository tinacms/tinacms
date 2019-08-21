import { promptConfig } from './promptConfig'
jest.mock('inquirer')

describe('promptConfig', () => {
  let inquirer: any

  const defaults = {
    install_dependencies_command: 'yarn install',
    build: 'npm run gatsby develop -p 8080 --host 0.0.0.0',
    output_directory: 'public',
    env: 'staging',
    build_image: 'node:10',
    mount_path: '/srv',
    working_dir: '/srv',
  }

  beforeEach(() => {
    inquirer = require('inquirer')
  })

  describe('when using defaults', () => {
    beforeEach(() => {
      inquirer.prompt.mockImplementation(() =>
        Promise.resolve({ confirmDefault: true })
      )
    })

    it('doesnt ask user for individual config values', async () => {
      await promptConfig(defaults)

      expect(inquirer.prompt).toHaveBeenCalledTimes(1)
    })

    it('returns default', async () => {
      const result = await promptConfig(defaults)

      expect(result).toEqual(defaults)
    })
  })

  describe('when using custom config', () => {
    beforeEach(() => {
      inquirer.prompt.mockImplementation((questions: { name: string }[]) => {
        if (questions[0].name == 'confirmDefault') {
          return Promise.resolve({ confirmDefault: false })
        } else {
          return Promise.resolve({
            install_dependencies_command: 'bloop',
            build: 'bleep',
            output_directory: 'blip',
            env: 'blop',
            build_image: 'blup',
            mount_path: 'blob',
            working_dir: 'blu',
          })
        }
      })
    })

    it('asks user for each config value', async () => {
      await promptConfig(defaults)

      expect(inquirer.prompt).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'install_dependencies_command' }),
          expect.objectContaining({ name: 'build' }),
          expect.objectContaining({ name: 'output_directory' }),
          expect.objectContaining({ name: 'env' }),
          expect.objectContaining({ name: 'build_image' }),
          expect.objectContaining({ name: 'mount_path' }),
          expect.objectContaining({ name: 'working_dir' }),
        ])
      )
    })

    it('returns custom config', async () => {
      const result = await promptConfig(defaults)

      expect(result.build_image).toEqual('blup')
    })
  })
})
