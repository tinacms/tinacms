/**
 * Hydrate only when inside TinaCMS visual editor iframe
 * @type {import('astro').ClientDirective}
 */
export default async (load, options, el) => {
  try {
    const isInIframe = window.self !== window.top;
    if (!isInIframe) {
      return;
    }

    const hydrate = await load();
    await hydrate();
  } catch (error) {
    console.error('An error occurred in the Tina client directive:', error);
  }
};
