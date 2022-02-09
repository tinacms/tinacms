// https://stackoverflow.com/questions/57132428/augmentations-for-the-global-scope-can-only-be-directly-nested-in-external-modul
export {}

declare global {
  namespace jest {
    interface Matchers<R, T> {
      /**
       * Normalizes whitespace and performs string comparisons
       */
      toBeSimilarGqlDoc(expected: string): R
    }
  }
}
