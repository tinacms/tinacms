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

import fs from 'fs'

const pathToDb = '.next/db.json'

export interface Db {
  pages: {
    first: number
    after: string
    sort: string
  }[]
}

export const readDb = async (): Promise<Db> => {
  try {
    const buf = await fs.promises.readFile(pathToDb)
    return JSON.parse(buf.toString('utf-8'))
  } catch (err) {
    return { pages: [] }
  }
}

export const writeDb = async (db: Db): Promise<void> => {
  await fs.promises.writeFile(pathToDb, JSON.stringify(db))
}
