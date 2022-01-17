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
export type Events = CreateTinaAppInvoke | TinaCMSAuditInvoke
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
