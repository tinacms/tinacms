import 'astro';
declare module 'astro' {
  interface AstroClientDirectives {
    'client:tina'?: boolean;
  }
}
