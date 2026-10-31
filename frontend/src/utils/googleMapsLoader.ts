import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let loaderPromise: Promise<typeof google> | null = null;

export const getGoogleMapsApiKey = (): string => {
  return (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
};

export const isGoogleMapsApiKeyConfigured = (): boolean => {
  const key = getGoogleMapsApiKey();
  return !!key && key.trim() !== '' && key !== 'your_google_maps_api_key_here';
};

export const loadGoogleMaps = async (): Promise<typeof google> => {
  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    return (window as any).google;
  }

  if (loaderPromise) {
    return loaderPromise;
  }

  const apiKey = getGoogleMapsApiKey();
  setOptions({
    key: apiKey || '',
    v: 'weekly'
  });

  loaderPromise = Promise.all([
    importLibrary('maps'),
    importLibrary('marker')
  ]).then(() => {
    return (window as any).google;
  });

  return loaderPromise;
};
