import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { mockReports, mockUsers, mockZoneAlerts } from '@/data/mockData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import UserAvatar from '@/components/UserAvatar';
import DangerBadge from '@/components/DangerBadge';
import { Shield, Users, MapPin, CreditCard, TrendingUp, MoreHorizontal, Copy } from 'lucide-react';

const AdminPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const lang = i18n.language;

  // Reports state
  const [reports, setReports] = useState(mockReports);
  const [statusFilter, setStatusFilter] = useState('all');
  const [comarcaFilter, setComarcaFilter] = useState('all');
  const [dangerFilter, setDangerFilter] = useState('all');
  const [reportPage, setReportPage] = useState(0);
  const [noteModal, setNoteModal] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Users state
  const [users, setUsers] = useState(mockUsers);
  const [userSearch, setUserSearch] = useState('');
  const [warningModal, setWarningModal] = useState<string | null>(null);
  const [warningText, setWarningText] = useState('');

  // Alerts state
  const [alerts, setAlerts] = useState(mockZoneAlerts);
  const [emailModal, setEmailModal] = useState<typeof mockZoneAlerts[0] | null>(null);

  // Filtered reports
  const filteredReports = useMemo(() => {
    let r = reports;
    if (statusFilter !== 'all') r = r.filter(x => x.status === statusFilter);
    if (comarcaFilter !== 'all') r = r.filter(x => x.comarca === comarcaFilter);
    if (dangerFilter !== 'all') {
      const ranges: Record<string, [number, number]> = { green: [0, 20], yellow: [21, 40], orange: [41, 60], red: [61, 80], purple: [81, 100] };
      const [min, max] = ranges[dangerFilter] || [0, 100];
      r = r.filter(x => x.danger_score >= min && x.danger_score <= max);
    }
    return r;
  }, [reports, statusFilter, comarcaFilter, dangerFilter]);

  const pageSize = 10;
  const pagedReports = filteredReports.slice(reportPage * pageSize, (reportPage + 1) * pageSize);
  const totalPages = Math.ceil(filteredReports.length / pageSize);

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const q = userSearch.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, userSearch]);

  const comarcas = [...new Set(reports.map(r => r.comarca))];

  const daysAgo = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    return diff === 0 ? (lang === 'ca' ? 'avui' : 'hoy') : `${diff} ${lang === 'ca' ? 'dies' : 'días'}`;
  };

  const planBadge = (plan: string) => {
    const styles: Record<string, string> = {
      free: 'bg-muted text-muted-foreground',
      familiar: 'bg-primary/10 text-primary',
      municipi: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    };
    const labels: Record<string, string> = { free: lang === 'ca' ? 'Gratuït' : 'Gratuito', familiar: 'Familiar', municipi: 'Municipi' };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[plan] || styles.free}`}>{labels[plan] || plan}</span>;
  };

  const roleBadge = (role: string) => {
    if (role === 'admin') return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Admin</span>;
    if (role === 'municipi') return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Municipi</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">{lang === 'ca' ? 'Usuari' : 'Usuario'}</span>;
  };

  const COMARQUES_COVERAGE = [
    { name: 'Barcelonès', reports: 32, pct: 80 },
    { name: 'Vallès Occidental', reports: 18, pct: 60 },
    { name: 'Baix Llobregat', reports: 12, pct: 40 },
    { name: 'Maresme', reports: 8, pct: 30 },
    { name: 'Osona', reports: 5, pct: 20 },
    { name: 'Garrotxa', reports: 3, pct: 10 },
    { name: lang === 'ca' ? 'Altres' : 'Otras', reports: 11, pct: 0 },
  ];

  const emailBody = emailModal
    ? (lang === 'ca'
      ? `S'ha detectat activitat crítica de processionària a ${emailModal.zone_name}, ${emailModal.comarca}. Nivell de perill: ${emailModal.max_danger}. Nombre de reports confirmats: ${emailModal.report_count}. Coordenades: ${emailModal.lat}, ${emailModal.lng}.`
      : `Se ha detectado actividad crítica de procesionaria en ${emailModal.zone_name}, ${emailModal.comarca}. Nivel de peligro: ${emailModal.max_danger}. Número de reportes confirmados: ${emailModal.report_count}. Coordenadas: ${emailModal.lat}, ${emailModal.lng}.`)
    : '';

  return (
    <div className="pb-24 max-w-4xl mx-auto px-4">
      <div className="flex items-center gap-2 py-6">
        <Shield className="text-primary" size={24} />
        <h1 className="text-xl font-bold text-foreground">{lang === 'ca' ? "Panell d'Administració" : 'Panel de Administración'}</h1>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="summary">{lang === 'ca' ? 'Resum' : 'Resumen'}</TabsTrigger>
          <TabsTrigger value="reports">{lang === 'ca' ? 'Reports' : 'Reportes'}</TabsTrigger>
          <TabsTrigger value="users">{lang === 'ca' ? 'Usuaris' : 'Usuarios'}</TabsTrigger>
          <TabsTrigger value="alerts">{lang === 'ca' ? 'Alertes' : 'Alertas'}</TabsTrigger>
        </TabsList>

        {/* TAB 1: RESUMEN */}
        <TabsContent value="summary" className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Users size={20} />, num: '1.247', sub: lang === 'ca' ? '+23 aquesta setmana' : '+23 esta semana', color: 'text-primary' },
              { icon: <MapPin size={20} />, num: '89', sub: lang === 'ca' ? '8 en perill crític' : '8 en peligro crítico', color: 'text-destructive' },
              { icon: <CreditCard size={20} />, num: '34', sub: 'Familiar: 28 · Municipi: 6', color: 'text-foreground' },
              { icon: <TrendingUp size={20} />, num: '€1.334', sub: '28×4.99 + 1×199 + 5×(avg 199)', color: 'text-primary' },
            ].map((m, i) => (
              <Card key={i}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">{m.icon}</div>
                  <p className={`text-2xl font-bold ${m.color}`}>{m.num}</p>
                  <p className="text-xs text-muted-foreground">{m.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comarques coverage */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-foreground mb-4">{lang === 'ca' ? 'Cobertura per comarca' : 'Cobertura por comarca'}</h3>
              <div className="space-y-3">
                {COMARQUES_COVERAGE.filter(c => c.pct > 0).map(c => (
                  <div key={c.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">{c.name}</span>
                      <span className="text-muted-foreground">{c.reports} {lang === 'ca' ? 'reports' : 'reportes'}</span>
                    </div>
                    <Progress value={c.pct} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Plan distribution */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-foreground mb-4">{lang === 'ca' ? 'Distribució de plans' : 'Distribución de planes'}</h3>
              <div className="space-y-2">
                {[
                  { label: 'Free', count: 1213, pct: 97.3, color: 'bg-muted-foreground' },
                  { label: 'Familiar', count: 28, pct: 2.2, color: 'bg-primary' },
                  { label: 'Municipi', count: 6, pct: 0.5, color: 'bg-blue-500' },
                ].map(p => (
                  <div key={p.label} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${p.color}`} />
                    <span className="text-sm text-foreground flex-1">{p.label}</span>
                    <span className="text-sm text-muted-foreground">{p.count} ({p.pct}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: REPORTES */}
        <TabsContent value="reports" className="mt-4 space-y-4">
          <h3 className="font-semibold text-foreground">{lang === 'ca' ? 'Gestió de Reports' : 'Gestión de Reportes'}</h3>
          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === 'ca' ? 'Tots' : 'Todos'}</SelectItem>
                <SelectItem value="ACTIVE">{lang === 'ca' ? 'Actiu' : 'Activo'}</SelectItem>
                <SelectItem value="DECAYING">{lang === 'ca' ? 'Decaient' : 'Decayendo'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={comarcaFilter} onValueChange={setComarcaFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === 'ca' ? 'Totes' : 'Todas'}</SelectItem>
                {comarcas.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={dangerFilter} onValueChange={setDangerFilter}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === 'ca' ? 'Tots' : 'Todos'}</SelectItem>
                {['green', 'yellow', 'orange', 'red', 'purple'].map(l => (
                  <SelectItem key={l} value={l}>{t(`danger.${l}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{lang === 'ca' ? 'Descripció' : 'Descripción'}</TableHead>
                  <TableHead>Comarca</TableHead>
                  <TableHead>{lang === 'ca' ? 'Estat' : 'Estado'}</TableHead>
                  <TableHead>{lang === 'ca' ? 'Perill' : 'Peligro'}</TableHead>
                  <TableHead>Val.</TableHead>
                  <TableHead>{lang === 'ca' ? 'Data' : 'Fecha'}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedReports.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs text-muted-foreground">{r.id}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{r.description.slice(0, 40)}...</TableCell>
                    <TableCell><span className="text-xs bg-muted px-2 py-0.5 rounded-full">{r.comarca}</span></TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                        {r.status === 'ACTIVE' ? (lang === 'ca' ? 'Actiu' : 'Activo') : (lang === 'ca' ? 'Decaient' : 'Decayendo')}
                      </span>
                    </TableCell>
                    <TableCell><DangerBadge score={r.danger_score} size="sm" /></TableCell>
                    <TableCell>{r.validation_count}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{daysAgo(r.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => navigate('/map')}>{lang === 'ca' ? 'Veure al mapa' : 'Ver en mapa'}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setReports(prev => prev.map(x => x.id === r.id ? { ...x, status: 'ACTIVE' } : x)); toast({ title: lang === 'ca' ? 'Forçat actiu' : 'Forzado activo' }); }}>
                            {lang === 'ca' ? 'Forçar actiu' : 'Forzar activo'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setReports(prev => prev.map(x => x.id === r.id ? { ...x, status: 'RESOLVED' as any } : x)); toast({ title: lang === 'ca' ? 'Marcat resolt' : 'Marcado resuelto' }); }}>
                            {lang === 'ca' ? 'Marcar resolt' : 'Marcar resuelto'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setNoteModal(r.id)}>{lang === 'ca' ? 'Afegir nota oficial' : 'Añadir nota oficial'}</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => { setReports(prev => prev.filter(x => x.id !== r.id)); toast({ title: lang === 'ca' ? 'Eliminat' : 'Eliminado' }); }}>
                            {lang === 'ca' ? 'Eliminar' : 'Eliminar'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{lang === 'ca' ? `Mostrant ${reportPage * pageSize + 1}-${Math.min((reportPage + 1) * pageSize, filteredReports.length)} de ${filteredReports.length} reports` : `Mostrando ${reportPage * pageSize + 1}-${Math.min((reportPage + 1) * pageSize, filteredReports.length)} de ${filteredReports.length} reportes`}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={reportPage === 0} onClick={() => setReportPage(p => p - 1)}>← {lang === 'ca' ? 'Anterior' : 'Anterior'}</Button>
              <Button variant="outline" size="sm" disabled={reportPage >= totalPages - 1} onClick={() => setReportPage(p => p + 1)}>{lang === 'ca' ? 'Següent' : 'Siguiente'} →</Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: USUARIOS */}
        <TabsContent value="users" className="mt-4 space-y-4">
          <h3 className="font-semibold text-foreground">{lang === 'ca' ? 'Gestió d\'Usuaris' : 'Gestión de Usuarios'}</h3>
          <Input placeholder={lang === 'ca' ? 'Cercar per nom o email...' : 'Buscar por nombre o email...'} value={userSearch} onChange={e => setUserSearch(e.target.value)} />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{lang === 'ca' ? 'Nom' : 'Nombre'}</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>{lang === 'ca' ? 'Pla' : 'Plan'}</TableHead>
                  <TableHead>{lang === 'ca' ? 'Punts' : 'Puntos'}</TableHead>
                  <TableHead>{lang === 'ca' ? 'Reports' : 'Reportes'}</TableHead>
                  <TableHead>{lang === 'ca' ? 'Registre' : 'Registro'}</TableHead>
                  <TableHead>{lang === 'ca' ? 'Rol' : 'Rol'}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(u => (
                  <TableRow key={u.id} className={u.status === 'suspended' ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserAvatar name={u.name} avatar_url={null} size="sm" />
                        <span className="text-sm font-medium text-foreground">{u.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>{planBadge(u.plan)}</TableCell>
                    <TableCell className="text-sm">{u.points.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{u.reports}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{roleBadge(u.role)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => toast({ title: lang === 'ca' ? 'En producció obre perfil complet' : 'En producción abre perfil completo' })}>
                            {lang === 'ca' ? 'Veure perfil' : 'Ver perfil'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setUsers(prev => prev.map(x => x.id === u.id ? { ...x, plan: 'familiar' } : x))}>
                            {lang === 'ca' ? 'Canviar a Familiar' : 'Cambiar a Familiar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setUsers(prev => prev.map(x => x.id === u.id ? { ...x, plan: 'free' } : x))}>
                            {lang === 'ca' ? 'Canviar a Free' : 'Cambiar a Free'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: 'admin' } : x))}>
                            {lang === 'ca' ? 'Donar rol Admin' : 'Dar rol Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setWarningModal(u.id)}>
                            {lang === 'ca' ? 'Enviar advertència' : 'Enviar advertencia'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: 'suspended' } : x))}>
                            {lang === 'ca' ? 'Suspendre compte' : 'Suspender cuenta'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB 4: ALERTAS */}
        <TabsContent value="alerts" className="mt-4 space-y-4">
          <div>
            <h3 className="font-semibold text-foreground">{lang === 'ca' ? 'Zones d\'Alerta Crítica' : 'Zonas de Alerta Crítica'}</h3>
            <p className="text-sm text-muted-foreground">{lang === 'ca' ? 'Zones que han assolit nivell Vermell o Morat' : 'Zonas que han alcanzado nivel Rojo o Morado'}</p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{lang === 'ca' ? 'Zona' : 'Zona'}</TableHead>
                  <TableHead>Comarca</TableHead>
                  <TableHead>{lang === 'ca' ? 'Nivell màx' : 'Nivel máx'}</TableHead>
                  <TableHead>{lang === 'ca' ? 'Reports' : 'Reportes'}</TableHead>
                  <TableHead>{lang === 'ca' ? 'Data' : 'Fecha'}</TableHead>
                  <TableHead>{lang === 'ca' ? 'Estat' : 'Estado'}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-foreground">{a.zone_name}</TableCell>
                    <TableCell><span className="text-xs bg-muted px-2 py-0.5 rounded-full">{a.comarca}</span></TableCell>
                    <TableCell><DangerBadge score={a.max_danger} size="sm" /></TableCell>
                    <TableCell>{a.report_count}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{daysAgo(a.created_at)}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.is_active ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-muted text-muted-foreground'}`}>
                        {a.is_active ? (lang === 'ca' ? 'Activa' : 'Activa') : (lang === 'ca' ? 'Resolta' : 'Resuelta')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => navigate('/map')}>{lang === 'ca' ? 'Veure al mapa' : 'Ver en mapa'}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast({ title: lang === 'ca' ? 'En producció genera PDF oficial' : 'En producción genera PDF oficial' })}>
                            {lang === 'ca' ? 'Generar informe PDF' : 'Generar informe PDF'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEmailModal(a)}>
                            {lang === 'ca' ? 'Enviar a autoritats' : 'Enviar a autoridades'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setAlerts(prev => prev.map(x => x.id === a.id ? { ...x, is_active: false } : x))}>
                            {lang === 'ca' ? 'Marcar resolta' : 'Marcar resuelta'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Note modal */}
      <Dialog open={!!noteModal} onOpenChange={() => setNoteModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{lang === 'ca' ? 'Nota oficial' : 'Nota oficial'}</DialogTitle>
            <DialogDescription>{lang === 'ca' ? 'Afegeix una nota al report' : 'Añade una nota al reporte'}</DialogDescription>
          </DialogHeader>
          <Input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder={lang === 'ca' ? 'Escriu la nota...' : 'Escribe la nota...'} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteModal(null)}>{lang === 'ca' ? 'Cancel·lar' : 'Cancelar'}</Button>
            <Button onClick={() => { setNoteModal(null); setNoteText(''); toast({ title: lang === 'ca' ? 'Nota afegida' : 'Nota añadida' }); }}>
              {lang === 'ca' ? 'Guardar' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning modal */}
      <Dialog open={!!warningModal} onOpenChange={() => setWarningModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{lang === 'ca' ? 'Enviar advertència' : 'Enviar advertencia'}</DialogTitle>
            <DialogDescription>{lang === 'ca' ? 'Escriu el missatge d\'advertència' : 'Escribe el mensaje de advertencia'}</DialogDescription>
          </DialogHeader>
          <Input value={warningText} onChange={e => setWarningText(e.target.value)} placeholder={lang === 'ca' ? 'Motiu...' : 'Motivo...'} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarningModal(null)}>{lang === 'ca' ? 'Cancel·lar' : 'Cancelar'}</Button>
            <Button onClick={() => { setWarningModal(null); setWarningText(''); toast({ title: lang === 'ca' ? 'Advertència enviada' : 'Advertencia enviada' }); }}>
              {lang === 'ca' ? 'Enviar' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email modal */}
      <Dialog open={!!emailModal} onOpenChange={() => setEmailModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{lang === 'ca' ? 'Enviar a autoritats' : 'Enviar a autoridades'}</DialogTitle>
            <DialogDescription>guardia.forestal@gencat.cat</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">{lang === 'ca' ? 'Assumpte' : 'Asunto'}: {lang === 'ca' ? 'Alerta processionària' : 'Alerta procesionaria'} — {emailModal?.comarca} — {emailModal && new Date(emailModal.created_at).toLocaleDateString()}</p>
            <div className="bg-muted p-3 rounded-lg text-foreground text-sm">{emailBody}</div>
            <p className="text-xs text-muted-foreground">{lang === 'ca' ? 'En producció enviarà email automàticament' : 'En producción enviará email automáticamente'}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(emailBody); toast({ title: lang === 'ca' ? 'Text copiat!' : '¡Texto copiado!' }); }}>
              <Copy size={14} /> {lang === 'ca' ? 'Copiar text' : 'Copiar texto'}
            </Button>
            <Button variant="outline" onClick={() => setEmailModal(null)}>{lang === 'ca' ? 'Tancar' : 'Cerrar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
