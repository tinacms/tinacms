/**
 * The name for try `index` of a picked file: the name itself for 0, else the
 * number before the last dot. `archive.tar.gz` gives `archive.tar-1.gz`, a
 * name with no extension gives `name-1`, and `.env` gives `.env-1`.
 */
export const numberedName = (name: string, index: number): string => {
  if (index === 0) return name;
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return `${name}-${index}`;
  return `${name.slice(0, dot)}-${index}${name.slice(dot)}`;
};
