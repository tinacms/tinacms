import React from 'react'

import { withRef } from '@udecode/cn'
import {
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from '@udecode/plate-link'

import { Icons } from './icons'

import { ToolbarButton } from './toolbar'

export const LinkToolbarButton = withRef<typeof ToolbarButton>((rest, ref) => {
  const state = useLinkToolbarButtonState()
  const { props } = useLinkToolbarButton(state)

  return (
    <ToolbarButton ref={ref} {...props} {...rest} tooltip="Link">
      <Icons.link />
    </ToolbarButton>
  )
})
