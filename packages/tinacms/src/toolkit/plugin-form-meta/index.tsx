import { Plugin } from '@toolkit/core'

export class FormMetaPlugin implements Plugin {
  __type: string = 'form:meta'
  name: string
  Component: any

  constructor(options) {
    this.name = options.name
    this.Component = options.Component
  }
}
