import { TinaCMSConfig } from 'tinacms/build/tina-cms'

export interface GatsbyPluginTinacmsOptions {
  sidebar: TinaCMSConfig['sidebar']
  manualInit?: boolean
}
