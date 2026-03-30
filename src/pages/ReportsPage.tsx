import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WeeklyCharts from '@/components/WeeklyCharts';
import { usePlanFeature } from '@/hooks/usePlanFeature';
import { FileText, Eye } from 'lucide-react';

const ReportsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { canAccess } = usePlanFeature();
  const lang = i18n.language;

  return (
    <div className="pb-24 max-w-2xl mx-auto px-4 pt-6">
      <h1 className="text-xl font-bold text-foreground mb-1">📊 {t('reports.title')}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {lang === 'ca' ? 'Informes setmanals amb gràfiques i descàrrega PDF' : 'Informes semanales con gráficas y descarga PDF'}
      </p>

      <WeeklyCharts />

      {canAccess('charts') && (
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate('/pdf-preview')}>
            <Eye size={14} className="mr-1" /> {t('reports.preview')}
          </Button>
          {canAccess('municipi_dashboard') && (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate('/municipi')}>
              🏛️ {t('reports.municipiDashboard')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
