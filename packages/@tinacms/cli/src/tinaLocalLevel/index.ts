import { ManyLevelGuest } from 'many-level'
import { pipeline } from 'readable-stream'
import { connect } from 'net'

export class TinaLevelClient extends ManyLevelGuest {
  constructor() {
    super()
    const socket = connect(9000)
    pipeline(socket, this.createRpcStream(), socket, () => {
      // Disconnected
    })
  }
}
