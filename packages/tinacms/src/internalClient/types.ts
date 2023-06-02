export interface TinaCloudProject {
  tokens: Token[]
  orgId: string
  id: string
  name: string
  repoUrl: string
  installationId: number
  hookId: string
  siteUrl: string
  pathToTina: string
  dateCreated: number
  dateUpdated: number
  metadata: Metadata
  defaultBranch?: string
  accessDisabled?: boolean
  indexVersion?: string
  mediaBranch?: string
  role: string
  protectedBranches: string[]
  features?: string[]
}

export interface Token {
  token: string
  name: string
  branches: string[]
  repoURL: string
  lastUsed: number
}

export interface Metadata {
  [key: string]: MetaDataBranch
}

export interface MetaDataBranch {
  tinaVersion: TinaVersion
  tinaMeta: TinaMeta
  tinaLockVersion: string
}

export interface TinaVersion {
  fullVersion: string
  major: string
  minor: string
  patch: string
}

export interface TinaMeta {
  flags: string[]
  media: {
    tina: TinaMedia
  }
}

export interface TinaMedia {
  publicFolder: string
  mediaRoot: string
}
