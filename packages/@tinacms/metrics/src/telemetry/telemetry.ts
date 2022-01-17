import { BinaryLike, createHash } from 'crypto'
import { getID } from './getId'
import fetch from 'node-fetch'
import {
  getTinaVersion,
  getTinaCliVersion,
  getYarnVersion,
  getNpmVersion,
} from './getVersion'
import { Events, MetricPayload } from '../interfaces'

const TINA_METRICS_ENDPOINT = 'https://something.tinajs.dev/asdf/asdf'

export class Telemetry {
  //   private config: Conf<Record<string, unknown>>
  private projectIDRaw: string
  private _disabled: boolean

  constructor({ disabled }: { disabled: any }) {
    // this.config = new Conf({ projectName: 'tinacms', cwd: dir })
    this.projectIDRaw = getID()
    this._disabled = Boolean(disabled)
  }
  private oneWayHash = (payload: BinaryLike): string => {
    const hash = createHash('sha256')

    // Always prepend the payload value with salt. This ensures the hash is truly
    // one-way.
    // hash.update(this.salt)

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
      const body: MetricPayload = {
        event,
        id: this.projectId,
        nodeVersion: process.version,
        tinaCliVersion: getTinaCliVersion(),
        tinaVersion: getTinaVersion(),
        yarnVersion: getYarnVersion(),
        npmVersion: getNpmVersion(),
        CI: Boolean(process.env.CI),
      }
      console.log({ body })
      // const res = await fetch(TINA_METRICS_ENDPOINT, {
      //   method: 'POST',
      //   body: JSON.stringify(body),
      //   headers: { 'content-type': 'application/json' },
      // })
    } catch (_e) {
      // If there is errors here it should not effect the user
    }
  }
}
