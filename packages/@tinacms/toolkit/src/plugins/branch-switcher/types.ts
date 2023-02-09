/**

*/
import { TinaCMS } from '../../tina-cms'

export interface Branch {
  name: string
}

export interface BranchSwitcherProps {
  listBranches: () => Promise<Branch[]>
  chooseBranch: (_branch: string) => void
  createBranch: ({
    baseBranch,
    branchName,
  }: {
    baseBranch: string
    branchName: string
  }) => Promise<string>
}

export interface BranchChangeEvent {
  type: 'branch:change'
  branchName: string
}

export interface BranchData {
  owner: string
  repo: string
  baseBranch?: string
  branchName?: string
}
