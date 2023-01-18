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

export interface Command {
  resource?: string
  command: string
  alias?: string
  description: string
  action: (...args: any[]) => void
  examples?: string
  subCommands?: Command[]
  options?: Option[]
}

export const command = <O extends Option>(args: {
  command: string
  description: string
  options: O[]
  action: (options: {
    [key in O['key']]?: Extract<O, { key: key }>['defaultValue'] extends string
      ? string
      : Extract<O, { key: key }>['defaultValue'] extends boolean
      ? boolean
      : Extract<O, { key: key }>['defaultValue'] extends number
      ? number
      : Extract<O, { key: key }>['defaultValue'] extends string[]
      ? string[]
      : string
  }) => void
}): Command => {
  return args
}
export const commandx = <O extends Option>(args: {
  command: string
  description: string
  options: O[]
  action: (options: {
    [key in O['key']]: Extract<O, { key: key }>['defaultValue'] extends string
      ? string
      : boolean
  }) => void
}): Command => {
  return args
}
export const command2 = <O extends Option[], T extends O[number]>(args: {
  command: string
  description: string
  options: O
  action: (options: {
    [key in T['key']]: T['defaultValue']
  }) => void
}): Command => {
  return args
}
export const commandBackup = <O extends { [key: string]: Option }>(args: {
  command: string
  description: string
  options: Option[]
  option2: O[]
  action: (options: { [K in keyof O]: O[K] }) => void
}): Command => {
  return args
}

export type Command2<O extends Option[]> = {
  command: string
  description: string
  action: (options: { [key in Option['key']]?: string }) => void
  options: O[]
}

interface Option {
  name: string
  description: string
  key: string
  defaultValue?: number | boolean | string | string[]
}

export type Action<ContextModification extends object = {}> = {
  options: Option[]
  action: (...args: any[]) => void
}
