export async function getMunicipalityFromGPS(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://eines.icgc.cat/geocodificador/rest/services/Geocodificador/GeocodificadorICGC/GeocodeServer/reverseGeocode?location=${lng},${lat}&distance=100&outSR=4326&f=json`
    );
    const data = await response.json();
    return data?.address?.City || data?.address?.Municipality || null;
  } catch {
    return null;
  }
}

export function watchUserLocation(
  onUpdate: (lat: number, lng: number, municipio: string | null) => void,
  onError: (error: string) => void
): () => void {
  if (!navigator.geolocation) {
    onError('GPS no disponible en este dispositivo');
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const municipio = await getMunicipalityFromGPS(latitude, longitude);
      onUpdate(latitude, longitude, municipio);
    },
    () => {
      onError('No se pudo obtener la ubicación GPS');
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}
