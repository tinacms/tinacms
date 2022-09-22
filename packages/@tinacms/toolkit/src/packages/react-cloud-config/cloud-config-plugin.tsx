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

import { MdOutlineCloud } from 'react-icons/md'

import { Plugin } from '../core'

/**
 * Represents a Tina Cloud Config that should be accessible via the CMS.
 *
 * The purpose of these configs is to give a way to display & edit information
 * about TIna Cloud Configuration
 * cases may include:
 *
 * * Tina Cloud Project Configuration
 * * User Management
 */
export interface CloudConfigPlugin extends Plugin {
  __type: 'cloud-config'
  text?: string
  Icon: any
  link: {
    text: string
    href: string
  }
}

/**
 * An options object used to create Cloud Config Plugins.
 */
export interface CloudConfigOptions {
  name: string
  text?: string
  link: {
    text: string
    href: string
  }
}

/**
 * Creates cloud config plugins.
 *
 * @param options
 */
export function createCloudConfig({
  ...options
}: CloudConfigOptions): CloudConfigPlugin {
  return {
    __type: 'cloud-config',
    Icon: MdOutlineCloud,
    ...options,
  }
}
