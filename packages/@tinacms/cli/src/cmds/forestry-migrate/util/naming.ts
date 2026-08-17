// Pure naming helpers shared by the Forestry migration code generator.
//
// These live in a dependency-free leaf module so that `codeTransformer.ts`
// (and `util/index.ts`) can use them without importing the package's heavy
// `forestry-migrate/index.ts` graph (`@tinacms/graphql`, `chalk`, etc.), which
// previously created a circular import.

export const stringifyLabel = (label: string) => {
  return label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
};

export const stringifyLabelWithField = (label: string) => {
  const labelString = stringifyLabel(label);
  return `${labelString}Fields`;
};

// Forestry field/template names and labels are single-line plain text.
// Control characters (NUL, carriage return, newline) never appear in
// legitimate Forestry config, so callers reject them at parse time as a
// defence-in-depth guard on the generated source.
export const isForestrySafeString = (value: string) =>
  !/[\x00\r\n]/.test(value);
