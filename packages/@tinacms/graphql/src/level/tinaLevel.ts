import { ManyLevelGuest } from 'many-level';
import { pipeline } from 'readable-stream';
import { connect } from 'net';

const CONNECT_RETRIES = 50;
const CONNECT_RETRY_DELAY_MS = 100;

export class TinaLevelClient extends ManyLevelGuest<
  string,
  Record<string, any>
> {
  private port: number;
  private _connected = false;
  constructor(port?: number) {
    super();
    this.port = port || 9000;
  }
  public openConnection() {
    if (this._connected) return;
    // The datalayer server may not be listening yet when this runs — the CLI
    // calls `createServer().listen()` and connects this client without
    // waiting for `listen()` to complete. If the connection fails,
    // ManyLevelGuest silently queues every operation forever, which presents
    // as an indefinite "Indexing local files" hang. Retry the connection,
    // and if it truly can't be established, destroy the RPC stream so queued
    // operations reject (LEVEL_CONNECTION_LOST) instead of hanging.
    const rpcStream = this.createRpcStream();
    const tryConnect = (attempt: number) => {
      const socket = connect(this.port);
      const onConnectError = (err: Error) => {
        socket.destroy();
        if (attempt < CONNECT_RETRIES) {
          setTimeout(() => tryConnect(attempt + 1), CONNECT_RETRY_DELAY_MS);
        } else {
          console.error(
            `TinaLevelClient: could not connect to the datalayer server on port ${this.port} after ${
              attempt + 1
            } attempts (${err.message}).`
          );
          rpcStream.destroy(err);
          this._connected = false;
        }
      };
      socket.once('error', onConnectError);
      socket.once('connect', () => {
        socket.removeListener('error', onConnectError);
        pipeline(socket, rpcStream, socket, () => {
          // Disconnected
          this._connected = false;
        });
      });
    };
    tryConnect(0);
    this._connected = true;
  }
}
