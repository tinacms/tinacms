import { TinaCMS } from '../../tina-cms'

export interface Branch {
  name: string
}

export interface BranchSwitcherProps {
  currentBranch: string
  setCurrentBranch: (branchName: string) => void
  listBranches: () => Promise<Branch[]>
  createBranch: (branchName: string) => Promise<string>
}

export interface BranchSwitcherPluginOptions extends BranchSwitcherProps {
  baseBranch: string
  cms: TinaCMS
}

export interface BranchChangeEvent {
  type: 'branch-switcher:change-branch'
  branchName: string
}
