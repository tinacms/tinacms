import { useState, useCallback, useEffect } from 'react';
import { useCMS } from '@toolkit/react-core';
import { scanAllMedia, type MediaUsage } from './media-usage-scanner';

export const useMediaUsageScanner = () => {
  const cms = useCMS();
  const [mediaItems, setMediaItems] = useState<MediaUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [progress, setProgress] = useState(0);

  const scanMedia = useCallback(async () => {
    setIsLoading(true);
    setErrorOccurred(false);
    setProgress(0);
    try {
      const updatedMediaItems = await scanAllMedia(cms, setProgress);
      setMediaItems(updatedMediaItems);
    } catch (e) {
      console.error('Error scanning media usage:', e);
      setErrorOccurred(true);
    } finally {
      setIsLoading(false);
    }
  }, [cms]);

  useEffect(() => {
    scanMedia().catch((e) => {
      console.error('Unhandled rejection from scanMedia:', e);
    });
  }, [scanMedia]);

  return {
    mediaItems,
    isLoading,
    errorOccurred,
    progress,
    refresh: scanMedia,
  };
};
