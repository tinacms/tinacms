import type { ResolvedConfig } from '../../config';
import { invariant } from '../invariant';
import { declaresCapabilityOverride } from '../mount';
import type { MediaUrlOptions } from './contract';

const MEDIA_CAPABILITY = 'media';

/**
 * Turns a stored media path into the URL a page loads, with the installed
 * media plugin. Runs anywhere: static rendering, preview, the server.
 *
 *   <img src={resolveMediaUrl(config, post.heroImage, { width: 1200 })} />
 */
export const resolveMediaUrl = (
  config: ResolvedConfig,
  path: string,
  options?: MediaUrlOptions
): string => {
  const providers = config.plugins.filter((plugin) =>
    plugin.provides.includes(MEDIA_CAPABILITY)
  );
  const provider =
    providers.find((plugin) =>
      declaresCapabilityOverride(plugin, MEDIA_CAPABILITY)
    ) ?? providers[0];
  invariant(
    provider,
    'media-capability-missing',
    'No installed plugin provides the "media" capability, so a media path ' +
      'cannot become a URL. Add a media plugin to `plugins`, e.g. localMediaPlugin().'
  );
  invariant(
    provider.media,
    'media-plugin-no-resolve-url',
    `Plugin "${provider.name}" provides "media" but sets no \`media.resolveUrl\` ` +
      'on its manifest, so the site cannot turn a media path into a URL.'
  );
  return provider.media.resolveUrl(path, options);
};
