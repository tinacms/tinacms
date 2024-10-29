import React, { ReactNode, createContext, useContext } from 'react'

interface BranchPickerContextProps {
  createBranchModalOpen: boolean
  setCreateBranchModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

interface BranchPickerProviderProps extends BranchPickerContextProps {
  children: ReactNode
}

const BranchPickerContext = createContext<BranchPickerContextProps | undefined>(
  undefined
)

export const BranchPickerProvider: React.FC<BranchPickerProviderProps> = ({
  createBranchModalOpen,
  setCreateBranchModalOpen,
  children,
}) => {
  return (
    <BranchPickerContext.Provider
      value={{ createBranchModalOpen, setCreateBranchModalOpen }}
    >
      {children}
    </BranchPickerContext.Provider>
  )
}

export const useBranchPickerContext = (): BranchPickerContextProps => {
  const context = useContext(BranchPickerContext)
  if (!context) {
    throw new Error(
      'useBranchPickerContext must be used within a ProcessingInvitesProvider'
    )
  }
  return context
}
