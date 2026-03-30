import L from 'leaflet';

export function createAlertMarker(type: string, score: number, status: string) {
  const size = score <= 40 ? 12 : score <= 60 ? 16 : score <= 80 ? 20 : 24;
  const opacity = status === 'DECAYING' ? 0.4 : 1;
  const pulse = score > 80 || type === 'veneno';

  const colors: Record<string, string> = {
    procesionaria: '#a855f7',
    veneno: '#ef4444',
    trampa: '#f97316',
    basura: '#eab308'
  };

  const color = colors[type] || '#9ca3af';

  const shapes: Record<string, string> = {
    procesionaria: `<circle cx="16" cy="16" r="${size / 2}" fill="${color}" stroke="white" stroke-width="2" opacity="${opacity}"/>`,
    veneno: `<polygon points="16,${16 - size / 2} ${16 + size / 2},${16 + size / 2} ${16 - size / 2},${16 + size / 2}" fill="${color}" stroke="white" stroke-width="2" opacity="${opacity}"/>`,
    trampa: `<rect x="${16 - size / 2}" y="${16 - size / 2}" width="${size}" height="${size}" fill="${color}" stroke="white" stroke-width="2" opacity="${opacity}"/>`,
    basura: `<polygon points="16,${16 - size / 2} ${16 + size / 2},16 16,${16 + size / 2} ${16 - size / 2},16" fill="${color}" stroke="white" stroke-width="2" opacity="${opacity}"/>`
  };

  const pulseAnim = pulse ? `<animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>` : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <g>${shapes[type] || shapes.procesionaria}${pulseAnim}</g>
  </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}
