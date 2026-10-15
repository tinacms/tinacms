import { useCMS } from '@tinacms/toolkit';
import { Callout } from '@toolkit/react-sidebar/components/callout';
import React from 'react';
import pkg from '../../../package.json';
import type { Announcement } from '../../internalClient';

export const DISMISSED_KEY = 'tinacms-announcements-dismissed';

type Listener = () => void;
let listeners: Set<Listener> = new Set();

function readDismissedFromStorage(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
  } catch {
    return [];
  }
}

function notify() {
  for (const fn of listeners) fn();
}

function dismissAnnouncement(id: string) {
  const current = readDismissedFromStorage();
  if (current.includes(id)) return;
  current.push(id);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(current));
  notify();
}

function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getDismissed(): string[] {
  return readDismissedFromStorage();
}

export function resetDismissedStore() {
  listeners = new Set();
}

export function useAnnouncements() {
  const ctx = React.useContext(AnnouncementsContext);
  const cms = useCMS();
  const [, forceRender] = React.useState(0);

  React.useEffect(() => {
    return subscribe(() => forceRender((n) => n + 1));
  }, []);

  const [localAnnouncements, setLocalAnnouncements] = React.useState<
    Announcement[] | null
  >(null);

  React.useEffect(() => {
    if (ctx) return;
    const fetchAnnouncements = async () => {
      try {
        const result = await cms.api.tina.getAnnouncements(pkg.version);
        setLocalAnnouncements(result);
      } catch (err) {
        console.error('failed to fetch announcements', err);
      }
    };
    fetchAnnouncements();
  }, [ctx, cms.api.tina]);

  const announcements = ctx?.announcements ?? localAnnouncements;
  const dismissed = getDismissed();

  const dismiss = React.useCallback((id: string) => {
    dismissAnnouncement(id);
  }, []);

  return { announcements, dismissed, dismiss };
}

type AnnouncementsContextValue = {
  announcements: Announcement[] | null;
};

const AnnouncementsContext = React.createContext<
  AnnouncementsContextValue | undefined
>(undefined);

export const AnnouncementsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const cms = useCMS();
  const [announcements, setAnnouncements] = React.useState<
    Announcement[] | null
  >(null);

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

  return (
    <AnnouncementsContext.Provider value={{ announcements }}>
      {children}
    </AnnouncementsContext.Provider>
  );
};

const severityToCalloutStyle: Record<string, 'info' | 'warning' | 'error'> = {
  info: 'info',
  warning: 'warning',
  critical: 'error',
};

export const AnnouncementsBanner = () => {
  const { announcements, dismissed, dismiss } = useAnnouncements();

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
          calloutStyle={severityToCalloutStyle[a.severity] || 'info'}
          className='flex items-start gap-2'
        >
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-2'>
              <span className='font-bold'>{a.headline}</span>
              {a.severity !== 'critical' ? (
                <button
                  onClick={() => dismiss(a.id)}
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
