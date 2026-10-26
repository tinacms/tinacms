// A second copy of the package has its own error classes, so `instanceof` fails
// across copies. A known error carries a registry-wide symbol that every copy reads.
export const hasErrorBrand = (
  value: unknown,
  brand: symbol
): value is Error => {
  if (value instanceof Error) {
    return brand in value;
  }
  return false;
};
