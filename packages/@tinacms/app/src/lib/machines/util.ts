/**

*/
import { DocumentBlueprint } from '../formify/types'

type Location = number[] | null

export const getBlueprintValues = (
  data: object,
  path: string,
  index: number = 0
): string[] | undefined => {
  if (!data) {
    return
  }
  const pathArray = path.split('.')
  const next = pathArray[index]
  if (next === '[]') {
    if (Array.isArray(data)) {
      const values: string[] = []
      data.forEach((item) => {
        const res = getBlueprintValues(item, path, index + 1)
        if (res) {
          res.forEach((item) => {
            values.push(item)
          })
        }
      })
      return values
    }
  } else {
    const value = data[next]
    // Is last item
    if (pathArray.length === index + 1) {
      if (Array.isArray(value)) {
        return value
      } else {
        return [value]
      }
    } else {
      return getBlueprintValues(value, path)
    }
  }
}

export const getAllIn = (
  data: object | object[] | null,
  path: string,
  index: number = 0,
  location: Location = null
): { value: { id: string }; location: Location }[] | undefined => {
  if (!data) {
    return
  }
  const pathArray = path.split('.')
  const next = pathArray[index]
  if (next === '[]') {
    if (Array.isArray(data)) {
      const values: { value: { id: string }; location: Location }[] = []
      data.forEach((item, dataIndex) => {
        const res = getAllIn(item, path, index + 1, [
          ...(location || []),
          dataIndex,
        ])
        if (res) {
          res.forEach((item) => {
            values.push(item)
          })
        }
      })
      return values
    }
  } else {
    const value = data[next]
    // Is last item
    if (pathArray.length === index + 1) {
      if (Array.isArray(value)) {
        const v = value.map((item, index) => ({
          value: item,
          location: [...(location || []), index],
        }))
        return v
      } else {
        if (typeof value === 'string') {
          const v = [{ value: { id: value }, location }]
          return v
        } else {
          // FIXME: this should always be `_internalSys.path` but we're not populating the
          // data properly on resolveData yet. But even when we are, will need to keep that out
          // of the user-provided payload (maybe not?)
          const id = value?._internalSys?.path || value?.id
          if (id) {
            const v = [{ value: { id, ...value }, location }]
            return v
          }
        }
      }
    } else {
      const v = getAllIn(value, path, index + 1, location)
      return v
    }
  }
}
export const getAllInBlueprint = (
  data: object | object[] | null,
  path: string,
  index: number = 0,
  location: Location = null
):
  | { value: { _internalSys: { path: string } }; location: Location }[]
  | undefined => {
  if (!data) {
    return
  }
  const pathArray = path.split('.')
  const next = pathArray[index]
  if (next === '[]') {
    if (Array.isArray(data)) {
      const values: {
        value: { _internalSys: { path: string } }
        location: Location
      }[] = []
      data.forEach((item, dataIndex) => {
        const res = getAllInBlueprint(item, path, index + 1, [
          ...(location || []),
          dataIndex,
        ])
        if (res) {
          res.forEach((item) => {
            values.push(item)
          })
        }
      })
      return values
    }
  } else {
    const value = data[next]
    // Is last item
    if (pathArray.length === index + 1) {
      if (Array.isArray(value)) {
        throw new Error(`Unexpected array value for getAllInBlueprint`)
      } else {
        if (typeof value === 'string') {
          throw new Error(`Unexpected string value for getAllInBlueprint`)
        } else {
          const id = value?._internalSys?.path || value?.id
          if (id) {
            const v = [
              { value: { _internalSys: value._internalSys }, location },
            ]
            return v
          }
        }
      }
    } else {
      const v = getAllInBlueprint(value, path, index + 1, location)
      return v
    }
  }
}

export const getBlueprintFromLocation = (
  location: string,
  blueprints: DocumentBlueprint[]
) => {
  const blueprintString = location
    .split('.')
    .map((item) => (isNaN(Number(item)) ? item : '[]'))
    .join('.')
  const blueprint = blueprints.find(({ id }) => id === blueprintString)
  if (!blueprint) {
    throw new Error(`Unable to find blueprint at ${blueprintString}`)
  }
  return blueprint
}

// FIXME: this assumes children are in order (which they
// are AFAIK but shouldn't be relied on)
export const getBlueprintChildren = (
  blueprint: DocumentBlueprint,
  blueprints: DocumentBlueprint[]
) => {
  const foundChildren: DocumentBlueprint[] = []
  blueprints.forEach((otherBlueprint) => {
    if (foundChildren.find(({ id }) => otherBlueprint.id.startsWith(id))) {
      return
    }
    if (
      otherBlueprint.id.startsWith(blueprint.id) &&
      otherBlueprint.id !== blueprint.id
    ) {
      foundChildren.push(otherBlueprint)
    }
  })
  return foundChildren
}
