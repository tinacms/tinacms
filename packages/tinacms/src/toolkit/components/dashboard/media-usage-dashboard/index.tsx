import React, { useMemo, useState } from 'react';
import {
  Image,
  ImageOff,
  Database,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../ui/button';
import {
  DashboardTitleBar,
  DashboardLoadingState,
  DashboardErrorState,
} from '../dashboard-ui';
import type { ScreenComponentProps } from '@toolkit/react-screens';
import type { MediaUsage } from './media-usage-scanner';
import { useMediaUsageScanner } from './useMediaUsageScanner';
import { MediaLightbox } from './media-lightbox';
import { MediaUsageTable } from './media-usage-table';

/**
 * Media Usage Dashboard component that displays media files and their usage across the CMS
 */
export const MediaUsageDashboard = ({
  close: onClose,
}: ScreenComponentProps) => {
  const { mediaItems, isLoading, errorOccurred, progress, refresh } =
    useMediaUsageScanner();
  const [lightboxImage, setLightboxImage] = useState<MediaUsage | null>(null);

  const stats = useMemo(() => {
    const unusedCount = mediaItems.filter(
      (usage) => usage.usedIn.length === 0
    ).length;
    const usedCount = mediaItems.length - unusedCount;

    return {
      totalFiles: mediaItems.length,
      unusedCount,
      usedCount,
    };
  }, [mediaItems]);

  if (isLoading) {
    return (
      <DashboardLoadingState
        message='Scanning Media Usage...'
        progress={{ value: progress, label: 'Scanning collections' }}
      />
    );
  }
  if (errorOccurred) {
    return (
      <DashboardErrorState message='Something went wrong, unable to collect media usage statistics' />
    );
  }

  return (
    <div className='p-8 w-full max-w-6xl mx-auto font-sans'>
      <DashboardTitleBar
        title='Media Usage Dashboard'
        icon={<Image />}
        controls={
          <Button
            variant='outline'
            onClick={refresh}
            disabled={isLoading}
            className='flex items-center gap-2 shadow-sm font-medium transition-colors'
          >
            <RefreshCw className='w-4 h-4' />
            Refresh
          </Button>
        }
      />
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <StatCard
          label='Total Media Files'
          icon={<Database className='text-2xl text-gray-700' />}
          iconClassName='bg-gray-100'
          value={stats.totalFiles}
        />
        <StatCard
          label='In Use'
          icon={<CheckCircle2 className='text-2xl text-tina-orange-dark' />}
          iconClassName='bg-tina-orange/10'
          value={stats.usedCount}
        />
        <StatCard
          label='Unused'
          icon={
            <ImageOff
              className={`text-2xl ${stats.unusedCount > 0 ? 'text-orange-600' : 'text-gray-400'}`}
            />
          }
          iconClassName={
            stats.unusedCount > 0 ? 'bg-orange-100' : 'bg-gray-100'
          }
          value={stats.unusedCount}
          valueClassName={
            stats.unusedCount > 0 ? 'text-orange-600' : 'text-gray-800'
          }
        />
      </div>
      <MediaUsageTable
        mediaItems={mediaItems}
        onClose={onClose}
        onPreview={setLightboxImage}
      />
      <MediaLightbox
        item={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
};

const StatCard = ({
  label,
  icon,
  iconClassName,
  value,
  valueClassName = 'text-gray-800',
}: {
  label: string;
  icon: React.ReactNode;
  iconClassName: string;
  value: number;
  valueClassName?: string;
}) => (
  <div className='bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 p-6'>
    <div className={`${iconClassName} p-3 rounded-lg flex-shrink-0`}>
      {icon}
    </div>
    <div className='min-w-0'>
      <p className='text-sm text-gray-500 font-medium'>{label}</p>
      <p className={`text-3xl font-bold ${valueClassName}`}>{value}</p>
    </div>
  </div>
);
