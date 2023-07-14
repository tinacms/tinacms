/**

*/

import { Client, LocalClient } from '../internalClient'
import type { TinaIOConfig } from '../internalClient'
import * as yup from 'yup'
import { Schema } from '@tinacms/schema-tools'

export interface CreateClientProps {
  clientId?: string
  isLocalClient?: boolean
  isSelfHosted?: boolean
  tinaioConfig?: TinaIOConfig
  owner?: string
  repo?: string
  branch?: string
  schema?: Schema
  apiUrl?: string
  tinaGraphQLVersion: string
}
export const createClient = ({
  clientId,
  isLocalClient = true,
  branch,
  tinaioConfig,
  schema,
  apiUrl,
  tinaGraphQLVersion,
}: CreateClientProps) => {
  return isLocalClient
    ? new LocalClient({ customContentApiUrl: apiUrl, schema })
    : new Client({
        clientId: clientId || '',
        branch: branch || 'main',
        tokenStorage: 'LOCAL_STORAGE',
        tinaioConfig,
        schema,
        tinaGraphQLVersion,
      })
}

export function assertShape<T>(
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

export function safeAssertShape<T>(
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
