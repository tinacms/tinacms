// The editor carries a template's fields through to the host's nested-form panel
// without reading them, so it names only what it needs. The host's richer
// FieldSchema satisfies this structurally — which is why this package does not
// import it.
export interface TemplateField {
  name: string;
  label?: string;
  type?: string;
}

export type MdxTemplate = {
  label: string;
  key: string;
  inline?: boolean;
  name: string;
  defaultItem?: {};
  fields: TemplateField[];
};
