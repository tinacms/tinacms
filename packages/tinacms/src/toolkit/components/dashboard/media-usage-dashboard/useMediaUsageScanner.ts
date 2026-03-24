import { useState, useCallback, useEffect, useRef } from 'react';
import { useCMS } from '@toolkit/react-core';
import { scanAllMedia, type MediaUsage } from './media-usage-scanner';

export const useMediaUsageScanner = () => {
  const cms = useCMS();
  const [mediaItems, setMediaItems] = useState<MediaUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [progress, setProgress] = useState(0);
  const activeRef = useRef(true);

  const scanMedia = useCallback(async () => {
    setIsLoading(true);
    setErrorOccurred(false);
    setProgress(0);
    try {
      const updatedMediaItems = await scanAllMedia(cms, setProgress);
      if (activeRef.current) setMediaItems(updatedMediaItems);
    } catch (e) {
      console.error('Error scanning media usage:', e);
      if (activeRef.current) setErrorOccurred(true);
    } finally {
      if (activeRef.current) setIsLoading(false);
    }
  }, [cms]);

  useEffect(() => {
    activeRef.current = true;
    scanMedia().catch((e) => {
      console.error('Unhandled rejection from scanMedia:', e);
    });
    return () => {
      activeRef.current = false;
    };
  }, [scanMedia]);

  return {
    mediaItems,
    isLoading,
    errorOccurred,
    progress,
    refresh: scanMedia,
  };
};
