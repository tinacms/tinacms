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
import { PullRequestToolbarWidget } from './pull-request'
import { ForkNameToolbarWidget } from './ForkNamePlugin'
import { Plugin } from 'tinacms'
import { useGithubEditing } from '../github-editing-context'
import { BranchSwitcherPlugin } from './BranchSwitcherPlugin'

export const useGithubToolbarPlugins = () => {
  const cms = useCMS()
  const { editMode, enterEditMode } = useGithubEditing()

  useEffect(() => {
    const plugins = [
      ForkNameToolbarWidget,
      PullRequestToolbarWidget,
      {
        ...BranchSwitcherPlugin,
        props: {
          onBranchChange: enterEditMode,
        },
      },
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
