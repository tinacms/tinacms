import inquirer from 'inquirer'

export const requestGitProvider = async () => {
  const answers = await inquirer.prompt([
    {
      name: 'gitProvider',
      type: 'list',
      message: 'Choose a git provider:',
      choices: ['github', new inquirer.Separator(), 'gitlab'],
    },
  ])
  return answers.gitProvider
}
