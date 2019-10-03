import { Plugin } from '@tinacms/core'

export interface ScreenPlugin extends Plugin {
  __type: 'screen'
  Component: any
  Icon: any
}
