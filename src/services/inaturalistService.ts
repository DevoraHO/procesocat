const INAT_API = 'https://api.inaturalist.org/v1';

export interface InatObservation {
  id: number;
  lat: number;
  lng: number;
  observed_on: string;
  quality_grade: string;
  place_guess: string;
  description: string;
}

let cache: InatObservation[] | null = null;

export async function fetchProcessionaryObservations(): Promise<InatObservation[]> {
  if (cache) return cache;
  try {
    const response = await fetch(
      `${INAT_API}/observations?` +
        `taxon_name=Thaumetopoea+pityocampa` +
        `&place_id=6753` +
        `&quality_grade=research,needs_id` +
        `&per_page=200` +
        `&order=desc` +
        `&order_by=observed_on` +
        `&geo=true`
    );
    const data = await response.json();

    const results: InatObservation[] = (data.results || [])
      .filter((obs: any) => obs.location && obs.location.includes(','))
      .map((obs: any) => {
        const [lat, lng] = obs.location.split(',').map(Number);
        return {
          id: obs.id,
          lat,
          lng,
          observed_on: obs.observed_on || '',
          quality_grade: obs.quality_grade || '',
          place_guess: obs.place_guess || 'Catalunya',
          description: obs.description || 'Observació de procesionària del pi',
        };
      });

    cache = results;
    return results;
  } catch (error) {
    console.error('iNaturalist API error:', error);
    return [];
  }
}

export function clearInatCache() {
  cache = null;
}
