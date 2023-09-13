// TODO: Consolidate these types with the ones from the internal client
export interface Branch {
  indexStatus?: {
    status?: 'unknown' | 'complete' | 'failed' | 'inprogress' | 'timeout'
    timestamp?: number
  }
  name: string
  protected?: boolean
  commit?: {
    sha?: string
    url?: string
  }
  githubPullRequestUrl?: string
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
  setModalTitle?: any
}

export interface BranchChangeEvent {
  type: 'branch:change'
  branchName: string
}

export interface BranchData {
  baseBranch?: string
  branchName?: string
}
