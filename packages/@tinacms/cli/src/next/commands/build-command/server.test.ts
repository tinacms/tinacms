import { build } from 'vite';
import { createConfig } from '../../vite';
import { buildProductionSpa } from './server';

jest.mock('vite', () => ({ build: jest.fn() }));
jest.mock('../../vite', () => ({ createConfig: jest.fn() }));
jest.mock('../../vite/plugins', () => ({
  transformTsxPlugin: jest.fn(),
  viteTransformExtension: jest.fn(),
}));

describe('buildProductionSpa', () => {
  it('caps parallel file operations below the 1024 open-file limit of Workers Builds', async () => {
    jest.mocked(createConfig).mockResolvedValue({});

    await buildProductionSpa({} as never, {} as never, 'https://api');

    const { rollupOptions } = jest.mocked(createConfig).mock.calls[0][0];
    expect(rollupOptions?.maxParallelFileOps).toBe(100);
    expect(build).toHaveBeenCalledTimes(1);
  });
});
