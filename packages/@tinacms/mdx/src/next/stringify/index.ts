import { RichTextField } from '@tinacms/schema-tools';
import type * as Plate from '../../parse/plate';
import { preProcess } from './pre-processing';
import { toTinaMarkdown } from './to-markdown';

export const stringifyMDX = (
  value: Plate.RootElement,
  field: RichTextField,
  imageCallback: (url: string) => string
) => {
  if (!value) {
    return;
  }
  const mdTree = preProcess(value, field, imageCallback);
  return toTinaMarkdown(mdTree, field);
};
