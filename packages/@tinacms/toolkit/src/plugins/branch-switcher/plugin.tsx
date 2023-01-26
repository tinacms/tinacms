/**

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

  constructor(options: BranchSwitcherProps) {
    this.listBranches = options.listBranches
    this.createBranch = options.createBranch
  }

  Component = () => {
    return (
      <BranchSwitcher
        listBranches={this.listBranches}
        createBranch={this.createBranch}
      />
    )
  }
}
