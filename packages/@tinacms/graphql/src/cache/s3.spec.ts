/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { s3CacheWith, clearCacheWith } from './s3'
import { S3 } from 'aws-sdk'

const awsPromise = (value: any) => ({
  promise: jest.fn().mockReturnValue(Promise.resolve(value)),
})

jest.mock('aws-sdk', () => ({
  S3: jest.fn().mockImplementation(() => ({
    getObject: jest.fn(),
    upload: jest.fn(),
    deleteObject: jest.fn(),
    deleteObjects: jest.fn(),
    listObjectsV2: jest.fn(),
  })),
}))

const setter = (value: any) =>
  jest.fn().mockImplementation(() => {
    return new Promise((resolve, _) => {
      resolve(value)
    })
  })

const mockS3 = new S3()
const s3Cache = s3CacheWith(mockS3)
const clearCache = clearCacheWith(mockS3)

describe('S3 cache', () => {
  describe('on get', () => {
    test('tries to fetch on key', async () => {
      // @ts-ignore
      mockS3.getObject.mockImplementationOnce(() => awsPromise({ Body: '' }))
      await s3Cache.get('key', setter(''))
      expect(mockS3.getObject).toBeCalled()
      expect(mockS3.upload).not.toBeCalled()
    })
    test('returns value found for key', async () => {
      const mockValue = { Body: 'value' }
      // @ts-ignore
      mockS3.getObject.mockImplementationOnce(() => awsPromise(mockValue))
      const resp = await s3Cache.get('key', setter(''))
      expect(mockS3.getObject).toBeCalled()
      expect(resp).toBe(mockValue.Body)
    })
    test('uses setter if no value found', async () => {
      // @ts-ignore
      mockS3.getObject.mockImplementationOnce(() => {
        throw { code: 'NoSuchKey', name: '', message: '' } as Error
      })
      // @ts-ignore
      mockS3.upload.mockImplementationOnce(() => awsPromise(null))
      const valueToSet = 'value'
      const setValue = setter(valueToSet)
      const resp = await s3Cache.get('key', setValue)
      expect(mockS3.getObject).toBeCalled()
      expect(mockS3.upload).toBeCalled()
      expect(setValue).toBeCalled()
      expect(resp).toBe(valueToSet)
    })
  })
  describe('on clear', () => {
    test("clears all values if path isn't present", async () => {
      // @ts-ignore
      mockS3.listObjectsV2.mockImplementationOnce(() =>
        awsPromise({
          Contents: [
            {
              Key: '1',
            },
            {
              Key: '2',
            },
          ],
        })
      )
      // @ts-ignore
      mockS3.deleteObjects.mockImplementationOnce(() => awsPromise(null))
      await clearCache({
        owner: 'bob',
        repo: 'website',
        ref: 'dev',
      })
      expect(mockS3.listObjectsV2).toBeCalled()
      expect(mockS3.deleteObjects).toBeCalled()
    })
    test('clears value at path if path is present', async () => {
      // @ts-ignore
      mockS3.deleteObject.mockImplementationOnce(() => awsPromise(null))
      await clearCache({
        owner: 'bob',
        repo: 'website',
        ref: 'dev',
        path: 'pension',
      })
      expect(mockS3.deleteObject).toBeCalled()
    })
  })
})
