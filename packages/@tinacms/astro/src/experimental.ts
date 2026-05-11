/**
 * Experimental surface area. Anything here may change in a minor or
 * patch release — opt in only when the underlying tradeoff is worth
 * it for your project.
 *
 * `experimental_createIslandRoute` builds on Astro's
 * `experimental_AstroContainer`, which Astro itself flags as unstable;
 * this re-export inherits the same caveat.
 */
export {
  experimental_createIslandRoute,
  type IslandConfig,
  type IslandRegistry,
} from './island-route';
