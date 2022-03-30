import { InputType, GraphQLTypes, ValueTypes } from '../zeus'

export type Response<
  T extends keyof GraphQLTypes,
  O extends object
> = InputType<GraphQLTypes[T], O>

export const getTinaField = <T extends object>(obj: T, property?: keyof T) => {
  let rs
  if (!property) {
    // @ts-ignore
    rs = obj._fieldId
  }
  // @ts-ignore
  rs = obj?._leafs
    ? // @ts-ignore
      obj._leafs.find((item) => item.name === property)?._fieldId
    : null

  return rs
}
