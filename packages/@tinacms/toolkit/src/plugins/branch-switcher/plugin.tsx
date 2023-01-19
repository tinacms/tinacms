/**
Copyright 2021 Forestry.io Holdings, Inc.
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
import * as React from 'react'
import { BiGitRepoForked } from 'react-icons/bi'
import { ScreenPlugin } from '../../packages/react-screens'
import { BranchSwitcher } from './BranchSwitcher'
import { BranchSwitcherProps } from './types'

export class BranchSwitcherPlugin implements ScreenPlugin {
  __type = 'screen' as 'screen'
  Icon = BiGitRepoForked
  name = 'Select Branch'
  layout = 'popup' as 'popup'

  listBranches: BranchSwitcherProps['listBranches']
  createBranch: BranchSwitcherProps['createBranch']
  chooseBranch: BranchSwitcherProps['chooseBranch']

  constructor(options: BranchSwitcherProps) {
    this.listBranches = options.listBranches
    this.createBranch = options.createBranch
    this.chooseBranch = options.chooseBranch
  }

  Component = () => {
    return (
      <BranchSwitcher
        listBranches={this.listBranches}
        createBranch={this.createBranch}
        chooseBranch={this.chooseBranch}
      />
    )
  }
}
