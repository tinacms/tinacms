const charCodeOfDot = '.'.charCodeAt(0)
const reEscapeChar = /\\(\\)?/g
const rePropName = RegExp(
  // Match anything that isn't a dot or bracket.
  '[^.[\\]]+' +
    '|' +
    // Or match property names within brackets.
    '\\[(?:' +
    // Match a non-string expression.
    '([^"\'][^[]*)' +
    '|' +
    // Or match strings (supports escaping characters).
    '(["\'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2' +
    ')\\]' +
    '|' +
    // Or match "" as the space between consecutive dots or empty brackets.
    '(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))',
  'g'
)

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
const stringToPath = (string: string) => {
  const result = []
  if (string.charCodeAt(0) === charCodeOfDot) {
    result.push('')
  }
  string.replace(rePropName, (match, expression, quote, subString) => {
    let key = match
    if (quote) {
      key = subString.replace(reEscapeChar, '$1')
    } else if (expression) {
      key = expression.trim()
    }
    result.push(key)
  })
  return result
}

const keysCache: { [key: string]: string[] } = {}
const keysRegex = /[.[\]]+/

const toPath = (key: string): string[] => {
  if (key === null || key === undefined || !key.length) {
    return []
  }
  if (typeof key !== 'string') {
    throw new Error('toPath() expects a string')
  }
  if (keysCache[key] == null) {
    /**
     * The following patch fixes issue 456, introduced since v4.20.3:
     *
     * Before v4.20.3, i.e. in v4.20.2, a `key` like 'choices[]' would map to ['choices']
     * (e.g. an array of choices used where 'choices[]' is name attribute of an input of type checkbox).
     *
     * Since v4.20.3, a `key` like 'choices[]' would map to ['choices', ''] which is wrong and breaks
     * this kind of inputs e.g. in React.
     *
     * v4.20.3 introduced an unwanted breaking change, this patch fixes it, see the issue at the link below.
     *
     * @see https://github.com/final-form/final-form/issues/456
     */
    if (key.endsWith('[]')) {
      // v4.20.2 (a `key` like 'choices[]' should map to ['choices'], which is fine).
      keysCache[key] = key.split(keysRegex).filter(Boolean)
    } else {
      // v4.20.3 (a `key` like 'choices[]' maps to ['choices', ''], which breaks applications relying on inputs like `<input type="checkbox" name="choices[]" />`).
      keysCache[key] = stringToPath(key)
    }
  }
  return keysCache[key]
}
export const getDeepestMetadata = (state: Object, complexKey: string): any => {
  // Intentionally using iteration rather than recursion
  const path = toPath(complexKey)
  let current: any = state
  let metadata: any
  for (let i = 0; i < path.length; i++) {
    const key = path[i]
    if (
      current === undefined ||
      current === null ||
      typeof current !== 'object' ||
      (Array.isArray(current) && isNaN(Number(key)))
    ) {
      return undefined
    }
    const value = current[key]
    if (value?._tina_metadata) {
      // We're at a reference field, we don't want to select the
      // reference form, just the reference select field
      if (complexKey === value._tina_metadata?.prefix && metadata) {
      } else {
        metadata = value._tina_metadata
      }
    }
    current = value
  }
  return metadata
}
export const getFormAndFieldNameFromMetadata = (
  object: object,
  eventFieldName: string
) => {
  let formId
  let n
  const value = getDeepestMetadata(object, eventFieldName)
  if (value) {
    if (value.prefix) {
      const fieldName = eventFieldName.slice(value?.prefix?.length + 1)
      const localFieldName = value.name
        ? fieldName.slice(value?.name?.length + 1)
        : fieldName
      if (localFieldName) {
        // If localFieldName is tags.2, just use `tags`
        if (!isNaN(Number(localFieldName.split('.')[1]))) {
          n = value.fields[localFieldName.split('.')[0]]
        } else {
          n = value.fields[localFieldName]
        }
      } else {
        n = value.name
      }
      formId = value.id
    }
  }
  return { formId, fieldName: n }
}
