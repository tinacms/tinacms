import { useState, useCallback, useEffect } from 'react';
import { useCMS } from '@toolkit/react-core';
import { scanAllMedia, type MediaUsage } from './media-usage-scanner';

export const useMediaUsage = () => {
  const cms = useCMS();
  const [mediaItems, setMediaItems] = useState<MediaUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const scanMedia = async () => {
      setIsLoading(true);
      setErrorOccurred(false);
      try {
        const updatedMediaItems = await scanAllMedia(cms);
        setMediaItems(updatedMediaItems);
      } catch (e) {
        console.error('Error scanning media usage:', e);
        setErrorOccurred(true);
      } finally {
        setIsLoading(false);
      }
    };

    scanMedia().catch((e) => {
      console.error('Unhandled rejection from scanMedia:', e);
    });
  }, [cms, refreshTrigger]);

  return {
    mediaItems,
    isLoading,
    errorOccurred,
    refresh,
  };
};
