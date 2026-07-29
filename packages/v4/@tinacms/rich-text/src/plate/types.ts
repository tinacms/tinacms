// The editor carries a template's fields through to the host's nested-form panel
// without reading them, so it names only what it needs. The host's richer
// FieldSchema satisfies this structurally — which is why this package does not
// import it.
export interface TemplateField {
  name: string;
  label?: string;
  type?: string;
  // The field whose value labels the embed in the editor, as `Template: value`. Refer
  // to getLabel in create-mdx-plugins/component.tsx, which reads this. Templates are
  // author-written config, so the key reaches here even though v4's own FieldSchema
  // does not model it yet.
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
