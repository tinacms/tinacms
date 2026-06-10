// True only when the file is the untouched scaffold default (the astro/config
// import plus an empty `defineConfig({})` and nothing else). Anchored on the
// comment-stripped source so a real config — even one that mentions
// `defineConfig({})` in a comment — is never matched and never clobbered.
export const isDefaultAstroConfig = (source: string): boolean => {
  const stripped = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  return /^import\s*\{\s*defineConfig\s*\}\s*from\s*['"]astro\/config['"]\s*;?\s*export\s+default\s+defineConfig\(\s*\{\s*\}\s*\)\s*;?$/.test(
    stripped
  );
};
