/**

*/

// TODO: ClintID, Branch, Token should not be optional
export interface TinaCloudSchemaConfig<Store = any> {
  client?: {
    referenceDepth?: number
  }
  build?: {
    publicFolder: string
    outputFolder: string
  }
  /**
   * The base branch to pull content from. Note that this is ignored for local development
   */
  branch?: string
  /**
   * Your clientId from  app.tina.io
   */
  clientId?: string
  /**
   * Your read only token from app.tina.io
   */
  token?: string
  media?: {
    loadCustomStore?: () => Promise<Store>
    tina?: {
      publicFolder: string
      mediaRoot: string
    }
  }

  /**
   * Used to override the default Tina Cloud API URL
   */
  tinaioConfig?: {
    assetsApiUrlOverride?: string // https://assets.tinajs.io
    frontendUrlOverride?: string // https://app.tina.io
    identityApiUrlOverride?: string // https://identity.tinajs.io
    contentApiUrlOverride?: string // https://content.tinajs.io
  }
}
