export type Events = 'create-tina-app:invoke' | 'tinacms:audit:invoke'

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
