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

import { logger } from '../../logger'
import chalk from 'chalk'

export interface AuditIssue {
  level: 'error' | 'warning'
  docPath: string
  print: () => void
}

abstract class BaseAuditIssue implements AuditIssue {
  message: string
  level: 'error' | 'warning'
  docPath: string
  constructor(message: string, level: 'error' | 'warning', docPath: string) {
    this.docPath = docPath
    this.level = level
    this.message = message
  }

  print() {
    throw new Error('Not Implemented')
  }

  protected formatOutput() {
    return `${this.docPath}: ${this.message}`
  }
}

export class AuditError extends BaseAuditIssue {
  constructor(message: string, docPath: string) {
    super(message, 'error', docPath)
  }
  public print() {
    logger.error(chalk.red(this.formatOutput()))
  }
}

export class AuditWarning extends BaseAuditIssue {
  constructor(message: string, docPath: string) {
    super(message, 'warning', docPath)
  }
  public print() {
    logger.warn(chalk.yellowBright(this.formatOutput()))
  }
}
