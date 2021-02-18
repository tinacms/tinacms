export interface RBIEPluginConfig {
  active?: boolean
}

export class RBIEPlugin {
  public __type = 'unstable_featureflag'
  public name = 'ref-based-inline-editor'
  public active = true

  constructor(config?: RBIEPluginConfig) {
    if (config?.active) {
      this.active = config.active
    }
  }
}
