import type { TinaCMS } from '@toolkit/tina-cms';
import type { ScreenPlugin } from '@toolkit/react-screens';
import type { CloudConfigPlugin } from '@toolkit/react-cloud-config';

/**
 * Hook to fetch and filter navigation data
 * Shared between admin nav and editing sidebar nav
 */
export const useNavData = (cms: TinaCMS) => {
  const collectionsInfo = { collections: cms.api.admin.fetchCollections() };
  const screens = cms.plugins.getType<ScreenPlugin>('screen').all();
  const cloudConfigs = cms.plugins
    .getType<CloudConfigPlugin>('cloud-config')
    .all();
  const isLocalMode = cms.api?.tina?.isLocalMode;

  // Filter out Account screens unless using UsernamePassword auth
  const activeScreens = screens.filter(
    (screen) =>
      screen.navCategory !== 'Account' ||
      cms.api.tina.authProvider?.getLoginStrategy() === 'UsernamePassword'
  );

  return {
    collectionsInfo,
    screens: activeScreens,
    cloudConfigs,
    isLocalMode,
  };
};
