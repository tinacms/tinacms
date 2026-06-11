import fs from 'fs';
import path from 'path';

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

// Returns the subset of relPaths that already exist under baseDir, so the demo
// scaffolder can bail before overwriting any user file.
export const findExistingPaths = (
  baseDir: string,
  relPaths: string[]
): string[] => relPaths.filter((rel) => fs.existsSync(path.join(baseDir, rel)));

// Parses the major from a package.json version range (e.g. "^6.4.5" -> 6).
export const parseAstroMajor = (version?: string): number | undefined => {
  const match = version ? String(version).match(/(\d+)/) : null;
  return match ? Number(match[1]) : undefined;
};

// The @astrojs/node adapter major tracks Astro's: node 9 peers Astro 5, node 10
// peers Astro 6. Installing the unversioned adapter resolves to the latest
// (Astro 6 only), which breaks an existing Astro 5 project — so pin by major.
// Unknown/future majors fall back to the unversioned dep (latest).
export const astroNodeAdapterDep = (astroMajor?: number): string => {
  const byMajor: Record<number, string> = { 5: '^9', 6: '^10' };
  const range = astroMajor ? byMajor[astroMajor] : undefined;
  return range ? `@astrojs/node@${range}` : '@astrojs/node';
};
