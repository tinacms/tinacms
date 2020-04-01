import { useEffect } from 'react'
import { useOpenAuthoring } from '../open-authoring/OpenAuthoringProvider'

interface Props {
  previewError: any
  children: any
}
export const withOpenAuthoringErrorHandler = BaseComponent => (
  props: Props
) => {
  const openAuthoring = useOpenAuthoring()

  useEffect(() => {
    ;(async () => {
      if (props.previewError) {
        openAuthoring.setError(props.previewError)
      }
    })()
  }, [props.previewError])

  if (props.previewError) {
    return null
  }

  // don't show content with initial content error
  // because the data is likely missing
  return <BaseComponent {...props} />
}
