/**

*/

// this function removes the starting slash if it exists

export const parseMediaFolder = (str: string) => {
  let returnString = str
  if (returnString.startsWith('/')) returnString = returnString.substr(1)

  if (returnString.endsWith('/'))
    returnString = returnString.substr(0, returnString.length - 1)

  return returnString
}
