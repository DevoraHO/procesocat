import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockReports, mockUser, ALERT_TYPES, type AlertTypeKey } from '@/data/mockData';
import { calculateDangerScore, getDangerColor, getDangerLevel } from '@/utils/dangerScore';
import { createAlertMarker } from '@/utils/mapMarkers';
import { updateLifecycle, resetToActive, LIFECYCLE, getReportAge } from '@/utils/reportLifecycle';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Filter, Plus, X, ChevronLeft, ChevronRight, MapPin, Camera, Lock, Shield, Search, Trash2, RotateCcw } from 'lucide-react';
import { useFreemium } from '@/hooks/useFreemium';
import UpgradeModal from '@/components/UpgradeModal';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ReportWithScore {
  report: typeof mockReports[0] & { last_activity_at?: string };
  score: number;
}

const MapPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  const [reports, setReports] = useState(() =>
    updateLifecycle(mockReports.map(r => ({ ...r, validation_count: r.validation_count })))
  );
  const [showSeasonBanner, setShowSeasonBanner] = useState(!localStorage.getItem('annual_reset_shown'));
  const [nearbyDecay, setNearbyDecay] = useState<typeof reports[0] | null>(null);
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
  const [selectedAlertType, setSelectedAlertType] = useState<AlertTypeKey | null>(null);
  const { isFree, canReport, reportsRemaining, incrementReportCount, upgradeOpen, upgradeTrigger, showUpgrade, closeUpgrade } = useFreemium();

  // Filter state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterTypes, setFilterTypes] = useState<Record<AlertTypeKey, boolean>>({ procesionaria: true, veneno: true, trampa: true, basura: true });
  const [filterDanger, setFilterDanger] = useState<Record<string, boolean>>({ green: true, yellow: true, orange: true, red: true, purple: true });
  const [filterTime, setFilterTime] = useState<'48h' | 'week' | 'month' | 'all'>('all');
  const activeFilterCount = Object.values(filterTypes).filter(v => !v).length + Object.values(filterDanger).filter(v => !v).length + (filterTime !== 'all' ? 1 : 0);

  // Legend state
  const [legendTab, setLegendTab] = useState<'types' | 'danger'>('types');

  // Safe walk state
  const [safeWalkMode, setSafeWalkMode] = useState(false);
  const [safeWalkPoints, setSafeWalkPoints] = useState<[number, number][]>([]);
  const [safeWalkAnalyzing, setSafeWalkAnalyzing] = useState(false);
  const [safeWalkResult, setSafeWalkResult] = useState<any>(null);
  const [showSafeWalkUpgrade, setShowSafeWalkUpgrade] = useState(false);
  const safeWalkMarkersRef = useRef<L.LayerGroup | null>(null);
  const safeWalkLineRef = useRef<L.Polyline | null>(null);
  const safeWalkResultLinesRef = useRef<L.LayerGroup | null>(null);

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
    safeWalkMarkersRef.current = L.layerGroup().addTo(map);
    safeWalkResultLinesRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    if (!localStorage.getItem('location_asked')) {
      setShowLocationModal(true);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle map click for report placement OR safe walk
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let longPressTimer: ReturnType<typeof setTimeout> | null = null;
    let longPressCoords: [number, number] | null = null;

    const clickHandler = (e: L.LeafletMouseEvent) => {
      if (safeWalkMode) {
        const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
        setSafeWalkPoints(prev => [...prev, newPoint]);
      } else if (mapClickMode) {
        setSelectedCoords([e.latlng.lat, e.latlng.lng]);
        setMapClickMode(false);
        setShowNewReport(true);
        setReportStep(2);
        toast.success('📍 ' + t('map.locationCaptured'));
      }
    };

    const mouseDownHandler = (e: L.LeafletMouseEvent) => {
      if (safeWalkMode || mapClickMode) return;
      longPressCoords = [e.latlng.lat, e.latlng.lng];
      longPressTimer = setTimeout(() => {
        if (longPressCoords) {
          setSelectedCoords(longPressCoords);
          setSelectedAlertType(null);
          setReportStep(1);
          setShowNewReport(true);
          toast.info('📍 ' + t('map.locationCaptured'));
        }
      }, 800);
    };

    const mouseUpHandler = () => {
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    };

    map.on('click', clickHandler);
    map.on('mousedown', mouseDownHandler);
    map.on('mouseup', mouseUpHandler);
    map.on('mousemove', mouseUpHandler);
    return () => {
      map.off('click', clickHandler);
      map.off('mousedown', mouseDownHandler);
      map.off('mouseup', mouseUpHandler);
      map.off('mousemove', mouseUpHandler);
    };
  }, [mapClickMode, safeWalkMode, t]);

  // Render safe walk markers and lines
  useEffect(() => {
    if (!safeWalkMarkersRef.current || !mapRef.current) return;
    safeWalkMarkersRef.current.clearLayers();
    if (safeWalkLineRef.current) {
      mapRef.current.removeLayer(safeWalkLineRef.current);
      safeWalkLineRef.current = null;
    }

    safeWalkPoints.forEach((pt, i) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;border-radius:50%;background:white;border:3px solid hsl(var(--primary));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:hsl(var(--primary));box-shadow:0 2px 6px rgba(0,0,0,0.2)">${i + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const marker = L.marker(pt, { icon });
      marker.bindPopup(`<div style="font-size:12px;text-align:center">${t('safeWalk.point', { n: i + 1 })}<br><button data-sw-remove="${i}" style="color:#ef4444;font-size:11px;cursor:pointer;border:none;background:none;text-decoration:underline">${t('safeWalk.removePoint')}</button></div>`);
      marker.on('popupopen', () => {
        setTimeout(() => {
          const el = marker.getPopup()?.getElement();
          el?.querySelector(`[data-sw-remove="${i}"]`)?.addEventListener('click', () => {
            setSafeWalkPoints(prev => prev.filter((_, j) => j !== i));
            marker.closePopup();
          });
        }, 10);
      });
      safeWalkMarkersRef.current!.addLayer(marker);
    });

    if (safeWalkPoints.length >= 2 && !safeWalkResult) {
      safeWalkLineRef.current = L.polyline(safeWalkPoints, {
        color: '#94a3b8',
        weight: 3,
        dashArray: '8, 8',
        opacity: 0.7,
      }).addTo(mapRef.current);
    }
  }, [safeWalkPoints, safeWalkResult, t]);

  // Filter logic
  const getFilteredReports = useCallback(() => {
    const now = Date.now();
    return scoredReports.filter(({ report, score }) => {
      // Alert type filter
      const alertType = (report as any).alert_type as AlertTypeKey | undefined;
      if (alertType && !filterTypes[alertType]) return false;

      // Danger level filter
      const level = getDangerLevel(score);
      if (!filterDanger[level]) return false;

      // Time filter
      const age = (now - new Date(report.created_at).getTime()) / (1000 * 60 * 60);
      if (filterTime === '48h' && age > 48) return false;
      if (filterTime === 'week' && age > 168) return false;
      if (filterTime === 'month' && age > 720) return false;

      return true;
    });
  }, [scoredReports, filterTypes, filterDanger, filterTime]);

  // Render markers & heatmap
  const renderMarkers = useCallback(() => {
    if (!markersLayerRef.current || !heatmapLayerRef.current) return;
    markersLayerRef.current.clearLayers();
    heatmapLayerRef.current.clearLayers();

    const filtered = getFilteredReports();

    filtered.forEach(({ report, score }) => {
      const dangerColor = getDangerColor(score);
      const level = getDangerLevel(score);
      const daysAgo = Math.floor((Date.now() - new Date(report.created_at).getTime()) / 86400000);
      const desc = report.description.length > 80 ? report.description.slice(0, 80) + '...' : report.description;
      const levelName = t(`danger.${level}`);

      if (report.status === LIFECYCLE.ARCHIVED || report.status === LIFECYCLE.INACTIVE) return;

      // Use alert type color for marker
      const alertType = (report as any).alert_type as AlertTypeKey | undefined;
      const alertInfo = alertType ? ALERT_TYPES[alertType] : null;
      const markerColor = alertInfo ? alertInfo.color : dangerColor;
      const alertName = alertInfo ? (lang === 'ca' ? alertInfo.name_ca : alertInfo.name_es) : '';
      const alertIcon = alertInfo ? alertInfo.icon : '';
      const firstAid = alertInfo ? (lang === 'ca' ? alertInfo.first_aid_ca : alertInfo.first_aid_es) : '';

      const markerIcon = createAlertMarker(alertType || 'procesionaria', score, report.status);

      const marker = L.marker([report.lat, report.lng], { icon: markerIcon });

      const decayDays = Math.floor(getReportAge(report.created_at));
      const decayBar = report.status === LIFECYCLE.DECAYING ? `
        <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;padding:6px 8px;margin:0 0 8px;font-size:11px;color:#92400e">
          ⏰ ${t('map.decayWarning', { days: decayDays })}
        </div>
        <div style="display:flex;gap:4px;margin-bottom:8px">
          <button data-action="reactivate" data-id="${report.id}" style="flex:1;padding:5px 0;border:none;border-radius:6px;background:#2D6A4F;color:#fff;font-size:11px;cursor:pointer">✅ ${t('map.confirmStillActive')}</button>
          <button data-action="resolve" data-id="${report.id}" style="flex:1;padding:5px 0;border:1px solid #999;border-radius:6px;background:#fff;color:#333;font-size:11px;cursor:pointer">❌ ${t('map.confirmGone')}</button>
        </div>
      ` : '';

      const alertTypeHeader = alertInfo ? `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;padding:4px 8px;border-radius:6px;background:${alertInfo.color_light}">
          <span style="font-size:18px">${alertIcon}</span>
          <span style="font-size:12px;font-weight:600;color:${alertInfo.color}">${alertName}</span>
        </div>
      ` : '';

      const firstAidSection = firstAid ? `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:6px 8px;margin:0 0 8px;font-size:11px;color:#991b1b">
          🚨 ${firstAid}
        </div>
      ` : '';

      const popupContent = `
        <div style="min-width:220px;font-family:system-ui,sans-serif">
          ${alertTypeHeader}
          ${decayBar}
          <p style="margin:0 0 8px;font-size:13px;color:#333;line-height:1.4">${desc}</p>
          ${firstAidSection}
          <div style="margin-bottom:8px">
            <span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;color:#fff;background:${dangerColor}">${score} — ${levelName}</span>
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

          container.querySelector('[data-action="reactivate"]')?.addEventListener('click', () => {
            setReports(prev => prev.map(r =>
              r.id === report.id ? resetToActive(r) : r
            ));
            toast.success(t('map.reactivated'));
            marker.closePopup();
          });

          container.querySelector('[data-action="resolve"]')?.addEventListener('click', () => {
            setReports(prev => prev.filter(r => r.id !== report.id));
            toast.success(t('map.resolved'));
            marker.closePopup();
          });
        }, 10);
      });

      markersLayerRef.current!.addLayer(marker);

      const heatCircle = L.circle([report.lat, report.lng], {
        radius: 800,
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.15,
        opacity: 0,
        weight: 0
      });
      heatmapLayerRef.current!.addLayer(heatCircle);
    });
  }, [scoredReports, t, validatedIds, getFilteredReports, lang]);

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
      setReports(prev => updateLifecycle([...prev]));
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate nearby decay detection
  useEffect(() => {
    const dismissed = localStorage.getItem('decay_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 86400000) return;
    const decaying = reports.find(r => r.status === LIFECYCLE.DECAYING);
    if (decaying) {
      const timer = setTimeout(() => setNearbyDecay(decaying), 5000);
      return () => clearTimeout(timer);
    }
  }, [reports]);

  const shareToWhatsApp = (report: any, score: number) => {
    const level = score > 60 ? t('map.dangerHigh') : score > 40 ? t('map.caution') : t('map.safeZone');
    const emoji = score > 60 ? '🔴' : score > 40 ? '🟡' : '🟢';
    const msg = `${emoji} ${level}: ${t('map.whatsappMsg', { comarca: report.comarca, id: report.id })}`;
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
    if (!selectedCoords || !selectedAlertType) return;
    if (isFree && !canReport) {
      showUpgrade('reports');
      return;
    }
    const newReport = {
      id: `r${Date.now()}`,
      user_id: mockUser.id,
      lat: selectedCoords[0],
      lng: selectedCoords[1],
      description: reportDescription,
      status: 'ACTIVE' as const,
      danger_score: selectedAlertType === 'veneno' ? 85 : selectedAlertType === 'trampa' ? 65 : selectedAlertType === 'basura' ? 35 : 50,
      validation_count: 0,
      photos: [] as string[],
      comarca: 'Barcelonès',
      alert_type: selectedAlertType,
      created_at: new Date().toISOString()
    };
    setReports(prev => [...prev, newReport]);
    incrementReportCount();
    setShowNewReport(false);
    setReportStep(1);
    setSelectedCoords(null);
    setReportDescription('');
    setReportPhotos([]);
    setSelectedAlertType(null);
    const typeToasts: Record<string, string> = {
      procesionaria: '🐛 ' + t('report.publishedType.procesionaria'),
      veneno: '☠️ ' + t('report.publishedType.veneno'),
      trampa: '🪤 ' + t('report.publishedType.trampa'),
      basura: '🗑️ ' + t('report.publishedType.basura'),
    };
    toast.success(typeToasts[selectedAlertType!] || t('report.published') + ' 🎉');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReportPhotos(prev => [...prev, ...files].slice(0, 2));
  };

  // Safe walk functions
  const handleSafeWalkClick = () => {
    if (isFree) {
      setShowSafeWalkUpgrade(true);
    } else {
      setSafeWalkMode(true);
      setSafeWalkPoints([]);
      setSafeWalkResult(null);
      if (safeWalkResultLinesRef.current) safeWalkResultLinesRef.current.clearLayers();
    }
  };

  const handleClearRoute = () => {
    setSafeWalkPoints([]);
    setSafeWalkResult(null);
    if (safeWalkResultLinesRef.current) safeWalkResultLinesRef.current.clearLayers();
  };

  const handleCancelSafeWalk = () => {
    setSafeWalkMode(false);
    handleClearRoute();
    if (safeWalkMarkersRef.current) safeWalkMarkersRef.current.clearLayers();
  };

  const handleAnalyzeRoute = () => {
    setSafeWalkAnalyzing(true);
    setTimeout(() => {
      const segments: any[] = [];
      let totalDistance = 0;
      let safeDistance = 0;
      const riskyZones: any[] = [];

      for (let i = 0; i < safeWalkPoints.length - 1; i++) {
        const p1 = safeWalkPoints[i];
        const p2 = safeWalkPoints[i + 1];
        const midLat = (p1[0] + p2[0]) / 2;
        const midLng = (p1[1] + p2[1]) / 2;
        const segDist = Math.sqrt(Math.pow((p2[0] - p1[0]) * 111, 2) + Math.pow((p2[1] - p1[1]) * 111 * Math.cos(p1[0] * Math.PI / 180), 2));
        totalDistance += segDist;

        let maxDanger = 0;
        let nearReport: any = null;
        scoredReports.forEach(({ report, score }) => {
          const dist = Math.sqrt(Math.pow((midLat - report.lat) * 111, 2) + Math.pow((midLng - report.lng) * 111 * Math.cos(midLat * Math.PI / 180), 2));
          if (dist < 1.5 && score > maxDanger) {
            maxDanger = score;
            nearReport = { ...report, score };
          }
        });

        const segColor = maxDanger > 60 ? '#ef4444' : maxDanger > 30 ? '#f97316' : '#22c55e';
        const segLevel = maxDanger > 60 ? 'red' : maxDanger > 30 ? 'orange' : 'green';
        segments.push({ from: p1, to: p2, color: segColor, level: segLevel, distance: segDist, danger: maxDanger });

        if (segLevel === 'green') safeDistance += segDist;
        if (maxDanger > 30 && nearReport) {
          const daysAgo = Math.floor((Date.now() - new Date(nearReport.created_at).getTime()) / 86400000);
          riskyZones.push({
            segment: i + 1,
            distance: (totalDistance - segDist).toFixed(0),
            report: nearReport,
            daysAgo,
            level: segLevel,
          });
        }
      }

      const safePercent = totalDistance > 0 ? Math.round((safeDistance / totalDistance) * 100) : 100;
      const overallLevel = riskyZones.some(z => z.level === 'red') ? 'PELIGROSA' : riskyZones.length > 0 ? 'PRECAUCIÓN' : 'SEGURA';

      if (safeWalkResultLinesRef.current && mapRef.current) {
        safeWalkResultLinesRef.current.clearLayers();
        segments.forEach(seg => {
          const line = L.polyline([seg.from, seg.to], {
            color: seg.color,
            weight: 5,
            opacity: 0.9,
          });
          safeWalkResultLinesRef.current!.addLayer(line);
        });
      }

      if (safeWalkLineRef.current && mapRef.current) {
        mapRef.current.removeLayer(safeWalkLineRef.current);
        safeWalkLineRef.current = null;
      }

      setSafeWalkResult({
        segments,
        totalDistance: totalDistance.toFixed(1),
        safePercent,
        riskyZones,
        overallLevel,
      });
      setSafeWalkAnalyzing(false);
    }, 1500);
  };

  const handleShareRoute = () => {
    if (!safeWalkResult) return;
    const levelText = safeWalkResult.overallLevel === 'SEGURA' ? t('safeWalk.resultSafe') : safeWalkResult.overallLevel === 'PRECAUCIÓN' ? t('safeWalk.resultCaution') : t('safeWalk.resultDangerous');
    const msg = `🛡️ ${t('safeWalk.shareMsg', { level: levelText, percent: safeWalkResult.safePercent, pet: mockUser.pet_name })}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleApplyFilters = () => {
    setShowFilterPanel(false);
    renderMarkers();
  };

  const handleResetFilters = () => {
    setFilterTypes({ procesionaria: true, veneno: true, trampa: true, basura: true });
    setFilterDanger({ green: true, yellow: true, orange: true, red: true, purple: true });
    setFilterTime('all');
  };

  const activeCount = getFilteredReports().filter(({ report }) => report.status === 'ACTIVE').length;

  const legendDangerItems = [
    { color: '#22c55e', level: 'green', range: '0-20' },
    { color: '#eab308', level: 'yellow', range: '21-40' },
    { color: '#f97316', level: 'orange', range: '41-60' },
    { color: '#ef4444', level: 'red', range: '61-80' },
    { color: '#a855f7', level: 'purple', range: '81-100' },
  ];

  const alertTypeKeys: AlertTypeKey[] = ['procesionaria', 'veneno', 'trampa', 'basura'];

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 64px)' }}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Season banner */}
      {showSeasonBanner && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1001] bg-amber-50 border border-amber-300 rounded-xl px-4 py-2.5 shadow-lg max-w-sm w-[90%] flex items-center gap-3">
          <span className="text-sm text-amber-900">🍂 {t('map.newSeason', { year: new Date().getFullYear() })}</span>
          <button onClick={() => { setShowSeasonBanner(false); localStorage.setItem('annual_reset_shown', 'true'); }} className="text-xs font-medium text-amber-700 whitespace-nowrap">{t('map.understood')}</button>
        </div>
      )}

      {/* Safe walk instruction banner */}
      {safeWalkMode && !safeWalkResult && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1001] bg-blue-600 text-white rounded-xl px-4 py-3 shadow-lg max-w-md w-[94%] animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
            </span>
            <span className="text-sm font-medium">{t('safeWalk.tapToMark')}</span>
          </div>
          <p className="text-xs opacity-80">
            {safeWalkPoints.length < 2
              ? t('safeWalk.pointsNeeded', { count: safeWalkPoints.length })
              : t('safeWalk.pointsReady', { count: safeWalkPoints.length })}
          </p>
          <div className="flex gap-2 mt-2">
            <button onClick={handleClearRoute} className="text-xs bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 flex items-center gap-1 transition">
              <Trash2 className="h-3 w-3" /> {t('safeWalk.clear')}
            </button>
            <button onClick={handleCancelSafeWalk} className="text-xs bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 flex items-center gap-1 transition">
              <X className="h-3 w-3" /> {t('safeWalk.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Nearby decay banner */}
      {nearbyDecay && !safeWalkMode && (
        <div className="absolute bottom-24 left-3 right-16 z-[1001] bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 text-sm">
          <span className="text-amber-900 flex-1">{t('map.nearbyDecay', { days: Math.floor(getReportAge(nearbyDecay.created_at)) })}</span>
          <button onClick={() => { setReports(prev => prev.map(r => r.id === nearbyDecay.id ? resetToActive(r) : r)); setNearbyDecay(null); toast.success(t('map.reactivated')); }} className="text-xs font-bold text-green-700">Sí</button>
          <button onClick={() => { setReports(prev => prev.filter(r => r.id !== nearbyDecay.id)); setNearbyDecay(null); toast.success(t('map.resolved')); }} className="text-xs font-bold text-red-700">No</button>
          <button onClick={() => { setNearbyDecay(null); localStorage.setItem('decay_dismissed', Date.now().toString()); }} className="text-muted-foreground">×</button>
        </div>
      )}

      {/* TOP LEFT: Active count + filter */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        <div className="bg-card/95 backdrop-blur-sm shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          🗺️ {t('map.activeReports', { count: activeCount })}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-card/95 backdrop-blur-sm shadow-lg gap-1"
          onClick={() => setShowFilterPanel(!showFilterPanel)}
        >
          <Filter className="h-3.5 w-3.5" />
          {t('map.filter')}{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
      </div>

      {/* FILTER PANEL */}
      {showFilterPanel && (
        <div className="absolute top-[90px] left-3 z-[1001] bg-card/95 backdrop-blur-sm shadow-xl rounded-xl p-4 w-[280px] animate-fade-in space-y-4">
          <h3 className="font-semibold text-foreground text-sm">{t('alertTypes.filterAlerts')}</h3>

          {/* Alert type checkboxes */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">{t('alertTypes.alertType')}</p>
            {alertTypeKeys.map(key => {
              const at = ALERT_TYPES[key];
              return (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                  <Checkbox
                    checked={filterTypes[key]}
                    onCheckedChange={(v) => setFilterTypes(prev => ({ ...prev, [key]: !!v }))}
                  />
                  <span>{at.icon} {lang === 'ca' ? at.name_ca : at.name_es}</span>
                </label>
              );
            })}
          </div>

          {/* Danger level checkboxes */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">{t('alertTypes.dangerLevel')}</p>
            {[
              { key: 'green', emoji: '🟢' },
              { key: 'yellow', emoji: '🟡' },
              { key: 'orange', emoji: '🟠' },
              { key: 'red', emoji: '🔴' },
              { key: 'purple', emoji: '🟣' },
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                <Checkbox
                  checked={filterDanger[item.key]}
                  onCheckedChange={(v) => setFilterDanger(prev => ({ ...prev, [item.key]: !!v }))}
                />
                <span>{item.emoji} {t(`danger.${item.key}`)}</span>
              </label>
            ))}
          </div>

          {/* Time filter */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">{t('alertTypes.timeRange')}</p>
            <div className="flex flex-wrap gap-1">
              {(['48h', 'week', 'month', 'all'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setFilterTime(v)}
                  className={`text-xs px-2.5 py-1 rounded-full transition ${filterTime === v ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  {t(`alertTypes.${v === '48h' ? 'last48h' : v === 'week' ? 'lastWeek' : v === 'month' ? 'lastMonth' : 'allTime'}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleApplyFilters} className="flex-1">{t('alertTypes.applyFilters')}</Button>
            <button onClick={handleResetFilters} className="text-xs text-muted-foreground hover:text-foreground">{t('alertTypes.resetFilters')}</button>
          </div>
        </div>
      )}

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
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleSafeWalkClick}
              className={`px-3 py-2 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm flex items-center gap-1.5 transition-colors ${
                safeWalkMode ? 'bg-blue-600 text-white' : isFree ? 'bg-card/95 text-muted-foreground' : 'bg-primary text-primary-foreground'
              }`}
            >
              🛡️ {t('map.safeWalk')}
              {isFree && <Lock className="h-3 w-3" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[220px] text-xs">
            {t('safeWalk.tooltip')}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Analyze route button */}
      {safeWalkMode && safeWalkPoints.length >= 2 && !safeWalkResult && !safeWalkAnalyzing && (
        <div className="absolute bottom-32 right-4 z-[1001] animate-scale-in">
          <button
            onClick={handleAnalyzeRoute}
            className="bg-primary text-primary-foreground px-4 py-2.5 rounded-full shadow-xl text-sm font-semibold flex items-center gap-2 animate-bounce"
            style={{ animationDuration: '2s' }}
          >
            <Search className="h-4 w-4" />
            {t('safeWalk.analyze', { n: safeWalkPoints.length })}
          </button>
        </div>
      )}

      {/* Analyzing spinner */}
      {safeWalkAnalyzing && (
        <div className="absolute bottom-32 right-4 z-[1001]">
          <div className="bg-card/95 backdrop-blur-sm text-foreground px-4 py-2.5 rounded-full shadow-xl text-sm font-medium flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {t('safeWalk.analyzing')}
          </div>
        </div>
      )}

      {/* BOTTOM LEFT: Legend with tabs */}
      <div className="absolute bottom-4 left-3 z-[1000] bg-card/95 backdrop-blur-sm shadow-lg rounded-xl p-2.5 hidden sm:block">
        <div className="flex gap-1 mb-1">
          <button onClick={() => setLegendTab('types')} className={`text-[10px] px-2 py-0.5 rounded-full transition ${legendTab === 'types' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {t('alertTypes.alertType')}
          </button>
          <button onClick={() => setLegendTab('danger')} className={`text-[10px] px-2 py-0.5 rounded-full transition ${legendTab === 'danger' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {t('alertTypes.dangerLevel')}
          </button>
        </div>
        {legendTab === 'types' ? (
          <>
            {[
              { key: 'procesionaria', shape: '●', color: '#a855f7' },
              { key: 'veneno', shape: '▲', color: '#ef4444' },
              { key: 'trampa', shape: '■', color: '#f97316' },
              { key: 'basura', shape: '◆', color: '#eab308' },
            ].map(item => (
              <div key={item.key} className="flex items-center gap-1.5 py-0.5">
                <span className="text-xs font-bold" style={{ color: item.color }}>{item.shape}</span>
                <span className="text-[11px] text-foreground">{lang === 'ca' ? ALERT_TYPES[item.key as AlertTypeKey].name_ca : ALERT_TYPES[item.key as AlertTypeKey].name_es}</span>
              </div>
            ))}
            <p className="text-[9px] text-muted-foreground mt-1">{lang === 'ca' ? 'Mida = nivell de perill' : 'Tamaño = nivel de peligro'}</p>
          </>
        ) : (
          <>
            {legendDangerItems.map(item => (
              <div key={item.color} className="flex items-center gap-1.5 py-0.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-[11px] text-foreground">{t(`danger.${item.level}`)} ({item.range})</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* BOTTOM RIGHT: FAB add report */}
      {!safeWalkMode && (
        <div className="absolute bottom-20 right-4 z-[1000] flex flex-col items-center gap-1">
          {isFree && (
            <span className="text-[10px] font-medium text-muted-foreground bg-card/90 backdrop-blur-sm rounded-full px-2 py-0.5 shadow">
              {canReport ? t('map.reportLimit', { count: reportsRemaining }) : t('map.reportLimitReached')}
            </span>
          )}
          <button
            onClick={() => {
              if (isFree && !canReport) {
                showUpgrade('reports');
              } else {
                setShowNewReport(true);
              }
            }}
            className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-opacity ${
              isFree && !canReport ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            <Plus className="h-7 w-7" />
          </button>
        </div>
      )}

      {/* SAFE WALK RESULTS CARD */}
      {safeWalkResult && (
        <div className="fixed inset-x-0 bottom-0 z-[2000] animate-slide-in-bottom">
          <div className="bg-card rounded-t-[20px] shadow-2xl max-h-[70vh] overflow-y-auto">
            <div className={`rounded-t-[20px] px-5 py-4 text-white ${
              safeWalkResult.overallLevel === 'SEGURA' ? 'bg-primary' :
              safeWalkResult.overallLevel === 'PRECAUCIÓN' ? 'bg-orange-500' : 'bg-destructive'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">
                    {safeWalkResult.overallLevel === 'SEGURA' && `✅ ${t('safeWalk.resultSafeTitle', { pet: mockUser.pet_name })}`}
                    {safeWalkResult.overallLevel === 'PRECAUCIÓN' && `⚠️ ${t('safeWalk.resultCautionTitle')}`}
                    {safeWalkResult.overallLevel === 'PELIGROSA' && `🔴 ${t('safeWalk.resultDangerousTitle')}`}
                  </p>
                  <p className="text-sm opacity-90 mt-0.5">
                    {safeWalkResult.overallLevel === 'SEGURA' && t('safeWalk.resultSafeDesc')}
                    {safeWalkResult.overallLevel === 'PRECAUCIÓN' && t('safeWalk.resultCautionDesc', { pet: mockUser.pet_name })}
                    {safeWalkResult.overallLevel === 'PELIGROSA' && t('safeWalk.resultDangerousDesc')}
                  </p>
                </div>
                <button onClick={() => { setSafeWalkResult(null); handleCancelSafeWalk(); }} className="text-white/80 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 bg-muted rounded-xl py-2 text-center">
                  <p className="text-xs text-muted-foreground">📏</p>
                  <p className="text-sm font-bold text-foreground">{safeWalkResult.totalDistance}km</p>
                </div>
                <div className="flex-1 bg-muted rounded-xl py-2 text-center">
                  <p className="text-xs text-muted-foreground">✅</p>
                  <p className="text-sm font-bold text-foreground">{safeWalkResult.safePercent}% {t('safeWalk.safe')}</p>
                </div>
                <div className="flex-1 bg-muted rounded-xl py-2 text-center">
                  <p className="text-xs text-muted-foreground">⚠️</p>
                  <p className="text-sm font-bold text-foreground">{safeWalkResult.riskyZones.length} {t('safeWalk.stretches')}</p>
                </div>
              </div>

              <div className="flex h-3 rounded-full overflow-hidden">
                {safeWalkResult.segments.map((seg: any, i: number) => (
                  <div key={i} className="h-full" style={{ backgroundColor: seg.color, flex: seg.distance }} />
                ))}
              </div>

              {safeWalkResult.riskyZones.length > 0 && (
                <div className="space-y-2">
                  {safeWalkResult.riskyZones.map((zone: any, i: number) => (
                    <div key={i} className={`border-l-4 rounded-lg p-3 bg-muted/50 ${zone.level === 'red' ? 'border-destructive' : 'border-orange-500'}`}>
                      <p className="text-sm font-semibold text-foreground">{t('safeWalk.stretch', { n: zone.segment })}: {zone.distance}m</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t('safeWalk.nestReported', { days: zone.daysAgo, count: zone.report.validation_count })}
                      </p>
                      <p className="text-xs text-muted-foreground">📍 {zone.report.comarca}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                <p className="text-sm text-foreground">
                  {safeWalkResult.riskyZones.length > 0
                    ? t('safeWalk.petWarning', { pet: mockUser.pet_name, n: safeWalkResult.riskyZones[0].segment })
                    : t('safeWalk.petSafe', { pet: mockUser.pet_name })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('safeWalk.petNote')}</p>
              </div>

              <div className="flex flex-col gap-2 pb-4">
                <Button variant="outline" onClick={() => { setSafeWalkResult(null); handleClearRoute(); }} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> {t('safeWalk.tryAnother')}
                </Button>
                <Button onClick={handleShareRoute} className="bg-[#25D366] hover:bg-[#25D366]/90 gap-2">
                  📱 {t('safeWalk.shareWhatsApp')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAFE WALK UPGRADE MODAL (FREE USERS) */}
      {showSafeWalkUpgrade && (
        <div className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-scale-in">
            <div className="relative bg-muted p-4">
              <div className="blur-[4px] pointer-events-none">
                <div className="bg-primary rounded-xl p-3 text-white text-sm mb-2">✅ Ruta segura para {mockUser.pet_name}</div>
                <div className="flex gap-2 mb-2">
                  <div className="flex-1 bg-card rounded-lg py-2 text-center text-xs">📏 2.1km</div>
                  <div className="flex-1 bg-card rounded-lg py-2 text-center text-xs">✅ 92%</div>
                  <div className="flex-1 bg-card rounded-lg py-2 text-center text-xs">⚠️ 1</div>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 flex-[8]" />
                  <div className="bg-orange-500 flex-1" />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-2xl">
                <p className="text-white font-semibold text-sm text-center px-4 drop-shadow">{t('safeWalk.unlockFull')}</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2 animate-bounce" style={{ animationDuration: '2s' }}>
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{t('safeWalk.upgradeTitle')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('safeWalk.upgradeDesc', { pet: mockUser.pet_name })}
                </p>
              </div>

              <div className="space-y-2">
                {['safeWalk.upgradeFeat1', 'safeWalk.upgradeFeat2', 'safeWalk.upgradeFeat3'].map(key => (
                  <div key={key} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="text-primary">✅</span>
                    <span>{t(key)}</span>
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground">{t('safeWalk.priceNote')}</p>

              <Button className="w-full gap-2" onClick={() => { setShowSafeWalkUpgrade(false); toast.success(t('safeWalk.upgradeMock')); }}>
                🛡️ {t('safeWalk.activateBtn')}
              </Button>
              <button onClick={() => setShowSafeWalkUpgrade(false)} className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition">
                {t('safeWalk.continueFree')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GEOLOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">📍</div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              {t('map.activateLocationTitle')}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t('map.activateLocationText', { pet: mockUser.pet_name })}
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={handleActivateLocation} className="w-full">
                {t('map.activateLocation')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setShowLocationModal(false); localStorage.setItem('location_asked', 'true'); }}
                className="w-full text-muted-foreground"
              >
                {t('map.notNow')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* NEW REPORT BOTTOM SHEET */}
      {showNewReport && (
        <div className="fixed inset-0 z-[2000]">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowNewReport(false); setReportStep(1); setSelectedCoords(null); setReportDescription(''); setReportPhotos([]); setSelectedAlertType(null); }} />
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[20px] shadow-2xl" style={{ height: '70vh' }}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-5 pb-5 h-full overflow-y-auto">
              <button onClick={() => { setShowNewReport(false); setReportStep(1); setSelectedCoords(null); setReportDescription(''); setReportPhotos([]); setSelectedAlertType(null); }} className="absolute top-4 right-4 text-muted-foreground">
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-4 mt-1">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`h-1 flex-1 rounded-full ${s <= reportStep ? 'bg-primary' : 'bg-muted'}`} />
                ))}
              </div>

              {/* Step 1: Alert Type */}
              {reportStep === 1 && (
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">⚠️ {t('alertTypes.selectType')}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {alertTypeKeys.map(key => {
                      const at = ALERT_TYPES[key];
                      const selected = selectedAlertType === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedAlertType(key)}
                          className="p-4 rounded-xl border-2 text-left transition-all"
                          style={{
                            borderColor: selected ? at.color : 'hsl(var(--border))',
                            backgroundColor: selected ? at.color_light : 'transparent',
                          }}
                        >
                          <span className="text-3xl block mb-2">{at.icon}</span>
                          <p className="text-sm font-semibold text-foreground">{lang === 'ca' ? at.name_ca : at.name_es}</p>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{lang === 'ca' ? at.description_ca : at.description_es}</p>
                        </button>
                      );
                    })}
                  </div>
                  <Button onClick={() => setReportStep(2)} disabled={!selectedAlertType} className="w-full mt-4 gap-1">
                    {t('map.next')} <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Step 2: Location */}
              {reportStep === 2 && (
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">📍 {t('map.step1')}</h3>
                  <Button onClick={handleGetLocationForReport} className="w-full mb-3 gap-2">
                    <MapPin className="h-4 w-4" />
                    {t('report.useLocation')}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground mb-3">
                    {t('map.orSelectMap')}
                  </p>
                  <Button variant="outline" className="w-full mb-4" onClick={() => { setMapClickMode(true); setShowNewReport(false); toast.info(t('map.tapMapToSelect')); }}>
                    🗺️ {t('map.selectOnMap')}
                  </Button>
                  {selectedCoords && (
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-700 dark:text-green-300 mb-4">
                      ✅ {t('map.locationCaptured')}: {selectedCoords[0].toFixed(2)}°, {selectedCoords[1].toFixed(2)}°
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setReportStep(1)} className="flex-1 gap-1">
                      <ChevronLeft className="h-4 w-4" /> {t('map.previous')}
                    </Button>
                    <Button onClick={() => setReportStep(3)} disabled={!selectedCoords} className="flex-1 gap-1">
                      {t('map.next')} <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Details */}
              {reportStep === 3 && (
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">📝 {t('map.step2')}</h3>
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
                      <span className="text-sm text-muted-foreground">📷 {t('report.addPhoto')} ({t('map.maxPhotos')})</span>
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
                    <Button variant="outline" onClick={() => setReportStep(2)} className="flex-1 gap-1">
                      <ChevronLeft className="h-4 w-4" /> {t('map.previous')}
                    </Button>
                    <Button onClick={() => setReportStep(4)} disabled={reportDescription.length < 10} className="flex-1 gap-1">
                      {t('map.next')} <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirm */}
              {reportStep === 4 && (
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">✅ {t('map.step3')}</h3>
                  <div className="bg-muted rounded-xl p-4 mb-4 space-y-2 text-sm text-foreground">
                    {selectedAlertType && (
                      <p>{ALERT_TYPES[selectedAlertType].icon} {lang === 'ca' ? ALERT_TYPES[selectedAlertType].name_ca : ALERT_TYPES[selectedAlertType].name_es}</p>
                    )}
                    <p>📍 {t('map.location')}: {selectedCoords?.[0].toFixed(4)}, {selectedCoords?.[1].toFixed(4)}</p>
                    <p>📝 {reportDescription.length > 100 ? reportDescription.slice(0, 100) + '...' : reportDescription}</p>
                    <p>📷 {reportPhotos.length} {t('map.photosAttached')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setReportStep(3)} className="flex-1 gap-1">
                      <ChevronLeft className="h-4 w-4" /> {t('map.previous')}
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
          📍 {t('map.tapMapToSelect')}
        </div>
      )}

      <UpgradeModal open={upgradeOpen} onClose={closeUpgrade} trigger={upgradeTrigger} />
    </div>
  );
};

export default MapPage;
