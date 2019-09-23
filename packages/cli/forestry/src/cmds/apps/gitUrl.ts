const isSSHUrl = (str: string) => {
  return str.startsWith('git@')
}

export const getGitHttpUrl = (url: string) => {
  const isSSH = isSSHUrl(url)
  if (!isSSH) {
    const tail = '.git'
    return url.endsWith(tail) ? url.slice(0, url.length - tail.length) : url
  }
  const match = url.match(new RegExp(`git@(.+?)\:(.*?)(\.git)?$`))
  let domain = match && match.length > 1 ? match[1] : ''
  let usernameRepo = match && match.length > 2 ? match[2] : ''

  return `https://${domain}/${usernameRepo}`
}
