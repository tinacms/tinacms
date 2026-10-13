/**

*/

import { isValidRelativePath } from './relativePath';

describe('isValidRelativePath', () => {
  it('accepts allowed characters', () => {
    expect(isValidRelativePath('my-document')).toEqual(true);
    expect(isValidRelativePath('My_Document.en')).toEqual(true);
    expect(isValidRelativePath('sub-folder/My_Document')).toEqual(true);
    expect(isValidRelativePath('a-b-c-d')).toEqual(true);
    expect(isValidRelativePath('parent/child')).toEqual(true);
  });

  it('rejects spaces', () => {
    expect(isValidRelativePath('a b c d')).toEqual(false);
    expect(isValidRelativePath('hello world')).toEqual(false);
  });

  it('rejects other disallowed characters', () => {
    expect(isValidRelativePath('name!')).toEqual(false);
    expect(isValidRelativePath('name@example')).toEqual(false);
    expect(isValidRelativePath('name#1')).toEqual(false);
    expect(isValidRelativePath('')).toEqual(false);
  });
});
