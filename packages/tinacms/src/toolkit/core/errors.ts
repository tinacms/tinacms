// name-based so the check survives duplicate module copies in a bundle
export const isErrorNamed = (error: unknown, name: string): boolean =>
  error instanceof Error && error.name === name;
