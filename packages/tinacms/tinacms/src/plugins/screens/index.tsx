import * as React from 'react'
import { ScreenPlugin } from '../screen-plugin'
import { SettingsIcon, MediaIcon } from '@tinacms/icons'

export const MediaView: ScreenPlugin = {
  __type: 'screen',
  name: 'Media Manager',
  Icon: MediaIcon,
  Component: () => {
    return <h2>Hello World</h2>
  },
}

export const SettingsView: ScreenPlugin = {
  __type: 'screen',
  name: 'Site Settings',
  Icon: SettingsIcon,
  Component: () => {
    return <h2>Hello World</h2>
  },
}
