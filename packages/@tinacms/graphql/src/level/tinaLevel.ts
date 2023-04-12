/**

*/

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
export interface Bridge {
  rootPath: string
  glob(pattern: string, extension: string): Promise<string[]>
  get(filepath: string): Promise<string>
  put(filepath: string, data: string): Promise<void>
  delete(filepath: string): Promise<void>
  /**
   * Whether this bridge supports the ability to build the schema.
   */
  supportsBuilding(): boolean
  putConfig(filepath: string, data: string): Promise<void>
  /**
   * Optionally, the bridge can perform
   * operations in a separate path.
   */
  outputPath?: string
  addOutputPath?(outputPath: string): void
}
