import React, { FC, useEffect } from 'react'
import { useCMS, useBranchData, formatBranchName } from '@tinacms/toolkit'
import { useSearchParams } from 'react-router-dom'
import { Client } from '../../internalClient'
import { TinaAdminApi } from '../api'
import { BiError, BiLoaderAlt } from 'react-icons/bi'

// TODO: Scott B styles
type IndexingState =
  | 'starting'
  | 'indexing'
  | 'submitting'
  | 'creatingPR'
  | 'creatingBranch'
  | 'done'
  | 'error'

export const IndexingPage: FC = () => {
  const cms = useCMS()
  const tinaApi: Client = cms.api.tina
  // @ts-ignore
  const currentBranch = tinaApi.branch
  const kind = localStorage?.getItem('tina.createBranchState.kind') as
    | 'create'
    | 'update'
    | 'delete'
  const { setCurrentBranch } = useBranchData()
  const [state, setState] = React.useState(
    localStorage?.getItem('tina.createBranchState') as IndexingState
  )
  const [errorMessage, setErrorMessage] = React.useState('')

  const [baseBranch, setBaseBranch] = React.useState(
    localStorage?.getItem('tina.createBranchState.baseBranch') as string
  )
  const [searchParams] = useSearchParams()

  const back = localStorage?.getItem('tina.createBranchState.back')
  const fullPath = localStorage?.getItem('tina.createBranchState.fullPath')
  const values = JSON.parse(
    localStorage?.getItem('tina.createBranchState.values')
  )

  const [branch, setBranch] = React.useState(
    ('tina/' + searchParams.get('branch')) as string
  )

  useEffect(() => {
    const run = async () => {
      if (state === 'starting') {
        try {
          console.log('starting', branch, formatBranchName(branch))
          const name = await tinaApi.createBranch({
            branchName: formatBranchName(branch),
            baseBranch: currentBranch,
          })
          if (!name) {
            throw new Error('Branch creation failed.')
          }
          setBranch(name)
          localStorage.setItem('tina.createBranchState', 'indexing')
          cms.alerts.success('Branch created.')
          setState('indexing')
        } catch (e) {
          console.error(e)
          cms.alerts.error('Branch creation failed: ' + e.message)
          setErrorMessage(
            'Branch creation failed, please try again. By refreshing the page.'
          )
          setState('error')
        }
      }
      if (state === 'indexing') {
        try {
          const [
            // When this promise resolves, we know the index status is no longer 'inprogress' or 'unknown'
            waitForIndexStatusPromise,
            // Calling this function will cancel the polling
            _cancelWaitForIndexFunc,
          ] = tinaApi.waitForIndexStatus({
            ref: branch,
          })
          await waitForIndexStatusPromise
          cms.alerts.success('Branch indexed.')
          localStorage.setItem('tina.createBranchState', 'submitting')
          setState('submitting')
        } catch {
          cms.alerts.error('Branch indexing failed.')
          setErrorMessage(
            'Branch indexing failed, please check the Tina Cloud dashboard for more information. To try again chick "re-index" on the branch in the dashboard.'
          )
          setState('error')
        }
      }
      if (state === 'submitting') {
        try {
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
            if (kind === 'delete') {
              await api.deleteDocument(values)
            } else if (kind === 'create') {
              await api.createDocument(collection, relativePath, params)
            } else {
              await api.updateDocument(collection, relativePath, params)
            }
          } else {
            const authMessage = `UpdateDocument failed: User is no longer authenticated; please login and try again.`
            cms.alerts.error(authMessage)
            console.error(authMessage)
            return false
          }
          localStorage.setItem('tina.createBranchState', 'creatingPR')
          cms.alerts.success('Content saved.')
          setState('creatingPR')
        } catch (e) {
          console.error(e)
          cms.alerts.error('Content save failed.')
          setErrorMessage(
            'Content save failed, please try again. If the problem persists please contact support.'
          )
          setState('error')
        }
      }
      if (state === 'creatingPR') {
        const foo = await tinaApi.createPullRequest({
          baseBranch,
          branch: branch,
          title: `${branch
            .replace('tina/', '')
            .replace('-', ' ')} (PR from TinaCMS)`,
        })
        console.log('PR created', foo)
        cms.alerts.success('Pull request created.')
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
    return (
      <Wrapper>
        <p>Missing params please try again.</p>
      </Wrapper>
    )
  }
  return (
    <Wrapper>
      {state !== 'done' && state !== 'error' && (
        <BiLoaderAlt
          className={`opacity-70 text-blue-400 animate-spin w-10 h-auto`}
        />
      )}
      {(state === 'starting' || state === 'creatingBranch') && (
        <p>Creating branch&hellip;</p>
      )}
      {state === 'indexing' && <p>Indexing Content&hellip;</p>}
      {state === 'submitting' && <p>Saving content&hellip;</p>}
      {state === 'creatingPR' && <p>Creating Pull Request&hellip;</p>}
      {state === 'error' && (
        <p className="flex items-center gap-1 text-red-700">
          <BiError className="w-7 h-auto text-red-400 flex-shrink-0" />{' '}
          <b>Error:</b> {errorMessage}{' '}
        </p>
      )}
    </Wrapper>
  )
}

const Wrapper = ({ children }: any) => (
  <div className="w-full h-full flex flex-col justify-center items-center gap-4 p-6 text-xl text-gray-700">
    {children}
  </div>
)
