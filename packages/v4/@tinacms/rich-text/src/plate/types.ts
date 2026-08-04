export interface TemplateField {
  name: string;
  label?: string;
  type?: string;
  isTitle?: boolean;
}

export type MdxTemplate = {
  label: string;
  key: string;
  inline?: boolean;
  name: string;
  defaultItem?: {};
  fields: TemplateField[];
};
