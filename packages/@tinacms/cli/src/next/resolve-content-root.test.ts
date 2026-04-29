jest.mock('fs-extra', () => ({
  pathExists: jest.fn(),
}));

jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// chalk v5 is ESM-only; jest's CJS runtime can't load it. We only use it for
// coloring log output, so identity functions are a faithful stand-in for tests.
jest.mock('chalk', () => {
  const identity = (s: string) => s;
  return {
    __esModule: true,
    default: { yellow: identity, cyan: identity, red: identity },
    yellow: identity,
    cyan: identity,
    red: identity,
  };
});

import * as fs from 'fs-extra';
import { resolveContentRootPath } from './resolve-content-root';
import { logger } from '../logger';

const mockFs = fs as jest.Mocked<typeof fs>;
const mockLogger = logger as jest.Mocked<typeof logger>;

const baseParams = {
  rootPath: '/fake/project',
  tinaFolderPath: '/fake/project/tina',
  tinaConfigFilePath: '/fake/project/tina/config.ts',
};

describe('resolveContentRootPath', () => {
  beforeEach(() => {
    mockFs.pathExists.mockReset();
    mockLogger.info.mockReset();
    mockLogger.warn.mockReset();
  });

  it('returns rootPath when localContentPath is not configured', async () => {
    const result = await resolveContentRootPath({
      ...baseParams,
      localContentPath: undefined,
    });

    expect(result).toBe('/fake/project');
    expect(mockFs.pathExists).not.toHaveBeenCalled();
    expect(mockLogger.info).not.toHaveBeenCalled();
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('returns the joined sibling path when the directory exists and logs at info level', async () => {
    mockFs.pathExists.mockResolvedValue(true as never);

    const result = await resolveContentRootPath({
      ...baseParams,
      localContentPath: '../content-repo',
    });

    expect(result).toBe('/fake/project/content-repo');
    expect(mockFs.pathExists).toHaveBeenCalledWith(
      '/fake/project/content-repo'
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Using separate content repo at')
    );
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('warns and falls back to rootPath when the configured directory does not exist', async () => {
    mockFs.pathExists.mockResolvedValue(false as never);

    const result = await resolveContentRootPath({
      ...baseParams,
      localContentPath: '../does-not-exist',
    });

    expect(result).toBe('/fake/project');
    expect(mockFs.pathExists).toHaveBeenCalledWith(
      '/fake/project/does-not-exist'
    );
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('does not exist')
    );
    // Warning must cite the tina config file path so the user knows where to fix it.
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('/fake/project/tina/config.ts')
    );
    expect(mockLogger.info).not.toHaveBeenCalled();
  });

  it('strips a trailing slash from the joined path before checking existence', async () => {
    mockFs.pathExists.mockResolvedValue(true as never);

    const result = await resolveContentRootPath({
      ...baseParams,
      localContentPath: '../content-repo/',
    });

    expect(result).toBe('/fake/project/content-repo');
    expect(mockFs.pathExists).toHaveBeenCalledWith(
      '/fake/project/content-repo'
    );
  });

  it('throws on an empty-string localContentPath', async () => {
    await expect(
      resolveContentRootPath({ ...baseParams, localContentPath: '' })
    ).rejects.toThrow();
  });

  it('throws on a non-string localContentPath', async () => {
    await expect(
      resolveContentRootPath({ ...baseParams, localContentPath: 42 })
    ).rejects.toThrow();
  });
});
