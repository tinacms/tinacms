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

import fs from 'fs-extra'
import path from 'path'
import { validator } from './schema/validator'
import _ from 'lodash'
import type { Ajv } from 'ajv'
import get from 'lodash.get'
import * as jsyaml from 'js-yaml'
import { ForestryFMTSchema } from './schema/fmt'
import { ForestrySettingsSchema } from './schema/settings'
import { neutralText, successText, dangerText } from '../../utils/theme'
import { logger } from '../../logger'

export const audit = async (_ctx, _next, { fix }: { fix: boolean }) => {
  const output = await runValidation({
    directory: '.tina',
    ajv: validator({ fix }),
    fix,
  })

  if (fix) {
    writeToDisk(output)
  }
}

export const migrate = async (_ctx, _next, { dryRun }: { dryRun: boolean }) => {
  const output = await runValidation({
    directory: '.forestry',
    ajv: validator({ fix: !dryRun }),
    fix: !dryRun,
  })

  if (!dryRun) {
    writeToDisk(output)
  }
}

export const dump = async (_ctx, _next, { folder }) => {
  const directory = path.join(process.cwd(), folder)
  if (!(await fs.existsSync(directory))) {
    await fs.mkdirSync(directory)
  }
  await fs.writeFileSync(
    directory + '/settings_schema.json',
    JSON.stringify(ForestrySettingsSchema, null, 2)
  )
  await fs.writeFileSync(
    directory + '/fmt_schema.json',
    JSON.stringify(ForestryFMTSchema, null, 2)
  )
}

const writeToDisk = async (output) => {
  output.map(async ({ path, result }) => {
    if (result.success) {
      await fs.outputFile(
        path.replace('.forestry', '.tina'),
        jsyaml.dump(result.fileJSON)
      )
    }
  })
}

export const runValidation = async ({
  directory,
  ajv,
  fix,
}: {
  directory: string
  ajv: Ajv
  fix: boolean
}) => {
  const output = []
  const configDirPath = path.resolve(process.cwd(), directory)

  const settingsFullPath = path.join(configDirPath, 'settings.yml')
  const settingsJSON = jsyaml.safeLoad(
    await fs.readFileSync(settingsFullPath).toString()
  )
  output.push({
    path: settingsFullPath,
    result: await validateFile({
      filePath: 'settings.yml',
      payload: settingsJSON,
      schema: ForestrySettingsSchema,
      ajv,
      fix,
    }),
  })

  const templateDirPath = path.join(configDirPath, 'front_matter', 'templates')
  const templateList = await fs.readdirSync(path.join(templateDirPath))
  await Promise.all(
    templateList.map(async (templatePath) => {
      const templateFullpath = path.join(templateDirPath, templatePath)
      const templateJSON = jsyaml.safeLoad(
        await fs.readFileSync(templateFullpath).toString()
      )

      output.push({
        path: templateFullpath,
        result: await validateFile({
          filePath: templatePath,
          payload: templateJSON,
          schema: ForestryFMTSchema,
          ajv,
          fix,
        }),
      })
    })
  )

  return output
}

export const validateFile = async ({ filePath, payload, schema, ajv, fix }) => {
  let fileJSON = payload
  // if (fix) {
  if (fix) {
    fileJSON = moveRequiredKeys(fileJSON)
    fileJSON = pruneEmpty(fileJSON)
  }
  var validate = ajv.compile(schema)
  var valid = validate(fileJSON)

  if (!valid) {
    logger.error(`${filePath} is ${dangerText('invalid')}`)
    const errorKeys = printErrors(validate.errors, fileJSON)
    logger.error('\n')
    return { success: false, fileJSON, errors: errorKeys }
  } else {
    return { success: true, fileJSON, errors: [] }
  }
}

const printErrors = (errors, object) => {
  return errors
    .map((error) => {
      const handler = keywordError[error.keyword]
      if (!handler) {
        throw `Unable to find handler for ${error.keyword}`
      } else {
        return handler(error, object)
      }
    })
    .filter(Boolean)
}

