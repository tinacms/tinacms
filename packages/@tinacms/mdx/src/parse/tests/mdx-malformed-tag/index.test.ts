import { it, expect } from 'vitest';
import { parseMDX } from '../../index';
import { serializeMDX } from '../../../stringify';
import { field } from './field';
import input from './in.md?raw';
import * as util from '../../../next/tests/util';

it('matches input', () => {
  const tree = parseMDX(input, field, (v) => v);
  const string = serializeMDX(tree, field, (v) => v);
  expect(util.print(tree)).toMatchFile(util.nodePath(__dirname));
  expect(string).toMatchFile(util.mdPath(__dirname));
});
