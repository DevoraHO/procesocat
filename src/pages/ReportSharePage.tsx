import { useParams } from 'react-router-dom';
import { mockReports } from '@/data/mockData';
import DangerBadge from '@/components/DangerBadge';

const ReportSharePage = () => {
  const { id } = useParams();
  const report = mockReports.find(r => r.id === id);

  if (!report) return <div className="p-6 text-center text-muted-foreground">Report not found</div>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold" style={{ color: '#2D6A4F' }}>🐛 ProcesoAlert</h1>
      <DangerBadge score={report.danger_score} />
      <p>{report.description}</p>
      <p className="text-sm text-muted-foreground">{report.comarca}</p>
    </div>
  );
};

export default ReportSharePage;
