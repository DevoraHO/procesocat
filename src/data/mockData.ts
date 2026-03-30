export const mockUser = {
  id: '1',
  name: 'Pere Fité',
  email: 'pere@test.com',
  avatar_url: null as string | null,
  banner_color: '#2D6A4F',
  language: 'es',
  plan: 'familiar',
  points: 3450,
  weekly_points: 280,
  rank: 'Verificador',
  pet_name: 'Max',
  pet_type: 'dog',
  referral_code: 'PERE01',
  created_at: '2026-01-15'
};

export const mockReports = [
  { id:'r1', user_id:'1', lat:41.4036, lng:2.1744, description:'Nido grande en pino junto al camino principal del parque. Muy visible desde el sendero.', status:'ACTIVE', danger_score:85, validation_count:6, photos:[] as string[], comarca:'Barcelonès', created_at: new Date(Date.now()-2*24*60*60*1000).toISOString() },
  { id:'r2', user_id:'2', lat:41.5120, lng:2.0800, description:'Bolsa de procesionaria visible desde el sendero norte. Cerca del área de picnic.', status:'ACTIVE', danger_score:62, validation_count:3, photos:[] as string[], comarca:'Vallès Occidental', created_at: new Date(Date.now()-5*24*60*60*1000).toISOString() },
  { id:'r3', user_id:'3', lat:41.3850, lng:2.1650, description:'Nido pequeño en pino joven cerca del parque infantil. Peligro para niños.', status:'ACTIVE', danger_score:71, validation_count:4, photos:[] as string[], comarca:'Barcelonès', created_at: new Date(Date.now()-3*24*60*60*1000).toISOString() },
  { id:'r4', user_id:'4', lat:41.6500, lng:1.9000, description:'Múltiples nidos en zona de pinos. Zona frecuentada por senderistas.', status:'ACTIVE', danger_score:45, validation_count:2, photos:[] as string[], comarca:'Bages', created_at: new Date(Date.now()-8*24*60*60*1000).toISOString() },
  { id:'r5', user_id:'5', lat:41.7200, lng:2.4500, description:'Nido detectado en ruta de senderismo popular.', status:'DECAYING', danger_score:28, validation_count:1, photos:[] as string[], comarca:'Osona', created_at: new Date(Date.now()-12*24*60*60*1000).toISOString() },
  { id:'r6', user_id:'1', lat:41.4500, lng:2.2500, description:'Procesionaria cruzando el camino esta mañana. Cadena larga de orugas.', status:'ACTIVE', danger_score:92, validation_count:8, photos:[] as string[], comarca:'Barcelonès', created_at: new Date(Date.now()-1*24*60*60*1000).toISOString() },
  { id:'r7', user_id:'3', lat:41.9800, lng:2.8200, description:'Nido en pino centenario del parque natural.', status:'ACTIVE', danger_score:38, validation_count:1, photos:[] as string[], comarca:'Garrotxa', created_at: new Date(Date.now()-6*24*60*60*1000).toISOString() },
  { id:'r8', user_id:'2', lat:41.2800, lng:1.9800, description:'Varios nidos en zona residencial con muchos niños.', status:'ACTIVE', danger_score:78, validation_count:5, photos:[] as string[], comarca:'Baix Llobregat', created_at: new Date(Date.now()-4*24*60*60*1000).toISOString() }
];

export const mockNotifications = [
  { id:'n1', type:'DANGER_NEARBY', title_es:'⚠️ Peligro detectado cerca de ti', title_ca:'⚠️ Perill detectat a prop teu', body_es:'Procesionaria a 350m de tu zona guardada "Parque cerca de casa"', body_ca:'Processionària a 350m de la teva zona guardada "Parc a prop de casa"', read:false, created_at: new Date(Date.now()-30*60*1000).toISOString() },
  { id:'n2', type:'REPORT_CONFIRMED', title_es:'✅ Tu reporte ha sido confirmado', title_ca:'✅ El teu report ha estat confirmat', body_es:'6 usuarios han confirmado tu avistamiento en Barcelonès', body_ca:'6 usuaris han confirmat el teu avistament al Barcelonès', read:false, created_at: new Date(Date.now()-2*60*60*1000).toISOString() },
  { id:'n3', type:'BADGE_EARNED', title_es:'🏅 Nueva medalla: Verificador', title_ca:'🏅 Nova medalla: Verificador', body_es:'+200 puntos bonus conseguidos', body_ca:'+200 punts bonus aconseguits', read:true, created_at: new Date(Date.now()-24*60*60*1000).toISOString() },
  { id:'n4', type:'DECAY_REMINDER', title_es:'❓ ¿Sigue activo el nido?', title_ca:'❓ Continua actiu el niu?', body_es:'Han pasado 10 días desde tu reporte en Osona. ¿Lo ves todavía?', body_ca:'Han passat 10 dies des del teu report a Osona. Encara el veus?', read:true, created_at: new Date(Date.now()-48*60*60*1000).toISOString() },
  { id:'n5', type:'WEEKLY_RANKING', title_es:'📊 Ranking semanal actualizado', title_ca:'📊 Rànquing setmanal actualitzat', body_es:'Tu posición esta semana: #3 en Barcelonès', body_ca:'La teva posició aquesta setmana: #3 al Barcelonès', read:true, created_at: new Date(Date.now()-72*60*60*1000).toISOString() }
];

