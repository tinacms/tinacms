import * as React from 'react'
import { GitlabConnector } from '@forestryio/cms-connector-gitlab'
import { GitlabContext } from './index'

let gitlab: GitlabConnector
export const wrapRootElement = ({ element }: any, pluginOptions: any) => {
  gitlab = new GitlabConnector({
    apiBaseURI: 'https://gitlab.com/',
    ...pluginOptions,
    //   appID: 'APP_ID',
    //   redirectURI: 'http://localhost:8000/?auth-gitlab',
    //   repositoryID: 'USER/REPO',
  })

  return (
    <GitlabContext.Provider value={gitlab}>{element}</GitlabContext.Provider>
  )
}

export const onClientEntry = () => {
  if (gitlab) {
    gitlab.bootstrap()
  }
}
