export const encodePath = (path: string): string =>
  path.split('/').map(encodeURIComponent).join('/');
