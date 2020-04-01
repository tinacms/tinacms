import {
  ActionableModalOptions,
  ActionableModal,
} from '../misc/ActionableModal'
import { useEffect, useState, useCallback } from 'react'
import { useCMS } from 'tinacms'
import OpenAuthoringError from '../OpenAuthoringError'
import { useOpenAuthoring } from '../open-authoring/OpenAuthoringProvider'
import { getModalProps } from './github-interpeter'
import React from 'react'

interface Props {
  error: OpenAuthoringError
}

// When an open authoring error is caught, we don't immedietly know the cause
// We have to perform a few extra checks and render a modal with options
const OpenAuthoringErrorModal = (props: Props) => {
  const [errorModalProps, setErrorModalProps] = useState<
    ActionableModalOptions
  >(null)
  const { github } = useCMS().api

  const openAuthoring = useOpenAuthoring()

  useEffect(() => {
    ;(async () => {
      if (props.error) {
        const modalProps = await getModalProps(
          props.error,
          github,
          openAuthoring.enterEditMode,
          openAuthoring.exitEditMode
        )
        setErrorModalProps(modalProps)
      } else {
        setErrorModalProps(null)
      }
    })()
  }, [props.error, openAuthoring.enterEditMode])

  if (!errorModalProps) {
    return null
  }

  return <ActionableModal {...errorModalProps} />
}

export default OpenAuthoringErrorModal
