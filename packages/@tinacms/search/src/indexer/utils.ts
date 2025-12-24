import { Collection, ObjectField } from '@tinacms/schema-tools';
import * as sw from 'stopword';

const INDEXABLE_NODE_TYPES = ['text', 'code_block', 'html'] as const;

interface RichTextNode {
  type?: string;
  text?: string;
  value?: string;
  children?: RichTextNode[];
}

class StringBuilder {
  private readonly buffer: string[] = [];
  private readonly limit: number;
  public length = 0;

  constructor(limit: number) {
    this.limit = limit;
  }

  append(str: string): boolean {
    if (this.length + str.length > this.limit) return true;

    this.buffer.push(str);
    this.length += str.length;
    return this.length > this.limit;
  }

  toString(): string {
    return this.buffer.join(' ');
  }
}

const tokenizeString = (str: string): string[] => {
  return str
    .split(/[\s\.,]+/)
    .map((s) => s.toLowerCase())
    .filter((s) => s);
};

const extractText = (
  data: RichTextNode | null | undefined,
  builder: StringBuilder,
  nodeTypes: readonly string[]
): void => {
  if (!data) return;

  if (nodeTypes.includes(data.type ?? '') && (data.text || data.value)) {
    const tokens = tokenizeString(data.text || data.value || '');
    for (const token of tokens) {
      if (builder.append(token)) return;
    }
  }

  data.children?.forEach((child) => extractText(child, builder, nodeTypes));
};

const getRelativePath = (path: string, collection: Collection): string => {
  return path
    .replace(/\\/g, '/')
    .replace(collection.path, '')
    .replace(/^\/|\/$/g, '');
};

const processTextField = (value: string, maxLength: number): string => {
  const tokens = tokenizeString(value);
  const builder = new StringBuilder(maxLength);
  for (const part of tokens) {
    if (builder.append(part)) break;
  }
  return builder.toString();
};

const processRichTextField = (
  value: RichTextNode,
  maxLength: number
): string => {
  const builder = new StringBuilder(maxLength);
  extractText(value, builder, INDEXABLE_NODE_TYPES);
  return builder.toString();
};

const processObjectField = (
  data: Record<string, unknown>[],
  path: string,
  collection: Collection,
  textIndexLength: number,
  field: ObjectField
): Record<string, unknown> | Record<string, unknown>[] => {
  if (field.list) {
    return data.map((obj) =>
      processDocumentForIndexing(obj, path, collection, textIndexLength, field)
    );
  }
  return processDocumentForIndexing(
    data as unknown as Record<string, unknown>,
    path,
    collection,
    textIndexLength,
    field
  );
};

const processStringField = (
  data: string | string[],
  maxLength: number,
  isList: boolean
): string | string[] => {
  if (isList) {
    return (data as string[]).map((value) =>
      processTextField(value, maxLength)
    );
  }
  return processTextField(data as string, maxLength);
};

const processRichTextFieldData = (
  data: RichTextNode | RichTextNode[],
  maxLength: number,
  isList: boolean
): string | string[] => {
  if (isList) {
    return (data as RichTextNode[]).map((value) =>
      processRichTextField(value, maxLength)
    );
  }
  return processRichTextField(data as RichTextNode, maxLength);
};

export const processDocumentForIndexing = (
  data: Record<string, unknown>,
  path: string,
  collection: Collection,
  textIndexLength: number,
  field?: ObjectField
): Record<string, unknown> => {
  if (!field) {
    const relativePath = getRelativePath(path, collection);
    data['_id'] = `${collection.name}:${relativePath}`;
    data['_relativePath'] = relativePath;
  }

  const fields = field?.fields || collection.fields || [];

  for (const f of fields) {
    if (!f.searchable) {
      delete data[f.name];
      continue;
    }

    if (!data[f.name]) continue;

    const fieldMaxLength =
      (f as { maxSearchIndexFieldLength?: number }).maxSearchIndexFieldLength ||
      textIndexLength;
    const isList = Boolean(f.list);

    switch (f.type) {
      case 'object':
        data[f.name] = processObjectField(
          data[f.name] as Record<string, unknown>[],
          path,
          collection,
          textIndexLength,
          f
        );
        break;
      case 'string':
        data[f.name] = processStringField(
          data[f.name] as string | string[],
          fieldMaxLength,
          isList
        );
        break;
      case 'rich-text':
        data[f.name] = processRichTextFieldData(
          data[f.name] as RichTextNode | RichTextNode[],
          fieldMaxLength,
          isList
        );
        break;
    }
  }

  return data;
};

const stopwordCache: Record<string, string[]> = {};

export const lookupStopwords = (
  keys?: string[],
  defaultStopWords: string[] = sw.eng
): string[] => {
  if (!keys) {
    return defaultStopWords;
  }

  const cacheKey = keys.join(',');
  if (stopwordCache[cacheKey]) {
    return stopwordCache[cacheKey];
  }

  const stopwords = keys.flatMap((key) => sw[key] || []);
  stopwordCache[cacheKey] = stopwords;
  return stopwords;
};
