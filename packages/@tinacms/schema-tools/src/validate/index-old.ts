/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { TinaCloudSchema } from '../types'
import * as yup from 'yup'
import { assertShape } from '../util'
const regexMessageFunc = (message) =>
  `Field "${message.path}" with value "${message.value}" must match ${message.regex}. For example - "my-title" is invalid, use "myTitle" or "my_title instead`

export const validateSchema = ({
  config,
}: {
  config: TinaCloudSchema<false>
}) => {
  yup.addMethod(yup.array, 'oneOfSchemas', function (schemas) {
    return this.test('one-of-schemas', function (items, context) {
      if (typeof items === 'undefined') {
        return
      }

      try {
        return items.every((item) => {
          return schemas.some((schema, index) => {
            if (schema.isValidSync(item, { strict: true })) {
              return true
            } else {
              if (item.type) {
                const isAType = yup
                  .string()
                  .oneOf(types)
                  .required()
                  .isValidSync(item.type, { strict: true })

                if (!isAType) {
                  throw new ValidationError({
                    message: `at path ${
                      context.path
                    } \`type\` must be one of:\n\t${types.join(
                      ', '
                    )}\nbut received \`${item.type}\``,
                  })
                } else {
                  const schema = schemaMap[item.type]

                  let error = ''
                  if (!schema) {
                    // logger.info("no schema validate", item.type);
                  } else {
                    try {
                      schema.validateSync(item)
                    } catch (e) {
                      error = e.errors.join('\n')
                      throw new ValidationError({
                        message: `Not all items in ${context.path} match one of the allowed schemas:\n\t${error}`,
                      })
                    }
                  }
                }
              }

              return false
            }
          })
        })
      } catch (e) {
        if (e instanceof ValidationError) {
          return context.createError(e.validationMessage)
        } else {
          throw e
        }
      }
    })
  })
  const baseSchema = yup.object({
    label: yup.string().required(),
    name: yup
      .string()
      .required()
      .matches(/^[_a-zA-Z][_a-zA-Z0-9]*$/, {
        message: regexMessageFunc,
      }),
    description: yup.string(),
  })

  const TextSchema = baseSchema.label('text').shape({
    type: yup
      .string()
      .matches(/^text$/)
      .required(),
  })

  const DateTimeSchema = baseSchema.label('datetime').shape({
    type: yup
      .string()
      .matches(/^datetime$/)
      .required(),
    dateFormat: yup.string().required(),
    timeFormat: yup.string(),
  })

  const ToggleSchema = baseSchema.label('toggle').shape({
    type: yup
      .string()
      .matches(/^toggle$/)
      .required(),
  })

  const ImageSchema = baseSchema.label('image').shape({
    type: yup
      .string()
      .matches(/^image$/)
      .required(),
  })

  const NumberSchema = baseSchema.label('number').shape({
    type: yup
      .string()
      .matches(/^number$/)
      .required(),
  })
  const TextAreaSchema = baseSchema.label('textarea').shape({
    type: yup
      .string()
      .matches(/^textarea$/)
      .required(),
  })
  const TagsSchema = baseSchema.label('tags').shape({
    type: yup
      .string()
      .matches(/^tags$/)
      .required(),
  })
  const SelectSchema = baseSchema.label('select').shape({
    type: yup
      .string()
      .matches(/^select$/)
      .required(),
    // options: yup.array().min(1).of(yup.string()).required(),
    options: yup.array().min(1).required(),
  })
  const ListSchema = baseSchema.label('list').shape({
    type: yup
      .string()
      .matches(/^list$/)
      .required(),
  })
  const GroupSchema = baseSchema.label('group').shape({
    type: yup
      .string()
      .matches(/^group$/)
      .required(),
    fields: yup.lazy(() =>
      yup
        .array()
        .min(1, (message) => `${message.path} must have at least 1 item`)
        // @ts-ignore custom method to mimic oneOf for objects https://github.com/jquense/yup/issues/69#issuecomment-496814887
        .oneOfSchemas(FieldSchemas)
        .required()
    ),
  })
  const GroupListSchema = baseSchema.label('group-list').shape({
    type: yup
      .string()
      .matches(/^group-list$/)
      .required(),
    fields: yup.lazy(() =>
      yup
        .array()
        .min(1, (message) => `${message.path} must have at least 1 item`)
        // @ts-ignore custom method to mimic oneOf for objects https://github.com/jquense/yup/issues/69#issuecomment-496814887
        .oneOfSchemas(FieldSchemas)
        .required()
    ),
  })
  const ReferenceSchema = baseSchema.label('reference').shape({
    type: yup
      .string()
      .matches(/^reference$/)
      .required(),
    collection: yup
      .string()
      .oneOf(config.collections.map((collection) => collection.name))
      .required(),
  })
  const ReferenceListSchema = baseSchema.label('reference-list').shape({
    type: yup
      .string()
      .matches(/^reference-list$/)
      .required(),
    collection: yup
      .string()
      .oneOf(
        config.collections.map((collection) => collection.name),
        (message) =>
          `${message.path} must be one of the following values: ${message.values}, but instead received: ${message.value}`
      )
      .required(),
  })

  const BlocksSchema = baseSchema.label('blocks').shape({
    type: yup
      .string()
      .matches(/^blocks$/)
      .required(),
    templates: yup.lazy(() =>
      yup
        .array()
        .min(1, (message) => `${message.path} must have at least 1 item`)
        .of(TemplateSchema)
        .required('templates is a required field')
    ),
  })
  let schemaMap = {
    text: TextSchema,
    datetime: DateTimeSchema,
    textarea: TextAreaSchema,
    select: SelectSchema,
    list: ListSchema,
    image: ImageSchema,
    group: GroupSchema,
    'group-list': GroupListSchema,
    reference: ReferenceSchema,
    'reference-list': ReferenceListSchema,
    blocks: BlocksSchema,
  }
  let FieldSchemas = [
    TextSchema,
    DateTimeSchema,
    TextAreaSchema,
    SelectSchema,
    ListSchema,
    NumberSchema,
    TagsSchema,
    ToggleSchema,
    ImageSchema,
    BlocksSchema,
    // FIXME: for some reason these mess up the blocks test if they're listed before it
    GroupSchema,
    GroupListSchema,
    ReferenceSchema,
    ReferenceListSchema,
  ]

  const TemplateSchema = yup.object({
    label: yup.string().required(),
    name: yup
      .string()
      .required()
      .matches(/^[_a-zA-Z][_a-zA-Z0-9]*$/, {
        message: regexMessageFunc,
      }),
    fields: yup
      .array()
      .min(1, (message) => `${message.path} must have at least 1 item`)
      // @ts-ignore custom method to mimic oneOf for objects https://github.com/jquense/yup/issues/69#issuecomment-496814887
      .oneOfSchemas(FieldSchemas)
      .required(),
  })
  assertShape<{}>(config, (yup) =>
    yup.object({
      collections: yup
        .array()
        .min(1, (message) => `${message.path} must have at least 1 item`)
        .of(
          yup.object({
            label: yup.string().required(),
            path: yup.string().required(),
            name: yup.string().required(),
            templates: yup
              .array()
              .min(1, (message) => `${message.path} must have at least 1 item`)
              .of(TemplateSchema)
              .required('templates is a required field'),
          })
        )
        .required('collections is a required field'),
    })
  )
}

type validationMessage = {
  message: string
}
class ValidationError extends Error {
  public validationMessage: validationMessage
  constructor(validationMessage: validationMessage, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    // @ts-ignore
    if (Error.captureStackTrace) {
      // @ts-ignore
      Error.captureStackTrace(this, ValidationError)
    }

    this.name = 'ValidationError'
    this.validationMessage = validationMessage
  }
}
