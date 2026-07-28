import type { FieldSchema } from '../../../../core/schema/types';

export type MdxTemplate = {
  label: string;
  key: string;
  inline?: boolean;
  name: string;
  defaultItem?: {};
  fields: FieldSchema[];
};
