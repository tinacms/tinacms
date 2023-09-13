import * as React from 'react'
import {
  BiChevronDown,
  BiGitBranch,
  BiLinkExternal,
  BiLockAlt,
} from 'react-icons/bi'
import { useBranchData } from './branch-data'
import { BranchModal } from './branch-modal'
import { Button } from '@toolkit/styles'
import { useWindowWidth } from '@react-hook/window-size'
import { useCMS } from '@toolkit/react-tinacms/use-cms'

// trim 'tina/' prefix from branch name
const trimPrefix = (branchName: string) => {
  return branchName.replace(/^tina\//, '')
}

export const BranchBanner = () => {
  const cms = useCMS()
  const [open, setOpen] = React.useState(false)
  const openModal = () => setOpen(true)
  const { currentBranch } = useBranchData()
  const isProtected = cms.api.tina.usingProtectedBranch()

  const navBreakpoint = 1000
  const windowWidth = useWindowWidth()
  const renderNavToggle = windowWidth < navBreakpoint + 1
  const previewFunction = cms.api.tina.schema?.config?.config?.ui?.previewUrl
  const branch = decodeURIComponent(cms.api.tina.branch)
  const previewUrl = previewFunction ? previewFunction({ branch })?.url : null

  return (
    <>
      <div
        className={`w-full bg-white flex items-center gap-2 -mb-px border-b border-gray-100 py-3 pr-4 ${
          renderNavToggle ? 'pl-20' : 'pl-4'
        }`}
      >
        <Button
          variant={isProtected ? 'primary' : 'white'}
          size="small"
          onClick={openModal}
        >
          {isProtected ? (
            <BiLockAlt className="flex-shrink-0 w-4 h-auto text-white opacity-70 mr-1" />
          ) : (
            <BiGitBranch
              className={`flex-shrink-0 w-4 h-auto text-blue-500/70 mr-1`}
            />
          )}
          <span className="truncate max-w-full">
            {trimPrefix(currentBranch)}
          </span>
          <BiChevronDown
            className="-mr-1 h-4 w-4 opacity-70 shrink-0"
            aria-hidden="true"
          />
        </Button>
        {previewUrl && (
          <Button
            variant="white"
            size="small"
            onClick={() => {
              window.open(previewUrl, '_blank')
            }}
          >
            <BiLinkExternal className="flex-shrink-0 w-4 h-auto text-blue-500/70 mr-1" />
            Preview
          </Button>
        )}
      </div>
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
