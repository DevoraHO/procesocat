export interface MunicipalityBasic {
  id: string;
  name: string;
  comarca: string;
  provincia: string;
  lat: number;
  lng: number;
}

const GEOCATALUNYA_URL = 'https://raw.githubusercontent.com/jorvixsky/geocatalunya/main/comarques_municipis.json';

let cache: MunicipalityBasic[] = [];
let loading = false;
let loaded = false;

function getProvince(code: string): string {
  if (code.startsWith('08')) return 'Barcelona';
  if (code.startsWith('17')) return 'Girona';
  if (code.startsWith('25')) return 'Lleida';
  if (code.startsWith('43')) return 'Tarragona';
  return 'Catalunya';
}

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
    const res = await fetch(GEOCATALUNYA_URL);
    const data = await res.json();

    const municipalities: MunicipalityBasic[] = [];

    // Structure: { "Comarca Name (code)": [{ city_name, city_code }] }
    for (const [comarcaKey, municipis] of Object.entries(data)) {
      const comarcaName = comarcaKey.replace(/\s*\(\d+\)$/, '');

      for (const mun of municipis as any[]) {
        const code = String(mun.city_code || '');
        municipalities.push({
          id: code,
          name: mun.city_name || '',
          comarca: comarcaName,
          provincia: getProvince(code),
          lat: 0,
          lng: 0,
        });
      }
    }

    cache = municipalities;
    loaded = true;
  } catch (e) {
    console.error('Failed to load municipalities from geocatalunya:', e);
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
