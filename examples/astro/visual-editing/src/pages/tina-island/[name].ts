/**
 * Single dynamic endpoint that handles every island refetch the bridge
 * sends. The URL path (`/tina-island/post`, `/tina-island/global`, etc.)
 * picks an entry out of the registry in `src/lib/islands.ts`; the route
 * itself is supplied by `@tinacms/astro/experimental` so adding a new
 * editable region only ever touches the registry.
 */
import type { APIRoute } from 'astro';
import { experimental_createIslandRoute } from '@tinacms/astro/experimental';
import { islands } from '../../lib/islands';

export const prerender = false;
export const ALL: APIRoute = experimental_createIslandRoute(islands);
