/**
 * Filters env vars to only those safe for client-side bundles.
 *
 * Allows: TINA_PUBLIC_*, NEXT_PUBLIC_*, NODE_ENV, HEAD.
 * Everything else is excluded to prevent leaking secrets.
 *
 * @see https://github.com/tinacms/tinacms/security/advisories/GHSA-pc2q-jcxq-rjrr
 */
export function filterPublicEnv(
  env: Record<string, string | undefined> = process.env
): Record<string, string> {
  const publicEnv: Record<string, string> = {};

  Object.keys(env).forEach((key) => {
    if (
      key.startsWith('TINA_PUBLIC_') ||
      key.startsWith('NEXT_PUBLIC_') ||
      key === 'NODE_ENV' ||
      key === 'HEAD'
    ) {
      try {
        const value = env[key];
        if (typeof value === 'string') {
          publicEnv[key] = value;
        } else {
          publicEnv[key] = JSON.stringify(value);
        }
      } catch (error) {
        console.warn(
          `Could not stringify public env process.env.${key} env variable`
        );
        console.warn(error);
      }
    }
  });

  return publicEnv;
}
