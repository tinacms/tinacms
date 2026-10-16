/**
 * Strip any directory component from an uploaded filename so
 * path.join(os.tmpdir(), name) can't escape the temp dir. Defense in depth:
 * multer's parser already basenames the name, but don't rely on it.
 * Duplicated byte-for-byte across the multer-based media adapters.
 */
export function safeUploadName(originalName: string): string {
  const base = originalName.split(/[/\\]/).pop() || '';
  return base === '.' || base === '..' ? '' : base;
}
