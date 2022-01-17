import { BinaryLike, createHash, randomBytes } from 'crypto'
import { getID } from './getId'
import fetch from 'node-fetch'
import {
  getTinaVersion,
  getTinaCliVersion,
  getYarnVersion,
  getNpmVersion,
} from './getVersion'

const TINA_METRICS_ENDPOINT = 'https://something.tinajs.dev/asdf/asdf'

export class Telemetry {
  //   private config: Conf<Record<string, unknown>>
  private projectIDRaw: string

  constructor() {
    // this.config = new Conf({ projectName: 'tinacms', cwd: dir })
    this.projectIDRaw = getID()
  }
  oneWayHash = (payload: BinaryLike): string => {
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

  submitRecord = async ({ event }: { event: string }) => {
    try {
      const body = {
        event,
        id: this.projectId,
        nodeVersion: process.version,
        tinaCliVersion: getTinaCliVersion(),
        tinaVersion: getTinaVersion(),
        yarnVersion: getYarnVersion(),
        npmVersion: getNpmVersion(),
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
