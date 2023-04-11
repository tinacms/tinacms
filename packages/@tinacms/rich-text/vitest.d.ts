interface CustomMatchers<R = unknown> {
  toBeFoo(): R
}

declare namespace Vi {
  interface Assertion extends CustomMatchers {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}

  // Note: augmenting jest.Matchers interface will also work.
}
