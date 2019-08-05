import * as React from 'react'
import { GitlabConnector } from '@forestryio/cms-connector-gitlab'
import { GitlabContext } from './index'
import { cms } from '@forestryio/gatsby-plugin-xeditor'

let gitlab: GitlabConnector
export const wrapRootElement = ({ element }: any) => {
  return (
    <GitlabContext.Provider value={gitlab}>{element}</GitlabContext.Provider>
  )
}

export const onClientEntry = (_: any, pluginOptions: any) => {
  gitlab = new GitlabConnector({
    apiBaseURI: 'https://gitlab.com/',
    ...pluginOptions,
    //   appID: 'APP_ID',
    //   redirectURI: 'http://localhost:8000/?auth-gitlab',
    //   repositoryID: 'USER/REPO',
  })

  gitlab.bootstrap()
  cms.registerApi('gitlab', gitlab)
}
