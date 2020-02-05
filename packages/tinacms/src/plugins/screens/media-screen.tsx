import React from 'react'
import { ScreenPlugin } from '../screen-plugin'
import { MediaManager } from '../../components/MediaManager'

export const MediaScreen: ScreenPlugin = {
  __type: 'screen',
  name: 'Media',
  layout: 'fullscreen',
  Icon: () => <>M</>,
  Component(props: any) {
    console.log('MediaManager', props)
    return <MediaManager onChoose={() => alert('no')} />
  },
}
