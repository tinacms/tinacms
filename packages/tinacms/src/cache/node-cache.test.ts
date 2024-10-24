import { it, expect, describe, vi } from 'vitest'
import { makeCacheDir } from './node-cache.ts'

describe('makeCacheDir', () => {
  it('should return the original directory if the root directory exists', async () => {
    const path = require('node:path')

    const mockFs = {
      existsSync: vi.fn().mockReturnValue(true),
      mkdirSync: vi.fn(),
    }

    const dir = '/root/.cache/1234'
    const result = await makeCacheDir(dir, mockFs, path, {})

    expect(result).toBe(dir)
    expect(mockFs.existsSync).toHaveBeenCalledWith('/root')
    expect(mockFs.mkdirSync).toHaveBeenCalledWith(dir, { recursive: true })
  })

  it('should create the cache in the tmp directory if the root directory does not exist', async () => {
    const path = require('node:path')

    const mockFs = {
      existsSync: vi.fn().mockReturnValue(false),
      mkdirSync: vi.fn(),
    }

    const mockOs = {
      tmpdir: vi.fn().mockReturnValue('/var'),
    }

    const dir = '/nonexistent/.cache/1234'
    const result = await makeCacheDir(dir, mockFs, path, mockOs)

    expect(result).toBe('/var/1234')
    expect(mockFs.existsSync).toHaveBeenCalledWith('/nonexistent')
    expect(mockFs.mkdirSync).toHaveBeenCalledWith('/var/1234', {
      recursive: true,
    })
  })

  it('should throw an error if mkdirSync fails', async () => {
    const path = require('node:path')

    const mockFs = {
      existsSync: vi.fn().mockReturnValue(true),
      mkdirSync: vi.fn(() => {
        throw new Error('mkdir failed')
      }),
    }

    const dir = '/root/.cache/1234'

    await expect(makeCacheDir(dir, mockFs, path, {})).rejects.toThrow(
      'Failed to create cache directory: mkdir failed'
    )
  })
})
