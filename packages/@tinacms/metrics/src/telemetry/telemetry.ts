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

import { BinaryLike, createHash } from 'crypto'
import { getID } from './getId'
import fetch from 'isomorphic-fetch'
import {
  getTinaVersion,
  getTinaCliVersion,
  getYarnVersion,
  getNpmVersion,
} from './getVersion'
import { Events, MetricPayload } from '../interfaces'

const TINA_METRICS_ENDPOINT = 'https://metrics.tina.io/record'
// Use this for testing!
const TINA_METRICS_ENDPOINT_DEV = 'https://metrics-stage.tinajs.dev/record'

export class Telemetry {
  //   private config: Conf<Record<string, unknown>>
  private projectIDRaw: string
  private _disabled: boolean

  constructor({ disabled }: { disabled: any }) {
    // this.config = new Conf({ projectName: 'tinacms', cwd: dir })
    this.projectIDRaw = getID()
    const { NO_TELEMETRY } = process.env
    this._disabled =
      NO_TELEMETRY === '1' || NO_TELEMETRY === 'true' || Boolean(disabled)
  }
  private oneWayHash = (payload: BinaryLike): string => {
    const hash = createHash('sha256')

    // Update is an append operation, not a replacement. The salt from the prior
    // update is still present!
    hash.update(payload)
    return hash.digest('hex')
  }
  private get projectId(): string {
    return this.oneWayHash(this.projectIDRaw)
  }
  private get isDisabled(): boolean {
    return this._disabled
  }

  submitRecord = async ({ event }: { event: Events }) => {
    if (this.isDisabled) {
      return
    }
    try {
      const id = this.projectId
      const body: MetricPayload = {
        partitionKey: id,
        data: {
          anonymousId: id,
          event: event.name,
          properties: {
            ...event,
            nodeVersion: process.version,
            tinaCliVersion: getTinaCliVersion(),
            tinaVersion: getTinaVersion(),
            yarnVersion: getYarnVersion(),
            npmVersion: getNpmVersion(),
            CI: Boolean(process.env.CI),
          },
        },
      }
      await fetch(TINA_METRICS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' },
      })
    } catch (_e) {
      // If there is errors here it should not effect the user
    }
  }
}
