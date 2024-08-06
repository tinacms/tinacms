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

  //! NTOE: We need to improve the mobile experience with this link component. Maybe remake the old Link component.
  return (
    <ToolbarButton ref={ref} tooltip="Link" {...props} {...rest}>
      <Icons.link />
    </ToolbarButton>
  )
})
