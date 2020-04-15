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

import { Form, useCMS } from 'tinacms'
import { useEffect } from 'react'
import { getForkName } from '../github-editing-context/repository'
import { PRPlugin } from './pull-request'
import { ForkNamePlugin } from './ForkNamePlugin'
import { Plugin } from 'tinacms'

export const useGithubToolbarPlugins = (
  form: Form<any>,
  editMode: boolean,
  baseRepo: string,
  baseBranch: string = 'master'
) => {
  const cms = useCMS()

  useEffect(() => {
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
  }, [editMode, form])
}
