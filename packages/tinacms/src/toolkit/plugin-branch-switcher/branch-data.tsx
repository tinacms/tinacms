import * as React from 'react'
import { BranchChangeEvent } from './types'
import { useEvent } from '@toolkit/react-core'

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
  const branchData = React.useContext(BranchContext)
  const { dispatch } = useEvent<BranchChangeEvent>('branch:change')
  React.useEffect(() => {
    dispatch({ branchName: branchData.currentBranch })
  }, [branchData.currentBranch])
  return branchData
}
