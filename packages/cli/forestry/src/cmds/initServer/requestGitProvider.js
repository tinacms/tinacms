import inquirer from 'inquirer'

export const requestGitProvider = async remote => {
  //todo - repelace this with a smarter regex. (Incase your gitlab repo was called 'github.com' :/ )
  if (remote.includes('github.com')) {
    return 'github'
  } else if (remote.includes('gitlab.com')) {
    return 'gitlab'
  }

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
