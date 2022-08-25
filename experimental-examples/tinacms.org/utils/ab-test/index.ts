import { getBucket } from './getBucket'
import abTestDB from '../../content/ab-tests/index.json'
import { AbtestTests } from '.tina/__generated__/types'

export const getABTestResult = (
  matchingABTest: AbtestTests,
  bucketCookie?: string
) => {
  const bucket =
    bucketCookie ||
    getBucket([
      matchingABTest.testId,
      ...matchingABTest.variants.map((t) => t.testId),
    ])

  const matchingVariant = matchingABTest.variants.find(
    (t) => t.testId == bucket
  )
  if (matchingVariant) {
    return {
      url: matchingVariant.href,
      bucket,
    }
  } else {
    //invalid bucket, or we're matched with the default AB test
    return {
      url: matchingABTest.href,
      bucket: matchingABTest.testId,
    }
  }
}

export const getExperiment = (pathname: string) =>
  abTestDB.tests.find((test) => test.href == pathname)
