import { ManyLevelGuest } from 'many-level'
import { pipeline } from 'readable-stream'
import { connect } from 'net'

export class TinaLevelClient extends ManyLevelGuest<
  string,
  Record<string, any>
> {
  private port: number
  private _connected = false
  constructor(port?: number) {
    super()
    this.port = port || 9000
  }
  public openConnection() {
    if (this._connected) return
    const socket = connect(this.port)
    pipeline(socket, this.createRpcStream(), socket, () => {
      // Disconnected
      this._connected = false
    })
    this._connected = true
  }
}
