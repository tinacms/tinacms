import * as inquirer from 'inquirer'

export const promptCredentials = async () => {
  const fields = [
    {
      name: 'email',
      type: 'input',
      message: 'Enter your email:',
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password:',
    },
  ]

  const fieldValues = await inquirer.prompt(fields)
  return fieldValues
}
