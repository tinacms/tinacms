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
