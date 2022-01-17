interface EventsBase {
  name: string
}

export interface CreateTinaAppInvoke extends EventsBase {
  name: 'create-tina-app:invoke'
  example: string
  useYarn: boolean
}

export interface TinaCMSAuditInvoke extends EventsBase {
  name: 'tinacms:audit:invoke'
  clean: boolean
  useDefaults: boolean
}

export interface TinaCMSInitInvoke extends EventsBase {
  name: 'tinacms:cli:init:invoke'
}

export interface TinaCMSServerStartInvoke extends EventsBase {
  name: 'tinacms:cli:server:start:invoke'
}
export type Events =
  | CreateTinaAppInvoke
  | TinaCMSAuditInvoke
  | TinaCMSInitInvoke
  | TinaCMSServerStartInvoke
export interface MetricPayload {
  event: Events
  id: string
  nodeVersion: string
  tinaCliVersion: string
  tinaVersion: string
  yarnVersion: string
  npmVersion: string
  CI: boolean
}
