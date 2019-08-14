import { XServer } from '@forestryio/xserver'

interface PluginConfig {
  resolve: string
}

interface PluginOptions {
  routePrefix?: string
  envPrefix?: string
  port?: Number
  plugins?: Array<PluginConfig>
}

exports.onPreBootstrap = (_: any, pluginOptions: PluginOptions) => {
  const xserver = new XServer(pluginOptions)
  if (pluginOptions.plugins) {
    pluginOptions.plugins.forEach((pluginConfig: PluginConfig) => {
      let plugin = require(pluginConfig.resolve)
      xserver.extend(plugin.extendXserver as any)
    })
  }
  xserver.start(pluginOptions.port || 4567)
}
