import React, { FC, useEffect } from 'react'
import {
  LoadingDots,
  useCMS,
  useBranchData,
  formatBranchName,
} from '@tinacms/toolkit'
import { useSearchParams } from 'react-router-dom'
import { Client } from '../../internalClient'
import { TinaAdminApi } from '../api'

type IndexingState =
  | 'starting'
  | 'indexing'
  | 'creatingBranch'
  | 'creatingPR'
  | 'done'
  | 'submitting'

export const IndexingPage: FC = () => {
  const cms = useCMS()
  const tinaApi: Client = cms.api.tina
  // @ts-ignore
  const currentBranch = tinaApi.branch
  const { setCurrentBranch } = useBranchData()
  const [state, setState] = React.useState(
    localStorage?.getItem('tina.createBranchState') as IndexingState
  )
  const [baseBranch, setBaseBranch] = React.useState(
    localStorage?.getItem('tina.createBranchState.baseBranch') as string
  )
  const [searchParams] = useSearchParams()

  //   const back = searchParams.get('back') as string

  const back = localStorage?.getItem('tina.createBranchState.back')
  const fullPath = localStorage?.getItem('tina.createBranchState.fullPath')
  const values = JSON.parse(
    localStorage?.getItem('tina.createBranchState.values')
  )

  const [branch, setBranch] = React.useState(
    searchParams.get('branch') as string
  )

  useEffect(() => {
    const run = async () => {
      if (state === 'starting') {
        const name = await tinaApi.createBranch({
          branchName: formatBranchName(branch),
          baseBranch: currentBranch,
        })
        setBranch(name)
        localStorage.setItem('tina.createBranchState', 'indexing')
        cms.alerts.success('Branch created.')
        setState('indexing')
      }
      if (state === 'indexing') {
        const [
          // When this promise resolves, we know the index status is no longer 'inprogress' or 'unknown'
          waitForIndexStatusPromise,
          // Calling this function will cancel the polling
          _cancelWaitForIndexFunc,
        ] = cms.api.tina.waitForIndexStatus({
          ref: branch,
        })
        await waitForIndexStatusPromise
        cms.alerts.success('Branch indexed.')
        localStorage.setItem('tina.createBranchState', 'submitting')
        setState('submitting')
      }
      if (state === 'submitting') {
        setBaseBranch(tinaApi.branch)
        localStorage.setItem(
          'tina.createBranchState.baseBranch',
          tinaApi.branch
        )
        setCurrentBranch(branch)
        const collection = tinaApi.schema.getCollectionByFullPath(fullPath)

        const api = new TinaAdminApi(cms)
        const params = api.schema.transformPayload(collection.name, values)
        const relativePath = fullPath.replace(`${collection.path}/`, '')

        if (await api.isAuthenticated()) {
          await api.updateDocument(collection.name, relativePath, params)
        } else {
          const authMessage = `UpdateDocument failed: User is no longer authenticated; please login and try again.`
          cms.alerts.error(authMessage)
          console.error(authMessage)
          return false
        }
        localStorage.setItem('tina.createBranchState', 'creatingPR')
        cms.alerts.success('Content saved.')
        setState('creatingPR')
      }
      if (state === 'creatingPR') {
        const foo = await tinaApi.createPullRequest({
          baseBranch,
          branch: branch,
          title: 'PR from TinaCMS',
        })
        console.log('PR created', foo)
        cms.alerts.success('Creating PR')
        localStorage.setItem('tina.createBranchState', 'done')
        setState('done')
      }
      if (state === 'done') {
        window.location.href = back
      }
    }
    if (fullPath && values && branch && back) {
      run()
    }
  }, [state])
  if (!back || !fullPath || !values || !branch) {
    return <div>Missing params please try again</div>
  }
  return (
    <div>
      {(state === 'starting' || state === 'creatingBranch') && (
        <div>Creating branch</div>
      )}
      {state === 'indexing' && <div>Indexing Content</div>}
      {state === 'submitting' && <div>Saving content</div>}
      {state === 'creatingPR' && <div>Creating Pull Request</div>}
      {state !== 'done' && <LoadingDots color="black" />}
    </div>
  )
}
