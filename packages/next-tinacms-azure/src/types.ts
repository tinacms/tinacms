import { NextRequest } from 'next/server'

export interface AzureBlobStorageConfig {
  connectionString: string
  containerName: string
  authorized: (req: NextRequest) => Promise<boolean>
}
