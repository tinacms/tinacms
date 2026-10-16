// Do not replace these shapes with an import: the duplication is what keeps
// the editor independent of the storage format.
export type CodeLineElement = {
  type: 'code_line';
  children: { text: string }[];
};

export type CodeBlockElement = {
  type: 'code_block';
  lang?: string;
  meta?: string;
  // The editor writes `value`, and reads the code text back from `children`.
  value?: string;
  children: CodeLineElement[];
};

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
