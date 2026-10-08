import { type IndexStatusResponse, indexFailedMessage } from './index-status';

const retry =
  `Attempting to index but responded with status 'failed'. To retry the indexing process, ` +
  `click the "Reindex" button for 'main' in the TinaCloud configuration for this project.`;

const failed = (
  response: Pick<IndexStatusResponse, 'error' | 'message' | 'cause'>
) => indexFailedMessage({ status: 'failed', branch: 'main', ...response });

describe('indexFailedMessage', () => {
  it('prints the error when it is the only reason given', () => {
    expect(failed({ error: 'Unable to seed content/posts/hello.md' })).toBe(
      `${retry}\n\nUnable to seed content/posts/hello.md`
    );
  });

  it('appends a cause the error does not contain', () => {
    expect(
      failed({
        error: 'Unable to seed content/pages/home.mdx',
        cause: 'Block template "PriceGrid" is not defined for field "sections"',
      })
    ).toBe(
      `${retry}\n\nUnable to seed content/pages/home.mdx\nCaused by: Block template "PriceGrid" is not defined for field "sections"`
    );
  });

  it('does not repeat a cause the server already folded into the error', () => {
    expect(
      failed({
        error:
          'Unable to seed content/posts/a.mdx (caused by: val.replace is not a function)',
        cause: 'val.replace is not a function',
      })
    ).toBe(
      `${retry}\n\nUnable to seed content/posts/a.mdx (caused by: val.replace is not a function)`
    );
  });

  it('falls back to the message when there is no error', () => {
    expect(
      failed({
        message:
          'indexing branch failed — Caused by: No Tina config found on the default branch',
        cause: 'No Tina config found on the default branch',
      })
    ).toBe(
      `${retry}\n\nindexing branch failed — Caused by: No Tina config found on the default branch`
    );
  });

  it('keeps every line of a multi-line cause', () => {
    const cause = [
      'bad indentation of a mapping entry (3:7)',
      '',
      ' 1 | ---',
      ' 2 | title: Hello',
      ' 3 |   date: 2026-10-08',
      '-----------^',
      ' 4 | ---',
    ].join('\n');

    expect(
      failed({ error: 'Unable to seed content/posts/hello.md', cause })
    ).toBe(
      `${retry}\n\nUnable to seed content/posts/hello.md\nCaused by: ${cause}`
    );
  });

  it('prints no reason, and never "undefined", when the response carries none', () => {
    const printed = failed({});

    expect(printed).toBe(retry);
    expect(printed).not.toContain('undefined');
  });
});
