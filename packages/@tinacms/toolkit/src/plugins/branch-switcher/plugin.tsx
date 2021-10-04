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
import { PullRequestIcon } from '../../packages/icons'
import { ScreenPlugin } from '../../packages/react-screens'
import { BranchSwitcher } from './BranchSwitcher'
import { BranchSwitcherPluginOptions, BranchChangeEvent } from './types'

export class BranchSwitcherPlugin implements ScreenPlugin {
  __type = 'screen' as 'screen'
  Icon = PullRequestIcon
  name = 'Select Branch'
  layout = 'popup' as 'popup'
  private currentBranch: string

  cms: BranchSwitcherPluginOptions['cms']
  baseBranch: BranchSwitcherPluginOptions['baseBranch']
  listBranches: BranchSwitcherPluginOptions['listBranches']
  createBranch: BranchSwitcherPluginOptions['createBranch']

  constructor(options: BranchSwitcherPluginOptions) {
    this.baseBranch = options.baseBranch
    this.currentBranch = options.baseBranch
    this.cms = options.cms
    this.listBranches = options.listBranches
    this.createBranch = options.createBranch
  }

  getCurrentBranch() {
    return this.currentBranch
  }

  setCurrentBranch(branchName: string) {
    this.currentBranch = branchName
    this.cms.events.dispatch<BranchChangeEvent>({
      type: 'branch-switcher:change-branch',
      branchName: branchName,
    })
  }

  Component() {
    return (
      <BranchSwitcher
        currentBranch={this.currentBranch}
        setCurrentBranch={this.setCurrentBranch}
        listBranches={this.listBranches}
        createBranch={this.createBranch}
      />
    )
  }
}
