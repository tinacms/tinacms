import { describe, expect, it } from 'vitest';
import { assert } from './assert';

describe('assert', () => {
  it('passes through truthy values', () => {
    expect(() => assert(1, 'expected a number')).not.toThrow();
  });

  it('throws the given message for falsy values', () => {
    expect(() =>
      assert(undefined, 'expected `startPoint` to be defined')
    ).toThrow('expected `startPoint` to be defined');
    expect(() => assert(0)).toThrow('Assertion failed');
  });
});
