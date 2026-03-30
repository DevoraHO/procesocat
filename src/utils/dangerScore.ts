export function calculateDangerScore(report: any, allReports: any[]): number {
  const now = Date.now();
  const created = new Date(report.created_at).getTime();
  const hoursOld = (now - created) / 3600000;
  let recency = 0;
  if (hoursOld < 48) recency = 100;
  else if (hoursOld < 168) recency = 75;
  else if (hoursOld < 360) recency = 50;
  else if (hoursOld < 720) recency = 25;

  const v = report.validation_count || 0;
  const val = v === 0 ? 10 : v <= 2 ? 40 : v <= 5 ? 70 : 100;

  const month = new Date().getMonth() + 1;
  const seasonal = [3, 4].includes(month) ? 100 : [1, 2].includes(month) ? 60 :
    [5, 6].includes(month) ? 70 : [11, 12].includes(month) ? 40 :
    [9, 10].includes(month) ? 20 : 10;

  const nearby = allReports.filter(r => {
    const d = Math.sqrt(
      Math.pow((r.lat - report.lat) * 111000, 2) +
      Math.pow((r.lng - report.lng) * 111000 * Math.cos(report.lat * Math.PI / 180), 2)
    );
    return d < 500 && r.id !== report.id;
  }).length;
  const density = nearby === 0 ? 20 : nearby <= 2 ? 50 : nearby <= 5 ? 75 : 100;

  return Math.round(Math.min(100, (recency * 0.30) + (val * 0.25) + (density * 0.25) + (seasonal * 0.20)));
}

export function getDangerColor(score: number): string {
  if (score <= 20) return '#22c55e';
  if (score <= 40) return '#eab308';
  if (score <= 60) return '#f97316';
  if (score <= 80) return '#ef4444';
  return '#a855f7';
}

export function getDangerLevel(score: number): string {
  if (score <= 20) return 'green';
  if (score <= 40) return 'yellow';
  if (score <= 60) return 'orange';
  if (score <= 80) return 'red';
  return 'purple';
}
