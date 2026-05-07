import { MdImage } from 'react-icons/md';
import { createScreen } from '@toolkit/react-screens';
import { MediaUsageDashboard } from '@toolkit/components/dashboard/media-usage-dashboard';

export const MediaUsageDashboardScreenPlugin = createScreen({
  name: 'Media Usage',
  Component: MediaUsageDashboard,
  Icon: MdImage,
  layout: 'popup',
  navCategory: 'Dashboard',
});
