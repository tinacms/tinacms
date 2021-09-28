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
