import { logger } from '../../logger'
import { ConfigManager } from '../../next/config-manager'
import { buildSchema, Database } from '@tinacms/graphql'
import { dangerText } from '../../utils/theme'
import { createAndInitializeDatabase } from '../../next/database'
import { ObjectField, TinaField } from '@tinacms/schema-tools'

export async function updateMediaCollection({
  datalayerPort,
  rootPath,
  noTelemetry,
}) {
  logger.level = 'info'

  process.chdir(rootPath)

  const configManager = new ConfigManager({
    rootPath: this.rootPath,
    legacyNoSDK: this.noSDK,
  })
  await configManager.processConfig()

  const { tinaSchema, graphQLSchema, lookup, queryDoc, fragDoc } =
    await buildSchema(configManager.config)

  const mediaConfig = tinaSchema.config.config.media
  // check if we are using repo based media
  if (!mediaConfig.tina) {
    logger.error(
      dangerText(
        'Collection backed media currently only supported with Tina Cloud'
      )
    )
    process.exit(1)
  }

  // check if we have a media collection
  if (!mediaConfig.collection) {
    logger.error(dangerText('No media collection found in config'))
    process.exit(1)
  }

  // check if the collection exists
  const collection = tinaSchema.getCollection(mediaConfig.collection)
  if (!collection) {
    logger.error(dangerText(`Collection ${mediaConfig.collection} not found`))
    process.exit(1)
  }

  // check if collection is csv
  if (collection.format !== 'csv') {
    logger.error(
      dangerText(`Collection ${mediaConfig.collection} is not a csv collection`)
    )
    process.exit(1)
  }

  let database: Database = null
  database = await createAndInitializeDatabase(
    configManager,
    Number(datalayerPort)
  )
  const files = await database.bridge.glob(collection.path, 'csv')

  // check if more than one media collection file
  if (files.length > 1) {
    logger.error(
      dangerText(
        `Multiple files found in ${collection.path}. Media collection must be a single file`
      )
    )
    process.exit(1)
  }

  const dataField = collection.fields.find(
    (field) => field.type === 'object' && field.list
  )
  if (!dataField) {
    throw new Error(`CSV collection must specify a root-level object list`)
  }
  const mediaCollectionPath = files.length
    ? files[0]
    : `${collection.path}/index.csv`
  const mediaPath = `${mediaConfig.tina.publicFolder}/${mediaConfig.tina.mediaRoot}`
  console.log({ mediaCollectionPath, mediaPath })
  const media = await database.bridge.glob(mediaPath, '*')
  console.log(media)

  const fields = (dataField as ObjectField<true>).fields
  const fieldLookup = fields.reduce((acc, field) => {
    acc[field.name] = field
    return acc
  }, {} as { [key: string]: TinaField<true> })

  const lines: string[] = []
  lines.push(Object.keys(fieldLookup).join(','))

  for (const file of media) {
    const sha = await database.bridge.sha(file)
    const line = fields.map((field) => {
      if (field.name === 'hash') {
        return sha
      } else if (field.name === 'filename') {
        return file.replace(mediaPath, '').slice(1)
      }
      return ''
    })
    lines.push(line.join(','))
  }
  await database.bridge.put(mediaCollectionPath, lines.join('\n'))
  // load the config
  // if we are using repo based media, we will update the collection
  // if it is not repo based media, can still update, but will need to query the media store
}
