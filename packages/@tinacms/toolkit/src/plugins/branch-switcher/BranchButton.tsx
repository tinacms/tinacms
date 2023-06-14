import * as React from 'react'
import { BiChevronDown, BiGitBranch } from 'react-icons/bi'
import { useBranchData } from './BranchData'
import { BranchModal } from './BranchModal'

// trim 'tina/' prefix from branch name
const trimPrefix = (branchName: string) => {
  return branchName.replace(/^tina\//, '')
}

export const BranchButton = () => {
  const [open, setOpen] = React.useState(false)
  const openModal = () => setOpen(true)
  const { currentBranch } = useBranchData()

  return (
    <>
      <button
        className="pointer-events-auto flex min-w-0	shrink gap-1 items-center justify-between form-select text-sm h-10 px-4 shadow text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 border border-gray-100 transition-color duration-150 ease-out rounded-full focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out text-[12px] leading-tight min-w-[5rem]"
        onClick={openModal}
      >
        <BiGitBranch className="flex-shrink-0 w-4.5 h-auto text-blue-500/70" />
        <span className="truncate max-w-full">{trimPrefix(currentBranch)}</span>
        <BiChevronDown
          className="-mr-1 h-4 w-4 opacity-70 shrink-0"
          aria-hidden="true"
        />
      </button>
      {open && (
        <BranchModal
          close={() => {
            setOpen(false)
          }}
        />
      )}
    </>
  )
}
