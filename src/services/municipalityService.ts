const INE_URL = 'https://servicios.ine.es/wstempus/js/ES/VALORES_VARIABLE/19?page=1';

export interface MunicipalityBasic {
  id: string;
  name: string;
  comarca: string;
  provincia: string;
  lat: number;
  lng: number;
}

let municipalitiesCache: MunicipalityBasic[] = [];

function getProvince(code: string): string {
  if (code.startsWith('08')) return 'Barcelona';
  if (code.startsWith('17')) return 'Girona';
  if (code.startsWith('25')) return 'Lleida';
  if (code.startsWith('43')) return 'Tarragona';
  return '';
}

const CATALUNYA_PREFIXES = ['08', '17', '25', '43'];

export async function getAllMunicipalities(): Promise<MunicipalityBasic[]> {
  if (municipalitiesCache.length > 0) {
    return municipalitiesCache;
  }

  try {
    const response = await fetch(INE_URL);
    const data = await response.json();

    const municipalities: MunicipalityBasic[] = data
      .filter((m: any) => {
        const code = String(m.Codigo || '');
        return CATALUNYA_PREFIXES.some(p => code.startsWith(p));
      })
      .map((m: any) => ({
        id: String(m.Codigo),
        name: m.Nombre || '',
        comarca: '',
        provincia: getProvince(String(m.Codigo || '')),
        lat: 0,
        lng: 0,
      }));

    municipalitiesCache = municipalities;
    return municipalities;
  } catch (error) {
    console.error('INE API error:', error);
    return getFallbackMunicipalities();
  }
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export async function searchMunicipalitiesAPI(
  query: string
): Promise<MunicipalityBasic[]> {
  if (query.length < 2) return [];
  const all = await getAllMunicipalities();
  const q = normalize(query);
  return all
    .filter((m) => normalize(m.name).includes(q))
    .slice(0, 10);
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
