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

import { Client, LocalClient } from '../client'
import type { TinaIOConfig } from '../client'
import * as yup from 'yup'

export interface CreateClientProps {
  clientId?: string
  isLocalClient?: boolean
  tinaioConfig?: TinaIOConfig
  owner?: string
  repo?: string
  branch?: string
}
export const createClient = ({
  clientId,
  isLocalClient = true,
  branch,
  tinaioConfig,
}: CreateClientProps) => {
  return isLocalClient
    ? new LocalClient()
    : new Client({
        clientId: clientId || '',
        branch: branch || 'main',
        tokenStorage: 'LOCAL_STORAGE',
        tinaioConfig,
      })
}

export function assertShape<T extends unknown>(
  value: unknown,
  yupSchema: (args: typeof yup) => yup.AnySchema,
  errorMessage?: string
): asserts value is T {
  const shape = yupSchema(yup)
  try {
    shape.validateSync(value)
  } catch (e) {
    const message = errorMessage || `Failed to assertShape - ${e.message}`
    throw new Error(message)
  }
}

export function safeAssertShape<T extends unknown>(
  value: unknown,
  yupSchema: (args: typeof yup) => yup.AnySchema
): boolean {
  try {
    assertShape<T>(value, yupSchema)
    return true
  } catch (e) {
    return false
  }
}
