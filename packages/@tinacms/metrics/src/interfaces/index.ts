/**

*/

interface EventsBase {
  name: string
}

export interface CreateTinaAppInvoke extends EventsBase {
  name: 'create-tina-app:invoke'
  example: string
  useYarn: boolean
}

export interface TinaCMSAuditInvoke extends EventsBase {
  name: 'tinacms:cli:audit:invoke'
  clean: boolean
  useDefaults: boolean
}

export interface TinaCMSInitInvoke extends EventsBase {
  name: 'tinacms:cli:init:invoke'
  schemaFileType?: string
  hasForestryConfig?: boolean
}

export interface TinaCMSServerStartInvoke extends EventsBase {
  name: 'tinacms:cli:server:start:invoke'
}

export interface TinaCMSServerError extends EventsBase {
  name: 'tinacms:cli:server:error'
  errorMessage: string
}
export type Events =
  | CreateTinaAppInvoke
  | TinaCMSAuditInvoke
  | TinaCMSInitInvoke
  | TinaCMSServerStartInvoke
  | TinaCMSServerError

type Merge<A, B> = {
  [K in keyof A]: K extends keyof B ? B[K] : A[K]
} & B extends infer O
  ? { [K in keyof O]: O[K] }
  : never

type EventBaseProperties = {
  nodeVersion: string
  tinaCliVersion: string
  tinaVersion: string
  yarnVersion: string
  npmVersion: string
  CI: boolean
}
export interface MetricPayload {
  partitionKey: string
  data: {
    anonymousId: string
    event: Events['name']
    properties: Merge<Events, EventBaseProperties>
  }
}
