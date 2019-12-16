export const getGitSSHUrl = (url: string) => {
  const isSSH = isSSHUrl(url)
  if (isSSH) {
    return url
  }
  const match = url.match(new RegExp(`https:\/\/(.+?)\/(.*?)\.git$`))
  let domain = match && match.length > 1 ? match[1] : ''
  let usernameRepo = match && match.length > 2 ? match[2] : ''
  return `git@${domain}:${usernameRepo}.git`
}

export const isSSHUrl = (str: string) => {
  return str.startsWith('git@')
}
