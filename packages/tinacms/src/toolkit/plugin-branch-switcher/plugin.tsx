import * as React from 'react'
import { BiGitRepoForked } from 'react-icons/bi'
import { ScreenPlugin } from '@toolkit/react-screens'
import { BranchSwitcher } from './branch-switcher'
import { BranchSwitcherProps } from './types'

export class BranchSwitcherPlugin implements ScreenPlugin {
  __type = 'screen' as const
  Icon = BiGitRepoForked
  name = 'Select Branch'
  layout = 'popup' as const

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
