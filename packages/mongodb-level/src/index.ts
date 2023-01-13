/**
 Copyright 2022 Forestry.io Holdings, Inc.
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
  NodeCallback,
} from 'abstract-level'
import {
  Collection,
  Db,
  Document,
  MongoClient,
  FindCursor,
  Filter,
} from 'mongodb'
import { NextCallback } from 'abstract-level/types/abstract-iterator'

const ModuleError = require('module-error')

declare interface MongodbLevelOptions<K, V>
  extends AbstractDatabaseOptions<K, V> {
  mongoUri: string
  dbName: string
  collectionName: string
}

declare interface MongodbLevelOpenOptions extends AbstractOpenOptions {
  /**
   * An {@link AbstractLevel} option that has no effect on {@link MongodbLevel}.
   */
  createIfMissing?: boolean

  /**
   * An {@link AbstractLevel} option that has no effect on {@link MongodbLevel}.
   */
  errorIfExists?: boolean
}

declare type BatchOperation = BatchPutOperation | BatchDelOperation

/**
 * A _put_ operation to be committed by a {@link MongodbLevel}.
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
 * A _del_ operation to be committed by a {@link MongodbLevel}.
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

// TODO implement Manifest to indicate supported features

declare interface IteratorOptions<KDefault> {
  limit: number
  keyEncoding: string
  valueEncoding: string
  reverse: boolean
  keys: boolean
  values: boolean
  collection: Collection
  gt?: KDefault
  gte?: KDefault
  lt?: KDefault
  lte?: KDefault
}

const buildCursor = <KDefault>(
  collection: Collection,
  projection: Document,
  options: IteratorOptions<KDefault>
) => {
  let cursor: FindCursor | undefined
  const filter: Filter<Document> = {}
  if (options.lte !== undefined) {
    filter.key = { $lte: options.lte }
  } else if (options.lt !== undefined) {
    filter.key = { $lt: options.lt }
  }
  if (options.gte !== undefined) {
    filter.key = { ...filter.key, $gte: options.gte }
  } else if (options.gt !== undefined) {
    filter.key = { ...filter.key, $gt: options.gt }
  }
  cursor = collection
    .find(filter, projection)
    .sort({ key: options.reverse ? -1 : 1 })
  if (options.limit > 0) {
    cursor = cursor.limit(options.limit)
  }
  return cursor
}

class MongodbIterator<KDefault, VDefault> extends AbstractIterator<
  MongodbLevel<KDefault, VDefault>,
  KDefault,
  VDefault
> {
  private cursor: FindCursor
  constructor(
    db: MongodbLevel<KDefault, VDefault>,
    collection: Collection,
    options: IteratorOptions<KDefault>
  ) {
    super(db, options)
    this.cursor = buildCursor<KDefault>(
      collection,
      { key: 1, value: 1 },
      options
    )
  }

  async _next(callback: NextCallback<KDefault, VDefault>) {
    if (await this.cursor.hasNext()) {
      const result = await this.cursor.next()
      callback(null, result.key, result.value)
    } else {
      this.db.nextTick(callback)
    }
  }
}

class MongodbKeyIterator<KDefault, VDefault> extends AbstractKeyIterator<
  MongodbLevel<KDefault, VDefault>,
  KDefault
> {
  private cursor: FindCursor
  constructor(
    db: MongodbLevel<KDefault, VDefault>,
    collection: Collection,
    options: IteratorOptions<KDefault>
  ) {
    super(db, options)

    this.cursor = buildCursor<KDefault>(collection, { key: 1 }, options)
  }

  async _next(callback: NodeCallback<KDefault>) {
    if (await this.cursor.hasNext()) {
      const result = await this.cursor.next()
      callback(null, result.key)
    } else {
      this.db.nextTick(callback)
    }
  }
}

class MongodbValueIterator<KDefault, VDefault> extends AbstractValueIterator<
  MongodbLevel<KDefault, VDefault>,
  KDefault,
  VDefault
> {
  private cursor: FindCursor
  constructor(
    db: MongodbLevel<KDefault, VDefault>,
    collection: Collection,
    options: IteratorOptions<KDefault>
  ) {
    super(db, options)

    this.cursor = buildCursor<KDefault>(collection, { value: 1 }, options)
  }

  async _next(callback: NextCallback<KDefault, VDefault>) {
    if (await this.cursor.hasNext()) {
      const result = await this.cursor.next()
      callback(null, result.value)
    } else {
      this.db.nextTick(callback)
    }
  }
}

export class MongodbLevel<
  KDefault = string,
  VDefault = string
> extends AbstractLevel<Buffer | Uint8Array | string, KDefault, VDefault> {
  private readonly collectionName: string
  private readonly dbName: string
  private readonly mongoUri: string

  private client?: MongoClient
  private collection?: Collection
  private db?: Db

  constructor(options: MongodbLevelOptions<KDefault, VDefault>) {
    // Declare supported encodings
    const encodings = { utf8: true }
    super({ encodings }, options)

    this.mongoUri = options.mongoUri
    this.dbName = options.dbName
    this.collectionName = options.collectionName
  }

  get type() {
    return 'mongodb-level'
  }

  async _open(
    options: MongodbLevelOpenOptions,
    callback: (error?: Error) => void
  ): Promise<void> {
    if (!this.mongoUri) {
      return this.nextTick(
        callback,
        new ModuleError('mongoUri is required', { code: 'MONGO_URI_REQUIRED' })
      )
    }
    if (!this.dbName) {
      return this.nextTick(
        callback,
        new ModuleError('dbName is required', { code: 'DB_NAME_REQUIRED' })
      )
    }
    if (!this.collectionName) {
      return this.nextTick(
        callback,
        new ModuleError('collectionName is required', {
          code: 'COLLECTION_NAME_REQUIRED',
        })
      )
    }
    this.client = new MongoClient(this.mongoUri)
    await this.client.connect()
    this.db = this.client.db(this.dbName)
    this.collection = this.db.collection(this.collectionName)
    await this.collection.createIndex(
      {
        key: 1,
      },
      {
        unique: true,
      }
    )
    this.nextTick(callback)
  }

  async _close(callback: (error?: Error) => void): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.collection = undefined
      this.db = undefined
    }
    this.nextTick(callback)
  }

  async _put(
    key: Buffer,
    value: Buffer,
    options: any,
    callback: (error?: Error) => void
  ): Promise<void> {
    try {
      await this.collection!.updateOne(
        { key },
        { $set: { value } },
        { upsert: true, hint: 'key_1' }
      ) // TODO do not hardcode index name
    } catch (e: any) {
      return callback(new ModuleError(e.message))
    }

    this.nextTick(callback)
  }

  async _get(
    key: Buffer,
    options: any,
    callback: (error?: Error, value?: Buffer) => void
  ): Promise<void> {
    try {
      const result = await this.collection!.findOne({ key: key })
      if (result) {
        this.nextTick(callback, null, result.value)
      } else {
        return this.nextTick(
          callback,
          new ModuleError(`Key ${key} was not found`, {
            code: 'LEVEL_NOT_FOUND',
          })
        )
      }
    } catch (e: any) {
      return callback(new ModuleError(e.message))
    }
  }

  async _del(
    key: Buffer,
    options: any,
    callback: (error?: Error) => void
  ): Promise<void> {
    try {
      await this.collection!.deleteOne({ key })
    } catch (e: any) {
      return callback(new ModuleError(e.message))
    }

    this.nextTick(callback)
  }

  async _batch(
    batch: BatchOperation[],
    options: any,
    callback: (error?: Error) => void
  ): Promise<void> {
    const bulk = this.collection!.initializeUnorderedBulkOp()

    for (const op of batch) {
      if (op.type === 'put') {
        bulk
          .find({ key: op.key })
          .upsert()
          .updateOne({ $set: { value: op.value } })
      } else if (op.type === 'del') {
        bulk.find({ key: op.key }).deleteOne()
      }
    }

    try {
      await bulk.execute()
    } catch (e: any) {
      return callback(new ModuleError(e.message))
    }

    this.nextTick(callback)
  }

  async _clear(options: any, callback: (error?: Error) => void): Promise<void> {
    try {
      await this.collection!.deleteMany({})
    } catch (e: any) {
      return callback(new ModuleError(e.message))
    }

    this.nextTick(callback)
  }

  _iterator(
    options: IteratorOptions<KDefault>
  ): MongodbIterator<KDefault, VDefault> {
    return new MongodbIterator<KDefault, VDefault>(
      this,
      this.collection!,
      options
    )
  }

  _keys(
    options: IteratorOptions<KDefault>
  ): MongodbKeyIterator<KDefault, VDefault> {
    return new MongodbKeyIterator<KDefault, VDefault>(
      this,
      this.collection!,
      options
    )
  }

  _values(
    options: IteratorOptions<KDefault>
  ): MongodbValueIterator<KDefault, VDefault> {
    return new MongodbValueIterator<KDefault, VDefault>(
      this,
      this.collection!,
      options
    )
  }
}
