/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
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
