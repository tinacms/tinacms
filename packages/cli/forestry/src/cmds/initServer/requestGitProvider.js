import inquirer from 'inquirer'

export const requestGitProvider = async () => {
  const answers = await inquirer.prompt([
    {
      name: 'gitProvider',
      type: 'list',
      message: 'Which git provider do you use?',
      choices: ['github', new inquirer.Separator(), 'gitlab'],
    },
  ])
  return answers.gitProvider
}
