// This module is vausing the error Type instantiation is excessively deep and possibly infinite.ts
declare module 'unist-util-visit' {
  function visit(node: any, check: string, callback: any);
}
