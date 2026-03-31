import { useState, useEffect, useRef, useCallback } from 'react';

interface GPSPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

export function useGPSTracking() {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setPermissionGranted(true);
      },
      (err) => {
        console.warn('GPS error:', err.message);
        setPermissionGranted(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  return { position, permissionGranted, startTracking, stopTracking };
}
