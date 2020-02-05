import React from 'react'
import { ScreenPlugin } from '../screen-plugin'
import { MediaManager } from '../../components/MediaManager'

export const MediaScreen: ScreenPlugin = {
  __type: 'screen',
  name: 'Media',
  layout: 'fullscreen',
  Icon: () => null,
  Component() {
    return <MediaManager />
  },
}
