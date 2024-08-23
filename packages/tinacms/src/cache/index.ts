export { NodeCache } from './node-cache'

export type Cache = {
  get: (key: string) => Promise<any>
  makeKey: (key: any) => string
  set: (key: string, value: any) => Promise<void>
}
