/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import { useCMS } from 'tinacms'
import { useEffect } from 'react'
import { getForkName } from '../github-editing-context/repository'
import { PRPlugin } from './pull-request'
import { ForkNamePlugin } from './ForkNamePlugin'
import { GithubClient } from '../github-client'
import { Plugin } from 'tinacms'
import { useGithubEditing } from 'github-editing-context'

export const useGithubToolbarPlugins = () => {
  const cms = useCMS()
  const { editMode } = useGithubEditing()

  useEffect(() => {
    const github: GithubClient = cms.api.github
    if (!github) {
      // Warn dev appropriately
    }
    const baseRepo = github.baseRepoFullName
    const baseBranch = github.baseBranch

    const forkName = getForkName()
    const plugins = [
      ForkNamePlugin(forkName || ''),
      PRPlugin(baseRepo, forkName || '', baseBranch),
    ] as Plugin[]

    const removePlugins = () => {
      plugins.forEach(plugin => cms.plugins.remove(plugin))
    }

    if (editMode) {
      plugins.forEach(plugin => cms.plugins.add(plugin))
    } else {
      removePlugins()
    }

    return removePlugins
  }, [editMode])
}