export const mockRanking = [
  { id:'u1', name:'Maria Garcia', rank:'Guardián', points:8450, weekly_points:520, avatar_url:null as string | null, comarca:'Barcelonès' },
  { id:'u2', name:'Joan Puig', rank:'Protector', points:6200, weekly_points:410, avatar_url:null as string | null, comarca:'Barcelonès' },
  { id:'u3', name:'Pere Fité', rank:'Verificador', points:3450, weekly_points:280, avatar_url:null as string | null, comarca:'Barcelonès' },
  { id:'u4', name:'Anna Mas', rank:'Verificador', points:3100, weekly_points:250, avatar_url:null as string | null, comarca:'Barcelonès' },
  { id:'u5', name:'Lluís Serra', rank:'Reportador', points:2800, weekly_points:190, avatar_url:null as string | null, comarca:'Barcelonès' },
  { id:'u6', name:'Marta Vila', rank:'Reportador', points:2200, weekly_points:160, avatar_url:null as string | null, comarca:'Barcelonès' },
  { id:'u7', name:'Carles Vidal', rank:'Explorador', points:1500, weekly_points:120, avatar_url:null as string | null, comarca:'Barcelonès' },
  { id:'u8', name:'Rosa Ferrer', rank:'Explorador', points:1200, weekly_points:95, avatar_url:null as string | null, comarca:'Barcelonès' }
];

export const mockBadges = [
  { id:'primer_pas', name_es:'Primer Paso', name_ca:'Primer Pas', icon:'🌱', category:'explorer', earned:true, earned_at:'2026-01-16', points_bonus:100, requirement_es:'Publica tu primer reporte', requirement_ca:'Publica el teu primer report' },
  { id:'cartograf', name_es:'Cartógrafo', name_ca:'Cartògraf', icon:'📍', category:'explorer', earned:true, earned_at:'2026-01-20', points_bonus:200, requirement_es:'Reporta en 5 zonas diferentes', requirement_ca:'Reporta en 5 zones diferents' },
  { id:'explorador_cat', name_es:'Explorador de Cataluña', name_ca:'Explorador de Catalunya', icon:'🗺️', category:'explorer', earned:false, points_bonus:500, requirement_es:'Reporta en 5 comarcas diferentes', requirement_ca:'Reporta en 5 comarques diferents', progress:2, total:5 },
  { id:'primer_ull', name_es:'Primer Ojo', name_ca:'Primer Ull', icon:'👁️', category:'validator', earned:true, earned_at:'2026-01-17', points_bonus:50, requirement_es:'Valida tu primer reporte', requirement_ca:'Valida el teu primer report' },
  { id:'verificador', name_es:'Verificador', name_ca:'Verificador', icon:'🤝', category:'validator', earned:true, earned_at:'2026-02-01', points_bonus:200, requirement_es:'Realiza 10 validaciones', requirement_ca:'Realitza 10 validacions' },
  { id:'pilar_comunitat', name_es:'Pilar Comunidad', name_ca:'Pilar Comunitat', icon:'💪', category:'validator', earned:false, points_bonus:500, requirement_es:'Realiza 50 validaciones', requirement_ca:'Realitza 50 validacions', progress:23, total:50 },
  { id:'primer_flash', name_es:'Primer Flash', name_ca:'Primer Flash', icon:'📸', category:'media', earned:true, earned_at:'2026-01-18', points_bonus:50, requirement_es:'Sube tu primera foto', requirement_ca:'Puja la teva primera foto' },
  { id:'consistent', name_es:'Constante', name_ca:'Consistent', icon:'🔥', category:'streak', earned:false, points_bonus:200, requirement_es:'7 días seguidos activo', requirement_ca:'7 dies seguits actiu', progress:4, total:7 },
  { id:'fundador', name_es:'Fundador', name_ca:'Fundador', icon:'⭐', category:'special', earned:true, earned_at:'2026-01-15', points_bonus:1000, requirement_es:'Únete en los primeros 3 meses', requirement_ca:'Uneix-te als primers 3 mesos' },
  { id:'amic_animals', name_es:'Amigo Animales', name_ca:'Amic dels Animals', icon:'🐕', category:'hero', earned:false, points_bonus:500, requirement_es:'20 reportes cerca de zonas de mascotas', requirement_ca:'20 reports prop de zones de mascotes', progress:8, total:20 },
  { id:'llegenda', name_es:'Leyenda de Cataluña', name_ca:'Llegenda de Catalunya', icon:'👑', category:'special', earned:false, points_bonus:0, requirement_es:'Alcanza 100.000 puntos', requirement_ca:'Assoleix 100.000 punts', progress:3450, total:100000 }
];

export const mockSavedZones = [
  { id:'z1', name:'Parque cerca de casa', lat:41.4036, lng:2.1744, radius_km:2, alert_threshold:40, current_danger_score:85 },
  { id:'z2', name:'Ruta del perro', lat:41.3900, lng:2.1600, radius_km:1, alert_threshold:60, current_danger_score:30 },
  { id:'z3', name:'Colegio niños', lat:41.4100, lng:2.1800, radius_km:0.5, alert_threshold:20, current_danger_score:12 }
];

export const mockStats = {
  totalReports: 8,
  totalValidations: 23,
  totalPhotos: 5,
  totalComments: 0
};
