/**
 * @type {() => import('astro').AstroIntegration}
 */
export default () => ({
  name: 'client:tina',
  hooks: {
    'astro:config:setup': ({ addClientDirective }) => {
      addClientDirective({
        name: 'tina',
        entrypoint: './astro-tina-directive/tina.js',
      });
    },
  },
});
