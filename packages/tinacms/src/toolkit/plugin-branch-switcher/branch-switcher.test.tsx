import { formatBranchName, getFilteredBranchList } from './branch-switcher'
import { Branch } from './types'
import { describe, it, expect } from 'vitest'

const branches: Branch[] = [
  { name: 'master', indexStatus: { status: 'complete' } },
  { name: 'develop', indexStatus: { status: 'complete' } },
  { name: 'feature/branch-1', indexStatus: { status: 'failed' } },
  { name: 'feature/branch-2', indexStatus: { status: 'complete' } },
  { name: 'feature/branch-3', indexStatus: { status: 'complete' } },
]

// test getFilteredBranchList to make sure it returns the correct list of branches
describe('getFilteredBranchList', () => {
  describe('with no filter', () => {
    it('should return the correct list of branches', () => {
      const filteredBranches = getFilteredBranchList(branches, '', 'master')
      expect(filteredBranches.map((b) => b.name)).toEqual([
        'master',
        'develop',
        'feature/branch-1',
        'feature/branch-2',
        'feature/branch-3',
      ])
    })
  })
  describe('with unknown branch', () => {
    it('returns branch as unknown status', () => {
      // test unknown branch
      const filteredBranches = getFilteredBranchList(branches, '', 'foo')

      console.log('filteredBranches:', filteredBranches)

      expect(filteredBranches).toEqual([
        { name: 'foo', indexStatus: { status: 'failed' } },
        { name: 'master', indexStatus: { status: 'complete' } },
        { name: 'develop', indexStatus: { status: 'complete' } },
        { name: 'feature/branch-1', indexStatus: { status: 'failed' } },
        { name: 'feature/branch-2', indexStatus: { status: 'complete' } },
        { name: 'feature/branch-3', indexStatus: { status: 'complete' } },
      ])
    })
  })
  describe('with filter', () => {
    // test filter filters list
    it('should return the correct list of branches', () => {
      const filteredBranches = getFilteredBranchList(
        branches,
        'feature',
        'feature/branch-1'
      )
      expect(filteredBranches.map((b) => b.name)).toEqual([
        'feature/branch-1',
        'feature/branch-2',
        'feature/branch-3',
      ])
    })

    it('should add current branch to the top', () => {
      const filteredBranches = getFilteredBranchList(
        branches,
        'feature',
        'master'
      )
      expect(filteredBranches.map((b) => b.name)).toEqual([
        'master',
        'feature/branch-1',
        'feature/branch-2',
        'feature/branch-3',
      ])
    })
  })
})

describe('formatBranchName', () => {
  it('replaces invalid special characters with -', () => {
    const result = formatBranchName('foo bar@@--')
    expect(result).toEqual('foo-bar---')
  })

  it('preserves valid special character(s)', () => {
    const result = formatBranchName('my/company-branch')
    expect(result).toEqual('my/company-branch')
  })

  it('returns as lowerCase', () => {
    const result = formatBranchName('mYbRaNcH')
    expect(result).toEqual('mybranch')
  })
})
