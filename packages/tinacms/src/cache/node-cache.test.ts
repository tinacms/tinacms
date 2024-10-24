import { it, expect, describe, vi } from 'vitest'
import { makeCacheDir } from './node-cache.ts'

describe('makeCacheDir', () => {
  it('should return the original directory if the root directory exists', async () => {
    const mockFs = {
      existsSync: vi.fn().mockReturnValue(true),
      mkdirSync: vi.fn(),
    }

    const dir = '/root/cache'
    const result = await makeCacheDir(dir, mockFs)

    expect(result).toBe(dir)
    expect(mockFs.existsSync).toHaveBeenCalledWith('/root')
    expect(mockFs.mkdirSync).toHaveBeenCalledWith(dir, { recursive: true })
  })

  it('should create the cache in the tmp directory if the root directory does not exist', async () => {
    const mockFs = {
      existsSync: vi.fn().mockReturnValue(false),
      mkdirSync: vi.fn(),
    }

    const mockOs = {
      tmpdir: vi.fn().mockReturnValue('/tmp'),
    }

    const mockPath = {
      sep: '/',
      join: vi.fn((...args) => args.join('/')),
    }

    vi.doMock('node:path', () => mockPath)
    vi.doMock('node:os', () => mockOs)

    const dir = '/nonexistent/cache'
    const result = await makeCacheDir(dir, mockFs)

    expect(result).toBe('/tmp/cache')
    expect(mockFs.existsSync).toHaveBeenCalledWith('/nonexistent')
    expect(mockFs.mkdirSync).toHaveBeenCalledWith('/tmp/cache', {
      recursive: true,
    })
  })

  it('should throw an error if mkdirSync fails', async () => {
    const mockFs = {
      existsSync: vi.fn().mockReturnValue(true),
      mkdirSync: vi.fn(() => {
        throw new Error('mkdir failed')
      }),
    }

    const dir = '/root/cache'

    await expect(makeCacheDir(dir, mockFs)).rejects.toThrow(
      'Failed to create cache directory: mkdir failed'
    )
  })
})
