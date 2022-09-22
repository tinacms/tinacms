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
import { TinaSchema, TinaCloudSchemaBase } from '@tinacms/schema-tools'

import { validateSchema } from './validate'
// @ts-ignore File '...' is not under 'rootDir'
import packageJSON from '../../package.json'

export const createSchema = async ({
  schema,
  flags = [],
}: {
  schema: TinaCloudSchemaBase
  flags?: string[]
}) => {
  const validSchema = await validateSchema(schema)
  const [major, minor, patch] = packageJSON.version.split('.')
  const meta = {}
  if (flags && flags.length > 0) {
    meta['flags'] = flags
  }
  return new TinaSchema({
    version: {
      fullVersion: packageJSON.version,
      major,
      minor,
      patch,
    },
    meta,
    ...validSchema,
  })
}
