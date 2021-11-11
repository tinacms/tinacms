import * as React from 'react'

export interface BranchContextData {
  currentBranch: string
  setCurrentBranch: (string) => void
}

const BranchContext = React.createContext<BranchContextData>({
  currentBranch: null,
  setCurrentBranch: (branch) => {
    console.warn('BranchContext not initialized')
  },
})

export const BranchDataProvider = ({
  currentBranch,
  setCurrentBranch,
  children,
}) => {
  return (
    <BranchContext.Provider
      value={{
        currentBranch,
        setCurrentBranch,
      }}
    >
      {children}
    </BranchContext.Provider>
  )
}

export const useBranchData: () => BranchContextData = () => {
  return React.useContext(BranchContext)
}
