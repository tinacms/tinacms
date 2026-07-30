import { useCMS } from '@tinacms/toolkit';
import React from 'react';
import { Callout } from '@toolkit/react-sidebar/components/callout';
import type { Announcement } from '../../internalClient';
import pkg from '../../../package.json';

const DISMISSED_KEY = 'tinacms-announcements-dismissed';

const getDismissed = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
  } catch {
    return [];
  }
};

const addDismissed = (headline: string) => {
  const current = getDismissed();
  if (!current.includes(headline)) {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...current, headline]));
  }
};

export const AnnouncementsBanner = () => {
  const cms = useCMS();
  const [announcements, setAnnouncements] = React.useState<
    Announcement[] | null
  >(null);
  const [dismissed, setDismissed] = React.useState<string[]>(getDismissed);

  React.useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const result = await cms.api.tina.getAnnouncements(pkg.version);
        setAnnouncements(result);
      } catch (err) {
        console.error('failed to fetch announcements', err);
      }
    };
    fetchAnnouncements();
  }, [cms.api.tina]);

  if (!announcements || announcements.length === 0) return null;

  const visible = announcements.filter(
    (a) => a.severity === 'critical' || !dismissed.includes(a.id)
  );

  if (visible.length === 0) return null;

  return (
    <div className='px-6 py-2 space-y-2'>
      {visible.map((a) => (
        <Callout
          key={a.id}
          calloutStyle={a.severity}
          className='flex items-start gap-2'
        >
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-2'>
              <span className='font-bold'>{a.headline}</span>
              {a.severity !== 'critical' ? (
                <button
                  onClick={() => {
                    addDismissed(a.id);
                    setDismissed(getDismissed());
                  }}
                  className='flex-shrink-0 text-gray-400 hover:text-gray-600 text-lg leading-none'
                  aria-label='Dismiss'
                >
                  &times;
                </button>
              ) : (
                <button
                  disabled
                  title='This is a critical alert and cannot be dismissed'
                  className='flex-shrink-0 text-gray-300 text-lg leading-none cursor-not-allowed'
                  aria-label='Critical alert cannot be dismissed'
                >
                  &times;
                </button>
              )}
            </div>
            {a.body && <div className='mt-1'>{a.body}</div>}
            <div className='mt-1 text-xs opacity-60'>
              Your version: {pkg.version}
              {a.versionRange ? ` \u00B7 Targets: ${a.versionRange}` : ''}
            </div>
          </div>
        </Callout>
      ))}
    </div>
  );
};
