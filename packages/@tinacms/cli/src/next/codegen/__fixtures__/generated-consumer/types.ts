export const queries = (_client: { request: (q: string) => unknown }) => ({
  hello: (): string => 'hello',
});
