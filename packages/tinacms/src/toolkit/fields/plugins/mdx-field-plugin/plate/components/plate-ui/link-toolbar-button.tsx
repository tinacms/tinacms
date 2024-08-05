import React from 'react'

import { cn, withRef } from '@udecode/cn'
import {
  TLinkElement,
  useLink,
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from '@udecode/plate-link'

import { Icons } from './icons'

import { ToolbarButton } from './toolbar'
import { useWindowWidth } from '@react-hook/window-size'
import { PlateElement, useElement } from '@udecode/plate-common'

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
