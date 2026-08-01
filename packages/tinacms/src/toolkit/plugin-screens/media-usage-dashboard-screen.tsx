import { MediaUsageDashboard } from '@toolkit/components/dashboard/media-usage-dashboard';
import { createScreen } from '@toolkit/react-screens';
import { Image } from 'lucide-react';

export const MediaUsageDashboardScreenPlugin = createScreen({
  name: 'Media Usage',
  Component: MediaUsageDashboard,
  Icon: Image,
  layout: 'popup',
  navCategory: 'Dashboard',
});
