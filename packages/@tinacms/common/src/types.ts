export const CONTENT_FORMATS = [
  'mdx',
  'md',
  'markdown',
  'json',
  'yaml',
  'yml',
  'toml',
] as const;
export type ContentFormat = (typeof CONTENT_FORMATS)[number];

export type ContentFrontmatterFormat = 'yaml' | 'toml' | 'json';