const keywordError = {
  required: (error, object) => {
    logger.error(`${propertyName(error, object)} ${error.message}`)

    return error
  },
  minItems: (error) => {
    logger.error(
      `${propertyName(error)} ${error.message} but got ${dangerText(
        displayType(error)
      )}`
    )

    return error
  },
  exclusiveMinimum: (error, object) => {
    logger.error(`${propertyName(error, object)} ${error.message}`)

    return error
  },
  minimum: (error, object) => {
    logger.error(
      `${propertyName(error)} ${error.message} but got ${dangerText(
        displayType(error)
      )}`
    )

    return error
  },
  maximum: (error, object) => {
    logger.error(
      `${propertyName(error)} ${error.message} but got ${dangerText(
        displayType(error)
      )}`
    )

    return error
  },
  const: (error) => {
    if (error.schema === 'now') {
      // Ignoring for this case since it's handled better by anyOf
    } else {
      logger.error(`Unanticipated error - ${error.keyword}`)
      logger.error(error)
    }

    return false
  },
  format: (error) => {
    if (error.schema === 'date-time') {
      // Ignoring for this case since it's handled better by anyOf
    } else {
      logger.error(`Unanticipated error - ${error.keyword}`)
    }
    return false
  },
  anyOf: (error, object) => {
    logger.error(`${propertyName(error, object)} should be one of:
    ${anyOfPossibleTypes(error)}
    But got ${dangerText(displayType(error))}
`)
    return error
  },
  oneOf: (error) => {
    logger.error(`Unanticipated error - ${error.keyword}`)
    logger.error(error)
    return false
  },
  datetimeFormat: (error, object) => {
    logger.error(
      `${propertyName(
        error,
        object
      )} should be either "now" or a valid datetime format (${dangerText(
        error.data
      )})`
    )
    return error
  },
  minLength: (error, object) => {
    logger.error(
      `${propertyName(error, object)} should not be shorter than ${dangerText(
        error.params.limit
      )} character`
    )
    return error
  },
  removeIfFails: () => {
    // Do nothing
    return false
  },
  additionalProperties: (error, object) => {
    logger.error(
      `${propertyName(
        error,
        object
      )} contains an additional property ${dangerText(
        error.params.additionalProperty
      )}`
    )
    return error
  },
  multipleOf: (error, object) => {
    logger.error(
      `${propertyName(error, object)} ${error.message} but got ${dangerText(
        displayType(error)
      )}`
    )
    return error
  },
  enum: (error, object) => {
    logger.error(
      `${propertyName(error, object)} ${error.message} but got ${dangerText(
        displayType(error)
      )}
        Allowed values: ${successText(error.schema.join(', '))}
    `
    )
    return error
  },
  type: (error, object) => {
    logger.error(
      `${propertyName(error, object)} ${error.message.replace(
        'should be',
        'should be of type'
      )} but got ${dangerText(displayType(error))}`
    )
    return error
  },
  if: () => {
    // an error stating should match "then" schema
    // indicates that the conditional schema isn't matched -
    // we should get a more specific error elsewhere so ignore these
    // unless debugging.
    return false
  },
}

const displayType = (error) => {
  if (error.data === null) {
    return 'null'
  } else {
    let value = error.data
    if (typeof error.data === 'string' && error.data.length === 0) {
      value = `""`
    }
    if (Array.isArray(error.data)) {
      return `an array`
    }
    return `${typeof error.data} (${value})`
  }
}

const propertyName = (error, object = null) => {
  if (object) {
    const lastFieldIndex = error.dataPath
      .split('.')
      .reverse()
      .findIndex((item) => /fields\[[0-9]+\]/.test(item))
    const steps = error.dataPath.split('.').length

    const dataPath = error.dataPath
      .split('.')
      .reverse()
      .slice(lastFieldIndex, steps - 1)
      .reverse()
      .join('.')

    const property = error.dataPath.replace('.' + dataPath, '')

    const field = get(object, dataPath)
    if (field) {
      return `
Field with name ${successText(field.name)} of type ${neutralText(
        fieldTypeLabel(field)
      )} has an invalid property ${dangerText(property)}
     at ${dataPath}
    `
    } else {
      return `${neutralText(error.dataPath)}`
    }
  }
  return neutralText(error.dataPath)
}

const fieldTypeLabel = (field) => {
  if (field.type === 'select' || field.type === 'list') {
    if (!field.config) {
      return `${field.type} (text)`
    }
    return `${field.type} (${field.config?.source?.type})`
  }

  return field.type
}

const anyOfPossibleTypes = (error) => {
  return error.schema
    .map((item) => {
      if (item.const) {
        return ` - A value equal to ${successText(item.const)}`
      }

      if (item.format) {
        return `     - A value which adheres to the ${
          jsonSchemaFormats[item.format]
        } format`
      }

      if (item.multipleOf || item.type === 'null') {
        // Ignore, we're handling this better elsewhere
        return false
      }
      logger.error(`Unrecognized oneOf schema key`, item)
    })
    .filter(Boolean)
    .join('\n')
}

const jsonSchemaFormats = {
  'date-time': 'datetime',
}

// Some fields have the "required" key in the wrong spot. Put them in the config
const moveRequiredKeys = (json) => {
  const string = JSON.stringify(json)

  return JSON.parse(string, (key, value) => {
    if (key === 'fields') {
      const itemWithRequired = value.find((item) => item.required)
      if (itemWithRequired) {
        itemWithRequired.config = {
          required: itemWithRequired.required,
          ...itemWithRequired.config,
        }
        delete itemWithRequired.required
      }
    }
    return value
  })
}

function pruneEmpty(obj) {
  return (function prune(current) {
    _.forOwn(current, function (value, key) {
      // Empty values in defaults might be valid
      // let the schema decide
      if (key === 'default') {
        return
      }

      if (
        _.isUndefined(value) ||
        _.isNull(value) ||
        _.isNaN(value) ||
        (_.isString(value) && _.isEmpty(value)) ||
        (_.isObject(value) && _.isEmpty(prune(value)))
      ) {
        delete current[key]
      }
    })
    if (_.isArray(current)) _.pull(current, undefined)

    return current
  })(_.cloneDeep(obj))
}
