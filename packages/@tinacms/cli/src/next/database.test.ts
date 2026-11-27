import { once } from 'events';
import { type AddressInfo, Server, connect } from 'net';
import { createDBServer } from './database';

jest.mock('../logger', () => ({
  logger: { warn: jest.fn() },
}));

// config-manager uses import.meta.url, which jest's CommonJS runtime can't load.
jest.mock('./config-manager', () => ({}));

jest.mock('@tinacms/graphql', () => ({}), { virtual: true });

const close = (server: Server) =>
  new Promise((resolve) => server.close(resolve));

const portOf = (server: Server) => (server.address() as AddressInfo).port;

describe('createDBServer', () => {
  const servers: Server[] = [];

  afterEach(async () => {
    jest.restoreAllMocks();
    await Promise.all(servers.splice(0).map(close));
  });

  it('resolves once the server accepts connections', async () => {
    const server = await createDBServer(0);
    servers.push(server);

    expect(server.listening).toBe(true);

    const socket = connect(portOf(server), 'localhost');
    await once(socket, 'connect');
    socket.destroy();
  });

  it('rejects naming the port when it is already in use', async () => {
    const server = await createDBServer(0);
    servers.push(server);
    const port = portOf(server);

    await expect(createDBServer(port)).rejects.toThrow(
      `Datalayer server is busy on port ${port}`
    );
  });

  it('rejects with the cause of any other listen failure', async () => {
    jest.spyOn(Server.prototype, 'listen').mockImplementation(function (
      this: Server
    ) {
      process.nextTick(() =>
        this.emit(
          'error',
          Object.assign(new Error('listen EACCES: permission denied'), {
            code: 'EACCES',
          })
        )
      );
      return this;
    });

    await expect(createDBServer(80)).rejects.toThrow(
      'Unable to start the datalayer server on port 80: listen EACCES: permission denied'
    );
  });
});
