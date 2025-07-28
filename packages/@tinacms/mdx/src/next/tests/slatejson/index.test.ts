import { expect, it } from 'vitest';
import { parseMDX } from '../../../parse';
import type * as Plate from '../../../parse/plate';
import { serializeMDX } from '../../../stringify';
import { field } from './field';
import inputString from './node.json?raw';

it('matches input', () => {
  const input = JSON.parse(inputString);

  const tree: Plate.RootElement = parseMDX(input, field, (v) => v);
  expect(tree).toBeTruthy();

  // Ensure the parsed tree is the same as the input
  expect(tree).toEqual(input);

  const rootElement = serializeMDX(tree, field, (v) => v);

  // Ensure the 'stringified' output is the same as the input
  expect(rootElement).toEqual(input);
});
