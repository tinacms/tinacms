/**
 Copyright 2023 Forestry.io Holdings, Inc.
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
import {
  AbstractDatabaseOptions,
  AbstractIterator,
  AbstractKeyIterator,
  AbstractLevel,
  AbstractOpenOptions,
  AbstractValueIterator,
} from 'abstract-level'
import { NextCallback } from 'abstract-level/types/abstract-iterator'
import ModuleError from 'module-error'
import Database from 'better-sqlite3'

export type SqliteLevelOptions<K, V> = {
  filename: string
  readOnly?: boolean
} & AbstractDatabaseOptions<K, V>

declare type BatchOperation = BatchPutOperation | BatchDelOperation

/**
 * A _put_ operation to be committed by a {@link SqliteLevel}.
 */
declare interface BatchPutOperation {
  /**
   * Type of operation.
   */
  type: 'put'

  /**
   * Key of the entry to be added to the database.
   */
  key: Buffer

  /**
   * Value of the entry to be added to the database.
   */
  value: Buffer
}

/**
 * A _del_ operation to be committed by a {@link SqliteLevel}.
 */
declare interface BatchDelOperation {
  /**
   * Type of operation.
   */
  type: 'del'

  /**
   * Key of the entry to be deleted from the database.
   */
  key: Buffer
}

declare interface IteratorOptions<KDefault> {
  limit?: number
  keyEncoding: string
  valueEncoding: string
  reverse: boolean
  keys: boolean
  values: boolean
  gt?: KDefault
  gte?: KDefault
  lt?: KDefault
  lte?: KDefault
}

const queryFromOptions = (options: IteratorOptions<any>) => {
  let query = 'SELECT key, value FROM kv'

  const params = []
  if (options.gt) {
    query += ` WHERE key > ?`
    params.push(options.gt)
  } else if (options.gte) {
    query += ` WHERE key >= ?`
    params.push(options.gte)
  }

  if (options.lt) {
    query += ` ${options.gt || options.gte ? 'AND' : 'WHERE'} key < ?`
    params.push(options.lt)
  } else if (options.lte) {
    query += ` ${options.gt || options.gte ? 'AND' : 'WHERE'} key <= ?`
    params.push(options.lte)
  }

  if (options.reverse) {
    query += ' ORDER BY key DESC'
  } else {
    query += ' ORDER BY key ASC'
  }

  if (options.limit) {
    query += ` LIMIT ${options.limit}`
  }

  return { query, params }
}
class SqliteIterator<KDefault, VDefault> extends AbstractIterator<
  SqliteLevel<KDefault, VDefault>,
  KDefault,
  VDefault
> {
  private client: any
  private iterator: IterableIterator<any>

  constructor(
    db: SqliteLevel<KDefault, VDefault>,
    options: IteratorOptions<KDefault>,
    client: any
  ) {
    super(db, options)
    this.client = client

    const { query, params } = queryFromOptions(options)
    const stmt = this.client.prepare(query)
    this.iterator = stmt.iterate(params)
  }

  async _next(callback: NextCallback<KDefault, VDefault>) {
    const result = this.iterator.next()
    if (!result.done) {
      return this.db.nextTick(
        callback,
        null,
        result.value.key,
        result.value.value
      )
    } else {
      return this.db.nextTick(callback, null, undefined, undefined)
    }
  }
}
class SqliteKeyIterator<KDefault, VDefault> extends AbstractKeyIterator<
  SqliteLevel<KDefault, VDefault>,
  KDefault
> {
  private client: any
  private iterator: IterableIterator<any>

  constructor(
    db: SqliteLevel<KDefault, VDefault>,
    options: IteratorOptions<KDefault>,
    client: any
  ) {
    super(db, options)
    this.client = client

    const { query, params } = queryFromOptions(options)
    const stmt = this.client.prepare(query)
    this.iterator = stmt.iterate(params)
  }

  async _next(callback: NextCallback<KDefault, VDefault>) {
    const result = this.iterator.next()
    if (!result.done) {
      return this.db.nextTick(callback, null, result.value.key)
    } else {
      return this.db.nextTick(callback, null, undefined)
    }
  }
}
class SqliteValueIterator<KDefault, VDefault> extends AbstractValueIterator<
  SqliteLevel<KDefault, VDefault>,
  KDefault,
  VDefault
> {
  private client: any
  private iterator: IterableIterator<any>

  constructor(
    db: SqliteLevel<KDefault, VDefault>,
    options: IteratorOptions<KDefault>,
    client: any
  ) {
    super(db, options)
    this.client = client

    const { query, params } = queryFromOptions(options)
    const stmt = this.client.prepare(query)
    this.iterator = stmt.iterate(params)
  }

  async _next(callback: NextCallback<KDefault, VDefault>) {
    const result = this.iterator.next()
    if (!result.done) {
      return this.db.nextTick(callback, null, result.value.value)
    } else {
      return this.db.nextTick(callback, null, undefined)
    }
  }
}

