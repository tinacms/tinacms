import { Form, useCMS } from 'tinacms'
import { useEffect } from 'react'
import { getForkName } from '../open-authoring/repository'
import PRPlugin from './pull-request'
import { ForkNamePlugin } from './ForkNamePlugin'

export const useOpenAuthoringToolbarPlugins = (
  form: Form<any>,
  editMode: boolean
) => {
  const cms = useCMS()

  useEffect(() => {
    const forkName = getForkName()
    const plugins = [
      ForkNamePlugin(forkName),
      PRPlugin(process.env.REPO_FULL_NAME, forkName),
    ] as any

    const removePlugins = () => {
      plugins.forEach(plugin => cms.plugins.remove(plugin))
    }

    if (editMode) {
      plugins.forEach(plugin => cms.plugins.add(plugin))
    } else {
      removePlugins()
    }

    return removePlugins
  }, [editMode, form])
}
