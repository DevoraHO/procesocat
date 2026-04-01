export interface MunicipalityBasic {
  id: string;
  name: string;
  comarca: string;
  provincia: string;
  lat: number;
  lng: number;
}

let cache: MunicipalityBasic[] = [];
let loading = false;
let loaded = false;

function getProvince(code: string): string {
  if (code.startsWith('08')) return 'Barcelona';
  if (code.startsWith('17')) return 'Girona';
  if (code.startsWith('25')) return 'Lleida';
  if (code.startsWith('43')) return 'Tarragona';
  return '';
}

const CATALUNYA_PREFIXES = ['08', '17', '25', '43'];

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function isMunicipalitiesLoaded(): boolean {
  return loaded;
}

export function isMunicipalitiesLoading(): boolean {
  return loading;
}

export async function loadAllMunicipalities(): Promise<void> {
  if (cache.length > 0 || loading) return;
  loading = true;

  try {
    const allData: any[] = [];

    for (let page = 1; page <= 16; page++) {
      const res = await fetch(
        `https://servicios.ine.es/wstempus/js/ES/VALORES_VARIABLE/19?page=${page}`
      );
      const data = await res.json();
      if (!data?.length) break;

      const catData = data.filter((m: any) =>
        CATALUNYA_PREFIXES.some(p =>
          String(m.Codigo || '').startsWith(p)
        )
      );
      allData.push(...catData);
      if (data.length < 500) break;
    }

    cache = allData.map((m: any) => ({
      id: String(m.Codigo),
      name: m.Nombre || '',
      comarca: '',
      provincia: getProvince(String(m.Codigo || '')),
      lat: 0,
      lng: 0,
    }));

    loaded = true;
  } catch (e) {
    console.error('Failed to load municipalities from INE:', e);
  }
  loading = false;
}

export function searchMunicipalitiesLocal(query: string): MunicipalityBasic[] {
  if (query.length < 2) return [];

  const q = normalize(query);

  return cache
    .filter(m => normalize(m.name).includes(q))
    .slice(0, 10);
}

// Keep async version for backward compat — now just wraps local search
export async function searchMunicipalitiesAPI(
  query: string
): Promise<MunicipalityBasic[]> {
  if (!loaded && !loading) {
    await loadAllMunicipalities();
  }
  return searchMunicipalitiesLocal(query);
}

export function getAllCachedMunicipalities(): MunicipalityBasic[] {
  return cache;
}

function getFallbackMunicipalities(): MunicipalityBasic[] {
  return [
    { id: '080193', name: 'Sabadell', comarca: 'Vallès Occidental', provincia: 'Barcelona', lat: 41.5430, lng: 2.1086 },
    { id: '080221', name: 'Terrassa', comarca: 'Vallès Occidental', provincia: 'Barcelona', lat: 41.5635, lng: 2.0089 },
    { id: '080900', name: 'Barcelona', comarca: 'Barcelonès', provincia: 'Barcelona', lat: 41.3851, lng: 2.1734 },
    { id: '080858', name: 'Badalona', comarca: 'Barcelonès', provincia: 'Barcelona', lat: 41.4500, lng: 2.2470 },
    { id: '082077', name: 'Mataró', comarca: 'Maresme', provincia: 'Barcelona', lat: 41.5381, lng: 2.4444 },
    { id: '080592', name: 'Granollers', comarca: 'Vallès Oriental', provincia: 'Barcelona', lat: 41.6079, lng: 2.2873 },
    { id: '080695', name: 'Manresa', comarca: 'Bages', provincia: 'Barcelona', lat: 41.7286, lng: 1.8254 },
    { id: '170792', name: 'Girona', comarca: 'Gironès', provincia: 'Girona', lat: 41.9794, lng: 2.8214 },
    { id: '251207', name: 'Lleida', comarca: 'Segrià', provincia: 'Lleida', lat: 41.6176, lng: 0.6200 },
    { id: '431482', name: 'Tarragona', comarca: 'Tarragonès', provincia: 'Tarragona', lat: 41.1189, lng: 1.2445 },
    { id: '431234', name: 'Reus', comarca: 'Baix Camp', provincia: 'Tarragona', lat: 41.1561, lng: 1.1069 },
  ];
}
