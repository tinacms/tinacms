/**
 * One record per corpus case, in corpus order. Blank lines separate records;
 * neither a `JSON.stringify` input nor a printed object literal contains one.
 */
export type SnapshotRecord = {
  index: number;
  name: string;
  input: string;
  expected: string;
};

const HEADER = '#### ';
const SEPARATOR = '----';

export const formatSnapshot = (records: SnapshotRecord[]) =>
  records
    .map(
      ({ index, name, input, expected }) =>
        `${HEADER}${index} ${name.trimEnd()}\n${input}\n${SEPARATOR}\n${expected}\n`
    )
    .join('\n');

export const parseSnapshot = (text: string): SnapshotRecord[] =>
  text.split('\n\n').map((chunk) => {
    const [header = '', input = '', separator, ...expected] = chunk
      .replace(/\n$/, '')
      .split('\n');
    const match = /^(\d+) (.*)$/s.exec(header.slice(HEADER.length));
    if (!header.startsWith(HEADER) || !match || separator !== SEPARATOR) {
      throw new Error(`Malformed snapshot record: ${header}`);
    }
    return {
      index: Number(match[1]),
      name: match[2] as string,
      input,
      expected: expected.join('\n'),
    };
  });
