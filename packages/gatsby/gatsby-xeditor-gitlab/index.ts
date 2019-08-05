import * as React from 'react'

export const GitlabContext = React.createContext<any>(null)

export function useGitlab() {
  return React.useContext(GitlabContext)
}
