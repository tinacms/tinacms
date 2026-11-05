import { sequence } from '@sveltejs/kit/hooks';
import { tinaHandle } from '@tinacms/sveltekit/hooks';

export const handle = sequence(tinaHandle);
