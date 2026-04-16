const TINA_EXTERNAL_PKGS_ENV = 'TINA_EXTERNAL_PKGS';

export const getExternalPackagesFromEnv = (
  envValue = process.env[TINA_EXTERNAL_PKGS_ENV]
) => {
  if (!envValue) {
    return [];
  }
  return envValue
    .split(',')
    .map((pkg) => pkg.trim())
    .filter(Boolean);
};
