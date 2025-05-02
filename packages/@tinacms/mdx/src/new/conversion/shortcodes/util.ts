import { codes } from 'micromark-util-symbol/codes'
import { values } from 'micromark-util-symbol/values'

const findValue = (string: string): string | null => {
  let lookupValue: string | null = null
  Object.entries(values).forEach(([key, value]) => {
    if (value === string) {
      lookupValue = key
    }
  })
  return lookupValue
}
export const findCode = (string: string | undefined | null): number | null => {
  if (!string) {
    return null
  }
  const lookup = findValue(string)
  let lookupValue: number | null = null
  if (lookup) {
    Object.entries(codes).forEach(([key, value]) => {
      if (key === lookup) {
        lookupValue = value
      }
    })
  }
  return lookupValue
}
export const printCode = (num: number) => {
  let lookupValue: string | null = null
  Object.entries(codes).forEach(([key, value]) => {
    if (value === num) {
      lookupValue = key
    }
  })
  console.log(lookupValue)
}
export const logSelf = (item: any) => {
  console.log(
    item.events.map((e: any) => {
      return `${e[0]} - ${e[1].type} | ${item.sliceSerialize(e[1])}`
    })
  )
}
