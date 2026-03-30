import { useTranslation } from 'react-i18next';
import { mockWeeklyData, mockMunicipiData, ALERT_TYPES } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import DangerBadge from '@/components/DangerBadge';

const PDFPreview = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = i18n.language;
  const d = mockWeeklyData;
  const m = mockMunicipiData;

  const PageWrapper = ({ children, page, total }: { children: React.ReactNode; page: number; total: number }) => (
    <div className="bg-white text-gray-900 rounded-lg shadow-lg border mb-6 overflow-hidden" style={{ aspectRatio: '210/297', maxWidth: 600 }}>
      <div className="h-full flex flex-col p-6 text-sm">
        <div className="flex-1">{children}</div>
        <div className="flex items-center justify-between text-[10px] text-gray-400 border-t pt-2 mt-4">
          <span>🌲 ProcesoCat</span>
          <span>{page}/{total}</span>
          <span>procesocat.es</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-24 max-w-2xl mx-auto px-4 pt-6">
      <h1 className="text-xl font-bold text-foreground mb-2">{t('reports.preview')}</h1>
      <p className="text-sm text-muted-foreground mb-6">{lang === 'ca' ? 'Així es veurà el teu informe PDF' : 'Así se verá tu informe PDF'}</p>

      {/* FAMILIAR PDF — Page 1 Cover */}
      <h2 className="text-lg font-semibold text-foreground mb-3">{lang === 'ca' ? 'Informe Familiar' : 'Informe Familiar'}</h2>
      <PageWrapper page={1} total={4}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-green-800">🌲 ProcesoCat</span>
          <span className="text-lg font-bold text-gray-700">{lang === 'ca' ? 'INFORME SETMANAL' : 'INFORME SEMANAL'}</span>
        </div>
        <div className="h-0.5 bg-green-700 mb-6" />
        <div className="flex items-center gap-3 mb-6 bg-gray-50 rounded-lg p-4">
          <div className="w-12 h-12 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <p className="font-semibold">{user?.name || 'Pere Fité'}</p>
            <p className="text-xs text-gray-500">🐕 {user?.pet_name || 'Max'} — Pla Familiar</p>
            <p className="text-xs text-gray-500">{m.municipality}, {m.comarca}</p>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg px-4 py-2 text-center mb-6">
          <span className="text-sm font-medium text-green-800">{lang === 'ca' ? 'Setmana' : 'Semana'} {d.week}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🗺️', label: lang === 'ca' ? 'Zones monitoritzades' : 'Zonas monitorizadas', val: '3' },
            { icon: '⚠️', label: lang === 'ca' ? 'Alertes actives' : 'Alertas activas', val: '15' },
            { icon: '📊', label: lang === 'ca' ? 'Nivell de perill' : 'Nivel de peligro', val: 'ALT' },
            { icon: '✅', label: lang === 'ca' ? 'Alertes resoltes' : 'Alertas resueltas', val: '1' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-gray-50 rounded-lg p-3 text-center">
              <span className="text-lg">{kpi.icon}</span>
              <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
              <p className="font-bold text-gray-800">{kpi.val}</p>
            </div>
          ))}
        </div>
        <div className="mt-auto bg-green-700 text-white text-center py-2 rounded-lg text-[10px] mt-6">
          {lang === 'ca' ? 'Generat el' : 'Generado el'} 30/03/2026 · procesocat.es
        </div>
      </PageWrapper>

      {/* Page 2: Charts placeholder */}
      <PageWrapper page={2} total={4}>
        <h3 className="font-semibold mb-4">{lang === 'ca' ? 'Gràfiques setmanals' : 'Gráficas semanales'}</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-100 rounded-lg p-4 h-32 flex items-center justify-center text-xs text-gray-400">
            📈 {lang === 'ca' ? 'Activitat zones' : 'Actividad zonas'}
          </div>
          <div className="bg-gray-100 rounded-lg p-4 h-32 flex items-center justify-center text-xs text-gray-400">
            🍩 {lang === 'ca' ? 'Tipus d\'alerta' : 'Tipos de alerta'}
          </div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 h-32 flex items-center justify-center text-xs text-gray-400">
          📊 {lang === 'ca' ? 'Evolució mensual' : 'Evolución mensual'}
        </div>
      </PageWrapper>

      {/* Page 3: Alerts detail */}
      <PageWrapper page={3} total={4}>
        <h3 className="font-semibold mb-3">{lang === 'ca' ? "Alertes de la setmana" : 'Alertas de la semana'}</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">{lang === 'ca' ? 'Zona' : 'Zona'}</th>
              <th className="text-left p-2">{lang === 'ca' ? 'Tipus' : 'Tipo'}</th>
              <th className="text-left p-2">{lang === 'ca' ? 'Nivell' : 'Nivel'}</th>
              <th className="text-left p-2">{lang === 'ca' ? 'Estat' : 'Estado'}</th>
            </tr>
          </thead>
          <tbody>
            {d.weekAlerts.map((a, i) => (
              <tr key={a.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-2">{a.zone}</td>
                <td className="p-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: ALERT_TYPES[a.type as keyof typeof ALERT_TYPES]?.color_light, color: ALERT_TYPES[a.type as keyof typeof ALERT_TYPES]?.color }}>
                    {lang === 'ca' ? ALERT_TYPES[a.type as keyof typeof ALERT_TYPES]?.name_ca : ALERT_TYPES[a.type as keyof typeof ALERT_TYPES]?.name_es}
                  </span>
                </td>
                <td className="p-2 font-semibold">{a.level}</td>
                <td className="p-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${a.status === 'ACTIVE' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {a.status === 'ACTIVE' ? (lang === 'ca' ? 'ACTIVA' : 'ACTIVA') : (lang === 'ca' ? 'RESOLT' : 'RESUELTO')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PageWrapper>

      {/* Page 4: Recommendations */}
      <PageWrapper page={4} total={4}>
        <h3 className="font-semibold mb-4">{t('reports.recommendations')}</h3>
        <div className="space-y-3 mb-6">
          {d.recommendations.map((r, i) => (
            <div key={i} className="flex gap-2 bg-gray-50 rounded-lg p-3">
              <span className="text-lg">{r.icon}</span>
              <p className="text-xs text-gray-700">{lang === 'ca' ? r.text_ca : r.text_es}</p>
            </div>
          ))}
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-green-800 font-medium">
            🌡️ {lang === 'ca' ? 'Consell de març: Màxim risc de temporada. Vigila els pins al parc.' : 'Consejo de marzo: Máximo riesgo de temporada. Vigila los pinos en el parque.'}
          </p>
        </div>
        <div className="text-[10px] text-gray-400 space-y-1">
          <p>{lang === 'ca' ? 'Dades basades en reportes comunitaris validats' : 'Datos basados en reportes comunitarios validados'}</p>
          <p>{lang === 'ca' ? 'Font científica: CREAF · iNaturalist · Natusfera' : 'Fuente científica: CREAF · iNaturalist · Natusfera'}</p>
        </div>
      </PageWrapper>

      {/* MUNICIPI PDF — Page 1 Cover */}
      <h2 className="text-lg font-semibold text-foreground mb-3 mt-8">{lang === 'ca' ? 'Informe Municipal' : 'Informe Municipal'}</h2>
      <PageWrapper page={1} total={5}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-green-800">🌲 ProcesoCat</span>
          <span className="text-sm font-bold text-gray-500">🏛️ {lang === 'ca' ? 'Ajuntament' : 'Ayuntamiento'}</span>
        </div>
        <div className="h-0.5 bg-green-700 mb-6" />
        <h2 className="text-xl font-bold text-center mb-2">{lang === 'ca' ? 'INFORME OFICIAL DE PROCESSIONÀRIA' : 'INFORME OFICIAL DE PROCESIONARIA'}</h2>
        <p className="text-center text-lg font-semibold text-gray-700 mb-4">{m.municipality}</p>
        <p className="text-center text-xs text-gray-500 mb-6">Ref: {m.ref} · {m.week}</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: lang === 'ca' ? 'Total alertes' : 'Total alertas', val: m.totalAlerts },
            { label: lang === 'ca' ? 'Zones crítiques' : 'Zonas críticas', val: m.criticalZones },
            { label: lang === 'ca' ? 'Resoltes' : 'Resueltas', val: m.resolvedAlerts },
            { label: lang === 'ca' ? 'Perill mitjà' : 'Peligro medio', val: `${m.avgDangerScore}/100` },
          ].map(k => (
            <div key={k.label} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">{k.label}</p>
              <p className="font-bold text-lg">{k.val}</p>
            </div>
          ))}
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-xs text-gray-400 mb-4">
          {lang === 'ca' ? 'Segell oficial (en producció)' : 'Sello oficial (en producción)'}
        </div>
      </PageWrapper>

      {/* Municipi Page 2: Signature */}
      <PageWrapper page={5} total={5}>
        <h3 className="font-semibold mb-4">{lang === 'ca' ? "Dades exportables" : 'Datos exportables'}</h3>
        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center text-xs text-gray-400 mb-4">
          {lang === 'ca' ? 'Taula completa d\'alertes' : 'Tabla completa de alertas'}
        </div>
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-400">
            QR Code
          </div>
        </div>
        <p className="text-center text-[10px] text-gray-400 mb-8">{lang === 'ca' ? "Escaneja per accedir a les dades en temps real" : 'Escanea para acceder a los datos en tiempo real'}</p>
        <div className="border-t pt-4 text-center space-y-1 text-[10px] text-gray-500">
          <p className="font-medium">{lang === 'ca' ? 'Document generat per ProcesoCat' : 'Documento generado por ProcesoCat'}</p>
          <p>{lang === 'ca' ? 'Dades validades per la comunitat' : 'Datos validados por la comunidad'}</p>
          <p>CREAF · iNaturalist</p>
          <p>{m.ref} · {new Date().toLocaleDateString()}</p>
        </div>
      </PageWrapper>
    </div>
  );
};

export default PDFPreview;
