import { expect, it } from 'vitest';
import { stringifyMDX } from '../../stringify';
import * as util from '../util';
import { field } from './field';
import node from './node.json';

it('matches input', () => {
  const stringifyImageCallback = (v: string) =>
    v.replace('http://some-url', '');
  // @ts-ignore
  const string = stringifyMDX(node, field, stringifyImageCallback);
  expect(string).toMatchFile(util.mdPath(__dirname));
});
