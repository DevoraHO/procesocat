const IDESCAT_URL = 'https://api.idescat.cat/emex/v1';

export interface MunicipalityBasic {
  id: string;
  name: string;
  comarca: string;
  provincia: string;
  lat: number;
  lng: number;
}

let municipalitiesCache: MunicipalityBasic[] = [];

export async function getAllMunicipalities(): Promise<MunicipalityBasic[]> {
  if (municipalitiesCache.length > 0) {
    return municipalitiesCache;
  }

  try {
    const response = await fetch(
      `${IDESCAT_URL}/nodes.json?lang=ca`
    );
    const data = await response.json();

    const municipalities: MunicipalityBasic[] = [];

    const nodes = data?.fitxes?.v || [];

    nodes.forEach((comarca: any) => {
      const comarcaName = comarca['#text'] || '';
      const municipis = Array.isArray(comarca.v)
        ? comarca.v
        : [comarca.v];

      municipis?.forEach((mun: any) => {
        if (mun?.['@scheme'] === 'mun') {
          municipalities.push({
            id: mun['@id'],
            name: mun['#text'] || '',
            comarca: comarcaName,
            provincia: 'Barcelona',
            lat: 0,
            lng: 0,
          });
        }
      });
    });

    municipalitiesCache = municipalities;
    return municipalities;
  } catch (error) {
    console.error('Idescat API error:', error);
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
    .filter((m) =>
      normalize(m.name).includes(q) || normalize(m.comarca).includes(q)
    )
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
    { id: '080768', name: 'Mollet del Vallès', comarca: 'Vallès Oriental', provincia: 'Barcelona', lat: 41.5363, lng: 2.2117 },
    { id: '081018', name: 'Sant Cugat del Vallès', comarca: 'Vallès Occidental', provincia: 'Barcelona', lat: 41.4727, lng: 2.0834 },
    { id: '081149', name: 'Vic', comarca: 'Osona', provincia: 'Barcelona', lat: 41.9302, lng: 2.2545 },
    { id: '081694', name: 'Santpedor', comarca: 'Bages', provincia: 'Barcelona', lat: 41.7578, lng: 1.8006 },
    { id: '080051', name: 'Artés', comarca: 'Bages', provincia: 'Barcelona', lat: 41.7984, lng: 1.9587 },
    { id: '080060', name: 'Avinyó', comarca: 'Bages', provincia: 'Barcelona', lat: 41.8721, lng: 1.9765 },
    { id: '082013', name: 'Sant Joan de Vilatorrada', comarca: 'Bages', provincia: 'Barcelona', lat: 41.7425, lng: 1.8478 },
    { id: '081696', name: 'Sant Pere de Vilamajor', comarca: 'Vallès Oriental', provincia: 'Barcelona', lat: 41.6889, lng: 2.3678 },
    { id: '080883', name: 'Sant Antoni de Vilamajor', comarca: 'Vallès Oriental', provincia: 'Barcelona', lat: 41.6756, lng: 2.3512 },
    { id: '081240', name: 'Parets del Vallès', comarca: 'Vallès Oriental', provincia: 'Barcelona', lat: 41.5698, lng: 2.2245 },
    { id: '080769', name: 'Montmeló', comarca: 'Vallès Oriental', provincia: 'Barcelona', lat: 41.5534, lng: 2.2456 },
    { id: '080284', name: 'Cardedeu', comarca: 'Vallès Oriental', provincia: 'Barcelona', lat: 41.6389, lng: 2.3567 },
    { id: '081947', name: 'Navarcles', comarca: 'Bages', provincia: 'Barcelona', lat: 41.7628, lng: 1.9023 },
    { id: '080276', name: 'Callús', comarca: 'Bages', provincia: 'Barcelona', lat: 41.7789, lng: 1.8234 },
    { id: '080127', name: 'Balsareny', comarca: 'Bages', provincia: 'Barcelona', lat: 41.8634, lng: 1.8856 },
    { id: '080733', name: 'Moià', comarca: 'Moianès', provincia: 'Barcelona', lat: 41.8102, lng: 2.0912 },
    { id: '081123', name: 'Sant Fruitós de Bages', comarca: 'Bages', provincia: 'Barcelona', lat: 41.7478, lng: 1.8756 },
    { id: '081037', name: 'Sant Feliu de Llobregat', comarca: 'Baix Llobregat', provincia: 'Barcelona', lat: 41.3827, lng: 2.0432 },
    { id: '080279', name: 'Castelldefels', comarca: 'Baix Llobregat', provincia: 'Barcelona', lat: 41.2794, lng: 1.9762 },
  ];
}
