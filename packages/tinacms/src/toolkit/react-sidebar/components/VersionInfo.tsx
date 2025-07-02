import { useCMS } from '@toolkit/react-tinacms';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { Check, LoaderCircle, TriangleAlert } from 'lucide-react';
import React from 'react';
// import { version as currentVersion } from '../../../../package.json';
import { LatestVersionResponse } from '../../../internalClient';

const currentVersion = '1.0';

export const VersionInfo = () => {
  const cms = useCMS();
  const [isLoading, setIsLoading] = React.useState(true);
  const [latestVersionInfo, setLatestVersionInfo] =
    React.useState<LatestVersionResponse | null>(null);

  React.useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        const latestVersion = await cms.api.tina.getLatestVersion();
        setLatestVersionInfo(latestVersion);
      } catch {
        // swallow errors silently since the api call logs them
      }
      setIsLoading(false);
    };

    fetchVersionInfo();
  }, [cms]);

  return (
    <span className='font-sans font-light text-xs mb-3 mt-4 text-gray-500'>
      TinaCMS v{currentVersion + ' '}
      {isLoading ? (
        <LoaderCircle className='animate-spin w-4 h-4 inline-block mb-px' />
      ) : (
        <LatestVersionWarning latestVersionInfo={latestVersionInfo} />
      )}
    </span>
  );
};

const LatestVersionWarning = ({
  latestVersionInfo,
}: { latestVersionInfo: LatestVersionResponse | null }) => {
  if (!latestVersionInfo) return null;

  const latestVersion = latestVersionInfo['tinacms']?.version;
  const relativePublishedAt = latestVersionInfo.tinacms?.publishedAt
    ? formatDistanceToNow(new Date(latestVersionInfo.tinacms?.publishedAt), {
        addSuffix: true,
      })
    : '';

  if (!latestVersion) {
    return null;
  }

  if (latestVersion === currentVersion) {
    return <Check className='w-4 h-4 inline-block mb-px text-green-500' />;
  }

  return (
    <span className='text-yellow-700'>
      <TriangleAlert className='w-4 h-4 inline-block mb-px' />
      <br />v{latestVersion} published {relativePublishedAt}
    </span>
  );
};
