import { pipeline } from 'readable-stream'
import { createServer } from 'net'
import { ManyLevelHost } from 'many-level'
import { MemoryLevel } from 'memory-level'

export const createDBServer = () => {
  const levelHost = new ManyLevelHost(
    // @ts-ignore
    new MemoryLevel<string, Record<string, any>>({
      valueEncoding: 'json',
    })
  )
  const dbserver = createServer(function (socket) {
    // Pipe socket into host stream and vice versa
    return pipeline(socket, levelHost.createRpcStream(), socket, () => {
      // Disconnected
    })
  })
  dbserver.listen(9000)

  return dbserver
}
