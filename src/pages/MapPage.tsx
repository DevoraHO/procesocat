import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockReports, mockUser } from '@/data/mockData';
import { calculateDangerScore, getDangerColor, getDangerLevel } from '@/utils/dangerScore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Filter, Plus, X, ChevronLeft, ChevronRight, MapPin, Camera } from 'lucide-react';

interface ReportWithScore {
  report: typeof mockReports[0];
  score: number;
}

const MapPage = () => {
  const { t, i18n } = useTranslation();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  const [reports, setReports] = useState(() =>
    mockReports.map(r => ({ ...r, validation_count: r.validation_count }))
  );
  const [scoredReports, setScoredReports] = useState<ReportWithScore[]>([]);
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showNewReport, setShowNewReport] = useState(false);
  const [reportStep, setReportStep] = useState(1);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [reportDescription, setReportDescription] = useState('');
  const [reportPhotos, setReportPhotos] = useState<File[]>([]);
  const [mapClickMode, setMapClickMode] = useState(false);
  const [validatedIds, setValidatedIds] = useState<Set<string>>(new Set());

  const lang = i18n.language;

  // Calculate scores
  useEffect(() => {
    const scored = reports.map(r => ({
      report: r,
      score: calculateDangerScore(r, reports)
    }));
    setScoredReports(scored);
  }, [reports]);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current).setView([41.5, 1.8], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    heatmapLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Check location modal
    if (!localStorage.getItem('location_asked')) {
      setShowLocationModal(true);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle map click for report placement
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handler = (e: L.LeafletMouseEvent) => {
      if (mapClickMode) {
        setSelectedCoords([e.latlng.lat, e.latlng.lng]);
        setMapClickMode(false);
      }
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [mapClickMode]);

  // Render markers & heatmap
  const renderMarkers = useCallback(() => {
    if (!markersLayerRef.current || !heatmapLayerRef.current) return;
    markersLayerRef.current.clearLayers();
    heatmapLayerRef.current.clearLayers();

    scoredReports.forEach(({ report, score }) => {
      const color = getDangerColor(score);
      const level = getDangerLevel(score);
      const daysAgo = Math.floor((Date.now() - new Date(report.created_at).getTime()) / 86400000);
      const desc = report.description.length > 80 ? report.description.slice(0, 80) + '...' : report.description;
      const levelName = t(`danger.${level}`);

      // Marker
      const marker = L.circleMarker([report.lat, report.lng], {
        radius: 10,
        color,
        fillColor: color,
        fillOpacity: 0.9,
        weight: 2,
        opacity: report.status === 'DECAYING' ? 0.4 : 1
      });

      const popupContent = `
        <div style="min-width:220px;font-family:system-ui,sans-serif">
          <p style="margin:0 0 8px;font-size:13px;color:#333;line-height:1.4">${desc}</p>
          <div style="margin-bottom:8px">
            <span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;color:#fff;background:${color}">${score} — ${levelName}</span>
          </div>
          <p style="margin:0 0 4px;font-size:12px;color:#666">✅ ${t('report.validatedBy', { count: report.validation_count })}</p>
          <p style="margin:0 0 10px;font-size:12px;color:#999">📍 ${report.comarca} · ${daysAgo}d</p>
          <div style="display:flex;gap:6px">
            <button data-action="validate" data-id="${report.id}" style="flex:1;padding:6px 0;border:none;border-radius:6px;background:#2D6A4F;color:#fff;font-size:12px;cursor:pointer">✅ ${t('report.validate')}</button>
            <button data-action="share" data-id="${report.id}" style="flex:1;padding:6px 0;border:none;border-radius:6px;background:#25D366;color:#fff;font-size:12px;cursor:pointer">📱 WhatsApp</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        setTimeout(() => {
          const container = marker.getPopup()?.getElement();
          if (!container) return;

          container.querySelector('[data-action="validate"]')?.addEventListener('click', () => {
            if (report.user_id === mockUser.id) {
              toast.error(t('report.ownReport'));
              return;
            }
            if (validatedIds.has(report.id)) {
              toast.info(t('report.alreadyValidated'));
              return;
            }
            setValidatedIds(prev => new Set(prev).add(report.id));
            setReports(prev => prev.map(r =>
              r.id === report.id ? { ...r, validation_count: r.validation_count + 1 } : r
            ));
            toast.success(t('report.confirmed'));
            marker.closePopup();
          });

          container.querySelector('[data-action="share"]')?.addEventListener('click', () => {
            shareToWhatsApp(report, score);
          });
        }, 10);
      });

      markersLayerRef.current!.addLayer(marker);

      // Heatmap circle
      const heatCircle = L.circle([report.lat, report.lng], {
        radius: 800,
        color,
        fillColor: color,
        fillOpacity: 0.15,
        opacity: 0,
        weight: 0
      });
      heatmapLayerRef.current!.addLayer(heatCircle);
    });
  }, [scoredReports, t, validatedIds]);

  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  // Toggle heatmap
  useEffect(() => {
    if (!mapRef.current || !heatmapLayerRef.current) return;
    if (heatmapVisible) {
      mapRef.current.addLayer(heatmapLayerRef.current);
    } else {
      mapRef.current.removeLayer(heatmapLayerRef.current);
    }
  }, [heatmapVisible]);

  // Recalculate every 5 min
  useEffect(() => {
    const interval = setInterval(() => {
      setReports(prev => [...prev]);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const shareToWhatsApp = (report: any, score: number) => {
    const level = score > 60 ? 'PELIGRO ALTO' : score > 40 ? 'Precaución' : 'Zona segura';
    const emoji = score > 60 ? '🔴' : score > 40 ? '🟡' : '🟢';
    const msg = `${emoji} ${level}: Procesionaria detectada en ${report.comarca}, Cataluña. Cuidado con mascotas y niños. Ver en ProcesoAlert: procesoalert.es/r/${report.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleActivateLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapRef.current) {
          if (userMarkerRef.current) mapRef.current.removeLayer(userMarkerRef.current);
          userMarkerRef.current = L.circleMarker([latitude, longitude], {
            radius: 8,
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 1,
            weight: 3,
            opacity: 0.5
          }).addTo(mapRef.current);
          mapRef.current.setView([latitude, longitude], 13);
        }
        setShowLocationModal(false);
        localStorage.setItem('location_asked', 'true');
      },
      () => {
        toast.error(t('errors.location'));
        setShowLocationModal(false);
        localStorage.setItem('location_asked', 'true');
      }
    );
  };

  const handleGetLocationForReport = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setSelectedCoords([pos.coords.latitude, pos.coords.longitude]),
      () => toast.error(t('errors.location'))
    );
  };

  const handleSubmitReport = () => {
    if (!selectedCoords) return;
    const newReport = {
      id: `r${Date.now()}`,
      user_id: mockUser.id,
      lat: selectedCoords[0],
      lng: selectedCoords[1],
      description: reportDescription,
      status: 'ACTIVE' as const,
      danger_score: 50,
      validation_count: 0,
      photos: [] as string[],
      comarca: 'Barcelonès',
      created_at: new Date().toISOString()
    };
    setReports(prev => [...prev, newReport]);
    setShowNewReport(false);
    setReportStep(1);
    setSelectedCoords(null);
    setReportDescription('');
    setReportPhotos([]);
    toast.success(t('report.published') + ' 🎉');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReportPhotos(prev => [...prev, ...files].slice(0, 2));
  };

  const activeCount = reports.filter(r => r.status === 'ACTIVE').length;

  const legendItems = [
    { color: '#22c55e', label: lang === 'ca' ? 'Sense perill (0-20)' : 'Sin peligro (0-20)' },
    { color: '#eab308', label: lang === 'ca' ? 'Precaució (21-40)' : 'Precaución (21-40)' },
    { color: '#f97316', label: lang === 'ca' ? 'Perill moderat (41-60)' : 'Peligro moderado (41-60)' },
    { color: '#ef4444', label: lang === 'ca' ? 'Perill alt (61-80)' : 'Peligro alto (61-80)' },
    { color: '#a855f7', label: lang === 'ca' ? 'Perill crític (81-100)' : 'Peligro crítico (81-100)' },
  ];

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 64px)' }}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* TOP LEFT: Active count + filter */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        <div className="bg-card/95 backdrop-blur-sm shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          🗺️ {t('map.activeReports', { count: activeCount })}
        </div>
        <Button variant="outline" size="sm" className="bg-card/95 backdrop-blur-sm shadow-lg gap-1">
          <Filter className="h-3.5 w-3.5" />
          {t('map.filter')}
        </Button>
      </div>

      {/* TOP RIGHT: Heatmap toggle + safe walk */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setHeatmapVisible(v => !v)}
          className={`px-3 py-2 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm transition-colors ${
            heatmapVisible
              ? 'bg-primary text-primary-foreground'
              : 'bg-card/95 text-foreground'
          }`}
        >
          {heatmapVisible ? '🔥' : '○'} {t('map.heatLayer')}
        </button>
        <button
          onClick={() => toast.info(mockUser.plan === 'familiar'
            ? (lang === 'ca' ? 'Funció pròximament' : 'Función próximamente')
            : t('subscription.upgradePrompt')
          )}
          className="px-3 py-2 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm bg-primary text-primary-foreground"
        >
          🛡️ {t('map.safeWalk')}
        </button>
      </div>

      {/* BOTTOM LEFT: Legend */}
      <div className="absolute bottom-4 left-3 z-[1000] bg-card/95 backdrop-blur-sm shadow-lg rounded-xl p-2.5 hidden sm:block">
        <p className="text-[11px] text-muted-foreground font-medium mb-1">
          {lang === 'ca' ? 'Nivells de perill' : 'Niveles de peligro'}
        </p>
        {legendItems.map(item => (
          <div key={item.color} className="flex items-center gap-1.5 py-0.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
            <span className="text-[11px] text-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      {/* BOTTOM RIGHT: FAB add report */}
      <button
        onClick={() => setShowNewReport(true)}
        className="absolute bottom-20 right-4 z-[1000] w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* GEOLOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">📍</div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              {lang === 'ca' ? 'Activa la teva ubicació' : 'Activa tu ubicación'}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {lang === 'ca'
                ? `ProcesoAlert necessita la teva ubicació per mostrar-te alertes properes i calcular rutes segures per passejar amb ${mockUser.pet_name}.`
                : `ProcesoAlert necesita tu ubicación para mostrarte alertas cercanas y calcular rutas seguras para pasear con ${mockUser.pet_name}.`
              }
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={handleActivateLocation} className="w-full">
                {lang === 'ca' ? 'Activar ubicació' : 'Activar ubicación'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setShowLocationModal(false); localStorage.setItem('location_asked', 'true'); }}
                className="w-full text-muted-foreground"
              >
                {lang === 'ca' ? 'Ara no' : 'Ahora no'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* NEW REPORT BOTTOM SHEET */}
      {showNewReport && (
        <div className="fixed inset-0 z-[2000]">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowNewReport(false); setReportStep(1); setSelectedCoords(null); setReportDescription(''); setReportPhotos([]); }} />
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[20px] shadow-2xl" style={{ height: '60vh' }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-5 pb-5 h-full overflow-y-auto">
              {/* Close */}
              <button onClick={() => { setShowNewReport(false); setReportStep(1); setSelectedCoords(null); setReportDescription(''); setReportPhotos([]); }} className="absolute top-4 right-4 text-muted-foreground">
                <X className="h-5 w-5" />
              </button>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-4 mt-1">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`h-1 flex-1 rounded-full ${s <= reportStep ? 'bg-primary' : 'bg-muted'}`} />
                ))}
              </div>

              {reportStep === 1 && (
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">📍 {lang === 'ca' ? 'Pas 1: Ubicació' : 'Paso 1: Ubicación'}</h3>
                  <Button onClick={handleGetLocationForReport} className="w-full mb-3 gap-2">
                    <MapPin className="h-4 w-4" />
                    {t('report.useLocation')}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground mb-3">
                    {lang === 'ca' ? 'O toca el mapa per seleccionar ubicació' : 'O toca el mapa para seleccionar ubicación'}
                  </p>
                  <Button variant="outline" className="w-full mb-4" onClick={() => { setMapClickMode(true); setShowNewReport(false); toast.info(lang === 'ca' ? 'Toca el mapa per seleccionar' : 'Toca el mapa para seleccionar'); }}>
                    🗺️ {lang === 'ca' ? 'Seleccionar al mapa' : 'Seleccionar en el mapa'}
                  </Button>
                  {selectedCoords && (
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-700 dark:text-green-300 mb-4">
                      ✅ {lang === 'ca' ? 'Ubicació capturada' : 'Ubicación capturada'}: {selectedCoords[0].toFixed(2)}°, {selectedCoords[1].toFixed(2)}°
                    </div>
                  )}
                  <Button onClick={() => setReportStep(2)} disabled={!selectedCoords} className="w-full gap-1">
                    {lang === 'ca' ? 'Següent' : 'Siguiente'} <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {reportStep === 2 && (
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">📝 {lang === 'ca' ? 'Pas 2: Detalls' : 'Paso 2: Detalles'}</h3>
                  <Textarea
                    rows={4}
                    maxLength={500}
                    placeholder={t('report.placeholder')}
                    value={reportDescription}
                    onChange={e => setReportDescription(e.target.value)}
                    className="mb-1"
                  />
                  <p className="text-xs text-muted-foreground text-right mb-4">{reportDescription.length}/500</p>

                  <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center mb-4">
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                      <Camera className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">📷 {t('report.addPhoto')} (máx. 2)</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
                    </label>
                    {reportPhotos.length > 0 && (
                      <div className="flex gap-2 mt-3 justify-center">
                        {reportPhotos.map((f, i) => (
                          <div key={i} className="relative">
                            <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 object-cover rounded-lg" />
                            <button
                              onClick={() => setReportPhotos(prev => prev.filter((_, j) => j !== i))}
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center"
                            >×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setReportStep(1)} className="flex-1 gap-1">
                      <ChevronLeft className="h-4 w-4" /> {lang === 'ca' ? 'Anterior' : 'Anterior'}
                    </Button>
                    <Button onClick={() => setReportStep(3)} disabled={reportDescription.length < 10} className="flex-1 gap-1">
                      {lang === 'ca' ? 'Següent' : 'Siguiente'} <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {reportStep === 3 && (
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">✅ {lang === 'ca' ? 'Pas 3: Confirmar' : 'Paso 3: Confirmar'}</h3>
                  <div className="bg-muted rounded-xl p-4 mb-4 space-y-2 text-sm text-foreground">
                    <p>📍 {lang === 'ca' ? 'Ubicació' : 'Ubicación'}: {selectedCoords?.[0].toFixed(4)}, {selectedCoords?.[1].toFixed(4)}</p>
                    <p>📝 {reportDescription.length > 100 ? reportDescription.slice(0, 100) + '...' : reportDescription}</p>
                    <p>📷 {reportPhotos.length} {lang === 'ca' ? 'fotos adjuntes' : 'fotos adjuntas'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setReportStep(2)} className="flex-1 gap-1">
                      <ChevronLeft className="h-4 w-4" /> {lang === 'ca' ? 'Anterior' : 'Anterior'}
                    </Button>
                    <Button onClick={handleSubmitReport} className="flex-1">
                      {t('report.submit')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map click mode indicator */}
      {mapClickMode && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-card/95 backdrop-blur-sm shadow-lg rounded-xl px-4 py-3 text-sm font-medium text-foreground pointer-events-none animate-pulse">
          📍 {lang === 'ca' ? 'Toca el mapa per seleccionar ubicació' : 'Toca el mapa para seleccionar ubicación'}
        </div>
      )}
    </div>
  );
};

export default MapPage;
