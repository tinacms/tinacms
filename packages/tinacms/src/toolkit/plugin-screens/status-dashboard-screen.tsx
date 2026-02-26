import { MdDashboard } from 'react-icons/md';
import { createScreen } from '@toolkit/react-screens';
import { StatusDashboard } from '@toolkit/components/dashboard/status-dashboard';

export const StatusDashboardScreenPlugin = createScreen({
  name: 'Status',
  Component: StatusDashboard,
  Icon: MdDashboard,
  layout: 'popup',
  navCategory: 'Dashboard',
});