export class SqliteLevel<
  KDefault = string,
  VDefault = string
> extends AbstractLevel<Buffer | Uint8Array | string, KDefault, VDefault> {
  public db: any
  private readOnly: boolean = false

  constructor(options: SqliteLevelOptions<KDefault, VDefault>) {
    const encodings = { utf8: true }
    super({ encodings }, options)
    this.db = new Database(options.filename)
    this.db.pragma('journal_mode = WAL')
    if (options.readOnly !== undefined) {
      this.readOnly = options.readOnly
    }
  }

  get type() {
    return 'sqlite3'
  }

  async _open(options: AbstractOpenOptions, callback: (error?: Error) => void) {
    this.db.exec('CREATE TABLE IF NOT EXISTS kv (key TEXT, value TEXT)')
    this.nextTick(callback)
  }

  async _close(callback: (error?: Error) => void) {
    this.db.close()
    this.nextTick(callback)
  }

  async _get(
    key: Buffer,
    options: any,
    callback: (error?: Error, value?: Buffer) => void
  ) {
    const stmt = this.db.prepare('SELECT value FROM kv WHERE key = ?')
    const row = stmt.get(key.toString())
    if (row) {
      return this.nextTick(callback, null, row.value)
    } else {
      return this.nextTick(
        callback,
        new ModuleError(`Key ${key} was not found`, {
          code: 'LEVEL_NOT_FOUND',
        })
      )
    }
  }

  async _put(
    key: Buffer,
    value: Buffer,
    options: any,
    callback: (error?: Error) => void
  ) {
    if (this.readOnly) {
      return this.nextTick(
        callback,
        new ModuleError('not authorized to write to branch', {
          code: 'LEVEL_READ_ONLY',
        })
      )
    }
    const stmt = this.db.prepare('INSERT INTO kv (key, value) VALUES (?, ?)')
    stmt.run(key.toString(), value.toString())
    this.nextTick(callback)
  }

  async _del(key: Buffer, options: any, callback: (error?: Error) => void) {
    if (this.readOnly) {
      return this.nextTick(
        callback,
        new ModuleError('not authorized to write to branch', {
          code: 'LEVEL_READ_ONLY',
        })
      )
    }
    const stmt = this.db.prepare('DELETE FROM kv WHERE key = ?')
    stmt.run(key.toString())
    this.nextTick(callback)
  }

  async _batch(
    batch: BatchOperation[],
    options: any,
    callback: (error?: Error) => void
  ): Promise<void> {
    if (this.readOnly) {
      return this.nextTick(
        callback,
        new ModuleError('not authorized to write to branch', {
          code: 'LEVEL_READ_ONLY',
        })
      )
    }

    let batches: string[] = []
    let curBatch: string[] = []
    let curType: string | undefined = undefined
    for (const op of batch) {
      if (curType === undefined) {
        curType = op.type
      } else if (curType !== op.type) {
        if (curType === 'put') {
          batches.push(
            `INSERT INTO kv (key, value) VALUES ${curBatch.join(',')}`
          )
        } else if (curType === 'del') {
          batches.push(`DELETE FROM kv WHERE key IN (${curBatch.join(',')})`)
        }
        curBatch = []
        curType = op.type
      }
      if (op.type === 'put') {
        curBatch.push(`('${op.key.toString()}', '${op.value.toString()}')`)
      } else if (op.type === 'del') {
        curBatch.push(`'${op.key.toString()}'`)
      }
    }
    if (curBatch.length > 0) {
      if (curType === 'put') {
        batches.push(`INSERT INTO kv (key, value) VALUES ${curBatch.join(',')}`)
      } else if (curType === 'del') {
        batches.push(`DELETE FROM kv WHERE key IN (${curBatch.join(',')})`)
      }
    }
    for (const batch of batches) {
      this.db.exec(batch)
    }
    this.nextTick(callback)
  }

  async _clear(options: any, callback: (error?: Error) => void): Promise<void> {
    this.db.exec(`DELETE FROM kv WHERE key like '${options.gte}%'`)
    this.nextTick(callback)
  }

  _iterator(
    options: IteratorOptions<KDefault>
  ): SqliteIterator<KDefault, VDefault> {
    return new SqliteIterator<KDefault, VDefault>(this, options, this.db)
  }

  _keys(
    options: IteratorOptions<KDefault>
  ): SqliteKeyIterator<KDefault, VDefault> {
    return new SqliteKeyIterator<KDefault, VDefault>(this, options, this.db)
  }

  _values(
    options: IteratorOptions<KDefault>
  ): SqliteValueIterator<KDefault, VDefault> {
    return new SqliteValueIterator<KDefault, VDefault>(this, options, this.db)
  }
}
