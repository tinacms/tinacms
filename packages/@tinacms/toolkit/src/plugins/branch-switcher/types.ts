export interface Branch {
  indexStatus: {
    status?: 'unknown' | 'complete' | 'failed' | 'inprogress' | 'timeout'
    timestamp?: number
  }
  name: string
  protected?: boolean
  commit?: {
    sha?: string
    url?: string
  }
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
  baseBranch?: string
  branchName?: string
}
