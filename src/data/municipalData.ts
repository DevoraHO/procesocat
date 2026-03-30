export interface Vet {
  name: string;
  phone: string;
  address: string;
  hours: string;
  emergency: boolean;
}

export interface Municipality {
  id: string;
  name_es: string;
  name_ca: string;
  comarca_es: string;
  comarca_ca: string;
  provincia: string;
  lat: number;
  lng: number;
  postal_codes: string[];
  risk_level: string;
  ajuntament: {
    phone: string;
    urgencies_phone: string;
    email: string;
    web: string;
    address: string;
  };
  emergencies: {
    policia_local: string;
    bombers: string;
    mossos: string;
    proteccio_civil: string;
    agents_rurals: string;
  };
  vets: Vet[];
  sanitat_forestal: string;
}

export const MUNICIPALITIES: Municipality[] = [
  // VALLÈS OCCIDENTAL
  {
    id: 'sabadell',
    name_es: 'Sabadell', name_ca: 'Sabadell',
    comarca_es: 'Vallès Occidental', comarca_ca: 'Vallès Occidental',
    provincia: 'Barcelona', lat: 41.5430, lng: 2.1086,
    postal_codes: ['08201','08202','08203','08204','08205','08206','08207','08208'],
    risk_level: 'very_high',
    ajuntament: { phone: '93 745 31 00', urgencies_phone: '93 745 31 00', email: 'ajuntament@sabadell.cat', web: 'sabadell.cat', address: 'Plaça de Sant Roc, 1' },
    emergencies: { policia_local: '93 745 31 00', bombers: '085', mossos: '088', proteccio_civil: '93 745 31 00', agents_rurals: '900 050 051' },
    vets: [
      { name: 'Clínica Veterinaria Sabadell Centre', phone: '93 726 XX XX', address: 'Carrer de Gràcia, 12', hours: '24h', emergency: true },
      { name: 'Hospital Veterinari Sabadell', phone: '93 727 XX XX', address: 'Carrer del Doctor Puig, 8', hours: 'L-V 9-21h, urgències 24h', emergency: true }
    ],
    sanitat_forestal: 'Oficina Comarcal Vallès Occidental — 93 748 XX XX'
  },
  {
    id: 'terrassa',
    name_es: 'Terrassa', name_ca: 'Terrassa',
    comarca_es: 'Vallès Occidental', comarca_ca: 'Vallès Occidental',
    provincia: 'Barcelona', lat: 41.5635, lng: 2.0089,
    postal_codes: ['08220','08221','08222','08223','08224','08225','08226','08227'],
    risk_level: 'very_high',
    ajuntament: { phone: '93 739 70 00', urgencies_phone: '93 739 70 00', email: 'ajuntament@terrassa.cat', web: 'terrassa.cat', address: 'Raval de Montserrat, 14' },
    emergencies: { policia_local: '93 739 70 00', bombers: '085', mossos: '088', proteccio_civil: '93 739 70 00', agents_rurals: '900 050 051' },
    vets: [
      { name: 'Hospital Veterinari Terrassa', phone: '93 788 XX XX', address: 'Carrer de la Rasa, 5', hours: '24h', emergency: true },
      { name: 'Clínica Vet Terrassa Nord', phone: '93 786 XX XX', address: 'Avinguda del Vallès, 230', hours: 'L-S 9-21h, urgències 24h', emergency: true }
    ],
    sanitat_forestal: 'Oficina Comarcal Vallès Occidental — 93 748 XX XX'
  },
  {
    id: 'sant_cugat',
    name_es: 'Sant Cugat del Vallès', name_ca: 'Sant Cugat del Vallès',
    comarca_es: 'Vallès Occidental', comarca_ca: 'Vallès Occidental',
    provincia: 'Barcelona', lat: 41.4727, lng: 2.0834,
    postal_codes: ['08172','08173','08174'],
    risk_level: 'very_high',
    ajuntament: { phone: '93 565 10 00', urgencies_phone: '93 565 10 00', email: 'ajuntament@santcugat.cat', web: 'santcugat.cat', address: 'Plaça de la Vila, 1' },
    emergencies: { policia_local: '93 565 10 00', bombers: '085', mossos: '088', proteccio_civil: '93 565 10 00', agents_rurals: '900 050 051' },
    vets: [
      { name: 'Centre Veterinari Sant Cugat', phone: '93 674 XX XX', address: 'Carrer de Valldoreix, 15', hours: '24h', emergency: true }
    ],
    sanitat_forestal: 'Oficina Comarcal Vallès Occidental — 93 748 XX XX'
  },
  // VALLÈS ORIENTAL
  {
    id: 'granollers',
    name_es: 'Granollers', name_ca: 'Granollers',
    comarca_es: 'Vallès Oriental', comarca_ca: 'Vallès Oriental',
    provincia: 'Barcelona', lat: 41.6079, lng: 2.2873,
    postal_codes: ['08400'],
    risk_level: 'very_high',
    ajuntament: { phone: '93 842 66 10', urgencies_phone: '93 842 66 10', email: 'ajuntament@granollers.cat', web: 'granollers.cat', address: 'Plaça de la Porxada, 6' },
    emergencies: { policia_local: '93 842 66 10', bombers: '085', mossos: '088', proteccio_civil: '93 842 66 10', agents_rurals: '900 050 051' },
    vets: [
      { name: 'Hospital Veterinari Granollers', phone: '93 879 XX XX', address: 'Carrer de Sant Esteve, 40', hours: '24h urgències', emergency: true },
      { name: 'Clínica Vet Granollers Centre', phone: '93 870 XX XX', address: 'Carrer de la Unió, 12', hours: 'L-V 9-20h, S 9-14h', emergency: false }
    ],
    sanitat_forestal: 'Oficina Comarcal Vallès Oriental — 93 860 XX XX'
  },
  {
    id: 'mollet',
    name_es: 'Mollet del Vallès', name_ca: 'Mollet del Vallès',
    comarca_es: 'Vallès Oriental', comarca_ca: 'Vallès Oriental',
    provincia: 'Barcelona', lat: 41.5363, lng: 2.2117,
    postal_codes: ['08100'],
    risk_level: 'very_high',
    ajuntament: { phone: '93 544 50 00', urgencies_phone: '93 544 50 00', email: 'ajuntament@molletvalles.cat', web: 'molletvalles.cat', address: 'Plaça de la Vila, 2' },
    emergencies: { policia_local: '93 544 50 11', bombers: '085', mossos: '088', proteccio_civil: '93 544 50 00', agents_rurals: '900 050 051' },
    vets: [
      { name: 'Clínica Veterinària Mollet', phone: '93 544 XX XX', address: 'Carrer de Gaietà Vinzia, 8', hours: 'L-V 9-21h, urgències 24h', emergency: true },
      { name: 'Vet Guardia Granollers 24h', phone: '93 879 XX XX', address: 'Granollers (15min)', hours: '24h', emergency: true }
    ],
    sanitat_forestal: 'Oficina Comarcal Vallès Oriental — 93 860 XX XX'
  },
  // MARESME
  {
    id: 'mataro',
    name_es: 'Mataró', name_ca: 'Mataró',
    comarca_es: 'Maresme', comarca_ca: 'Maresme',
    provincia: 'Barcelona', lat: 41.5381, lng: 2.4444,
    postal_codes: ['08301','08302','08303','08304','08305'],
    risk_level: 'very_high',
    ajuntament: { phone: '93 758 20 00', urgencies_phone: '93 758 20 00', email: 'ajuntament@mataro.cat', web: 'mataro.cat', address: 'Plaça de Santa Anna, 6' },
    emergencies: { policia_local: '93 758 20 00', bombers: '085', mossos: '088', proteccio_civil: '93 758 20 00', agents_rurals: '900 050 051' },
    vets: [
      { name: 'Hospital Veterinari Mataró', phone: '93 790 XX XX', address: 'Carrer del Camí Ral, 120', hours: '24h', emergency: true },
      { name: 'Clínica Vet Maresme', phone: '93 796 XX XX', address: 'Avinguda del Maresme, 45', hours: 'L-V 9-20h, urgències 24h', emergency: true }
    ],
    sanitat_forestal: 'Oficina Comarcal Maresme — 93 741 XX XX'
  },
  // BARCELONÈS
  {
    id: 'barcelona',
    name_es: 'Barcelona', name_ca: 'Barcelona',
    comarca_es: 'Barcelonès', comarca_ca: 'Barcelonès',
    provincia: 'Barcelona', lat: 41.3851, lng: 2.1734,
    postal_codes: ['08001','08002','08003','08004','08005','08006','08007','08008','08009','08010','08011','08012','08013','08014','08015','08016','08017','08018','08019','08020','08021','08022','08023','08024','08025','08026','08027','08028','08029','08030','08031','08032','08033','08034','08035','08036','08037','08038','08039','08040','08041','08042'],
    risk_level: 'high',
    ajuntament: { phone: '010', urgencies_phone: '010', email: 'ajuntament@bcn.cat', web: 'barcelona.cat', address: 'Plaça de Sant Jaume, 1' },
    emergencies: { policia_local: '092', bombers: '085', mossos: '088', proteccio_civil: '010', agents_rurals: '900 050 051' },
    vets: [
      { name: 'Hospital Veterinari Molins', phone: '93 680 XX XX', address: 'Carrer Laureà Miró, 154', hours: '24h', emergency: true },
      { name: 'Vet 24h Barcelona Centre', phone: '93 317 XX XX', address: 'Carrer del Consell de Cent, 289', hours: '24h', emergency: true },
      { name: 'Hospital Vet Diagonal', phone: '93 414 XX XX', address: 'Avinguda Diagonal, 329', hours: '24h urgències', emergency: true }
    ],
    sanitat_forestal: 'Servei de Parcs i Jardins Barcelona — 010'
  },
  // BAIX LLOBREGAT
  {
    id: 'castelldefels',
    name_es: 'Castelldefels', name_ca: 'Castelldefels',
    comarca_es: 'Baix Llobregat', comarca_ca: 'Baix Llobregat',
    provincia: 'Barcelona', lat: 41.2794, lng: 1.9762,
    postal_codes: ['08860'],
    risk_level: 'high',
    ajuntament: { phone: '93 665 11 50', urgencies_phone: '93 665 11 50', email: 'ajuntament@castelldefels.org', web: 'castelldefels.org', address: "Plaça de l'Església, 1" },
    emergencies: { policia_local: '93 665 11 50', bombers: '085', mossos: '088', proteccio_civil: '93 665 11 50', agents_rurals: '900 050 051' },
    vets: [
      { name: 'Clínica Vet Castelldefels', phone: '93 664 XX XX', address: 'Avinguda del Castello, 22', hours: 'L-V 9-20h, urgències 24h', emergency: true }
    ],
    sanitat_forestal: 'Oficina Comarcal Baix Llobregat — 93 685 XX XX'
  },
  // BAGES
  {
    id: 'manresa',
    name_es: 'Manresa', name_ca: 'Manresa',
    comarca_es: 'Bages', comarca_ca: 'Bages',
    provincia: 'Barcelona', lat: 41.7286, lng: 1.8254,
    postal_codes: ['08240','08241','08242','08243'],
    risk_level: 'high',
    ajuntament: { phone: '93 878 23 00', urgencies_phone: '93 878 23 00', email: 'ajuntament@manresa.cat', web: 'manresa.cat', address: 'Plaça Major, 1' },
    emergencies: { policia_local: '93 878 23 00', bombers: '085', mossos: '088', proteccio_civil: '93 878 23 00', agents_rurals: '900 050 051' },
    vets: [
      { name: 'Hospital Veterinari Bages', phone: '93 877 XX XX', address: 'Carrer de Jaume I, 55', hours: '24h', emergency: true },
      { name: 'Clínica Vet Manresa Centre', phone: '93 872 XX XX', address: 'Carrer del Bruc, 18', hours: 'L-V 9-20h, S 9-13h', emergency: false }
    ],
    sanitat_forestal: 'Oficina Comarcal Bages — 93 877 XX XX'
  },
  {
    id: 'santpedor',
    name_es: 'Santpedor', name_ca: 'Santpedor',
    comarca_es: 'Bages', comarca_ca: 'Bages',
    provincia: 'Barcelona', lat: 41.7578, lng: 1.8006,
    postal_codes: ['08251'],
    risk_level: 'high',
    ajuntament: { phone: '93 832 00 00', urgencies_phone: '93 832 00 00', email: 'ajuntament@santpedor.cat', web: 'santpedor.cat', address: 'Plaça Major, 1' },
    emergencies: { policia_local: '93 832 00 00', bombers: '085', mossos: '088', proteccio_civil: '93 832 00 00', agents_rurals: '900 050 051' },
    vets: [
      { name: 'Hospital Veterinari Bages (Manresa)', phone: '93 877 XX XX', address: 'Manresa (8min)', hours: '24h', emergency: true }
    ],
    sanitat_forestal: 'Oficina Comarcal Bages — 93 877 XX XX'
  },
  {
    id: 'artés',
    name_es: 'Artés', name_ca: 'Artés',
    comarca_es: 'Bages', comarca_ca: 'Bages',
    provincia: 'Barcelona', lat: 41.7984, lng: 1.9587,
    postal_codes: ['08271'],
    risk_level: 'high',
    ajuntament: { phone: '93 830 10 02', urgencies_phone: '93 830 10 02', email: 'ajuntament@artes.cat', web: 'artes.cat', address: 'Plaça de la Vila, 1' },
    emergencies: { policia_local: '93 830 10 02', bombers: '085', mossos: '088', proteccio_civil: '93 830 10 02', agents_rurals: '900 050 051' },
    vets: [
      { name: 'Hospital Veterinari Bages (Manresa)', phone: '93 877 XX XX', address: 'Manresa (15min)', hours: '24h', emergency: true }
    ],
    sanitat_forestal: 'Oficina Comarcal Bages — 93 877 XX XX'
  },
  {
    id: 'avinyó',
    name_es: 'Avinyó', name_ca: 'Avinyó',
    comarca_es: 'Bages', comarca_ca: 'Bages',
    provincia: 'Barcelona', lat: 41.8721, lng: 1.9765,
    postal_codes: ['08279'],
    risk_level: 'high',
    ajuntament: { phone: '93 830 91 14', urgencies_phone: '93 830 91 14', email: 'ajuntament@avinyo.cat', web: 'avinyo.cat', address: 'Carrer Major, 1' },
    emergencies: { policia_local: '93 830 91 14', bombers: '085', mossos: '088', proteccio_civil: '93 830 91 14', agents_rurals: '900 050 051' },
    vets: [
      { name: 'Hospital Veterinari Bages (Manresa)', phone: '93 877 XX XX', address: 'Manresa (20min)', hours: '24h', emergency: true }
    ],
    sanitat_forestal: 'Oficina Comarcal Bages — 93 877 XX XX'
  },
  {
    id: 'sant_joan_vilatorrada',
    name_es: 'Sant Joan de Vilatorrada', name_ca: 'Sant Joan de Vilatorrada',
    comarca_es: 'Bages', comarca_ca: 'Bages',
    provincia: 'Barcelona', lat: 41.7425, lng: 1.8478,
    postal_codes: ['08250'],
    risk_level: 'high',
    ajuntament: { phone: '93 875 00 51', urgencies_phone: '93 875 00 51', email: 'ajuntament@sjvilatorrada.cat', web: 'sjvilatorrada.cat', address: 'Carrer del Bruc, 3' },
    emergencies: { policia_local: '93 875 00 51', bombers: '085', mossos: '088', proteccio_civil: '93 875 00 51', agents_rurals: '900 050 051' },
    vets: [
      { name: 'Hospital Veterinari Bages (Manresa)', phone: '93 877 XX XX', address: 'Manresa (5min)', hours: '24h', emergency: true }
    ],
    sanitat_forestal: 'Oficina Comarcal Bages — 93 877 XX XX'
  },
  {
    id: 'navarcles',
    name_es: 'Navarcles', name_ca: 'Navarcles',
    comarca_es: 'Bages', comarca_ca: 'Bages',
    provincia: 'Barcelona', lat: 41.7628, lng: 1.9023,
    postal_codes: ['08270'],
    risk_level: 'high',
    ajuntament: { phone: '93 831 70 05', urgencies_phone: '93 831 70 05', email: 'ajuntament@navarcles.cat', web: 'navarcles.cat', address: 'Plaça Major, 1' },
    emergencies: { policia_local: '93 831 70 05', bombers: '085', mossos: '088', proteccio_civil: '93 831 70 05', agents_rurals: '900 050 051' },
    vets: [
      { name: 'Hospital Veterinari Bages (Manresa)', phone: '93 877 XX XX', address: 'Manresa (10min)', hours: '24h', emergency: true }
    ],
    sanitat_forestal: 'Oficina Comarcal Bages — 93 877 XX XX'
  },
  // OSONA
  {
    id: 'vic',
    name_es: 'Vic', name_ca: 'Vic',
    comarca_es: 'Osona', comarca_ca: 'Osona',
    provincia: 'Barcelona', lat: 41.9302, lng: 2.2545,
    postal_codes: ['08500','08501','08502'],
    risk_level: 'high',
    ajuntament: { phone: '93 886 11 00', urgencies_phone: '93 886 11 00', email: 'ajuntament@vic.cat', web: 'vic.cat', address: 'Plaça Major, 1' },
    emergencies: { policia_local: '93 886 11 00', bombers: '085', mossos: '088', proteccio_civil: '93 886 11 00', agents_rurals: '900 050 051' },
    vets: [
      { name: 'Hospital Veterinari Osona', phone: '93 889 XX XX', address: 'Carrer de Mossèn Cinto, 12', hours: '24h', emergency: true },
      { name: 'Clínica Vet Vic Centre', phone: '93 886 XX XX', address: 'Carrer de la Rambla, 35', hours: 'L-V 9-20h', emergency: false }
    ],
    sanitat_forestal: 'Oficina Comarcal Osona — 93 883 XX XX'
  }
];

export function getMunicipalityByName(name: string) {
  return MUNICIPALITIES.find(m =>
    m.name_es.toLowerCase().includes(name.toLowerCase()) ||
    m.name_ca.toLowerCase().includes(name.toLowerCase())
  );
}

export function getMunicipalityById(id: string) {
  return MUNICIPALITIES.find(m => m.id === id);
}

export function getMunicipalitiesByComarca(comarca: string) {
  return MUNICIPALITIES.filter(m =>
    m.comarca_es.toLowerCase().includes(comarca.toLowerCase()) ||
    m.comarca_ca.toLowerCase().includes(comarca.toLowerCase())
  );
}

export function searchMunicipalities(query: string) {
  if (!query || query.length < 2) return [];
  return MUNICIPALITIES.filter(m =>
    m.name_es.toLowerCase().includes(query.toLowerCase()) ||
    m.name_ca.toLowerCase().includes(query.toLowerCase()) ||
    m.comarca_es.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);
}
