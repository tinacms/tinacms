import { AuditError, AuditIssue } from '../issue'
import { assertShape, resolve } from '@tinacms/graphql'
import { AuditArgs } from '../audit'

export const validateMutations = async (
  node,
  args: AuditArgs
): Promise<AuditIssue[]> => {
  const topLevelDefaults = {}

  // TODO: account for when collection is a string
  if (args.useDefaultValues && typeof args.collection.fields !== 'string') {
    args.collection.fields
      .filter((x) => !x.list)
      .forEach((x) => {
        const value = x.ui as any
        if (typeof value !== 'undefined') {
          topLevelDefaults[x.name] = value.defaultValue
        }
      })
  }
  const params = transformDocumentIntoMutationRequestPayload(
    node._values,
    {
      includeCollection: true,
      includeTemplate: typeof args.collection.templates !== 'undefined',
    },
    topLevelDefaults
  )

  const mutation = `mutation($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
        updateDocument(
          collection: $collection,
          relativePath: $relativePath,
          params: $params
        ){__typename}
      }`

  const mutationRes = await resolve({
    database: args.database,
    query: mutation,
    variables: {
      params,
      collection: args.collection.name,
      relativePath: node._sys.relativePath,
    },
    silenceErrors: true,
    verbose: true,
  })

  return (mutationRes.errors || []).map(
    (err) => new AuditError(err.message, node._sys.path)
  )
}

// TODO: move this to its own package
export const transformDocumentIntoMutationRequestPayload = (
  document: {
    _collection: string
    __typename?: string
    _template: string
    [key: string]: unknown
  },
  /** Whether to include the collection and template names as top-level keys in the payload */
  instructions: { includeCollection?: boolean; includeTemplate?: boolean },
  defaults?: any
) => {
  const { _collection, __typename, _template, ...rest } = document

  const params = transformParams(rest)
  const paramsWithTemplate = instructions.includeTemplate
    ? { [_template]: params }
    : params

  return instructions.includeCollection
    ? { [_collection]: { ...defaults, ...filterObject(paramsWithTemplate) } }
    : { ...defaults, ...filterObject(paramsWithTemplate) }
}

const transformParams = (data: unknown) => {
  if (['string', 'number', 'boolean'].includes(typeof data)) {
    return data
  }
  if (Array.isArray(data)) {
    return data.map((item) => transformParams(item))
  }
  try {
    assertShape<{ _template: string; __typename?: string }>(data, (yup) =>
      // @ts-ignore No idea what yup is trying to tell me:  Type 'RequiredStringSchema<string, Record<string, any>>' is not assignable to type 'AnySchema<any, any, any>
      yup.object({ _template: yup.string().required() })
    )
    const { _template, __typename, ...rest } = data
    const nested = transformParams(rest)
    return { [_template]: nested }
  } catch (e) {
    if (e.message === 'Failed to assertShape - _template is a required field') {
      if (!data) {
        return undefined
        return []
      }
      const accum = {}
      Object.entries(data).map(([keyName, value]) => {
        accum[keyName] = transformParams(value)
      })
      return accum
    } else {
      if (!data) {
        return undefined
        return []
      }
      throw e
    }
  }
}

// SRC: https://stackoverflow.com/questions/39977214/merge-in-es6-es7object-assign-without-overriding-undefined-values
function filterObject(obj) {
  const ret = {}
  Object.keys(obj)
    .filter((key) => obj[key] !== undefined)
    .forEach((key) => (ret[key] = obj[key]))
  return ret
}
